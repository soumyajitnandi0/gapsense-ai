import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import SkillOntology from '../models/SkillOntology';
import { authenticate, optionalAuth, requireAdmin, asyncHandler } from '../middleware';

const router = Router();

// Get all skills (with optional filtering)
router.get(
  '/',
  optionalAuth,
  [
    query('category').optional(),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { category, difficulty, search, page = 1, limit = 50 } = req.query;

    const query: any = { isActive: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [skills, total, categories] = await Promise.all([
      SkillOntology.find(query)
        .select('-resources') // Exclude resources for list view
        .sort({ industryDemand: -1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      SkillOntology.countDocuments(query),
      SkillOntology.distinct('category', { isActive: true }),
    ]);

    res.json({
      skills,
      categories,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  })
);

// Get skill categories
router.get(
  '/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const categories = await SkillOntology.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          skills: { $push: '$name' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ categories });
  })
);

// Get single skill with details
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const skill = await SkillOntology.findById(req.params.id)
      .populate('relatedSkills.skillId', 'name category difficulty');

    if (!skill || !skill.isActive) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    // Get prerequisite skills
    const prerequisites = await SkillOntology.find({
      'relatedSkills.skillId': skill._id,
      'relatedSkills.relationship': 'prerequisite',
    }).select('name category difficulty');

    res.json({
      skill,
      prerequisites,
    });
  })
);

// Get skill by name
router.get(
  '/name/:name',
  asyncHandler(async (req: Request, res: Response) => {
    const skill = await SkillOntology.findOne({
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') },
      isActive: true,
    });

    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    res.json({ skill });
  })
);

// Create new skill (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Valid difficulty required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      category,
      description,
      difficulty,
      parentSkill,
      relatedSkills,
      resources,
      industryDemand,
      learningPath,
      tags,
    } = req.body;

    // Check if skill already exists
    const existing = await SkillOntology.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (existing) {
      res.status(409).json({ error: 'Skill with this name already exists' });
      return;
    }

    const skill = new SkillOntology({
      name,
      category,
      description,
      difficulty,
      parentSkill,
      relatedSkills: relatedSkills || [],
      resources: resources || [],
      industryDemand: industryDemand || 0.5,
      learningPath: learningPath || [],
      tags: tags || [],
    });

    await skill.save();

    res.status(201).json({
      message: 'Skill created successfully',
      skill,
    });
  })
);

// Update skill (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const updates = req.body;
    delete updates._id; // Prevent ID modification

    const skill = await SkillOntology.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    res.json({
      message: 'Skill updated successfully',
      skill,
    });
  })
);

// Add resource to skill (admin only)
router.post(
  '/:id/resources',
  authenticate,
  requireAdmin,
  [
    body('title').trim().notEmpty(),
    body('type').isIn(['video', 'article', 'course', 'book', 'practice']),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { title, url, type, difficulty, estimatedHours, rating, tags } = req.body;

    const skill = await SkillOntology.findById(req.params.id);
    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    skill.resources.push({
      title,
      url,
      type,
      difficulty,
      estimatedHours,
      rating,
      tags: tags || [],
    });

    await skill.save();

    res.json({
      message: 'Resource added successfully',
      skill,
    });
  })
);

// Add related skill (admin only)
router.post(
  '/:id/related',
  authenticate,
  requireAdmin,
  [
    body('skillId').notEmpty(),
    body('relationship').isIn(['prerequisite', 'related', 'specialization']),
    body('strength').optional().isFloat({ min: 0, max: 1 }),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { skillId, relationship, strength = 0.5 } = req.body;

    const skill = await SkillOntology.findById(req.params.id);
    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    // Check if related skill exists
    const relatedSkill = await SkillOntology.findById(skillId);
    if (!relatedSkill) {
      res.status(404).json({ error: 'Related skill not found' });
      return;
    }

    // Check if relationship already exists
    const existingRelation = skill.relatedSkills.find(
      rs => rs.skillId.toString() === skillId
    );

    if (existingRelation) {
      existingRelation.relationship = relationship;
      existingRelation.strength = strength;
    } else {
      skill.relatedSkills.push({
        skillId,
        relationship,
        strength,
      });
    }

    await skill.save();

    res.json({
      message: 'Related skill added successfully',
      skill: await skill.populate('relatedSkills.skillId', 'name category'),
    });
  })
);

// Delete skill (soft delete, admin only)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const skill = await SkillOntology.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    res.json({ message: 'Skill deactivated successfully' });
  })
);

// Search skills with autocomplete
router.get(
  '/search/autocomplete',
  [
    query('q').trim().notEmpty().isLength({ min: 2 }),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { q, limit = 10 } = req.query;

    const skills = await SkillOntology.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q as string, 'i')] } },
      ],
    })
      .select('name category difficulty industryDemand')
      .sort({ industryDemand: -1, name: 1 })
      .limit(parseInt(limit as string));

    res.json({ skills });
  })
);

// Get skill learning path
router.get(
  '/:id/learning-path',
  asyncHandler(async (req: Request, res: Response) => {
    const skill = await SkillOntology.findById(req.params.id);
    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    // Build learning path including prerequisites
    const path: Array<{ id: any; name: string; difficulty: string; estimatedHours: number }> = [];
    const visited = new Set<string>();

    async function addPrerequisites(skillId: string) {
      if (visited.has(skillId)) return;
      visited.add(skillId);

      const s = await SkillOntology.findById(skillId);
      if (!s) return;

      // Add prerequisites first
      for (const rel of s.relatedSkills.filter(r => r.relationship === 'prerequisite')) {
        await addPrerequisites(rel.skillId.toString());
      }

      path.push({
        id: s._id,
        name: s.name,
        difficulty: s.difficulty,
        estimatedHours: s.resources.reduce((sum, r) => sum + (r.estimatedHours || 0), 0),
      });
    }

    await addPrerequisites(req.params.id);

    res.json({
      targetSkill: skill.name,
      learningPath: path,
      totalEstimatedHours: path.reduce((sum, s) => sum + s.estimatedHours, 0),
    });
  })
);

export default router;
