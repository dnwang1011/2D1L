/**
 * Conversation Repository
 * Handles conversation and message persistence
 */

import { PrismaClient, conversations, conversation_messages } from '@prisma/client';

export interface CreateConversationInput {
  user_id: string;
  session_id?: string;
  title?: string;
  context?: any;
}

export interface AddMessageInput {
  conversation_id: string;
  user_id: string;
  sender_type: 'user' | 'assistant';
  message_text: string;
  media_attachments?: any;
  metadata?: any;
}

export interface GetMessagesOptions {
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}

export class ConversationRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get or create a conversation for a user and session
   */
  async getOrCreateConversation(
    userId: string, 
    sessionId?: string,
    title?: string
  ): Promise<conversations> {
    // Try to find existing conversation by session_id if provided
    if (sessionId) {
      const existingConversation = await this.prisma.conversations.findFirst({
        where: {
          user_id: userId,
          metadata: {
            path: ["session_id"],
            equals: sessionId
          }
        },
        orderBy: { last_active_time: 'desc' }
      });

      if (existingConversation) {
        return existingConversation;
      }
    }

    // Create new conversation
    return await this.prisma.conversations.create({
      data: {
        user_id: userId,
        title: title || 'New Conversation',
        start_time: new Date(),
        last_active_time: new Date(),
        context_summary: null,
        metadata: {
          session_id: sessionId || `session-${Date.now()}-${userId}`
        }
      }
    });
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(input: AddMessageInput): Promise<conversation_messages> {
    const message = await this.prisma.conversation_messages.create({
      data: {
        conversation_id: input.conversation_id,
        user_id: input.user_id,
        sender_type: input.sender_type,
        message_text: input.message_text,
        message_type: 'text',
        media_attachments: input.media_attachments || null,
        timestamp: new Date(),
        processing_status: 'processed',
        metadata: input.metadata || {}
      }
    });

    // Update conversation's last_active_time timestamp
    await this.prisma.conversations.update({
      where: { conversation_id: input.conversation_id },
      data: { last_active_time: new Date() }
    });

    return message;
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string, 
    options: GetMessagesOptions = {}
  ): Promise<conversation_messages[]> {
    const { limit = 50, offset = 0, order = 'asc' } = options;

    return await this.prisma.conversation_messages.findMany({
      where: { conversation_id: conversationId },
      orderBy: { timestamp: order },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<conversations | null> {
    return await this.prisma.conversations.findUnique({
      where: { conversation_id: conversationId }
    });
  }

  /**
   * Get conversations for a user
   */
  async getUserConversations(
    userId: string, 
    options: GetMessagesOptions = {}
  ): Promise<conversations[]> {
    const { limit = 20, offset = 0 } = options;

    return await this.prisma.conversations.findMany({
      where: { user_id: userId },
      orderBy: { last_active_time: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * End a conversation
   */
  async endConversation(conversationId: string): Promise<conversations> {
    return await this.prisma.conversations.update({
      where: { conversation_id: conversationId },
      data: { 
        last_active_time: new Date(),
        metadata: {
          ended_at: new Date().toISOString()
        }
      }
    });
  }
} 