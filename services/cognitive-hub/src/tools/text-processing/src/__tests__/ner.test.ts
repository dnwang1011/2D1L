/**
 * Unit tests for NER Tool
 */

import { createNERTool, extractEntities } from '../ner';

describe('NER Tool', () => {
  let nerTool: ReturnType<typeof createNERTool>;

  beforeEach(() => {
    nerTool = createNERTool();
  });

  describe('Person Entity Recognition', () => {
    it('should extract full names (Sprint 3 requirement: capitalized words)', async () => {
      const text = "Elon Musk founded SpaceX and John Smith works at Apple.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['PERSON'] });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.entities[0].text).toBe('Elon Musk');
      expect(result.entities[0].type).toBe('PERSON');
      expect(result.entities[1].text).toBe('John Smith');
      expect(result.entities[1].type).toBe('PERSON');
    });

    it('should extract single names when followed by action verbs', async () => {
      const text = "Einstein said that imagination is more important than knowledge.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['PERSON'] });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].text).toBe('Einstein');
      expect(result.entities[0].type).toBe('PERSON');
    });

    it('should provide confidence scores for person entities', async () => {
      const text = "Elon Musk founded SpaceX.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['PERSON'] });
      
      expect(result.success).toBe(true);
      expect(result.entities[0].confidence).toBeGreaterThan(0.5);
      expect(result.entities[0].confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Organization Entity Recognition', () => {
    it('should extract organizations with company suffixes', async () => {
      const text = "I work at Microsoft Corp and my friend works at Apple Inc.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['ORGANIZATION'] });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.entities.some(e => e.text.includes('Microsoft'))).toBe(true);
      expect(result.entities.some(e => e.text.includes('Apple'))).toBe(true);
    });

    it('should extract well-known organizations', async () => {
      const text = "SpaceX and Tesla are companies founded by Elon Musk.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['ORGANIZATION'] });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.entities[0].text).toBe('SpaceX');
      expect(result.entities[1].text).toBe('Tesla');
    });
  });

  describe('Location Entity Recognition', () => {
    it('should extract common locations', async () => {
      const text = "I traveled from New York to London last month.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['LOCATION'] });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.entities.some(e => e.text === 'New York')).toBe(true);
      expect(result.entities.some(e => e.text === 'London')).toBe(true);
    });
  });

  describe('Date Entity Recognition', () => {
    it('should extract various date formats', async () => {
      const text = "The meeting is on January 15, 2024 and the deadline is 12/31/2023.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['DATE'] });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(2);
      expect(result.entities.some(e => e.text === 'January 15, 2024')).toBe(true);
      expect(result.entities.some(e => e.text === '12/31/2023')).toBe(true);
    });
  });

  describe('Email and URL Recognition', () => {
    it('should extract email addresses', async () => {
      const text = "Contact me at john.doe@example.com for more information.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['EMAIL'] });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].text).toBe('john.doe@example.com');
      expect(result.entities[0].type).toBe('EMAIL');
    });

    it('should extract URLs', async () => {
      const text = "Visit our website at https://example.com for more details.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['URL'] });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].text).toBe('https://example.com');
      expect(result.entities[0].type).toBe('URL');
    });
  });

  describe('Multiple Entity Types', () => {
    it('should extract all entity types from complex text', async () => {
      const text = "Elon Musk (elon@spacex.com) founded SpaceX in California on June 28, 2002. Visit https://spacex.com for more info.";
      const result = await nerTool.extractEntities({ text });
      
      expect(result.success).toBe(true);
      expect(result.entities.length).toBeGreaterThan(4);
      
      // Check for different entity types
      const entityTypes = result.entities.map(e => e.type);
      expect(entityTypes).toContain('PERSON');
      expect(entityTypes).toContain('EMAIL');
      expect(entityTypes).toContain('ORGANIZATION');
      expect(entityTypes).toContain('LOCATION');
      expect(entityTypes).toContain('URL');
    });
  });

  describe('Context Extraction', () => {
    it('should provide context for extracted entities', async () => {
      const text = "The famous physicist Albert Einstein developed the theory of relativity.";
      const result = await nerTool.extractEntities({ text, entityTypes: ['PERSON'] });
      
      expect(result.success).toBe(true);
      expect(result.entities[0].context).toBeDefined();
      expect(result.entities[0].context).toContain('Einstein');
    });
  });

  describe('Convenience Function', () => {
    it('should work with the convenience extractEntities function', async () => {
      const entities = await extractEntities("John Doe works at Microsoft Corp.");
      
      expect(entities.length).toBeGreaterThan(0);
      expect(entities.some(e => e.text === 'John Doe')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty input gracefully', async () => {
      const result = await nerTool.extractEntities({ text: '' });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(0);
    });

    it('should handle invalid entity types gracefully', async () => {
      const result = await nerTool.extractEntities({ 
        text: "Some text", 
        entityTypes: ['INVALID_TYPE'] 
      });
      
      expect(result.success).toBe(true);
      expect(result.entities).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should provide processing time metrics', async () => {
      const text = "This is a test sentence with various entities like John Doe and Microsoft Corp.";
      const result = await nerTool.extractEntities({ text });
      
      expect(result.success).toBe(true);
      expect(result.processingTimeMs).toBeDefined();
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });
  });
}); 