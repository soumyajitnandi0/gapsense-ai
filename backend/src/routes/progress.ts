import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import Progress from '../models/Progress';
import Assessment from '../models/Assessment';
import Profile from '../models/Profile';
import { authenticate, asyncHandler } from '../middleware';

const router = Router();

// Get current progress
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    
    const progress = await Progress.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('assessmentId');

    if (!progress) {
      res.status(404).json({ error: 'No progress found. Complete onboarding first.' });
      return;
    }

    const assessment = await Assessment.findById(progress.assessmentId)
      .populate('roleId');

    // Calculate detailed stats
    const totalMilestones = assessment?.roadmap?.milestones?.length || 0;
    const completedMilestones = progress.completedTasks.reduce((acc, task) => {
      const milestoneWeek = task.milestoneWeek;
      if (!acc.includes(milestoneWeek)) acc.push(milestoneWeek);
      return acc;
    }, [] as number[]).length;

    const totalTasks = assessment?.roadmap?.milestones?.reduce(
      (acc, m) => acc + (m.tasks?.length || 0), 0
    ) || 0;
    const completedTasksCount = progress.completedTasks.length;

    const skillProgress = assessment?.roadmap?.milestones?.flatMap((m, idx) => 
      (m.tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        completed: progress.completedTasks.some(ct => ct.taskId === task.id),
        completedAt: progress.completedTasks.find(ct => ct.taskId === task.id)?.completedAt,
        milestoneWeek: idx + 1,
      }))
    ) || [];

    // Calculate streak
    const today = new Date();
    const lastActivity = progress.lastActivityDate;
    const daysSinceActivity = Math.floor((today.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    
    let currentStreak = progress.streakDays;
    if (daysSinceActivity > 1) {
      currentStreak = 0; // Reset streak if inactive for more than 1 day
    }

    res.json({
      progress: {
        id: progress._id,
        percentage: progress.progressPercentage,
        estimatedDaysRemaining: progress.estimatedDaysRemaining,
        streakDays: currentStreak,
        lastActivityDate: progress.lastActivityDate,
        completedTasksCount,
        totalTasks,
        completedMilestones,
        totalMilestones,
        completedProjects: progress.completedProjects,
        completedSkills: progress.completedSkills,
      },
      skillProgress,
      history: progress.history.slice(-10).reverse(), // Last 10 activities
      assessment: assessment ? {
        id: assessment._id,
        overallScore: assessment.overallScore,
        roleName: (assessment.roleId as any)?.name || 'Unknown Role',
      } : null,
    });
  })
);

// Complete a task
router.post(
  '/complete-task',
  authenticate,
  [
    body('taskId').notEmpty().withMessage('Task ID is required'),
    body('milestoneWeek').isInt({ min: 1 }).withMessage('Valid milestone week required'),
    body('notes').optional().trim(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { taskId, milestoneWeek, notes } = req.body;

    let progress = await Progress.findOne({ userId }).sort({ createdAt: -1 });
    if (!progress) {
      const assessment = await Assessment.findOne({ userId }).sort({ createdAt: -1 });
      if (!assessment) {
        res.status(404).json({ error: 'No progress or assessment found' });
        return;
      }
      progress = new Progress({
        userId,
        assessmentId: assessment._id,
        roadmapId: assessment._id.toString(),
        completedTasks: [],
        progressPercentage: 0,
        estimatedDaysRemaining: assessment.roadmap?.duration || 60,
      });
    }

    // Check if already completed
    const alreadyCompleted = progress.completedTasks.some(ct => ct.taskId === taskId);
    if (alreadyCompleted) {
      res.status(400).json({ error: 'Task already completed' });
      return;
    }

    // Add completed task
    progress.completedTasks.push({
      taskId,
      milestoneWeek,
      completedAt: new Date(),
      notes,
    });

    // Update streak
    const today = new Date();
    const lastActivity = new Date(progress.lastActivityDate);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already active today, streak continues
    } else if (daysDiff === 1) {
      // Active yesterday, increment streak
      progress.streakDays += 1;
    } else {
      // Streak broken, start new
      progress.streakDays = 1;
    }

    progress.lastActivityDate = today;

    // Add to history
    progress.history.push({
      date: new Date(),
      type: 'task_completed',
      description: `Completed task: ${taskId}`,
      metadata: { taskId, milestoneWeek },
    });

    // Recalculate progress percentage
    const assessment = await Assessment.findById(progress.assessmentId);
    const totalTasks = assessment?.roadmap?.milestones?.reduce(
      (acc, m) => acc + (m.tasks?.length || 0), 0
    ) || 1;
    
    progress.progressPercentage = Math.min(
      Math.round((progress.completedTasks.length / totalTasks) * 100),
      100
    );

    // Update estimated days remaining
    const remainingTasks = totalTasks - progress.completedTasks.length;
    progress.estimatedDaysRemaining = Math.ceil(remainingTasks * 0.5); // Assume 2 tasks per day

    await progress.save();

    res.json({
      message: 'Task completed successfully',
      progress: {
        percentage: progress.progressPercentage,
        completedTasks: progress.completedTasks.length,
        streakDays: progress.streakDays,
      },
    });
  })
);

