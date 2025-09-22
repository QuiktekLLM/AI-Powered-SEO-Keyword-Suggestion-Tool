// Setup file for Jest tests
// Mock DOM elements and global objects

// Mock fetch globally
global.fetch = jest.fn();

// Mock navigator.clipboard
if (typeof navigator === 'undefined') {
  global.navigator = {};
}

Object.assign(global.navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
});

// Mock document methods
if (typeof document !== 'undefined') {
  global.document.execCommand = jest.fn(() => true);
}

// Create mock DOM elements
const createMockElement = (id, tagName = 'div') => {
  const element = document.createElement(tagName);
  element.id = id;
  return element;
};

// Mock common DOM elements used in the app
beforeEach(() => {
  document.body.innerHTML = '';
  
  // Mock form elements
  const form = createMockElement('keywordForm', 'form');
  const businessInput = createMockElement('business', 'textarea');
  const industrySelect = createMockElement('industry', 'select');
  const locationInput = createMockElement('location', 'input');
  const keywordTypeSelect = createMockElement('keywordType', 'select');
  const generateBtn = createMockElement('generateBtn', 'button');
  
  // Mock result elements
  const results = createMockElement('results');
  const keywordResults = createMockElement('keywordResults');
  const tipsContent = createMockElement('tipsContent');
  const loading = createMockElement('loading');
  const error = createMockElement('error');
  
  // Append to document
  document.body.appendChild(form);
  document.body.appendChild(businessInput);
  document.body.appendChild(industrySelect);
  document.body.appendChild(locationInput);
  document.body.appendChild(keywordTypeSelect);
  document.body.appendChild(generateBtn);
  document.body.appendChild(results);
  document.body.appendChild(keywordResults);
  document.body.appendChild(tipsContent);
  document.body.appendChild(loading);
  document.body.appendChild(error);
  
  // Set initial states
  results.hidden = true;
  loading.hidden = true;
  error.hidden = true;
  
  // Reset fetch mock
  global.fetch.mockClear();
  global.navigator.clipboard.writeText.mockClear();
});

// Global test utilities
global.testUtils = {
  createMockKeywordData: () => ({
    primary_keywords: [
      { keyword: 'pet grooming', search_volume: '1200', competition: 'medium', intent: 'commercial' },
      { keyword: 'dog grooming', search_volume: '800', competition: 'high', intent: 'commercial' }
    ],
    long_tail_keywords: [
      { keyword: 'professional pet grooming services', search_volume: '300', competition: 'easy', intent: 'commercial' }
    ],
    local_keywords: [
      { keyword: 'pet grooming near me', search_volume: '600', competition: 'medium', intent: 'local' }
    ],
    content_ideas: [
      { keyword: 'how to groom your pet', search_volume: '400', competition: 'easy', intent: 'informational' }
    ],
    seo_tips: [
      { tip: 'Include keywords in title', keyword_example: 'pet grooming services', placement: 'title tag' }
    ]
  }),
  
  fillFormInputs: (business = 'Test business', industry = 'pet-care', location = 'New York', keywordType = 'mixed') => {
    document.getElementById('business').value = business;
    document.getElementById('industry').value = industry;
    document.getElementById('location').value = location;
    document.getElementById('keywordType').value = keywordType;
  }
};