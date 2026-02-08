import * as Steg from '../utils/steganography.js';
import * as ImgProc from '../utils/imageProcessing.js';

export default class ImageAnalyzer {
  constructor(imageData) {
    this.imageData = imageData;
  }

  async analyze() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = this.imageData.width;
    canvas.height = this.imageData.height;
    ctx.drawImage(this.imageData.image, 0, 0);

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return {
      name: this.imageData.name,
      dimensions: `${this.imageData.width}×${this.imageData.height}`,
      lsbAnalysis: Steg.analyzeLSB(pixels),
      histogram: ImgProc.generateHistogram(pixels),
      metadata: await this.extractMetadata(),
      entropy: Steg.calculateEntropy(pixels),
      chiSquare: Steg.chiSquareTest(pixels),
      visualPatterns: ImgProc.detectVisualPatterns(pixels)
    };
  }

  async extractMetadata() {
    // Extract EXIF and other metadata
    return {
      fileSize: this.imageData.file.size,
      fileType: this.imageData.file.type,
      lastModified: new Date(this.imageData.file.lastModified).toISOString()
    };
  }
}