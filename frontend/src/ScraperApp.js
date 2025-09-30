import React, { useState } from "react";
import {
  Search,
  Grid,
  Tag,
  MapPin,
  Gamepad2,
  ArrowLeft,
} from "lucide-react";
import PriceGuessingGame from "./PriceGuessingGame";

const GrailedScraperApp = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState("scraper"); // 'scraper' or 'game'

  const categories = [
    "all",
    "T-Shirts",
    "Hoodies",
    "Jackets",
    "Accessories",
    "Pants",
    "Shoes",
  ];

  // Show game component
  if (currentPage === "game") {
    return (
      <PriceGuessingGame
        items={items}
        onBackToScraper={() => setCurrentPage("scraper")}
      />
    );
  }

  // Real scraping function
  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchQuery: searchQuery.trim(),
          category: selectedCategory,
          priceRange: {
            min: priceRange.min || "",
            max: priceRange.max || "",
          },
          limit: 20,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      } else {
        console.error("Scraping failed:", data.error);
        setItems([]);
      }
    } catch (error) {
      console.error("Network error:", error);
      setItems([]);
    }

    setLoading(false);
  };

  const ItemCard = ({ item }) => (
    <div
      style={{
        backgroundColor: "white",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image Container */}
      <div
        style={{
          position: "relative",
          aspectRatio: "1",
          backgroundColor: "#f9fafb",
          overflow: "hidden",
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
          }}
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop";
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        />

        {/* Time indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "white",
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {Math.floor(Math.random() * 30) + 1} days ago
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {/* Brand and Size */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#111",
            }}
          >
            {item.brand}
          </span>
          <span
            style={{
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            {item.size}
          </span>
        </div>

        {/* Item Name */}
        <h3
          style={{
            fontSize: "14px",
            color: "#374151",
            marginBottom: "12px",
            lineHeight: "1.25",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: "0 0 12px 0",
            minHeight: "35px",
          }}
        >
          {item.name}
        </h3>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "black",
              }}
            >
              ${item.price}
            </span>
            {Math.random() > 0.7 && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  textDecoration: "line-through",
                }}
              >
                ${item.price + Math.floor(Math.random() * 100) + 50}
              </span>
            )}
          </div>
          {Math.random() > 0.7 && (
            <span
              style={{
                fontSize: "12px",
                color: "#dc2626",
                fontWeight: "500",
              }}
            >
              {Math.floor(Math.random() * 30) + 10}% off
            </span>
          )}
        </div>

        {/* Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "12px",
            color: "#6b7280",
            gap: "4px",
          }}
        >
          <MapPin size={12} />
          Located in {Math.random() > 0.5 ? "United States" : "Europe"}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .search-grid {
              grid-template-columns: 1fr !important;
            }
            .items-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          
          @media (min-width: 769px) and (max-width: 1024px) {
            .items-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
          
          @media (min-width: 1025px) and (max-width: 1280px) {
            .items-grid {
              grid-template-columns: repeat(4, 1fr) !important;
            }
          }
          
          @media (min-width: 1281px) {
            .items-grid {
              grid-template-columns: repeat(5, 1fr) !important;
            }
          }
        `}
      </style>

      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#6b7280",
                padding: "8px",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f3f4f6";
                e.target.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#6b7280";
              }}
            >
              <ArrowLeft size={20} />
              Back to Game
            </button>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "black",
                margin: 0,
              }}
            >
              Admin - Grailed Scraper
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {items.length > 0 && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {items.length.toLocaleString()} items
              </span>
            )}
            {items.length >= 5 && (
              <button
                onClick={() => setCurrentPage("game")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#10b981";
                }}
              >
                <Gamepad2 size={16} />
                Play Price Game
              </button>
            )}
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: viewMode === "grid" ? "black" : "transparent",
                color: viewMode === "grid" ? "white" : "#6b7280",
                transition: "all 0.2s",
              }}
            >
              <Grid size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "24px 32px",
        }}
      >
        {/* Search and Filters */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            className="search-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "16px",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "12px",
                  color: "#9ca3af",
                  zIndex: 1,
                }}
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                style={{
                  width: "100%",
                  paddingLeft: "40px",
                  paddingRight: "16px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "all 0.2s",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "black";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "white",
                transition: "all 0.2s",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "black";
                e.target.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                }
                placeholder="Min"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "black";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                }
                placeholder="Max"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "black";
                  e.target.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading ? "#6b7280" : "black",
                color: "white",
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s",
                fontSize: "16px",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "#374151";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = "black";
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #f3f4f6",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
              ) : (
                <>
                  <Search size={16} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              paddingTop: "48px",
              paddingBottom: "48px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "2px solid #f3f4f6",
                borderTop: "2px solid black",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            ></div>
            <p
              style={{
                color: "#6b7280",
                fontSize: "16px",
                margin: 0,
              }}
            >
              Scraping Grailed items...
            </p>
          </div>
        )}

        {/* Items Grid */}
        {!loading && items.length > 0 && (
          <div
            className="items-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "16px",
            }}
          >
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div
            style={{
              textAlign: "center",
              paddingTop: "64px",
              paddingBottom: "64px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#f3f4f6",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Tag size={32} color="#9ca3af" />
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "500",
                color: "black",
                marginBottom: "8px",
                margin: "0 0 8px 0",
              }}
            >
              No items found
            </h3>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "24px",
                fontSize: "16px",
                margin: "0 0 24px 0",
              }}
            >
              Try searching for brands like "Supreme", "Nike", or "Prada"
            </p>
            <button
              onClick={() => {
                setSearchQuery("Prada");
                setTimeout(handleSearch, 100);
              }}
              style={{
                backgroundColor: "black",
                color: "white",
                padding: "8px 24px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
                fontSize: "16px",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#374151";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "black";
              }}
            >
              Try searching "Prada"
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrailedScraperApp;
