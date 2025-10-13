// services/api.js
import axios from 'axios';
import { getAuthToken } from '@/utils/authToken';

// Utilisation directe de l'URL de l'API sans mode mock
const baseURL = process.env.API_URL || 'https://votre-api-url.com';

const api = axios.create({
  baseURL,
  timeout: 6000,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(async (cfg) => {
  // Utilise le token temporaire si fourni dans la config
  if (cfg.tempToken) {
    cfg.headers.Authorization = `Bearer ${cfg.tempToken}`;
  } else {
    const token = await getAuthToken();
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);

export default api;