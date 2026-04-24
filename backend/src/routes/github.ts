import { Router, Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import Assessment from '../models/Assessment';
import Role from '../models/Role';
import { authenticate, asyncHandler } from '../middleware';
import { fetchUserRepos, analyzeRepositories } from '../services/githubService';
import { generateAISuggestions } from '../services/aiSuggestions';

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/github/callback';

// Connect GitHub - redirect to GitHub OAuth
router.get(
  '/connect',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!GITHUB_CLIENT_ID) {
      res.status(500).json({ error: 'GitHub OAuth not configured' });
      return;
    }

    const state = Buffer.from(JSON.stringify({
      userId: (req.user as any)._id.toString(),
      timestamp: Date.now()
    })).toString('base64');

    const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}` +
      `&scope=repo,user:read` +
      `&state=${encodeURIComponent(state)}`;

    res.json({ url: githubAuthUrl });
  })
);

// GitHub OAuth callback
router.get(
  '/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    if (error) {
      res.status(400).json({ error: 'GitHub OAuth denied' });
      return;
    }

    if (!code || !state) {
      res.status(400).json({ error: 'Missing authorization code' });
      return;
    }

    try {
      // Decode state to get userId
      const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      const { userId } = stateData;

      // Exchange code for access token
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        res.status(400).json({ error: 'Failed to obtain access token' });
        return;
      }

      // Fetch user data from GitHub
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });

      const { id: githubId, login: githubUsername } = userResponse.data;

      // Update user with GitHub credentials
      await User.findByIdAndUpdate(userId, {
        githubId: githubId.toString(),
        githubUsername,
        githubAccessToken: access_token,
        githubConnectedAt: new Date(),
      });

      // Redirect back to frontend
      res.redirect('http://localhost:3000/dashboard/settings?github=connected');
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      res.status(500).json({ error: 'GitHub authentication failed' });
    }
  })
);

// Disconnect GitHub
router.delete(
  '/disconnect',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await User.findByIdAndUpdate((req.user as any)._id, {
      githubId: null,
      githubUsername: null,
      githubAccessToken: null,
      githubConnectedAt: null,
    });

    res.json({ message: 'GitHub disconnected successfully' });
  })
);

// Get user's GitHub connection status
router.get(
  '/status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+githubAccessToken');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      connected: !!user.githubAccessToken,
      username: user.githubUsername,
      connectedAt: user.githubConnectedAt,
    });
  })
);

// Fetch and analyze user's repositories
router.get(
  '/repos',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+githubAccessToken');

    if (!user || !user.githubAccessToken) {
      res.status(401).json({ error: 'GitHub not connected' });
      return;
    }

    try {
      // Fetch repositories from GitHub
      const repos = await fetchUserRepos(user.githubAccessToken);
      console.log(`[GitHub] Fetched ${repos.length} repos for user ${user._id}`);
      
      // Analyze repositories
      const analysis = await analyzeRepositories(repos, user.githubAccessToken);
      console.log(`[GitHub] Analysis:`, JSON.stringify(analysis, null, 2));
      
      // Get user's target role from their latest assessment
      const assessment = await Assessment.findOne({ userId: user._id })
        .sort({ createdAt: -1 })
        .populate('roleId');
      
      const targetRole = assessment?.roleId as any;
      console.log(`[GitHub] Target role:`, targetRole ? targetRole.title : 'None');
      
      // Generate AI-powered dynamic suggestions
      console.log(`[GitHub] Generating AI suggestions...`);
      const suggestions = await generateAISuggestions(analysis, targetRole, user.githubUsername || undefined);
      console.log(`[GitHub] Generated ${suggestions.length} AI suggestions`);

      res.json({
        repos: repos.slice(0, 10), // Return top 10 repos
        stats: analysis,
        suggestions,
        targetRole: targetRole ? {
          title: targetRole.title,
          skills: targetRole.requiredSkills?.map((s: any) => s.name) || []
        } : null,
      });
    } catch (error) {
      console.error('GitHub API Error:', error);
      res.status(500).json({ error: 'Failed to fetch GitHub repositories' });
    }
  })
);

export default router;
