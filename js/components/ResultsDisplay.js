export default class ResultsDisplay {
  render(container, results) {
    const tabs = results.map((r, i) => 
      `<button class="tab ${i === 0 ? 'active' : ''}" data-index="${i}">${r.name}</button>`
    ).join('');

    const tabContents = results.map((r, i) => `
      <div class="tab-content ${i === 0 ? 'active' : ''}" data-index="${i}">
        ${this.renderAnalysis(r, i)}
      </div>
    `).join('');

    container.innerHTML = `
      <div class="tabs">${tabs}</div>
      <div class="tab-contents">${tabContents}</div>
    `;

    this.attachTabListeners(container);
    this.drawHistograms(container, results);
  }

  attachTabListeners(container) {
    const tabs = container.querySelectorAll('.tab');
    const contents = container.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const index = tab.dataset.index;
        
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        contents[index].classList.add('active');
      });
    });
  }

  renderAnalysis(result, i) {
    return `
      <div class="analysis-grid">
        <div class="analysis-card">
          <div class="analysis-card-title">Basic Info</div>
          <div class="metric">
            <span class="metric-label">Dimensions</span>
            <span class="metric-value">${result.dimensions}</span>
          </div>
          <div class="metric">
            <span class="metric-label">File Size</span>
            <span class="metric-value">${this.formatBytes(result.metadata.fileSize)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Type</span>
            <span class="metric-value">${result.metadata.fileType}</span>
          </div>
        </div>

        <div class="analysis-card">
          <div class="analysis-card-title">LSB Analysis <button class="info-btn" data-key="lsbAnalysis">?</button></div>
          <div class="metric">
            <span class="metric-label">Red Channel</span>
            <span class="metric-value ${this.getStatus(result.lsbAnalysis.red)}">${result.lsbAnalysis.red.toFixed(2)}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Green Channel</span>
            <span class="metric-value ${this.getStatus(result.lsbAnalysis.green)}">${result.lsbAnalysis.green.toFixed(2)}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Blue Channel</span>
            <span class="metric-value ${this.getStatus(result.lsbAnalysis.blue)}">${result.lsbAnalysis.blue.toFixed(2)}%</span>
          </div>
        </div>

        <div class="analysis-card">
          <div class="analysis-card-title">Statistical Tests</div>
          <div class="metric">
            <span class="metric-label">Entropy <button class="info-btn" data-key="entropy">?</button></span>
            <span class="metric-value ${this.getEntropyStatus(result.entropy)}">${result.entropy.toFixed(4)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Chi-Square <button class="info-btn" data-key="chiSquare">?</button></span>
            <span class="metric-value ${this.getChiStatus(result.chiSquare)}">${result.chiSquare.toFixed(2)}</span>
          </div>
        </div>

        <div class="analysis-card">
          <div class="analysis-card-title">Color Distribution <button class="info-btn" data-key="colorDistribution">?</button></div>
          <div class="histogram-wrapper">
            <canvas id="histogram-${i}" width="300" height="150"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  getStatus(value) {
    if (value > 52) return 'suspicious';
    if (value > 48) return 'warning';
    return 'normal';
  }

  getEntropyStatus(value) {
    if (value > 7.8) return 'suspicious';
    if (value > 7.5) return 'warning';
    return 'normal';
  }

  getChiStatus(value) {
    // value is (1 - pValue), so closer to 1 is more suspicious
    if (value > 0.9) return 'suspicious';
    if (value > 0.7) return 'warning';
    return 'normal';
  }

  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  drawHistograms(container, results) {
    results.forEach((result, i) => {
      const canvas = container.querySelector(`#histogram-${i}`);
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const { red, green, blue } = result.histogram;
      const max = Math.max(...red, ...green, ...blue);
      
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / 256;

      ctx.clearRect(0, 0, width, height);

      const drawPath = (data, color) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(0, height);
        
        for (let j = 0; j < 256; j++) {
          const val = (data[j] / max) * height;
          ctx.lineTo(j * barWidth, height - val);
        }
        
        ctx.stroke();
      };

      ctx.globalAlpha = 0.8;
      ctx.globalCompositeOperation = 'screen';
      drawPath(red, '#ff6b6b');
      drawPath(green, '#51cf66');
      drawPath(blue, '#339af0');
    });
  }
}