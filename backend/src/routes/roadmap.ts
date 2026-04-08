import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import Assessment from '../models/Assessment';
import Progress from '../models/Progress';
import { authenticate, asyncHandler } from '../middleware';
import { generateRoadmap } from '../services';

const router = Router();

// Get roadmap for an assessment
router.get(
  '/:assessmentId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findOne({
      _id: assessmentId,
      userId: (req.user as any)._id,
    });

    if (!assessment || !assessment.roadmap) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }

    // Get progress data
    const progress = await Progress.findOne({
      userId: (req.user as any)._id,
      assessmentId,
    });

    res.json({
      roadmap: assessment.roadmap,
      progress,
    });
  })
);

// Get user's current progress across all roadmaps
router.get(
  '/progress/all',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const progressList = await Progress.find({ userId: (req.user as any)._id })
      .populate({
        path: 'assessmentId',
        populate: { path: 'roleId', select: 'name' },
      })
      .sort({ updatedAt: -1 });

    res.json({ progress: progressList });
  })
);

// Get specific progress
router.get(
  '/progress/:assessmentId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const progress = await Progress.findOne({
      userId: (req.user as any)._id,
      assessmentId: req.params.assessmentId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    res.json({ progress });
  })
);

// Update task completion
router.post(
  '/progress/:assessmentId/tasks',
  authenticate,
  [
    body('taskId').notEmpty(),
    body('milestoneWeek').isNumeric(),
    body('completed').isBoolean(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { assessmentId } = req.params;
    const { taskId, milestoneWeek, completed, notes } = req.body;

    let progress = await Progress.findOne({
      userId: (req.user as any)._id,
      assessmentId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    if (completed) {
      // Add to completed tasks
      const existingTask = progress.completedTasks.find(t => t.taskId === taskId);
      if (!existingTask) {
        progress.completedTasks.push({
          taskId,
          milestoneWeek,
          completedAt: new Date(),
          notes,
        });

        // Add to history
        progress.history.push({
          date: new Date(),
          type: 'task_completed',
          description: `Completed task: ${taskId}`,
        });
      }
    } else {
      // Remove from completed tasks
      progress.completedTasks = progress.completedTasks.filter(t => t.taskId !== taskId);
    }

    // Update progress percentage
    const assessment = await Assessment.findById(assessmentId);
    if (assessment?.roadmap?.milestones) {
      const totalTasks = assessment.roadmap.milestones.reduce(
        (sum, m) => sum + m.tasks.length,
        0
      );
      progress.progressPercentage = Math.round(
        (progress.completedTasks.length / totalTasks) * 100
      );
    }

    progress.lastActivityDate = new Date();
    await progress.save();

    res.json({ progress });
  })
);

// Complete a project
router.post(
  '/progress/:assessmentId/projects',
  authenticate,
  [
    body('projectTitle').notEmpty(),
    body('completed').isBoolean(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { assessmentId } = req.params;
    const { projectTitle, completed } = req.body;

    let progress = await Progress.findOne({
      userId: (req.user as any)._id,
      assessmentId,
    });

    if (!progress) {
      res.status(404).json({ error: 'Progress not found' });
      return;
    }

    if (completed) {
      if (!progress.completedProjects.includes(projectTitle)) {
        progress.completedProjects.push(projectTitle);
        progress.history.push({
          date: new Date(),
          type: 'project_added',
          description: `Completed project: ${projectTitle}`,
        });
      }
    } else {
      progress.completedProjects = progress.completedProjects.filter(
        p => p !== projectTitle
      );
    }

    progress.lastActivityDate = new Date();
    await progress.save();

    res.json({ progress });
  })
);

// Regenerate roadmap
router.post(
  '/:assessmentId/regenerate',
  authenticate,
  [
    body('durationDays').optional().isNumeric(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { assessmentId } = req.params;
    const { durationDays = 60 } = req.body;

    const assessment = await Assessment.findOne({
      _id: assessmentId,
      userId: (req.user as any)._id,
    });

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    // Generate new roadmap with current gaps
    const roadmapInput = {
      gaps: assessment.gaps,
      currentSkills: assessment.matchedSkills,
      targetRole: '', // Will be populated from role
      durationDays,
    };

    // Get role name
    const role = await Assessment.findById(assessmentId).populate('roleId');
    if (role && (role as any).roleId) {
      roadmapInput.targetRole = (role as any).roleId.name;
    }

    const newRoadmap = await generateRoadmap(roadmapInput);

    // Update assessment
    assessment.roadmap = {
      duration: newRoadmap.duration,
      milestones: newRoadmap.milestones,
      projectSuggestions: newRoadmap.projectSuggestions,
      targetCompletionDate: newRoadmap.targetCompletionDate,
    };
    await assessment.save();

    // Reset progress for new roadmap
    await Progress.findOneAndUpdate(
      { userId: (req.user as any)._id, assessmentId },
      {
        $set: {
          completedTasks: [],
          completedProjects: [],
          progressPercentage: 0,
          estimatedDaysRemaining: newRoadmap.duration,
        },
      }
    );

    res.json({
      roadmap: assessment.roadmap,
    });
  })
);

export default router;
