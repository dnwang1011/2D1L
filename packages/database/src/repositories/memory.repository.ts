import { PrismaClient } from '@prisma/client';
import { DatabaseService } from '../index';

export interface CreateMemoryUnitData {
  user_id: string;
  source_type: string;
  title?: string;
  content?: string; // For raw content
  tier?: number;
  importance_score?: number;
  is_private?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateChunkData {
  muid: string;
  user_id: string;
  text: string;
  sequence_order: number;
  role?: string;
  metadata?: Record<string, any>;
}

export class MemoryRepository {
  private prisma: PrismaClient;

  constructor(private databaseService: DatabaseService) {
    this.prisma = databaseService.prisma;
  }

  /**
   * Create a new memory unit
   */
  async createMemoryUnit(data: CreateMemoryUnitData) {
    try {
      const memoryUnit = await this.prisma.memory_units.create({
        data: {
          user_id: data.user_id,
          source_type: data.source_type,
          title: data.title,
          content: data.content, // V7: Store content directly in memory_units
          creation_ts: new Date(),
          processing_status: 'raw',
          tier: data.tier || 1,
          importance_score: data.importance_score,
          is_private: data.is_private ?? true,
          metadata: data.metadata,
        },
      });

      return memoryUnit;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Memory unit with this ID already exists.');
      }
      throw error;
    }
  }

  /**
   * Create a chunk linked to a memory unit
   */
  async createChunk(data: CreateChunkData) {
    try {
      return await this.prisma.chunks.create({
        data: {
          muid: data.muid,
          user_id: data.user_id,
          text: data.text,
          sequence_order: data.sequence_order,
          role: data.role,
          char_count: data.text.length,
          token_count: Math.ceil(data.text.length / 4), // Rough token estimate
          metadata: data.metadata,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new Error('Referenced memory unit does not exist.');
      }
      throw error;
    }
  }

  /**
   * Get memory units for a user
   */
  async getMemoryUnitsForUser(userId: string, limit: number = 20, offset: number = 0) {
    return await this.prisma.memory_units.findMany({
      where: { user_id: userId },
      include: {
        chunks: {
          orderBy: { sequence_order: 'asc' },
        },
      },
      orderBy: { creation_ts: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get memory unit by ID
   */
  async getMemoryUnitById(muid: string, userId: string) {
    return await this.prisma.memory_units.findFirst({
      where: { 
        muid,
        user_id: userId,
      },
      include: {
        chunks: {
          orderBy: { sequence_order: 'asc' },
        },
      },
    });
  }

  /**
   * Update memory unit processing status
   */
  async updateMemoryUnitStatus(muid: string, status: string) {
    return await this.prisma.memory_units.update({
      where: { muid },
      data: { 
        processing_status: status,
        last_modified_ts: new Date(),
      },
    });
  }

  /**
   * Get chunks for a memory unit
   */
  async getChunksForMemoryUnit(muid: string) {
    return await this.prisma.chunks.findMany({
      where: { muid },
      orderBy: { sequence_order: 'asc' },
    });
  }

  /**
   * Update memory unit metadata
   */
  async updateMemoryUnitMetadata(muid: string, metadataKey: string, metadataValue: any) {
    // Get current metadata
    const memoryUnit = await this.prisma.memory_units.findUnique({
      where: { muid },
      select: { metadata: true },
    });

    if (!memoryUnit) {
      throw new Error(`Memory unit with ID ${muid} not found`);
    }

    // Merge new metadata with existing
    const currentMetadata = (memoryUnit.metadata as Record<string, any>) || {};
    const updatedMetadata = {
      ...currentMetadata,
      [metadataKey]: metadataValue,
    };

    return await this.prisma.memory_units.update({
      where: { muid },
      data: { 
        metadata: updatedMetadata,
        last_modified_ts: new Date(),
      },
    });
  }
} 