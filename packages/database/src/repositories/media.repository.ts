/**
 * Media Repository
 * Handles media file persistence and metadata
 */

import { PrismaClient, media } from '@prisma/client';

export interface CreateMediaInput {
  user_id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
  metadata?: any;
}

export interface UpdateMediaInput {
  extraction_status?: string;
  extracted_text?: string;
  metadata?: any;
}

export class MediaRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new media record
   */
  async createMedia(input: CreateMediaInput): Promise<media> {
    return await this.prisma.media.create({
      data: {
        user_id: input.user_id,
        type: input.type,
        storage_url: input.url,
        filename_original: input.original_name,
        mime_type: input.mime_type,
        file_size_bytes: input.size,
        extraction_status: 'pending',
        created_at: new Date(),
        metadata: input.metadata || {}
      }
    });
  }

  /**
   * Get media by ID
   */
  async getMedia(mediaId: string): Promise<media | null> {
    return await this.prisma.media.findUnique({
      where: { media_id: mediaId }
    });
  }

  /**
   * Get media by user
   */
  async getUserMedia(
    userId: string, 
    type?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<media[]> {
    const where: any = { user_id: userId };
    if (type) {
      where.type = type;
    }

    return await this.prisma.media.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Update media processing status and metadata
   */
  async updateMedia(mediaId: string, input: UpdateMediaInput): Promise<media> {
    return await this.prisma.media.update({
      where: { media_id: mediaId },
      data: {
        ...input,
        metadata: input.metadata
      }
    });
  }

  /**
   * Mark media as processed with extracted text
   */
  async markAsProcessed(
    mediaId: string, 
    extractedText?: string,
    metadata?: any
  ): Promise<media> {
    return await this.updateMedia(mediaId, {
      extraction_status: 'completed',
      extracted_text: extractedText,
      metadata
    });
  }

  /**
   * Mark media as failed processing
   */
  async markAsFailed(mediaId: string, error: string): Promise<media> {
    return await this.updateMedia(mediaId, {
      extraction_status: 'failed',
      metadata: { error }
    });
  }

  /**
   * Get pending media for processing
   */
  async getPendingMedia(limit: number = 10): Promise<media[]> {
    return await this.prisma.media.findMany({
      where: { extraction_status: 'pending' },
      orderBy: { created_at: 'asc' },
      take: limit
    });
  }

  /**
   * Delete media
   */
  async deleteMedia(mediaId: string): Promise<void> {
    await this.prisma.media.delete({
      where: { media_id: mediaId }
    });
  }
} 