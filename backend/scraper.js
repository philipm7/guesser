const puppeteer = require("puppeteer");

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
    browser = await puppeteer.launch({
      headless: true, // Always headless in Docker
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=VizDisplayCompositor",
        "--disable-dev-shm-usage", // Important for Docker
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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
          "accessories.belts,accessories.glasses,accessories.jewelry_watches",
        Pants: "bottoms.casual_pants,bottoms.denim,bottoms.shorts",
        Shoes:
          "footwear.hitop_sneakers,footwear.lowtop_sneakers,footwear.boots",
      };
      if (categoryMap[category]) {
        params.append("category", categoryMap[category]);
      }
    }

    console.log("min price:", minPrice);
    console.log("max price:", maxPrice);
    if (minPrice) params.append("price", minPrice + ":" + maxPrice);

    if (params.toString()) {
      searchUrl += "?" + params.toString();
    }

    console.log("🔗 SCRAPING URL:", searchUrl);
    console.log("📊 Search Parameters:", {
      query: searchQuery,
      category: category,
      minPrice: minPrice,
      maxPrice: maxPrice,
      limit: limit
    });

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
    return { items, searchUrl };
  } catch (error) {
    console.error("Scraping error:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeGrailed };
