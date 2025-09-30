// src/services/auth.js
import api from '@/services/apiClient';
import { delay } from '@/utils/delay';
import { encode as btoa, decode as atob } from 'base-64';

const users = new Map();
const mode = process.env.APP_MODE || 'mock';

/**
 * Register
 * - Backend renvoie { ok: true }
 * - On ne normalise rien ici ; le store gère ensuite le login.
 */
export async function register({ email, password, firstName, lastName, phone }) {
  if (mode === 'mock') {
    await delay(700);
    users.set(email, { id: Math.random().toString(36).slice(2), email });
    return { ok: true };
  }

  const res = await api.post('/auth/register', {
    email,
    password,
    firstName,
    lastName,
    phone,
    role: 'PATIENT',
  });
  return res.data; // { ok: true }
}

/**
 * Login
 * - MOCK: retourne { token }
 * - REAL: mappe { access_token } -> { token }
 */
export async function login({ email, password, phone }) {
  if (mode === 'mock') {
    await delay(600);
    if (!users.has(email)) {
      users.set(email, { id: Math.random().toString(36).slice(2), email });
    }
    return { token: 'demo-token-' + btoa(email).slice(0, 8) };
  }

  const res = await api.post('/auth/login', { email, password, phone });
  // backend: { client, access_token }
  return { token: res.data.access_token, client: res.data.client };
}

/**
 * Me
 * - MOCK: renvoie un user minimal
 * - REAL: renvoie directement "client" (le profil)
 */
export async function me(token) {
  if (mode === 'mock') {
    await delay(300);
    const email = atob(token.replace('demo-token-', ''));
    return { id: 'u_' + email.slice(0, 5), email };
  }

  const res = await api.post('/auth/me');
  // backend: { client, access_token }
  return res.data.client;
}
