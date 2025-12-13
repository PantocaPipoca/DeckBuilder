// src/services/api.ts

/**
 * This module is something of a bridge between the client and server
 * It provides functions to interact with backend API endpoints
 */
import axios from 'axios';
import type { Card, Deck, User } from '../types';

// Here I use axios to simplify HTTP requests and avoid manually writing boilerplate code
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Logic - Automatically attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * @returns All cards from the backend
 */
export const getAllCards = async (): Promise<Card[]> => {
  const response = await api.get('/cards');
  return response.data.data.cards;
};

/**
 * @param id ID of the card to fetch
 * @returns Card with given ID
 */
export const getCardById = async (id: number): Promise<Card> => {
  const response = await api.get(`/cards/${id}`);
  return response.data.data.card;
};

/**
 * Get decks for the authenticated user
 * @returns Array of decks of the user
 */
export const getUserDecks = async (): Promise<Deck[]> => {
  const response = await api.get(`/decks`);
  return response.data.data;
};

/**
 * @param id ID of the deck to fetch
 * @returns Deck with given ID
 */
export const getDeckById = async (id: number): Promise<Deck> => {
  const response = await api.get(`/decks/${id}`);
  return response.data.data;
};

/**
 * @param data Deck creation data (name, description, cardNames, slot, isPublic)
 * @returns Created deck
 */
export const createDeck = async (data: {
  name: string;
  description: string;
  cardNames: string[];
  slot: number;
  isPublic: boolean;
}): Promise<Deck> => {
  const response = await api.post('/decks', data);
  return response.data.data;
};

/**
 * @param id ID of the deck to update
 * @param data Update data (name?, description?, cardNames?, isPublic?)
 * @returns Updated deck
 */
export const updateDeck = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    cardNames?: string[];
    isPublic?: boolean;
  }
): Promise<Deck> => {
  const response = await api.put(`/decks/${id}`, data);
  return response.data.data;
};

/**
 * @param id ID of the deck to delete
 */
export const deleteDeck = async (id: number): Promise<void> => {
  await api.delete(`/decks/${id}`);
};

/**
 * @param id ID of the deck to like
 * @returns Updated like count
 */
export const likeDeck = async (id: number): Promise<number> => {
  const response = await api.post(`/decks/${id}/like`);
  return response.data.data.likes;
};

// Auth Functions

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

/**
 * Register new user
 */
export const register = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data.data;
};

/**
 * Get current user info
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data.user;
};

export const saveToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export default api;