import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Chat from '../models/Chat';
import { authenticate, asyncHandler } from '../middleware';
import { generateCoachResponse, generateMockInterviewQuestions, evaluateInterviewAnswer, generateResumeFeedback } from '../services';

const router = Router();

// Get user's chat sessions
router.get(
  '/sessions',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const sessions = await Chat.find({ userId: (req.user as any)._id })
      .select('sessionId context updatedAt createdAt')
      .sort({ updatedAt: -1 });

    res.json({ sessions });
  })
);

// Get or create active session
router.get(
  '/session',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    let session = await Chat.findOne({
      userId: (req.user as any)._id,
      isActive: true,
    }).sort({ updatedAt: -1 });

    if (!session) {
      session = new Chat({
        userId: (req.user as any)._id,
        sessionId: uuidv4(),
        messages: [],
        context: {},
        isActive: true,
      });
      await session.save();
    }

    res.json({ session });
  })
);

// Get specific session messages
router.get(
  '/session/:sessionId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const session = await Chat.findOne({
      sessionId: req.params.sessionId,
      userId: (req.user as any)._id,
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ session });
  })
);

// Send message
router.post(
  '/message',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { message, sessionId, context } = req.body;

    let chatSession;

    if (sessionId) {
      chatSession = await Chat.findOne({
        sessionId,
        userId: (req.user as any)._id,
      });
    }

    if (!chatSession) {
      chatSession = new Chat({
        userId: (req.user as any)._id,
        sessionId: uuidv4(),
        messages: [],
        context: context || {},
        isActive: true,
      });
    }

    // Update context if provided
    if (context) {
      chatSession.context = { ...chatSession.context, ...context };
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Generate coach response
    const response = await generateCoachResponse(message, {
      userId: (req.user as any)._id.toString(),
      sessionId: chatSession.sessionId,
      currentRoleId: chatSession.context?.currentRoleId?.toString(),
      currentAssessmentId: chatSession.context?.currentAssessmentId?.toString(),
    });

    // Add assistant message
    chatSession.messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      metadata: {
        type: response.type,
        score: response.score,
        resources: response.resources,
      },
    });

    await chatSession.save();

    res.json({
      message: response.message,
      sessionId: chatSession.sessionId,
      type: response.type,
      resources: response.resources,
      actionItems: response.actionItems,
    });
  })
);

// Generate mock interview questions
router.post(
  '/mock-interview/questions',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { roleId, difficulty = 'medium', count = 5 } = req.body;

    const questions = await generateMockInterviewQuestions(roleId, difficulty, count);

    res.json({ questions });
  })
);

// Evaluate interview answer
router.post(
  '/mock-interview/evaluate',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { question, answer, type } = req.body;

    const evaluation = await evaluateInterviewAnswer(question, answer, type);

    res.json({ evaluation });
  })
);

// Get resume feedback
router.post(
  '/resume-feedback',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { resumeText, targetRole } = req.body;

    const feedback = await generateResumeFeedback(resumeText, targetRole);

    res.json({ feedback });
  })
);

// Clear chat history
router.delete(
  '/session/:sessionId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await Chat.findOneAndDelete({
      sessionId: req.params.sessionId,
      userId: (req.user as any)._id,
    });

    res.json({ message: 'Chat session cleared' });
  })
);

export default router;
