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
      const apiKeyEl = document.getElementById('apiKey');
      const apiKey = apiKeyEl ? apiKeyEl.value.trim() : '';
      if (!apiKey) { showError('Please enter your OpenAI API key'); return; }

      const business = (document.getElementById('business') || {}).value;
      const industry = (document.getElementById('industry') || {}).value;
      const location = (document.getElementById('location') || {}).value;
      const keywordType = (document.getElementById('keywordType') || {}).value;

      showLoading(true); hideError();
      try {
        const keywords = await generateKeywords(apiKey, business, industry, location, keywordType);
        displayResults(keywords);
      } catch (err) {
        showError('Error generating keywords: ' + (err.message || err)); console.error(err);
      } finally { showLoading(false); }
    });
  }

  // API key input behaviour
  const apiEl = document.getElementById('apiKey');
  if (apiEl) {
    apiEl.addEventListener('input', function () { setTimeout(() => { this.type = 'password'; }, 2000); });
    apiEl.addEventListener('focus', function () { this.type = 'text'; });
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

async function generateKeywords(apiKey, business, industry, location, keywordType) {
  const prompt = createPrompt(business, industry, location, keywordType);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: 'You are an expert SEO specialist who generates keyword suggestions with search volume estimates, competition analysis, and implementation guidance. Always respond with valid JSON format.' }, { role: 'user', content: prompt }], max_tokens: 2000, temperature: 0.7 })
  });

  if (!response.ok) {
    let err = 'API request failed';
    try { const errorData = await response.json(); err = errorData.error?.message || err; } catch (e) {}
    throw new Error(err);
  }

  const data = await response.json();
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  try { return JSON.parse(content); } catch (e) { console.log('Raw response:', content); throw new Error('Invalid JSON response from AI'); }
}

function createPrompt(business, industry, location, keywordType) {
  return `Generate SEO keyword suggestions for this business: "${business}"\n\nIndustry: ${industry}\nLocation: ${location || 'Not specified'}\nKeyword Type Focus: ${keywordType}\n\nPlease provide a JSON response with this exact structure:\n{\n  "primary_keywords": [ { "keyword": "keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "long_tail_keywords": [ { "keyword": "longer keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "local_keywords": [ { "keyword": "local keyword phrase", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "commercial|informational|navigational" } ],\n  "content_ideas": [ { "keyword": "content-focused keyword", "search_volume": "estimated monthly searches", "competition": "easy|medium|hard", "intent": "informational" } ],\n  "seo_tips": [ { "tip": "specific implementation advice", "keyword_example": "example keyword to use", "placement": "where to use it (title, meta, content, etc.)" } ]\n}\n\nGenerate 4-6 keywords per category. Focus on relevant, actionable keywords with realistic search volumes.`;
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
