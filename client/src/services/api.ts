// client/src/services/api.ts
import axios from 'axios';
import type { Card, Deck, User } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to all requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Card endpoints
export async function getAllCards(): Promise<Card[]> {
  const response = await api.get('/cards');
  return response.data.data.cards;
}

export async function getCardById(id: number): Promise<Card> {
  const response = await api.get(`/cards/${id}`);
  return response.data.data.card;
}

// Deck endpoints
export async function getUserDecks(): Promise<Deck[]> {
  const response = await api.get('/decks');
  return response.data.data;
}

export async function getDeckById(id: number): Promise<Deck> {
  const response = await api.get(`/decks/${id}`);
  return response.data.data;
}

export async function createDeck(data: {
  name: string;
  description: string;
  cardNames: string[];
  slot: number;
  isPublic: boolean;
}): Promise<Deck> {
  const response = await api.post('/decks', data);
  return response.data.data;
}

export async function updateDeck(id: number, data: any): Promise<Deck> {
  const response = await api.put(`/decks/${id}`, data);
  return response.data.data;
}

export async function deleteDeck(id: number): Promise<void> {
  await api.delete(`/decks/${id}`);
}

export async function likeDeck(id: number): Promise<number> {
  const response = await api.post(`/decks/${id}/like`);
  return response.data.data.likes;
}

// Auth endpoints
export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
}

export async function register(name: string, email: string, password: string) {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data.data;
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data.user;
}

// Token helpers
export function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function removeToken(): void {
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Public decks
export async function getPublicDecks(): Promise<any[]> {
  const response = await api.get('/decks?onlyPublic=true');
  return response.data.data;
}

export async function getSharedDeck(deckId: number): Promise<any> {
  const response = await api.get(`/decks/shared/${deckId}`);
  return response.data.data;
}

export default api;