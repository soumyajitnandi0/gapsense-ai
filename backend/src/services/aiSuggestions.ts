import { gemini, geminiModel } from '../config/gemini';
import { groq, groqModel } from '../config/groq';

interface RepoAnalysis {
  languages: Record<string, number>;
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  topTopics: string[];
  repoTypes: {
    original: number;
    forked: number;
    archived: number;
  };
  activity: {
    recentlyActive: number;
    stale: number;
  };
  complexity: {
    large: number;
    medium: number;
    small: number;
  };
}

interface TargetRole {
  title: string;
  requiredSkills?: Array<{ name: string }>;
}

interface Suggestion {
  category: 'improvement' | 'portfolio' | 'learning' | 'contribution';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

function generateFallbackSuggestions(analysis: RepoAnalysis, targetRole?: TargetRole | null): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const userLanguages = Object.keys(analysis.languages);
  const roleTitle = targetRole?.title || '';
  const roleSkills = targetRole?.requiredSkills?.map(s => s.name.toLowerCase()) || [];
  
  // Missing role skills
  if (roleTitle && roleSkills.length > 0) {
    const userTechStack = userLanguages.map(l => l.toLowerCase());
    const missingSkills = roleSkills.filter(skill => 
      !userTechStack.some(tech => tech.includes(skill) || skill.includes(tech))
    );
    
    if (missingSkills.length > 0) {
      suggestions.push({
        category: 'learning',
        title: `Learn ${missingSkills.slice(0, 3).join(', ')} for ${roleTitle}`,
        description: `Your target role requires: ${roleSkills.slice(0, 5).join(', ')}. You haven't demonstrated ${missingSkills.slice(0, 3).join(', ')} in your repositories yet.`,
        priority: 'high',
        action: `Build a project using ${missingSkills[0]} to strengthen your profile for ${roleTitle} roles.`,
      });
    }
  }

  // Portfolio size
  if (analysis.totalRepos < 5) {
    suggestions.push({
      category: 'portfolio',
      title: roleTitle ? `Build Projects for ${roleTitle}` : 'Build More Projects',
      description: roleTitle 
        ? `You have fewer than 5 repositories. For ${roleTitle} roles, aim to showcase projects using relevant technologies.`
        : 'You have fewer than 5 repositories. Consider building more projects to showcase your skills.',
      priority: 'high',
      action: roleTitle 
        ? `Create 2-3 projects demonstrating ${roleTitle} skills.`
        : 'Create 2-3 new projects that demonstrate different skills or technologies.',
    });
  }

  // Stale repos
  if (analysis.activity.stale > analysis.activity.recentlyActive) {
    suggestions.push({
      category: 'improvement',
      title: 'Update Stale Repositories',
      description: `You have ${analysis.activity.stale} repositories that haven't been updated in 6+ months.`,
      priority: 'medium',
      action: 'Update READMEs, fix dependencies, or add new features to show active maintenance.',
    });
  }

  // Documentation
  if (analysis.totalStars < 10) {
    suggestions.push({
      category: 'improvement',
      title: 'Improve Project Documentation',
      description: 'Your projects have low visibility. Better documentation can attract more users.',
      priority: 'medium',
      action: 'Add comprehensive READMEs, screenshots, and setup instructions to your top projects.',
    });
  }

  // Complexity balance
  if (analysis.complexity.small > analysis.complexity.medium + analysis.complexity.large) {
    suggestions.push({
      category: 'portfolio',
      title: roleTitle ? `Build Production-Ready ${roleTitle} Projects` : 'Build Larger Projects',
      description: `${Math.round((analysis.complexity.small / analysis.totalRepos) * 100)}% of your projects are small. ${roleTitle ? `${roleTitle} roles` : 'Hiring managers'} value seeing complex, production-ready applications.`,
      priority: 'medium',
      action: roleTitle 
        ? `Create a full-stack ${roleTitle} application with authentication, database, and deployment.`
        : 'Create a full-stack application with multiple features, authentication, and database integration.',
    });
  }

