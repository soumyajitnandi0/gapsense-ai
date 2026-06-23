import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Ensure upload directories exist (only outside Vercel serverless)
if (!process.env.VERCEL) {
  const uploadDir = path.join(__dirname, '../uploads/resumes');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// Config imports
import connectDB from './config/database';
import configurePassport from './config/passport';

// Middleware imports
import { errorHandler, notFound, rateLimiterMiddleware } from './middleware';

// Route imports
import routes from './routes';

// Seeds
import { runSeeds } from './seeds/roles';

// Create Express app
const app = express();

// Connect to database
connectDB();

// Configure passport
configurePassport();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize() as any);

// Rate limiting
app.use(rateLimiterMiddleware);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Seed endpoint (admin only)
app.post('/seed', async (req, res) => {
  try {
    await runSeeds();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// API routes (no /api prefix - Vercel's api/ directory handles the namespace)
app.use('/', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server (skip in Vercel serverless environment)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  // process.exit(1);
});

export default app;
