import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import roleRoutes from './roles';
import assessmentRoutes from './assessments';
import roadmapRoutes from './roadmap';
import chatRoutes from './chat';
import adminRoutes from './admin';
import skillsRoutes from './skills';
import analyticsRoutes from './analytics';
import exportRoutes from './export';
import githubRoutes from './github';
import settingsRoutes from './settings';
import onboardingRoutes from './onboarding';
import progressRoutes from './progress';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/roles', roleRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/skills', skillsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);
router.use('/github', githubRoutes);
router.use('/settings', settingsRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/progress', progressRoutes);

export default router;
