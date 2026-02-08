import * as PatternDetect from '../utils/patternDetection.js';

export default class ComparisonView {
  constructor(container) {
    this.container = container;
  }

  async compareImages(images) {
    this.container.innerHTML = `
      <div class="section">
        <h2 class="section-title">Cross-Image Analysis</h2>
        <div class="loading">Comparing images...</div>
      </div>
    `;

    const similarities = PatternDetect.findSimilarities(images);
    const correlations = PatternDetect.detectCorrelations(images);

    this.container.innerHTML = `
      <div class="section">
        <h2 class="section-title">Cross-Image Analysis</h2>
        <div class="comparison-grid">
          ${this.renderSimilarities(similarities)}
          ${this.renderCorrelations(correlations)}
        </div>
      </div>
    `;
  }

  renderSimilarities(similarities) {
    return `
      <div class="analysis-card">
        <div class="analysis-card-title">Image Similarities <button class="info-btn" data-key="imageSimilarities">?</button></div>
        ${similarities.map(s => `
          <div class="metric">
            <span class="metric-label">${s.pair}</span>
            <span class="metric-value">${s.similarity.toFixed(2)}%</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCorrelations(correlations) {
    return `
      <div class="analysis-card">
        <div class="analysis-card-title">Pattern Correlations</div>
        <div class="metric">
          <span class="metric-label">Shared Patterns <button class="info-btn" data-key="sharedPatterns">?</button></span>
          <span class="metric-value">${correlations.sharedPatterns}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Correlation Score <button class="info-btn" data-key="correlationScore">?</button></span>
          <span class="metric-value ${correlations.score > 0.7 ? 'suspicious' : 'normal'}">${correlations.score.toFixed(3)}</span>
        </div>
      </div>
    `;
  }
}