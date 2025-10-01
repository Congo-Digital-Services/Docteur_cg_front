// src/services/otp.js
import api from '@/services/apiClient';
import { delay } from '@/utils/delay';

const mode = process.env.APP_MODE || 'mock';

/**
 * Générer un code OTP
 * @param {Object} data - { email?, phone?, purpose, target? }
 * @returns {Promise<Object>} - { message, expiresIn }
 */
export async function generateOtp({ email, phone, purpose, target }) {
  if (mode === 'mock') {
    await delay(1000);
    return {
      message: phone ? 'Code OTP envoyé par SMS' : 'Code OTP envoyé par email',
      expiresIn: 300000 // 5 minutes
    };
  }

  const payload = { purpose };
  if (email) payload.email = email;
  if (phone) payload.phone = phone;
  if (target) payload.target = target;

  const response = await api.post('/auth/otp/generate', payload);
  return response.data;
}

/**
 * Vérifier un code OTP
 * @param {Object} data - { code, purpose, userId }
 * @returns {Promise<Object>} - { success, message }
 */
export async function verifyOtp({ code, purpose, userId }) {
  if (mode === 'mock') {
    await delay(800);
    // Code mock valide : 123456
    if (code === '123456') {
      return {
        success: true,
        message: 'Code OTP vérifié avec succès'
      };
    }
    throw new Error('Code OTP invalide');
  }

  const response = await api.post('/auth/otp/verify', {
    code,
    purpose,
    userId
  });
  return response.data;
}

/**
 * Renvoyer un code OTP
 * @param {Object} data - { email?, phone?, purpose, target? }
 * @returns {Promise<Object>} - { message, expiresIn }
 */
export async function resendOtp({ email, phone, purpose, target }) {
  if (mode === 'mock') {
    await delay(1000);
    return {
      message: phone ? 'Nouveau code OTP envoyé par SMS' : 'Nouveau code OTP envoyé par email',
      expiresIn: 300000
    };
  }

  const payload = { purpose };
  if (email) payload.email = email;
  if (phone) payload.phone = phone;
  if (target) payload.target = target;

  const response = await api.post('/auth/otp/resend', payload);
  return response.data;
}

/**
 * Types de purpose disponibles
 */
export const OTP_PURPOSES = {
  TWOFA: 'TWOFA',
  EMAIL_VERIFY: 'EMAIL_VERIFY',
  PHONE_VERIFY: 'PHONE_VERIFY',
  PASSWORD_RESET: 'PASSWORD_RESET',
  SIGNUP: 'SIGNUP',
  LOGIN: 'LOGIN'
};

/**
 * Durée d'expiration en millisecondes
 */
export const OTP_EXPIRATION = 300000; // 5 minutes
