// Test file for HistoryPage
import { HistoryPage } from '../src/history-page.js';
import { SearchHistoryManager } from '../src/search-history-manager.js';

describe('HistoryPage', () => {
  let historyPage;
  let mockHistoryManager;
  let mockNavigateBack;

  beforeEach(() => {
    // Mock SearchHistoryManager
    mockHistoryManager = {
      getHistory: jest.fn(() => []),
      getSearchStats: jest.fn(() => ({
        totalSearches: 2,
        uniqueBusinesses: 2,
        mostUsedIndustry: 'pet-care',
        averageKeywordsPerSearch: 15
      })),
      getSearchById: jest.fn(),
      getHistoryForChart: jest.fn(() => ({
        labels: ['2023-01-01', '2023-01-02'],
        data: [1, 2]
      })),
      exportHistory: jest.fn(),
      clearHistory: jest.fn(() => true)
    };

    mockNavigateBack = jest.fn();
    historyPage = new HistoryPage(mockHistoryManager, mockNavigateBack);

    // Mock global functions
    global.window = {
      historyPageInstance: historyPage
    };
    global.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default view', () => {
      expect(historyPage.currentView).toBe('list');
      expect(historyPage.selectedSearchId).toBeNull();
    });

    test('should store history manager and navigation callback', () => {
      expect(historyPage.historyManager).toBe(mockHistoryManager);
      expect(historyPage.onNavigateBack).toBe(mockNavigateBack);
    });
  });

  describe('Rendering', () => {
    test('should render empty history state', () => {
      mockHistoryManager.getHistory.mockReturnValue([]);
      
      const html = historyPage.render();
      
      expect(html).toContain('Search History & Analytics');
      expect(html).toContain('No search history yet');
      expect(html).toContain('Generate Keywords');
    });

    test('should render history with entries', () => {
      const mockHistory = [
        {
          id: 'test1',
          timestamp: '2023-01-01T12:00:00.000Z',
          searchParams: {
            business: 'Pet Grooming Service',
            industry: 'pet-care',
            location: 'Seattle',
            keywordType: 'local'
          },
          seoMetrics: {
            totalKeywords: 15,
            totalVolume: 5000,
            seoScore: 75
          },
          backlinks: [
            { url: 'https://example.com', domain: 'example.com', authority: 80 }
          ]
        }
      ];
      mockHistoryManager.getHistory.mockReturnValue(mockHistory);
      
      const html = historyPage.render();
      
      expect(html).toContain('Pet Grooming Service');
      expect(html).toContain('pet-care');
      expect(html).toContain('Seattle');
      expect(html).toContain('15');
      expect(html).toContain('5,000');
      expect(html).toContain('75/100');
      expect(html).toContain('1'); // backlinks count
    });

    test('should render statistics correctly', () => {
      const html = historyPage.render();
      
      expect(html).toContain('2'); // total searches
      expect(html).toContain('pet-care'); // top industry
      expect(html).toContain('15'); // avg keywords
    });

    test('should render navigation tabs', () => {
      const html = historyPage.render();
      
      expect(html).toContain('📝 Search History');
      expect(html).toContain('📈 Analytics');
    });

    test('should highlight active navigation tab', () => {
      historyPage.currentView = 'analytics';
      const html = historyPage.render();
      
      expect(html).toContain('class="nav-btn active"');
    });
  });

  describe('Search Details View', () => {
    beforeEach(() => {
      const mockSearchEntry = {
        id: 'test1',
        timestamp: '2023-01-01T12:00:00.000Z',
        searchParams: {
          business: 'Pet Grooming Service',
          industry: 'pet-care',
          location: 'Seattle',
          keywordType: 'local'
        },
        seoMetrics: {
          totalKeywords: 15,
          totalVolume: 5000,
          averageVolume: 333,
          seoScore: 75,
          competitionBreakdown: {
            easy: 8,
            medium: 5,
            hard: 2
          }
        },
        backlinks: [
          {
            url: 'https://example.com/page1',
            domain: 'example.com',
            authority: 80,
            followType: 'follow',
            anchorText: 'pet grooming',
            firstSeen: '2023-01-01T00:00:00.000Z'
          }
        ],
        results: {
          primary_keywords: [
            { keyword: 'pet grooming', search_volume: '1000', competition: 'medium', intent: 'commercial' }
          ],
          long_tail_keywords: [],
          local_keywords: [],
          content_keywords: []
        }
      };
      mockHistoryManager.getSearchById.mockReturnValue(mockSearchEntry);
    });

    test('should render search details view', () => {
      historyPage.selectedSearchId = 'test1';
      historyPage.currentView = 'details';
      
      const html = historyPage.renderSearchDetails();
      
      expect(html).toContain('Pet Grooming Service');
      expect(html).toContain('Search Parameters');
      expect(html).toContain('SEO Metrics');
      expect(html).toContain('Backlinks Analysis');
      expect(html).toContain('Generated Keywords');
    });

    test('should render competition breakdown', () => {
      historyPage.selectedSearchId = 'test1';
      historyPage.currentView = 'details';
      
      const html = historyPage.renderSearchDetails();
      
      expect(html).toContain('Competition Breakdown');
      expect(html).toContain('Easy (8)');
      expect(html).toContain('Medium (5)');
      expect(html).toContain('Hard (2)');
    });

    test('should render backlinks with proper formatting', () => {
      historyPage.selectedSearchId = 'test1';
      historyPage.currentView = 'details';
      
      const html = historyPage.renderSearchDetails();
      
      expect(html).toContain('example.com');
      expect(html).toContain('DA: 80');
      expect(html).toContain('follow');
      expect(html).toContain('pet grooming');
    });

    test('should handle missing search entry', () => {
      mockHistoryManager.getSearchById.mockReturnValue(null);
      historyPage.selectedSearchId = 'nonexistent';
      historyPage.currentView = 'details';
      
      const html = historyPage.renderSearchDetails();
      
      expect(html).toContain('Search not found');
    });
  });

  describe('Analytics View', () => {
    test('should render analytics sections', () => {
      historyPage.currentView = 'analytics';
      
      const html = historyPage.renderAnalytics();
      
      expect(html).toContain('Search Activity Over Time');
      expect(html).toContain('Industry Distribution');
      expect(html).toContain('SEO Performance Trends');
    });

    test('should render chart container', () => {
      historyPage.currentView = 'analytics';
      
      const html = historyPage.renderAnalytics();
      
      expect(html).toContain('searchActivityChart');
      expect(html).toContain('chart-container');
    });
  });

  describe('Event Handlers', () => {
    test('should switch view', () => {
      historyPage.switchView('analytics');
      
      expect(historyPage.currentView).toBe('analytics');
    });

    test('should view search details', () => {
      historyPage.viewSearchDetails('test-id');
      
      expect(historyPage.selectedSearchId).toBe('test-id');
      expect(historyPage.currentView).toBe('details');
    });

    test('should navigate back', () => {
      historyPage.navigateBack();
      
      expect(mockNavigateBack).toHaveBeenCalled();
    });

    test('should export history', () => {
      historyPage.exportHistory();
      
      expect(mockHistoryManager.exportHistory).toHaveBeenCalled();
    });

    test('should clear history with confirmation', () => {
      historyPage.clearHistory();
      
      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to clear all search history? This cannot be undone.'
      );
      expect(mockHistoryManager.clearHistory).toHaveBeenCalled();
    });

    test('should not clear history if not confirmed', () => {
      global.confirm.mockReturnValue(false);
      
      historyPage.clearHistory();
      
      expect(mockHistoryManager.clearHistory).not.toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    test('should escape HTML correctly', () => {
      const escaped = historyPage.escapeHtml('<script>alert("test")</script>');
      expect(escaped).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
    });

    test('should get SEO score class', () => {
      expect(historyPage.getSEOScoreClass(85)).toBe('excellent');
      expect(historyPage.getSEOScoreClass(70)).toBe('good');
      expect(historyPage.getSEOScoreClass(50)).toBe('fair');
      expect(historyPage.getSEOScoreClass(30)).toBe('poor');
    });

    test('should calculate percentage correctly', () => {
      expect(historyPage.getPercentage(25, 100)).toBe(25);
      expect(historyPage.getPercentage(0, 100)).toBe(0);
      expect(historyPage.getPercentage(50, 0)).toBe(0);
    });
  });

  describe('Industry Distribution', () => {
    test('should render industry distribution with correct data', () => {
      const mockHistory = [
        {
          searchParams: { industry: 'pet-care' },
          seoMetrics: { totalKeywords: 10 }
        },
        {
          searchParams: { industry: 'fitness' },
          seoMetrics: { totalKeywords: 15 }
        },
        {
          searchParams: { industry: 'pet-care' },
          seoMetrics: { totalKeywords: 12 }
        }
      ];
      mockHistoryManager.getHistory.mockReturnValue(mockHistory);
      
      const html = historyPage.renderIndustryDistribution();
      
      expect(html).toContain('pet-care');
      expect(html).toContain('fitness');
      expect(html).toContain('2'); // pet-care count
      expect(html).toContain('1'); // fitness count
    });
  });

  describe('Performance Stats', () => {
    test('should render performance statistics', () => {
      const mockHistory = [
        {
          seoMetrics: {
            seoScore: 80,
            totalKeywords: 15,
            totalVolume: 5000
          }
        },
        {
          seoMetrics: {
            seoScore: 60,
            totalKeywords: 10,
            totalVolume: 3000
          }
        }
      ];
      mockHistoryManager.getHistory.mockReturnValue(mockHistory);
      
      const html = historyPage.renderPerformanceStats();
      
      expect(html).toContain('70/100'); // average SEO score
      expect(html).toContain('13'); // average keywords (rounded)
      expect(html).toContain('4,000'); // average volume
    });

    test('should handle empty history for performance stats', () => {
      mockHistoryManager.getHistory.mockReturnValue([]);
      
      const html = historyPage.renderPerformanceStats();
      
      expect(html).toContain('No data available');
    });
  });

  describe('Chart Drawing', () => {
    test('should draw simple chart with data', () => {
      const mockCanvas = {
        width: 400,
        height: 200
      };
      const mockContext = {
        clearRect: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        fillText: jest.fn(),
        canvas: mockCanvas
      };

      const chartData = {
        labels: ['2023-01-01', '2023-01-02'],
        data: [1, 2]
      };

      historyPage.drawSimpleChart(mockContext, chartData);

      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    test('should handle empty chart data', () => {
      const mockCanvas = {
        width: 400,
        height: 200
      };
      const mockContext = {
        clearRect: jest.fn(),
        fillStyle: '',
        font: '',
        textAlign: '',
        fillText: jest.fn(),
        canvas: mockCanvas
      };

      const chartData = {
        labels: [],
        data: []
      };

      historyPage.drawSimpleChart(mockContext, chartData);

      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalledWith('No data available', 200, 100);
    });
  });
});