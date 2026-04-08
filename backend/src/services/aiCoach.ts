import openai from '../config/openai';
import Profile from '../models/Profile';
import Assessment from '../models/Assessment';
import Role from '../models/Role';
import Chat, { IMessage } from '../models/Chat';

export interface ChatContext {
  userId: string;
  sessionId: string;
  currentRoleId?: string;
  currentAssessmentId?: string;
  topic?: string;
}

export interface CoachResponse {
  message: string;
  type: 'general' | 'resume_feedback' | 'interview_question' | 'roadmap_suggestion' | 'skill_advice';
  resources?: string[];
  actionItems?: string[];
  score?: number;
}

export async function generateCoachResponse(
  userMessage: string,
  context: ChatContext
): Promise<CoachResponse> {
  try {
    // Fetch user's profile and recent assessment for context
    const profile = await Profile.findOne({ userId: context.userId });
    const assessment = context.currentAssessmentId 
      ? await Assessment.findById(context.currentAssessmentId)
      : await Assessment.findOne({ userId: context.userId }).sort({ createdAt: -1 });
    const role = context.currentRoleId
      ? await Role.findById(context.currentRoleId)
      : (assessment ? await Role.findById(assessment.roleId) : null);

    // Build context for the AI
    const systemPrompt = buildCoachSystemPrompt(profile, assessment, role);
    
    // Get conversation history
    const chat = await Chat.findOne({ sessionId: context.sessionId });
    const recentMessages = chat?.messages.slice(-6) || [];

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    if (!process.env.OPENAI_API_KEY) {
      return getMockCoachResponse(userMessage);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    
    // Parse response and determine type
    const responseType = determineResponseType(userMessage, content);
    
    return {
      message: content,
      type: responseType,
      resources: extractResources(content),
      actionItems: extractActionItems(content),
    };
  } catch (error) {
    console.error('AI Coach Error:', error);
    return {
      message: 'I apologize, but I encountered an error. Please try again.',
      type: 'general',
    };
  }
}

export async function generateMockInterviewQuestions(
  roleId: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  count: number = 5
): Promise<Array<{
  question: string;
  type: 'technical' | 'behavioral' | 'system_design';
  expectedAnswer?: string;
  hints?: string[];
}>> {
  try {
    const role = await Role.findById(roleId);
    if (!role) throw new Error('Role not found');

    const prompt = `Generate ${count} ${difficulty} mock interview questions for a ${role.name} position.

Context:
- Role: ${role.name}
- Required Skills: ${role.skills.filter(s => s.required).map(s => s.name).join(', ')}
- Experience Level: ${role.experienceLevel}

Generate a mix of:
- Technical questions (coding, framework-specific)
- Behavioral questions (leadership, conflict resolution)
- ${role.experienceLevel !== 'entry' ? 'System design questions' : ''}

Return ONLY a valid JSON array with this structure:
[
  {
    "question": "Question text",
    "type": "technical|behavioral|system_design",
    "expectedAnswer": "Key points to cover in answer",
    "hints": ["Hint 1", "Hint 2"]
  }
]`;

    if (!process.env.OPENAI_API_KEY) {
      return getMockInterviewQuestions(role.name, count);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an experienced technical interviewer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(content);
    return parsed.questions || parsed || [];
  } catch (error) {
    console.error('Mock Interview Generation Error:', error);
    return getMockInterviewQuestions('Software Engineer', count);
  }
}

export async function evaluateInterviewAnswer(
  question: string,
  userAnswer: string,
  type: 'technical' | 'behavioral' | 'system_design'
): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}> {
  try {
    const prompt = `Evaluate this interview answer and provide constructive feedback.

Question Type: ${type}
Question: ${question}
Candidate's Answer: ${userAnswer}

Provide evaluation in JSON format:
{
  "score": 0-100,
  "feedback": "Overall assessment",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Area to improve 1", "Area to improve 2"]
}`;

    if (!process.env.OPENAI_API_KEY) {
      return {
        score: 75,
        feedback: 'Good answer with room for improvement.',
        strengths: ['Clear communication', 'Relevant examples'],
        improvements: ['Add more technical depth', 'Include specific metrics'],
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an experienced interviewer providing constructive feedback.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Interview Evaluation Error:', error);
    return {
      score: 70,
      feedback: 'Unable to provide detailed evaluation.',
      strengths: [],
      improvements: ['Try providing more detailed answers'],
    };
  }
}

export async function generateResumeFeedback(
  resumeText: string,
  targetRole?: string
): Promise<{
  overallScore: number;
  sections: Array<{
    name: string;
    score: number;
    feedback: string;
  }>;
  suggestions: string[];
  keywords: string[];
}> {
  try {
    const prompt = `Analyze this resume and provide detailed feedback for ${targetRole || 'a technical role'}.

Resume:
${resumeText.substring(0, 5000)}

Provide analysis in JSON format:
{
  "overallScore": 0-100,
  "sections": [
    { "name": "Section Name", "score": 0-100, "feedback": "Detailed feedback" }
  ],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "keywords": ["missing keyword 1", "missing keyword 2"]
}`;

    if (!process.env.OPENAI_API_KEY) {
      return getMockResumeFeedback();
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional resume reviewer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Resume Feedback Error:', error);
    return getMockResumeFeedback();
  }
}

function buildCoachSystemPrompt(
  profile: any,
  assessment: any,
  role: any
): string {
  let prompt = `You are GapSense AI Career Coach, a supportive and knowledgeable AI assistant helping students and early-career professionals prepare for technical roles.

Your personality:
- Encouraging but honest about skill gaps
- Practical and actionable in advice
- Knowledgeable about tech industry trends
- Focused on concrete next steps

Guidelines:
1. Provide specific, actionable advice
2. Reference user's profile when relevant
3. Suggest resources and learning paths
4. Be encouraging but realistic about challenges
5. Keep responses concise (2-4 paragraphs max)`;

  if (profile) {
    prompt += `\n\nUser Profile:\n- Skills: ${profile.parsedData?.skills?.map((s: any) => s.name).join(', ') || 'Not available'}\n- Projects: ${profile.parsedData?.projects?.length || 0} projects\n- Target Roles: ${profile.targetRoles?.join(', ') || 'Not specified'}`;
  }

  if (assessment) {
    prompt += `\n\nLatest Assessment:\n- Overall Score: ${assessment.overallScore}/100\n- Top Gaps: ${assessment.gaps?.slice(0, 3).map((g: any) => g.skill).join(', ') || 'None'}\n- Matched Skills: ${assessment.matchedSkills?.length || 0} skills`;
  }

  if (role) {
    prompt += `\n\nTarget Role: ${role.name}\n- Required Skills: ${role.skills?.filter((s: any) => s.required).map((s: any) => s.name).join(', ')}`;
  }

  return prompt;
}

function determineResponseType(userMessage: string, response: string): CoachResponse['type'] {
  const userLower = userMessage.toLowerCase();
  const responseLower = response.toLowerCase();

  if (userLower.includes('resume') || userLower.includes('cv')) return 'resume_feedback';
  if (userLower.includes('interview') || userLower.includes('question')) return 'interview_question';
  if (userLower.includes('roadmap') || userLower.includes('plan') || userLower.includes('learn')) return 'roadmap_suggestion';
  if (userLower.includes('skill') || userLower.includes('technology')) return 'skill_advice';
  
  return 'general';
}

function extractResources(content: string): string[] {
  // Extract URLs from content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.match(urlRegex) || [];
}

function extractActionItems(content: string): string[] {
  // Look for numbered lists or bullet points that suggest actions
  const lines = content.split('\n');
  const actionItems: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\d+\.|^[-*]/.test(trimmed) && trimmed.length > 10) {
      actionItems.push(trimmed.replace(/^\d+\.\s*|^[-*]\s*/, ''));
    }
  }
  
  return actionItems.slice(0, 5);
}

function getMockCoachResponse(message: string): CoachResponse {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('ready')) {
    return {
      message: `Based on your profile, you're making good progress! You have several foundational skills, but there are some gaps to address before you're fully ready for this role. Focus on building projects that demonstrate your skills, and consider contributing to open source to gain more experience.`,
      type: 'general',
      actionItems: [
        'Complete 2-3 portfolio projects',
        'Practice coding problems daily',
        'Update your resume with measurable achievements',
      ],
    };
  }

  if (lowerMsg.includes('resume')) {
    return {
      message: `Your resume looks solid! To make it even stronger, I'd suggest adding more quantifiable achievements. For example, instead of "Built a web app," try "Developed a React app serving 1000+ daily users with 99% uptime." Also, consider adding a projects section that highlights your technical depth.`,
      type: 'resume_feedback',
      actionItems: [
        'Add metrics to 3+ bullet points',
        'Create a projects section with GitHub links',
        'Tailor skills section to match job descriptions',
      ],
    };
  }

  return {
    message: `I'm here to help you prepare for your target role! I can help with resume feedback, mock interviews, roadmap planning, or answering questions about specific technologies. What would you like to focus on?`,
    type: 'general',
  };
}

function getMockInterviewQuestions(role: string, count: number): Array<{
  question: string;
  type: 'technical' | 'behavioral' | 'system_design';
  expectedAnswer: string;
  hints: string[];
}> {
  const questions: Array<{
    question: string;
    type: 'technical' | 'behavioral' | 'system_design';
    expectedAnswer: string;
    hints: string[];
  }> = [
    {
      question: 'Tell me about a challenging project you worked on. What made it difficult and how did you overcome it?',
      type: 'behavioral',
      expectedAnswer: 'Use STAR method: Situation, Task, Action, Result. Focus on your specific contribution.',
      hints: ['Be specific about your role', 'Include technical details', 'Mention what you learned'],
    },
    {
      question: 'Explain how you would design a URL shortener service like bit.ly.',
      type: 'system_design',
      expectedAnswer: 'Discuss database choice, hashing algorithm, scalability, and edge cases.',
      hints: ['Consider read/write ratio', 'Think about collision handling', 'Discuss caching strategy'],
    },
    {
      question: 'What is the difference between var, let, and const in JavaScript?',
      type: 'technical',
      expectedAnswer: 'Discuss scope, hoisting, and reassignment capabilities.',
      hints: ['Mention block scope vs function scope', 'Talk about temporal dead zone'],
    },
    {
      question: 'How do you handle state management in a large React application?',
      type: 'technical',
      expectedAnswer: 'Discuss Redux, Context API, or other state management solutions with trade-offs.',
      hints: ['Mention when to use each approach', 'Talk about performance considerations'],
    },
    {
      question: 'Describe a time when you had to learn a new technology quickly. How did you approach it?',
      type: 'behavioral',
      expectedAnswer: 'Show your learning process and ability to adapt.',
      hints: ['Mention specific resources used', 'Talk about building something practical'],
    },
  ];

  return questions.slice(0, count);
}

function getMockResumeFeedback() {
  return {
    overallScore: 72,
    sections: [
      { name: 'Summary', score: 65, feedback: 'Add a brief professional summary highlighting your key strengths' },
      { name: 'Experience', score: 75, feedback: 'Good structure. Add more quantifiable achievements' },
      { name: 'Skills', score: 80, feedback: 'Well-organized. Consider adding proficiency levels' },
      { name: 'Projects', score: 70, feedback: 'Great projects! Add GitHub links and tech stack details' },
    ],
    suggestions: [
      'Add metrics to your experience bullets (e.g., "Improved load time by 40%")',
      'Include a link to your GitHub or portfolio',
      'Add relevant certifications or coursework',
      'Tailor skills section to match target job descriptions',
    ],
    keywords: ['React', 'Node.js', 'REST API', 'Git', 'Agile'],
  };
}
