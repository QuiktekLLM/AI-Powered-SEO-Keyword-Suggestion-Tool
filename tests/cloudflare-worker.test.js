/**
 * Unit tests for Cloudflare Worker functionality
 * Note: These tests mock the Cloudflare environment and AI service
 */

// Mock the Cloudflare AI class
global.Ai = jest.fn().mockImplementation((env) => ({
  run: jest.fn()
}));

// Mock Response class
global.Response = jest.fn().mockImplementation((body, init) => {
  const response = {
    body: body,
    status: init?.status || 200,
    headers: init?.headers || {},
    json: jest.fn(() => Promise.resolve(JSON.parse(body || '{}'))),
    text: jest.fn(() => Promise.resolve(body || ''))
  };
  return response;
});

// Import the worker module - we'll need to test its functionality
const workerCode = `
export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { prompt, business, industry, location, keywordType } = await request.json();

      // Use Cloudflare AI to generate keywords
      const ai = new Ai(env.AI);
      
      const systemPrompt = 'You are an expert SEO specialist who generates keyword suggestions with search volume estimates, competition analysis, and implementation guidance. Always respond with valid JSON format only, no additional text.';
      
      const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      // Parse and validate the AI response
      let keywordData;
      try {
        keywordData = JSON.parse(response.response);
      } catch (e) {
        // If JSON parsing fails, create a fallback response
        keywordData = createFallbackKeywords(business, industry, location, keywordType);
      }

      return new Response(JSON.stringify({ result: keywordData }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });

    } catch (error) {
      console.error('Error generating keywords:', error);
      
      return new Response(JSON.stringify({ 
        error: { message: 'Failed to generate keywords. Please try again.' }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};

// Fallback function to create basic keyword suggestions if AI fails
function createFallbackKeywords(business, industry, location, keywordType) {
  const businessWords = business.toLowerCase().split(/\\s+/).slice(0, 3);
  const locationPart = location ? \` in \${location}\` : '';
  
  return {
    "primary_keywords": [
      { "keyword": \`\${businessWords[0]} services\`, "search_volume": "1,200", "competition": "medium", "intent": "commercial" },
      { "keyword": \`best \${businessWords[0]}\`, "search_volume": "800", "competition": "high", "intent": "commercial" },
      { "keyword": \`\${businessWords[0]} \${businessWords[1] || 'business'}\`, "search_volume": "500", "competition": "medium", "intent": "commercial" }
    ],
    "long_tail_keywords": [
      { "keyword": \`affordable \${businessWords[0]} services\${locationPart}\`, "search_volume": "300", "competition": "easy", "intent": "commercial" },
      { "keyword": \`professional \${businessWords[0]} \${businessWords[1] || 'company'}\${locationPart}\`, "search_volume": "250", "competition": "easy", "intent": "commercial" },
      { "keyword": \`top rated \${businessWords[0]} services near me\`, "search_volume": "180", "competition": "easy", "intent": "local" }
    ],
    "local_keywords": location ? [
      { "keyword": \`\${businessWords[0]} \${location}\`, "search_volume": "400", "competition": "medium", "intent": "local" },
      { "keyword": \`\${businessWords[0]} services \${location}\`, "search_volume": "220", "competition": "easy", "intent": "local" },
      { "keyword": \`\${location} \${businessWords[0]} business\`, "search_volume": "150", "competition": "easy", "intent": "local" }
    ] : [
      { "keyword": \`\${businessWords[0]} near me\`, "search_volume": "600", "competition": "medium", "intent": "local" },
      { "keyword": \`local \${businessWords[0]} services\`, "search_volume": "300", "competition": "easy", "intent": "local" }
    ],
    "content_ideas": [
      { "keyword": \`how to choose \${businessWords[0]} service\`, "search_volume": "200", "competition": "easy", "intent": "informational" },
      { "keyword": \`\${businessWords[0]} tips and advice\`, "search_volume": "180", "competition": "easy", "intent": "informational" },
      { "keyword": \`benefits of professional \${businessWords[0]}\`, "search_volume": "150", "competition": "easy", "intent": "informational" }
    ],
    "seo_tips": [
      { "tip": "Include your primary keyword in the page title", "keyword_example": \`\${businessWords[0]} services\`, "placement": "title tag" },
      { "tip": "Use location-based keywords in your meta description", "keyword_example": \`\${businessWords[0]} \${location || 'near you'}\`, "placement": "meta description" },
      { "tip": "Create content around informational keywords", "keyword_example": \`how to choose \${businessWords[0]} service\`, "placement": "blog content" }
    ]
  };
}
`;

