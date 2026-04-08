import openai from '../config/openai';
import { IGap, IRoadmapMilestone, IProjectSuggestion } from '../models/Assessment';
import SkillOntology from '../models/SkillOntology';

export interface RoadmapInput {
  gaps: IGap[];
  currentSkills: string[];
  targetRole: string;
  durationDays?: number;
  userExperience?: 'entry' | 'mid' | 'senior';
}

export interface GeneratedRoadmap {
  duration: number;
  milestones: IRoadmapMilestone[];
  projectSuggestions: IProjectSuggestion[];
  targetCompletionDate: Date;
  estimatedHours: number;
  weeklyCommitment: string;
}

export async function generateRoadmap(input: RoadmapInput): Promise<GeneratedRoadmap> {
  const { gaps, currentSkills, targetRole, durationDays = 60, userExperience = 'entry' } = input;
  
  if (!gaps || gaps.length === 0) {
    return generateDefaultRoadmap(targetRole, durationDays);
  }

  // Fetch skill resources from ontology
  const enrichedGaps = await Promise.all(
    gaps.map(async (gap) => {
      const skillOntology = await SkillOntology.findOne({ 
        name: { $regex: new RegExp(gap.skill, 'i') },
        isActive: true 
      });
      return {
        ...gap,
        resources: skillOntology?.resources || [],
        learningPath: skillOntology?.learningPath || [],
        difficulty: skillOntology?.difficulty || 'intermediate',
      };
    })
  );

  const priorityGaps = enrichedGaps.filter(g => g.priority === 'high');
  const mediumGaps = enrichedGaps.filter(g => g.priority === 'medium');
  const lowGaps = enrichedGaps.filter(g => g.priority === 'low');

  // Generate milestones
  const milestones = generateMilestones(
    priorityGaps, 
    mediumGaps, 
    lowGaps, 
    durationDays,
    userExperience
  );

  // Generate project suggestions
  const projectSuggestions = await generateProjectSuggestions(
    enrichedGaps, 
    currentSkills, 
    targetRole
  );

  const targetCompletionDate = new Date();
  targetCompletionDate.setDate(targetCompletionDate.getDate() + durationDays);

  const estimatedHours = milestones.reduce((total, m) => 
    total + m.tasks.reduce((tTotal, t) => tTotal + t.estimatedHours, 0), 0
  );

  return {
    duration: durationDays,
    milestones,
    projectSuggestions,
    targetCompletionDate,
    estimatedHours,
    weeklyCommitment: `${Math.round(estimatedHours / (durationDays / 7))} hours/week`,
  };
}

