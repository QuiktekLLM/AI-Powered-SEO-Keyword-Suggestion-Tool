// Core keyword generation and utility functions for testing
// This module exports the core functions for unit testing

// Keyword generation utilities
function extractKeyTerms(business) {
  const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'their', 'there', 'they', 'them', 'these', 'those', 'this', 'that', 'all', 'your', 'most'];
  return business.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5);
}

function getIndustryKeywords(industry) {
  const industryMap = {
    'pet-care': {
      services: ['grooming', 'boarding', 'training', 'walking', 'sitting', 'veterinary'],
      adjectives: ['professional', 'certified', 'experienced', 'affordable', 'premium'],
      terms: ['pet care', 'animal care', 'dog', 'cat', 'puppy', 'kitten']
    },
    'healthcare': {
      services: ['treatment', 'consultation', 'diagnosis', 'therapy', 'care', 'checkup'],
      adjectives: ['medical', 'clinical', 'professional', 'certified', 'experienced'],
      terms: ['health', 'wellness', 'medical', 'doctor', 'physician', 'clinic']
    },
    'fitness': {
      services: ['training', 'coaching', 'workout', 'exercise', 'nutrition', 'wellness'],
      adjectives: ['personal', 'professional', 'certified', 'experienced', 'custom'],
      terms: ['fitness', 'gym', 'health', 'weight loss', 'muscle building', 'cardio']
    },
    'food-restaurant': {
      services: ['dining', 'catering', 'delivery', 'takeout', 'reservation', 'menu'],
      adjectives: ['fresh', 'authentic', 'delicious', 'gourmet', 'family'],
      terms: ['restaurant', 'food', 'cuisine', 'dining', 'meal', 'dish']
    },
    'beauty': {
      services: ['makeup', 'skincare', 'hair', 'nails', 'spa', 'facial'],
      adjectives: ['professional', 'luxury', 'organic', 'premium', 'natural'],
      terms: ['beauty', 'cosmetics', 'salon', 'spa', 'treatment', 'style']
    },
    'technology': {
      services: ['development', 'consulting', 'support', 'maintenance', 'training', 'integration'],
      adjectives: ['professional', 'enterprise', 'custom', 'innovative', 'reliable'],
      terms: ['software', 'technology', 'IT', 'digital', 'computer', 'system']
    },
    'real-estate': {
      services: ['buying', 'selling', 'renting', 'management', 'investment', 'appraisal'],
      adjectives: ['professional', 'experienced', 'trusted', 'local', 'expert'],
      terms: ['real estate', 'property', 'home', 'house', 'agent', 'broker']
    },
    'education': {
      services: ['tutoring', 'training', 'courses', 'certification', 'workshop', 'coaching'],
      adjectives: ['professional', 'certified', 'experienced', 'qualified', 'expert'],
      terms: ['education', 'learning', 'training', 'course', 'teacher', 'instructor']
    },
    'automotive': {
      services: ['repair', 'maintenance', 'service', 'inspection', 'parts', 'installation'],
      adjectives: ['professional', 'certified', 'experienced', 'reliable', 'quality'],
      terms: ['automotive', 'car', 'vehicle', 'auto', 'mechanic', 'garage']
    },
    'home-garden': {
      services: ['landscaping', 'maintenance', 'design', 'installation', 'repair', 'cleaning'],
      adjectives: ['professional', 'experienced', 'reliable', 'quality', 'affordable'],
      terms: ['home', 'garden', 'landscape', 'yard', 'outdoor', 'maintenance']
    }
  };
  
  return industryMap[industry] || {
    services: ['service', 'consultation', 'solution', 'support', 'maintenance'],
    adjectives: ['professional', 'experienced', 'reliable', 'quality', 'affordable'],
    terms: ['business', 'service', 'company', 'professional', 'expert']
  };
}

function randomVolume(min, max) {
  const volume = Math.floor(Math.random() * (max - min + 1)) + min;
  return volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume.toString();
}

