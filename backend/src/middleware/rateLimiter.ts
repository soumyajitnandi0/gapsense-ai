import { Request, Response, NextFunction } from 'express';
import { RateLimiterMongo } from 'rate-limiter-flexible';
import mongoose from 'mongoose';

let rateLimiter: RateLimiterMongo | null = null;

const getRateLimiter = (): RateLimiterMongo | null => {
  if (rateLimiter) return rateLimiter;
  
  if (mongoose.connection.readyState === 1) {
    rateLimiter = new RateLimiterMongo({
      storeClient: mongoose.connection,
      keyPrefix: 'middleware',
      points: 100,
      duration: 60,
    });
    return rateLimiter;
  }
  
  return null;
};

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const limiter = getRateLimiter();
  
  if (!limiter) {
    next();
    return;
  }

  try {
    const key = req.ip || 'unknown';
    await limiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.round((rejRes as any).msBeforeNext / 1000) || 60,
    });
  }
};

export const strictRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const limiter = getRateLimiter();
  
  if (!limiter) {
    next();
    return;
  }

  try {
    const key = req.ip || 'unknown';
    await limiter.consume(key, 5);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
    });
  }
};
