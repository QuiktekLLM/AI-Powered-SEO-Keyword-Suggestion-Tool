/**
 * Unit tests for core keyword generation functionality
 */

const KeywordUtils = require('../keyword-utils.js');

describe('extractKeyTerms', () => {
  test('should extract key terms from business description', () => {
    const business = 'Professional pet grooming services for dogs and cats';
    const result = KeywordUtils.extractKeyTerms(business);
    
    expect(result).toContain('professional');
    expect(result).toContain('pet');
    expect(result).toContain('grooming');
    expect(result).toContain('services');
    expect(result).toContain('dogs');
    expect(result.length).toBeLessThanOrEqual(5);
  });
  
  test('should filter out common words', () => {
    const business = 'The best and most affordable services for all your needs';
    const result = KeywordUtils.extractKeyTerms(business);
    
    expect(result).not.toContain('the');
    expect(result).not.toContain('and');
    expect(result).not.toContain('for');
    expect(result).not.toContain('all');
    expect(result).not.toContain('your');
  });
  
  test('should handle empty or short input', () => {
    expect(KeywordUtils.extractKeyTerms('')).toEqual([]);
    expect(KeywordUtils.extractKeyTerms('ab')).toEqual([]);
    expect(KeywordUtils.extractKeyTerms('a b c')).toEqual([]);
  });
  
  test('should handle special characters and normalize text', () => {
    const business = 'High-end! Beauty & Wellness Services @NYC';
    const result = KeywordUtils.extractKeyTerms(business);
    
    expect(result).toContain('high');
    expect(result).toContain('end');
    expect(result).toContain('beauty');
    expect(result).toContain('wellness');
    expect(result).toContain('services');
  });
});

describe('getIndustryKeywords', () => {
  test('should return correct keywords for pet-care industry', () => {
    const result = KeywordUtils.getIndustryKeywords('pet-care');
    
    expect(result.services).toContain('grooming');
    expect(result.services).toContain('boarding');
    expect(result.adjectives).toContain('professional');
    expect(result.terms).toContain('pet care');
  });
  
  test('should return correct keywords for healthcare industry', () => {
    const result = KeywordUtils.getIndustryKeywords('healthcare');
    
    expect(result.services).toContain('treatment');
    expect(result.adjectives).toContain('medical');
    expect(result.terms).toContain('health');
  });
  
  test('should return default keywords for unknown industry', () => {
    const result = KeywordUtils.getIndustryKeywords('unknown-industry');
    
    expect(result.services).toContain('service');
    expect(result.adjectives).toContain('professional');
    expect(result.terms).toContain('business');
  });
  
  test('should have consistent structure for all industries', () => {
    const industries = ['pet-care', 'healthcare', 'fitness', 'technology'];
    
    industries.forEach(industry => {
      const result = KeywordUtils.getIndustryKeywords(industry);
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('adjectives');
      expect(result).toHaveProperty('terms');
      expect(Array.isArray(result.services)).toBe(true);
      expect(Array.isArray(result.adjectives)).toBe(true);
      expect(Array.isArray(result.terms)).toBe(true);
    });
  });
});

describe('randomVolume', () => {
  test('should generate volume within specified range', () => {
    for (let i = 0; i < 100; i++) {
      const result = KeywordUtils.randomVolume(100, 1000);
      const numValue = result.includes('k') ? 
        parseFloat(result.replace('k', '')) * 1000 : 
        parseInt(result);
      
      expect(numValue).toBeGreaterThanOrEqual(100);
      expect(numValue).toBeLessThanOrEqual(1000);
    }
  });
  
  test('should format large numbers with k suffix', () => {
    // Mock Math.random to return specific values
    const originalRandom = Math.random;
    Math.random = () => 0.5; // Middle value
    
    const result = KeywordUtils.randomVolume(1000, 2000);
    expect(result).toMatch(/^\d+\.\d+k$/);
    
    Math.random = originalRandom;
  });
  
  test('should return string numbers for values less than 1000', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.5; // Middle value
    
    const result = KeywordUtils.randomVolume(100, 500);
    expect(result).toMatch(/^\d+$/);
    expect(result).not.toContain('k');
    
    Math.random = originalRandom;
  });
});

describe('randomDifficulty', () => {
  test('should return valid difficulty levels', () => {
    const validDifficulties = ['easy', 'medium', 'hard'];
    
    for (let i = 0; i < 50; i++) {
      const result = KeywordUtils.randomDifficulty();
      expect(validDifficulties).toContain(result);
    }
  });
  
  test('should return all difficulty levels over multiple calls', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(KeywordUtils.randomDifficulty());
    }
    
    expect(results.has('easy')).toBe(true);
    expect(results.has('medium')).toBe(true);
    expect(results.has('hard')).toBe(true);
  });
});

