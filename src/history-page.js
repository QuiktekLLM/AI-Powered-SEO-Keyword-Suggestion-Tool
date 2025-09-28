// HistoryPage - UI component for displaying search history and analytics
export class HistoryPage {
  constructor(historyManager, onNavigateBack) {
    this.historyManager = historyManager;
    this.onNavigateBack = onNavigateBack;
    this.currentView = 'list'; // 'list', 'details', 'analytics'
    this.selectedSearchId = null;
  }

  render() {
    const history = this.historyManager.getHistory();
    const stats = this.historyManager.getSearchStats();

    return `
      <div class="history-page">
        <div class="history-header">
          <button class="back-btn" onclick="window.historyPageInstance.navigateBack()">
            ← Back to SEO Tool
          </button>
          <h2>Search History & Analytics</h2>
          <div class="history-actions">
            <button class="btn-secondary" onclick="window.historyPageInstance.exportHistory()">
              📊 Export Data
            </button>
            <button class="btn-secondary" onclick="window.historyPageInstance.clearHistory()" style="background: #ef4444;">
              🗑️ Clear History
            </button>
          </div>
        </div>

        <div class="history-stats">
          <div class="stat-card">
            <h3>${stats.totalSearches}</h3>
            <p>Total Searches</p>
          </div>
          <div class="stat-card">
            <h3>${stats.uniqueBusinesses}</h3>
            <p>Unique Businesses</p>
          </div>
          <div class="stat-card">
            <h3>${stats.mostUsedIndustry || 'N/A'}</h3>
            <p>Top Industry</p>
          </div>
          <div class="stat-card">
            <h3>${stats.averageKeywordsPerSearch}</h3>
            <p>Avg Keywords/Search</p>
          </div>
        </div>

        <div class="history-navigation">
          <button class="nav-btn ${this.currentView === 'list' ? 'active' : ''}" 
                  onclick="window.historyPageInstance.switchView('list')">
            📝 Search History
          </button>
          <button class="nav-btn ${this.currentView === 'analytics' ? 'active' : ''}" 
                  onclick="window.historyPageInstance.switchView('analytics')">
            📈 Analytics
          </button>
        </div>

        <div class="history-content">
          ${this.currentView === 'list' ? this.renderHistoryList(history) : ''}
          ${this.currentView === 'details' ? this.renderSearchDetails() : ''}
          ${this.currentView === 'analytics' ? this.renderAnalytics() : ''}
        </div>
      </div>
    `;
  }

  renderHistoryList(history) {
    if (history.length === 0) {
      return `
        <div class="empty-history">
          <p>No search history yet. Start by generating some keywords!</p>
          <button class="btn" onclick="window.historyPageInstance.navigateBack()">
            Generate Keywords
          </button>
        </div>
      `;
    }

    return `
      <div class="history-list">
        ${history.map(entry => this.renderHistoryItem(entry)).join('')}
      </div>
    `;
  }

