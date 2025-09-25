# 🐳 Docker Setup for Grailed Scraper

This project is fully containerized using Docker and Docker Compose. You can run the entire application with zero local dependencies (except Docker itself).

## 📋 Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)

**No Node.js, npm, or other dependencies needed on your machine!**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Guesser
```

### 2. Build and Run
```bash
# Build and start both services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🛠️ Development Commands

### Basic Operations
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend
```

### Building and Rebuilding
```bash
# Build both services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Force rebuild (no cache)
docker-compose build --no-cache

# Rebuild and start
docker-compose up --build
```

### Managing Containers
```bash
# List running containers
docker-compose ps

# Restart specific service
docker-compose restart backend

# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Remove all containers and networks
docker-compose down --volumes --remove-orphans
```

## 🏗️ Architecture

### Services
- **Backend**: Node.js + Express + Puppeteer (Port 3001)
  - Includes Chromium for web scraping
  - Grailed API scraping functionality
  - CORS enabled for frontend communication

- **Frontend**: React + Create React App (Port 3000)
  - Modern React 19 application
  - Lucide React icons
  - Responsive design

### Network
- Custom bridge network (`grailed-network`)
- Services communicate via container names
- Health checks ensure proper startup order

## 🔧 Configuration

### Environment Variables
The following environment variables are pre-configured:

**Backend**:
- `NODE_ENV=development`

**Frontend**:
- `REACT_APP_API_URL=http://localhost:3001`
- `CHOKIDAR_USEPOLLING=true` (for file watching in containers)

### Ports
- Backend: `3001:3001`
- Frontend: `3000:3000`

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill processes if needed
docker-compose down
```

**Permission Errors (Puppeteer)**:
- The backend runs as non-root user for security
- Chromium is pre-installed and configured

**Build Failures**:
```bash
# Clean everything and rebuild
docker-compose down --volumes --remove-orphans
docker system prune -f
docker-compose up --build
```

**Frontend Not Loading**:
- Ensure `HOST=0.0.0.0` is set in frontend Dockerfile
- Check if backend health check is passing

### Logs and Debugging
```bash
# View all logs
docker-compose logs -f

# Debug specific service
docker-compose logs -f backend

# Access container shell
docker-compose exec backend sh
```

## 🚀 Production Deployment

For production, consider:

1. **Environment Variables**: Use `.env` files for sensitive data
2. **Reverse Proxy**: Add nginx for load balancing
3. **SSL**: Configure HTTPS certificates
4. **Monitoring**: Add health checks and logging
5. **Scaling**: Use `docker-compose up --scale backend=3`

## 📁 File Structure
```
.
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── src/
├── docker-compose.yml
└── DOCKER_README.md
```

## ✅ Cross-Platform Compatibility

This Docker setup works on:
- ✅ macOS (Intel & Apple Silicon)
- ✅ Windows (WSL2 recommended)
- ✅ Linux (all distributions)
- ✅ Cloud platforms (AWS, GCP, Azure)
- ✅ CI/CD pipelines

**No "works on my machine" problems!** 🎉
