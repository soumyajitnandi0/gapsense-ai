import axios from 'axios';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  industry?: string;
  location?: {
    country?: string;
    city?: string;
  };
  positions?: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }>;
  skills?: string[];
  educations?: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

interface LinkedInPost {
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

interface ProfileAnalysis {
  profile: LinkedInProfile | null;
  completeness: {
    score: number;
    hasHeadline: boolean;
    hasSummary: boolean;
    hasPhoto: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
    recommendations: string[];
  };
  strengths: string[];
  improvements: string[];
  keywordOptimization: {
    found: string[];
    missing: string[];
    suggestions: string[];
  };
  networkInsights?: {
    connections: number;
    followers: number;
  };
}

interface PostsAnalysis {
  posts: LinkedInPost[];
  totalPosts: number;
  averageEngagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  contentThemes: Array<{
    theme: string;
    count: number;
    percentage: number;
  }>;
  postingFrequency: {
    postsPerWeek: number;
    mostActiveDay: string;
    mostActiveTime: string;
  };
  bestPerformingPost?: LinkedInPost;
  contentSuggestions: string[];
  engagementTrend: 'increasing' | 'decreasing' | 'stable';
}

// Helper function to make LinkedIn API requests
async function linkedInRequest(accessToken: string, endpoint: string) {
  try {
    const response = await axios.get(`${LINKEDIN_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('LinkedIn API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Fetch user profile from LinkedIn
async function fetchLinkedInProfile(accessToken: string, linkedinId?: string): Promise<LinkedInProfile | null> {
  try {
    // Get basic profile using OpenID Connect userinfo endpoint
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const { sub, name, given_name, family_name, picture } = userInfoResponse.data;

    // Try to fetch additional profile data
    let profileData: any = {};
    try {
      // Fetch basic profile
      profileData = await linkedInRequest(accessToken, '/me?projection=(id,firstName,lastName,headline,industry,location)');
    } catch (e) {
      console.log('Could not fetch extended profile, using basic info');
    }

    // Try to fetch positions
    let positions: any[] = [];
    try {
      const positionsData = await linkedInRequest(
        accessToken,
        '/positions?count=50&projection=(elements:(company,title,startDate,endDate,summary,isCurrent))'
      );
      positions = positionsData.elements || [];
    } catch (e) {
      console.log('Could not fetch positions');
    }

    // Try to fetch skills
    let skills: string[] = [];
    try {
      const skillsData = await linkedInRequest(
        accessToken,
        '/skills?count=100&projection=(elements:(skill:(name)))'
      );
      skills = (skillsData.elements || []).map((s: any) => s.skill?.name).filter(Boolean);
    } catch (e) {
      console.log('Could not fetch skills');
    }

    return {
      id: sub || profileData.id,
      firstName: given_name || profileData.firstName?.localized?.en_US || name?.split(' ')[0] || '',
      lastName: family_name || profileData.lastName?.localized?.en_US || name?.split(' ').slice(1).join(' ') || '',
      headline: profileData.headline?.localized?.en_US || '',
      industry: profileData.industry || '',
      location: profileData.location?.name ? { country: profileData.location.name } : undefined,
      positions: positions.map((p: any) => ({
        title: p.title || '',
        company: p.company?.name || '',
        startDate: p.startDate ? `${p.startDate.year}-${p.startDate.month}` : undefined,
        endDate: p.endDate ? `${p.endDate.year}-${p.endDate.month}` : undefined,
        isCurrent: p.isCurrent || false,
        description: p.summary || '',
      })),
      skills,
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    return null;
  }
}

// Fetch user posts from LinkedIn
async function fetchLinkedInPosts(accessToken: string, linkedinId?: string, limit: number = 20): Promise<LinkedInPost[]> {
  try {
    // Note: LinkedIn's Posts API requires special permissions (w_member_social)
    // This is a simplified implementation that may need adjustment based on actual API responses
    const postsData = await linkedInRequest(
      accessToken,
      `/posts?author=urn:li:person:${linkedinId}&count=${limit}&sortBy=CREATED_TIME&projection=(elements:(id,content,created,visibility,engagement))`
    );

    return (postsData.elements || []).map((post: any) => ({
      id: post.id,
      author: post.author,
      content: post.content?.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
      createdAt: post.created?.time,
      engagement: {
        likes: post.engagement?.likes || 0,
        comments: post.engagement?.comments || 0,
        shares: post.engagement?.shares || 0,
      },
      visibility: post.visibility?.['com.linkedin.ugc.MemberNetworkVisibility'] || 'UNKNOWN',
    }));
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    // Return mock data for development/testing if API fails
    return getMockPosts();
  }
}

// Mock posts for testing when API is not available
function getMockPosts(): LinkedInPost[] {
  return [
    {
      id: 'mock-1',
      author: 'urn:li:person:mock',
      content: 'Just completed a challenging project on machine learning model optimization. The key was understanding the trade-offs between accuracy and inference speed. #MachineLearning #AI',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      engagement: { likes: 45, comments: 12, shares: 8 },
      visibility: 'PUBLIC',
    },
    {
      id: 'mock-2',
      author: 'urn:li:person:mock',
      content: 'Excited to share that I\'ve been promoted to Senior Software Engineer! Grateful for the mentorship and opportunities. Looking forward to new challenges ahead. #CareerGrowth #SoftwareEngineering',
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      engagement: { likes: 234, comments: 56, shares: 12 },
      visibility: 'PUBLIC',
    },
    {
      id: 'mock-3',
      author: 'urn:li:person:mock',
      content: 'Technical blog post: "Understanding React Server Components" - A deep dive into the future of React architecture. Link in comments! #React #WebDevelopment #Frontend',
      createdAt: new Date(Date.now() - 1209600000).toISOString(),
      engagement: { likes: 89, comments: 23, shares: 34 },
      visibility: 'PUBLIC',
    },
  ];
}

// Analyze LinkedIn profile
export async function analyzeLinkedInProfile(
  accessToken: string,
  linkedinId?: string
): Promise<ProfileAnalysis> {
  const profile = await fetchLinkedInProfile(accessToken, linkedinId);

  if (!profile) {
    return {
      profile: null,
      completeness: {
        score: 0,
        hasHeadline: false,
        hasSummary: false,
        hasPhoto: false,
        hasExperience: false,
        hasEducation: false,
        hasSkills: false,
        recommendations: ['Unable to fetch profile data. Please check your LinkedIn connection.'],
      },
      strengths: [],
      improvements: ['Connect your LinkedIn account to see analysis'],
      keywordOptimization: {
        found: [],
        missing: [],
        suggestions: [],
      },
    };
  }

  // Calculate completeness score
  const hasHeadline = !!profile.headline && profile.headline.length > 10;
  const hasSummary = !!profile.summary && profile.summary.length > 50;
  const hasPhoto = false; // Would need additional API call
  const hasExperience = profile.positions && profile.positions.length > 0;
  const hasEducation = profile.educations && profile.educations.length > 0;
  const hasSkills = profile.skills && profile.skills.length >= 5;

  const completenessScore = Math.round(
    ((hasHeadline ? 20 : 0) +
      (hasSummary ? 20 : 0) +
      (hasPhoto ? 15 : 0) +
      (hasExperience ? 20 : 0) +
      (hasEducation ? 10 : 0) +
      (hasSkills ? 15 : 0))
  );

  const recommendations: string[] = [];
  if (!hasHeadline) recommendations.push('Add a compelling headline that includes your key skills and value proposition');
  if (!hasSummary) recommendations.push('Write a detailed summary highlighting your achievements and career goals (min 50 words)');
  if (!hasExperience) recommendations.push('Add your work experience with detailed descriptions and achievements');
  if (!hasEducation) recommendations.push('Include your educational background');
  if (!hasSkills) recommendations.push('Add at least 5 relevant skills to your profile');

  // Identify strengths
  const strengths: string[] = [];
  if (hasHeadline && profile.headline!.length > 30) strengths.push('Strong headline with clear positioning');
  if (profile.positions && profile.positions.length >= 2) strengths.push('Diverse work experience');
  if (profile.skills && profile.skills.length >= 10) strengths.push('Comprehensive skill set listed');

  // Identify improvements
  const improvements: string[] = [];
  if (!hasSummary) improvements.push('Add a detailed summary section');
  if (profile.skills && profile.skills.length < 10) improvements.push('Expand your skills section to at least 10 relevant skills');
  if (!profile.positions?.some(p => p.description && p.description.length > 50)) {
    improvements.push('Add detailed descriptions to your work experience highlighting achievements');
  }

  // Keyword optimization analysis
  const techKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'aws', 'cloud', 'machine learning',
    'ai', 'data science', 'agile', 'scrum', 'leadership', 'management', 'strategy'
  ];
  
  const profileText = `${profile.headline || ''} ${profile.summary || ''} ${profile.positions?.map(p => `${p.title} ${p.description || ''}`).join(' ') || ''}`.toLowerCase();
  
  const foundKeywords = techKeywords.filter(kw => profileText.includes(kw.toLowerCase()));
  const missingKeywords = techKeywords.filter(kw => !profileText.includes(kw.toLowerCase()));

  const keywordSuggestions = [];
  if (foundKeywords.length < 5) {
    keywordSuggestions.push('Add more industry-relevant keywords to improve discoverability');
  }
  if (!foundKeywords.some(k => k.includes('leadership') || k.includes('management'))) {
    keywordSuggestions.push('Consider adding leadership-related keywords if applicable');
  }

  return {
    profile: {
      ...profile,
      summary: profile.summary || '',
    },
    completeness: {
      score: completenessScore,
      hasHeadline: !!hasHeadline,
      hasSummary: !!hasSummary,
      hasPhoto: !!hasPhoto,
      hasExperience: !!hasExperience,
      hasEducation: !!hasEducation,
      hasSkills: !!hasSkills,
      recommendations,
    },
    strengths,
    improvements,
    keywordOptimization: {
      found: foundKeywords,
      missing: missingKeywords.slice(0, 5),
      suggestions: keywordSuggestions,
    },
  };
}

// Analyze LinkedIn posts
export async function analyzeLinkedInPosts(
  accessToken: string,
  linkedinId?: string,
  limit: number = 20
): Promise<PostsAnalysis> {
  const posts = await fetchLinkedInPosts(accessToken, linkedinId, limit);

  if (posts.length === 0) {
    return {
      posts: [],
      totalPosts: 0,
      averageEngagement: { likes: 0, comments: 0, shares: 0 },
      contentThemes: [],
      postingFrequency: {
        postsPerWeek: 0,
        mostActiveDay: 'N/A',
        mostActiveTime: 'N/A',
      },
      contentSuggestions: [
        'Start posting regularly to build your professional brand',
        'Share insights about your industry and work',
        'Engage with others\' content to increase visibility',
      ],
      engagementTrend: 'stable',
    };
  }

  // Calculate average engagement
  const totalLikes = posts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.engagement?.comments || 0), 0);
  const totalShares = posts.reduce((sum, p) => sum + (p.engagement?.shares || 0), 0);

  const avgLikes = Math.round(totalLikes / posts.length);
  const avgComments = Math.round(totalComments / posts.length);
  const avgShares = Math.round(totalShares / posts.length);

  // Find best performing post
  const bestPost = posts.reduce((best, current) => {
    const bestScore = (best.engagement?.likes || 0) + (best.engagement?.comments || 0) * 2 + (best.engagement?.shares || 0) * 3;
    const currentScore = (current.engagement?.likes || 0) + (current.engagement?.comments || 0) * 2 + (current.engagement?.shares || 0) * 3;
    return currentScore > bestScore ? current : best;
  }, posts[0]);

  // Analyze content themes (simplified keyword-based)
  const contentThemes = analyzeContentThemes(posts);

  // Analyze posting frequency
  const dates = posts.map(p => new Date(p.createdAt)).sort((a, b) => a.getTime() - b.getTime());
  const dateRange = dates.length > 1 
    ? (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)
    : 1;
  const postsPerWeek = dateRange > 0 ? (posts.length / dateRange) * 7 : 0;

  // Determine engagement trend
  const firstHalf = posts.slice(0, Math.floor(posts.length / 2));
  const secondHalf = posts.slice(Math.floor(posts.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0) / (firstHalf.length || 1);
  const secondHalfAvg = secondHalf.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0) / (secondHalf.length || 1);
  
  let engagementTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (secondHalfAvg > firstHalfAvg * 1.2) engagementTrend = 'increasing';
  else if (secondHalfAvg < firstHalfAvg * 0.8) engagementTrend = 'decreasing';

  // Generate content suggestions
  const contentSuggestions = generateContentSuggestions(posts, contentThemes);

  return {
    posts: posts.slice(0, 10), // Return top 10 posts
    totalPosts: posts.length,
    averageEngagement: {
      likes: avgLikes,
      comments: avgComments,
      shares: avgShares,
    },
    contentThemes,
    postingFrequency: {
      postsPerWeek: Math.round(postsPerWeek * 10) / 10,
      mostActiveDay: getMostActiveDay(dates),
      mostActiveTime: getMostActiveTime(dates),
    },
    bestPerformingPost: bestPost,
    contentSuggestions,
    engagementTrend,
  };
}

// Helper function to analyze content themes
function analyzeContentThemes(posts: LinkedInPost[]): Array<{ theme: string; count: number; percentage: number }> {
  const themes: Record<string, number> = {};
  
  const themeKeywords: Record<string, string[]> = {
    'Career Growth': ['promotion', 'new role', 'career', 'job', 'hiring', 'opportunity'],
    'Technical': ['code', 'programming', 'development', 'software', 'tech', 'engineering'],
    'Industry Insights': ['industry', 'trends', 'market', 'analysis', 'research'],
    'Leadership': ['team', 'leadership', 'management', 'mentoring', 'guiding'],
    'Learning': ['learned', 'course', 'certification', 'skill', 'training'],
    'Personal Brand': ['grateful', 'excited', 'honored', 'proud', 'achievement'],
  };

  for (const post of posts) {
    const content = post.content.toLowerCase();
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(kw => content.includes(kw))) {
        themes[theme] = (themes[theme] || 0) + 1;
      }
    }
  }

  const total = Object.values(themes).reduce((a, b) => a + b, 0);
  
  return Object.entries(themes)
    .map(([theme, count]) => ({
      theme,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Helper function to get most active day
function getMostActiveDay(dates: Date[]): string {
  if (dates.length === 0) return 'N/A';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = new Array(7).fill(0);
  
  for (const date of dates) {
    dayCounts[date.getDay()]++;
  }
  
  const maxIndex = dayCounts.indexOf(Math.max(...dayCounts));
  return days[maxIndex];
}

// Helper function to get most active time
function getMostActiveTime(dates: Date[]): string {
  if (dates.length === 0) return 'N/A';
  
  const hourCounts = new Array(24).fill(0);
  
  for (const date of dates) {
    hourCounts[date.getHours()]++;
  }
  
  const maxIndex = hourCounts.indexOf(Math.max(...hourCounts));
  const hour = maxIndex % 12 || 12;
  const ampm = maxIndex < 12 ? 'AM' : 'PM';
  return `${hour}:00 ${ampm}`;
}

// Generate content suggestions based on analysis
function generateContentSuggestions(posts: LinkedInPost[], themes: Array<{ theme: string }>): string[] {
  const suggestions: string[] = [];
  
  const themeNames = themes.map(t => t.theme);
  
  if (!themeNames.includes('Technical')) {
    suggestions.push('Share technical insights and learnings from your projects');
  }
  
  if (!themeNames.includes('Industry Insights')) {
    suggestions.push('Post about industry trends and your perspective on them');
  }
  
  if (posts.length < 4) {
    suggestions.push('Increase posting frequency to at least once per week');
  }
  
  const avgEngagement = posts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0) / posts.length;
  if (avgEngagement < 20) {
    suggestions.push('Try posting at different times (9-11 AM or 1-3 PM tend to perform well)');
    suggestions.push('Use more engaging hooks in your posts\' first 2 lines');
  }
  
  suggestions.push('Include a call-to-action in your posts (e.g., "What do you think?" or "Share your experience")');
  suggestions.push('Use 3-5 relevant hashtags to increase reach');
  
  return suggestions.slice(0, 5);
}
