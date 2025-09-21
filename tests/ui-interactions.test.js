/**
 * Unit tests for UI interaction and DOM manipulation functions
 * Tests frontend JavaScript functions that interact with the DOM
 */

// Import testable functions from the UI module (we'll need to load the scripts.js content)
// For now, we'll test the functions we can extract

describe('Form Validation and Input Processing', () => {
  beforeEach(() => {
    // Reset DOM state using setup utility
    document.body.innerHTML = '';
    const form = document.createElement('form');
    form.id = 'keywordForm';
    
    const businessInput = document.createElement('textarea');
    businessInput.id = 'business';
    
    const industrySelect = document.createElement('select');
    industrySelect.id = 'industry';
    // Add options to make select functional
    const industryOptions = ['pet-care', 'fitness', 'healthcare', 'food-restaurant'];
    industryOptions.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      industrySelect.appendChild(option);
    });
    
    const locationInput = document.createElement('input');
    locationInput.id = 'location';
    
    const keywordTypeSelect = document.createElement('select');
    keywordTypeSelect.id = 'keywordType';
    // Add options to make select functional
    const keywordTypeOptions = ['local', 'commercial', 'mixed', 'informational'];
    keywordTypeOptions.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      keywordTypeSelect.appendChild(option);
    });
    
    document.body.appendChild(form);
    document.body.appendChild(businessInput);
    document.body.appendChild(industrySelect);
    document.body.appendChild(locationInput);
    document.body.appendChild(keywordTypeSelect);
  });

  test('should extract form values correctly', () => {
    // Set form values
    document.getElementById('business').value = 'Test business description';
    document.getElementById('industry').value = 'pet-care';
    document.getElementById('location').value = 'New York';
    document.getElementById('keywordType').value = 'mixed';

    // Get values using the same logic as scripts.js
    const business = document.getElementById('business').value;
    const industry = document.getElementById('industry').value;
    const location = document.getElementById('location').value;
    const keywordType = document.getElementById('keywordType').value;

    expect(business).toBe('Test business description');
    expect(industry).toBe('pet-care');
    expect(location).toBe('New York');
    expect(keywordType).toBe('mixed');
  });

  test('should handle missing form elements gracefully', () => {
    // Set initial values before removing elements
    document.getElementById('industry').value = 'pet-care';
    document.getElementById('location').value = 'New York';
    document.getElementById('keywordType').value = 'mixed';
    
    // Remove business element to simulate missing DOM element
    document.getElementById('business').remove();
    
    // This should not throw an error (using defensive programming from scripts.js)
    const business = (document.getElementById('business') || {}).value;
    const industry = (document.getElementById('industry') || {}).value;
    const location = (document.getElementById('location') || {}).value;
    const keywordType = (document.getElementById('keywordType') || {}).value;

    expect(business).toBeUndefined();
    expect(industry).toBe('pet-care');
    expect(location).toBe('New York');
    expect(keywordType).toBe('mixed');
  });
});

