const dataStorage = require('./dataStorage');
const { scrapeGrailed } = require('./scraper');

const SCRAPE_INTERVAL = 30 * 60 * 1000; // 30 minutes
let intervalId;
let isRunning = false;

// Simple search queries for background scraping (no filters, just like manual)
const defaultSearchQueries = [
    "Supreme",
    "Nike", 
    "Adidas",
    "Balenciaga",
    "Loewe",
    "Prada"
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
            const totalQueries = defaultSearchQueries.length;

            // Try scraping from multiple search queries to get variety
            for (let i = 0; i < totalQueries; i++) {
                const searchQuery = defaultSearchQueries[i];
                console.log(`🎯 Scraping for: ${searchQuery}`);
                
                // Update progress: current query
                dataStorage.updateScrapingProgress(i + 1, totalQueries, searchQuery);
                
                try {
                    const result = await scrapeGrailed(
                        searchQuery,
                        "all", // No category filter
                        "", // No min price
                        "", // No max price
                        10 // Get 10 items per query
                    );
                    allItems.push(...result.items);
                    console.log(`✅ Successfully scraped ${result.items.length} items for ${searchQuery}`);
                } catch (error) {
                    console.log(`❌ Failed to scrape ${searchQuery}:`, error.message);
                }
                
                // Add delay between requests to be respectful
                await this.delay(1000);
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