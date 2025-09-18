# guesser

Minimal bootstrap for the Price Guesser Game repository.

## Local (no Docker)
```bash
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install --upgrade pip -r requirements.txt
python main.py
```

## Docker
```bash
docker build -t guesser:dev .
docker run --rm guesser:dev
```

## Repo notes
This repo currently contains a simple Python "Hello, world" and Dockerfile with an internal venv.

Extend requirements.txt as the project grows.