// Complete a skill
router.post(
  '/complete-skill',
  authenticate,
  [
    body('skillName').notEmpty().withMessage('Skill name is required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { skillName } = req.body;

    const progress = await Progress.findOne({ userId }).sort({ createdAt: -1 });
    if (!progress) {
      res.status(404).json({ error: 'No progress found' });
      return;
    }

    if (progress.completedSkills.includes(skillName)) {
      res.status(400).json({ error: 'Skill already marked as completed' });
      return;
    }

    progress.completedSkills.push(skillName);
    progress.lastActivityDate = new Date();
    
    progress.history.push({
      date: new Date(),
      type: 'skill_added',
      description: `Mastered skill: ${skillName}`,
      metadata: { skillName },
    });

    await progress.save();

    res.json({
      message: 'Skill marked as completed',
      completedSkills: progress.completedSkills,
    });
  })
);

// Complete a project
router.post(
  '/complete-project',
  authenticate,
  [
    body('projectName').notEmpty().withMessage('Project name is required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const { projectName } = req.body;

    const progress = await Progress.findOne({ userId }).sort({ createdAt: -1 });
    if (!progress) {
      res.status(404).json({ error: 'No progress found' });
      return;
    }

    if (progress.completedProjects.includes(projectName)) {
      res.status(400).json({ error: 'Project already marked as completed' });
      return;
    }

    progress.completedProjects.push(projectName);
    progress.lastActivityDate = new Date();
    
    progress.history.push({
      date: new Date(),
      type: 'project_added',
      description: `Completed project: ${projectName}`,
      metadata: { projectName },
    });

    await progress.save();

    res.json({
      message: 'Project marked as completed',
      completedProjects: progress.completedProjects,
    });
  })
);

// Get upcoming tasks
router.get(
  '/upcoming',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    
    const progress = await Progress.findOne({ userId }).sort({ createdAt: -1 });
    const assessment = await Assessment.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('roleId');

    if (!assessment || !assessment.roadmap) {
      res.status(404).json({ error: 'No roadmap found' });
      return;
    }

    const completedTaskIds = new Set(progress?.completedTasks.map(ct => ct.taskId) || []);

    const upcomingTasks = assessment.roadmap.milestones.flatMap((milestone, idx) => 
      (milestone.tasks || [])
        .filter(task => !completedTaskIds.has(task.id))
        .map(task => ({
          ...task,
          milestoneWeek: idx + 1,
          milestoneTitle: milestone.title,
        }))
    ).slice(0, 10); // Get first 10 incomplete tasks

    res.json({
      upcomingTasks,
      totalRemaining: upcomingTasks.length,
    });
  })
);

// Get progress stats
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    
    const progress = await Progress.findOne({ userId }).sort({ createdAt: -1 });
    const profile = await Profile.findOne({ userId });
    const assessment = await Assessment.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('roleId');

    if (!progress || !assessment) {
      res.status(404).json({ error: 'No progress data found' });
      return;
    }

    // Calculate weekly activity
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivity = progress.history.filter(h => new Date(h.date) >= oneWeekAgo).length;

    // Calculate skill coverage
    const requiredSkills = assessment.matchedSkills || [];
    const masteredSkills = progress.completedSkills;
    const skillCoverage = requiredSkills.length > 0 
      ? Math.round((masteredSkills.length / requiredSkills.length) * 100)
      : 0;

    res.json({
      overall: {
        progressPercentage: progress.progressPercentage,
        daysRemaining: progress.estimatedDaysRemaining,
        streakDays: progress.streakDays,
        weeklyActivity,
      },
      skills: {
        totalRequired: requiredSkills.length,
        mastered: masteredSkills.length,
        coverage: skillCoverage,
      },
      projects: {
        completed: progress.completedProjects.length,
        suggestions: assessment.roadmap?.projectSuggestions?.length || 0,
      },
      milestones: {
        total: assessment.roadmap?.milestones?.length || 0,
        completed: new Set(progress.completedTasks.map(t => t.milestoneWeek)).size,
      },
    });
  })
);

export default router;
