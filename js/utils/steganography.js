export function analyzeLSB(imageData) {
  const data = imageData.data;
  let redOnes = 0, greenOnes = 0, blueOnes = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] & 1) redOnes++;
    if (data[i + 1] & 1) greenOnes++;
    if (data[i + 2] & 1) blueOnes++;
    total++;
  }

  return {
    red: (redOnes / total) * 100,
    green: (greenOnes / total) * 100,
    blue: (blueOnes / total) * 100
  };
}

export function calculateEntropy(imageData) {
  const data = imageData.data;
  const freq = new Array(256).fill(0);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    freq[gray]++;
  }

  const total = data.length / 4;
  let entropy = 0;

  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / total;
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

export function chiSquareTest(imageData) {
  const data = imageData.data;
  const observed = new Array(256).fill(0);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    observed[gray]++;
  }

  const total = data.length / 4;
  const expected = total / 256;
  let chiSquare = 0;

  for (let i = 0; i < 256; i++) {
    const diff = observed[i] - expected;
    chiSquare += (diff * diff) / expected;
  }

  // Convert to p-value approximation
  const degreesOfFreedom = 255;
  const pValue = 1 - Math.min(1, chiSquare / (2 * degreesOfFreedom));
  
  return pValue;
}

export function extractLSBPlane(imageData, channel) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  const newData = ctx.createImageData(imageData.width, imageData.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const lsb = imageData.data[i + channel] & 1;
    const value = lsb * 255;
    
    newData.data[i] = value;
    newData.data[i + 1] = value;
    newData.data[i + 2] = value;
    newData.data[i + 3] = 255;
  }

  return newData;
}