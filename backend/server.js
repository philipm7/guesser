// server.js - Grailed Scraper Backend (Clean Version)
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const dataStorage = require('./dataStorage');
const backgroundScraper = require('./backgroundScraper');
const { scrapeGrailed } = require('./scraper');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to add random delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// API endpoint for scraping
app.post("/api/scrape", async (req, res) => {
  try {
    const { searchQuery, category, priceRange, limit = 20 } = req.body;

    console.log("🚀 NEW SCRAPE REQUEST:", {
      searchQuery,
      category,
      priceRange,
      limit,
    });
    console.log("⏰ Request timestamp:", new Date().toISOString());

    const result = await scrapeGrailed(
      searchQuery,
      category,
      priceRange?.min,
      priceRange?.max,
      limit
    );

    console.log("✅ SCRAPE COMPLETED:", {
      itemsFound: result.items.length,
      scrapedUrl: result.searchUrl,
      duration: "completed"
    });

    res.json({
      success: true,
      items: result.items,
      count: result.items.length,
      scrapedUrl: result.searchUrl,
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
    browser = await puppeteer.launch({ 
      headless: true, 
      protocolTimeout: 60000, // Increase timeout for Docker
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ]
    });
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
    const progress = dataStorage.getScrapingProgress();
    res.json({
      success: true,
      ...status,
      progress
    });
  } catch (error) {
    console.error("Error getting status:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get scraping progress (dedicated endpoint for polling)
app.get("/api/scraping-progress", (req, res) => {
  try {
    const progress = dataStorage.getScrapingProgress();
    const status = dataStorage.getStatus();
    res.json({
      success: true,
      progress,
      isScraping: status.isScraping
    });
  } catch (error) {
    console.error("Error getting scraping progress:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Trigger manual refresh
app.post("/api/refresh", async (req, res) => {
  try {
    if (dataStorage.isScraping()) {
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
