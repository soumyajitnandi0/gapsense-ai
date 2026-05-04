import api from './api';

export interface LinkedInStatus {
  connected: boolean;
  linkedinId?: string;
  connectedAt?: string;
}

export interface LinkedInConnectResponse {
  url: string;
}

export interface ProfileCompleteness {
  score: number;
  hasHeadline: boolean;
  hasSummary: boolean;
  hasPhoto: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  recommendations: string[];
}

export interface KeywordOptimization {
  found: string[];
  missing: string[];
  suggestions: string[];
}

export interface LinkedInProfileAnalysis {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    headline?: string;
    industry?: string;
    skills?: string[];
    positions?: Array<{
      title: string;
      company: string;
      startDate?: string;
      endDate?: string;
      isCurrent: boolean;
      description?: string;
    }>;
  } | null;
  completeness: ProfileCompleteness;
  strengths: string[];
  improvements: string[];
  keywordOptimization: KeywordOptimization;
}

export interface LinkedInPost {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  visibility: string;
}

export interface ContentTheme {
  theme: string;
  count: number;
  percentage: number;
}

export interface PostingFrequency {
  postsPerWeek: number;
  mostActiveDay: string;
  mostActiveTime: string;
}

export interface LinkedInPostsAnalysis {
  posts: LinkedInPost[];
  totalPosts: number;
  averageEngagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  contentThemes: ContentTheme[];
  postingFrequency: PostingFrequency;
  bestPerformingPost?: LinkedInPost;
  contentSuggestions: string[];
  engagementTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface LinkedInFullAnalysis {
  profile: LinkedInProfileAnalysis;
  posts: LinkedInPostsAnalysis;
  generatedAt: string;
}

// Get LinkedIn connection status
export const getLinkedInStatus = async (): Promise<LinkedInStatus> => {
  const response = await api.get('/linkedin/status');
  return response.data;
};

// Get LinkedIn OAuth connection URL
export const connectLinkedIn = async (): Promise<LinkedInConnectResponse> => {
  const response = await api.get('/linkedin/connect');
  return response.data;
};

// Disconnect LinkedIn
export const disconnectLinkedIn = async (): Promise<{ message: string }> => {
  const response = await api.delete('/linkedin/disconnect');
  return response.data;
};

// Get LinkedIn profile analysis
export const getLinkedInProfileAnalysis = async (): Promise<LinkedInProfileAnalysis> => {
  const response = await api.get('/linkedin/profile/analysis');
  return response.data;
};

// Get LinkedIn posts analysis
export const getLinkedInPostsAnalysis = async (limit?: number): Promise<LinkedInPostsAnalysis> => {
  const response = await api.get('/linkedin/posts/analysis', {
    params: limit ? { limit } : undefined,
  });
  return response.data;
};

// Get comprehensive LinkedIn analysis (profile + posts)
export const getLinkedInFullAnalysis = async (): Promise<LinkedInFullAnalysis> => {
  const response = await api.get('/linkedin/analysis');
  return response.data;
};

// Open LinkedIn OAuth popup
export const openLinkedInAuthPopup = (authUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'LinkedIn OAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );

    if (!popup) {
      resolve(false);
      return;
    }

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        resolve(true);
      }
    }, 1000);

    // Listen for OAuth completion message
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'linkedin:connected') {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', handleMessage);
        resolve(true);
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      window.removeEventListener('message', handleMessage);
      popup.close();
      resolve(false);
    }, 300000);
  });
};

// Generate AI-powered content suggestions based on analysis
export const generateContentSuggestions = (analysis: LinkedInFullAnalysis): string[] => {
  const suggestions: string[] = [];

  // Profile-based suggestions
  if (analysis.profile.completeness.score < 80) {
    suggestions.push('Complete your LinkedIn profile to increase visibility by up to 30%');
  }

  if (analysis.profile.keywordOptimization.found.length < 5) {
    suggestions.push('Add more industry keywords to your headline and summary for better searchability');
  }

  // Posts-based suggestions
  if (analysis.posts.postingFrequency.postsPerWeek < 1) {
    suggestions.push('Post at least once per week to maintain visibility and engagement');
  }

  if (analysis.posts.averageEngagement.likes < 10) {
    suggestions.push('Engage with others\' content 15 minutes before posting to boost your reach');
  }

  if (!analysis.posts.contentThemes.some(t => t.theme === 'Technical')) {
    suggestions.push('Share technical insights and learnings to establish thought leadership');
  }

  if (analysis.posts.engagementTrend === 'decreasing') {
    suggestions.push('Try posting at different times - mornings (9-11 AM) typically perform better');
  }

  // Always add these
  suggestions.push('Include 3-5 relevant hashtags to increase discoverability');
  suggestions.push('Ask questions in your posts to encourage comments and discussion');
  suggestions.push('Use the first 2 lines as a hook - they\'re visible before "see more"');

  return suggestions.slice(0, 5);
};

// Calculate profile strength score (0-100)
export const calculateProfileStrength = (analysis: LinkedInProfileAnalysis): number => {
  return analysis.completeness.score;
};

// Get improvement priority list
export const getImprovementPriority = (analysis: LinkedInProfileAnalysis): string[] => {
  const priority: string[] = [];
  const c = analysis.completeness;

  if (!c.hasHeadline) priority.push('Add a compelling headline');
  if (!c.hasSummary) priority.push('Write a detailed summary');
  if (!c.hasExperience) priority.push('Add your work experience');
  if (!c.hasSkills) priority.push('List your skills (aim for 10+)');
  if (!c.hasEducation) priority.push('Include your education');
  if (!c.hasPhoto) priority.push('Add a professional photo');

  return priority;
};
