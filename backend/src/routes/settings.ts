import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Profile from '../models/Profile';
import Assessment from '../models/Assessment';
import { authenticate, asyncHandler } from '../middleware';

const router = Router();

// Get user settings (account + profile info)
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as any)._id);
    const profile = await Profile.findOne({ userId: (req.user as any)._id });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        authProvider: user.authProvider,
        githubConnected: !!user.githubId,
        githubUsername: user.githubUsername,
        createdAt: user.createdAt,
      },
      profile: profile || null,
    });
  })
);

// Update user account info
router.put(
  '/account',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();

    const user = await User.findByIdAndUpdate(
      (req.user as any)._id,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'Account updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  })
);

// Update password (only for email auth users)
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById((req.user as any)._id);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Only allow password change for email auth users
    if (user.authProvider !== 'email') {
      res.status(400).json({ error: 'Cannot change password for social login accounts' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  })
);

// Update notification preferences
router.put(
  '/notifications',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { emailNotifications, assessmentReminders, weeklyDigest } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId: (req.user as any)._id },
      { 
        $set: { 
          'preferences.notifications': {
            emailNotifications,
            assessmentReminders,
            weeklyDigest,
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Notification preferences updated',
      preferences: profile?.preferences?.notifications,
    });
  })
);

// Delete account
router.delete(
  '/account',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;

    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Profile.findOneAndDelete({ userId }),
      Assessment.deleteMany({ userId }),
    ]);

    res.json({ message: 'Account deleted successfully' });
  })
);

export default router;
