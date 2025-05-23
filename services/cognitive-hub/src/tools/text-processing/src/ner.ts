/**
 * Named Entity Recognition (NER) Tool for 2dots1line V7
 * 
 * Sprint 3 Implementation: Basic pattern-based entity recognition
 * Future Sprints: Will be enhanced with spaCy, Stanford NER, or LLM-based models
 */

import { Tool } from '@2dots1line/shared-types';

export interface EntityResult {
  text: string;
  type: string;
  confidence: number;
  startPos: number;
  endPos: number;
  context?: string;
}

export interface NERInput {
  text: string;
  entityTypes?: string[]; // Optional filter for specific entity types
}

export interface NEROutput {
  entities: EntityResult[];
  success: boolean;
  error?: string;
  processingTimeMs?: number;
}

/**
 * Basic NER implementation for Sprint 3
 * Uses pattern matching and natural library for entity recognition
 * 
 * Supported entity types:
 * - PERSON: Names of people (capitalized words, name patterns)
 * - ORGANIZATION: Company/org names (Inc, LLC, Corp, etc.)
 * - LOCATION: Places (countries, cities, states)
 * - DATE: Date expressions
 * - EMAIL: Email addresses
 * - PHONE: Phone numbers
 * - URL: Web URLs
 */
export class BasicNERTool {
  private readonly patterns = {
    // Person patterns - Sprint 3 focus: "capitalized words"
    PERSON: [
      // Full names (First Last, First Middle Last) - more precise
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
      /\b[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+\b/g,
      // Three word names (First Middle Last)
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
      // Single capitalized names when followed by action verbs
      /\b[A-Z][a-z]{2,}(?=\s+(?:said|wrote|created|founded|developed|designed|built))/g,
    ],
    
    ORGANIZATION: [
      // Company names with suffixes - much more precise matching
      /\b[A-Z][A-Za-z\s&]{2,25}(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd|Limited|Group|Associates|Partners|Foundation|Institute|University|College)\.?\b/g,
      // Well-known organizations - individual matching to avoid false positives
      /\bGoogle\b(?!\s+(?:Inc|Corp|LLC))/g,
      /\bApple\b(?!\s+(?:Inc|Corp|LLC))/g,
      /\bMicrosoft\b(?!\s+(?:Inc|Corp|LLC))/g,
      /\bAmazon\b(?!\s+(?:Inc|Corp|LLC))/g,
      /\bFacebook\b(?!\s+(?:Inc|Corp|LLC))/g,
      /\bMeta\b(?!\s+(?:Inc|Corp|LLC))/g,
      /\bTesla\b(?!\s+(?:Inc|Corp|LLC))/g,
      /\bSpaceX\b(?!\s+(?:Inc|Corp|LLC))/g,
      /\bNASA\b/g,
      /\bFBI\b/g,
      /\bCIA\b/g,
      /\bNATO\b/g,
      /\bUN\b/g,
      /\bWHO\b/g,
    ],
    
    LOCATION: [
      // Countries, states, cities (basic patterns)
      /\b(?:United States|USA|UK|United Kingdom|Canada|Australia|Germany|France|Japan|China|India|Brazil|Russia|Italy|Spain|Netherlands|Sweden|Norway|Denmark|Finland|Switzerland|Austria|Belgium|Portugal|Ireland|Poland|Czech Republic|Hungary|Romania|Bulgaria|Greece|Turkey|Israel|Egypt|South Africa|Nigeria|Kenya|Morocco|Mexico|Argentina|Chile|Peru|Colombia|Venezuela|Ecuador|Uruguay|Paraguay|Bolivia|New York|California|Texas|Florida|London|Paris|Berlin|Tokyo|Sydney|Toronto|Vancouver|Amsterdam|Stockholm|Oslo|Copenhagen|Helsinki|Zurich|Vienna|Brussels|Lisbon|Dublin|Warsaw|Prague|Budapest|Bucharest|Sofia|Athens|Istanbul|Tel Aviv|Cairo|Cape Town|Lagos|Nairobi|Casablanca|Mexico City|Buenos Aires|Santiago|Lima|Bogotá|Caracas|Quito|Montevideo|Asunción|La Paz)\b/g,
    ],
    
    DATE: [
      // Various date formats
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b(?:today|yesterday|tomorrow|last week|next week|last month|next month|last year|next year)\b/gi,
    ],
    
    EMAIL: [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ],
    
    PHONE: [
      /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
      /\b\+?[1-9]\d{1,14}\b/g, // International format
    ],
    
    URL: [
      /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/g,
      /www\.[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/g,
    ],
  };

  /**
   * Extract entities from text using pattern matching
   */
  async extractEntities(input: NERInput): Promise<NEROutput> {
    const startTime = performance.now();
    
    try {
      const { text, entityTypes } = input;
      const entities: EntityResult[] = [];
      
      // Determine which entity types to process
      const typesToProcess = entityTypes || Object.keys(this.patterns);
      
      for (const entityType of typesToProcess) {
        if (!this.patterns[entityType as keyof typeof this.patterns]) {
          continue;
        }
        
        const patterns = this.patterns[entityType as keyof typeof this.patterns];
        
        for (const pattern of patterns) {
          let match;
          // Reset the regex for each iteration
          pattern.lastIndex = 0;
          
          while ((match = pattern.exec(text)) !== null) {
            const entityText = match[0].trim();
            
            // Skip very short matches for person names
            if (entityType === 'PERSON' && entityText.length < 3) {
              continue;
            }
            
            // Calculate confidence based on entity type and pattern specificity
            const confidence = this.calculateConfidence(entityType, entityText, text);
            
            // Extract context (surrounding words)
            const context = this.extractContext(text, match.index, entityText.length);
            
            entities.push({
              text: entityText,
              type: entityType,
              confidence,
              startPos: match.index,
              endPos: match.index + entityText.length,
              context
            });
          }
        }
      }
      
      // Remove duplicates and overlaps
      const deduplicatedEntities = this.deduplicateEntities(entities);
      
      // Sort by position in text
      deduplicatedEntities.sort((a, b) => a.startPos - b.startPos);
      
      const processingTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      
      return {
        entities: deduplicatedEntities,
        success: true,
        processingTimeMs
      };
      
    } catch (error) {
      return {
        entities: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in NER processing',
        processingTimeMs: Math.round((performance.now() - startTime) * 100) / 100
      };
    }
  }

  /**
   * Calculate confidence score for an entity based on type and context
   */
  private calculateConfidence(entityType: string, entityText: string, fullText: string): number {
    let confidence = 0.5; // Base confidence
    
    switch (entityType) {
      case 'PERSON':
        // Higher confidence for full names (First Last)
        if (/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(entityText)) {
          confidence = 0.8;
        }
        // Medium confidence for single names in action context
        else if (/(?:said|wrote|created|founded|developed|designed|built)/.test(fullText)) {
          confidence = 0.7;
        }
        break;
        
      case 'EMAIL':
      case 'URL':
      case 'PHONE':
        confidence = 0.9; // High confidence for structured patterns
        break;
        
      case 'DATE':
        confidence = 0.85;
        break;
        
      case 'ORGANIZATION':
        // Higher confidence for names with company suffixes
        if (/(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd|Limited)\.?$/i.test(entityText)) {
          confidence = 0.9;
        } else {
          confidence = 0.7;
        }
        break;
        
      case 'LOCATION':
        confidence = 0.75;
        break;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Extract surrounding context for an entity
   */
  private extractContext(text: string, startPos: number, entityLength: number): string {
    const contextWindow = 50; // characters on each side
    const start = Math.max(0, startPos - contextWindow);
    const end = Math.min(text.length, startPos + entityLength + contextWindow);
    
    let context = text.substring(start, end);
    
    // Add ellipsis if we truncated
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context.trim();
  }

  /**
   * Remove duplicate and overlapping entities, keeping the highest confidence
   */
  private deduplicateEntities(entities: EntityResult[]): EntityResult[] {
    const deduplicated: EntityResult[] = [];
    
    // Sort by confidence descending to prioritize higher confidence entities
    const sortedEntities = entities.sort((a, b) => b.confidence - a.confidence);
    
    for (const entity of sortedEntities) {
      let shouldAdd = true;
      
      for (let i = 0; i < deduplicated.length; i++) {
        const existing = deduplicated[i];
        
        // Check for exact text match (case insensitive)
        if (entity.text.toLowerCase() === existing.text.toLowerCase()) {
          shouldAdd = false;
          break;
        }
        
        // Check for significant overlap (one entity is contained within another)
        const entityOverlaps = (entity.startPos < existing.endPos && entity.endPos > existing.startPos);
        
        if (entityOverlaps) {
          const overlapLength = Math.min(entity.endPos, existing.endPos) - Math.max(entity.startPos, existing.startPos);
          const entityLength = entity.endPos - entity.startPos;
          const existingLength = existing.endPos - existing.startPos;
          
          // If overlap is significant (>50% of either entity)
          const overlapPercentage = Math.max(overlapLength / entityLength, overlapLength / existingLength);
          
          if (overlapPercentage > 0.5) {
            // Keep the more specific/shorter entity with higher confidence
            if (entity.confidence > existing.confidence || 
                (entity.confidence === existing.confidence && entityLength < existingLength)) {
              // Replace the existing entity with this one
              deduplicated[i] = entity;
            }
            shouldAdd = false;
            break;
          }
        }
        
        // Special case: if one entity contains another exactly, prefer the shorter one
        if (existing.text.includes(entity.text) || entity.text.includes(existing.text)) {
          const shorterEntity = entity.text.length < existing.text.length ? entity : existing;
          const longerEntity = entity.text.length >= existing.text.length ? entity : existing;
          
          // If the shorter entity is a proper subset and has appropriate type
          if (longerEntity.text.includes(shorterEntity.text)) {
            if (shorterEntity.confidence >= longerEntity.confidence * 0.8) { // Allow some confidence tolerance
              if (entity === shorterEntity) {
                // Replace existing with the shorter, more precise entity
                deduplicated[i] = entity;
              }
              shouldAdd = false;
              break;
            }
          }
        }
      }
      
      if (shouldAdd) {
        deduplicated.push(entity);
      }
    }
    
    return deduplicated;
  }
}

/**
 * Factory function to create NER tool instance
 */
export function createNERTool(): BasicNERTool {
  return new BasicNERTool();
}

/**
 * Tool wrapper for the tool registry
 */
export const nerTool: Tool = {
  name: 'ner-basic',
  description: 'Basic Named Entity Recognition tool using pattern matching',
  version: '1.0.0',
  execute: async (input: any) => {
    const tool = createNERTool();
    return await tool.extractEntities(input);
  }
};

// Convenience function for direct use
export async function extractEntities(text: string, entityTypes?: string[]): Promise<EntityResult[]> {
  const tool = createNERTool();
  const result = await tool.extractEntities({ text, entityTypes });
  
  if (!result.success) {
    console.warn('NER extraction failed:', result.error);
    return [];
  }
  
  return result.entities;
}

// Example usage:
// const entities = await extractEntities("Elon Musk founded SpaceX and Tesla.");
// console.log(entities); // Will extract "Elon Musk" as PERSON, "SpaceX" and "Tesla" as ORGANIZATION 