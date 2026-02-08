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

export function analyzeHistogramAnomalies(histogram) {
  const anomalies = [];
  const { red, green, blue } = histogram;
  
  // Helper to detect peaks
  const detectPeaks = (data, channelName, color) => {
    const threshold = Math.max(...data) * 0.7;
    const peaks = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push({ value: i, count: data[i], channel: channelName, color });
      }
    }
    return peaks;
  };
  
  // Helper to detect gaps
  const detectGaps = (data, channelName, color) => {
    const avg = data.reduce((a, b) => a + b) / data.length;
    const gaps = [];
    let gapStart = -1;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] < avg * 0.1) {
        if (gapStart === -1) gapStart = i;
      } else if (gapStart !== -1) {
        if (i - gapStart > 10) {
          gaps.push({ start: gapStart, end: i - 1, channel: channelName, color });
        }
        gapStart = -1;
      }
    }
    return gaps;
  };
  
  // Helper to detect unusual smoothness
  const detectSmoothness = (data, channelName, color) => {
    let smoothSections = 0;
    const windowSize = 10;
    
    for (let i = 0; i < data.length - windowSize; i++) {
      let maxDiff = 0;
      for (let j = i; j < i + windowSize - 1; j++) {
        maxDiff = Math.max(maxDiff, Math.abs(data[j] - data[j + 1]));
      }
      
      if (maxDiff < 2) smoothSections++;
    }
    
    const smoothness = smoothSections / (data.length - windowSize);
    return smoothness > 0.3 ? { smoothness, channel: channelName, color } : null;
  };
  
  // Analyze each channel
  const redPeaks = detectPeaks(red, 'Red', '#ff6b6b');
  const greenPeaks = detectPeaks(green, 'Green', '#51cf66');
  const bluePeaks = detectPeaks(blue, 'Blue', '#339af0');
  
  const redGaps = detectGaps(red, 'Red', '#ff6b6b');
  const greenGaps = detectGaps(green, 'Green', '#51cf66');
  const blueGaps = detectGaps(blue, 'Blue', '#339af0');
  
  const redSmooth = detectSmoothness(red, 'Red', '#ff6b6b');
  const greenSmooth = detectSmoothness(green, 'Green', '#51cf66');
  const blueSmooth = detectSmoothness(blue, 'Blue', '#339af0');
  
  // Compile anomalies
  if (redPeaks.length > 3) anomalies.push({ type: 'peaks', data: redPeaks });
  if (greenPeaks.length > 3) anomalies.push({ type: 'peaks', data: greenPeaks });
  if (bluePeaks.length > 3) anomalies.push({ type: 'peaks', data: bluePeaks });
  
  if (redGaps.length > 0) anomalies.push({ type: 'gaps', data: redGaps });
  if (greenGaps.length > 0) anomalies.push({ type: 'gaps', data: greenGaps });
  if (blueGaps.length > 0) anomalies.push({ type: 'gaps', data: blueGaps });
  
  if (redSmooth) anomalies.push({ type: 'smoothness', data: redSmooth });
  if (greenSmooth) anomalies.push({ type: 'smoothness', data: greenSmooth });
  if (blueSmooth) anomalies.push({ type: 'smoothness', data: blueSmooth });
  
  return {
    anomalies,
    hasAnomalies: anomalies.length > 0
  };
}