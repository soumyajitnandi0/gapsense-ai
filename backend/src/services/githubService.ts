import axios from 'axios';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  topics: string[];
  private: boolean;
  fork: boolean;
  archived: boolean;
}

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

interface Suggestion {
  category: 'improvement' | 'portfolio' | 'learning' | 'contribution';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

export async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 5) { // Limit to 5 pages (150 repos max)
    const response = await axios.get(
      `https://api.github.com/user/repos`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          per_page: 30,
          page,
          sort: 'updated',
          direction: 'desc',
        },
      }
    );

    const pageRepos = response.data as GitHubRepo[];
    repos.push(...pageRepos);

    if (pageRepos.length < 30) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return repos;
}

export async function fetchRepoLanguages(accessToken: string, owner: string, repo: string): Promise<Record<string, number>> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch languages for ${repo}:`, error);
    return {};
  }
}

export async function analyzeRepositories(repos: GitHubRepo[], accessToken: string): Promise<RepoAnalysis> {
  const languages: Record<string, number> = {};
  const topics: Record<string, number> = {};
  let totalStars = 0;
  let totalForks = 0;

  const repoTypes = {
    original: 0,
    forked: 0,
    archived: 0,
  };

  const activity = {
    recentlyActive: 0,
    stale: 0,
  };

  const complexity = {
    large: 0,
    medium: 0,
    small: 0,
  };

  const now = new Date();
  const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

  // Analyze each repository
  for (const repo of repos) {
    // Count stars and forks
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;

    // Categorize by type
    if (repo.archived) {
      repoTypes.archived++;
    } else if (repo.fork) {
      repoTypes.forked++;
    } else {
      repoTypes.original++;
    }

    // Activity analysis
    const lastPush = repo.pushed_at ? new Date(repo.pushed_at) : null;
    if (lastPush && lastPush > sixMonthsAgo) {
      activity.recentlyActive++;
    } else {
      activity.stale++;
    }

    // Complexity by size
    if (repo.size > 10000) {
      complexity.large++;
    } else if (repo.size > 1000) {
      complexity.medium++;
    } else {
      complexity.small++;
    }

    // Aggregate main language
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }

    // Aggregate topics
    if (repo.topics) {
      for (const topic of repo.topics) {
        topics[topic] = (topics[topic] || 0) + 1;
      }
    }
  }

  // Get top topics
  const sortedTopics = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic]) => topic);

  return {
    languages,
    totalRepos: repos.length,
    totalStars,
    totalForks,
    topTopics: sortedTopics,
    repoTypes,
    activity,
    complexity,
  };
}

interface TargetRole {
  title: string;
  requiredSkills?: Array<{ name: string }>;
  description?: string;
}

export function generateSuggestions(analysis: RepoAnalysis, targetRole?: TargetRole | null): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Get user's tech stack from repos
  const userLanguages = Object.keys(analysis.languages);
  const roleSkills = targetRole?.requiredSkills?.map(s => s.name.toLowerCase()) || [];
  
  // Check for missing role skills
  if (roleSkills.length > 0) {
    const userTechStack = userLanguages.map(l => l.toLowerCase());
    const missingSkills = roleSkills.filter(skill => 
      !userTechStack.some(tech => tech.includes(skill) || skill.includes(tech))
    );
    
    if (missingSkills.length > 0) {
      suggestions.push({
        category: 'learning',
        title: `Learn ${missingSkills.slice(0, 3).join(', ')} for ${targetRole?.title}`,
        description: `Your target role requires: ${roleSkills.slice(0, 5).join(', ')}. You haven't demonstrated ${missingSkills.slice(0, 3).join(', ')} in your repositories yet.`,
        priority: 'high',
        action: `Build a project using ${missingSkills[0]} to strengthen your profile for ${targetRole?.title} roles.`,
      });
    }
  }

  // Portfolio improvement suggestions
  if (analysis.totalRepos < 5) {
    suggestions.push({
      category: 'portfolio',
      title: targetRole ? `Build Projects for ${targetRole.title}` : 'Build More Projects',
      description: targetRole 
        ? `You have fewer than 5 repositories. For ${targetRole.title} roles, aim to showcase projects using ${roleSkills.slice(0, 3).join(', ') || 'relevant technologies'}.`
        : 'You have fewer than 5 repositories. Consider building more projects to showcase your skills.',
      priority: 'high',
      action: targetRole 
        ? `Create 2-3 projects demonstrating ${targetRole.title} skills like ${roleSkills.slice(0, 3).join(', ') || 'core technologies'}.`
        : 'Create 2-3 new projects that demonstrate different skills or technologies.',
    });
  }

  if (analysis.activity.stale > analysis.activity.recentlyActive) {
    suggestions.push({
      category: 'improvement',
      title: 'Update Stale Repositories',
      description: `You have ${analysis.activity.stale} repositories that haven't been updated in 6+ months. Active projects signal to recruiters that you're continuously improving.`,
      priority: 'medium',
      action: 'Update READMEs, fix dependencies, or add new features to show active maintenance.',
    });
  }

  if (analysis.repoTypes.forked > analysis.repoTypes.original) {
    suggestions.push({
      category: 'portfolio',
      title: 'Create More Original Projects',
      description: `${Math.round((analysis.repoTypes.forked / analysis.totalRepos) * 100)}% of your repos are forks. Original projects better demonstrate your problem-solving abilities to hiring managers.`,
      priority: 'high',
      action: targetRole 
        ? `Build an original ${targetRole.title}-focused project from scratch to showcase your architecture skills.`
        : 'Transform forked projects into original work or build new projects from scratch.',
    });
  }

  // Documentation suggestions
  if (analysis.totalStars < 10) {
    suggestions.push({
      category: 'improvement',
      title: 'Improve Project Documentation',
      description: 'Your projects have low visibility. Well-documented projects with clear READMEs attract more attention from recruiters and hiring managers.',
      priority: 'medium',
      action: 'Add comprehensive READMEs with project demos, architecture diagrams, and setup instructions.',
    });
  }

  // Role-specific language suggestions
  if (targetRole && roleSkills.length > 0) {
    const userTechStack = userLanguages.map(l => l.toLowerCase());
    const hasRelevantTech = roleSkills.some(skill => 
      userTechStack.some(tech => tech.includes(skill) || skill.includes(tech))
    );
    
    if (!hasRelevantTech) {
      suggestions.push({
        category: 'learning',
        title: `Switch to ${targetRole.title} Tech Stack`,
        description: `Your current stack (${userLanguages.slice(0, 3).join(', ')}) doesn't align with ${targetRole.title} requirements (${roleSkills.slice(0, 3).join(', ')}).`,
        priority: 'high',
        action: `Start learning ${roleSkills.slice(0, 2).join(' and ')} and rebuild one of your projects using these technologies.`,
      });
    }
  } else if (Object.keys(analysis.languages).length < 3) {
    // Generic language diversity suggestion
    suggestions.push({
      category: 'learning',
      title: 'Expand Your Tech Stack',
      description: `You primarily use ${Object.keys(analysis.languages).length} language(s). Learning new technologies can open more opportunities.`,
      priority: 'medium',
      action: 'Try building a project in a new language or framework to diversify your skills.',
    });
  }

  // Contribution suggestions
  if (analysis.totalStars < 50) {
    suggestions.push({
      category: 'contribution',
      title: 'Contribute to Open Source',
      description: 'Contributing to popular open-source projects can boost your visibility and demonstrate collaboration skills that hiring managers value.',
      priority: 'low',
      action: targetRole 
        ? `Find ${targetRole.title}-related open source projects and contribute.`
        : 'Find projects in your tech stack and start with small issues or documentation improvements.',
    });
  }

  // Complexity balance
  if (analysis.complexity.small > analysis.complexity.medium + analysis.complexity.large) {
    suggestions.push({
      category: 'portfolio',
      title: targetRole ? `Build Production-Ready ${targetRole.title} Projects` : 'Build Larger Projects',
      description: `${Math.round((analysis.complexity.small / analysis.totalRepos) * 100)}% of your projects are small. ${targetRole ? `${targetRole.title} roles` : 'Hiring managers'} value seeing complex, production-ready applications.`,
      priority: 'medium',
      action: targetRole 
        ? `Create a full-stack ${targetRole.title} application with authentication, database, and deployment.`
        : 'Create a full-stack application with multiple features, authentication, and database integration.',
    });
  }

  // High performer suggestions
  if (analysis.totalStars >= 50 && analysis.repoTypes.original >= 5) {
    suggestions.push({
      category: 'improvement',
      title: 'Maintain Your Success',
      description: targetRole 
        ? `Excellent portfolio for ${targetRole.title}! Keep your projects updated and consider mentoring others.`
        : 'You have a strong portfolio! Keep your popular projects updated and engage with your community.',
      priority: 'low',
      action: 'Respond to issues, review PRs, and continue building your personal brand.',
    });
  }

  return suggestions;
}

export async function getRepoDetails(accessToken: string, owner: string, repo: string) {
  try {
    const [repoData, languages, readme] = await Promise.all([
      axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Authorization: `token ${accessToken}` },
      }),
      fetchRepoLanguages(accessToken, owner, repo),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: { 
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3.raw',
        },
      }).catch(() => ({ data: null })),
    ]);

    return {
      ...repoData.data,
      languages,
      hasReadme: !!readme.data,
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${repo}:`, error);
    return null;
  }
}
