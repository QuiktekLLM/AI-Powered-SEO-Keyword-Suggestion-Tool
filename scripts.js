// Cache DOM elements for better performance
let cachedElements = {};

function getCachedElement(id) {
  if (!cachedElements[id]) {
    cachedElements[id] = document.getElementById(id);
  }
  return cachedElements[id];
}

function fillExample(type) {
  const examples = {
    pet: {
      business: 'Professional pet grooming services offering baths, haircuts, nail trimming for dogs and cats',
      industry: 'pet-care',
      location: 'Downtown Seattle',
      keywordType: 'local'
    },
    fitness: {
      business: 'Personal fitness training and nutrition coaching for weight loss and muscle building',
      industry: 'fitness',
      location: 'Los Angeles',
      keywordType: 'commercial'
    },
    restaurant: {
      business: 'Authentic Italian restaurant serving fresh pasta, pizza, and traditional Italian dishes',
      industry: 'food-restaurant',
      location: 'Chicago',
      keywordType: 'local'
    },
    dentist: {
      business: 'Modern dental clinic offering general dentistry, teeth cleaning, cosmetic dentistry',
      industry: 'healthcare',
      location: 'Miami',
      keywordType: 'local'
    }
  };

  const example = examples[type];
  if (!example) return;
  
  // Cache elements for efficient reuse
  const businessEl = getCachedElement('business');
  const industryEl = getCachedElement('industry');
  const locationEl = getCachedElement('location');
  const ktEl = getCachedElement('keywordType');
  
  if (businessEl) businessEl.value = example.business;
  if (industryEl) industryEl.value = example.industry;
  if (locationEl) locationEl.value = example.location;
  if (ktEl) ktEl.value = example.keywordType;
}

// DOM ready handlers and event delegation
document.addEventListener('DOMContentLoaded', function () {
  const form = getCachedElement('keywordForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Use cached elements for better performance
      const business = (getCachedElement('business') || {}).value;
      const industry = (getCachedElement('industry') || {}).value;
      const location = (getCachedElement('location') || {}).value;
      const keywordType = (getCachedElement('keywordType') || {}).value;

      if (!business || !industry || !keywordType) {
        showError('Please fill in all required fields');
        return;
      }

      showLoading(true);
      hideError();
      
      try {
        const keywords = await generateKeywords(business, industry, location, keywordType);
        displayResults(keywords);
      } catch (err) {
        showError('Error generating keywords: ' + (err.message || err));
        console.error(err);
      } finally {
        showLoading(false);
      }
    });
  }

  // Delegate clicks on keyword items for copy behaviour
  document.body.addEventListener('click', function (e) {
    const item = e.target.closest && e.target.closest('.keyword-item');
    if (item && item.dataset && item.dataset.keyword) {
      copyKeywordText(item.dataset.keyword, item);
    }
  });

  // keyboard accessibility for items
  document.body.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const active = document.activeElement;
      if (active && active.classList && active.classList.contains('keyword-item') && active.dataset.keyword) {
        e.preventDefault(); copyKeywordText(active.dataset.keyword, active);
      }
    }
  });
});

async function generateKeywords(business, industry, location, keywordType) {
  // Try Cloudflare Worker first if available, otherwise use local generation
  try {
    return await tryCloudflareGeneration(business, industry, location, keywordType);
  } catch (error) {
    console.log('Cloudflare AI not available, using local generation:', error.message);
    return await generateKeywordsLocally(business, industry, location, keywordType);
  }
}

