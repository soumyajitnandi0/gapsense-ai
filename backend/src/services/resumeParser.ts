import pdfParse from 'pdf-parse';
import fs from 'fs';
import { gemini, geminiModel } from '../config/gemini';
import { groq, groqModel } from '../config/groq';

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
  // Try Gemini first, then Groq, then fallback to pattern extraction
  const hasGemini = !!process.env.GEMINI_API_KEY && gemini && geminiModel;
  const hasGroq = !!process.env.GROQ_API_KEY && groq;
  
  if (!hasGemini && !hasGroq) {
    console.warn('No AI API keys configured, using pattern-based extraction');
    return parseWithFallback(resumeText);
  }

  // Try Gemini first
  if (hasGemini) {
    try {
      const result = await parseWithGemini(resumeText);
      if (result.skills.length > 0) return result;
    } catch (error) {
      console.warn('Gemini parsing failed, trying Groq:', error);
    }
  }

  // Try Groq as fallback
  if (hasGroq) {
    try {
      const result = await parseWithGroq(resumeText);
      if (result.skills.length > 0) return result;
    } catch (error) {
      console.warn('Groq parsing failed, using fallback:', error);
    }
  }

  // Final fallback to pattern extraction
  return parseWithFallback(resumeText);
}

async function parseWithGemini(resumeText: string): Promise<ParsedResume> {
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
1. Return ONLY valid JSON, no markdown formatting, no code blocks
2. Infer skill levels from descriptions (beginner/intermediate/advanced)
3. Extract all technical skills mentioned
4. Include project links if present
5. If information is missing, use null or empty arrays

Resume Text:
${resumeText.substring(0, 15000)}`; // Gemini has larger context

  const result = await geminiModel!.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const jsonStr = jsonMatch[1]?.trim() || text.trim();
  const parsed = JSON.parse(jsonStr);

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
}

async function parseWithGroq(resumeText: string): Promise<ParsedResume> {
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
${resumeText.substring(0, 8000)}`;

  const response = await groq!.chat.completions.create({
    model: groqModel,
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
}

function parseWithFallback(resumeText: string): ParsedResume {
  // Extract skills using pattern matching
  const fallbackSkills = extractSkillsFromText(resumeText).map(name => ({
    name,
    level: 'intermediate' as const,
  }));
  
  // Try to extract email
  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
  
  // Try to extract phone
  const phoneMatch = resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  
  // Try to extract name (first line that looks like a name)
  const lines = resumeText.split('\n').filter(l => l.trim());
  const nameLine = lines.find(l => /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(l.trim()));
  
  return {
    name: nameLine || undefined,
    email: emailMatch?.[0] || undefined,
    phone: phoneMatch?.[0] || undefined,
    skills: fallbackSkills,
    projects: [],
    education: [],
    experience: [],
    certifications: [],
    rawText: resumeText,
  };
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
    'react js': 'React',
    'html5': 'HTML',
    'html 5': 'HTML',
    'css3': 'CSS',
    'css 3': 'CSS',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'node js': 'Node.js',
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'py': 'Python',
    'python': 'Python',
    'golang': 'Go',
    'go': 'Go',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'mongo': 'MongoDB',
    'mongodb': 'MongoDB',
    'aws': 'AWS',
    'amazon web services': 'AWS',
    'gcp': 'Google Cloud',
    'google cloud': 'Google Cloud',
    'google cloud platform': 'Google Cloud',
    'azure': 'Azure',
    'microsoft azure': 'Azure',
    'tailwindcss': 'Tailwind',
    'tailwind css': 'Tailwind',
    'vuejs': 'Vue',
    'vue.js': 'Vue',
    'angularjs': 'Angular',
    'angular.js': 'Angular',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'expressjs': 'Express',
    'express.js': 'Express',
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
