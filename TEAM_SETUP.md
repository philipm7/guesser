# Team Setup Guide - Grailed Scraper Project

## Prerequisites (One-time setup per teammate)

### 1. Install Docker
- **Mac**: Download [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: Download [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Linux**: Follow [Docker Engine installation](https://docs.docker.com/engine/install/)

### 2. Verify Docker Installation
```bash
docker --version
docker-compose --version
docker run hello-world
```

### 3. Clone the Repository
```bash
git clone <repository-url>
cd Guesser
```

## Daily Development Workflow

### Start the Application (Docker Only)
```bash
# Start both frontend and backend services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Development Commands
```bash
# View logs for specific service
docker-compose logs frontend
docker-compose logs backend

# Restart a specific service
docker-compose restart backend

# Access container shell for debugging
docker-compose exec backend sh
docker-compose exec frontend sh

# Rebuild and restart after code changes
docker-compose up --build
```

## Adding New Dependencies

### Backend Dependencies (Node.js)
1. **Edit `backend/package.json`** to add new dependency
2. **Rebuild the backend container**:
```bash
docker-compose build backend
docker-compose up
```

### Frontend Dependencies (React)
1. **Edit `frontend/package.json`** to add new dependency  
2. **Rebuild the frontend container**:
```bash
docker-compose build frontend
docker-compose up
```

### Commit Changes
```bash
git add backend/package.json frontend/package.json
git commit -m "Add new dependencies"
git push
```

## Troubleshooting

### Docker Issues
- **"Cannot connect to Docker daemon"**: Start Docker Desktop
- **"Port already in use"**: Stop existing containers with `docker-compose down`
- **Permission errors**: Make sure Docker Desktop has proper permissions

### Development Issues
- **Code changes not reflected**: Containers use live code mounting
- **Dependencies missing**: Rebuild containers after updating package.json
- **Services won't start**: Check logs with `docker-compose logs <service>`
- **Frontend won't load**: Wait 30-60 seconds for React dev server to start

### Common Commands
```bash
# Clean up everything and start fresh
docker-compose down --volumes --remove-orphans
docker system prune -f
docker-compose up --build

# Check what's running
docker-compose ps

# Stop specific service
docker-compose stop frontend
```

## Best Practices
1. Always use `docker-compose up --build` to ensure latest changes
2. Commit package.json changes immediately after adding dependencies  
3. Test in Docker containers before pushing code
4. Use Docker-based development workflow only
5. Never install Node.js or npm locally - everything runs in containers

## Architecture
- **Backend**: Node.js + Express + Puppeteer (web scraping)
- **Frontend**: React application with modern UI
- **Communication**: Backend API on :3001, Frontend on :3000
- **Networking**: Docker internal network for service communication
