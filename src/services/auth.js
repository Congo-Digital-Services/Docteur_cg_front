// services/auth.js
import api from './apiClient';

/**
 * Register
 * - Backend renvoie { confim_token }
 * - Plus de connexion automatique après inscription
 */
export async function register({ email, password, firstName, lastName, phone, role = 'PATIENT' }) {
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
  const res = await api.post('/auth/login', { email, password, phone });
  return res.data; // { client, access_token }
}

/**
 * Me
 * - Backend renvoie { client, access_token }
 */
export async function me() {
  const res = await api.post('/auth/me');
  return res.data; // { client, access_token }
}

/**
 * Confirm Account
 * - Vérifie le compte avec le code OTP
 */
export async function confirmAccount(code, confirmationToken) {
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
  const res = await api.post('/auth/password/request', { email, phone });
  return res.data; // { confim_token }
}

/**
 * Confirm Password Reset
 * - Confirme la réinitialisation avec le code OTP et nouveau mot de passe
 */
export async function confirmPasswordReset(code, newPassword, confirmationToken) {
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
  const res = await api.post(
    '/auth/password/update',
    {},
    { tempToken: confirmationToken } // Utilise le token temporaire
  );
  return res.data; // { confim_token }
}

/**
 * Guest Authentication
 * - Crée un utilisateur invité
 */
export async function guestAuth() {
  const res = await api.post('/auth/guest');
  return res.data; // { access_token }
}