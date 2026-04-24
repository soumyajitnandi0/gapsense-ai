import { IGap, ISubScore } from '../models/Assessment';
import { ISkillRequirement } from '../models/Role';
import { ISkill, IProject, IExperience } from '../models/Profile';
import SkillOntology from '../models/SkillOntology';
import { normalizeSkill } from './resumeParser';

export interface ScoringInput {
  userSkills: ISkill[];
  userProjects: IProject[];
  userExperience: IExperience[];
  requiredSkills: ISkillRequirement[];
  resumeText?: string;
  targetRole: string;
}

export interface ScoringResult {
  overallScore: number;
  maxScore: number;
  confidence: number;
  subScores: ISubScore[];
  gaps: IGap[];
  matchedSkills: string[];
  missingSkills: string[];
  explanations: {
    factor: string;
    impact: string;
    suggestion: string;
  }[];
}

// Weight configuration
const SCORE_WEIGHTS = {
  coreSkills: 0.35,
  skillDepth: 0.20,
  projects: 0.20,
  experience: 0.15,
  resumeQuality: 0.10,
};

export async function computeReadinessScore(input: ScoringInput): Promise<ScoringResult> {
  const { userSkills, userProjects, userExperience, requiredSkills, resumeText, targetRole } = input;

  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      overallScore: 0,
      maxScore: 100,
      confidence: 0,
      subScores: [],
      gaps: [],
      matchedSkills: userSkills.map(s => s.name),
      missingSkills: [],
      explanations: [{
        factor: 'No requirements defined',
        impact: 'Cannot compute readiness without role requirements',
        suggestion: 'Select a target role or upload a job description',
      }],
    };
  }

  // 1. Core Skills Match Score (35%)
  const coreSkillsResult = calculateCoreSkillsScore(userSkills, requiredSkills);

  // 2. Skill Depth Score (20%)
  const skillDepthResult = calculateSkillDepthScore(userSkills, requiredSkills);

  // 3. Project Relevance Score (20%)
  const projectResult = calculateProjectScore(userProjects, requiredSkills, targetRole);

  // 4. Experience Score (15%)
  const experienceResult = calculateExperienceScore(userExperience, targetRole);

  // 5. Resume Quality Score (10%)
  const resumeResult = calculateResumeQualityScore(resumeText);

  // Calculate weighted overall score
  const overallScore = Math.round(
    coreSkillsResult.score * SCORE_WEIGHTS.coreSkills +
    skillDepthResult.score * SCORE_WEIGHTS.skillDepth +
    projectResult.score * SCORE_WEIGHTS.projects +
    experienceResult.score * SCORE_WEIGHTS.experience +
    resumeResult.score * SCORE_WEIGHTS.resumeQuality
  );

  // Calculate confidence based on data completeness
  const confidence = calculateConfidence(input);

  // Identify gaps
  const gaps = await identifyGaps(userSkills, requiredSkills, coreSkillsResult.matched, coreSkillsResult.missing);

  // Generate explanations
  const explanations = generateExplanations(
    coreSkillsResult,
    skillDepthResult,
    projectResult,
    experienceResult,
    resumeResult
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    maxScore: 100,
    confidence,
    subScores: [
      {
        category: 'Core Skills Match',
        score: coreSkillsResult.score,
        maxScore: 100,
        weight: SCORE_WEIGHTS.coreSkills,
        explanation: `${coreSkillsResult.matched.length}/${requiredSkills.filter(s => s.required).length} required skills present`,
      },
      {
        category: 'Skill Depth',
        score: skillDepthResult.score,
        maxScore: 100,
        weight: SCORE_WEIGHTS.skillDepth,
        explanation: `Average proficiency level across matched skills`,
      },
      {
        category: 'Project Relevance',
        score: projectResult.score,
        maxScore: 100,
        weight: SCORE_WEIGHTS.projects,
        explanation: `${userProjects.length} projects with ${projectResult.relevantTechnologies} relevant technologies`,
      },
      {
        category: 'Experience',
        score: experienceResult.score,
        maxScore: 100,
        weight: SCORE_WEIGHTS.experience,
        explanation: `${experienceResult.years} years of relevant experience`,
      },
      {
        category: 'Resume Quality',
        score: resumeResult.score,
        maxScore: 100,
        weight: SCORE_WEIGHTS.resumeQuality,
        explanation: `${resumeResult.sections} key sections with measurable impact`,
      },
    ],
    gaps,
    matchedSkills: coreSkillsResult.matched,
    missingSkills: coreSkillsResult.missing,
    explanations,
  };
}

interface SkillScoreResult {
  score: number;
  matched: string[];
  missing: string[];
  matchPercentage: number;
}

