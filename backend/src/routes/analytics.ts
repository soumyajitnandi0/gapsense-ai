import { Router, Request, Response } from 'express';
import { query } from 'express-validator';
import Assessment from '../models/Assessment';
import Progress from '../models/Progress';
import User from '../models/User';
import Role from '../models/Role';
import { authenticate, requireAdmin, asyncHandler } from '../middleware';

const router = Router();

// Get platform-wide analytics
router.get(
  '/platform',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const timeRanges = {
      '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    };

    const analytics = await Promise.all(
      Object.entries(timeRanges).map(async ([range, date]) => {
        const [newUsers, newAssessments, activeUsers] = await Promise.all([
          User.countDocuments({ createdAt: { $gte: date } }),
          Assessment.countDocuments({ createdAt: { $gte: date } }),
          User.countDocuments({ lastLogin: { $gte: date } }),
        ]);

        return { range, newUsers, newAssessments, activeUsers };
      })
    );

    // Score distribution
    const scoreDistribution = await Assessment.aggregate([
      {
        $bucket: {
          groupBy: '$overallScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    // Top target roles
    const topRoles = await Assessment.aggregate([
      {
        $group: {
          _id: '$roleId',
          count: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'roles',
          localField: '_id',
          foreignField: '_id',
          as: 'role',
        },
      },
      { $unwind: '$role' },
      {
        $project: {
          roleName: '$role.name',
          count: 1,
          avgScore: { $round: ['$avgScore', 2] },
        },
      },
    ]);

    res.json({
      analytics,
      scoreDistribution,
      topRoles,
    });
  })
);

// Get user engagement analytics
router.get(
  '/engagement',
  authenticate,
  requireAdmin,
  [
    query('startDate').optional(),
    query('endDate').optional(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    // Daily active users
    const dailyActiveUsers = await User.aggregate([
      {
        $match: {
          lastLogin: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Assessment completion rate
    const assessmentStats = await Assessment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withRoadmap: {
            $sum: { $cond: [{ $ne: ['$roadmap', null] }, 1, 0] },
          },
          avgScore: { $avg: '$overallScore' },
        },
      },
    ]);

    // Progress tracking stats
    const progressStats = await Progress.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          avgProgress: { $avg: '$progressPercentage' },
          avgStreak: { $avg: '$streakDays' },
          completedTasks: { $sum: { $size: '$completedTasks' } },
        },
      },
    ]);

    res.json({
      period: { startDate, endDate },
      dailyActiveUsers,
      assessmentStats: assessmentStats[0] || null,
      progressStats: progressStats[0] || null,
    });
  })
);

// Get skill gap analytics
router.get(
  '/skill-gaps',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { roleId, minPriority = 'medium' } = req.query;

    const priorityWeights: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const matchQuery: any = {};
    if (roleId) matchQuery.roleId = roleId;

    const topGaps = await Assessment.aggregate([
      { $match: matchQuery },
      { $unwind: '$gaps' },
      {
        $match: {
          'gaps.priority': { $in: Object.keys(priorityWeights).filter(p => priorityWeights[p] >= priorityWeights[minPriority as string] || 2) },
        },
      },
      {
        $group: {
          _id: '$gaps.skill',
          count: { $sum: 1 },
          avgCurrentLevel: { $first: '$gaps.currentLevel' },
          avgRequiredLevel: { $first: '$gaps.requiredLevel' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Skill gap by category (if we can infer from role)
    let categoryGaps: any[] = [];
    if (roleId) {
      const role = await Role.findById(roleId);
      if (role) {
        const roleCategories = role.skills.map(s => s.category);
        categoryGaps = await Assessment.aggregate([
          { $match: { roleId: role._id } },
          { $unwind: '$gaps' },
          {
            $group: {
              _id: '$gaps.priority',
              count: { $sum: 1 },
            },
          },
        ]);
      }
    }

    res.json({
      topGaps,
      categoryGaps,
      totalAssessments: await Assessment.countDocuments(matchQuery),
    });
  })
);

// Get user retention analytics
router.get(
  '/retention',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    // Cohort retention analysis
    const cohorts = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          totalUsers: { $sum: 1 },
          users: { $push: '$_id' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]);

    const cohortAnalysis = await Promise.all(
      cohorts.map(async (cohort) => {
        const activeUsers = await User.countDocuments({
          _id: { $in: cohort.users },
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        });

        const usersWithAssessments = await Assessment.countDocuments({
          userId: { $in: cohort.users },
        });

        const usersWithProgress = await Progress.countDocuments({
          userId: { $in: cohort.users },
          progressPercentage: { $gt: 0 },
        });

        return {
          cohort: cohort._id,
          totalUsers: cohort.totalUsers,
          active30d: activeUsers,
          retentionRate: Math.round((activeUsers / cohort.totalUsers) * 100),
          assessmentRate: Math.round((usersWithAssessments / cohort.totalUsers) * 100),
          progressRate: Math.round((usersWithProgress / cohort.totalUsers) * 100),
        };
      })
    );

    res.json({
      cohorts: cohortAnalysis,
    });
  })
);

// Get personalized analytics for current user
router.get(
  '/user',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;

    const [assessments, progress, assessmentHistory] = await Promise.all([
      Assessment.find({ userId }).sort({ createdAt: -1 }),
      Progress.find({ userId }),
      Assessment.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgScore: { $avg: '$overallScore' },
            maxScore: { $max: '$overallScore' },
            minScore: { $min: '$overallScore' },
          },
        },
      ]),
    ]);

    // Score progression over time
    const scoreProgression = assessments.map(a => ({
      date: a.createdAt,
      score: a.overallScore,
      roleId: a.roleId,
    }));

    // Calculate skill diversity (unique skills across assessments)
    const uniqueSkills = new Set<string>();
    assessments.forEach(a => {
      a.matchedSkills.forEach(s => uniqueSkills.add(s));
    });

    // Total progress across all roadmaps
    const totalProgress = progress.reduce((sum, p) => sum + p.progressPercentage, 0);
    const avgProgress = progress.length > 0 ? totalProgress / progress.length : 0;

    res.json({
      totalAssessments: assessments.length,
      avgScore: assessmentHistory[0]?.avgScore || 0,
      scoreRange: {
        min: assessmentHistory[0]?.minScore || 0,
        max: assessmentHistory[0]?.maxScore || 0,
      },
      scoreProgression,
      skillDiversity: uniqueSkills.size,
      activeRoadmaps: progress.length,
      avgProgress: Math.round(avgProgress),
      totalTasksCompleted: progress.reduce((sum, p) => sum + p.completedTasks.length, 0),
    });
  })
);

export default router;