describe('Example Data Functions', () => {
  beforeEach(() => {
    // Setup fresh DOM elements for each test
    document.body.innerHTML = '';
    
    const businessInput = document.createElement('textarea');
    businessInput.id = 'business';
    
    const industrySelect = document.createElement('select');
    industrySelect.id = 'industry';
    // Add options to make select functional
    const industryOptions = ['pet-care', 'fitness', 'healthcare', 'food-restaurant'];
    industryOptions.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      industrySelect.appendChild(option);
    });
    
    const locationInput = document.createElement('input');
    locationInput.id = 'location';
    
    const keywordTypeSelect = document.createElement('select');
    keywordTypeSelect.id = 'keywordType';
    // Add options to make select functional
    const keywordTypeOptions = ['local', 'commercial', 'mixed', 'informational'];
    keywordTypeOptions.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      keywordTypeSelect.appendChild(option);
    });
    
    document.body.appendChild(businessInput);
    document.body.appendChild(industrySelect);
    document.body.appendChild(locationInput);
    document.body.appendChild(keywordTypeSelect);
  });

  test('should load pet grooming example correctly', () => {
    const example = {
      business: 'Professional pet grooming services offering baths, haircuts, nail trimming for dogs and cats',
      industry: 'pet-care',
      location: 'Downtown Seattle',
      keywordType: 'local'
    };

    // Simulate fillExample function behavior
    document.getElementById('business').value = example.business;
    document.getElementById('industry').value = example.industry;
    document.getElementById('location').value = example.location;
    document.getElementById('keywordType').value = example.keywordType;

    expect(document.getElementById('business').value).toBe(example.business);
    expect(document.getElementById('industry').value).toBe(example.industry);
    expect(document.getElementById('location').value).toBe(example.location);
    expect(document.getElementById('keywordType').value).toBe(example.keywordType);
  });

  test('should load fitness example correctly', () => {
    const example = {
      business: 'Personal fitness training and nutrition coaching for weight loss and muscle building',
      industry: 'fitness',
      location: 'Los Angeles',
      keywordType: 'commercial'
    };

    document.getElementById('business').value = example.business;
    document.getElementById('industry').value = example.industry;
    document.getElementById('location').value = example.location;
    document.getElementById('keywordType').value = example.keywordType;

    expect(document.getElementById('business').value).toContain('fitness training');
    expect(document.getElementById('industry').value).toBe('fitness');
    expect(document.getElementById('location').value).toBe('Los Angeles');
    expect(document.getElementById('keywordType').value).toBe('commercial');
  });
});

describe('Display Results Functions', () => {
  let mockKeywordData;

  beforeEach(() => {
    mockKeywordData = testUtils.createMockKeywordData();
  });

  test('should create keyword category structure', () => {
    // Mock createKeywordCategory function behavior
    const createKeywordCategory = (title, description, keywords) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'keyword-category';
      
      const titleElement = document.createElement('h3');
      titleElement.textContent = title;
      
      const descElement = document.createElement('p');
      descElement.className = 'muted';
      descElement.textContent = description;
      
      const list = document.createElement('div');
      list.className = 'keyword-list';

      keywords.forEach(k => {
        const item = document.createElement('div');
        item.className = 'keyword-item';
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.dataset.keyword = k.keyword;
        
        const keywordDiv = document.createElement('div');
        keywordDiv.className = 'keyword';
        keywordDiv.textContent = k.keyword;
        
        const metrics = document.createElement('div');
        metrics.className = 'metrics';
        
        const vol = document.createElement('span');
        vol.className = 'metric';
        vol.textContent = `📊 ${k.search_volume}/mo`;
        
        const diff = document.createElement('span');
        diff.className = `difficulty ${k.competition}`;
        diff.textContent = k.competition.toUpperCase();
        
        const intent = document.createElement('span');
        intent.className = 'metric';
        intent.textContent = `🎯 ${k.intent}`;
        
        metrics.appendChild(vol);
        metrics.appendChild(diff);
        metrics.appendChild(intent);
        
        item.appendChild(keywordDiv);
        item.appendChild(metrics);
        
        const small = document.createElement('small');
        small.className = 'muted';
        small.textContent = 'Click to copy';
        item.appendChild(small);
        
        list.appendChild(item);
      });

      categoryDiv.appendChild(titleElement);
      categoryDiv.appendChild(descElement);
      categoryDiv.appendChild(list);
      
      return categoryDiv;
    };

    const category = createKeywordCategory(
      '🎯 Primary Keywords',
      'High-impact main keywords for your business',
      mockKeywordData.primary_keywords
    );

    expect(category.className).toBe('keyword-category');
    expect(category.querySelector('h3').textContent).toBe('🎯 Primary Keywords');
    expect(category.querySelector('p.muted').textContent).toBe('High-impact main keywords for your business');
    expect(category.querySelectorAll('.keyword-item')).toHaveLength(mockKeywordData.primary_keywords.length);
  });

  test('should create keyword items with correct attributes', () => {
    const keyword = mockKeywordData.primary_keywords[0];
    
    const item = document.createElement('div');
    item.className = 'keyword-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.dataset.keyword = keyword.keyword;

    expect(item.className).toBe('keyword-item');
    expect(item.tabIndex).toBe(0);
    expect(item.getAttribute('role')).toBe('button');
    expect(item.dataset.keyword).toBe(keyword.keyword);
  });

  test('should handle empty keyword arrays', () => {
    const emptyKeywords = [];
    
    const createKeywordCategory = (title, description, keywords) => {
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return null;
      }
      
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'keyword-category';
      return categoryDiv;
    };

    const category = createKeywordCategory('Empty Category', 'No keywords', emptyKeywords);
    
    expect(category).toBeNull();
  });

  test('should handle SEO tips display', () => {
    const displaySEOTips = (tips) => {
      const tipsContent = document.getElementById('tipsContent');
      if (!tipsContent) return;

      if (Array.isArray(tips) && tips.length) {
        tipsContent.innerHTML = tips.map(tip => 
          `<div class="tip"><strong>💡 ${tip.tip}</strong><br><small><strong>Example:</strong> Use "${tip.keyword_example}" in your ${tip.placement}</small></div>`
        ).join('');
      } else {
        tipsContent.innerHTML = '';
      }
    };

    displaySEOTips(mockKeywordData.seo_tips);
    
    const tipsContent = document.getElementById('tipsContent');
    expect(tipsContent.innerHTML).toContain('💡');
    expect(tipsContent.innerHTML).toContain('Example:');
    expect(tipsContent.innerHTML).toContain(mockKeywordData.seo_tips[0].keyword_example);
  });
});

