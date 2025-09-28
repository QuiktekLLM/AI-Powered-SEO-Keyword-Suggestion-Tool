// Integration test for Search History functionality
import { SearchHistoryManager } from '../src/search-history-manager.js';
import { HistoryPage } from '../src/history-page.js';

describe('Search History Integration', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage with isolated data
    mockLocalStorage = {
      data: {},
      getItem: jest.fn((key) => mockLocalStorage.data[key] || null),
      setItem: jest.fn((key, value) => {
        mockLocalStorage.data[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete mockLocalStorage.data[key];
      })
    };
    global.localStorage = mockLocalStorage;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create SearchHistoryManager instance', () => {
    const historyManager = new SearchHistoryManager();
    expect(historyManager).toBeInstanceOf(SearchHistoryManager);
    expect(historyManager.getHistory()).toEqual([]);
  });

  test('should create HistoryPage instance', () => {
    const historyManager = new SearchHistoryManager();
    const onNavigateBack = jest.fn();
    const historyPage = new HistoryPage(historyManager, onNavigateBack);
    
    expect(historyPage).toBeInstanceOf(HistoryPage);
    expect(historyPage.currentView).toBe('list');
  });

  test('should add and retrieve search history', () => {
    const historyManager = new SearchHistoryManager();
    
    const searchParams = {
      business: 'Test Business',
      industry: 'test',
      location: 'Test City',
      keywordType: 'local'
    };
    const results = {
      primary_keywords: [
        { keyword: 'test keyword', search_volume: '1000', competition: 'medium', intent: 'commercial' }
      ]
    };

    const searchId = historyManager.addSearch(searchParams, results);
    expect(searchId).toBeTruthy();
    
    const history = historyManager.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].searchParams.business).toBe('Test Business');
  });

  test('should generate SEO metrics for searches', () => {
    const historyManager = new SearchHistoryManager();
    
    const results = {
      primary_keywords: [
        { keyword: 'test1', search_volume: '1000', competition: 'easy', intent: 'commercial' },
        { keyword: 'test2', search_volume: '500', competition: 'medium', intent: 'commercial' }
      ]
    };

    historyManager.addSearch(
      { business: 'Test', industry: 'test', location: '', keywordType: 'mixed' },
      results
    );

    const history = historyManager.getHistory();
    const entry = history[0];
    
    expect(entry.seoMetrics).toBeDefined();
    expect(entry.seoMetrics.totalKeywords).toBe(2);
    expect(entry.seoMetrics.totalVolume).toBe(1500);
    expect(entry.seoMetrics.competitionBreakdown).toBeDefined();
  });

  test('should generate backlinks for searches', () => {
    const historyManager = new SearchHistoryManager();
    
    historyManager.addSearch(
      { business: 'Test Business', industry: 'test', location: 'Test City', keywordType: 'local' },
      { primary_keywords: [] }
    );

    const history = historyManager.getHistory();
    const entry = history[0];
    
    expect(entry.backlinks).toBeInstanceOf(Array);
    expect(entry.backlinks.length).toBeGreaterThan(0);
    
    const backlink = entry.backlinks[0];
    expect(backlink).toHaveProperty('url');
    expect(backlink).toHaveProperty('domain');
    expect(backlink).toHaveProperty('authority');
    expect(backlink).toHaveProperty('followType');
  });

  test('should render history page with data', () => {
    const historyManager = new SearchHistoryManager();
    const historyPage = new HistoryPage(historyManager, jest.fn());

    // Add a search
    historyManager.addSearch(
      { business: 'Test Pet Grooming', industry: 'pet-care', location: 'Seattle', keywordType: 'local' },
      { primary_keywords: [{ keyword: 'pet grooming', search_volume: '1000', competition: 'medium', intent: 'commercial' }] }
    );

    const html = historyPage.render();
    expect(html).toContain('Search History & Analytics');
    expect(html).toContain('Test Pet Grooming');
  });

  test('should handle view switching', () => {
    const historyManager = new SearchHistoryManager();
    const historyPage = new HistoryPage(historyManager, jest.fn());

    expect(historyPage.currentView).toBe('list');
    
    historyPage.switchView('analytics');
    expect(historyPage.currentView).toBe('analytics');
    
    historyPage.viewSearchDetails('test-id');
    expect(historyPage.currentView).toBe('details');
    expect(historyPage.selectedSearchId).toBe('test-id');
  });

  test('should escape HTML for security', () => {
    const historyPage = new HistoryPage(new SearchHistoryManager(), jest.fn());
    
    const maliciousInput = '<script>alert("xss")</script>';
    const escaped = historyPage.escapeHtml(maliciousInput);
    
    expect(escaped).not.toContain('<script>');
    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('should provide chart data', () => {
    const historyManager = new SearchHistoryManager();
    
    historyManager.addSearch(
      { business: 'Business 1', industry: 'test', location: '', keywordType: 'mixed' },
      { primary_keywords: [] }
    );

    const chartData = historyManager.getHistoryForChart();
    expect(chartData).toHaveProperty('labels');
    expect(chartData).toHaveProperty('data');
  });

  test('should clear history', () => {
    // Create completely fresh manager to avoid state leakage
    const freshMockStorage = {
      data: {},
      getItem: jest.fn((key) => freshMockStorage.data[key] || null),
      setItem: jest.fn((key, value) => {
        freshMockStorage.data[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete freshMockStorage.data[key];
      })
    };
    global.localStorage = freshMockStorage;
    
    const freshHistoryManager = new SearchHistoryManager();
    
    freshHistoryManager.addSearch(
      { business: 'Test', industry: 'test', location: '', keywordType: 'mixed' },
      { primary_keywords: [] }
    );
    
    expect(freshHistoryManager.getHistory().length).toBeGreaterThanOrEqual(1);
    
    const result = freshHistoryManager.clearHistory();
    expect(result).toBe(true);
    expect(freshHistoryManager.getHistory()).toHaveLength(0);
  });
});