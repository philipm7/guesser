# Price Guesser Game

An interactive web game where users test their intuition by guessing the prices of real-world items. This project combines entertainment with real-time data sourcing, powered by AI to provide engaging, ever-changing content.

## Project Concept

Players are shown images and descriptions of real products and must guess their actual market prices. The game uses AI to scrape and process product data from various online marketplaces, creating a constantly refreshed database of items for gameplay.

**Team Members:**
- Yannick Bierens
- Phillip Martin  
- Rohan Krishnamurthy

## Key Features

- **AI-Powered Data Extraction:** Automatically collects item details from various websites
- **Interactive Guessing Game:** Players estimate prices based on product images and descriptions  
- **Smart Scoring System:** Points awarded based on accuracy of price guesses
- **Leaderboard:** Competitive gameplay with player rankings
- **Dynamic Content:** Constantly updated with new items for maximum replayability

## Potential Approaches

1. **General Web Connector:** Connect to any e-commerce site for maximum variety
2. **Focused Marketplace:** Start with specific platforms like Grailed (fashion marketplace) for cleaner data

## Getting Started

### Quick Start
```bash
git clone <repo-url>
cd Guesser
docker-compose up --build
```

**Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 📋 Complete Development Guide

**For all setup, development, and troubleshooting instructions, see:**
[.cursor/rules/project-guidelines.mdc](.cursor/rules/project-guidelines.mdc)

This file contains the definitive guide for Docker setup, dependency management, development workflow, and troubleshooting. It's also automatically loaded as context for AI assistance in Cursor.

## Current Status

This repository contains the initial project scaffold with Docker development environment. The game logic, web interface, and AI components will be developed iteratively.

**Next Steps:**
- Web scraping module for product data
- Game interface and user experience
- Scoring algorithm and leaderboard system
- Database integration for persistent data
