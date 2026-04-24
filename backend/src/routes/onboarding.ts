import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import Profile from '../models/Profile';
import Assessment from '../models/Assessment';
import Progress from '../models/Progress';
import Role from '../models/Role';
import { authenticate, asyncHandler } from '../middleware';
import { computeReadinessScore, generateRoadmap, parseResume } from '../services';

const router = Router();

// Get onboarding status
router.get(
  '/status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    
    const user = await User.findById(userId);
    const profile = await Profile.findOne({ userId });
    const assessment = await Assessment.findOne({ userId }).sort({ createdAt: -1 });
    const progress = await Progress.findOne({ userId }).sort({ createdAt: -1 });

    const steps = {
      accountCreated: !!user,
      profileCompleted: !!profile && profile.parsedData.skills.length > 0,
      targetRoleSelected: !!profile && profile.targetRoles.length > 0,
      assessmentCompleted: !!assessment,
      roadmapGenerated: !!assessment && !!assessment.roadmap,
    };

    const completedSteps = Object.values(steps).filter(Boolean).length;
    const totalSteps = Object.keys(steps).length;
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    res.json({
      steps,
      percentage,
      isComplete: percentage === 100,
      canProceed: {
        toRoleSelection: steps.profileCompleted,
        toAssessment: steps.targetRoleSelected,
        toDashboard: steps.roadmapGenerated,
      },
    });
  })
);

// Step 1: Upload resume and create profile
router.post(
  '/step1',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    
    // Check if user already has a profile
    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      // Create empty profile placeholder
      profile = new Profile({
        userId,
        parsedData: {
          skills: [],
          projects: [],
          education: [],
          experience: [],
        },
        targetRoles: [],
        preferences: {
          companySize: 'any',
          location: [],
          remote: true,
          notifications: {
            emailNotifications: true,
            assessmentReminders: true,
            weeklyDigest: false,
          },
        },
      });
      await profile.save();
    }

    res.json({
      message: 'Step 1 completed - Profile initialized',
      profile: {
        id: profile._id,
        hasResume: !!profile.resumeText,
        skillsCount: profile.parsedData.skills.length,
      },
    });
  })
);

// Step 2: Set target role
router.post(
  '/step2',
  authenticate,
  [
    body('roleId').optional(),
    body('jdText').optional().trim(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { roleId, jdText } = req.body;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      res.status(400).json({ error: 'Please complete step 1 first' });
      return;
    }

    let activeRoleId = roleId;
    let roleName = '';

    // If JD text provided, create custom role
    if (jdText && !roleId) {
      const roleRes = await Role.create({
        name: 'Custom Role from JD',
        category: 'custom',
        description: 'Custom role created from job description',
        skills: [], // Would be extracted from JD
        requirements: [jdText],
        salary: { min: 0, max: 0, currency: 'USD' },
        level: 'mid',
        source: 'user_jd',
      });
      activeRoleId = roleRes._id;
      roleName = roleRes.name;
    } else if (roleId) {
      const role = await Role.findById(roleId);
      if (role) {
        roleName = role.name;
      }
    }

    if (!activeRoleId) {
      res.status(400).json({ error: 'Please select a role or provide a job description' });
      return;
    }

    // Update profile with target role
    profile.targetRoles = [activeRoleId.toString()];
    await profile.save();

    res.json({
      message: 'Step 2 completed - Target role set',
      roleId: activeRoleId,
      roleName,
    });
  })
);

// Step 3: Run assessment and generate roadmap
router.post(
  '/step3',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;

    const profile = await Profile.findOne({ userId });
    if (!profile || profile.targetRoles.length === 0) {
      res.status(400).json({ error: 'Please complete step 2 first' });
      return;
    }

    const roleId = profile.targetRoles[0];
    const role = await Role.findById(roleId);
    
    if (!role) {
      res.status(404).json({ error: 'Target role not found' });
      return;
    }

    // Compute readiness score
    const scoringResult = await computeReadinessScore({
      userSkills: profile.parsedData.skills,
      userProjects: profile.parsedData.projects,
      userExperience: profile.parsedData.experience,
      requiredSkills: role.skills,
      resumeText: profile.resumeText || '',
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
    const progress = await Progress.findOneAndUpdate(
      { userId, assessmentId: assessment._id },
      {
        userId,
        assessmentId: assessment._id,
        roadmapId: assessment._id.toString(),
        completedTasks: [],
        completedProjects: [],
        completedSkills: [],
        progressPercentage: 0,
        estimatedDaysRemaining: roadmap.duration,
        streakDays: 0,
        lastActivityDate: new Date(),
        history: [],
      },
      { upsert: true, new: true }
    );

    // Mark onboarding complete
    await User.findByIdAndUpdate(userId, { 
      $set: { onboardingComplete: true }
    });

    res.json({
      message: 'Step 3 completed - Assessment created and roadmap generated',
      assessment: {
        id: assessment._id,
        overallScore: assessment.overallScore,
        roleName: role.name,
      },
      roadmap: {
        duration: roadmap.duration,
        milestonesCount: roadmap.milestones.length,
      },
      progress: {
        id: progress._id,
        percentage: progress.progressPercentage,
      },
    });
  })
);

// Complete full onboarding in one go (for resume upload flow)
router.post(
  '/complete',
  authenticate,
  [
    body('roleId').notEmpty().withMessage('Role ID is required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { roleId, resumeParsed } = req.body;

    // Get or create profile
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({
        userId,
        parsedData: resumeParsed || {
          skills: [],
          projects: [],
          education: [],
          experience: [],
        },
        targetRoles: [roleId],
        preferences: {
          companySize: 'any',
          location: [],
          remote: true,
          notifications: {
            emailNotifications: true,
            assessmentReminders: true,
            weeklyDigest: false,
          },
        },
      });
    } else {
      profile.targetRoles = [roleId];
      if (resumeParsed) {
        profile.parsedData = resumeParsed;
      }
    }
    await profile.save();

    // Get role
    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    // Compute readiness score
    const scoringResult = await computeReadinessScore({
      userSkills: profile.parsedData.skills,
      userProjects: profile.parsedData.projects,
      userExperience: profile.parsedData.experience,
      requiredSkills: role.skills,
      resumeText: profile.resumeText || '',
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
    const progress = await Progress.findOneAndUpdate(
      { userId, assessmentId: assessment._id },
      {
        userId,
        assessmentId: assessment._id,
        roadmapId: assessment._id.toString(),
        completedTasks: [],
        completedProjects: [],
        completedSkills: [],
        progressPercentage: 0,
        estimatedDaysRemaining: roadmap.duration,
        streakDays: 0,
        lastActivityDate: new Date(),
        history: [],
      },
      { upsert: true, new: true }
    );

    // Mark onboarding complete
    await User.findByIdAndUpdate(userId, { 
      $set: { onboardingComplete: true }
    });

    res.status(201).json({
      message: 'Onboarding completed successfully',
      assessment: await assessment.populate('roleId'),
      roadmap,
      progress,
    });
  })
);

export default router;
