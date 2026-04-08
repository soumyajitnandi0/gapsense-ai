import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive.' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token.' });
      return;
    }
    res.status(500).json({ error: 'Authentication error.' });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      (req as any).user = user;
    }
    
    next();
  } catch (error) {
    next();
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user as IUser;
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  next();
};

// Export empty since we're using global Express.Request extension
export type AuthenticatedRequest = Request;
