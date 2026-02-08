import ImageUploader from './components/ImageUploader.js';
import AnalysisController from './components/AnalysisController.js';
import ComparisonView from './components/ComparisonView.js';

class App {
  constructor() {
    this.images = [];
    this.init();
  }

  init() {
    this.uploader = new ImageUploader(
      document.getElementById('upload-section'),
      this.handleImagesAdded.bind(this)
    );

    this.analysisController = new AnalysisController(
      document.getElementById('analysis-section')
    );

    this.comparisonView = new ComparisonView(
      document.getElementById('comparison-section')
    );
  }

  handleImagesAdded(images) {
    this.images = images;
    
    if (this.images.length > 0) {
      this.analysisController.analyzeImages(this.images);
      
      if (this.images.length > 1) {
        this.comparisonView.compareImages(this.images);
      }
    }
  }
}

// Start the app
new App();