describe('generateKeywordsByType', () => {
  const businessWords = ['grooming', 'pet'];
  const industryData = {
    services: ['grooming', 'boarding', 'training'],
    adjectives: ['professional', 'certified', 'affordable'],
    terms: ['pet care', 'animal care']
  };
  
  test('should generate keywords for mixed type', () => {
    const result = KeywordUtils.generateKeywordsByType(businessWords, industryData, 'New York', 'mixed');
    
    expect(result.primary).toBeDefined();
    expect(result.longTail).toBeDefined();
    expect(result.local).toBeDefined();
    expect(result.content).toBeDefined();
    
    expect(result.primary.length).toBeGreaterThan(0);
    expect(result.longTail.length).toBeGreaterThan(0);
    expect(result.local.length).toBeGreaterThan(0);
    expect(result.content.length).toBeGreaterThan(0);
  });
  
  test('should limit keywords to maximum of 6 per category', () => {
    const result = KeywordUtils.generateKeywordsByType(businessWords, industryData, 'New York', 'mixed');
    
    expect(result.primary.length).toBeLessThanOrEqual(6);
    expect(result.longTail.length).toBeLessThanOrEqual(6);
    expect(result.local.length).toBeLessThanOrEqual(6);
    expect(result.content.length).toBeLessThanOrEqual(6);
  });
  
  test('should include location in local keywords when provided', () => {
    const result = KeywordUtils.generateKeywordsByType(businessWords, industryData, 'New York', 'local');
    
    const hasLocationKeywords = result.local.some(keyword => 
      keyword.keyword.includes('New York')
    );
    expect(hasLocationKeywords).toBe(true);
  });
  
  test('should generate proper keyword structure', () => {
    const result = KeywordUtils.generateKeywordsByType(businessWords, industryData, 'New York', 'mixed');
    
    result.primary.forEach(keyword => {
      expect(keyword).toHaveProperty('keyword');
      expect(keyword).toHaveProperty('search_volume');
      expect(keyword).toHaveProperty('competition');
      expect(keyword).toHaveProperty('intent');
      expect(typeof keyword.keyword).toBe('string');
      expect(typeof keyword.search_volume).toBe('string');
      expect(['easy', 'medium', 'hard']).toContain(keyword.competition);
      // Allow for different intent types as the logic might vary
      expect(['commercial', 'informational', 'local', 'navigational']).toContain(keyword.intent);
    });
  });
  
  test('should not generate long-tail keywords for short-tail type', () => {
    const result = KeywordUtils.generateKeywordsByType(businessWords, industryData, 'New York', 'short-tail');
    
    expect(result.longTail.length).toBe(0);
  });
  
  test('should not generate local keywords for informational type', () => {
    const result = KeywordUtils.generateKeywordsByType(businessWords, industryData, 'New York', 'informational');
    
    expect(result.local.length).toBe(0);
  });
});

describe('generateSEOTips', () => {
  const businessWords = ['grooming', 'pet'];
  const industryData = {
    services: ['grooming', 'boarding'],
    adjectives: ['professional', 'certified'],
    terms: ['pet care']
  };
  
  test('should generate SEO tips with proper structure', () => {
    const result = KeywordUtils.generateSEOTips(businessWords, industryData, 'New York');
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    result.forEach(tip => {
      expect(tip).toHaveProperty('tip');
      expect(tip).toHaveProperty('keyword_example');
      expect(tip).toHaveProperty('placement');
      expect(typeof tip.tip).toBe('string');
      expect(typeof tip.keyword_example).toBe('string');
      expect(typeof tip.placement).toBe('string');
    });
  });
  
  test('should include location in keyword examples when provided', () => {
    const result = KeywordUtils.generateSEOTips(businessWords, industryData, 'New York');
    
    const hasLocationTips = result.some(tip => 
      tip.keyword_example.includes('New York')
    );
    expect(hasLocationTips).toBe(true);
  });
  
  test('should handle missing location gracefully', () => {
    const result = KeywordUtils.generateSEOTips(businessWords, industryData, null);
    
    expect(result.length).toBeGreaterThan(0);
    result.forEach(tip => {
      expect(tip.keyword_example).toBeDefined();
      expect(tip.keyword_example.length).toBeGreaterThan(0);
    });
  });
});

