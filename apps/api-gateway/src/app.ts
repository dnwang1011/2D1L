import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' }); // Assuming .env is in monorepo root, or adjust path

// Import routes (to be created)
import { authRoutes } from './routes/auth.routes';
import { cardRoutes } from './routes/card.routes';
import userRoutes from './routes/user.routes';

const app: Express = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Basic Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API is running' });
});

// API Routes - Implements Directive 2: User growth profile endpoints
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler (simple example)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err.stack);
  // Avoid sending stack trace to client in production
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Handle 404 Not Found
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

export default app; 