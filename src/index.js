// Main entry point for the application
import './styles.css';
import { KeywordUtils } from './keyword-utils.js';

// Cache DOM elements for better performance
let cachedElements = {};

function getCachedElement(id) {
  if (!cachedElements[id]) {
    cachedElements[id] = document.getElementById(id);
  }
  return cachedElements[id];
}

// Cloudflare Worker endpoint - update this with your deployed worker URL
const cloudflareEndpoint = 'https://your-worker.your-subdomain.workers.dev/api/generate-keywords';

async function generateKeywords(business, industry, location, keywordType) {
  const requestData = {
    business,
    industry,
    location,
    keywordType
  };

  try {
    const response = await fetch(cloudflareEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error occurred');
    }

    if (!data.result) {
      throw new Error('Invalid response format: missing result data');
    }

    return data.result;
  } catch (error) {
    console.error('AI service request failed:', error);
    
    // Fallback to local keyword generation
    console.log('Falling back to local keyword generation...');
    return await KeywordUtils.generateKeywordsLocally(business, industry, location, keywordType);
  }
}

async function generateKeywordsLocally(business, industry, location, keywordType) {
  return KeywordUtils.generateKeywordsLocally(business, industry, location, keywordType);
}

function createPrompt(business, industry, location, keywordType) {
  return KeywordUtils.createPrompt(business, industry, location, keywordType);
}

function extractKeyTerms(business) {
  return KeywordUtils.extractKeyTerms(business);
}

function getIndustryKeywords(industry) {
  return KeywordUtils.getIndustryKeywords(industry);
}

function generateKeywordsByType(businessWords, industryData, location, keywordType) {
  return KeywordUtils.generateKeywordsByType(businessWords, industryData, location, keywordType);
}

function generateSEOTips(businessWords, industryData, location) {
  return KeywordUtils.generateSEOTips(businessWords, industryData, location);
}

function randomVolume(min, max) {
  return KeywordUtils.randomVolume(min, max);
}

function randomDifficulty() {
  return KeywordUtils.randomDifficulty();
}

function escapeHtml(str) {
  return KeywordUtils.escapeHtml(str);
}

function displayResults(data) {
  const resultsContainer = getCachedElement('results');
  
  if (!data) {
    showError('No keyword data received');
    return;
  }

  let html = '<div class="results-grid">';

  // Primary Keywords
  if (data.primary_keywords && data.primary_keywords.length > 0) {
    html += createKeywordCategory(
      'Primary Keywords',
      'High-impact keywords for main pages and campaigns',
      data.primary_keywords
    );
  }

  // Long-tail Keywords
  if (data.long_tail_keywords && data.long_tail_keywords.length > 0) {
    html += createKeywordCategory(
      'Long-tail Keywords',
      'Specific, lower competition phrases for targeted content',
      data.long_tail_keywords
    );
  }

  // Local Keywords
  if (data.local_keywords && data.local_keywords.length > 0) {
    html += createKeywordCategory(
      'Local Keywords',
      'Location-based keywords for local SEO',
      data.local_keywords
    );
  }

  // Content Keywords
  if (data.content_keywords && data.content_keywords.length > 0) {
    html += createKeywordCategory(
      'Content Keywords',
      'Informational keywords for blog posts and resources',
      data.content_keywords
    );
  }

  html += '</div>';

  // SEO Implementation Tips
  if (data.seo_tips && data.seo_tips.length > 0) {
    html += '<div class="seo-tips"><h3>🎯 SEO Implementation Tips</h3><div class="tips-grid">';
    data.seo_tips.forEach(tip => {
      html += `
        <div class="tip-card">
          <h4>${escapeHtml(tip.tip)}</h4>
          <p><strong>Example:</strong> "${escapeHtml(tip.keyword_example)}"</p>
          <p><strong>Best placement:</strong> ${escapeHtml(tip.placement)}</p>
        </div>
      `;
    });
    html += '</div></div>';
  }

  resultsContainer.innerHTML = html;
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createKeywordCategory(title, description, keywords) {
  let html = `
    <div class="keyword-category">
      <div class="category-header">
        <h3>${escapeHtml(title)}</h3>
        <p class="category-description">${escapeHtml(description)}</p>
      </div>
      <div class="keywords-list">
  `;

  keywords.forEach(keyword => {
    const volumeDisplay = keyword.search_volume || 'N/A';
    const competition = keyword.competition || 'unknown';
    const intent = keyword.intent || 'informational';

    html += `
      <div class="keyword-item">
        <div class="keyword-text">
          <span class="keyword-phrase">${escapeHtml(keyword.keyword)}</span>
          <button class="copy-btn" onclick="copyKeywordText('${escapeHtml(keyword.keyword)}', this)" aria-label="Copy keyword">
            📋
          </button>
        </div>
        <div class="keyword-metrics">
          <span class="metric volume" title="Monthly search volume">
            📊 ${volumeDisplay}
          </span>
          <span class="metric competition ${competition}" title="Competition level">
            🎯 ${competition}
          </span>
          <span class="metric intent" title="Search intent">
            🔍 ${intent}
          </span>
        </div>
      </div>
    `;
  });

  html += '</div></div>';
  return html;
}

function copyKeywordText(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = el.innerHTML;
    el.innerHTML = '✓';
    el.style.background = '#22c55e';
    setTimeout(() => {
      el.innerHTML = originalText;
      el.style.background = '';
    }, 1500);
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const originalText = el.innerHTML;
    el.innerHTML = '✓';
    setTimeout(() => {
      el.innerHTML = originalText;
    }, 1500);
  });
}

function showLoading(show) {
  const loadingEl = getCachedElement('loading');
  const submitBtn = getCachedElement('submitBtn');
  
  if (show) {
    loadingEl.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Generating Keywords...';
  } else {
    loadingEl.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Generate AI Keyword Suggestions';
  }
}

function showError(message) {
  const errorEl = getCachedElement('error');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideError() {
  const errorEl = getCachedElement('error');
  errorEl.style.display = 'none';
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
  const keywordTypeEl = getCachedElement('keywordType');
  
  if (businessEl) businessEl.value = example.business;
  if (industryEl) industryEl.value = example.industry;
  if (locationEl) locationEl.value = example.location;
  if (keywordTypeEl) keywordTypeEl.value = example.keywordType;
}

// Make fillExample function globally available for onclick handlers
window.fillExample = fillExample;
window.copyKeywordText = copyKeywordText;

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
        console.error('Error generating keywords:', err);
        showError('Failed to generate keywords. Please check your connection and try again.');
      } finally {
        showLoading(false);
      }
    });
  }
});