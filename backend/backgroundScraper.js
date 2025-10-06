const dataStorage = require('./dataStorage');
const { scrapeGrailed } = require('./scraper');

const SCRAPE_INTERVAL = 30 * 60 * 1000; // 30 minutes
let intervalId;
let isRunning = false;

// Default search queries for background scraping
const defaultSearchQueries = [
    { searchQuery: "Supreme", category: "all", priceRange: { min: "", max: "" }, limit: 10 },
    { searchQuery: "Nike", category: "Shoes", priceRange: { min: "", max: "" }, limit: 5 },
    { searchQuery: "Adidas", category: "Shoes", priceRange: { min: "", max: "" }, limit: 5 },
    { searchQuery: "Nike", category: "T-Shirts", priceRange: { min: "", max: "" }, limit: 5 },
    { searchQuery: "Supreme", category: "Hoodies", priceRange: { min: "", max: "" }, limit: 5 },
    { searchQuery: "Off-White", category: "all", priceRange: { min: "", max: "" }, limit: 5 },
    { searchQuery: "Stone Island", category: "Jackets", priceRange: { min: "", max: "" }, limit: 5 },
    { searchQuery: "Prada", category: "Accessories", priceRange: { min: "", max: "" }, limit: 5 },
    { searchQuery: "Gucci", category: "all", priceRange: { min: "", max: "" }, limit: 5 },
    { searchQuery: "Balenciaga", category: "all", priceRange: { min: "", max: "" }, limit: 5 },
];

class BackgroundScraper {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
    }

    // Start background scraping
    start() {
        if (this.isRunning) {
            console.log('🔄 Background scraper already running');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting background scraper...');
        
        // Perform initial scrape on startup
        this.scrapeNow();
        
        // Set up periodic scraping
        this.intervalId = setInterval(() => {
            this.scrapeNow();
        }, SCRAPE_INTERVAL);
        
        console.log(`⏰ Background scraper started (interval: ${SCRAPE_INTERVAL / 60000} minutes)`);
    }

    // Stop background scraping
    stop() {
        if (!this.isRunning) {
            console.log('🛑 Background scraper not running');
            return;
        }

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('🛑 Background scraper stopped');
    }


    // Perform scraping now
    async scrapeNow() {
        if (dataStorage.isScraping()) {
            console.log('⏳ Scraping already in progress, skipping...');
            return;
        }

        dataStorage.setScrapingStatus(true);
        console.log('🔍 Starting background scrape...');

        try {
            const allItems = [];

            // Try scraping from multiple search queries to get variety
            for (let i = 0; i < Math.min(6, defaultSearchQueries.length); i++) {
                const query = defaultSearchQueries[i];
                console.log(`🎯 Scraping for: ${query.searchQuery} (${query.category})`);
                
                try {
                    const result = await scrapeGrailed(
                        query.searchQuery,
                        query.category,
                        query.priceRange.min,
                        query.priceRange.max,
                        query.limit
                    );
                    allItems.push(...result.items);
                    console.log(`✅ Successfully scraped ${result.items.length} items for ${query.searchQuery}`);
                } catch (error) {
                    console.log(`❌ Failed to scrape ${query.searchQuery}:`, error.message);
                }
                
                // Add delay between requests to be respectful
                await this.delay(3000);
            }

      // Update items with new data (only real items)
      if (allItems.length > 0) {
        dataStorage.updateItems(allItems);
        console.log(`🎉 Background scrape complete: ${allItems.length} real items collected`);
      } else {
        console.log('❌ No items scraped successfully');
      }
            
        } catch (error) {
            console.error('💥 Background scraping error:', error.message);
        } finally {
            dataStorage.setScrapingStatus(false);
        }
    }

    // Helper function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create singleton instance
const backgroundScraper = new BackgroundScraper();

module.exports = {
    start: () => backgroundScraper.start(),
    stop: () => backgroundScraper.stop(),
    scrapeNow: () => backgroundScraper.scrapeNow(),
};
