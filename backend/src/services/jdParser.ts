import openai from '../config/openai';
import { ISkillRequirement } from '../models/Role';

export interface ParsedJD {
  title: string;
  companyType: 'faang' | 'startup' | 'enterprise' | 'any';
  requiredSkills: ISkillRequirement[];
  optionalSkills: ISkillRequirement[];
  experienceLevel: 'entry' | 'mid' | 'senior';
  description: string;
  responsibilities: string[];
  qualifications: string[];
}

export async function parseJobDescription(jdText: string): Promise<ParsedJD> {
  if (!process.env.OPENAI_API_KEY) {
    return getMockParsedJD();
  }

  const prompt = `You are an expert job description analyzer. Extract structured information from the following job description and return ONLY a valid JSON object.

Return JSON matching this schema:
{
  "title": "Job Title",
  "companyType": "faang|startup|enterprise|any",
  "experienceLevel": "entry|mid|senior",
  "description": "Brief summary of the role",
  "responsibilities": ["responsibility 1", "responsibility 2"],
  "qualifications": ["qualification 1", "qualification 2"],
  "requiredSkills": [
    { "name": "Skill Name", "level": "beginner|intermediate|advanced", "weight": 1.0, "required": true, "category": "technical|soft|domain" }
  ],
  "optionalSkills": [
    { "name": "Skill Name", "level": "beginner|intermediate|advanced", "weight": 0.5, "required": false, "category": "technical|soft|domain" }
  ]
}

Rules:
1. Categorize skills: technical (programming languages, frameworks, tools), soft (communication, leadership), domain (industry knowledge)
2. Assign appropriate levels based on context (e.g., "proficient in" = advanced, "familiar with" = beginner)
3. Weight: critical must-have skills = 1.5-2.0, important = 1.0, nice-to-have = 0.5
4. Identify company type from context (FAANG, startup, enterprise)
5. Determine experience level from requirements

Job Description:
${jdText.substring(0, 10000)}`; // Limit to avoid token limits

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise job description parser. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      title: parsed.title || 'Unknown Position',
      companyType: parsed.companyType || 'any',
      experienceLevel: parsed.experienceLevel || 'entry',
      description: parsed.description || '',
      responsibilities: parsed.responsibilities || [],
      qualifications: parsed.qualifications || [],
      requiredSkills: (parsed.requiredSkills || []).map((s: any) => ({
        name: s.name,
        level: s.level || 'intermediate',
        weight: s.weight || 1.0,
        required: true,
        category: s.category || 'technical',
      })),
      optionalSkills: (parsed.optionalSkills || []).map((s: any) => ({
        name: s.name,
        level: s.level || 'beginner',
        weight: s.weight || 0.5,
        required: false,
        category: s.category || 'technical',
      })),
    };
  } catch (error) {
    console.error('JD Parsing Error:', error);
    return getMockParsedJD();
  }
}

function getMockParsedJD(): ParsedJD {
  return {
    title: 'Software Engineer',
    companyType: 'any',
    experienceLevel: 'entry',
    description: 'Full-stack software engineering position',
    responsibilities: [
      'Develop and maintain web applications',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code',
    ],
    qualifications: [
      'Bachelor\'s degree in Computer Science or related field',
      'Experience with JavaScript and modern frameworks',
    ],
    requiredSkills: [
      { name: 'JavaScript', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
      { name: 'React', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
      { name: 'Node.js', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
      { name: 'Git', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
    ],
    optionalSkills: [
      { name: 'TypeScript', level: 'intermediate', weight: 0.5, required: false, category: 'technical' },
      { name: 'Docker', level: 'beginner', weight: 0.5, required: false, category: 'technical' },
      { name: 'AWS', level: 'beginner', weight: 0.5, required: false, category: 'technical' },
    ],
  };
}

export async function createRoleFromJD(
  jdText: string,
  name?: string
): Promise<{
  name: string;
  description: string;
  category: string;
  companyType: string;
  experienceLevel: string;
  skills: ISkillRequirement[];
}> {
  const parsed = await parseJobDescription(jdText);

  // Combine required and optional skills
  const allSkills = [
    ...parsed.requiredSkills,
    ...parsed.optionalSkills,
  ];

  return {
    name: name || parsed.title,
    description: parsed.description,
    category: inferCategory(parsed.title),
    companyType: parsed.companyType,
    experienceLevel: parsed.experienceLevel,
    skills: allSkills,
  };
}

function inferCategory(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('frontend') || titleLower.includes('ui') || titleLower.includes('react')) {
    return 'Frontend Development';
  }
  if (titleLower.includes('backend') || titleLower.includes('api') || titleLower.includes('server')) {
    return 'Backend Development';
  }
  if (titleLower.includes('fullstack') || titleLower.includes('full stack')) {
    return 'Full Stack Development';
  }
  if (titleLower.includes('data') || titleLower.includes('ml') || titleLower.includes('machine learning')) {
    return 'Data & ML';
  }
  if (titleLower.includes('devops') || titleLower.includes('sre') || titleLower.includes('platform')) {
    return 'DevOps & Infrastructure';
  }
  if (titleLower.includes('mobile') || titleLower.includes('ios') || titleLower.includes('android')) {
    return 'Mobile Development';
  }
  if (titleLower.includes('security') || titleLower.includes('cyber')) {
    return 'Security';
  }
  
  return 'Software Engineering';
}
