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
          <div class="metric">
            <span class="metric-label">Sample Pair Analysis <button class="info-btn" data-key="samplePairAnalysis">?</button></span>
            <span class="metric-value ${this.getSPAStatus(result.samplePairAnalysis)}">${(result.samplePairAnalysis * 100).toFixed(2)}%</span>
          </div>
        </div>

        <div class="analysis-card">
          <div class="analysis-card-title">Advanced Detection</div>
          <div class="metric">
            <span class="metric-label">Bit Plane Anomaly <button class="info-btn" data-key="bitPlaneAnalysis">?</button></span>
            <span class="metric-value ${this.getBitPlaneStatus(result.bitPlanes.suspiciousRatio)}">${result.bitPlanes.suspiciousRatio.toFixed(3)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Color Clustering <button class="info-btn" data-key="colorClustering">?</button></span>
            <span class="metric-value ${result.colorClustering.isUnusual ? 'suspicious' : 'normal'}">${result.colorClustering.isUnusual ? 'Unusual' : 'Normal'}</span>
          </div>
        </div>

        <div class="analysis-card">
          <div class="analysis-card-title">Color Distribution <button class="info-btn" data-key="colorDistribution">?</button></div>
          <div class="histogram-wrapper">
            <canvas id="histogram-${i}" width="300" height="150"></canvas>
          </div>
          ${this.renderHistogramFindings(result.histogramAnalysis)}
        </div>
      </div>
    `;
  }

  renderHistogramFindings(analysis) {
    if (!analysis.hasAnomalies) {
      return '<div class="histogram-findings">No significant anomalies detected.</div>';
    }
    
    const findings = [];
    
    analysis.anomalies.forEach(anomaly => {
      if (anomaly.type === 'peaks') {
        findings.push(`<div class="finding">⚠ Multiple sharp peaks in ${anomaly.data[0].channel} channel</div>`);
      } else if (anomaly.type === 'gaps') {
        anomaly.data.forEach(gap => {
          findings.push(`<div class="finding">⚠ Distribution gap in ${gap.channel} (${gap.start}-${gap.end})</div>`);
        });
      } else if (anomaly.type === 'smoothness') {
        findings.push(`<div class="finding">⚠ Unusual smoothness in ${anomaly.data.channel} channel</div>`);
      }
    });
    
    return `<div class="histogram-findings">${findings.join('')}</div>`;
  }

  getSPAStatus(value) {
    if (value > 0.3) return 'suspicious';
    if (value > 0.15) return 'warning';
    return 'normal';
  }

  getBitPlaneStatus(value) {
    if (value > 1.5) return 'suspicious';
    if (value > 1.2) return 'warning';
    return 'normal';
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

      // Highlight anomalies if present
      if (result.histogramAnalysis.hasAnomalies) {
        result.histogramAnalysis.anomalies.forEach(anomaly => {
          if (anomaly.type === 'peaks') {
            anomaly.data.forEach(peak => {
              ctx.fillStyle = peak.color + '33';
              ctx.fillRect(peak.value * barWidth - 5, 0, 10, height);
            });
          } else if (anomaly.type === 'gaps') {
            anomaly.data.forEach(gap => {
              ctx.fillStyle = '#ffffff11';
              ctx.fillRect(gap.start * barWidth, 0, (gap.end - gap.start) * barWidth, height);
            });
          }
        });
      }

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