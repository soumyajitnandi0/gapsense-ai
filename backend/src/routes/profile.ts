import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import Profile from '../models/Profile';
import { authenticate, asyncHandler, AuthenticatedRequest, uploadResume, handleMulterError } from '../middleware';
import { parseResume } from '../services';
import fs from 'fs';

const router = Router();

// Get user profile
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await Profile.findOne({ userId: (req.user as any)._id });
    
    if (!profile) {
      res.json({ profile: null, message: 'Profile not created yet' });
      return;
    }

    res.json({ profile });
  })
);

// Create or update profile
router.post(
  '/',
  authenticate,
  [
    body('targetRoles').optional().isArray(),
    body('preferences').optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { targetRoles, preferences, parsedData } = req.body;
    
    let profile = await Profile.findOne({ userId: (req.user as any)._id });

    if (profile) {
      // Update existing
      if (targetRoles) profile.targetRoles = targetRoles;
      if (preferences) profile.preferences = { ...profile.preferences, ...preferences };
      if (parsedData) profile.parsedData = { ...profile.parsedData, ...parsedData };
      await profile.save();
    } else {
      // Create new
      profile = new Profile({
        userId: (req.user as any)._id,
        targetRoles: targetRoles || [],
        preferences: preferences || {},
        parsedData: parsedData || { skills: [], projects: [], education: [], experience: [] },
      });
      await profile.save();
    }

    res.json({ profile });
  })
);

// Upload resume
router.post(
  '/resume',
  authenticate,
  uploadResume.single('resume'),
  handleMulterError,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded' });
      return;
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    
    try {
      // Parse resume
      const parsedResume = await parseResume(fileBuffer, req.file.mimetype);

      // Update profile
      let profile = await Profile.findOne({ userId: (req.user as any)._id });
      
      if (profile) {
        profile.resumeUrl = req.file.filename;
        profile.resumeText = parsedResume.rawText;
        profile.parsedData = {
          skills: parsedResume.skills.map(s => ({
            name: s.name,
            level: s.level || 'intermediate',
            category: 'technical',
            source: 'resume',
          })),
          projects: parsedResume.projects.map(p => ({
            name: p.name,
            description: p.description,
            technologies: p.technologies,
            link: p.link,
          })),
          education: parsedResume.education.map(e => ({
            institution: e.institution,
            degree: e.degree,
            field: e.field || '',
            endDate: e.graduationYear ? new Date(e.graduationYear) : undefined,
            current: false,
          })),
          experience: parsedResume.experience.map(e => ({
            company: e.company,
            role: e.role,
            description: e.description || '',
            current: false,
          })),
        };
        await profile.save();
      } else {
        profile = new Profile({
          userId: (req.user as any)._id,
          resumeUrl: req.file.filename,
          resumeText: parsedResume.rawText,
          parsedData: {
            skills: parsedResume.skills.map(s => ({
              name: s.name,
              level: s.level || 'intermediate',
              category: 'technical',
              source: 'resume',
            })),
            projects: parsedResume.projects.map(p => ({
              name: p.name,
              description: p.description,
              technologies: p.technologies,
              link: p.link,
            })),
            education: parsedResume.education.map(e => ({
              institution: e.institution,
              degree: e.degree,
              field: e.field || '',
              current: false,
            })),
            experience: parsedResume.experience.map(e => ({
              company: e.company,
              role: e.role,
              description: e.description || '',
              current: false,
            })),
          },
        });
        await profile.save();
      }

      // Clean up temp file
      fs.unlinkSync(req.file.path);

      res.json({
        message: 'Resume uploaded and parsed successfully',
        profile,
        parsedData: {
          skills: parsedResume.skills,
          projects: parsedResume.projects,
          education: parsedResume.education,
          experience: parsedResume.experience,
        },
      });
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }
  })
);

// Update target roles
router.put(
  '/target-roles',
  authenticate,
  [
    body('targetRoles').isArray().withMessage('targetRoles must be an array'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { targetRoles } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: (req.user as any)._id },
      { $set: { targetRoles } },
      { new: true, upsert: true }
    );

    res.json({ profile });
  })
);

// Add skill manually
router.post(
  '/skills',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('level').isIn(['beginner', 'intermediate', 'advanced']),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { name, level, category = 'technical' } = req.body;

    const profile = await Profile.findOne({ userId: (req.user as any)._id });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // Check if skill already exists
    const existingSkill = profile.parsedData.skills.find(
      s => s.name.toLowerCase() === name.toLowerCase()
    );

    if (existingSkill) {
      existingSkill.level = level;
    } else {
      profile.parsedData.skills.push({
        name,
        level,
        category,
        source: 'self_assessed',
      });
    }

    await profile.save();
    res.json({ profile });
  })
);

// Add project
router.post(
  '/projects',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, technologies, link } = req.body;

    const profile = await Profile.findOne({ userId: (req.user as any)._id });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    profile.parsedData.projects.push({
      name,
      description,
      technologies: technologies || [],
      link,
    });

    await profile.save();
    res.json({ profile });
  })
);

// Delete profile
router.delete(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await Profile.findOneAndDelete({ userId: (req.user as any)._id });
    res.json({ message: 'Profile deleted successfully' });
  })
);

export default router;
