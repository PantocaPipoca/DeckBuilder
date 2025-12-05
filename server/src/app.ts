// src/app.ts
import express from 'express';
import cors from 'cors';
import {
  listDecks,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  likeDeck,
} from './services/deckService';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'API Backend OK' });
});

/**
 * GET /api/decks
 */
app.get('/api/decks', async (req, res) => {
  try {
    const onlyPublic = req.query.onlyPublic === 'true';
    const decks = await listDecks(onlyPublic);
    return res.json(decks);
  } catch (err) {
    console.error('GET /api/decks error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/decks/:id
 */
app.get('/api/decks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deck = await getDeckById(id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    return res.json(deck);
  } catch (err) {
    console.error('GET /api/decks/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/decks
 */
app.post('/api/decks', async (req, res) => {
  try {
    const { name, description, cards, isPublic } = req.body;
    if (!name || !cards || !Array.isArray(cards) || cards.length !== 8) {
      return res.status(400).json({ error: 'Missing name or cards (array[8] required)' });
    }
    const created = await createDeck({ name, description, cards, isPublic });
    return res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/decks error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/decks/:id
 */
app.put('/api/decks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, cards, isPublic } = req.body;
    if (cards && (!Array.isArray(cards) || cards.length !== 8)) {
      return res.status(400).json({ error: 'cards must be an array of exactly 8 strings' });
    }
    // check exists
    const existing = await getDeckById(id);
    if (!existing) return res.status(404).json({ error: 'Deck not found' });

    const updated = await updateDeck(id, { name, description, cards, isPublic });
    return res.json(updated);
  } catch (err) {
    console.error('PUT /api/decks/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/decks/:id
 */
app.delete('/api/decks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    // check exists
    const existing = await getDeckById(id);
    if (!existing) return res.status(404).json({ error: 'Deck not found' });

    const removed = await deleteDeck(id);
    return res.json({ deleted: removed });
  } catch (err) {
    console.error('DELETE /api/decks/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/decks/:id/like
 */
app.post('/api/decks/:id/like', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await getDeckById(id);
    if (!existing) return res.status(404).json({ error: 'Deck not found' });

    const likes = await likeDeck(id);
    return res.json({ likes });
  } catch (err) {
    console.error('POST /api/decks/:id/like error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
