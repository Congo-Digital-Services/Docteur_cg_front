import axios from 'axios';
import useAuthStore from '../stores/auth.store';

const api = axios.create({
  baseURL: 'https://mock.local', // virtuel, on utilise des mocks
  timeout: 6000
});

// Intercepteur: ajoute token si présent
api.interceptors.request.use(async (cfg) => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Intercepteur erreurs simple
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);

export default api;
