import pdfParse from 'pdf-parse';
import fs from 'fs';
import openai from '../config/openai';

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills: Array<{
    name: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationYear?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration?: string;
    description?: string;
  }>;
  certifications?: string[];
  rawText: string;
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF Parsing Error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    // For DOCX files, we'll use a simple text extraction
    // In production, consider using mammoth.js or similar
    const buffer = fs.readFileSync(filePath);
    // Simple text extraction - looking for text between XML tags
    const text = buffer.toString('utf8');
    const matches = text.match(/<w:t>([^<]+)<\/w:t>/g);
    if (matches) {
      return matches.map(m => m.replace(/<\/?w:t>/g, '')).join(' ');
    }
    return '';
  } catch (error) {
    console.error('DOCX Parsing Error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

export async function parseResumeWithLLM(resumeText: string): Promise<ParsedResume> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, using mock data');
    return {
      name: 'Demo User',
      email: 'demo@example.com',
      skills: [
        { name: 'JavaScript', level: 'intermediate' },
        { name: 'React', level: 'intermediate' },
        { name: 'Node.js', level: 'beginner' },
      ],
      projects: [
        {
          name: 'E-commerce Dashboard',
          description: 'Built a full-stack dashboard with React and Node.js',
          technologies: ['React', 'Node.js', 'MongoDB'],
        },
      ],
      education: [
        {
          institution: 'Demo University',
          degree: 'Bachelor of Technology',
          field: 'Computer Science',
        },
      ],
      experience: [],
      rawText: resumeText,
    };
  }

  const prompt = `You are a precise resume parser. Extract structured information from the resume text below and return ONLY a valid JSON object matching this exact schema:

{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "skills": [
    { "name": "Skill Name", "level": "beginner|intermediate|advanced" }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"],
      "link": "url or null"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Name",
      "field": "Field of Study",
      "graduationYear": "YYYY"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Duration",
      "description": "Brief description"
    }
  ],
  "certifications": ["Certification Name"]
}

Rules:
1. Return ONLY valid JSON, no markdown formatting
2. Infer skill levels from descriptions (beginner/intermediate/advanced)
3. Extract all technical skills mentioned
4. Include project links if present
5. If information is missing, use null or empty arrays

Resume Text:
${resumeText.substring(0, 8000)}`; // Limit text to avoid token limits

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise resume entity extractor. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      name: parsed.name || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      skills: parsed.skills || [],
      projects: parsed.projects || [],
      education: parsed.education || [],
      experience: parsed.experience || [],
      certifications: parsed.certifications || [],
      rawText: resumeText,
    };
  } catch (error) {
    console.error('LLM Extraction Error:', error);
    // Fallback to basic extraction
    return {
      skills: [],
      projects: [],
      education: [],
      experience: [],
      rawText: resumeText,
    };
  }
}

export async function parseResume(fileBuffer: Buffer, mimeType: string): Promise<ParsedResume> {
  let text = '';
  
  if (mimeType === 'application/pdf') {
    text = await extractTextFromPdf(fileBuffer);
  } else if (mimeType.includes('word')) {
    // For DOCX, we'd need to save temporarily or use a different approach
    text = fileBuffer.toString('utf8');
  } else {
    text = fileBuffer.toString('utf8');
  }

  if (!text.trim()) {
    throw new Error('Could not extract text from resume');
  }

  return parseResumeWithLLM(text);
}

export function normalizeSkill(skill: string): string {
  // Normalize skill names (e.g., "reactjs" -> "React", "node" -> "Node.js")
  const skillMap: Record<string, string> = {
    'reactjs': 'React',
    'react.js': 'React',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'golang': 'Go',
    'postgres': 'PostgreSQL',
    'mongo': 'MongoDB',
    'aws': 'AWS',
    'gcp': 'Google Cloud',
    'azure': 'Azure',
  };

  const normalized = skill.toLowerCase().trim();
  return skillMap[normalized] || skill.trim();
}

export function extractSkillsFromText(text: string): string[] {
  // Common tech skills pattern matching as fallback
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'PHP',
    'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions',
    'GraphQL', 'REST', 'gRPC', 'WebSocket', 'Redis', 'Kafka', 'RabbitMQ',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy',
    'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'Material UI',
    'Git', 'Linux', 'Nginx', 'Apache',
  ];

  const found: string[] = [];
  const textLower = text.toLowerCase();

  for (const skill of commonSkills) {
    if (textLower.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }

  return [...new Set(found)];
}
