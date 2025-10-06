import React, { useState, useEffect } from "react";
import { Gamepad2, Settings, Loader2 } from "lucide-react";
import PriceGuessingGame from "./PriceGuessingGame";
import ScraperApp from "./ScraperApp";

const App = () => {
  const [userBalance, setUserBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(100);
  const [currentPage, setCurrentPage] = useState("home"); // 'home', 'game', 'admin'
  const [gameData, setGameData] = useState(null);
  const [scrapingStatus, setScrapingStatus] = useState({
    itemCount: 0,
    lastScraped: null,
    isDataFresh: false,
    isScraping: false,
    progress: {
      current: 0,
      total: 0,
      currentQuery: '',
      startTime: null
    }
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingGame, setLoadingGame] = useState(false);

  // Load scraping status on startup
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/status");
        const data = await response.json();
        if (data.success) {
          setScrapingStatus(data);
        }
      } catch (error) {
        console.error("Error loading status:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadStatus();

    // Update status every 30 seconds, or every 2 seconds if scraping
    const getIntervalTime = () => {
      return scrapingStatus.isScraping ? 2000 : 30000;
    };

    let interval = setInterval(loadStatus, getIntervalTime());
    
    // Clear and restart interval when scraping status changes
    const restartInterval = () => {
      clearInterval(interval);
      interval = setInterval(loadStatus, getIntervalTime());
    };

    // Restart interval when scraping status changes
    if (scrapingStatus.isScraping) {
      restartInterval();
    }

    return () => clearInterval(interval);
  }, [scrapingStatus.isScraping]);

  const handlePlayGame = async () => {
    if (betAmount <= 0 || betAmount > userBalance) return;
    
    setLoadingGame(true);
    try {
      const response = await fetch("http://localhost:3001/api/random-item");
      const data = await response.json();
      
      if (data.success && data.item) {
        setGameData({ 
          item: data.item, 
          betAmount, 
          onGameEnd: handleGameEnd 
        });
        setCurrentPage("game");
      } else {
        alert(data.message || "Could not load a game item. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching random item:", error);
      alert("Network error. Could not load a game item.");
    } finally {
      setLoadingGame(false);
    }
  };

  const handleGameEnd = ({ score, balanceChange, item, guess }) => {
    setUserBalance((prev) => prev + balanceChange);
    setCurrentPage("home");
    // Optionally display a toast or message about the last game result
  };

  const quickBets = [10, 50, 100, 250, 500];

  // Loading screen
  if (initialLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f0f23",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", color: "white" }}>
          <Loader2 size={48} className="animate-spin" style={{ marginBottom: "16px" }} />
          <p style={{ fontSize: "18px", color: "#9ca3af" }}>
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  // Admin/Scraper page
  if (currentPage === "admin") {
    return <ScraperApp onBack={() => setCurrentPage("home")} />;
  }

  // Game page
  if (currentPage === "game") {
    return <PriceGuessingGame gameData={gameData} />;
  }

  // Home/Betting page
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f23",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "white",
      }}
    >
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
            maxWidth: "800px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            Price Guesser Game
          </h1>
          <button
            onClick={() => setCurrentPage("admin")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <Settings size={16} />
            Admin
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* Balance Card */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "500",
              color: "#9ca3af",
              margin: "0 0 8px 0",
            }}
          >
            Your Balance
          </h2>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#3b82f6",
              marginBottom: "16px",
            }}
          >
            ${userBalance.toLocaleString()}
          </div>
          
          {/* Scraping Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              fontSize: "14px",
              color: "#9ca3af",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: scrapingStatus.isScraping 
                  ? "#f59e0b" 
                  : scrapingStatus.isDataFresh 
                    ? "#10b981" 
                    : "#ef4444",
              }}
            />
            {scrapingStatus.isScraping ? (
              <div style={{ textAlign: "center" }}>
                <div>Scraping items...</div>
                {scrapingStatus.progress && scrapingStatus.progress.total > 0 && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    {scrapingStatus.progress.currentQuery} ({scrapingStatus.progress.current}/{scrapingStatus.progress.total})
                  </div>
                )}
              </div>
            ) : scrapingStatus.isDataFresh ? (
              `${scrapingStatus.itemCount} items ready`
            ) : (
              "Loading items..."
            )}
          </div>
        </div>

        {/* Betting Card */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 24px 0",
              textAlign: "center",
            }}
          >
            Place Your Bet
          </h2>

          {/* Bet Amount Input */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "12px",
                color: "#e5e7eb",
              }}
            >
              Bet Amount
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "20px",
                  color: "#9ca3af",
                }}
              >
                $
              </span>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                min="1"
                max={userBalance}
                style={{
                  width: "100%",
                  paddingLeft: "40px",
                  paddingRight: "16px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  fontSize: "20px",
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }}
              />
            </div>
          </div>

          {/* Quick Bet Buttons */}
          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                color: "#9ca3af",
                marginBottom: "12px",
              }}
            >
              Quick Bets
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {quickBets.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={amount > userBalance}
                  style={{
                    padding: "8px 16px",
                    backgroundColor:
                      betAmount === amount
                        ? "#3b82f6"
                        : amount > userBalance
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    color: amount > userBalance ? "#6b7280" : "white",
                    cursor: amount > userBalance ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (amount <= userBalance && betAmount !== amount) {
                      e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (amount <= userBalance && betAmount !== amount) {
                      e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    }
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={handlePlayGame}
            disabled={
              betAmount <= 0 ||
              betAmount > userBalance ||
              loadingGame ||
              scrapingStatus.itemCount === 0
            }
            style={{
              width: "100%",
              padding: "16px 24px",
              backgroundColor:
                betAmount <= 0 ||
                betAmount > userBalance ||
                loadingGame ||
                scrapingStatus.itemCount === 0
                  ? "rgba(255, 255, 255, 0.1)"
                  : "#10b981",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "18px",
              fontWeight: "600",
              cursor:
                betAmount <= 0 ||
                betAmount > userBalance ||
                loadingGame ||
                scrapingStatus.itemCount === 0
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (
                betAmount > 0 &&
                betAmount <= userBalance &&
                !loadingGame &&
                scrapingStatus.itemCount > 0
              ) {
                e.target.style.backgroundColor = "#059669";
              }
            }}
            onMouseLeave={(e) => {
              if (
                betAmount > 0 &&
                betAmount <= userBalance &&
                !loadingGame &&
                scrapingStatus.itemCount > 0
              ) {
                e.target.style.backgroundColor = "#10b981";
              }
            }}
          >
            {loadingGame ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Loading Item...
              </>
            ) : scrapingStatus.itemCount === 0 ? (
              "No Items Available"
            ) : (
              <>
                <Gamepad2 size={20} />
                Play Game (${betAmount})
              </>
            )}
          </button>

          {/* Game Rules */}
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#9ca3af",
              lineHeight: "1.5",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", color: "#e5e7eb" }}>
              How to Play
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              <li>Guess the price of a random fashion item</li>
              <li>Get scored based on how close you are</li>
              <li>Win money for good guesses, lose for bad ones</li>
              <li>Perfect guesses (within 5%) win 10x your bet!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;