import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import Profile from '../models/Profile';
import Role from '../models/Role';
import Assessment from '../models/Assessment';
import Progress from '../models/Progress';
import { authenticate, asyncHandler } from '../middleware';
import { computeReadinessScore, generateRoadmap } from '../services';

const router = Router();

// Get all user assessments
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const assessments = await Assessment.find({ userId })
      .populate('roleId', 'name category')
      .sort({ createdAt: -1 });
    
    res.json({ assessments });
  })
);

// Get latest assessment
router.get(
  '/latest',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const assessment = await Assessment.findOne({ userId })
      .populate('roleId')
      .sort({ createdAt: -1 });
    
    if (!assessment) {
      res.status(404).json({ error: 'No assessment found' });
      return;
    }

    res.json({ assessment });
  })
);

// Get assessment by ID
router.get(
  '/:id',
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

    res.json({ assessment });
  })
);

// Create new assessment
router.post(
  '/',
  authenticate,
  [
    body('roleId').notEmpty().withMessage('Role ID is required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { roleId, customRequirements } = req.body;

    // Get user profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      res.status(400).json({ error: 'Please create a profile first' });
      return;
    }

    // Get role
    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    // Use custom requirements if provided, otherwise use role requirements
    const requiredSkills = customRequirements || role.skills;

    // Compute readiness score
    const scoringResult = await computeReadinessScore({
      userSkills: profile.parsedData.skills,
      userProjects: profile.parsedData.projects,
      userExperience: profile.parsedData.experience,
      requiredSkills,
      resumeText: profile.resumeText,
      targetRole: role.name,
    });

    // Generate roadmap
    const roadmapInput = {
      gaps: scoringResult.gaps,
      currentSkills: profile.parsedData.skills.map(s => s.name),
      targetRole: role.name,
      durationDays: 60,
    };
    const roadmap = await generateRoadmap(roadmapInput);

    // Create assessment
    const assessment = new Assessment({
      userId,
      roleId: role._id,
      overallScore: scoringResult.overallScore,
      maxScore: 100,
      confidence: scoringResult.confidence,
      subScores: scoringResult.subScores,
      gaps: scoringResult.gaps,
      matchedSkills: scoringResult.matchedSkills,
      missingSkills: scoringResult.missingSkills,
      roadmap: {
        duration: roadmap.duration,
        milestones: roadmap.milestones,
        projectSuggestions: roadmap.projectSuggestions,
        targetCompletionDate: roadmap.targetCompletionDate,
      },
      explanations: scoringResult.explanations,
    });

    await assessment.save();

    // Create progress tracking entry
    await Progress.findOneAndUpdate(
      { userId, assessmentId: assessment._id },
      {
        userId: (req.user as any)._id,
        assessmentId: assessment._id,
        roadmapId: assessment._id.toString(),
        completedTasks: [],
        progressPercentage: 0,
        estimatedDaysRemaining: roadmap.duration,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      assessment: await assessment.populate('roleId'),
      roadmap,
    });
  })
);

// Re-assess (update based on profile changes)
router.post(
  '/:id/reassess',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const existingAssessment = await Assessment.findOne({
      _id: req.params.id,
      userId,
    });

    if (!existingAssessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    // Get updated profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      res.status(400).json({ error: 'Profile not found' });
      return;
    }

    // Get role
    const role = await Role.findById(existingAssessment.roleId);
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    // Re-compute score
    const scoringResult = await computeReadinessScore({
      userSkills: profile.parsedData.skills,
      userProjects: profile.parsedData.projects,
      userExperience: profile.parsedData.experience,
      requiredSkills: role.skills,
      resumeText: profile.resumeText,
      targetRole: role.name,
    });

    // Update assessment
    existingAssessment.overallScore = scoringResult.overallScore;
    existingAssessment.confidence = scoringResult.confidence;
    existingAssessment.subScores = scoringResult.subScores;
    existingAssessment.gaps = scoringResult.gaps;
    existingAssessment.matchedSkills = scoringResult.matchedSkills;
    existingAssessment.missingSkills = scoringResult.missingSkills;
    existingAssessment.explanations = scoringResult.explanations;
    existingAssessment.version = (existingAssessment.version || 1) + 1;

    await existingAssessment.save();

    res.json({
      assessment: await existingAssessment.populate('roleId'),
    });
  })
);

// Delete assessment
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const result = await Assessment.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!result) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    // Also delete associated progress
    await Progress.deleteMany({ assessmentId: req.params.id });

    res.json({ message: 'Assessment deleted successfully' });
  })
);

export default router;
