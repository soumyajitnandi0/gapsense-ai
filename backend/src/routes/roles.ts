import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import Role from '../models/Role';
import { authenticate, requireAdmin, asyncHandler, AuthenticatedRequest } from '../middleware';
import { createRoleFromJD } from '../services';

const router = Router();

// Get all active roles
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { category, companyType, search } = req.query;
    
    const query: any = { isActive: true };
    
    if (category) query.category = category;
    if (companyType) query.companyType = companyType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const roles = await Role.find(query).sort({ name: 1 });
    res.json({ roles });
  })
);

// Get role categories
router.get(
  '/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const categories = await Role.distinct('category', { isActive: true });
    res.json({ categories });
  })
);

// Get single role
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const role = await Role.findById(req.params.id);
    if (!role || !role.isActive) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }
    res.json({ role });
  })
);

// Create role from JD (any authenticated user)
router.post(
  '/from-jd',
  authenticate,
  [
    body('jdText').trim().notEmpty().withMessage('Job description text required'),
    body('name').optional().trim(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { jdText, name } = req.body;

    const roleData = await createRoleFromJD(jdText, name);

    // Create role in database
    const role = new Role({
      ...roleData,
      isActive: false, // Needs admin approval
    });

    await role.save();

    res.status(201).json({
      message: 'Role created from JD (pending approval)',
      role,
    });
  })
);

// Admin: Create role
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('skills').isArray(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const role = new Role(req.body);
    await role.save();
    res.status(201).json({ role });
  })
);

// Admin: Update role
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    res.json({ role });
  })
);

// Admin: Delete role (soft delete)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    res.json({ message: 'Role deactivated successfully' });
  })
);

export default router;