function calculateCoreSkillsScore(
  userSkills: ISkill[],
  requiredSkills: ISkillRequirement[]
): SkillScoreResult {
  // Normalize user skill names for better matching
  const userSkillNames = userSkills.map(s => normalizeSkill(s.name).toLowerCase());
  const required = requiredSkills.filter(s => s.required);
  
  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of required) {
    const normalizedReq = normalizeSkill(req.name).toLowerCase();
    const hasMatch = userSkillNames.some(userSkill => {
      // Check for exact match, contains match, or significant word overlap
      const exactMatch = userSkill === normalizedReq;
      const containsMatch = userSkill.includes(normalizedReq) || normalizedReq.includes(userSkill);
      // Word overlap for multi-word skills (e.g., "REST API" matches "REST APIs")
      const reqWords = normalizedReq.split(/\s+/);
      const userWords = userSkill.split(/\s+/);
      const wordOverlap = reqWords.some(rw => userWords.some(uw => rw === uw || rw.includes(uw) || uw.includes(rw)));
      
      return exactMatch || containsMatch || wordOverlap;
    });
    
    if (hasMatch) {
      matched.push(req.name);
    } else {
      missing.push(req.name);
    }
  }

  // Calculate score based on weighted requirements (consider all skills, not just required)
  let totalWeight = 0;
  let achievedWeight = 0;

  for (const req of requiredSkills) {
    totalWeight += req.weight;
    const normalizedReq = normalizeSkill(req.name).toLowerCase();
    const hasMatch = userSkillNames.some(userSkill => {
      const exactMatch = userSkill === normalizedReq;
      const containsMatch = userSkill.includes(normalizedReq) || normalizedReq.includes(userSkill);
      const reqWords = normalizedReq.split(/\s+/);
      const userWords = userSkill.split(/\s+/);
      const wordOverlap = reqWords.some(rw => userWords.some(uw => rw === uw || rw.includes(uw) || uw.includes(rw)));
      return exactMatch || containsMatch || wordOverlap;
    });
    if (hasMatch) {
      achievedWeight += req.weight;
    }
  }

  const matchPercentage = totalWeight > 0 ? achievedWeight / totalWeight : 0;
  // Boost score slightly if they have at least half the required skills
  const boost = (matched.length / Math.max(1, required.length)) >= 0.5 ? 5 : 0;
  const score = Math.min(100, Math.round(matchPercentage * 100) + boost);

  return { score, matched, missing, matchPercentage };
}

interface DepthScoreResult {
  score: number;
  averageLevel: string;
}

function calculateSkillDepthScore(
  userSkills: ISkill[],
  requiredSkills: ISkillRequirement[]
): DepthScoreResult {
  if (userSkills.length === 0) {
    return { score: 0, averageLevel: 'none' };
  }

  const levelScores: Record<string, number> = {
    beginner: 33,
    intermediate: 66,
    advanced: 100,
  };

  // Only consider skills that match required skills (using normalized matching)
  const relevantSkills = userSkills.filter(userSkill => {
    const normalizedUserSkill = normalizeSkill(userSkill.name).toLowerCase();
    return requiredSkills.some(req => {
      const normalizedReq = normalizeSkill(req.name).toLowerCase();
      return normalizedReq.includes(normalizedUserSkill) || 
             normalizedUserSkill.includes(normalizedReq) ||
             normalizedReq === normalizedUserSkill;
    });
  });

  // If no exact matches, still give partial credit for having relevant tech skills
  if (relevantSkills.length === 0 && userSkills.length > 0) {
    // Give partial score based on overall skill portfolio
    const totalScore = userSkills.reduce((sum, skill) => {
      return sum + (levelScores[skill.level] || 50);
    }, 0);
    const averageScore = (totalScore / userSkills.length) * 0.3; // 30% credit for general skills
    return { score: Math.round(averageScore), averageLevel: 'beginner' };
  }

  if (relevantSkills.length === 0) {
    return { score: 0, averageLevel: 'none' };
  }

  const totalScore = relevantSkills.reduce((sum, skill) => {
    return sum + (levelScores[skill.level] || 33);
  }, 0);

  const averageScore = totalScore / relevantSkills.length;
  
  let averageLevel = 'beginner';
  if (averageScore >= 80) averageLevel = 'advanced';
  else if (averageScore >= 50) averageLevel = 'intermediate';

  return { score: Math.round(averageScore), averageLevel };
}

interface ProjectScoreResult {
  score: number;
  relevantTechnologies: number;
  hasEndToEndProject: boolean;
}

