// src/services/auth.js
import { delay } from '../utils/delay';
import { encode as btoa, decode as atob } from 'base-64';

const users = new Map();

export async function login(email, password) {
  await delay(600);
  if (!users.has(email)) users.set(email, { id: Math.random().toString(36).slice(2), email });
  return { token: 'demo-token-' + btoa(email).slice(0, 8) };
}
export async function register(email, password) {
  await delay(700);
  users.set(email, { id: Math.random().toString(36).slice(2), email });
  return { token: 'demo-token-' + btoa(email).slice(0, 8) };
}
export async function me(token) {
  await delay(300);
  const email = atob(token.replace('demo-token-', ''));
  return { id: 'u_' + email.slice(0, 5), email };
}
