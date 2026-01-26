/**
 * Image Swiper - Demo Mode
 * This is a demo version that simulates the swipe functionality
 * without a backend server. Install locally for full functionality.
 */

class ImageSwiperDemo {
  constructor() {
    // Hardcoded demo images (gradient placeholders)
    this.allImages = [
      { id: 1, gradient: 'linear-gradient(135deg, #667eea, #764ba2)', label: 'Sunset Mountains' },
      { id: 2, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', label: 'Beach Vacation' },
      { id: 3, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', label: 'Ocean Waves' },
      { id: 4, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', label: 'Forest Trail' },
      { id: 5, gradient: 'linear-gradient(135deg, #fa709a, #fee140)', label: 'City Skyline' }
    ];

    this.images = [...this.allImages];
    this.currentIndex = 0;
    this.archived = 0;

    this.card = document.getElementById('card');
    this.cardImage = document.getElementById('card-image');
    this.emptyState = document.getElementById('empty-state');
    this.remainingEl = document.getElementById('remaining');
    this.archivedEl = document.getElementById('archived');
    this.btnArchive = document.getElementById('btn-archive');
    this.btnKeep = document.getElementById('btn-keep');
    this.resetBtn = document.getElementById('reset-btn');
    this.toast = document.getElementById('toast');
    this.overlayLeft = this.card.querySelector('.overlay-left');
    this.overlayRight = this.card.querySelector('.overlay-right');

    this.init();
  }

  init() {
    this.setupGestures();
    this.setupKeyboard();
    this.setupButtons();
    this.showCurrentImage();
    this.updateStats();
  }

  updateStats() {
    this.remainingEl.textContent = this.images.length - this.currentIndex;
    this.archivedEl.textContent = this.archived;
  }

  showCurrentImage() {
    if (this.currentIndex >= this.images.length) {
      this.card.classList.add('hidden');
      this.emptyState.classList.add('visible');
      return;
    }

    this.card.classList.remove('hidden');
    this.emptyState.classList.remove('visible');

    const image = this.images[this.currentIndex];
    this.cardImage.style.background = image.gradient;
    this.cardImage.querySelector('.placeholder-text').textContent = image.label;
  }

  setupGestures() {
    const hammer = new Hammer(this.card);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });

    hammer.on('panstart', () => {
      this.card.style.transition = 'none';
    });

    hammer.on('panmove', (e) => {
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
    this.resetBtn.addEventListener('click', () => this.resetDemo());
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.classList.add('visible');
    setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 2000);
  }

  swipeLeft() {
    if (this.currentIndex >= this.images.length) return;

    this.card.classList.add('animate-left');

    // Simulate archive action
    this.showToast('In full version: Image would be moved to archives');
    this.archived++;
    this.currentIndex++;
    this.updateStats();

    setTimeout(() => {
      this.card.classList.remove('animate-left');
      this.card.style.transform = '';
      this.showCurrentImage();
    }, 300);
  }

  swipeRight() {
    if (this.currentIndex >= this.images.length) return;

    this.card.classList.add('animate-right');

    // Simulate keep action
    this.showToast('Kept! Moving to next image...');
    this.currentIndex++;
    this.updateStats();

    setTimeout(() => {
      this.card.classList.remove('animate-right');
      this.card.style.transform = '';
      this.showCurrentImage();
    }, 300);
  }

  resetDemo() {
    this.images = [...this.allImages];
    this.currentIndex = 0;
    this.archived = 0;
    this.updateStats();
    this.showCurrentImage();
    this.showToast('Demo reset!');
  }
}

new ImageSwiperDemo();
