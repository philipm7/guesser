// dataStorage.js - Simple file-based data storage for scraped items
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'scraped_items.json');
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

class DataStorage {
  constructor() {
    this.items = [];
    this.lastScraped = null;
    this.isScraping = false;
    this.loadData();
  }

  // Load data from file on startup
  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        this.items = data.items || [];
        this.lastScraped = new Date(data.lastScraped);
        console.log(`Loaded ${this.items.length} items from storage`);
      }
    } catch (error) {
      console.error('Error loading data:', error.message);
      this.items = [];
      this.lastScraped = null;
    }
  }

  // Save data to file
  saveData() {
    try {
      const data = {
        items: this.items,
        lastScraped: this.lastScraped?.toISOString(),
        version: '1.0'
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log(`Saved ${this.items.length} items to storage`);
    } catch (error) {
      console.error('Error saving data:', error.message);
    }
  }

  // Check if data is fresh enough
  isDataFresh() {
    if (!this.lastScraped) return false;
    const now = new Date();
    const timeDiff = now.getTime() - this.lastScraped.getTime();
    return timeDiff < CACHE_DURATION;
  }

  // Update items and save
  updateItems(newItems) {
    this.items = newItems;
    this.lastScraped = new Date();
    this.saveData();
  }

  // Get items
  getItems() {
    return this.items;
  }

  // Get a random item for the game
  getRandomItem() {
    if (this.items.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.items.length);
    return this.items[randomIndex];
  }

  // Get scraping status
  getStatus() {
    return {
      itemCount: this.items.length,
      lastScraped: this.lastScraped,
      isDataFresh: this.isDataFresh(),
      isScraping: this.isScraping
    };
  }

  // Set scraping status
  setScrapingStatus(scraping) {
    this.isScraping = scraping;
  }
}

module.exports = new DataStorage();
