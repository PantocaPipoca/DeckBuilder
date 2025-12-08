// src/services/api.ts
import axios from 'axios';
import type { Card, Deck, User } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

//FUTURO PARA LOGIC JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllCards = async (): Promise<Card[]> => {
  const response = await api.get('/cards');
  return response.data.data.cards;
};

export const getCardById = async (id: number): Promise<Card> => {
  const response = await api.get(`/cards/${id}`);
  return response.data.data.card;
};

export const getUserDecks = async (userId: number): Promise<Deck[]> => {
  const response = await api.get(`/decks?ownerId=${userId}`);
  return response.data.data;
};

export const getDeckById = async (id: number): Promise<Deck> => {
  const response = await api.get(`/decks/${id}`);
  return response.data.data;
};

export const createDeck = async (data: {
  name: string;
  description: string;
  cardNames: string[];
  isPublic: boolean;
  ownerId: number;
}): Promise<Deck> => {
  const response = await api.post('/decks', data);
  return response.data.data;
};

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

export const deleteDeck = async (id: number): Promise<void> => {
  await api.delete(`/decks/${id}`);
};

export const likeDeck = async (id: number): Promise<number> => {
  const response = await api.post(`/decks/${id}/like`);
  return response.data.data.likes;
};

//FUTURO JWT

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const register = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data.data;
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