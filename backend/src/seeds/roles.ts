import Role from '../models/Role';
import SkillOntology from '../models/SkillOntology';

export const seedRoles = async (): Promise<void> => {
  const roles = [
    {
      name: 'Frontend Developer',
      description: 'Build user-facing web applications using modern JavaScript frameworks',
      category: 'Frontend Development',
      companyType: 'any',
      experienceLevel: 'entry',
      skills: [
        { name: 'JavaScript', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'HTML', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'CSS', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'React', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'Git', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'TypeScript', level: 'beginner', weight: 0.8, required: false, category: 'technical' },
        { name: 'Responsive Design', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'REST APIs', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'Testing', level: 'beginner', weight: 0.7, required: false, category: 'technical' },
        { name: 'Performance Optimization', level: 'beginner', weight: 0.6, required: false, category: 'technical' },
      ],
    },
    {
      name: 'Backend Developer',
      description: 'Build server-side applications, APIs, and database systems',
      category: 'Backend Development',
      companyType: 'any',
      experienceLevel: 'entry',
      skills: [
        { name: 'Node.js', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'Python', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'SQL', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'REST APIs', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'Git', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'MongoDB', level: 'beginner', weight: 0.8, required: false, category: 'technical' },
        { name: 'Docker', level: 'beginner', weight: 0.7, required: false, category: 'technical' },
        { name: 'Redis', level: 'beginner', weight: 0.6, required: false, category: 'technical' },
        { name: 'System Design', level: 'intermediate', weight: 1.0, required: false, category: 'technical' },
        { name: 'Authentication', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
      ],
    },
    {
      name: 'Full Stack Developer',
      description: 'Work on both frontend and backend components of web applications',
      category: 'Full Stack Development',
      companyType: 'any',
      experienceLevel: 'entry',
      skills: [
        { name: 'JavaScript', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'React', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'Node.js', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'HTML/CSS', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'SQL', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'Git', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'REST APIs', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'TypeScript', level: 'beginner', weight: 0.8, required: false, category: 'technical' },
        { name: 'Docker', level: 'beginner', weight: 0.6, required: false, category: 'technical' },
        { name: 'AWS', level: 'beginner', weight: 0.5, required: false, category: 'technical' },
      ],
    },
    {
      name: 'Data Analyst',
      description: 'Analyze data to help organizations make better business decisions',
      category: 'Data & ML',
      companyType: 'any',
      experienceLevel: 'entry',
      skills: [
        { name: 'Python', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'SQL', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'Pandas', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'Data Visualization', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'Statistics', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'Excel', level: 'intermediate', weight: 1.0, required: false, category: 'technical' },
        { name: 'Tableau', level: 'beginner', weight: 0.7, required: false, category: 'technical' },
        { name: 'Machine Learning Basics', level: 'beginner', weight: 0.6, required: false, category: 'technical' },
        { name: 'A/B Testing', level: 'beginner', weight: 0.7, required: false, category: 'technical' },
        { name: 'Communication', level: 'intermediate', weight: 1.2, required: true, category: 'soft' },
      ],
    },
    {
      name: 'DevOps Engineer',
      description: 'Bridge development and operations to improve deployment and infrastructure',
      category: 'DevOps & Infrastructure',
      companyType: 'any',
      experienceLevel: 'mid',
      skills: [
        { name: 'Linux', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'Docker', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'Kubernetes', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'AWS', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'CI/CD', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'Terraform', level: 'intermediate', weight: 1.0, required: false, category: 'technical' },
        { name: 'Python/Bash', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'Monitoring', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'Git', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'Networking', level: 'beginner', weight: 0.8, required: false, category: 'technical' },
      ],
    },
    {
      name: 'Mobile App Developer',
      description: 'Build native or cross-platform mobile applications',
      category: 'Mobile Development',
      companyType: 'any',
      experienceLevel: 'entry',
      skills: [
        { name: 'React Native', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'Flutter', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'JavaScript/Dart', level: 'intermediate', weight: 1.5, required: true, category: 'technical' },
        { name: 'Mobile UI/UX', level: 'intermediate', weight: 1.2, required: true, category: 'technical' },
        { name: 'REST APIs', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'Git', level: 'intermediate', weight: 1.0, required: true, category: 'technical' },
        { name: 'App Store/Play Store', level: 'beginner', weight: 0.7, required: false, category: 'technical' },
        { name: 'Push Notifications', level: 'beginner', weight: 0.6, required: false, category: 'technical' },
        { name: 'Offline Storage', level: 'beginner', weight: 0.6, required: false, category: 'technical' },
        { name: 'Performance Optimization', level: 'beginner', weight: 0.5, required: false, category: 'technical' },
      ],
    },
  ];

  for (const roleData of roles) {
    await Role.findOneAndUpdate(
      { name: roleData.name },
      roleData,
      { upsert: true, new: true }
    );
  }

  console.log('✅ Roles seeded successfully');
};

export const seedSkillOntology = async (): Promise<void> => {
  const skills = [
    // Frontend Skills
    {
      name: 'React',
      category: 'Frontend',
      description: 'A JavaScript library for building user interfaces',
      difficulty: 'intermediate',
      industryDemand: 0.95,
      learningPath: ['JavaScript Basics', 'ES6+ Features', 'React Fundamentals', 'Hooks', 'State Management', 'Advanced Patterns'],
      tags: ['frontend', 'javascript', 'ui', 'framework'],
    },
    {
      name: 'JavaScript',
      category: 'Frontend',
      description: 'The programming language of the web',
      difficulty: 'intermediate',
      industryDemand: 0.98,
      learningPath: ['Basics', 'Functions', 'Objects', 'DOM Manipulation', 'Async Programming', 'ES6+'],
      tags: ['frontend', 'backend', 'language', 'essential'],
    },
    {
      name: 'TypeScript',
      category: 'Frontend',
      description: 'Typed superset of JavaScript',
      difficulty: 'intermediate',
      industryDemand: 0.85,
      learningPath: ['Type Basics', 'Interfaces', 'Generics', 'Advanced Types', 'Decorators'],
      tags: ['frontend', 'backend', 'javascript', 'typing'],
    },
    {
      name: 'HTML',
      category: 'Frontend',
      description: 'Standard markup language for web pages',
      difficulty: 'beginner',
      industryDemand: 0.99,
      learningPath: ['Basic Tags', 'Forms', 'Semantic HTML', 'Accessibility', 'SEO Basics'],
      tags: ['frontend', 'essential', 'markup'],
    },
    {
      name: 'CSS',
      category: 'Frontend',
      description: 'Style sheet language for web presentation',
      difficulty: 'intermediate',
      industryDemand: 0.98,
      learningPath: ['Selectors', 'Box Model', 'Flexbox', 'Grid', 'Responsive Design', 'Animations'],
      tags: ['frontend', 'essential', 'styling'],
    },
    
    // Backend Skills
    {
      name: 'Node.js',
      category: 'Backend',
      description: 'JavaScript runtime for server-side development',
      difficulty: 'intermediate',
      industryDemand: 0.90,
      learningPath: ['Basics', 'Modules', 'Express.js', 'Database Integration', 'Authentication', 'Deployment'],
      tags: ['backend', 'javascript', 'runtime'],
    },
    {
      name: 'Python',
      category: 'Backend',
      description: 'Versatile programming language for web, data, and automation',
      difficulty: 'beginner',
      industryDemand: 0.95,
      learningPath: ['Basics', 'OOP', 'Data Structures', 'Web Frameworks', 'Database', 'APIs'],
      tags: ['backend', 'data', 'language', 'beginner-friendly'],
    },
    {
      name: 'SQL',
      category: 'Database',
      description: 'Standard language for relational database management',
      difficulty: 'intermediate',
      industryDemand: 0.92,
      learningPath: ['Basic Queries', 'Joins', 'Aggregations', 'Subqueries', 'Optimization', 'Transactions'],
      tags: ['database', 'backend', 'essential'],
    },
    {
      name: 'PostgreSQL',
      category: 'Database',
      description: 'Advanced open-source relational database',
      difficulty: 'intermediate',
      industryDemand: 0.85,
      learningPath: ['Installation', 'Basic SQL', 'Advanced Queries', 'Indexing', 'Performance Tuning'],
      tags: ['database', 'sql', 'backend'],
    },
    {
      name: 'MongoDB',
      category: 'Database',
      description: 'NoSQL document database',
      difficulty: 'beginner',
      industryDemand: 0.80,
      learningPath: ['Installation', 'CRUD Operations', 'Schema Design', 'Aggregation', 'Indexing'],
      tags: ['database', 'nosql', 'backend'],
    },
    
    // DevOps Skills
    {
      name: 'Docker',
      category: 'DevOps',
      description: 'Container platform for developing and deploying applications',
      difficulty: 'intermediate',
      industryDemand: 0.88,
      learningPath: ['Containers Basics', 'Dockerfile', 'Images', 'Networking', 'Docker Compose', 'Orchestration'],
      tags: ['devops', 'containers', 'deployment'],
    },
    {
      name: 'AWS',
      category: 'Cloud',
      description: 'Amazon Web Services cloud computing platform',
      difficulty: 'advanced',
      industryDemand: 0.92,
      learningPath: ['EC2', 'S3', 'IAM', 'Lambda', 'RDS', 'CloudFormation'],
      tags: ['cloud', 'devops', 'infrastructure'],
    },
    {
      name: 'Git',
      category: 'Tools',
      description: 'Distributed version control system',
      difficulty: 'beginner',
      industryDemand: 0.99,
      learningPath: ['Basic Commands', 'Branching', 'Merging', 'Remote Repositories', 'Workflows'],
      tags: ['essential', 'tools', 'version-control'],
    },
    
    // Data Skills
    {
      name: 'Pandas',
      category: 'Data',
      description: 'Data manipulation and analysis library for Python',
      difficulty: 'intermediate',
      industryDemand: 0.85,
      learningPath: ['DataFrames', 'Reading Data', 'Data Cleaning', 'Transformation', 'Analysis'],
      tags: ['data', 'python', 'analytics'],
    },
    {
      name: 'Machine Learning',
      category: 'Data',
      description: 'Algorithms that improve through experience',
      difficulty: 'advanced',
      industryDemand: 0.88,
      learningPath: ['Statistics', 'Linear Algebra', 'Supervised Learning', 'Unsupervised Learning', 'Deep Learning'],
      tags: ['data', 'ai', 'advanced'],
    },
  ];

  for (const skillData of skills) {
    await SkillOntology.findOneAndUpdate(
      { name: skillData.name },
      {
        ...skillData,
        resources: [], // Can be populated later
      },
      { upsert: true, new: true }
    );
  }

  console.log('✅ Skill Ontology seeded successfully');
};

export const runSeeds = async (): Promise<void> => {
  try {
    await seedRoles();
    await seedSkillOntology();
    console.log('🌱 All seeds completed successfully');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    throw error;
  }
};
