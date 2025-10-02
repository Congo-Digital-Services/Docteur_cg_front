import api from '@/services/apiClient';
import { delay } from '@/utils/delay';
import { encode as btoa, decode as atob } from 'base-64';

const users = new Map();
const mode = process.env.APP_MODE || 'mock';

/**
 * Register
 * - Backend renvoie { confim_token }
 * - Plus de connexion automatique après inscription
 */
export async function register({ email, password, firstName, lastName, phone, role = 'PATIENT' }) {
  if (mode === 'mock') {
    await delay(700);
    users.set(email, { id: Math.random().toString(36).slice(2), email });
    return { confim_token: 'mock-confirm-token-' + btoa(email).slice(0, 8) };
  }

  const res = await api.post('/auth/register', {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
  });
  return res.data; // { confim_token }
}

/**
 * Login
 * - Backend renvoie { client, access_token }
 */
export async function login({ email, password, phone }) {
  console.log('login: ', [email, password, phone, mode])
  if (mode === 'mock') {
    await delay(600);
    if (!users.has(email)) {
      users.set(email, { id: 'u_' + email.slice(0, 5), email, is_verified: true });
    }
    const user = users.get(email);
    return { 
      client: { ...user }, 
      access_token: 'demo-token-' + btoa(email).slice(0, 8) 
    };
  }

  const res = await api.post('/auth/login', { email, password, phone });
  console.log('response: ',res)
  return res.data; // { client, access_token }
}

/**
 * Me
 * - Backend renvoie { client, access_token }
 */
export async function me() {
  if (mode === 'mock') {
    await delay(300);
    const token = await getAuthToken();
    const email = atob(token.replace('demo-token-', ''));
    return { 
      client: { id: 'u_' + email.slice(0, 5), email, is_verified: true },
      access_token: token
    };
  }

  const res = await api.post('/auth/me');
  return res.data; // { client, access_token }
}

/**
 * Confirm Account
 * - Vérifie le compte avec le code OTP
 */
export async function confirmAccount(code, confirmationToken) {
  if (mode === 'mock') {
    await delay(800);
    if (code === '123456') {
      const email = atob(confirmationToken.replace('mock-confirm-token-', ''));
      const user = users.get(email);
      return { 
        user: { ...user, is_verified: true },
        access_token: 'verified-token-' + btoa(email).slice(0, 8)
      };
    }
    throw new Error('Code OTP invalide');
  }

  const res = await api.post(
    '/auth/confirm', 
    { code },
    { tempToken: confirmationToken } // Utilise le token temporaire
  );
  return res.data; // { user, access_token }
}

/**
 * Request Password Reset
 * - Demande une réinitialisation de mot de passe
 */
export async function requestPasswordReset({ email, phone }) {
  if (mode === 'mock') {
    await delay(600);
    return { confim_token: 'mock-reset-token-' + btoa(email || phone).slice(0, 8) };
  }

  const res = await api.post('/auth/password/request', { email, phone });
  return res.data; // { confim_token }
}

/**
 * Confirm Password Reset
 * - Confirme la réinitialisation avec le code OTP et nouveau mot de passe
 */
export async function confirmPasswordReset(code, newPassword, confirmationToken) {
  if (mode === 'mock') {
    await delay(800);
    if (code === '123456') {
      return { success: true };
    }
    throw new Error('Code OTP invalide');
  }

  const res = await api.post(
    '/auth/password/confirm', 
    { code, newPassword },
    { tempToken: confirmationToken } // Utilise le token temporaire
  );
  return res.data; // { user, access_token }
}

/**
 * Resend Verification Code
 * - Renvoie le code de vérification
 */
export async function resendVerificationCode(confirmationToken) {
  if (mode === 'mock') {
    await delay(600);
    return { confim_token: confirmationToken };
  }

  const res = await api.post(
    '/auth/password/update',
    {},
    { tempToken: confirmationToken } // Utilise le token temporaire
  );
  return res.data; // { confim_token }
}