function calculateProjectScore(
  projects: IProject[],
  requiredSkills: ISkillRequirement[],
  targetRole: string
): ProjectScoreResult {
  if (projects.length === 0) {
    return { score: 0, relevantTechnologies: 0, hasEndToEndProject: false };
  }

  const requiredSkillNames = requiredSkills.map(s => s.name.toLowerCase());
  let relevantTechnologies = 0;
  let hasEndToEndProject = false;

  for (const project of projects) {
    const projectTechs = project.technologies.map(t => t.toLowerCase());
    
    // Count relevant technologies
    for (const tech of projectTechs) {
      if (requiredSkillNames.some(req => req.includes(tech) || tech.includes(req))) {
        relevantTechnologies++;
      }
    }

    // Check for end-to-end (has both frontend and backend indicators)
    const hasFrontend = projectTechs.some(t => 
      ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'].includes(t)
    );
    const hasBackend = projectTechs.some(t => 
      ['node', 'python', 'java', 'api', 'database', 'sql', 'mongodb'].includes(t)
    );
    
    if (hasFrontend && hasBackend) {
      hasEndToEndProject = true;
    }
  }

  // Score based on project count, relevance, and complexity
  const baseScore = Math.min(40, projects.length * 10);
  const relevanceScore = Math.min(40, relevantTechnologies * 5);
  const complexityBonus = hasEndToEndProject ? 20 : 0;

  return {
    score: Math.min(100, baseScore + relevanceScore + complexityBonus),
    relevantTechnologies,
    hasEndToEndProject,
  };
}

interface ExperienceScoreResult {
  score: number;
  years: number;
  hasRelevantExperience: boolean;
}

