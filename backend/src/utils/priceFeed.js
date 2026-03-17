/**
 * Price Feed Utility
 * Simple in-memory storage for the latest market prices.
 * Used by the Breach Scanner and UI to avoid redundant DB hits.
 */
class PriceFeed {
  constructor() {
    this.prices = new Map();
  }

  setPrice(instrument, price) {
    this.prices.set(instrument, price);
  }

  getPrice(instrument) {
    return this.prices.get(instrument) || null;
  }
}

module.exports = new PriceFeed();