  // High performer suggestions
  if (analysis.totalStars >= 50 && analysis.repoTypes.original >= 5) {
    suggestions.push({
      category: 'improvement',
      title: 'Maintain Your Success',
      description: roleTitle 
        ? `Excellent portfolio for ${roleTitle}! Keep your projects updated and consider mentoring others.`
        : 'You have a strong portfolio! Keep your popular projects updated and engage with your community.',
      priority: 'low',
      action: 'Respond to issues, review PRs, and continue building your personal brand.',
    });
  }

  // Contribution suggestions
  if (analysis.totalStars < 50) {
    suggestions.push({
      category: 'contribution',
      title: 'Contribute to Open Source',
      description: 'Contributing to popular open-source projects can boost your visibility and skills.',
      priority: 'low',
      action: roleTitle 
        ? `Find ${roleTitle}-related open source projects and contribute.`
        : 'Find projects in your tech stack and start with small issues or documentation improvements.',
    });
  }

  return suggestions;
}

export async function generateAISuggestions(
  analysis: RepoAnalysis, 
  targetRole?: TargetRole | null,
  userName?: string
): Promise<Suggestion[]> {
  const hasGemini = !!process.env.GEMINI_API_KEY && gemini && geminiModel;
  const hasGroq = !!process.env.GROQ_API_KEY && groq;

  const prompt = `As an expert career advisor and technical mentor, analyze this GitHub portfolio and provide personalized, actionable suggestions.

${userName ? `User: ${userName}` : ''}

GITHUB PORTFOLIO ANALYSIS:
- Total Repositories: ${analysis.totalRepos}
- Total Stars: ${analysis.totalStars}
- Languages: ${Object.entries(analysis.languages).map(([lang, count]) => `${lang}(${count})`).join(', ')}
- Top Topics: ${analysis.topTopics.slice(0, 5).join(', ') || 'None'}
- Repository Types: ${analysis.repoTypes.original} original, ${analysis.repoTypes.forked} forked, ${analysis.repoTypes.archived} archived
- Activity: ${analysis.activity.recentlyActive} recently active, ${analysis.activity.stale} stale (6+ months old)
- Project Sizes: ${analysis.complexity.large} large, ${analysis.complexity.medium} medium, ${analysis.complexity.small} small

${targetRole ? `TARGET ROLE: ${targetRole.title}
REQUIRED SKILLS: ${targetRole.requiredSkills?.map(s => s.name).join(', ') || 'Not specified'}
` : 'NO TARGET ROLE SET - Provide general software engineering career advice'}

Generate 3-5 personalized, creative, and specific suggestions. Each suggestion should have:
- Category: improvement, portfolio, learning, or contribution
- Priority: high, medium, or low
- A compelling title (specific and actionable)
- A detailed description explaining WHY this matters for their career
- A concrete action item they can do THIS WEEK

Make suggestions DIVERSE and SPECIFIC - not generic "improve documentation" but "Add a demo GIF to your top Python project to show recruiters your UI skills". Consider their current tech stack vs target role requirements.

Return ONLY a valid JSON array in this format:
[
  {
    "category": "learning",
    "title": "string",
    "description": "string",
    "priority": "high|medium|low",
    "action": "string"
  }
]`;

  try {
    let responseText: string;

    // Try Gemini first
    if (hasGemini) {
      try {
        const result = await geminiModel!.generateContent(prompt);
        const response = await result.response;
        responseText = response.text();
      } catch (error) {
        console.warn('Gemini suggestions failed:', error);
        // Fall through to Groq
        if (hasGroq) {
          const response = await groq!.chat.completions.create({
            model: groqModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 1500,
          });
          responseText = response.choices[0]?.message?.content || '';
        } else {
          throw new Error('No AI available');
        }
      }
    } else if (hasGroq) {
      const response = await groq!.chat.completions.create({
        model: groqModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
      });
      responseText = response.choices[0]?.message?.content || '';
    } else {
      console.log('No AI configured, using fallback suggestions');
      return generateFallbackSuggestions(analysis, targetRole);
    }

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions: Suggestion[] = JSON.parse(jsonMatch[0]);
      // Validate suggestions
      return suggestions.filter(s => 
        s.title && s.description && s.action && 
        ['improvement', 'portfolio', 'learning', 'contribution'].includes(s.category) &&
        ['high', 'medium', 'low'].includes(s.priority)
      ).slice(0, 5);
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('AI Suggestions Error:', error);
    return generateFallbackSuggestions(analysis, targetRole);
  }
}
