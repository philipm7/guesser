import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trophy,
  Target,
  RotateCcw,
} from "lucide-react";

const PriceGuessingGame = ({ items, onBackToScraper, gameData }) => {
  // New betting mode state
  const [currentItem, setCurrentItem] = useState(null);
  const [userGuess, setUserGuess] = useState("");
  const [gameState, setGameState] = useState("playing"); // 'playing', 'revealed', 'finished'
  const [score, setScore] = useState(0);
  const [balanceChange, setBalanceChange] = useState(0);
  const [isBettingMode, setIsBettingMode] = useState(false);
  
  // Legacy mode state (for backward compatibility)
  const [gameItems, setGameItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  // Initialize based on props
  useEffect(() => {
    if (gameData) {
      // New betting mode
      setIsBettingMode(true);
      setCurrentItem(gameData.item);
    } else if (items && Array.isArray(items) && items.length > 0) {
      // Legacy mode with multiple items
      setIsBettingMode(false);
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(10, items.length));
      setGameItems(selected);
      setCurrentItem(selected[0]); // Set initial item for legacy mode
    }
  }, [items, gameData]);

  // Calculate score and payout based on how close the guess is
  const calculateScore = (guess, actualPrice, betAmount = 0) => {
    const difference = Math.abs(guess - actualPrice);
    const percentageOff = (difference / actualPrice) * 100;

    let score, multiplier;
    if (percentageOff <= 5) {
      score = 100;
      multiplier = 10; // 10x payout for perfect guess
    } else if (percentageOff <= 10) {
      score = 90;
      multiplier = 5; // 5x payout
    } else if (percentageOff <= 15) {
      score = 80;
      multiplier = 3; // 3x payout
    } else if (percentageOff <= 25) {
      score = 70;
      multiplier = 2; // 2x payout
    } else if (percentageOff <= 35) {
      score = 60;
      multiplier = 1.5; // 1.5x payout
    } else if (percentageOff <= 50) {
      score = 40;
      multiplier = 1; // Break even
    } else if (percentageOff <= 75) {
      score = 20;
      multiplier = 0.5; // Lose half
    } else {
      score = 10;
      multiplier = 0; // Lose everything
    }

    const payout = Math.round(betAmount * multiplier);
    const balanceChange = payout - betAmount;

    return { score, multiplier, payout, balanceChange };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981"; // green
    if (score >= 80) return "#3b82f6"; // blue
    if (score >= 70) return "#f59e0b"; // yellow
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getScoreText = (score) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great!";
    if (score >= 70) return "Good!";
    if (score >= 40) return "Fair";
    return "Keep trying!";
  };

  const handleGuessSubmit = () => {
    if (!userGuess || isNaN(userGuess) || userGuess <= 0) return;
    if (!currentItem) return;

    const guess = parseInt(userGuess);
    const betAmount = gameData?.betAmount || 0;
    const result = calculateScore(guess, currentItem.price, betAmount);

    setScore(result.score);
    setBalanceChange(result.balanceChange);

    // For legacy mode, also update the scores array
    if (!isBettingMode) {
      const newScore = {
        itemName: currentItem.name,
        guess: guess,
        actual: currentItem.price,
        score: result.score,
        difference: Math.abs(guess - currentItem.price),
      };
      setScores([...scores, newScore]);
      setTotalScore(totalScore + result.score);
    }

    setGameState("revealed");
  };

  const handleNextItem = () => {
    if (isBettingMode) {
      // Single item betting mode - return to home
      if (gameData?.onGameEnd) {
        gameData.onGameEnd({
          score,
          balanceChange,
          item: currentItem,
          guess: parseInt(userGuess)
        });
      }
    } else {
      // Legacy mode
      setUserGuess("");
      if (currentItemIndex < gameItems.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
        setCurrentItem(gameItems[currentItemIndex + 1]); // Update currentItem for legacy mode
        setGameState("playing");
      } else {
        setGameState("finished");
      }
    }
  };

  const resetGame = () => {
    setCurrentItemIndex(0);
    setUserGuess("");
    setGameState("playing");
    setScores([]);
    setTotalScore(0);
    // Shuffle items again
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(10, items.length));
    setGameItems(selected);
  };

  if (!currentItem && !isBettingMode && (!items || !Array.isArray(items) || items.length === 0)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#6b7280" }}>
            No items available for the game. Please scrape some items first!
          </p>
          <button
            onClick={onBackToScraper}
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "16px",
            }}
          >
            Back to Scraper
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
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
          <p style={{ fontSize: "18px", color: "#9ca3af" }}>
            Loading item...
          </p>
        </div>
      </div>
    );
  }

  // Remove this line since currentItem is now from state
  // const currentItem = gameItems[currentItemIndex];
  // const currentScore = scores.length > 0 ? scores[scores.length - 1] : null; // Unused in betting mode

  // Game finished screen
  if (gameState === "finished") {
    const averageScore = Math.round(totalScore / gameItems.length);
    const perfectGuesses = scores.filter((s) => s.score === 100).length;
    const goodGuesses = scores.filter((s) => s.score >= 80).length;

    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 32px",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <button
              onClick={onBackToScraper}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#6b7280",
              }}
            >
              <ArrowLeft size={20} />
              Back to Scraper
            </button>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                margin: 0,
                color: "black",
              }}
            >
              Game Complete!
            </h1>
          </div>
        </div>

        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "32px",
          }}
        >
          {/* Score Summary */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              marginBottom: "32px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Trophy
              size={48}
              color="#f59e0b"
              style={{ marginBottom: "16px" }}
            />
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                margin: "0 0 8px 0",
                color: "black",
              }}
            >
              {averageScore}/100
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "#6b7280",
                margin: "0 0 24px 0",
              }}
            >
              Average Score
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                marginTop: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  {perfectGuesses}
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  Perfect Guesses
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#3b82f6",
                  }}
                >
                  {goodGuesses}
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  Great Guesses
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#f59e0b",
                  }}
                >
                  {gameItems.length}
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  Total Items
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                marginTop: "32px",
              }}
            >
              <button
                onClick={resetGame}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "black",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                <RotateCcw size={16} />
                Play Again
              </button>
              <button
                onClick={onBackToScraper}
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Back to Scraper
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "20px",
                color: "black",
              }}
            >
              Detailed Results
            </h3>

            {scores.map((score, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom:
                    index < scores.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "500",
                      color: "black",
                      marginBottom: "4px",
                    }}
                  >
                    {score.itemName.length > 40
                      ? score.itemName.substring(0, 40) + "..."
                      : score.itemName}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    Your guess: ${score.guess} | Actual: ${score.actual} | Off
                    by: ${score.difference}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: getScoreColor(score.score),
                    minWidth: "60px",
                    textAlign: "right",
                  }}
                >
                  {score.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: isBettingMode ? "#0f0f23" : "#f9fafb",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: isBettingMode ? "white" : "black",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: isBettingMode ? "rgba(0, 0, 0, 0.3)" : "white",
          borderBottom: isBettingMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e5e7eb",
          padding: "16px 32px",
          backdropFilter: isBettingMode ? "blur(10px)" : "none",
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
          <button
            onClick={isBettingMode ? () => gameData?.onGameEnd?.({ score: 0, balanceChange: -gameData.betAmount }) : onBackToScraper}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: isBettingMode ? "#9ca3af" : "#6b7280",
            }}
          >
            <ArrowLeft size={20} />
            {isBettingMode ? "Quit Game" : "Back to Scraper"}
          </button>

          {isBettingMode && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#3b82f6",
                  }}
                >
                  ${gameData?.betAmount || 0}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#9ca3af",
                  }}
                >
                  Your Bet
                </div>
              </div>
            </div>
          )}

          {!isBettingMode && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  {currentItemIndex + 1}/{gameItems.length}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Progress
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#10b981",
                  }}
                >
                  {scores.length > 0 ? Math.round(totalScore / scores.length) : 0}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Avg Score
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* Current Item */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            marginBottom: "24px",
          }}
        >
          {/* Item Image */}
          <div
            style={{
              aspectRatio: "1",
              backgroundColor: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxHeight: "400px",
            }}
          >
            <img
              src={currentItem.image}
              alt={currentItem.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop";
              }}
            />
          </div>

          {/* Item Details */}
          <div style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "black",
                }}
              >
                {currentItem.brand}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  backgroundColor: "#f3f4f6",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Size {currentItem.size}
              </span>
            </div>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "black",
                margin: "0 0 16px 0",
                lineHeight: "1.4",
              }}
            >
              {currentItem.name}
            </h2>

            {gameState === "revealed" && (
              <div
                style={{
                  backgroundColor: isBettingMode ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
                  border: "2px solid " + getScoreColor(score),
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
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
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: getScoreColor(score),
                    }}
                  >
                    {getScoreText(score)}
                  </span>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: getScoreColor(score),
                    }}
                  >
                    {score}/100
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: isBettingMode ? "#e5e7eb" : "#374151",
                  }}
                >
                  Your guess: <strong>${parseInt(userGuess)}</strong> | Actual
                  price: <strong>${currentItem.price}</strong> | Difference:{" "}
                  <strong>${Math.abs(parseInt(userGuess) - currentItem.price)}</strong>
                </div>
                {isBettingMode && (
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: balanceChange >= 0 ? "#10b981" : "#ef4444",
                      marginTop: "8px",
                    }}
                  >
                    {balanceChange >= 0 ? "+" : ""}${balanceChange} 
                    <span style={{ fontSize: "14px", color: "#9ca3af" }}>
                      ({balanceChange >= 0 ? "Profit" : "Loss"})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Guess Input */}
            {gameState === "playing" && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "black",
                    marginBottom: "8px",
                  }}
                >
                  What do you think this item costs?
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "18px",
                        color: "#6b7280",
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      value={userGuess}
                      onChange={(e) => setUserGuess(e.target.value)}
                      placeholder="Enter your guess"
                      style={{
                        width: "100%",
                        paddingLeft: "32px",
                        paddingRight: "16px",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "18px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "black";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleGuessSubmit();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleGuessSubmit}
                    disabled={!userGuess || isNaN(userGuess) || userGuess <= 0}
                    style={{
                      backgroundColor:
                        !userGuess || isNaN(userGuess) || userGuess <= 0
                          ? "#9ca3af"
                          : "black",
                      color: "white",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      border: "none",
                      cursor:
                        !userGuess || isNaN(userGuess) || userGuess <= 0
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "16px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Target size={16} />
                    Guess
                  </button>
                </div>
              </div>
            )}

            {/* Next Button */}
            {gameState === "revealed" && (
              <button
                onClick={handleNextItem}
                style={{
                  backgroundColor: isBettingMode ? "#3b82f6" : "black",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  width: "100%",
                }}
              >
                {isBettingMode 
                  ? "Return to Home" 
                  : currentItemIndex < gameItems.length - 1
                    ? "Next Item"
                    : "View Results"
                }
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar - Only show in legacy mode */}
        {!isBettingMode && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#6b7280" }}>Progress</span>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>
                {currentItemIndex + 1} of {gameItems.length}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${
                    ((currentItemIndex + (gameState === "revealed" ? 1 : 0)) /
                      gameItems.length) *
                    100
                  }%`,
                  height: "100%",
                  backgroundColor: "black",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceGuessingGame;