async function tryCloudflareGeneration(business, industry, location, keywordType) {
  const prompt = createPrompt(business, industry, location, keywordType);
  
  // Try to detect if we're in a Cloudflare environment or if worker is deployed
  const cloudflareEndpoint = window.location.hostname.includes('workers.dev') || window.location.hostname.includes('pages.dev') 
    ? '/api/generate-keywords' 
    : 'https://seo-keyword-worker.kedster.workers.dev/api/generate-keywords'; // Default worker URL
  
  const response = await fetch(cloudflareEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt,
      business: business,
      industry: industry,
      location: location,
      keywordType: keywordType
    })
  });

  if (!response.ok) {
    let err = `AI service request failed (${response.status})`;
    try { 
      const errorData = await response.json(); 
      err = errorData.error?.message || errorData.message || err; 
    } catch (e) {}
    throw new Error(err);
  }

  const data = await response.json();
  
  // Handle different response formats from Cloudflare AI
  if (data.result && typeof data.result === 'object') {
    return data.result;
  } else if (data.response && typeof data.response === 'string') {
    try { 
      return JSON.parse(data.response); 
    } catch (e) { 
      console.log('Raw AI response:', data.response); 
      throw new Error('Invalid JSON response from AI service'); 
    }
  } else if (typeof data === 'object' && data.primary_keywords) {
    return data;
  } else {
    console.log('Unexpected response format:', data);
    throw new Error('Unexpected response format from AI service');
  }
}

async function generateKeywordsLocally(business, industry, location, keywordType) {
  // Use utility function if available
  if (window.KeywordUtils?.generateKeywordsLocally) {
    return await window.KeywordUtils.generateKeywordsLocally(business, industry, location, keywordType);
  }
  
  // Fallback implementation
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing delay
  
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

// Use utility function from keyword-utils.js
const createPrompt = window.KeywordUtils?.createPrompt || function(business, industry, location, keywordType) {
  return `Generate SEO keyword suggestions for this business: "${business}"\n\nIndustry: ${industry}\nLocation: ${location || 'Not specified'}\nKeyword Type Focus: ${keywordType}\n\nPlease provide a JSON response with this exact structure:\n{\n  "primary_keywords": [ { "keyword": "keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "long_tail_keywords": [ { "keyword": "longer keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "local_keywords": [ { "keyword": "local keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "content_ideas": [ { "keyword": "content-focused keyword", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "informational" } ],\n  "seo_tips": [ { "tip": "specific implementation advice", "keyword_example": "example keyword to use", "placement": "where to use it (title, meta, content, etc.)" } ]\n}\n\nGenerate 4-6 keywords per category. Focus on relevant, actionable keywords with realistic search volumes.`;
};

// Use utility functions from keyword-utils.js
const extractKeyTerms = window.KeywordUtils?.extractKeyTerms || function(business) {
  const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'their', 'there', 'they', 'them', 'these', 'those', 'this', 'that'];
  return business.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5);
};

const getIndustryKeywords = window.KeywordUtils?.getIndustryKeywords || function(industry) {
  // Fallback for when KeywordUtils is not available
  return {
    services: ['service', 'consultation', 'solution', 'support', 'maintenance'],
    adjectives: ['professional', 'experienced', 'reliable', 'quality', 'affordable'],
    terms: ['business', 'service', 'company', 'professional', 'expert']
  };
};

const generateKeywordsByType = window.KeywordUtils?.generateKeywordsByType || function() {
  return { primary: [], longTail: [], local: [], content: [] };
};

const generateSEOTips = window.KeywordUtils?.generateSEOTips || function() {
  return [];
};

const randomVolume = window.KeywordUtils?.randomVolume || function(min, max) {
  const volume = Math.floor(Math.random() * (max - min + 1)) + min;
  return volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume.toString();
};