describe('createPrompt', () => {
  test('should create properly formatted prompt', () => {
    const result = KeywordUtils.createPrompt('Pet grooming services', 'pet-care', 'New York', 'mixed');
    
    expect(result).toContain('Pet grooming services');
    expect(result).toContain('pet-care');
    expect(result).toContain('New York');
    expect(result).toContain('mixed');
    expect(result).toContain('JSON response');
    expect(result).toContain('primary_keywords');
    expect(result).toContain('long_tail_keywords');
  });
  
  test('should handle missing location', () => {
    const result = KeywordUtils.createPrompt('Pet grooming', 'pet-care', '', 'mixed');
    
    expect(result).toContain('Not specified');
  });
  
  test('should include all required JSON structure fields', () => {
    const result = KeywordUtils.createPrompt('Test business', 'healthcare', 'Boston', 'commercial');
    
    const requiredFields = [
      'primary_keywords',
      'long_tail_keywords', 
      'local_keywords',
      'content_ideas',
      'seo_tips'
    ];
    
    requiredFields.forEach(field => {
      expect(result).toContain(field);
    });
  });
});

describe('escapeHtml', () => {
  test('should escape HTML special characters', () => {
    const input = '<script>alert("test")</script>';
    const result = KeywordUtils.escapeHtml(input);
    
    expect(result).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
  });
  
  test('should escape ampersand', () => {
    const input = 'Beauty & Wellness';
    const result = KeywordUtils.escapeHtml(input);
    
    expect(result).toBe('Beauty &amp; Wellness');
  });
  
  test('should handle null and undefined inputs', () => {
    expect(KeywordUtils.escapeHtml(null)).toBe('');
    expect(KeywordUtils.escapeHtml(undefined)).toBe('');
  });
  
  test('should handle non-string inputs', () => {
    expect(KeywordUtils.escapeHtml(123)).toBe('123');
    expect(KeywordUtils.escapeHtml(true)).toBe('true');
  });
});

describe('validateFormInputs', () => {
  test('should pass validation with valid inputs', () => {
    const errors = KeywordUtils.validateFormInputs(
      'Professional pet grooming services',
      'pet-care',
      'mixed'
    );
    
    expect(errors).toEqual([]);
  });
  
  test('should fail validation with missing business description', () => {
    const errors = KeywordUtils.validateFormInputs('', 'pet-care', 'mixed');
    
    expect(errors).toContain('Business description is required');
  });
  
  test('should fail validation with missing industry', () => {
    const errors = KeywordUtils.validateFormInputs('Valid business description', '', 'mixed');
    
    expect(errors).toContain('Industry selection is required');
  });
  
  test('should fail validation with missing keyword type', () => {
    const errors = KeywordUtils.validateFormInputs('Valid business description', 'pet-care', '');
    
    expect(errors).toContain('Keyword type selection is required');
  });
  
  test('should fail validation with short business description', () => {
    const errors = KeywordUtils.validateFormInputs('Short', 'pet-care', 'mixed');
    
    expect(errors).toContain('Business description should be at least 10 characters');
  });
  
  test('should return multiple errors when multiple fields are invalid', () => {
    const errors = KeywordUtils.validateFormInputs('', '', '');
    
    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('Business description is required');
    expect(errors).toContain('Industry selection is required');
    expect(errors).toContain('Keyword type selection is required');
  });
});

describe('generateKeywordsLocally', () => {
  test('should generate complete keyword data structure', async () => {
    const result = await KeywordUtils.generateKeywordsLocally(
      'Professional pet grooming services', 
      'pet-care', 
      'New York', 
      'mixed'
    );
    
    expect(result).toHaveProperty('primary_keywords');
    expect(result).toHaveProperty('long_tail_keywords');
    expect(result).toHaveProperty('local_keywords');
    expect(result).toHaveProperty('content_ideas');
    expect(result).toHaveProperty('seo_tips');
    
    expect(Array.isArray(result.primary_keywords)).toBe(true);
    expect(Array.isArray(result.long_tail_keywords)).toBe(true);
    expect(Array.isArray(result.local_keywords)).toBe(true);
    expect(Array.isArray(result.content_ideas)).toBe(true);
    expect(Array.isArray(result.seo_tips)).toBe(true);
  });
  
  test('should handle different keyword types', async () => {
    const keywordTypes = ['mixed', 'local', 'commercial', 'informational'];
    
    for (const type of keywordTypes) {
      const result = await KeywordUtils.generateKeywordsLocally(
        'Test business description',
        'healthcare',
        'Boston',
        type
      );
      
      expect(result).toBeDefined();
      expect(result.primary_keywords).toBeDefined();
    }
  });
  
  test('should generate keywords without location', async () => {
    const result = await KeywordUtils.generateKeywordsLocally(
      'Online fitness coaching services',
      'fitness',
      '',
      'mixed'
    );
    
    expect(result).toBeDefined();
    expect(result.primary_keywords.length).toBeGreaterThan(0);
  });
  
  test('should complete within reasonable time', async () => {
    const startTime = Date.now();
    
    await KeywordUtils.generateKeywordsLocally(
      'Test business',
      'technology',
      'Seattle',
      'mixed'
    );
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
  });
});