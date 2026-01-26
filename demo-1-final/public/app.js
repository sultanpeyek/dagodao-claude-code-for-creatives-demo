class ImageSwiper {
  constructor() {
    this.images = [];
    this.currentIndex = 0;
    this.card = document.getElementById('card');
    this.cardImage = document.getElementById('card-image');
    this.emptyState = document.getElementById('empty-state');
    this.remainingEl = document.getElementById('remaining');
    this.archivedEl = document.getElementById('archived');
    this.btnArchive = document.getElementById('btn-archive');
    this.btnKeep = document.getElementById('btn-keep');
    this.overlayLeft = this.card.querySelector('.overlay-left');
    this.overlayRight = this.card.querySelector('.overlay-right');

    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;

    this.init();
  }

  async init() {
    await this.loadImages();
    await this.updateStats();
    this.setupGestures();
    this.setupKeyboard();
    this.setupButtons();
    this.showCurrentImage();
  }

  async loadImages() {
    try {
      const response = await fetch('/api/images');
      this.images = await response.json();
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  }

  async updateStats() {
    try {
      const response = await fetch('/api/stats');
      const stats = await response.json();
      this.remainingEl.textContent = stats.remaining;
      this.archivedEl.textContent = stats.archived;
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  showCurrentImage() {
    if (this.currentIndex >= this.images.length) {
      this.card.classList.add('hidden');
      this.emptyState.classList.add('visible');
      return;
    }

    this.card.classList.remove('hidden');
    this.emptyState.classList.remove('visible');
    const imageName = this.images[this.currentIndex];
    this.cardImage.src = `/images/${encodeURIComponent(imageName)}`;
  }

  setupGestures() {
    const hammer = new Hammer(this.card);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });

    hammer.on('panstart', () => {
      this.isDragging = true;
      this.card.style.transition = 'none';
    });

    hammer.on('panmove', (e) => {
      if (!this.isDragging) return;

      this.currentX = e.deltaX;
      const rotate = e.deltaX * 0.1;
      this.card.style.transform = `translateX(${e.deltaX}px) rotate(${rotate}deg)`;

      const progress = Math.min(Math.abs(e.deltaX) / 100, 1);
      if (e.deltaX < 0) {
        this.overlayLeft.style.opacity = progress;
        this.overlayRight.style.opacity = 0;
      } else {
        this.overlayRight.style.opacity = progress;
        this.overlayLeft.style.opacity = 0;
      }
    });

    hammer.on('panend', (e) => {
      this.isDragging = false;
      this.card.style.transition = 'transform 0.3s ease';
      this.overlayLeft.style.opacity = 0;
      this.overlayRight.style.opacity = 0;

      const threshold = 100;

      if (e.deltaX < -threshold) {
        this.swipeLeft();
      } else if (e.deltaX > threshold) {
        this.swipeRight();
      } else {
        this.card.style.transform = '';
      }
    });
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.swipeLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.swipeRight();
      }
    });
  }

  setupButtons() {
    this.btnArchive.addEventListener('click', () => this.swipeLeft());
    this.btnKeep.addEventListener('click', () => this.swipeRight());
  }

  async swipeLeft() {
    if (this.currentIndex >= this.images.length) return;

    this.card.classList.add('animate-left');

    const filename = this.images[this.currentIndex];

    try {
      await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });

      this.images.splice(this.currentIndex, 1);
      await this.updateStats();
    } catch (error) {
      console.error('Failed to archive:', error);
    }

    setTimeout(() => {
      this.card.classList.remove('animate-left');
      this.card.style.transform = '';
      this.showCurrentImage();
    }, 300);
  }

  swipeRight() {
    if (this.currentIndex >= this.images.length) return;

    this.card.classList.add('animate-right');

    setTimeout(() => {
      this.card.classList.remove('animate-right');
      this.card.style.transform = '';
      this.currentIndex++;
      this.showCurrentImage();
    }, 300);
  }
}

new ImageSwiper();
