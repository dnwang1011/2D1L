import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; region: string; [key: string]: any };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ message: 'Internal server error: JWT secret not configured.' });
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7, authHeader.length);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; region: string; [key: string]: any };
      req.user = decoded; // Attach user info to the request object
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
}; 