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
  // Westfeld's Chi-Square Attack: Detects LSB steganography by comparing 
  // frequencies of adjacent color values (Pairs of Values / PoVs).
  const data = imageData.data;
  const freq = new Array(256).fill(0);
  
  // Use LSB-sensitive frequency (grayscale or just green channel as a proxy)
  for (let i = 0; i < data.length; i += 4) {
    const val = data[i]; // Testing Red channel as a sample
    freq[val]++;
  }

  let chiSquare = 0;
  let categories = 0;

  for (let i = 0; i < 128; i++) {
    const n1 = freq[2 * i];
    const n2 = freq[2 * i + 1];
    const expected = (n1 + n2) / 2;
    
    if (expected > 0) {
      chiSquare += Math.pow(n1 - expected, 2) / expected;
      categories++;
    }
  }

  if (categories === 0) return 0;

  // Simple p-value approximation for steganographic probability
  // A high p-value (close to 1) indicates high likelihood of hidden data 
  // because it means the distributions of 2k and 2k+1 are unnaturally similar.
  const dof = categories - 1;
  const pValue = Math.min(1, chiSquare / (dof * 2));
  
  // Invert because for Steg, we usually want high score = high suspicion
  // but standard Chi-Square tests "uniformity". For LSB, we expect 
  // unnaturally uniform distribution of bits.
  return 1 - pValue;
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