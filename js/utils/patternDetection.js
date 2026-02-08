export function findSimilarities(images) {
  const similarities = [];

  for (let i = 0; i < images.length; i++) {
    for (let j = i + 1; j < images.length; j++) {
      const similarity = compareImages(images[i], images[j]);
      similarities.push({
        pair: `${images[i].name} ↔ ${images[j].name}`,
        similarity: similarity * 100
      });
    }
  }

  return similarities;
}

function compareImages(img1, img2) {
  // Simple dimension-based similarity
  const dimSimilarity = 1 - Math.abs(img1.width - img2.width) / Math.max(img1.width, img2.width);
  
  // File size similarity
  const sizeSimilarity = 1 - Math.abs(img1.file.size - img2.file.size) / Math.max(img1.file.size, img2.file.size);
  
  return (dimSimilarity + sizeSimilarity) / 2;
}

export function detectCorrelations(images) {
  // Detect if images share common patterns that might indicate a series
  const aspectRatios = images.map(img => img.width / img.height);
  const sameAspect = aspectRatios.every(ar => Math.abs(ar - aspectRatios[0]) < 0.01);
  
  const fileSizes = images.map(img => img.file.size);
  const avgSize = fileSizes.reduce((a, b) => a + b, 0) / fileSizes.length;
  const sizeVariance = fileSizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / fileSizes.length;
  const lowVariance = sizeVariance < (avgSize * avgSize * 0.1);

  let score = 0;
  let patterns = 0;

  if (sameAspect) {
    score += 0.5;
    patterns++;
  }

  if (lowVariance) {
    score += 0.3;
    patterns++;
  }

  return {
    sharedPatterns: patterns,
    score: score
  };
}

export function analyzeSequence(images) {
  // Analyze if images form a sequence (e.g., frames from a video)
  if (images.length < 2) return { isSequence: false };

  const timestamps = images.map(img => img.file.lastModified).sort();
  const intervals = [];

  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const regularInterval = intervals.every(int => Math.abs(int - avgInterval) < avgInterval * 0.2);

  return {
    isSequence: regularInterval,
    avgInterval: avgInterval
  };
}