// Cloudflare Worker for AI-Powered SEO Keyword Generation
// Deploy this as a Cloudflare Worker and update the endpoint URL in scripts.js

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
}