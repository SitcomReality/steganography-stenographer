export function generateHistogram(imageData) {
  const histR = new Array(256).fill(0);
  const histG = new Array(256).fill(0);
  const histB = new Array(256).fill(0);

  for (let i = 0; i < imageData.data.length; i += 4) {
    histR[imageData.data[i]]++;
    histG[imageData.data[i + 1]]++;
    histB[imageData.data[i + 2]]++;
  }

  return { red: histR, green: histG, blue: histB };
}

export function detectVisualPatterns(imageData) {
  // Simple edge detection to find embedded patterns
  const width = imageData.width;
  const data = imageData.data;
  let edgeCount = 0;

  for (let y = 1; y < imageData.height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      const right = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
      const bottom = 0.299 * data[i + width * 4] + 0.587 * data[i + width * 4 + 1] + 0.114 * data[i + width * 4 + 2];
      
      const gradX = Math.abs(gray - right);
      const gradY = Math.abs(gray - bottom);
      
      if (gradX > 30 || gradY > 30) {
        edgeCount++;
      }
    }
  }

  return {
    edgeDensity: edgeCount / (imageData.width * imageData.height),
    hasHighFrequency: edgeCount > (imageData.width * imageData.height * 0.1)
  };
}

export function analyzeColorChannels(imageData) {
  const data = imageData.data;
  let rSum = 0, gSum = 0, bSum = 0;
  const pixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
  }

  return {
    redAvg: rSum / pixels,
    greenAvg: gSum / pixels,
    blueAvg: bSum / pixels
  };
}