function generateMilestones(
  priorityGaps: any[],
  mediumGaps: any[],
  lowGaps: any[],
  durationDays: number,
  userExperience: string
): IRoadmapMilestone[] {
  const weeks = Math.ceil(durationDays / 7);
  const milestones: IRoadmapMilestone[] = [];

  // Week 1-2: Foundation - High Priority Skills
  if (priorityGaps.length > 0) {
    const foundationTasks = priorityGaps.slice(0, 3).flatMap((gap, idx) => [
      {
        id: `w1-t${idx}-1`,
        title: `${gap.skill} - Fundamentals`,
        description: `Learn core concepts of ${gap.skill} through tutorials and documentation`,
        estimatedHours: gap.difficulty === 'beginner' ? 5 : 8,
        resources: gap.resources?.slice(0, 2) || [],
        completed: false,
      },
      {
        id: `w1-t${idx}-2`,
        title: `${gap.skill} - Practice Problems`,
        description: `Complete hands-on exercises to reinforce ${gap.skill} concepts`,
        estimatedHours: 4,
        resources: gap.resources?.slice(2, 3) || [],
        completed: false,
      },
    ]);

    milestones.push({
      week: 1,
      title: 'Foundation Building',
      tasks: foundationTasks,
    });

    if (weeks > 1) {
      const week2Tasks = priorityGaps.slice(0, 2).flatMap((gap, idx) => [
        {
          id: `w2-t${idx}-1`,
          title: `${gap.skill} - Intermediate Concepts`,
          description: `Deep dive into advanced ${gap.skill} patterns and best practices`,
          estimatedHours: 6,
          resources: gap.resources?.slice(1, 3) || [],
          completed: false,
        },
        {
          id: `w2-t${idx}-2`,
          title: `${gap.skill} - Mini Project`,
          description: `Build a small project using ${gap.skill}`,
          estimatedHours: 8,
          resources: [],
          completed: false,
        },
      ]);

      milestones.push({
        week: 2,
        title: 'Skill Deepening',
        tasks: week2Tasks,
      });
    }
  }

  // Week 3+: Medium Priority Skills and Integration
  let currentWeek = 3;
  const remainingWeeks = weeks - 2;
  
  if (mediumGaps.length > 0 && remainingWeeks > 0) {
    const mediumWeeks = Math.min(Math.ceil(mediumGaps.length / 2), Math.floor(remainingWeeks * 0.6));
    
    for (let i = 0; i < mediumWeeks && currentWeek <= weeks; i++) {
      const gapsForWeek = mediumGaps.slice(i * 2, i * 2 + 2);
      const tasks = gapsForWeek.flatMap((gap, idx) => [
        {
          id: `w${currentWeek}-t${idx}-1`,
          title: `${gap.skill} - Core Concepts`,
          description: `Master essential ${gap.skill} concepts`,
          estimatedHours: gap.difficulty === 'beginner' ? 4 : 6,
          resources: gap.resources?.slice(0, 2) || [],
          completed: false,
        },
        {
          id: `w${currentWeek}-t${idx}-2`,
          title: `${gap.skill} - Applied Practice`,
          description: `Practice ${gap.skill} with real-world scenarios`,
          estimatedHours: 4,
          resources: gap.resources?.slice(2, 3) || [],
          completed: false,
        },
      ]);

      milestones.push({
        week: currentWeek,
        title: `Building ${gapsForWeek.map(g => g.skill).join(' & ')}`,
        tasks,
      });
      currentWeek++;
    }
  }

  // Final weeks: Integration and Projects
  while (currentWeek <= weeks) {
    const isLastWeek = currentWeek === weeks;
    const tasks = [
      {
        id: `w${currentWeek}-t1`,
        title: isLastWeek ? 'Portfolio Project Completion' : 'Integration Practice',
        description: isLastWeek 
          ? 'Finalize and polish your portfolio project' 
          : 'Combine multiple skills in integrated exercises',
        estimatedHours: isLastWeek ? 15 : 10,
        resources: [],
        completed: false,
      },
      {
        id: `w${currentWeek}-t2`,
        title: isLastWeek ? 'Resume & Interview Prep' : 'Code Review & Refactoring',
        description: isLastWeek 
          ? 'Update resume with new skills and practice interview questions' 
          : 'Review and improve your code quality',
        estimatedHours: 5,
        resources: [],
        completed: false,
      },
    ];

    // Add low priority skill tasks if available
    if (!isLastWeek && lowGaps.length > 0) {
      const lowGap = lowGaps[(currentWeek - 3) % lowGaps.length];
      tasks.push({
        id: `w${currentWeek}-t3`,
        title: `${lowGap.skill} - Overview`,
        description: `Get familiar with ${lowGap.skill} basics`,
        estimatedHours: 3,
        resources: lowGap.resources?.slice(0, 1) || [],
        completed: false,
      });
    }

    milestones.push({
      week: currentWeek,
      title: isLastWeek ? 'Final Polish & Preparation' : `Week ${currentWeek} Integration`,
      tasks,
    });
    currentWeek++;
  }

  return milestones;
}

