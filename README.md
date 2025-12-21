# DeckBuilder - Clash Royale Deck Management API

A full-stack application for creating, managing, and sharing Clash Royale decks.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/PantocaPipoca/DeckBuilder.git
cd DeckBuilder
```

### 2. Env Setup
Create a `.env` file in the root:
```bash
cp .env.example .env
```

### 3. Start the App
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database (port 5432)
- Start the API server (port 4000)

### 4. Run Database Migrations
```bash
docker-compose exec server npx prisma migrate deploy
```

### 5. Seed the Database
```bash
docker-compose exec server npx ts-node src/configs/seed.ts
```

This creates:
- 1 test user (email: dev@dev.com, passwword: devdev)
- Clash Royale cards with all needed stats for good life

### 6. Start Frontend

Run:

```bash
cd client
npm install
npm run dev
```


### 7. Verify Installation

#### Verify Backend
- Go to [http://localhost:4000](http://localhost:4000) for the backend

#### Verify Frontend
- Go to [http://localhost:5173](http://localhost:5173) for the front

If both open without errors, your installation is working!

### Reset Database
```bash
docker-compose exec server npx prisma migrate reset --force
docker-compose exec server npx ts-node src/configs/seed.ts
```

### Stop the App
```bash
docker-compose down
```

### Restart with Fresh Data
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d
docker-compose exec server npx ts-node src/configs/seed.ts
```

## Author

Pantas