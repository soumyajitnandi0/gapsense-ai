import { Router, Request, Response } from 'express';
import Profile from '../models/Profile';
import Assessment from '../models/Assessment';
import Progress from '../models/Progress';
import Chat from '../models/Chat';
import { authenticate, asyncHandler } from '../middleware';

const router = Router();

// Export all user data (GDPR compliance)
router.get(
  '/data',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const userEmail = (req.user as any).email;

    const [profile, assessments, progress, chats] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Assessment.find({ userId }).lean(),
      Progress.find({ userId }).lean(),
      Chat.find({ userId }).select('-_id -userId').lean(),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        email: userEmail,
        id: userId.toString(),
      },
      profile: profile || null,
      assessments: assessments || [],
      progress: progress || [],
      chats: chats || [],
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gapsense-export-${userEmail}.json"`);
    res.json(exportData);
  })
);

// Export assessment as PDF (placeholder - returns JSON for now)
router.get(
  '/assessment/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId,
    }).populate('roleId');

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      assessment: {
        id: assessment._id,
        role: (assessment.roleId as any)?.name || 'Unknown',
        overallScore: assessment.overallScore,
        confidence: assessment.confidence,
        subScores: assessment.subScores,
        gaps: assessment.gaps,
        matchedSkills: assessment.matchedSkills,
        missingSkills: assessment.missingSkills,
        roadmap: assessment.roadmap,
        explanations: assessment.explanations,
        createdAt: assessment.createdAt,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="assessment-${assessment._id}.json"`);
    res.json(exportData);
  })
);

export default router;