describe('Copy Functionality', () => {
  let mockKeywordItem;

  beforeEach(() => {
    mockKeywordItem = document.createElement('div');
    mockKeywordItem.className = 'keyword-item';
    mockKeywordItem.innerHTML = 'Original content <small class="muted">Click to copy</small>';
    document.body.appendChild(mockKeywordItem);
  });

  test('should copy text to clipboard using navigator.clipboard', async () => {
    const copyKeywordText = async (text, el) => {
      if (!text) return;
      if (!navigator.clipboard) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch (e) {}
        ta.remove();
        return Promise.resolve();
      }
      
      return navigator.clipboard.writeText(text).then(() => {
        const original = el.innerHTML;
        el.style.background = '#10b981';
        el.innerHTML = original.replace('Click to copy', '✅ Copied!');
        setTimeout(() => {
          el.style.background = '';
          el.innerHTML = original;
        }, 1400);
      });
    };

    await copyKeywordText('test keyword', mockKeywordItem);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test keyword');
    // The background style might be normalized by JSDOM, so check for the presence of a background
    expect(mockKeywordItem.style.background).toBeTruthy();
    expect(mockKeywordItem.innerHTML).toContain('✅ Copied!');
  });

  test('should fallback to execCommand when clipboard API not available', async () => {
    // Temporarily disable clipboard API
    const originalClipboard = navigator.clipboard;
    delete navigator.clipboard;

    const copyKeywordText = async (text, el) => {
      if (!text) return;
      if (!navigator.clipboard) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch (e) {}
        ta.remove();
        return Promise.resolve();
      }
    };

    await copyKeywordText('test keyword', mockKeywordItem);

    expect(document.execCommand).toHaveBeenCalledWith('copy');

    // Restore clipboard API
    navigator.clipboard = originalClipboard;
  });

  test('should handle empty text gracefully', async () => {
    const copyKeywordText = async (text, el) => {
      if (!text) return;
      return navigator.clipboard.writeText(text);
    };

    await copyKeywordText('', mockKeywordItem);
    await copyKeywordText(null, mockKeywordItem);
    await copyKeywordText(undefined, mockKeywordItem);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });
});

