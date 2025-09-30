import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Settings,
  Trophy,
  Target,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import PriceGuessingGame from "./PriceGuessingGame";
import ScraperApp from "./ScraperApp";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home"); // 'home', 'game', 'scraper'
  const [gameData, setGameData] = useState(null);
  const [betAmount, setBetAmount] = useState(100);
  const [userBalance, setUserBalance] = useState(1000);
  const [scrapingStatus, setScrapingStatus] = useState({
    itemCount: 0,
    lastScraped: null,
    isDataFresh: false,
    isScraping: false
  });
  const [loading, setLoading] = useState(false);

  // Load scraping status on startup
  useEffect(() => {
    loadStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/status");
      const data = await response.json();
      if (data.success) {
        setScrapingStatus(data);
      }
    } catch (error) {
      console.error("Error loading status:", error);
    }
  };

  const startGame = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/random-item");
      const data = await response.json();
      
      if (data.success && data.item) {
        setGameData({
          item: data.item,
          betAmount,
          userBalance,
          onGameEnd: (result) => {
            setUserBalance(prev => prev + result.balanceChange);
            setCurrentPage("home");
          }
        });
        setCurrentPage("game");
      } else {
        alert("No items available yet. Please wait for items to be loaded or try refreshing.");
      }
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Error starting game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshItems = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        setTimeout(loadStatus, 2000);
      }
    } catch (error) {
      console.error("Error refreshing items:", error);
    }
  };

  // Show game component
  if (currentPage === "game") {
    return <PriceGuessingGame gameData={gameData} />;
  }

  // Show scraper admin interface
  if (currentPage === "scraper") {
    return <ScraperApp onBack={() => setCurrentPage("home")} />;
  }

  // Main home page
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f23",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "white",
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>

      {/* Header */}
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "16px 32px",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#3b82f6",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Target size={24} color="white" />
            </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: 0,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
            }}
          >
              Price Guesser
          </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Balance Display */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              <DollarSign size={16} color="#22c55e" />
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#22c55e" }}>
                ${userBalance.toLocaleString()}
              </span>
            </div>

            {/* Items Status */}
            <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                color: scrapingStatus.isScraping ? "#f59e0b" : "#10b981",
              }}
            >
              {scrapingStatus.isScraping ? (
                <>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      border: "2px solid #f59e0b",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  <span>Loading items...</span>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#10b981",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <span>{scrapingStatus.itemCount} items ready</span>
                </>
              )}
            </div>

            {/* Admin Button */}
            <button
              onClick={() => setCurrentPage("scraper")}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#9ca3af",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                e.target.style.color = "#9ca3af";
              }}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "64px 32px",
          textAlign: "center",
        }}
      >
        {/* Hero Section */}
        <div style={{ marginBottom: "64px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              animation: "glow 2s ease-in-out infinite",
            }}
          >
            <Trophy size={48} color="#3b82f6" />
          </div>

          <h2
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              margin: "0 0 16px 0",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Test Your Fashion Knowledge
          </h2>
          <p
            style={{
              fontSize: "20px",
              color: "#9ca3af",
              margin: "0 0 32px 0",
              lineHeight: "1.6",
            }}
          >
            Guess the price of luxury fashion items from Grailed and win real money!
          </p>
        </div>

        {/* Betting Interface */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            marginBottom: "32px",
          }}
        >
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: "0 0 24px 0",
              color: "white",
            }}
          >
            Place Your Bet
          </h3>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "16px",
                color: "#9ca3af",
                marginBottom: "12px",
                textAlign: "left",
              }}
            >
              Bet Amount
            </label>
            <div style={{ position: "relative" }}>
              <DollarSign
                size={20}
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                }}
              />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={userBalance}
                style={{
                  width: "100%",
                  paddingLeft: "48px",
                  paddingRight: "16px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  fontSize: "18px",
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              <span>Min: $1</span>
              <span>Max: ${userBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Bet Buttons */}
          <div
                style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {[25, 50, 100, 250].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(Math.min(amount, userBalance))}
                disabled={amount > userBalance}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: amount === betAmount ? "#3b82f6" : "rgba(255, 255, 255, 0.05)",
                  color: amount > userBalance ? "#6b7280" : "white",
                  cursor: amount > userBalance ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  opacity: amount > userBalance ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (amount <= userBalance && amount !== betAmount) {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (amount <= userBalance && amount !== betAmount) {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                ${amount}
              </button>
            ))}
            </div>

          {/* Play Button */}
            <button
            onClick={startGame}
            disabled={loading || scrapingStatus.itemCount === 0 || betAmount > userBalance}
              style={{
                width: "100%",
              padding: "16px 32px",
              backgroundColor: 
                loading || scrapingStatus.itemCount === 0 || betAmount > userBalance
                  ? "#374151"
                  : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: 
                loading || scrapingStatus.itemCount === 0 || betAmount > userBalance
                  ? "not-allowed"
                  : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              gap: "12px",
              transition: "all 0.2s",
              opacity: 
                loading || scrapingStatus.itemCount === 0 || betAmount > userBalance
                  ? 0.5
                  : 1,
              }}
              onMouseEnter={(e) => {
              if (!loading && scrapingStatus.itemCount > 0 && betAmount <= userBalance) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 10px 25px rgba(59, 130, 246, 0.3)";
              }
              }}
              onMouseLeave={(e) => {
              if (!loading && scrapingStatus.itemCount > 0 && betAmount <= userBalance) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
              }}
            >
              {loading ? (
              <>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                Loading Item...
              </>
            ) : scrapingStatus.itemCount === 0 ? (
              <>
                <AlertCircle size={20} />
                No Items Available
              </>
              ) : (
                <>
                <Gamepad2 size={20} />
                Play Game - Bet ${betAmount}
                </>
              )}
            </button>
        </div>

        {/* Status and Info */}
          <div
            style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            fontSize: "14px",
                color: "#6b7280",
              }}
            >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Target size={16} />
            <span>Guess within 5% for max payout</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Trophy size={16} />
            <span>Win up to 10x your bet</span>
          </div>
        </div>

        {/* Refresh Button */}
        {scrapingStatus.itemCount === 0 && (
          <button
            onClick={refreshItems}
            disabled={scrapingStatus.isScraping}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: "#3b82f6",
              border: "1px solid #3b82f6",
              borderRadius: "8px",
              cursor: scrapingStatus.isScraping ? "not-allowed" : "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: scrapingStatus.isScraping ? 0.5 : 1,
            }}
          >
            <RefreshCw size={16} />
            Refresh Items
            </button>
        )}
      </div>
    </div>
  );
};

export default App;
