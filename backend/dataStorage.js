const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'scraped_items.json');
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

let items = [];
let lastScraped = null;
let isScraping = false;

// Load items from file on startup
const loadItems = () => {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            items = data.items || [];
            lastScraped = data.lastScraped || null;
            console.log(`📦 Loaded ${items.length} items from ${DATA_FILE}`);
        } catch (error) {
            console.error('Error loading items:', error.message);
            items = [];
            lastScraped = null;
        }
    }
};

// Save items to file
const saveItems = (newItems) => {
    items = newItems;
    lastScraped = new Date().toISOString();
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ items, lastScraped }, null, 2), 'utf8');
        console.log(`💾 Saved ${items.length} items to ${DATA_FILE}`);
    } catch (error) {
        console.error('Error saving items:', error.message);
    }
};

// Update items (merge with existing)
const updateItems = (newItems) => {
    // Remove duplicates based on name and price
    const existingIds = new Set(items.map(item => `${item.name}-${item.price}`));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(`${item.name}-${item.price}`));
    
    items = [...items, ...uniqueNewItems];
    lastScraped = new Date().toISOString();
    
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ items, lastScraped }, null, 2), 'utf8');
        console.log(`🔄 Updated items: ${uniqueNewItems.length} new, ${items.length} total`);
    } catch (error) {
        console.error('Error updating items:', error.message);
    }
};

const getItems = () => items;

const getRandomItem = () => {
    if (items.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
};

const getStatus = () => {
    const isDataFresh = lastScraped ? (new Date() - new Date(lastScraped) < CACHE_DURATION) : false;
    return {
        itemCount: items.length,
        lastScraped,
        isDataFresh,
        isScraping
    };
};

const setScrapingStatus = (status) => {
    isScraping = status;
};

// Load data on module initialization
loadItems();

module.exports = {
    getItems,
    getRandomItem,
    saveItems,
    updateItems,
    getStatus,
    setScrapingStatus,
    isScraping: () => isScraping // Export function for external check
};
