import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import User from '../models/User';
import Profile from '../models/Profile';
import Role from '../models/Role';
import Assessment from '../models/Assessment';
import Progress from '../models/Progress';
import SkillOntology from '../models/SkillOntology';
import { authenticate, requireAdmin, asyncHandler } from '../middleware';

const router = Router();

// Get admin dashboard stats
router.get(
  '/stats',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const [
      totalUsers,
      activeUsers,
      totalAssessments,
      totalRoles,
      totalSkills,
      recentAssessments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Assessment.countDocuments(),
      Role.countDocuments({ isActive: true }),
      SkillOntology.countDocuments({ isActive: true }),
      Assessment.find()
        .populate('userId', 'name email')
        .populate('roleId', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Calculate average readiness score
    const scoreStats = await Assessment.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$overallScore' }, maxScore: { $max: '$overallScore' }, minScore: { $min: '$overallScore' } } },
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalAssessments,
        totalRoles,
        totalSkills,
        averageScore: scoreStats[0]?.avgScore || 0,
        maxScore: scoreStats[0]?.maxScore || 0,
        minScore: scoreStats[0]?.minScore || 0,
      },
      recentAssessments,
    });
  })
);

// Get all users (paginated)
router.get(
  '/users',
  authenticate,
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

// Get user details with related data
router.get(
  '/users/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const [user, profile, assessments] = await Promise.all([
      User.findById(req.params.id).select('-password'),
      Profile.findOne({ userId: req.params.id }),
      Assessment.find({ userId: req.params.id })
        .populate('roleId', 'name')
        .sort({ createdAt: -1 }),
    ]);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user,
      profile,
      assessments,
    });
  })
);

// Update user status
router.patch(
  '/users/:id/status',
  authenticate,
  requireAdmin,
  [
    body('isActive').isBoolean(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive } },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user, message: `User ${isActive ? 'activated' : 'deactivated'} successfully` });
  })
);

// Delete user and all related data
router.delete(
  '/users/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;

    // Delete all related data
    await Promise.all([
      Profile.findOneAndDelete({ userId }),
      Assessment.deleteMany({ userId }),
      Progress.deleteMany({ userId }),
      // Keep chat history for audit purposes or delete based on policy
    ]);

    // Delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User and all related data deleted successfully' });
  })
);

// Get cohort analytics
router.get(
  '/analytics/cohort',
  authenticate,
  requireAdmin,
  [
    query('roleId').optional(),
    query('startDate').optional(),
    query('endDate').optional(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { roleId, startDate, endDate } = req.query;

    const matchQuery: any = {};
    if (roleId) matchQuery.roleId = roleId;
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate as string);
    }

    const analytics = await Assessment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$roleId',
          avgScore: { $avg: '$overallScore' },
          count: { $sum: 1 },
          minScore: { $min: '$overallScore' },
          maxScore: { $max: '$overallScore' },
        },
      },
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
          avgScore: { $round: ['$avgScore', 2] },
          count: 1,
          minScore: 1,
          maxScore: 1,
        },
      },
    ]);

    // Get top skill gaps across cohort
    const topGaps = await Assessment.aggregate([
      { $match: matchQuery },
      { $unwind: '$gaps' },
      {
        $group: {
          _id: '$gaps.skill',
          count: { $sum: 1 },
          avgPriority: { $avg: { $cond: [{ $eq: ['$gaps.priority', 'high'] }, 3, { $cond: [{ $eq: ['$gaps.priority', 'medium'] }, 2, 1] }] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      analytics,
      topGaps,
    });
  })
);

// Get role analytics
router.get(
  '/analytics/roles/:roleId',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { roleId } = req.params;

    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    const stats = await Assessment.aggregate([
      { $match: { roleId: new mongoose.Types.ObjectId(roleId) } },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
          scoreDistribution: {
            $push: {
              $switch: {
                branches: [
                  { case: { $lt: ['$overallScore', 40] }, then: 'low' },
                  { case: { $lt: ['$overallScore', 70] }, then: 'medium' },
                ],
                default: 'high',
              },
            },
          },
        },
      },
    ]);

    res.json({
      role,
      stats: stats[0] || {
        totalAssessments: 0,
        avgScore: 0,
        scoreDistribution: [],
      },
    });
  })
);

// Import mongoose for ObjectId
import mongoose from 'mongoose';

export default router;