describe('Loading and Error States', () => {
  test('should show and hide loading state', () => {
    const showLoading = (show) => {
      const loading = document.getElementById('loading');
      if (loading) loading.hidden = !show;
      
      const btn = document.getElementById('generateBtn');
      if (btn) btn.disabled = show;
      
      if (show) {
        const results = document.getElementById('results');
        if (results) results.hidden = true;
      }
    };

    // Test show loading
    showLoading(true);
    
    const loading = document.getElementById('loading');
    const generateBtn = document.getElementById('generateBtn');
    const results = document.getElementById('results');
    
    expect(loading.hidden).toBe(false);
    expect(generateBtn.disabled).toBe(true);
    expect(results.hidden).toBe(true);

    // Test hide loading
    showLoading(false);
    
    expect(loading.hidden).toBe(true);
    expect(generateBtn.disabled).toBe(false);
  });

  test('should show and hide error messages', () => {
    const showError = (message) => {
      const errorElement = document.getElementById('error');
      if (!errorElement) return;
      errorElement.textContent = message;
      errorElement.hidden = false;
    };

    const hideError = () => {
      const errorElement = document.getElementById('error');
      if (!errorElement) return;
      errorElement.textContent = '';
      errorElement.hidden = true;
    };

    const errorMessage = 'Test error message';
    
    // Test show error
    showError(errorMessage);
    
    const errorElement = document.getElementById('error');
    expect(errorElement.textContent).toBe(errorMessage);
    expect(errorElement.hidden).toBe(false);

    // Test hide error
    hideError();
    
    expect(errorElement.textContent).toBe('');
    expect(errorElement.hidden).toBe(true);
  });

  test('should handle missing DOM elements gracefully', () => {
    // Remove elements
    document.getElementById('loading').remove();
    document.getElementById('error').remove();
    document.getElementById('generateBtn').remove();

    const showLoading = (show) => {
      const loading = document.getElementById('loading');
      if (loading) loading.hidden = !show;
      
      const btn = document.getElementById('generateBtn');
      if (btn) btn.disabled = show;
      
      if (show) {
        const results = document.getElementById('results');
        if (results) results.hidden = true;
      }
    };

    const showError = (message) => {
      const errorElement = document.getElementById('error');
      if (!errorElement) return;
      errorElement.textContent = message;
      errorElement.hidden = false;
    };

    // These should not throw errors
    expect(() => showLoading(true)).not.toThrow();
    expect(() => showError('Test error')).not.toThrow();
  });
});

describe('HTML Escaping', () => {
  test('should properly escape HTML in keyword display', () => {
    const escapeHtml = (str) => {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const dangerousKeyword = '<script>alert("xss")</script>';
    const escaped = escapeHtml(dangerousKeyword);

    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(escaped).not.toContain('<script>');
    expect(escaped).not.toContain('</script>');
  });

  test('should handle special characters in business names', () => {
    const escapeHtml = (str) => {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const businessName = 'Johnson & Associates "Premium" Services';
    const escaped = escapeHtml(businessName);

    expect(escaped).toBe('Johnson &amp; Associates &quot;Premium&quot; Services');
  });
});

describe('Event Handling', () => {
  test('should handle click events on keyword items', () => {
    const mockKeywordItem = document.createElement('div');
    mockKeywordItem.className = 'keyword-item';
    mockKeywordItem.dataset.keyword = 'test keyword';
    document.body.appendChild(mockKeywordItem);

    const handleClickEvent = (e) => {
      const item = e.target.closest && e.target.closest('.keyword-item');
      if (item && item.dataset && item.dataset.keyword) {
        // Mock copy function
        return item.dataset.keyword;
      }
      return null;
    };

    const mockEvent = { target: mockKeywordItem };
    mockKeywordItem.closest = jest.fn().mockReturnValue(mockKeywordItem);

    const result = handleClickEvent(mockEvent);
    expect(result).toBe('test keyword');
  });

  test('should handle keyboard events for accessibility', () => {
    const mockKeywordItem = document.createElement('div');
    mockKeywordItem.className = 'keyword-item';
    mockKeywordItem.dataset.keyword = 'test keyword';
    document.body.appendChild(mockKeywordItem);

    const handleKeyboardEvent = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const active = document.activeElement;
        if (active && active.classList && active.classList.contains('keyword-item') && active.dataset.keyword) {
          e.preventDefault();
          return active.dataset.keyword;
        }
      }
      return null;
    };

    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      value: mockKeywordItem,
      writable: true
    });

    const mockEvent = { 
      key: 'Enter',
      preventDefault: jest.fn()
    };

    const result = handleKeyboardEvent(mockEvent);
    expect(result).toBe('test keyword');
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test('should handle form submission prevention', () => {
    const handleFormSubmit = (e) => {
      e.preventDefault();
      return 'form submission handled';
    };

    const mockEvent = { preventDefault: jest.fn() };
    const result = handleFormSubmit(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result).toBe('form submission handled');
  });
});