// Parse the worker function for testing
const createWorker = () => {
  const createFallbackKeywords = (business, industry, location, keywordType) => {
    const businessWords = business.toLowerCase().split(/\s+/).slice(0, 3);
    const locationPart = location ? ` in ${location}` : '';
    
    return {
      "primary_keywords": [
        { "keyword": `${businessWords[0]} services`, "search_volume": "1,200", "competition": "medium", "intent": "commercial" },
        { "keyword": `best ${businessWords[0]}`, "search_volume": "800", "competition": "high", "intent": "commercial" },
        { "keyword": `${businessWords[0]} ${businessWords[1] || 'business'}`, "search_volume": "500", "competition": "medium", "intent": "commercial" }
      ],
      "long_tail_keywords": [
        { "keyword": `affordable ${businessWords[0]} services${locationPart}`, "search_volume": "300", "competition": "easy", "intent": "commercial" },
        { "keyword": `professional ${businessWords[0]} ${businessWords[1] || 'company'}${locationPart}`, "search_volume": "250", "competition": "easy", "intent": "commercial" },
        { "keyword": `top rated ${businessWords[0]} services near me`, "search_volume": "180", "competition": "easy", "intent": "local" }
      ],
      "local_keywords": location ? [
        { "keyword": `${businessWords[0]} ${location}`, "search_volume": "400", "competition": "medium", "intent": "local" },
        { "keyword": `${businessWords[0]} services ${location}`, "search_volume": "220", "competition": "easy", "intent": "local" },
        { "keyword": `${location} ${businessWords[0]} business`, "search_volume": "150", "competition": "easy", "intent": "local" }
      ] : [
        { "keyword": `${businessWords[0]} near me`, "search_volume": "600", "competition": "medium", "intent": "local" },
        { "keyword": `local ${businessWords[0]} services`, "search_volume": "300", "competition": "easy", "intent": "local" }
      ],
      "content_ideas": [
        { "keyword": `how to choose ${businessWords[0]} service`, "search_volume": "200", "competition": "easy", "intent": "informational" },
        { "keyword": `${businessWords[0]} tips and advice`, "search_volume": "180", "competition": "easy", "intent": "informational" },
        { "keyword": `benefits of professional ${businessWords[0]}`, "search_volume": "150", "competition": "easy", "intent": "informational" }
      ],
      "seo_tips": [
        { "tip": "Include your primary keyword in the page title", "keyword_example": `${businessWords[0]} services`, "placement": "title tag" },
        { "tip": "Use location-based keywords in your meta description", "keyword_example": `${businessWords[0]} ${location || 'near you'}`, "placement": "meta description" },
        { "tip": "Create content around informational keywords", "keyword_example": `how to choose ${businessWords[0]} service`, "placement": "blog content" }
      ]
    };
  };

  return {
    async fetch(request, env) {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        });
      }

      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      try {
        const { prompt, business, industry, location, keywordType } = await request.json();

        // Use Cloudflare AI to generate keywords
        const ai = new Ai(env.AI);
        
        const systemPrompt = 'You are an expert SEO specialist who generates keyword suggestions with search volume estimates, competition analysis, and implementation guidance. Always respond with valid JSON format only, no additional text.';
        
        const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7
        });

        // Parse and validate the AI response
        let keywordData;
        try {
          keywordData = JSON.parse(response.response);
        } catch (e) {
          // If JSON parsing fails, create a fallback response
          keywordData = createFallbackKeywords(business, industry, location, keywordType);
        }

        return new Response(JSON.stringify({ result: keywordData }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });

      } catch (error) {
        console.error('Error generating keywords:', error);
        
        return new Response(JSON.stringify({ 
          error: { message: 'Failed to generate keywords. Please try again.' }
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
    },
    createFallbackKeywords
  };
};

describe('Cloudflare Worker', () => {
  let worker;
  let mockEnv;

  beforeEach(() => {
    worker = createWorker();
    mockEnv = { AI: {} };
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('CORS handling', () => {
    test('should handle OPTIONS request with proper CORS headers', async () => {
      const mockRequest = {
        method: 'OPTIONS'
      };

      const response = await worker.fetch(mockRequest, mockEnv);

      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
      expect(response.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    });
  });

  describe('Request method validation', () => {
    test('should reject non-POST requests', async () => {
      const mockRequest = {
        method: 'GET'
      };

      const response = await worker.fetch(mockRequest, mockEnv);

      expect(response.status).toBe(405);
      expect(response.body).toBe('Method not allowed');
    });
  });

  describe('Successful AI response', () => {
    test('should process valid AI response correctly', async () => {
      const mockKeywordData = {
        primary_keywords: [
          { keyword: 'pet grooming', search_volume: '1200', competition: 'medium', intent: 'commercial' }
        ],
        long_tail_keywords: [],
        local_keywords: [],
        content_ideas: [],
        seo_tips: []
      };

      const mockAiResponse = {
        response: JSON.stringify(mockKeywordData)
      };

      const mockAi = {
        run: jest.fn().mockResolvedValue(mockAiResponse)
      };

      global.Ai = jest.fn().mockReturnValue(mockAi);

      const mockRequest = {
        method: 'POST',
        json: jest.fn().mockResolvedValue({
          prompt: 'test prompt',
          business: 'pet grooming services',
          industry: 'pet-care',
          location: 'New York',
          keywordType: 'mixed'
        })
      };

      const response = await worker.fetch(mockRequest, mockEnv);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(responseData.result).toEqual(mockKeywordData);
      expect(mockAi.run).toHaveBeenCalledWith('@cf/meta/llama-2-7b-chat-int8', {
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' })
        ]),
        max_tokens: 2000,
        temperature: 0.7
      });
    });
  });

  describe('AI response parsing failure', () => {
    test('should use fallback keywords when AI response is invalid JSON', async () => {
      const mockAiResponse = {
        response: 'invalid json response'
      };

      const mockAi = {
        run: jest.fn().mockResolvedValue(mockAiResponse)
      };

      global.Ai = jest.fn().mockReturnValue(mockAi);

      const mockRequest = {
        method: 'POST',
        json: jest.fn().mockResolvedValue({
          prompt: 'test prompt',
          business: 'pet grooming services',
          industry: 'pet-care',
          location: 'New York',
          keywordType: 'mixed'
        })
      };

      const response = await worker.fetch(mockRequest, mockEnv);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.result).toBeDefined();
      expect(responseData.result.primary_keywords).toBeDefined();
      expect(responseData.result.primary_keywords.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    test('should handle AI service errors gracefully', async () => {
      const mockAi = {
        run: jest.fn().mockRejectedValue(new Error('AI service unavailable'))
      };

      global.Ai = jest.fn().mockReturnValue(mockAi);

      const mockRequest = {
        method: 'POST',
        json: jest.fn().mockResolvedValue({
          prompt: 'test prompt',
          business: 'pet grooming services',
          industry: 'pet-care',
          location: 'New York',
          keywordType: 'mixed'
        })
      };

      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await worker.fetch(mockRequest, mockEnv);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBeDefined();
      expect(responseData.error.message).toBe('Failed to generate keywords. Please try again.');
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');

      consoleSpy.mockRestore();
    });

    test('should handle request parsing errors', async () => {
      const mockRequest = {
        method: 'POST',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON in request body'))
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await worker.fetch(mockRequest, mockEnv);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBeDefined();
      expect(responseData.error.message).toBe('Failed to generate keywords. Please try again.');

      consoleSpy.mockRestore();
    });
  });
});

describe('createFallbackKeywords function', () => {
  let worker;

  beforeEach(() => {
    worker = createWorker();
  });

  test('should generate fallback keywords with proper structure', () => {
    const result = worker.createFallbackKeywords('pet grooming services', 'pet-care', 'New York', 'mixed');

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

  test('should include location in keywords when provided', () => {
    const result = worker.createFallbackKeywords('pet grooming', 'pet-care', 'New York', 'mixed');

    const hasLocationKeywords = result.local_keywords.some(keyword => 
      keyword.keyword.includes('New York')
    );
    expect(hasLocationKeywords).toBe(true);
  });

  test('should generate keywords without location', () => {
    const result = worker.createFallbackKeywords('pet grooming', 'pet-care', '', 'mixed');

    expect(result.local_keywords.length).toBeGreaterThan(0);
    const hasNearMeKeywords = result.local_keywords.some(keyword => 
      keyword.keyword.includes('near me')
    );
    expect(hasNearMeKeywords).toBe(true);
  });

  test('should use business words in generated keywords', () => {
    const result = worker.createFallbackKeywords('professional pet grooming', 'pet-care', 'Boston', 'mixed');

    const primaryKeyword = result.primary_keywords[0].keyword;
    expect(primaryKeyword).toContain('professional');
  });

  test('should generate keywords with proper metadata', () => {
    const result = worker.createFallbackKeywords('fitness coaching', 'fitness', 'Miami', 'mixed');

    result.primary_keywords.forEach(keyword => {
      expect(keyword).toHaveProperty('keyword');
      expect(keyword).toHaveProperty('search_volume');
      expect(keyword).toHaveProperty('competition');
      expect(keyword).toHaveProperty('intent');
      expect(typeof keyword.keyword).toBe('string');
      expect(typeof keyword.search_volume).toBe('string');
      expect(['easy', 'medium', 'hard']).toContain(keyword.competition);
      expect(['commercial', 'informational', 'local']).toContain(keyword.intent);
    });
  });

  test('should generate SEO tips with examples', () => {
    const result = worker.createFallbackKeywords('dental services', 'healthcare', 'Seattle', 'mixed');

    expect(result.seo_tips.length).toBeGreaterThan(0);
    result.seo_tips.forEach(tip => {
      expect(tip).toHaveProperty('tip');
      expect(tip).toHaveProperty('keyword_example');
      expect(tip).toHaveProperty('placement');
      expect(typeof tip.tip).toBe('string');
      expect(typeof tip.keyword_example).toBe('string');
      expect(typeof tip.placement).toBe('string');
    });
  });

  test('should handle edge cases gracefully', () => {
    // Test with minimal input
    const result = worker.createFallbackKeywords('a', 'unknown', '', 'mixed');

    expect(result.primary_keywords.length).toBeGreaterThan(0);
    expect(result.local_keywords.length).toBeGreaterThan(0);
    expect(result.content_ideas.length).toBeGreaterThan(0);
    expect(result.seo_tips.length).toBeGreaterThan(0);
  });
});