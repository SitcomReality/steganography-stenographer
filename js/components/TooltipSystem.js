import { DEFINITIONS } from '../utils/definitions.js';

export default class TooltipSystem {
  constructor() {
    this.createTooltipElement();
    this.attachGlobalListeners();
  }

  createTooltipElement() {
    // Check if exists to prevent duplicates on hot reload
    let existing = document.getElementById('tooltip-popup');
    if (existing) existing.remove();

    this.tooltip = document.createElement('div');
    this.tooltip.id = 'tooltip-popup';
    this.tooltip.className = 'tooltip hidden';
    document.body.appendChild(this.tooltip);
  }

  attachGlobalListeners() {
    // Use event delegation to handle dynamically added buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.info-btn');
      
      if (btn) {
        e.stopPropagation();
        e.preventDefault(); // Prevent button causing form submits etc
        const key = btn.dataset.key;
        this.showTooltip(btn, key);
      } else if (this.tooltip && !this.tooltip.contains(e.target)) {
        this.hideTooltip();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideTooltip();
    });
    
    // Hide on scroll/resize to prevent positioning issues
    window.addEventListener('scroll', () => this.hideTooltip(), { passive: true });
    window.addEventListener('resize', () => this.hideTooltip(), { passive: true });
  }

  showTooltip(targetElement, key) {
    const text = DEFINITIONS[key];
    if (!text) return;

    this.tooltip.innerHTML = `
      <div class="tooltip-content">${text}</div>
    `;
    
    this.tooltip.classList.remove('hidden');
    
    // Calculate Position
    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    // Default: Show above the button
    let top = rect.top + scrollY - tooltipRect.height - 10;
    let left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);
    
    // Check top boundary - flip to below if needed
    if (rect.top - tooltipRect.height - 10 < 0) {
      top = rect.bottom + scrollY + 10;
    }

    // Check horizontal boundaries
    if (left < 10) left = 10;
    if (left + tooltipRect.width > document.documentElement.clientWidth - 10) {
      left = document.documentElement.clientWidth - tooltipRect.width - 10;
    }

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.add('hidden');
    }
  }
}