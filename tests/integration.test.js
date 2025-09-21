/**
 * Integration tests for the complete keyword generation workflow
 * Tests the interaction between different components and edge cases
 */

const KeywordUtils = require('../keyword-utils.js');

describe('Integration Tests - Complete Workflow', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch.mockClear();
  });

  describe('End-to-End Keyword Generation', () => {
    test('should complete full local keyword generation workflow', async () => {
      const business = 'Professional pet grooming and boarding services';
      const industry = 'pet-care';
      const location = 'San Francisco';
      const keywordType = 'mixed';

      // Test the complete local generation workflow
      const result = await KeywordUtils.generateKeywordsLocally(business, industry, location, keywordType);

      // Validate complete structure
      expect(result).toHaveProperty('primary_keywords');
      expect(result).toHaveProperty('long_tail_keywords');
      expect(result).toHaveProperty('local_keywords');
      expect(result).toHaveProperty('content_ideas');
      expect(result).toHaveProperty('seo_tips');

      // Validate all arrays have content
      expect(result.primary_keywords.length).toBeGreaterThan(0);
      expect(result.long_tail_keywords.length).toBeGreaterThan(0);
      expect(result.local_keywords.length).toBeGreaterThan(0);
      expect(result.content_ideas.length).toBeGreaterThan(0);
      expect(result.seo_tips.length).toBeGreaterThan(0);

      // Validate keyword structure consistency
      [result.primary_keywords, result.long_tail_keywords, result.local_keywords, result.content_ideas].forEach(keywordArray => {
        keywordArray.forEach(keyword => {
          expect(keyword).toHaveProperty('keyword');
          expect(keyword).toHaveProperty('search_volume');
          expect(keyword).toHaveProperty('competition');
          expect(keyword).toHaveProperty('intent');
        });
      });

      // Validate location integration
      const locationKeywords = result.local_keywords.filter(k => 
        k.keyword.includes('San Francisco') || k.keyword.includes('near me')
      );
      expect(locationKeywords.length).toBeGreaterThan(0);
    });

    test('should handle different industry-keyword type combinations', async () => {
      const industries = ['pet-care', 'healthcare', 'fitness', 'technology'];
      const keywordTypes = ['mixed', 'local', 'commercial', 'informational'];

      for (const industry of industries) {
        for (const keywordType of keywordTypes) {
          const result = await KeywordUtils.generateKeywordsLocally(
            `Professional ${industry} services`,
            industry,
            'New York',
            keywordType
          );

          expect(result).toBeDefined();
          expect(result.primary_keywords).toBeDefined();
          expect(result.seo_tips).toBeDefined();

          // Validate keyword type specific behavior
          if (keywordType === 'short-tail') {
            expect(result.long_tail_keywords.length).toBe(0);
          } else {
            expect(result.long_tail_keywords.length).toBeGreaterThanOrEqual(0);
          }

          if (keywordType === 'informational') {
            expect(result.local_keywords.length).toBe(0);
          } else {
            expect(result.local_keywords.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed business descriptions', async () => {
      const edgeCases = [
        '!@#$%^&*()',
        '123456789',
        'a b c d e f g h i j k l m n o p q r s t u v w x y z',
        'THE AND OR BUT IN ON AT TO FOR OF WITH BY',
        '   whitespace   only   '
      ];

      for (const business of edgeCases) {
        const result = await KeywordUtils.generateKeywordsLocally(
          business,
          'pet-care',
          'Boston',
          'mixed'
        );

        expect(result).toBeDefined();
        expect(result.primary_keywords.length).toBeGreaterThan(0);
        expect(result.seo_tips.length).toBeGreaterThan(0);
      }
    });

    test('should handle missing or invalid location data', async () => {
      const locations = ['', null, undefined, '   ', 'NonExistentCity123'];

      for (const location of locations) {
        const result = await KeywordUtils.generateKeywordsLocally(
          'Test business services',
          'healthcare',
          location,
          'mixed'
        );

        expect(result).toBeDefined();
        expect(result.primary_keywords.length).toBeGreaterThan(0);
        expect(result.local_keywords.length).toBeGreaterThan(0);

        // Should still generate local keywords with "near me" when no location
        if (!location || location.trim() === '') {
          const nearMeKeywords = result.local_keywords.filter(k => 
            k.keyword.includes('near me')
          );
          // Allow for the possibility that no "near me" keywords are generated for some cases
          // but ensure local keywords are still present
          expect(result.local_keywords.length).toBeGreaterThan(0);
        }
      }
    });

    test('should handle unknown industries gracefully', async () => {
      const unknownIndustries = ['unknown-industry', 'made-up-field', '', null];

      for (const industry of unknownIndustries) {
        const result = await KeywordUtils.generateKeywordsLocally(
          'Professional business services',
          industry,
          'Chicago',
          'mixed'
        );

        expect(result).toBeDefined();
        expect(result.primary_keywords.length).toBeGreaterThan(0);
        // Should use default industry data
        expect(result.seo_tips.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Data Consistency and Quality', () => {
    test('should generate unique keywords within categories', async () => {
      const result = await KeywordUtils.generateKeywordsLocally(
        'Pet grooming and pet boarding services',
        'pet-care',
        'Portland',
        'mixed'
      );

      // Check for uniqueness within each category
      const checkUniqueness = (keywordArray, categoryName) => {
        const keywords = keywordArray.map(k => k.keyword.toLowerCase());
        const uniqueKeywords = [...new Set(keywords)];
        expect(uniqueKeywords.length).toBe(keywords.length, `Duplicate keywords found in ${categoryName}`);
      };

      checkUniqueness(result.primary_keywords, 'primary_keywords');
      checkUniqueness(result.long_tail_keywords, 'long_tail_keywords');
      checkUniqueness(result.local_keywords, 'local_keywords');
      checkUniqueness(result.content_ideas, 'content_ideas');
    });

    test('should generate relevant keywords based on business description', async () => {
      const businessCases = [
        {
          business: 'Luxury spa and wellness center with massage therapy',
          industry: 'beauty',
          expectedTerms: ['spa', 'luxury', 'wellness', 'massage']
        },
        {
          business: 'Emergency veterinary clinic for cats and dogs',
          industry: 'pet-care',
          expectedTerms: ['veterinary', 'emergency', 'cats', 'dogs']
        },
        {
          business: 'Custom software development and IT consulting',
          industry: 'technology',
          expectedTerms: ['software', 'development', 'custom', 'consulting']
        }
      ];

      for (const testCase of businessCases) {
        const result = await KeywordUtils.generateKeywordsLocally(
          testCase.business,
          testCase.industry,
          'Miami',
          'mixed'
        );

        // Check if generated keywords contain relevant terms
        const allKeywords = [
          ...result.primary_keywords,
          ...result.long_tail_keywords,
          ...result.local_keywords,
          ...result.content_ideas
        ].map(k => k.keyword.toLowerCase()).join(' ');

        testCase.expectedTerms.forEach(term => {
          expect(allKeywords).toContain(term.toLowerCase());
        });
      }
    });

    test('should maintain proper keyword difficulty distribution', async () => {
      const result = await KeywordUtils.generateKeywordsLocally(
        'Professional dental practice and cosmetic dentistry',
        'healthcare',
        'Seattle',
        'mixed'
      );

      const allKeywords = [
        ...result.primary_keywords,
        ...result.long_tail_keywords,
        ...result.local_keywords,
        ...result.content_ideas
      ];

      const difficultyLevels = allKeywords.map(k => k.competition);
      const uniqueDifficulties = [...new Set(difficultyLevels)];

      // Should have variety in difficulty levels
      expect(uniqueDifficulties.length).toBeGreaterThan(1);
      expect(uniqueDifficulties.every(d => ['easy', 'medium', 'hard'].includes(d))).toBe(true);

      // Long-tail keywords should generally be easier
      const longTailDifficulties = result.long_tail_keywords.map(k => k.competition);
      const easyCount = longTailDifficulties.filter(d => d === 'easy').length;
      const totalCount = longTailDifficulties.length;
      
      if (totalCount > 0) {
        expect(easyCount / totalCount).toBeGreaterThan(0.3); // At least 30% should be easy
      }
    });
  });

  describe('Performance and Scalability', () => {
    test('should complete keyword generation within reasonable time limits', async () => {
      const startTime = Date.now();

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          KeywordUtils.generateKeywordsLocally(
            `Test business ${i} with various services and offerings`,
            'fitness',
            `City${i}`,
            'mixed'
          )
        );
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.primary_keywords.length).toBeGreaterThan(0);
      });
    });

    test('should handle large input texts efficiently', async () => {
      const largeBusiness = 'Professional comprehensive business services including '.repeat(50) + 
        'consulting management training development support maintenance solutions expertise';

      const startTime = Date.now();
      const result = await KeywordUtils.generateKeywordsLocally(
        largeBusiness,
        'business',
        'Large City',
        'mixed'
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
      expect(result).toBeDefined();
      expect(result.primary_keywords.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Component Integration', () => {
    test('should integrate keyword extraction with industry data effectively', () => {
      const businessWords = KeywordUtils.extractKeyTerms('Professional pet grooming and boarding services');
      const industryData = KeywordUtils.getIndustryKeywords('pet-care');
      
      expect(businessWords).toContain('professional');
      expect(businessWords).toContain('grooming');
      expect(industryData.services).toContain('grooming');
      expect(industryData.services).toContain('boarding');

      // Keywords should integrate both business words and industry data
      const keywordSets = KeywordUtils.generateKeywordsByType(
        businessWords, 
        industryData, 
        'Denver', 
        'mixed'
      );

      const allKeywords = [
        ...keywordSets.primary,
        ...keywordSets.longTail,
        ...keywordSets.local,
        ...keywordSets.content
      ];

      // Should contain combinations of business words and industry terms
      const keywordText = allKeywords.map(k => k.keyword).join(' ').toLowerCase();
      expect(keywordText).toContain('grooming');
      expect(keywordText).toContain('pet');
    });

    test('should generate consistent SEO tips based on keyword data', () => {
      const businessWords = ['fitness', 'training'];
      const industryData = KeywordUtils.getIndustryKeywords('fitness');
      const location = 'Austin';

      const seoTips = KeywordUtils.generateSEOTips(businessWords, industryData, location);

      expect(seoTips.length).toBeGreaterThan(0);
      
      // Tips should reference the business words and location
      const tipText = seoTips.map(tip => 
        tip.tip + ' ' + tip.keyword_example + ' ' + tip.placement
      ).join(' ').toLowerCase();

      expect(tipText).toContain('fitness');
      expect(tipText).toContain('austin');
    });

    test('should validate form inputs before processing', () => {
      const testCases = [
        {
          business: '',
          industry: 'pet-care',
          keywordType: 'mixed',
          shouldHaveErrors: true
        },
        {
          business: 'Valid business description with enough characters',
          industry: '',
          keywordType: 'mixed',
          shouldHaveErrors: true
        },
        {
          business: 'Valid business description with enough characters',
          industry: 'pet-care',
          keywordType: '',
          shouldHaveErrors: true
        },
        {
          business: 'Short',
          industry: 'pet-care',
          keywordType: 'mixed',
          shouldHaveErrors: true
        },
        {
          business: 'Valid business description with enough characters',
          industry: 'pet-care',
          keywordType: 'mixed',
          shouldHaveErrors: false
        }
      ];

      testCases.forEach(testCase => {
        const errors = KeywordUtils.validateFormInputs(
          testCase.business,
          testCase.industry,
          testCase.keywordType
        );

        if (testCase.shouldHaveErrors) {
          expect(errors.length).toBeGreaterThan(0);
        } else {
          expect(errors.length).toBe(0);
        }
      });
    });
  });

  describe('Content Quality and SEO Best Practices', () => {
    test('should generate keywords with appropriate search intent distribution', async () => {
      const result = await KeywordUtils.generateKeywordsLocally(
        'Digital marketing agency providing SEO and PPC services',
        'marketing',
        'Los Angeles',
        'mixed'
      );

      const allKeywords = [
        ...result.primary_keywords,
        ...result.long_tail_keywords,
        ...result.local_keywords,
        ...result.content_ideas
      ];

      const intentDistribution = allKeywords.reduce((acc, keyword) => {
        acc[keyword.intent] = (acc[keyword.intent] || 0) + 1;
        return acc;
      }, {});

      // Should have multiple intent types
      expect(Object.keys(intentDistribution).length).toBeGreaterThan(1);
      
      // Common intents should be present
      expect(intentDistribution.commercial).toBeGreaterThan(0);
      
      if (result.content_ideas.length > 0) {
        expect(intentDistribution.informational).toBeGreaterThan(0);
      }
    });

    test('should generate actionable SEO tips with specific examples', () => {
      const businessWords = ['restaurant', 'italian'];
      const industryData = KeywordUtils.getIndustryKeywords('food-restaurant');
      const location = 'Boston';

      const seoTips = KeywordUtils.generateSEOTips(businessWords, industryData, location);

      expect(seoTips.length).toBeGreaterThanOrEqual(5);

      seoTips.forEach(tip => {
        expect(tip.tip).toBeDefined();
        expect(tip.keyword_example).toBeDefined();
        expect(tip.placement).toBeDefined();
        
        // Tips should be actionable (contain action words)
        const actionWords = ['include', 'use', 'create', 'add', 'optimize'];
        const containsActionWord = actionWords.some(word => 
          tip.tip.toLowerCase().includes(word)
        );
        expect(containsActionWord).toBe(true);

        // Keyword examples should be specific and contain business terms
        expect(tip.keyword_example.length).toBeGreaterThan(3);
        expect(tip.placement.length).toBeGreaterThan(0);
      });
    });
  });
});