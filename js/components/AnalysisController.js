import ImageAnalyzer from './ImageAnalyzer.js';
import ResultsDisplay from './ResultsDisplay.js';

export default class AnalysisController {
  constructor(container) {
    this.container = container;
    this.resultsDisplay = new ResultsDisplay();
  }

  async analyzeImages(images) {
    this.container.innerHTML = '<div class="loading">Analyzing images...</div>';

    const results = [];
    for (const imageData of images) {
      const analyzer = new ImageAnalyzer(imageData);
      const result = await analyzer.analyze();
      results.push(result);
    }

    this.displayResults(results);
  }

  displayResults(results) {
    this.container.innerHTML = `
      <div class="section">
        <h2 class="section-title">Analysis Results</h2>
        <div id="results-container"></div>
      </div>
    `;

    const resultsContainer = this.container.querySelector('#results-container');
    this.resultsDisplay.render(resultsContainer, results);
  }
}