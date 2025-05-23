import { PrismaClient } from '@prisma/client';
import { DatabaseService } from '../index';

export interface CreateConceptData {
  user_id: string;
  name: string;
  type: string;
  description?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface CreateConceptRelationshipData {
  user_id: string;
  source_concept_id: string;
  target_concept_id: string;
  relationship_type: string;
  relationship_label: string;
  weight?: number;
  context_muid?: string;
  metadata?: Record<string, any>;
}

export class ConceptRepository {
  private prisma: PrismaClient;

  constructor(private databaseService: DatabaseService) {
    this.prisma = databaseService.prisma;
  }

  /**
   * Create or find an existing concept
   */
  async createOrFindConcept(data: CreateConceptData) {
    try {
      // First try to find existing concept by name and type for the user
      const existing = await this.prisma.concepts.findFirst({
        where: {
          user_id: data.user_id,
          name: data.name,
          type: data.type,
        },
      });

      if (existing) {
        // Update existing concept with new data if provided
        return await this.prisma.concepts.update({
          where: { concept_id: existing.concept_id },
          data: {
            description: data.description || existing.description,
            confidence: data.confidence ?? existing.confidence,
            metadata: data.metadata || existing.metadata,
            last_updated_ts: new Date(),
          },
        });
      }

      // Create new concept
      return await this.prisma.concepts.create({
        data: {
          user_id: data.user_id,
          name: data.name,
          type: data.type,
          description: data.description,
          confidence: data.confidence,
          metadata: data.metadata,
          user_defined: false, // Default to AI-generated
          created_at: new Date(),
          last_updated_ts: new Date(),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Concept with this name and type already exists.');
      }
      throw error;
    }
  }

  /**
   * Get concept by ID
   */
  async getConceptById(conceptId: string, userId: string) {
    return await this.prisma.concepts.findFirst({
      where: {
        concept_id: conceptId,
        user_id: userId,
      },
    });
  }

  /**
   * Get concepts for a user
   */
  async getConceptsForUser(userId: string, type?: string, limit: number = 50, offset: number = 0) {
    const where: any = { user_id: userId };
    if (type) {
      where.type = type;
    }

    return await this.prisma.concepts.findMany({
      where,
      orderBy: { last_updated_ts: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Search concepts by name
   */
  async searchConceptsByName(userId: string, searchTerm: string, limit: number = 20) {
    return await this.prisma.concepts.findMany({
      where: {
        user_id: userId,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      orderBy: { confidence: 'desc' },
      take: limit,
    });
  }

  /**
   * Create a relationship between concepts
   */
  async createConceptRelationship(data: CreateConceptRelationshipData) {
    try {
      return await this.prisma.concept_relationships.create({
        data: {
          user_id: data.user_id,
          source_concept_id: data.source_concept_id,
          target_concept_id: data.target_concept_id,
          relationship_type: data.relationship_type,
          relationship_label: data.relationship_label,
          weight: data.weight || 1.0,
          context_muid: data.context_muid,
          metadata: data.metadata,
          created_at: new Date(),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new Error('Referenced concept does not exist.');
      }
      if (error.code === 'P2002') {
        throw new Error('Relationship between these concepts already exists.');
      }
      throw error;
    }
  }

  /**
   * Get relationships for a concept
   */
  async getConceptRelationships(conceptId: string, userId: string) {
    return await this.prisma.concept_relationships.findMany({
      where: {
        user_id: userId,
        OR: [
          { source_concept_id: conceptId },
          { target_concept_id: conceptId },
        ],
      },
      include: {
        source_concept: true,
        target_concept: true,
      },
    });
  }

  /**
   * Delete concept (soft delete by setting confidence to 0)
   */
  async softDeleteConcept(conceptId: string, userId: string) {
    return await this.prisma.concepts.update({
      where: { concept_id: conceptId },
      data: {
        confidence: 0,
        last_updated_ts: new Date(),
      },
    });
  }

  /**
   * Update concept confidence
   */
  async updateConceptConfidence(conceptId: string, confidence: number) {
    return await this.prisma.concepts.update({
      where: { concept_id: conceptId },
      data: {
        confidence,
        last_updated_ts: new Date(),
      },
    });
  }
} 