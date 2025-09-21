// Refactored frontend JS
// Example data filling
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
  const businessEl = document.getElementById('business'); if (businessEl) businessEl.value = example.business;
  const industryEl = document.getElementById('industry'); if (industryEl) industryEl.value = example.industry;
  const locationEl = document.getElementById('location'); if (locationEl) locationEl.value = example.location;
  const ktEl = document.getElementById('keywordType'); if (ktEl) ktEl.value = example.keywordType;
}

// DOM ready handlers and event delegation
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('keywordForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const business = (document.getElementById('business') || {}).value;
      const industry = (document.getElementById('industry') || {}).value;
      const location = (document.getElementById('location') || {}).value;
      const keywordType = (document.getElementById('keywordType') || {}).value;

      if (!business || !industry || !keywordType) {
        showError('Please fill in all required fields');
        return;
      }

      showLoading(true); hideError();
      try {
        const keywords = await generateKeywords(business, industry, location, keywordType);
        displayResults(keywords);
      } catch (err) {
        showError('Error generating keywords: ' + (err.message || err)); console.error(err);
      } finally { showLoading(false); }
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
  // Enhanced local keyword generation with industry-specific logic
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing delay
  
  const businessWords = extractKeyTerms(business);
  const industryData = getIndustryKeywords(industry);
  const locationPart = location ? ` ${location}` : '';
  const nearMePart = location ? ` ${location}` : ' near me';
  
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

function createPrompt(business, industry, location, keywordType) {
  return `Generate SEO keyword suggestions for this business: "${business}"\n\nIndustry: ${industry}\nLocation: ${location || 'Not specified'}\nKeyword Type Focus: ${keywordType}\n\nPlease provide a JSON response with this exact structure:\n{\n  "primary_keywords": [ { "keyword": "keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "long_tail_keywords": [ { "keyword": "longer keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "local_keywords": [ { "keyword": "local keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "content_ideas": [ { "keyword": "content-focused keyword", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "informational" } ],\n  "seo_tips": [ { "tip": "specific implementation advice", "keyword_example": "example keyword to use", "placement": "where to use it (title, meta, content, etc.)" } ]\n}\n\nGenerate 4-6 keywords per category. Focus on relevant, actionable keywords with realistic search volumes.`;
}

// Helper functions for local keyword generation
function extractKeyTerms(business) {
  const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'their', 'there', 'they', 'them', 'these', 'those', 'this', 'that'];
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

function randomVolume(min, max) {
  const volume = Math.floor(Math.random() * (max - min + 1)) + min;
  return volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume.toString();
}

function randomDifficulty() {
  const difficulties = ['easy', 'medium', 'hard'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  const keywordResults = document.getElementById('keywordResults');
  const tipsContent = document.getElementById('tipsContent');
  if (!keywordResults) return;
  keywordResults.innerHTML = '';

  const categories = [
    { key: 'primary_keywords', title: '🎯 Primary Keywords', desc: 'High-impact main keywords for your business' },
    { key: 'long_tail_keywords', title: '📈 Long-tail Keywords', desc: 'Specific phrases with less competition' },
    { key: 'local_keywords', title: '📍 Local SEO Keywords', desc: 'Location-based search terms' },
    { key: 'content_ideas', title: '📝 Content Keywords', desc: 'Ideas for blog posts and informational content' }
  ];

  categories.forEach(category => {
    if (Array.isArray(data[category.key]) && data[category.key].length) {
      const categoryDiv = createKeywordCategory(category.title, category.desc, data[category.key]);
      keywordResults.appendChild(categoryDiv);
    }
  });

  if (Array.isArray(data.seo_tips) && data.seo_tips.length) {
    tipsContent.innerHTML = data.seo_tips.map(tip => `<div class="tip"><strong>💡 ${escapeHtml(tip.tip)}</strong><br><small><strong>Example:</strong> Use "${escapeHtml(tip.keyword_example)}" in your ${escapeHtml(tip.placement)}</small></div>`).join('');
  } else { tipsContent.innerHTML = ''; }

  if (resultsDiv) { resultsDiv.hidden = false; resultsDiv.scrollIntoView({ behavior: 'smooth' }); }
}

function createKeywordCategory(title, description, keywords) {
  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'keyword-category';
  const list = document.createElement('div'); list.className = 'keyword-list';

  keywords.forEach(k => {
    const item = document.createElement('div');
    item.className = 'keyword-item'; item.tabIndex = 0; item.setAttribute('role', 'button'); item.dataset.keyword = k.keyword;
    item.innerHTML = `<div class="keyword">${escapeHtml(k.keyword)}</div>`;
    const metrics = document.createElement('div'); metrics.className = 'metrics';
    const vol = document.createElement('span'); vol.className = 'metric'; vol.textContent = `📊 ${k.search_volume}/mo`;
    const diff = document.createElement('span'); diff.className = `difficulty ${k.competition}`; diff.textContent = (k.competition || '').toUpperCase();
    const intent = document.createElement('span'); intent.className = 'metric'; intent.textContent = `🎯 ${k.intent}`;
    metrics.appendChild(vol); metrics.appendChild(diff); metrics.appendChild(intent);
    item.appendChild(metrics);
    const small = document.createElement('small'); small.className = 'muted'; small.textContent = 'Click to copy'; item.appendChild(small);
    list.appendChild(item);
  });

  categoryDiv.innerHTML = `<h3>${title}</h3><p class="muted">${description}</p>`;
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

function showLoading(show) { const ld = document.getElementById('loading'); if (ld) ld.hidden = !show; const btn = document.getElementById('generateBtn'); if (btn) btn.disabled = show; if (show) { const r = document.getElementById('results'); if (r) r.hidden = true; } }
function showError(message) { const e = document.getElementById('error'); if (!e) return; e.textContent = message; e.hidden = false; }
function hideError() { const e = document.getElementById('error'); if (!e) return; e.textContent = ''; e.hidden = true; }

function escapeHtml(str) { return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
