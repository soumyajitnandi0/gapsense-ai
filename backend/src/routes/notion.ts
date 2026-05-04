import { Router, Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import Assessment from '../models/Assessment';
import { authenticate, asyncHandler } from '../middleware';
import { exportRoadmapToNotion, exportInterviewPrepToNotion } from '../services/notionService';

const router = Router();

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || 'http://localhost:5000/api/notion/callback';

// Connect Notion - redirect to Notion OAuth
router.get(
  '/connect',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!NOTION_CLIENT_ID) {
      res.status(500).json({ error: 'Notion OAuth not configured' });
      return;
    }

    const state = Buffer.from(JSON.stringify({
      userId: (req.user as any)._id.toString(),
      timestamp: Date.now()
    })).toString('base64');

    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?` +
      `client_id=${NOTION_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(NOTION_REDIRECT_URI)}` +
      `&response_type=code` +
      `&owner=user` +
      `&state=${encodeURIComponent(state)}`;

    res.json({ url: notionAuthUrl });
  })
);

// Notion OAuth callback
router.get(
  '/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    if (error) {
      res.status(400).json({ error: 'Notion OAuth denied' });
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
        'https://api.notion.com/v1/oauth/token',
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: NOTION_REDIRECT_URI,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
          },
        }
      );

      const { access_token, workspace_id, workspace_name, bot_id } = tokenResponse.data;

      if (!access_token) {
        res.status(400).json({ error: 'Failed to obtain access token' });
        return;
      }

      // Update user with Notion credentials
      await User.findByIdAndUpdate(userId, {
        notionAccessToken: access_token,
        notionWorkspaceId: workspace_id,
        notionWorkspaceName: workspace_name,
        notionBotId: bot_id,
        notionConnectedAt: new Date(),
      });

      // Redirect back to frontend
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings?notion=connected`);
    } catch (error) {
      console.error('Notion OAuth Error:', error);
      res.status(500).json({ error: 'Notion authentication failed' });
    }
  })
);

// Disconnect Notion
router.delete(
  '/disconnect',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await User.findByIdAndUpdate((req.user as any)._id, {
      notionAccessToken: null,
      notionWorkspaceId: null,
      notionWorkspaceName: null,
      notionBotId: null,
      notionConnectedAt: null,
    });

    res.json({ message: 'Notion disconnected successfully' });
  })
);

// Get user's Notion connection status
router.get(
  '/status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+notionAccessToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      connected: !!user.notionAccessToken,
      workspaceName: user.notionWorkspaceName,
      workspaceId: user.notionWorkspaceId,
      connectedAt: user.notionConnectedAt,
    });
  })
);

// Export roadmap to Notion
router.post(
  '/export/roadmap/:assessmentId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+notionAccessToken');

    if (!user || !user.notionAccessToken) {
      res.status(401).json({ error: 'Notion not connected' });
      return;
    }

    const { assessmentId } = req.params;
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      userId: user._id,
    }).populate('roleId');

    if (!assessment || !assessment.roadmap) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }

    try {
      const result = await exportRoadmapToNotion(
        user.notionAccessToken,
        assessment,
        (assessment.roleId as any)?.name || 'Career Roadmap'
      );

      res.json({
        message: 'Roadmap exported to Notion successfully',
        pageUrl: result.url,
        pageId: result.pageId,
      });
    } catch (error) {
      console.error('Notion Export Error:', error);
      res.status(500).json({ error: 'Failed to export roadmap to Notion' });
    }
  })
);

// Export interview prep to Notion
router.post(
  '/export/interview-prep',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id).select('+notionAccessToken');

    if (!user || !user.notionAccessToken) {
      res.status(401).json({ error: 'Notion not connected' });
      return;
    }

    const { questions, roleName, difficulty } = req.body;

    if (!questions || !Array.isArray(questions)) {
      res.status(400).json({ error: 'Questions array required' });
      return;
    }

    try {
      const result = await exportInterviewPrepToNotion(
        user.notionAccessToken,
        questions,
        roleName || 'Interview Preparation',
        difficulty || 'medium'
      );

      res.json({
        message: 'Interview prep exported to Notion successfully',
        pageUrl: result.url,
        pageId: result.pageId,
      });
    } catch (error) {
      console.error('Notion Export Error:', error);
      res.status(500).json({ error: 'Failed to export interview prep to Notion' });
    }
  })
);

export default router;