const randomDifficulty = window.KeywordUtils?.randomDifficulty || function() {
  const difficulties = ['easy', 'medium', 'hard'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
};

const escapeHtml = window.KeywordUtils?.escapeHtml || function(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

function displayResults(data) {
  const resultsDiv = getCachedElement('results');
  const keywordResults = getCachedElement('keywordResults');
  const tipsContent = getCachedElement('tipsContent');
  
  if (!keywordResults) return;
  
  // Clear previous results efficiently
  keywordResults.innerHTML = '';

  // Category configuration for easier maintenance
  const categories = [
    { key: 'primary_keywords', title: '🎯 Primary Keywords', desc: 'High-impact main keywords for your business' },
    { key: 'long_tail_keywords', title: '📈 Long-tail Keywords', desc: 'Specific phrases with less competition' },
    { key: 'local_keywords', title: '📍 Local SEO Keywords', desc: 'Location-based search terms' },
    { key: 'content_ideas', title: '📝 Content Keywords', desc: 'Ideas for blog posts and informational content' }
  ];

  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  categories.forEach(category => {
    const keywords = data[category.key];
    if (Array.isArray(keywords) && keywords.length > 0) {
      const categoryDiv = createKeywordCategory(category.title, category.desc, keywords);
      fragment.appendChild(categoryDiv);
    }
  });
  
  keywordResults.appendChild(fragment);

  // Handle SEO tips
  if (tipsContent) {
    if (Array.isArray(data.seo_tips) && data.seo_tips.length > 0) {
      const tipsHtml = data.seo_tips
        .map(tip => `<div class="tip">
          <strong>💡 ${escapeHtml(tip.tip)}</strong><br>
          <small><strong>Example:</strong> Use "${escapeHtml(tip.keyword_example)}" in your ${escapeHtml(tip.placement)}</small>
        </div>`)
        .join('');
      tipsContent.innerHTML = tipsHtml;
    } else {
      tipsContent.innerHTML = '';
    }
  }

  // Show results and smooth scroll
  if (resultsDiv) {
    resultsDiv.hidden = false;
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
  }
}

function createKeywordCategory(title, description, keywords) {
  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'keyword-category';
  
  // Create header
  categoryDiv.innerHTML = `<h3>${title}</h3><p class="muted">${description}</p>`;
  
  const list = document.createElement('div');
  list.className = 'keyword-list';

  // Use document fragment for better performance when adding multiple elements
  const fragment = document.createDocumentFragment();

  keywords.forEach(k => {
    const item = document.createElement('div');
    item.className = 'keyword-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.dataset.keyword = k.keyword;
    
    // Create keyword display
    const keywordDiv = document.createElement('div');
    keywordDiv.className = 'keyword';
    keywordDiv.textContent = k.keyword; // Use textContent for security
    
    // Create metrics container
    const metrics = document.createElement('div');
    metrics.className = 'metrics';
    
    // Volume metric
    const vol = document.createElement('span');
    vol.className = 'metric';
    vol.textContent = `📊 ${k.search_volume}/mo`;
    
    // Difficulty metric
    const diff = document.createElement('span');
    diff.className = `difficulty ${k.competition}`;
    diff.textContent = (k.competition || '').toUpperCase();
    
    // Intent metric
    const intent = document.createElement('span');
    intent.className = 'metric';
    intent.textContent = `🎯 ${k.intent}`;
    
    metrics.appendChild(vol);
    metrics.appendChild(diff);
    metrics.appendChild(intent);
    
    // Copy instruction
    const small = document.createElement('small');
    small.className = 'muted';
    small.textContent = 'Click to copy';
    
    item.appendChild(keywordDiv);
    item.appendChild(metrics);
    item.appendChild(small);
    
    fragment.appendChild(item);
  });
  
  list.appendChild(fragment);
  categoryDiv.appendChild(list);
  
  return categoryDiv;
}

function copyKeywordText(text, el) {
  if (!text) return;
  if (!navigator.clipboard) {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
    return Promise.resolve();
  }
  return navigator.clipboard.writeText(text).then(() => {
    const original = el.innerHTML;
    el.style.background = '#10b981';
    el.innerHTML = original.replace('Click to copy', '✅ Copied!');
    setTimeout(() => { el.style.background = ''; el.innerHTML = original; }, 1400);
  });
}

function showLoading(show) {
  const loading = getCachedElement('loading');
  const btn = getCachedElement('generateBtn');
  const results = getCachedElement('results');
  
  if (loading) loading.hidden = !show;
  if (btn) btn.disabled = show;
  if (show && results) results.hidden = true;
}

function showError(message) {
  const errorElement = getCachedElement('error');
  if (!errorElement) return;
  
  errorElement.textContent = message;
  errorElement.hidden = false;
}

function hideError() {
  const errorElement = getCachedElement('error');
  if (!errorElement) return;
  
  errorElement.textContent = '';
  errorElement.hidden = true;
}
