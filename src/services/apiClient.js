import axios from 'axios';
import useAuthStore from '../stores/auth.store';

// Déterminer le mode à partir du .env
const mode = process.env.APP_MODE || 'mock';

let baseURL;

switch (mode) {
  case 'real':
    baseURL = process.env.API_URL;
    break;
  case 'dev':
    baseURL = process.env.API_URL_DEV;
    break;
  case 'mock':
  default:
    baseURL = process.env.API_URL_MOCK;
    break;
}

const api = axios.create({
  baseURL,
  timeout: 6000,
});

// Intercepteur: ajoute le token si présent
api.interceptors.request.use(async (cfg) => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Intercepteur: gestion simple des erreurs
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);

export default api;
