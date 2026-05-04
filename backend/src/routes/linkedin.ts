import { Router, Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import { authenticate, asyncHandler } from '../middleware';
import { analyzeLinkedInProfile, analyzeLinkedInPosts } from '../services/linkedinService';

const router = Router();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5000/api/linkedin/callback';

// Required LinkedIn OAuth scopes
const LINKEDIN_SCOPES = [
  'openid',
  'profile',
  'w_member_social',
  'r_basicprofile',
  'r_organization_social',
].join(' ');

// Connect LinkedIn - redirect to LinkedIn OAuth
router.get(
  '/connect',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!LINKEDIN_CLIENT_ID) {
      res.status(500).json({ error: 'LinkedIn OAuth not configured' });
      return;
    }

    const state = Buffer.from(JSON.stringify({
      userId: (req.user as any)._id.toString(),
      timestamp: Date.now()
    })).toString('base64');

    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code` +
      `&client_id=${LINKEDIN_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}` +
      `&state=${encodeURIComponent(state)}` +
      `&scope=${encodeURIComponent(LINKEDIN_SCOPES)}`;

    res.json({ url: linkedinAuthUrl });
  })
);

// LinkedIn OAuth callback
router.get(
  '/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error('LinkedIn OAuth Error:', error_description);
      res.status(400).json({ error: error_description || 'LinkedIn OAuth denied' });
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
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
            redirect_uri: LINKEDIN_REDIRECT_URI,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      if (!access_token) {
        res.status(400).json({ error: 'Failed to obtain access token' });
        return;
      }

      // Fetch user profile from LinkedIn
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      const { sub: linkedinId, name, email, picture } = profileResponse.data;

      // Update user with LinkedIn credentials
      await User.findByIdAndUpdate(userId, {
        linkedinAccessToken: access_token,
        linkedinRefreshToken: refresh_token || null,
        linkedinId: linkedinId,
        linkedinConnectedAt: new Date(),
      });

      // Redirect back to frontend
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings?linkedin=connected`);
    } catch (error: any) {
      console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'LinkedIn authentication failed' });
    }
  })
);

// Disconnect LinkedIn
router.delete(
  '/disconnect',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await User.findByIdAndUpdate((req.user as any)._id, {
      linkedinAccessToken: null,
      linkedinRefreshToken: null,
      linkedinId: null,
      linkedinConnectedAt: null,
    });

    res.json({ message: 'LinkedIn disconnected successfully' });
  })
);

// Get user's LinkedIn connection status
router.get(
  '/status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+linkedinAccessToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      connected: !!user.linkedinAccessToken,
      linkedinId: user.linkedinId,
      connectedAt: user.linkedinConnectedAt,
    });
  })
);

// Get LinkedIn profile analysis
router.get(
  '/profile/analysis',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+linkedinAccessToken');

    if (!user || !user.linkedinAccessToken) {
      res.status(401).json({ error: 'LinkedIn not connected' });
      return;
    }

    try {
      const analysis = await analyzeLinkedInProfile(user.linkedinAccessToken, user.linkedinId || undefined);

      res.json(analysis);
    } catch (error) {
      console.error('LinkedIn Profile Analysis Error:', error);
      res.status(500).json({ error: 'Failed to analyze LinkedIn profile' });
    }
  })
);

// Get LinkedIn posts analysis
router.get(
  '/posts/analysis',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+linkedinAccessToken');

    if (!user || !user.linkedinAccessToken) {
      res.status(401).json({ error: 'LinkedIn not connected' });
      return;
    }

    const { limit = '20' } = req.query;

    try {
      const analysis = await analyzeLinkedInPosts(
        user.linkedinAccessToken,
        user.linkedinId || undefined,
        parseInt(limit as string, 10)
      );

      res.json(analysis);
    } catch (error) {
      console.error('LinkedIn Posts Analysis Error:', error);
      res.status(500).json({ error: 'Failed to analyze LinkedIn posts' });
    }
  })
);

// Get comprehensive LinkedIn analysis
router.get(
  '/analysis',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+linkedinAccessToken');

    if (!user || !user.linkedinAccessToken) {
      res.status(401).json({ error: 'LinkedIn not connected' });
      return;
    }

    try {
      const [profileAnalysis, postsAnalysis] = await Promise.all([
        analyzeLinkedInProfile(user.linkedinAccessToken, user.linkedinId || undefined),
        analyzeLinkedInPosts(user.linkedinAccessToken, user.linkedinId || undefined, 20),
      ]);

      res.json({
        profile: profileAnalysis,
        posts: postsAnalysis,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('LinkedIn Analysis Error:', error);
      res.status(500).json({ error: 'Failed to analyze LinkedIn data' });
    }
  })
);

export default router;
