// backgroundScraper.js - Background scraping service
const puppeteer = require('puppeteer');
const dataStorage = require('./dataStorage');

class BackgroundScraper {
  constructor() {
    this.isRunning = false;
    this.scrapeInterval = null;
    this.defaultSearchQueries = [
      'Supreme',
      'Nike',
      'Adidas', 
      'Off-White',
      'Stone Island',
      'Carhartt',
      'Patagonia',
      'Vetements',
      'Balenciaga',
      'Gucci',
      'Louis Vuitton',
      'Prada',
      'Dior',
      'Saint Laurent',
      'Yeezy'
    ];
  }

  // Start background scraping
  start() {
    console.log('Starting background scraper...');
    
    // Scrape immediately if no data or data is stale
    if (!dataStorage.isDataFresh()) {
      this.scrapeNow();
    }

    // Set up periodic scraping every 30 minutes
    this.scrapeInterval = setInterval(() => {
      this.scrapeNow();
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Stop background scraping
  stop() {
    if (this.scrapeInterval) {
      clearInterval(this.scrapeInterval);
      this.scrapeInterval = null;
    }
    this.isRunning = false;
    console.log('Background scraper stopped');
  }

  // Generate mock data as fallback
  generateMockData() {
    const mockItems = [];
    const brands = ['Supreme', 'Nike', 'Adidas', 'Off-White', 'Stone Island', 'Carhartt', 'Patagonia', 'Vetements', 'Balenciaga', 'Gucci'];
    const itemTypes = ['T-Shirt', 'Hoodie', 'Jacket', 'Pants', 'Shoes', 'Hat', 'Sweatshirt', 'Shorts'];
    
    for (let i = 0; i < 50; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const price = Math.floor(Math.random() * 800) + 50; // $50-$850
      
      mockItems.push({
        id: i + 1,
        name: `${brand} ${itemType} ${Math.floor(Math.random() * 1000) + 1}`,
        brand,
        price,
        size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
        seller: `grailed_user_${Math.floor(Math.random() * 10000)}`,
        image: `https://images.unsplash.com/photo-${1441986300917 + i}?w=400&h=400&fit=crop`,
        link: `https://www.grailed.com/listings/mock-item-${i}`,
        likes: Math.floor(Math.random() * 100),
        condition: "Used",
        category: "Various",
      });
    }
    
    return mockItems;
  }

  // Perform scraping now
  async scrapeNow() {
    if (this.isRunning) {
      console.log('Scraping already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    dataStorage.setScrapingStatus(true);

    try {
      console.log('Starting background scrape...');
      const allItems = [];

      // Try scraping from multiple search queries to get variety
      for (let i = 0; i < Math.min(3, this.defaultSearchQueries.length); i++) {
        const query = this.defaultSearchQueries[i];
        console.log(`Scraping for: ${query}`);
        
        try {
          const items = await this.scrapeGrailed(query, '', '', '', 15);
          allItems.push(...items);
          console.log(`Successfully scraped ${items.length} items for ${query}`);
        } catch (error) {
          console.log(`Failed to scrape ${query}:`, error.message);
        }
        
        // Add delay between requests to be respectful
        await this.delay(2000);
      }

      // If scraping failed completely, use mock data
      if (allItems.length === 0) {
        console.log('Scraping failed, generating mock data...');
        const mockItems = this.generateMockData();
        dataStorage.updateItems(mockItems);
        console.log(`Generated ${mockItems.length} mock items`);
      } else {
        // Remove duplicates based on name and price
        const uniqueItems = this.removeDuplicates(allItems);
        console.log(`Background scrape complete: ${uniqueItems.length} unique items`);
        dataStorage.updateItems(uniqueItems);
      }
      
    } catch (error) {
      console.error('Background scraping error:', error.message);
      // Fallback to mock data on complete failure
      console.log('Using fallback mock data...');
      const mockItems = this.generateMockData();
      dataStorage.updateItems(mockItems);
    } finally {
      this.isRunning = false;
      dataStorage.setScrapingStatus(false);
    }
  }

  // Remove duplicate items
  removeDuplicates(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = `${item.name}-${item.price}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Helper function to add random delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main scraping function (simplified version of the one in server.js)
  async scrapeGrailed(searchQuery = "", category = "", minPrice = "", maxPrice = "", limit = 20) {
    let browser;

    try {
      // Launch browser with stealth settings
      const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV;
      browser = await puppeteer.launch({
        headless: isDocker ? "new" : true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
          "--disable-features=VizDisplayCompositor",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-first-run",
          "--disable-web-security",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-default-apps",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-field-trial-config",
          "--disable-hang-monitor",
          "--disable-prompt-on-repost",
          "--disable-sync",
          "--disable-translate",
          "--disable-windows10-custom-titlebar",
          "--metrics-recording-only",
          "--no-first-run",
          "--safebrowsing-disable-auto-update",
          "--enable-automation",
          "--password-store=basic",
          "--use-mock-keychain",
        ],
        executablePath: isDocker ? "/usr/bin/chromium-browser" : undefined,
        timeout: 120000, // 2 minute timeout
        protocolTimeout: 120000,
        ignoreDefaultArgs: ['--disable-extensions'],
      });

      const page = await browser.newPage();

      // Set realistic user agent and viewport
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await page.setViewport({ width: 1366, height: 768 });

      // Build Grailed search URL
      let searchUrl = "https://www.grailed.com/shop";
      const params = new URLSearchParams();

      if (searchQuery) params.append("query", searchQuery);
      if (category && category !== "all") {
        const categoryMap = {
          "T-Shirts": "tops.short_sleeve_shirts",
          Hoodies: "tops.sweatshirts_hoodies",
          Jackets: "outerwear.light_jackets",
          Accessories: "accessories.belts%2Caccessories.glasses%2Caccessories.jewelry_watches",
          Pants: "bottoms.casual_pants%2Cbottoms.denim%2Cbottoms.shorts",
          Shoes: "footwear.hitop_sneakers%2Cfootwear.lowtop_sneakers%2Cfootwear.boots",
        };
        if (categoryMap[category]) {
          params.append("category", categoryMap[category]);
        }
      }

      if (minPrice) params.append("price", minPrice + ":" + maxPrice);

      if (params.toString()) {
        searchUrl += "?" + params.toString();
      }

      // Navigate to search page
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for page to load and scroll to trigger lazy loading
      await page.waitForTimeout(3000);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 3);
      });
      await this.delay(2000);

      // Extract item data
      const items = await page.evaluate((limit) => {
        // Look for item links
        const itemLinks = document.querySelectorAll('a[href*="/listings/"]');
        const results = [];

        for (let i = 0; i < Math.min(itemLinks.length, limit); i++) {
          const link = itemLinks[i];

          try {
            // Get the item container
            const itemContainer =
              link.closest('div[class*="UserItem"]') ||
              link.closest('div[class*="feedItem"]') ||
              link.closest('div[class*="Item"]') ||
              link.parentElement;

            if (!itemContainer) continue;

            // Extract image
            let image = "";
            const imgElement = itemContainer.querySelector("img");
            if (imgElement) {
              image = imgElement.src || imgElement.getAttribute("data-src") || "";
              if (image && image.startsWith("//")) {
                image = "https:" + image;
              }
            }

            // Extract text content
            const fullText = itemContainer.textContent || "";

            // Extract price
            let price = 0;
            const priceMatches = fullText.match(/\$[\d,]+/g);
            if (priceMatches && priceMatches.length > 0) {
              price = parseInt(priceMatches[0].replace(/[^\d]/g, ""));
            }

            // Extract name from link
            let name = "";
            name =
              link.getAttribute("title") ||
              link.textContent.trim() ||
              link.getAttribute("aria-label") ||
              "";

            if (!name || name.length < 5) {
              const urlParts = link.href.split("/");
              const lastPart = urlParts[urlParts.length - 1];
              if (lastPart) {
                name = lastPart.split("-").slice(1).join(" ");
                name = name.replace(/[_-]/g, " ").trim();
              }
            }

            // Extract brand
            let brand = "Unknown";
            const commonBrands = [
              "Supreme", "Nike", "Adidas", "Off-White", "Stone Island",
              "Carhartt", "Patagonia", "Vetements", "Balenciaga", "Gucci",
              "Louis Vuitton", "Prada", "Dior", "Saint Laurent", "Yeezy",
            ];

            for (const brandName of commonBrands) {
              if (fullText.toLowerCase().includes(brandName.toLowerCase())) {
                brand = brandName;
                break;
              }
            }

            // Extract size
            let size = "N/A";
            const sizeMatch = fullText.match(/\b(XS|S|M|L|XL|XXL|XXXL|One Size|OS|\d{1,2})\b/i);
            if (sizeMatch) {
              size = sizeMatch[1];
            }

            // Generate mock data for seller and likes
            const seller = `grailed_user_${Math.floor(Math.random() * 10000)}`;
            const likes = Math.floor(Math.random() * 100);

            // Get item link
            const itemLink = link.href;

            // Only add items with essential data
            if (price > 0 && image && name && name.length > 3) {
              results.push({
                id: i + 1,
                name: name.substring(0, 80).trim(),
                brand,
                price,
                size,
                seller,
                image,
                link: itemLink,
                likes,
                condition: "Used",
                category: "Various",
              });
            }
          } catch (error) {
            console.log("Error extracting item:", error.message);
          }
        }

        return results;
      }, limit);

      return items;
    } catch (error) {
      console.error("Scraping error:", error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = new BackgroundScraper();