function randomDifficulty() {
  const difficulties = ['easy', 'medium', 'hard'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

function generateKeywordsByType(businessWords, industryData, location, keywordType) {
  const locationPart = location ? ` ${location}` : '';
  const nearMePart = location ? ` ${location}` : ' near me';
  
  const primary = [];
  const longTail = [];
  const local = [];
  const content = [];
  
  // Generate primary keywords - avoid duplication
  const usedPrimary = new Set();
  
  // Business word + service combinations
  businessWords.forEach(word => {
    const keyword = `${word} services`;
    if (!usedPrimary.has(keyword)) {
      primary.push({
        keyword: keyword,
        search_volume: randomVolume(800, 3000),
        competition: 'medium',
        intent: 'commercial'
      });
      usedPrimary.add(keyword);
    }
  });
  
  // Industry services + main business term
  industryData.services.slice(0, 4).forEach(service => {
    const keyword = `${service} ${businessWords[0] || industryData.terms[0]}`;
    if (!usedPrimary.has(keyword) && keyword !== `${businessWords[0]} ${businessWords[0]}`) {
      primary.push({
        keyword: keyword,
        search_volume: randomVolume(500, 2500),
        competition: randomDifficulty(),
        intent: 'commercial'
      });
      usedPrimary.add(keyword);
    }
  });
  
  // Add main industry terms
  industryData.terms.slice(0, 2).forEach(term => {
    if (!usedPrimary.has(term)) {
      primary.push({
        keyword: term,
        search_volume: randomVolume(1000, 4000),
        competition: 'high',
        intent: 'commercial'
      });
      usedPrimary.add(term);
    }
  });
  
  // Generate long-tail keywords for all types except short-tail
  if (keywordType !== 'short-tail') {
    const usedLongTail = new Set();
    
    industryData.adjectives.forEach((adj, i) => {
      if (i < 3) {
        const keyword = `${adj} ${businessWords[0] || industryData.terms[0]} ${industryData.services[0]}${locationPart}`.trim();
        if (!usedLongTail.has(keyword)) {
          longTail.push({
            keyword: keyword,
            search_volume: randomVolume(100, 800),
            competition: 'easy',
            intent: 'commercial'
          });
          usedLongTail.add(keyword);
        }
      }
    });
    
    businessWords.forEach((word, i) => {
      if (i < 3 && industryData.services[i]) {
        const keyword = `best ${word} ${industryData.services[i]} for ${industryData.terms[0]}`;
        if (!usedLongTail.has(keyword)) {
          longTail.push({
            keyword: keyword,
            search_volume: randomVolume(200, 600),
            competition: 'easy',
            intent: 'commercial'
          });
          usedLongTail.add(keyword);
        }
      }
    });
    
    // Add commercial intent specific long-tails
    if (keywordType === 'commercial' || keywordType === 'mixed') {
      const commercialPhrases = ['hire', 'book', 'find', 'cost of', 'price of'];
      commercialPhrases.forEach((phrase, i) => {
        if (i < 2) {
          const keyword = `${phrase} ${businessWords[0] || industryData.terms[0]} ${industryData.services[0]}`;
          if (!usedLongTail.has(keyword)) {
            longTail.push({
              keyword: keyword,
              search_volume: randomVolume(150, 500),
              competition: 'easy',
              intent: 'commercial'
            });
            usedLongTail.add(keyword);
          }
        }
      });
    }
  }
  
  // Generate local keywords for all types except informational
  if (keywordType !== 'informational') {
    const usedLocal = new Set();
    
    businessWords.forEach((word, i) => {
      if (i < 3) {
        const keyword = `${word}${nearMePart}`;
        if (!usedLocal.has(keyword)) {
          local.push({
            keyword: keyword,
            search_volume: randomVolume(300, 1200),
            competition: 'medium',
            intent: 'local'
          });
          usedLocal.add(keyword);
        }
      }
    });
    
    if (location) {
      industryData.services.forEach((service, i) => {
        if (i < 3) {
          const keyword = `${service} in ${location}`;
          if (!usedLocal.has(keyword)) {
            local.push({
              keyword: keyword,
              search_volume: randomVolume(150, 800),
              competition: 'easy',
              intent: 'local'
            });
            usedLocal.add(keyword);
          }
        }
      });
      
      // Add location + business type combinations
      businessWords.forEach((word, i) => {
        if (i < 2) {
          const keyword = `${location} ${word} ${industryData.services[0]}`;
          if (!usedLocal.has(keyword)) {
            local.push({
              keyword: keyword,
              search_volume: randomVolume(200, 600),
              competition: 'easy',
              intent: 'local'
            });
            usedLocal.add(keyword);
          }
        }
      });
    }
  }
  
  // Generate content ideas for informational focus or mixed
  if (keywordType === 'informational' || keywordType === 'mixed') {
    const contentPrefixes = ['how to choose', 'what is', 'benefits of', 'tips for', 'guide to'];
    const usedContent = new Set();
    
    contentPrefixes.forEach((prefix, i) => {
      if (i < 4 && businessWords[0] && industryData.services[i]) {
        const keyword = `${prefix} ${businessWords[0]} ${industryData.services[i]}`;
        if (!usedContent.has(keyword)) {
          content.push({
            keyword: keyword,
            search_volume: randomVolume(100, 500),
            competition: 'easy',
            intent: 'informational'
          });
          usedContent.add(keyword);
        }
      }
    });
    
    // Add more informational keywords
    const infoSuffixes = ['explained', 'for beginners', 'mistakes to avoid'];
    infoSuffixes.forEach((suffix, i) => {
      if (businessWords[0] && i < 2) {
        const keyword = `${businessWords[0]} ${industryData.services[0]} ${suffix}`;
        if (!usedContent.has(keyword)) {
          content.push({
            keyword: keyword,
            search_volume: randomVolume(80, 400),
            competition: 'easy',
            intent: 'informational'
          });
          usedContent.add(keyword);
        }
      }
    });
  }
  
  return { 
    primary: primary.slice(0, 6), 
    longTail: longTail.slice(0, 6), 
    local: local.slice(0, 6), 
    content: content.slice(0, 6) 
  };
}

function generateSEOTips(businessWords, industryData, location) {
  return [
    {
      tip: "Include your primary keyword in the page title and H1 tag",
      keyword_example: `${businessWords[0]} ${industryData.services[0]}`,
      placement: "title tag and H1"
    },
    {
      tip: "Use location-based keywords in your meta description",
      keyword_example: `${businessWords[0]} ${location || 'near you'}`,
      placement: "meta description"
    },
    {
      tip: "Create service pages for each keyword category",
      keyword_example: `${industryData.adjectives[0]} ${industryData.services[0]}`,
      placement: "service pages"
    },
    {
      tip: "Include keywords in your URL structure",
      keyword_example: `/${businessWords[0]}-${industryData.services[0]}`,
      placement: "URL slug"
    },
    {
      tip: "Use long-tail keywords in your blog content",
      keyword_example: `how to choose ${businessWords[0]} ${industryData.services[0]}`,
      placement: "blog articles"
    }
  ];
}

function createPrompt(business, industry, location, keywordType) {
  return `Generate SEO keyword suggestions for this business: "${business}"\n\nIndustry: ${industry}\nLocation: ${location || 'Not specified'}\nKeyword Type Focus: ${keywordType}\n\nPlease provide a JSON response with this exact structure:\n{\n  "primary_keywords": [ { "keyword": "keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "long_tail_keywords": [ { "keyword": "longer keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "local_keywords": [ { "keyword": "local keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "content_ideas": [ { "keyword": "content-focused keyword", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "informational" } ],\n  "seo_tips": [ { "tip": "specific implementation advice", "keyword_example": "example keyword to use", "placement": "where to use it (title, meta, content, etc.)" } ]\n}\n\nGenerate 4-6 keywords per category. Focus on relevant, actionable keywords with realistic search volumes.`;
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function validateFormInputs(business, industry, keywordType) {
  const errors = [];
  
  if (!business || business.trim().length === 0) {
    errors.push('Business description is required');
  }
  
  if (!industry) {
    errors.push('Industry selection is required');
  }
  
  if (!keywordType) {
    errors.push('Keyword type selection is required');
  }
  
  if (business && business.trim().length < 10) {
    errors.push('Business description should be at least 10 characters');
  }
  
  return errors;
}

async function generateKeywordsLocally(business, industry, location, keywordType) {
  // Enhanced local keyword generation with industry-specific logic
  await new Promise(resolve => setTimeout(resolve, 100)); // Reduced delay for testing
  
  const businessWords = extractKeyTerms(business);
  const industryData = getIndustryKeywords(industry);
  
  // Generate keywords based on keyword type focus
  const keywordSets = generateKeywordsByType(businessWords, industryData, location, keywordType);
  
  return {
    primary_keywords: keywordSets.primary,
    long_tail_keywords: keywordSets.longTail,
    local_keywords: keywordSets.local,
    content_ideas: keywordSets.content,
    seo_tips: generateSEOTips(businessWords, industryData, location)
  };
}

// Export functions for testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractKeyTerms,
    getIndustryKeywords,
    randomVolume,
    randomDifficulty,
    generateKeywordsByType,
    generateSEOTips,
    createPrompt,
    escapeHtml,
    validateFormInputs,
    generateKeywordsLocally
  };
}

// Make functions available globally (browser environment)
if (typeof window !== 'undefined') {
  window.KeywordUtils = {
    extractKeyTerms,
    getIndustryKeywords,
    randomVolume,
    randomDifficulty,
    generateKeywordsByType,
    generateSEOTips,
    createPrompt,
    escapeHtml,
    validateFormInputs,
    generateKeywordsLocally
  };
}