async function generateProjectSuggestions(
  gaps: any[],
  currentSkills: string[],
  targetRole: string
): Promise<IProjectSuggestion[]> {
  const suggestions: IProjectSuggestion[] = [];
  
  // Generate suggestions based on gaps and target role
  const topGaps = gaps.slice(0, 3).map(g => g.skill);
  
  if (targetRole.toLowerCase().includes('frontend') || targetRole.toLowerCase().includes('fullstack')) {
    suggestions.push({
      title: `${targetRole} Dashboard`,
      description: `Build a comprehensive dashboard showcasing ${topGaps.join(', ')} skills with modern UI/UX practices`,
      technologies: [...currentSkills.slice(0, 4), ...topGaps],
      difficulty: gaps.some(g => g.difficulty === 'advanced') ? 'advanced' : 'intermediate',
      estimatedDays: 14,
      relevance: 'Demonstrates practical application of missing skills in a real-world scenario',
    });
  }

  if (targetRole.toLowerCase().includes('backend') || targetRole.toLowerCase().includes('fullstack')) {
    suggestions.push({
      title: 'RESTful API Service',
      description: `Design and implement a scalable API service using ${topGaps.filter(g => 
        ['Node.js', 'Python', 'Java', 'Go', 'PostgreSQL', 'MongoDB'].some(s => 
          g.toLowerCase().includes(s.toLowerCase())
        )
      ).join(', ') || 'your target stack'}`,
      technologies: [...currentSkills.filter(s => 
        ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker'].some(ts => 
          s.toLowerCase().includes(ts.toLowerCase())
        )
      ), ...topGaps].slice(0, 6),
      difficulty: 'intermediate',
      estimatedDays: 10,
      relevance: 'Shows backend architecture understanding and API design skills',
    });
  }

  if (targetRole.toLowerCase().includes('data') || targetRole.toLowerCase().includes('ml')) {
    suggestions.push({
      title: 'Data Analysis Pipeline',
      description: `Create an end-to-end data processing pipeline with visualization using ${topGaps.join(', ')}`,
      technologies: ['Python', 'Pandas', ...topGaps, 'Jupyter Notebook'],
      difficulty: 'advanced',
      estimatedDays: 12,
      relevance: 'Demonstrates data handling and analysis capabilities',
    });
  }

  // Add a general project if no specific role match
  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Full-Stack Portfolio Project',
      description: `Build a complete application demonstrating ${topGaps.slice(0, 3).join(', ')}`,
      technologies: [...currentSkills.slice(0, 3), ...topGaps.slice(0, 3)],
      difficulty: 'intermediate',
      estimatedDays: 14,
      relevance: 'Comprehensive showcase of both existing and newly acquired skills',
    });
  }

  // Always add a second project suggestion
  suggestions.push({
    title: 'Open Source Contribution',
    description: `Find and contribute to an open source project using ${topGaps[0] || 'your target technologies'}`,
    technologies: [...currentSkills.slice(0, 2), ...topGaps.slice(0, 2)],
    difficulty: 'intermediate',
    estimatedDays: 7,
    relevance: 'Shows collaboration skills and real-world code contribution experience',
  });

  return suggestions.slice(0, 3);
}

function generateDefaultRoadmap(targetRole: string, durationDays: number): GeneratedRoadmap {
  const weeks = Math.ceil(durationDays / 7);
  const milestones: IRoadmapMilestone[] = [];

  for (let week = 1; week <= weeks; week++) {
    milestones.push({
      week,
      title: `Week ${week} - Skill Enhancement`,
      tasks: [
        {
          id: `w${week}-t1`,
          title: 'Advanced Concepts Study',
          description: 'Deepen understanding of core technologies',
          estimatedHours: 8,
          resources: [],
          completed: false,
        },
        {
          id: `w${week}-t2`,
          title: 'Code Practice',
          description: 'Solve problems and build small features',
          estimatedHours: 6,
          resources: [],
          completed: false,
        },
      ],
    });
  }

  const targetCompletionDate = new Date();
  targetCompletionDate.setDate(targetCompletionDate.getDate() + durationDays);

  return {
    duration: durationDays,
    milestones,
    projectSuggestions: [{
      title: 'Portfolio Enhancement',
      description: `Build a project showcasing ${targetRole} capabilities`,
      technologies: [],
      difficulty: 'intermediate',
      estimatedDays: 14,
      relevance: 'Demonstrates practical skills to potential employers',
    }],
    targetCompletionDate,
    estimatedHours: weeks * 14,
    weeklyCommitment: '14 hours/week',
  };
}

// Legacy function for backward compatibility
export async function generate60DayRoadmap(missingSkills: string[]) {
  const input: RoadmapInput = {
    gaps: missingSkills.map(skill => ({
      skill,
      currentLevel: 'none',
      requiredLevel: 'intermediate',
      priority: 'high',
      rationale: 'Required skill gap',
    })),
    currentSkills: [],
    targetRole: 'Software Engineer',
    durationDays: 60,
  };

  const roadmap = await generateRoadmap(input);
  
  return {
    weekly_plan: roadmap.milestones.map(m => ({
      week: m.week,
      tasks: m.tasks.map(t => t.title),
    })),
    project_suggestions: roadmap.projectSuggestions.map(p => ({
      title: p.title,
      description: p.description,
    })),
  };
}
