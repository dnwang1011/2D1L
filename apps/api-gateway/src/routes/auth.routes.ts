import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, (req, res) => getMe(req as AuthenticatedRequest, res));

export default router; 