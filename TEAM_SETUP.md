# Team Setup Guide - Guesser Project

## Prerequisites (One-time setup per teammate)

### 1. Install Docker
- **Mac**: Download [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: Download [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Linux**: Follow [Docker Engine installation](https://docs.docker.com/engine/install/)

### 2. Verify Docker Installation
```bash
docker --version
docker run hello-world
```

### 3. Clone the Repository
```bash
git clone https://github.com/philipm7/guesser.git
cd guesser
```

## Daily Development Workflow

### Option 1: Docker Compose (Recommended - Easiest)
```bash
# Start the development environment
docker-compose up

# Run in background
docker-compose up -d

# Stop the environment
docker-compose down

# Rebuild when dependencies change
docker-compose up --build
```

### Option 2: Direct Docker Commands
```bash
# Build the image (only needed when Dockerfile or requirements.txt changes)
docker build -t guesser:dev .

# Run the container
docker run --rm guesser:dev

# Run with volume mount for live development
docker run --rm -v "$(pwd)":/app guesser:dev
```

### Development with Interactive Shell
```bash
# Using Docker Compose (recommended)
docker-compose run --rm guesser bash

# Using direct Docker
docker run --rm -v "$(pwd)":/app -it guesser:dev bash

# Inside container, you can:
python main.py              # Run your code
pip install new-package     # Install packages (remember to update requirements.txt)
exit                        # Exit container
```

## Adding New Dependencies

### 1. Update requirements.txt
Add new packages to `requirements.txt`:
```
flask==2.3.3
requests==2.31.0
```

### 2. Rebuild Image
```bash
# Using Docker Compose (recommended)
docker-compose up --build

# Using direct Docker
docker build -t guesser:dev .
```

### 3. Commit and Push
```bash
git add requirements.txt
git commit -m "Add flask and requests dependencies"
git push
```

## Troubleshooting

### Docker Issues
- **"Cannot connect to Docker daemon"**: Start Docker Desktop
- **"Image not found"**: Run `docker build -t guesser:dev .` first
- **Permission errors**: Make sure Docker Desktop has proper permissions

### Development Issues
- **Code changes not reflected**: Use volume mount (`-v "$(pwd)":/app`)
- **Dependencies missing**: Rebuild image after updating requirements.txt
- **Container exits immediately**: Check your main.py for errors

## Best Practices
1. Always rebuild image when requirements.txt changes
2. Use volume mounts during development
3. Commit requirements.txt changes immediately
4. Test in container before pushing code
5. Keep Dockerfile simple and well-commented
