import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import roleRoutes from './roles';
import assessmentRoutes from './assessments';
import roadmapRoutes from './roadmap';
import chatRoutes from './chat';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/roles', roleRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/chat', chatRoutes);

export default router;
