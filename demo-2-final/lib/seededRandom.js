/**
 * Seeded Random Number Generator using Mulberry32 algorithm
 * Provides reproducible random sequences for procedural generation
 */
export class SeededRandom {
  constructor(seed) {
    this.seed = seed;
    this.state = seed >>> 0; // Ensure unsigned 32-bit
  }

  /**
   * Mulberry32 algorithm - fast, high-quality 32-bit PRNG
   * @returns {number} Random float between 0 and 1
   */
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Random float within range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random float between min and max
   */
  range(min, max) {
    return min + this.next() * (max - min);
  }

  /**
   * Random integer within range (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer between min and max
   */
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Pick random element from array
   * @param {Array} array - Array to pick from
   * @returns {*} Random element
   */
  pick(array) {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * Weighted random selection
   * @param {Array<{value: *, weight: number}>} options - Options with weights
   * @returns {*} Selected value
   */
  weighted(options) {
    const total = options.reduce((sum, opt) => sum + opt.weight, 0);
    let random = this.next() * total;
    for (const opt of options) {
      random -= opt.weight;
      if (random <= 0) return opt.value;
    }
    return options[options.length - 1].value;
  }

  /**
   * Random boolean with probability
   * @param {number} probability - Probability of true (0-1)
   * @returns {boolean}
   */
  chance(probability = 0.5) {
    return this.next() < probability;
  }

  /**
   * Shuffle array in place
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