function calculateExperienceScore(
  experiences: IExperience[],
  targetRole: string
): ExperienceScoreResult {
  if (experiences.length === 0) {
    return { score: 0, years: 0, hasRelevantExperience: false };
  }

  // Calculate total years
  let totalYears = 0;
  let hasRelevantExperience = false;
  const targetRoleLower = targetRole.toLowerCase();

  for (const exp of experiences) {
    if (exp.startDate) {
      const endDate = exp.current ? new Date() : (exp.endDate || new Date());
      const years = (endDate.getTime() - new Date(exp.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += years;
    }

    // Check if experience is relevant to target role
    const roleLower = exp.role.toLowerCase();
    const descriptionLower = (exp.description || '').toLowerCase();
    
    if (roleLower.includes(targetRoleLower) || 
        targetRoleLower.includes(roleLower) ||
        descriptionLower.includes(targetRoleLower)) {
      hasRelevantExperience = true;
    }
  }

  // Score based on years and relevance
  const yearsScore = Math.min(60, totalYears * 15);
  const relevanceBonus = hasRelevantExperience ? 40 : 0;

  return {
    score: Math.min(100, yearsScore + relevanceBonus),
    years: Math.round(totalYears * 10) / 10,
    hasRelevantExperience,
  };
}

interface ResumeQualityResult {
  score: number;
  sections: number;
  hasImpactStatements: boolean;
}

function calculateResumeQualityScore(resumeText?: string): ResumeQualityResult {
  if (!resumeText || resumeText.trim().length === 0) {
    return { score: 0, sections: 0, hasImpactStatements: false };
  }

  const text = resumeText.toLowerCase();
  const textLength = resumeText.length;

  // Check for key sections
  const sections = [
    text.includes('experience') || text.includes('work'),
    text.includes('education') || text.includes('degree'),
    text.includes('skills') || text.includes('technologies'),
    text.includes('project'),
  ].filter(Boolean).length;

  // Check for impact statements (measurable achievements)
  const impactIndicators = [
    'increased', 'decreased', 'improved', 'reduced', 'achieved',
    'led', 'managed', 'created', 'developed', 'implemented',
    '%', 'percent', 'million', 'thousand', 'users', 'customers',
    'saved', 'generated', 'grew', 'optimized', 'enhanced'
  ];
  
  const hasImpactStatements = impactIndicators.some(indicator => 
    text.includes(indicator)
  );

  // Score based on length, sections, and impact statements
  const lengthScore = Math.min(30, textLength / 100);
  const sectionsScore = sections * 15;
  const impactBonus = hasImpactStatements ? 25 : 0;

  return {
    score: Math.min(100, lengthScore + sectionsScore + impactBonus),
    sections,
    hasImpactStatements,
  };
}

async function identifyGaps(
  userSkills: ISkill[],
  requiredSkills: ISkillRequirement[],
  matched: string[],
  missing: string[]
): Promise<IGap[]> {
  const gaps: IGap[] = [];

  // Add missing skills as gaps
  for (const missingSkill of missing.slice(0, 5)) {
    const req = requiredSkills.find(r => r.name === missingSkill);
    
    gaps.push({
      skill: missingSkill,
      currentLevel: 'none',
      requiredLevel: req?.level || 'intermediate',
      priority: req?.required ? 'high' : 'medium',
      rationale: `Required ${req?.required ? '' : '(optional) '}skill for target role`,
    });
  }

  // Add skills with insufficient depth (using normalized matching)
  for (const userSkill of userSkills) {
    const normalizedUserSkill = normalizeSkill(userSkill.name).toLowerCase();
    const req = requiredSkills.find(r => {
      const normalizedReq = normalizeSkill(r.name).toLowerCase();
      return normalizedReq.includes(normalizedUserSkill) ||
             normalizedUserSkill.includes(normalizedReq) ||
             normalizedReq === normalizedUserSkill;
    });

    if (req) {
      const levelOrder = ['beginner', 'intermediate', 'advanced'];
      const userLevelIndex = levelOrder.indexOf(userSkill.level);
      const reqLevelIndex = levelOrder.indexOf(req.level);

      if (userLevelIndex < reqLevelIndex) {
        gaps.push({
          skill: userSkill.name,
          currentLevel: userSkill.level,
          requiredLevel: req.level,
          priority: req.required ? 'high' : 'medium',
          rationale: `Current skill level (${userSkill.level}) below requirement (${req.level})`,
        });
      }
    }
  }

  // Enrich gaps with skill ontology data
  const enrichedGaps = await Promise.all(
    gaps.map(async (gap) => {
      const ontology = await SkillOntology.findOne({
        name: { $regex: new RegExp(gap.skill, 'i') },
      });

      if (ontology) {
        // Adjust priority based on industry demand
        if (ontology.industryDemand > 0.8 && gap.priority !== 'high') {
          gap.priority = 'high';
        }
      }

      return gap;
    })
  );

  return enrichedGaps.slice(0, 5);
}

function calculateConfidence(input: ScoringInput): number {
  let confidence = 0.5; // Base confidence

  // More skills = higher confidence
  if (input.userSkills.length >= 5) confidence += 0.1;
  if (input.userSkills.length >= 10) confidence += 0.1;

  // Resume text improves confidence
  if (input.resumeText && input.resumeText.length > 500) confidence += 0.1;
  if (input.resumeText && input.resumeText.length > 2000) confidence += 0.1;

  // Projects add confidence
  if (input.userProjects.length > 0) confidence += 0.05;
  if (input.userProjects.length >= 2) confidence += 0.05;

  // Cap at 0.95
  return Math.min(0.95, confidence);
}

function generateExplanations(
  coreSkills: SkillScoreResult,
  skillDepth: DepthScoreResult,
  projects: ProjectScoreResult,
  experience: ExperienceScoreResult,
  resume: ResumeQualityResult
): { factor: string; impact: string; suggestion: string; }[] {
  const explanations = [];

  if (coreSkills.matched.length === 0) {
    explanations.push({
      factor: 'Core Skills',
      impact: 'No required skills detected',
      suggestion: 'Focus on learning fundamental skills for this role',
    });
  } else if (coreSkills.matchPercentage < 0.5) {
    explanations.push({
      factor: 'Core Skills',
      impact: `Only ${Math.round(coreSkills.matchPercentage * 100)}% of required skills present`,
      suggestion: `Priority: Learn ${coreSkills.missing.slice(0, 3).join(', ')}`,
    });
  }

  if (skillDepth.score < 50) {
    explanations.push({
      factor: 'Skill Depth',
      impact: 'Skills are at beginner level',
      suggestion: 'Build deeper expertise through advanced projects',
    });
  }

  if (projects.score < 30) {
    explanations.push({
      factor: 'Projects',
      impact: 'Limited project demonstration',
      suggestion: 'Create 2-3 projects showcasing relevant technologies',
    });
  }

  if (!experience.hasRelevantExperience && experience.years === 0) {
    explanations.push({
      factor: 'Experience',
      impact: 'No professional experience detected',
      suggestion: 'Consider internships, freelancing, or open source contributions',
    });
  }

  if (!resume.hasImpactStatements) {
    explanations.push({
      factor: 'Resume Impact',
      impact: 'Missing measurable achievements',
      suggestion: 'Add quantifiable results to your resume (e.g., "Improved performance by 50%")',
    });
  }

  if (explanations.length === 0) {
    explanations.push({
      factor: 'Overall Strengths',
      impact: 'Strong profile across all dimensions',
      suggestion: 'Focus on interview preparation and networking',
    });
  }

  return explanations;
}

// Legacy function for backward compatibility
export function computeReadinessScoreLegacy(userSkills: string[], requiredSkills: string[]) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 100, matchedSkills: userSkills, missingSkills: [] };
  }

  const uLower = userSkills.map(s => s.toLowerCase().trim());
  const rLower = requiredSkills.map(s => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of rLower) {
    const hasMatch = uLower.some(u => u.includes(req) || req.includes(u));
    if (hasMatch) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const coreMatch = matched.length / requiredSkills.length;
  const score = Math.floor(coreMatch * 70);

  return {
    score,
    matchedSkills: Array.from(new Set(matched)),
    missingSkills: Array.from(new Set(missing)).slice(0, 5)
  };
}
