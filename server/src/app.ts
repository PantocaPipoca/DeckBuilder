// src/app.ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Tipo simples para um Deck (apenas em memória para já).
 * Em TS isto ajuda o autocomplete e evita erros.
 */
type Deck = {
  id: number;
  name: string;
  description?: string;
  cards: string[]; // array de 8 cartas
  isPublic: boolean;
  likes: number;
  ownerId?: number | null;
  createdAt: string;
  updatedAt?: string;
};

let decks: Deck[] = [
  {
    id: 1,
    name: 'Deck de Giant',
    description: 'Giant + suporte aéreo',
    cards: ["Giant", "Musketeer", "Archer", "Zap", "Tornado", "Mini P.E.K.K.A", "Cannon", "Fireball"],
    isPublic: true,
    likes: 12,
    ownerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Deck Ciclo',
    description: 'Ciclo rápido e pressão',
    cards: ["Hog Rider", "Ice Spirit", "Skeletons", "Cannon", "Fireball", "Log", "Musketeer", "Knight"],
    isPublic: false,
    likes: 3,
    ownerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// rota de teste simples
app.get('/', (_req, res) => {
  res.json({ message: 'API Backend OK' });
});

/* ============================
   CRUD: /api/decks
   ============================ */

/**
 * GET /api/decks
 * Retorna a lista de decks (podes filtrar ?onlyPublic=true)
 */
app.get('/api/decks', (req, res) => {
  const onlyPublic = req.query.onlyPublic === 'true';
  const result = onlyPublic ? decks.filter(d => d.isPublic) : decks;
  res.json(result); // status 200 implícito
});

/**
 * GET /api/decks/:id
 * Obter detalhes de 1 deck por id
 */
app.get('/api/decks/:id', (req, res) => {
  const id = Number(req.params.id);
  const deck = decks.find(d => d.id === id);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  return res.json(deck);
});

/**
 * POST /api/decks
 * Criar novo deck
 * Espera body JSON: { name, description?, cards: string[8], isPublic? }
 */
app.post('/api/decks', (req, res) => {
  const { name, description, cards, isPublic } = req.body;

  // validação simples
  if (!name || !cards || !Array.isArray(cards)) {
    return res.status(400).json({ error: 'Missing name or cards (array required)' });
  }
  if (cards.length !== 8) {
    return res.status(400).json({ error: 'cards must be an array of exactly 8 strings' });
  }

  const newId = decks.length ? Math.max(...decks.map(d => d.id)) + 1 : 1;
  const now = new Date().toISOString();
  const newDeck: Deck = {
    id: newId,
    name,
    description: description ?? '',
    cards,
    isPublic: Boolean(isPublic),
    likes: 0,
    ownerId: null,
    createdAt: now,
    updatedAt: now
  };

  decks.push(newDeck);
  return res.status(201).json(newDeck); // 201 = created
});

/**
 * PUT /api/decks/:id
 * Atualizar um deck (substitui/merge simples)
 */
app.put('/api/decks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = decks.findIndex(d => d.id === id);
  if (index === -1) return res.status(404).json({ error: 'Deck not found' });

  const { name, description, cards, isPublic } = req.body;

  // Se o cliente manda cards, valida tamanho
  if (cards && (!Array.isArray(cards) || cards.length !== 8)) {
    return res.status(400).json({ error: 'cards must be an array of exactly 8 strings' });
  }

  const existing = decks[index]!;

  const updated: Deck = {
    ...existing,
    name: name ?? existing.name,
    description: description ?? existing.description,
    cards: cards ?? existing.cards,
    isPublic: typeof isPublic === 'boolean' ? isPublic : existing.isPublic,
    updatedAt: new Date().toISOString()
  };

  decks[index] = updated;
  return res.json(updated);
});

/**
 * DELETE /api/decks/:id
 * Apagar um deck
 */
app.delete('/api/decks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = decks.findIndex(d => d.id === id);
  if (index === -1) return res.status(404).json({ error: 'Deck not found' });

  const removed = decks.splice(index, 1)[0];
  return res.json({ deleted: removed });
});

/* ============================
   Extra: POST /api/decks/:id/like
   incrementa likes
   ============================ */
app.post('/api/decks/:id/like', (req, res) => {
  const id = Number(req.params.id);
  const deck = decks.find(d => d.id === id);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  deck.likes += 1;
  deck.updatedAt = new Date().toISOString();
  return res.json({ likes: deck.likes });
});

export default app;
