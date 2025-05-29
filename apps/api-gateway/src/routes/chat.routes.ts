/**
 * Chat Routes - DialogueAgent API Integration
 * Provides real-time conversation endpoints using DialogueAgent
 */

import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

/**
 * POST /api/chat/message
 * Send a text message to DialogueAgent for conversation
 * Requires authentication middleware
 */
router.post('/message', chatController.sendMessage);

/**
 * POST /api/chat/upload
 * Upload a file (image, document) for analysis by DialogueAgent
 * Requires authentication and file upload middleware (multer)
 */
router.post('/upload', chatController.uploadFile);

/**
 * GET /api/chat/history
 * Get conversation history for the authenticated user
 * Optional query parameters: conversation_id, limit, offset
 */
router.get('/history', chatController.getHistory);

/**
 * GET /api/chat/health
 * Health check for chat functionality and DialogueAgent availability
 * Public endpoint for monitoring
 */
router.get('/health', chatController.healthCheck);

export default router; 