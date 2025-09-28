// SearchHistoryManager - Manages search history and backlinks data
export class SearchHistoryManager {
  constructor() {
    this.storageKey = 'seo-tool-search-history';
    this.maxHistoryItems = 100; // Limit to prevent storage bloat
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load search history from localStorage:', error);
      return [];
    }
  }

  saveHistory() {
    try {
      // Keep only the most recent items
      const trimmedHistory = this.history.slice(-this.maxHistoryItems);
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedHistory));
      this.history = trimmedHistory;
      return true;
    } catch (error) {
      console.warn('Failed to save search history to localStorage:', error);
      return false;
    }
  }

  addSearch(searchParams, results) {
    const searchEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      searchParams: {
        business: searchParams.business,
        industry: searchParams.industry,
        location: searchParams.location || '',
        keywordType: searchParams.keywordType
      },
      results: results,
      backlinks: this.generateMockBacklinks(searchParams, results),
      seoMetrics: this.calculateSEOMetrics(results)
    };

    this.history.push(searchEntry);
    this.saveHistory();
    return searchEntry.id;
  }

  getHistory() {
    return [...this.history].reverse(); // Most recent first
  }

  getSearchById(id) {
    return this.history.find(entry => entry.id === id);
  }

  getSearchesByBusiness(business) {
    return this.history.filter(entry => 
      entry.searchParams.business.toLowerCase().includes(business.toLowerCase())
    );
  }

  getRecentSearches(limit = 10) {
    return this.getHistory().slice(0, limit);
  }

  getSearchStats() {
    const totalSearches = this.history.length;
    const uniqueBusinesses = new Set(this.history.map(h => h.searchParams.business)).size;
    const mostUsedIndustry = this.getMostUsedIndustry();
    const averageKeywordsPerSearch = this.getAverageKeywordsPerSearch();

    return {
      totalSearches,
      uniqueBusinesses,
      mostUsedIndustry,
      averageKeywordsPerSearch,
      firstSearchDate: this.history.length > 0 ? this.history[0].timestamp : null,
      latestSearchDate: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : null
    };
  }

  getHistoryForChart() {
    const searchesByDate = {};
    
    this.history.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      searchesByDate[date] = (searchesByDate[date] || 0) + 1;
    });

    const sortedDates = Object.keys(searchesByDate).sort();
    const labels = [];
    const data = [];

    // Fill in missing dates for better chart continuity
    if (sortedDates.length > 0) {
      const startDate = new Date(sortedDates[0]);
      const endDate = new Date(sortedDates[sortedDates.length - 1]);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        labels.push(dateStr);
        data.push(searchesByDate[dateStr] || 0);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return { labels, data };
  }

  clearHistory() {
    try {
      localStorage.removeItem(this.storageKey);
      this.history = [];
      return true;
    } catch (error) {
      console.warn('Failed to clear search history:', error);
      return false;
    }
  }

  exportHistory() {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalSearches: this.history.length,
      searches: this.history
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo_search_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Private helper methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getMostUsedIndustry() {
    const industries = {};
    this.history.forEach(entry => {
      const industry = entry.searchParams.industry;
      industries[industry] = (industries[industry] || 0) + 1;
    });

    return Object.keys(industries).reduce((a, b) => 
      industries[a] > industries[b] ? a : b, 
      Object.keys(industries)[0]
    );
  }

  getAverageKeywordsPerSearch() {
    if (this.history.length === 0) return 0;
    
    const totalKeywords = this.history.reduce((total, entry) => {
      const results = entry.results;
      let keywordCount = 0;
      
      if (results.primary_keywords) keywordCount += results.primary_keywords.length;
      if (results.long_tail_keywords) keywordCount += results.long_tail_keywords.length;
      if (results.local_keywords) keywordCount += results.local_keywords.length;
      if (results.content_keywords) keywordCount += results.content_keywords.length;
      
      return total + keywordCount;
    }, 0);

    return Math.round(totalKeywords / this.history.length);
  }

  generateMockBacklinks(searchParams, results) {
    // Generate realistic mock backlink data for demonstration
    const backlinks = [];
    const domains = [
      'example.com', 'businessdirectory.com', 'yelp.com', 'facebook.com',
      'linkedin.com', 'instagram.com', 'localbusiness.com', 'industry-news.com'
    ];

    const numBacklinks = Math.floor(Math.random() * 15) + 5; // 5-20 backlinks

    for (let i = 0; i < numBacklinks; i++) {
      const domain = domains[Math.floor(Math.random() * domains.length)];
      backlinks.push({
        url: `https://${domain}/page-${i + 1}`,
        domain: domain,
        anchorText: this.generateAnchorText(searchParams, results),
        authority: Math.floor(Math.random() * 100) + 1,
        followType: Math.random() > 0.3 ? 'follow' : 'nofollow',
        firstSeen: this.generateRandomDate(),
        lastChecked: new Date().toISOString()
      });
    }

    return backlinks.sort((a, b) => b.authority - a.authority);
  }

  generateAnchorText(searchParams, results) {
    const options = [
      searchParams.business.split(' ').slice(0, 3).join(' '),
      `${searchParams.business.split(' ')[0]} services`,
      'click here',
      'read more',
      searchParams.location ? `${searchParams.business.split(' ')[0]} in ${searchParams.location}` : 'local business'
    ];

    return options[Math.floor(Math.random() * options.length)];
  }

  generateRandomDate() {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
  }

  calculateSEOMetrics(results) {
    let totalVolume = 0;
    let totalKeywords = 0;
    let easyKeywords = 0;
    let mediumKeywords = 0;
    let hardKeywords = 0;

    const processKeywords = (keywords) => {
      if (!keywords) return;
      
      keywords.forEach(kw => {
        totalKeywords++;
        const volume = typeof kw.search_volume === 'string' ? 
          parseInt(kw.search_volume.replace(/[,k]/g, '')) || 0 : 
          kw.search_volume || 0;
        totalVolume += volume;

        switch (kw.competition) {
          case 'easy': easyKeywords++; break;
          case 'medium': mediumKeywords++; break;
          case 'hard': hardKeywords++; break;
        }
      });
    };

    processKeywords(results.primary_keywords);
    processKeywords(results.long_tail_keywords);
    processKeywords(results.local_keywords);
    processKeywords(results.content_keywords);

    return {
      totalKeywords,
      totalVolume,
      averageVolume: totalKeywords > 0 ? Math.round(totalVolume / totalKeywords) : 0,
      competitionBreakdown: {
        easy: easyKeywords,
        medium: mediumKeywords,
        hard: hardKeywords
      },
      seoScore: this.calculateSEOScore(totalKeywords, easyKeywords, mediumKeywords, hardKeywords, totalVolume)
    };
  }

  calculateSEOScore(total, easy, medium, hard, volume) {
    if (total === 0) return 0;
    
    // Score based on keyword difficulty distribution and volume
    const difficultyScore = (easy * 0.8 + medium * 0.5 + hard * 0.2) / total;
    const volumeScore = Math.min(volume / 10000, 1); // Normalize volume to 0-1
    
    return Math.round((difficultyScore * 0.6 + volumeScore * 0.4) * 100);
  }
}