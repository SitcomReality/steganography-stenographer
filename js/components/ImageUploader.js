export default class ImageUploader {
  constructor(container, onImagesChange) {
    this.container = container;
    this.onImagesChange = onImagesChange;
    this.images = [];
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="section">
        <h2 class="section-title">Upload Images</h2>
        <div class="upload-zone" id="upload-zone">
          <div class="upload-icon">📁</div>
          <div class="upload-text">Drop images here or click to browse</div>
          <input type="file" id="file-input" accept="image/*" multiple style="display: none;">
        </div>
        <div class="image-list" id="image-list"></div>
      </div>
    `;
  }

  attachEventListeners() {
    const zone = this.container.querySelector('#upload-zone');
    const input = this.container.querySelector('#file-input');

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });
  }

  async handleFiles(files) {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    for (const file of imageFiles) {
      const imageData = await this.loadImage(file);
      this.images.push(imageData);
    }

    this.updateImageList();
    this.onImagesChange(this.images);
  }

  loadImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            file,
            name: file.name,
            url: e.target.result,
            image: img,
            width: img.width,
            height: img.height
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  updateImageList() {
    const list = this.container.querySelector('#image-list');
    list.innerHTML = this.images.map((img, index) => `
      <div class="image-item">
        <img src="${img.url}" alt="${img.name}">
        <button class="remove-btn" data-index="${index}">×</button>
      </div>
    `).join('');

    list.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.images.splice(index, 1);
        this.updateImageList();
        this.onImagesChange(this.images);
      });
    });
  }
}