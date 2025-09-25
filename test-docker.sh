#!/bin/bash

# Docker Setup Test Script for Grailed Scraper
echo "🐳 Testing Docker setup for Grailed Scraper..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Make sure you're in the project root directory."
    exit 1
fi

if [ ! -f "backend/Dockerfile" ] || [ ! -f "frontend/Dockerfile" ]; then
    echo "❌ Dockerfiles not found. Make sure the Docker setup is complete."
    exit 1
fi

echo "✅ Docker configuration files found"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down --remove-orphans

# Build the containers
echo "🔨 Building Docker containers..."
if ! docker-compose build; then
    echo "❌ Failed to build Docker containers"
    exit 1
fi

echo "✅ Docker containers built successfully"

# Start the containers
echo "🚀 Starting Docker containers..."
if ! docker-compose up -d; then
    echo "❌ Failed to start Docker containers"
    exit 1
fi

echo "✅ Docker containers started"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Test backend health
echo "🔍 Testing backend health..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "📋 Backend logs:"
    docker-compose logs backend
    exit 1
fi

# Test frontend
echo "🔍 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend accessibility check failed"
    echo "📋 Frontend logs:"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 All tests passed! Docker setup is working correctly."
echo ""
echo "📝 Quick reference:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/api/health"
echo ""
echo "🛠️  Management commands:"
echo "   View logs:    docker-compose logs"
echo "   Stop:         docker-compose down"
echo "   Restart:      docker-compose restart"
echo ""
