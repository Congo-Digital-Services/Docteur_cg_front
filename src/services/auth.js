// src/services/auth.js
import api from '@/services/apiClient';
import { delay } from '@/utils/delay';
import { encode as btoa, decode as atob } from 'base-64';
import { generateOtp, OTP_PURPOSES } from './otp';

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
 * Register with OTP
 * - Envoie le code OTP après l'inscription
 * - Retourne les données pour la vérification OTP
 */
export async function registerWithOtp({ email, password, firstName, lastName, phone }) {
  // 1. Inscription
  const registerResult = await register({ email, password, firstName, lastName, phone });
  
  if (!registerResult.ok) {
    throw new Error('Échec de l\'inscription');
  }

  // 2. Génération du code OTP
  const otpResult = await generateOtp({
    email,
    phone,
    purpose: OTP_PURPOSES.SIGNUP,
    target: email
  });

  // 3. Génération d'un userId temporaire pour l'OTP
  const userId = mode === 'mock' 
    ? `temp_${Math.random().toString(36).slice(2)}` 
    : registerResult.userId || `temp_${email}`;

  return {
    ...registerResult,
    userId,
    otpSent: true,
    otpMessage: otpResult.message,
    expiresIn: otpResult.expiresIn
  };
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
 * Login with OTP
 * - Envoie le code OTP pour la connexion
 * - Retourne les données pour la vérification OTP
 */
export async function loginWithOtp({ email, password, phone }) {
  // 1. Tentative de connexion
  const loginResult = await login({ email, password, phone });
  
  // 2. Génération du code OTP
  const otpResult = await generateOtp({
    email,
    phone,
    purpose: OTP_PURPOSES.LOGIN,
    target: email || phone
  });

  return {
    ...loginResult,
    otpSent: true,
    otpMessage: otpResult.message,
    expiresIn: otpResult.expiresIn
  };
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
