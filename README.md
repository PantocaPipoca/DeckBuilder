# DeckBuilder - Clash Royale Deck Management API

A full-stack application for creating, managing, and sharing Clash Royale decks.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/PantocaPipoca/DeckBuilder.git
cd DeckBuilder
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

### 3. Start the Application
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database (port 5432)
- Start the API server (port 4000)
- Generate Prisma client

### 4. Run Database Migrations
```bash
docker-compose exec server npx prisma migrate deploy
```

### 5. Seed the Database
```bash
docker-compose exec server npx ts-node src/configs/seed.ts
```

This creates:
- 1 test user (email: test@example.com, password: password123)
- 83 Clash Royale cards with images and descriptions

### 6. Verify Installation
Visit http://localhost:4000 - you should see:
```json
{
  "message": "DeckBuilder API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "api": "/api/decks"
  }
}
```

Test the health endpoint: http://localhost:4000/health

## 🗄️ Database Management

### Access Prisma Studio
```bash
cd server
npx prisma studio
```

### Reset Database
```bash
docker-compose exec server npx prisma migrate reset --force
docker-compose exec server npx ts-node src/configs/seed.ts
```

### Stop the Application
```bash
docker-compose down
```

### Restart with Fresh Data
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d
docker-compose exec server npx ts-node src/configs/seed.ts
```

## 📝 License

ISC

## 👤 Author

Pantas

---

**Need help?** Check the terminal logs:
```bash
docker logs CRDev  # Server logs
docker logs CRDB   # Database logs
```
