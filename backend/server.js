// server.js - Grailed Scraper Backend (Clean Version)
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const dataStorage = require('./dataStorage');
const backgroundScraper = require('./backgroundScraper');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to add random delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Main scraping function
async function scrapeGrailed(
  searchQuery = "",
  category = "",
  minPrice = "",
  maxPrice = "",
  limit = 20
) {
  let browser;

  try {
    console.log(
      `Starting scrape: query="${searchQuery}", category="${category}", price=${minPrice}-${maxPrice}`
    );

    // Launch browser with stealth settings
    const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV;
    browser = await puppeteer.launch({
      headless: isDocker ? "new" : false, // Use new headless mode in Docker
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=VizDisplayCompositor",
        "--disable-dev-shm-usage", // Important for Docker
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process", // Important for Docker
        "--disable-web-security",
        "--disable-features=TranslateUI",
        "--disable-ipc-flooding-protection",
      ],
      executablePath: isDocker ? "/usr/bin/chromium-browser" : undefined,
      timeout: 60000, // 60 second timeout
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
        Accessories:
          "accessories.belts%2Caccessories.glasses%2Caccessories.jewelry_watches",
        Pants: "bottoms.casual_pants%2Cbottoms.denim%2Cbottoms.shorts",
        Shoes:
          "footwear.hitop_sneakers%2Cfootwear.lowtop_sneakers%2Cfootwear.boots",
      };
      if (categoryMap[category]) {
        params.append("category", categoryMap[category]);
      }
    }

    console.log("min price:", minPrice);
    console.log("max price:", maxPrice);
    if (minPrice) params.append("price", minPrice + ":" + maxPrice);
    //if (maxPrice) params.append("price_to", maxPrice);

    if (params.toString()) {
      searchUrl += "?" + params.toString();
    }

    console.log("Scraping URL:", searchUrl);

    // Navigate to search page
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for page to load and scroll to trigger lazy loading
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 3);
    });
    await delay(2000);

    // Extract item data
    const items = await page.evaluate((limit) => {
      console.log("Starting extraction...");

      // Look for item links
      const itemLinks = document.querySelectorAll('a[href*="/listings/"]');
      console.log(`Found ${itemLinks.length} item links`);

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
            "Supreme",
            "Nike",
            "Adidas",
            "Off-White",
            "Stone Island",
            "Carhartt",
            "Patagonia",
            "Vetements",
            "Balenciaga",
            "Gucci",
            "Louis Vuitton",
            "Prada",
            "Dior",
            "Saint Laurent",
            "Yeezy",
          ];

          for (const brandName of commonBrands) {
            if (fullText.toLowerCase().includes(brandName.toLowerCase())) {
              brand = brandName;
              break;
            }
          }

          // Extract size
          let size = "N/A";
          const sizeMatch = fullText.match(
            /\b(XS|S|M|L|XL|XXL|XXXL|One Size|OS|\d{1,2})\b/i
          );
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

      console.log(
        `Successfully extracted ${results.length} items from ${itemLinks.length} links`
      );
      return results;
    }, limit);

    console.log(`Scraped ${items.length} items`);
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

// API endpoint for scraping
app.post("/api/scrape", async (req, res) => {
  try {
    const { searchQuery, category, priceRange, limit = 20 } = req.body;

    console.log("Scrape request:", {
      searchQuery,
      category,
      priceRange,
      limit,
    });

    const items = await scrapeGrailed(
      searchQuery,
      category,
      priceRange?.min,
      priceRange?.max,
      limit
    );

    res.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      items: [],
    });
  }
});

// Debug endpoint
app.post("/api/debug", async (req, res) => {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );
    await page.goto("https://www.grailed.com/shop", {
      waitUntil: "networkidle2",
    });

    const pageInfo = await page.evaluate(() => {
      const itemLinks = document.querySelectorAll('a[href*="/listings/"]');
      return {
        itemLinksFound: itemLinks.length,
        title: document.title,
        url: window.location.href,
      };
    });

    res.json({ success: true, pageInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

// Get stored items (for game)
app.get("/api/items", (req, res) => {
  try {
    const items = dataStorage.getItems();
    const status = dataStorage.getStatus();
    
    res.json({
      success: true,
      items,
      count: items.length,
      status
    });
  } catch (error) {
    console.error("Error getting items:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      items: []
    });
  }
});

// Get a random item for the game
app.get("/api/random-item", (req, res) => {
  try {
    const item = dataStorage.getRandomItem();
    const status = dataStorage.getStatus();
    
    if (!item) {
      res.json({
        success: false,
        message: "No items available",
        status
      });
      return;
    }
    
    res.json({
      success: true,
      item,
      status
    });
  } catch (error) {
    console.error("Error getting random item:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get scraping status
app.get("/api/status", (req, res) => {
  try {
    const status = dataStorage.getStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error("Error getting status:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Trigger manual refresh
app.post("/api/refresh", async (req, res) => {
  try {
    if (dataStorage.isScraping) {
      res.json({
        success: false,
        message: "Scraping already in progress"
      });
      return;
    }

    // Start background scraping
    backgroundScraper.scrapeNow();
    
    res.json({
      success: true,
      message: "Refresh started"
    });
  } catch (error) {
    console.error("Error starting refresh:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server - bind to all interfaces for Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Grailed scraper server running on http://0.0.0.0:${PORT}`);
  console.log("Ready to scrape Grailed data!");
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Docker mode: ${process.env.DOCKER_ENV ? 'enabled' : 'disabled'}`);
  
  // Start background scraping
  backgroundScraper.start();
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  backgroundScraper.stop();
  process.exit(0);
});