  renderHistoryItem(entry) {
    const date = new Date(entry.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    const metrics = entry.seoMetrics;

    return `
      <div class="history-item" onclick="window.historyPageInstance.viewSearchDetails('${entry.id}')">
        <div class="history-item-header">
          <h4>${this.escapeHtml(entry.searchParams.business)}</h4>
          <span class="history-date">${formattedDate}</span>
        </div>
        <div class="history-item-details">
          <span class="industry-tag">${entry.searchParams.industry}</span>
          ${entry.searchParams.location ? `<span class="location-tag">📍 ${entry.searchParams.location}</span>` : ''}
          <span class="keyword-type-tag">${entry.searchParams.keywordType}</span>
        </div>
        <div class="history-metrics">
          <div class="metric">
            <span class="metric-label">Keywords:</span>
            <span class="metric-value">${metrics.totalKeywords}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Total Volume:</span>
            <span class="metric-value">${metrics.totalVolume.toLocaleString()}</span>
          </div>
          <div class="metric">
            <span class="metric-label">SEO Score:</span>
            <span class="metric-value seo-score-${this.getSEOScoreClass(metrics.seoScore)}">${metrics.seoScore}/100</span>
          </div>
          <div class="metric">
            <span class="metric-label">Backlinks:</span>
            <span class="metric-value">${entry.backlinks.length}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderSearchDetails() {
    const entry = this.historyManager.getSearchById(this.selectedSearchId);
    if (!entry) return '<p>Search not found.</p>';

    const date = new Date(entry.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    return `
      <div class="search-details">
        <div class="details-header">
          <button class="back-btn" onclick="window.historyPageInstance.switchView('list')">
            ← Back to History
          </button>
          <h3>${this.escapeHtml(entry.searchParams.business)}</h3>
          <span class="details-date">${formattedDate}</span>
        </div>

        <div class="details-content">
          <div class="details-section">
            <h4>Search Parameters</h4>
            <div class="param-grid">
              <div class="param-item">
                <label>Business:</label>
                <span>${this.escapeHtml(entry.searchParams.business)}</span>
              </div>
              <div class="param-item">
                <label>Industry:</label>
                <span>${entry.searchParams.industry}</span>
              </div>
              <div class="param-item">
                <label>Location:</label>
                <span>${entry.searchParams.location || 'Not specified'}</span>
              </div>
              <div class="param-item">
                <label>Keyword Type:</label>
                <span>${entry.searchParams.keywordType}</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h4>SEO Metrics</h4>
            <div class="metrics-grid">
              <div class="metric-card">
                <h5>${entry.seoMetrics.totalKeywords}</h5>
                <p>Total Keywords</p>
              </div>
              <div class="metric-card">
                <h5>${entry.seoMetrics.totalVolume.toLocaleString()}</h5>
                <p>Total Search Volume</p>
              </div>
              <div class="metric-card">
                <h5>${entry.seoMetrics.averageVolume}</h5>
                <p>Average Volume</p>
              </div>
              <div class="metric-card">
                <h5>${entry.seoMetrics.seoScore}/100</h5>
                <p>SEO Score</p>
              </div>
            </div>
            
            <div class="competition-breakdown">
              <h5>Competition Breakdown</h5>
              <div class="competition-bars">
                <div class="competition-bar">
                  <span>Easy (${entry.seoMetrics.competitionBreakdown.easy})</span>
                  <div class="bar easy" style="width: ${this.getPercentage(entry.seoMetrics.competitionBreakdown.easy, entry.seoMetrics.totalKeywords)}%"></div>
                </div>
                <div class="competition-bar">
                  <span>Medium (${entry.seoMetrics.competitionBreakdown.medium})</span>
                  <div class="bar medium" style="width: ${this.getPercentage(entry.seoMetrics.competitionBreakdown.medium, entry.seoMetrics.totalKeywords)}%"></div>
                </div>
                <div class="competition-bar">
                  <span>Hard (${entry.seoMetrics.competitionBreakdown.hard})</span>
                  <div class="bar hard" style="width: ${this.getPercentage(entry.seoMetrics.competitionBreakdown.hard, entry.seoMetrics.totalKeywords)}%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h4>Backlinks Analysis (${entry.backlinks.length} found)</h4>
            <div class="backlinks-list">
              ${entry.backlinks.slice(0, 10).map(backlink => `
                <div class="backlink-item">
                  <div class="backlink-main">
                    <a href="${backlink.url}" target="_blank" rel="noopener noreferrer">
                      ${backlink.domain}
                    </a>
                    <span class="authority-score">DA: ${backlink.authority}</span>
                    <span class="follow-type ${backlink.followType}">${backlink.followType}</span>
                  </div>
                  <div class="backlink-details">
                    <span class="anchor-text">"${this.escapeHtml(backlink.anchorText)}"</span>
                    <span class="first-seen">First seen: ${new Date(backlink.firstSeen).toLocaleDateString()}</span>
                  </div>
                </div>
              `).join('')}
              ${entry.backlinks.length > 10 ? `<p class="backlinks-more">... and ${entry.backlinks.length - 10} more backlinks</p>` : ''}
            </div>
          </div>

          <div class="details-section">
            <h4>Generated Keywords</h4>
            ${this.renderKeywordResults(entry.results)}
          </div>
        </div>
      </div>
    `;
  }

  renderAnalytics() {
    const chartData = this.historyManager.getHistoryForChart();
    
    return `
      <div class="analytics">
        <div class="analytics-section">
          <h4>Search Activity Over Time</h4>
          <div class="chart-container">
            <canvas id="searchActivityChart" width="400" height="200"></canvas>
          </div>
        </div>

        <div class="analytics-section">
          <h4>Industry Distribution</h4>
          <div class="industry-stats">
            ${this.renderIndustryDistribution()}
          </div>
        </div>

        <div class="analytics-section">
          <h4>SEO Performance Trends</h4>
          <div class="performance-stats">
            ${this.renderPerformanceStats()}
          </div>
        </div>
      </div>
    `;
  }

  renderKeywordResults(results) {
    let html = '<div class="keyword-results-compact">';
    
    const categories = [
      { key: 'primary_keywords', title: 'Primary Keywords' },
      { key: 'long_tail_keywords', title: 'Long-tail Keywords' },
      { key: 'local_keywords', title: 'Local Keywords' },
      { key: 'content_keywords', title: 'Content Keywords' }
    ];

    categories.forEach(category => {
      const keywords = results[category.key];
      if (keywords && keywords.length > 0) {
        html += `
          <div class="keyword-category-compact">
            <h5>${category.title} (${keywords.length})</h5>
            <div class="keywords-compact">
              ${keywords.slice(0, 5).map(kw => `
                <span class="keyword-tag">${this.escapeHtml(kw.keyword)}</span>
              `).join('')}
              ${keywords.length > 5 ? `<span class="keyword-more">+${keywords.length - 5} more</span>` : ''}
            </div>
          </div>
        `;
      }
    });

    html += '</div>';
    return html;
  }

  renderIndustryDistribution() {
    const industries = {};
    this.historyManager.getHistory().forEach(entry => {
      const industry = entry.searchParams.industry;
      industries[industry] = (industries[industry] || 0) + 1;
    });

    const total = Object.values(industries).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(industries)
      .sort(([,a], [,b]) => b - a)
      .map(([industry, count]) => `
        <div class="industry-stat">
          <span class="industry-name">${industry}</span>
          <div class="industry-bar">
            <div class="industry-fill" style="width: ${(count / total * 100)}%"></div>
          </div>
          <span class="industry-count">${count}</span>
        </div>
      `).join('');
  }

  renderPerformanceStats() {
    const history = this.historyManager.getHistory();
    const recentSearches = history.slice(0, 10);
    
    if (recentSearches.length === 0) {
      return '<p>No data available for performance analysis.</p>';
    }

    const avgSEOScore = recentSearches.reduce((sum, entry) => sum + entry.seoMetrics.seoScore, 0) / recentSearches.length;
    const avgKeywords = recentSearches.reduce((sum, entry) => sum + entry.seoMetrics.totalKeywords, 0) / recentSearches.length;
    const avgVolume = recentSearches.reduce((sum, entry) => sum + entry.seoMetrics.totalVolume, 0) / recentSearches.length;

    return `
      <div class="performance-metrics">
        <div class="performance-metric">
          <h5>${Math.round(avgSEOScore)}/100</h5>
          <p>Average SEO Score</p>
        </div>
        <div class="performance-metric">
          <h5>${Math.round(avgKeywords)}</h5>
          <p>Average Keywords</p>
        </div>
        <div class="performance-metric">
          <h5>${Math.round(avgVolume).toLocaleString()}</h5>
          <p>Average Volume</p>
        </div>
      </div>
    `;
  }

  // UI Event Handlers
  switchView(view) {
    this.currentView = view;
    this.refreshView();
  }

  viewSearchDetails(searchId) {
    this.selectedSearchId = searchId;
    this.currentView = 'details';
    this.refreshView();
  }

  navigateBack() {
    if (this.onNavigateBack) {
      this.onNavigateBack();
    }
  }

  exportHistory() {
    this.historyManager.exportHistory();
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear all search history? This cannot be undone.')) {
      this.historyManager.clearHistory();
      this.refreshView();
    }
  }

  refreshView() {
    const container = document.getElementById('historyContainer');
    if (container) {
      container.innerHTML = this.render();
      
      // Initialize chart if in analytics view
      if (this.currentView === 'analytics') {
        setTimeout(() => this.initializeChart(), 100);
      }
    }
  }

  initializeChart() {
    const canvas = document.getElementById('searchActivityChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chartData = this.historyManager.getHistoryForChart();

    // Simple chart implementation without external dependencies
    this.drawSimpleChart(ctx, chartData);
  }

  drawSimpleChart(ctx, data) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.data.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', width / 2, height / 2);
      return;
    }

    const maxValue = Math.max(...data.data, 1);
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw data points and lines
    ctx.strokeStyle = '#6366f1';
    ctx.fillStyle = '#6366f1';
    ctx.lineWidth = 2;

    if (data.data.length > 1) {
      ctx.beginPath();
      data.data.forEach((value, index) => {
        const x = padding + (index / (data.data.length - 1)) * chartWidth;
        const y = height - padding - (value / maxValue) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw data points
      data.data.forEach((value, index) => {
        const x = padding + (index / (data.data.length - 1)) * chartWidth;
        const y = height - padding - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue * i) / 5);
      const y = height - padding - (i / 5) * chartHeight;
      ctx.fillText(value.toString(), padding - 20, y);
    }
  }

  // Utility methods
  escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  getSEOScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getPercentage(value, total) {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}