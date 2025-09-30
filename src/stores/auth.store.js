// src/stores/auth.store.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, me as apiMe } from '@/services/auth';

const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  loading: false,

  init: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      set({ token });
      try {
        const user = await apiMe(token); // me() renvoie directement le profil normalisé
        set({ user });
      } catch {
        set({ token: null, user: null });
        await AsyncStorage.removeItem('auth_token');
      }
    }
  },

  // credentials = { email, password, phone? }
  login: async (credentials) => {
    set({ loading: true });
    try {
      const { token } = await apiLogin(credentials); // toujours { token } grâce à la normalisation
      if (!token) throw new Error("Token manquant à la connexion");

      await AsyncStorage.setItem('auth_token', token);

      const user = await apiMe(token); // me() -> profil (client)
      set({ token, user, loading: false });
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  // data = { email, password, firstName, lastName, phone? }
  register: async (data) => {
    set({ loading: true });
    try {
      const res = await apiRegister(data); // { ok: true }
      if (!res?.ok) throw new Error("Échec de la création du compte");

      // login immédiat
      const { token } = await apiLogin({ email: data.email, password: data.password });
      if (!token) throw new Error("Impossible de récupérer le token après inscription");

      await AsyncStorage.setItem('auth_token', token);

      const user = await apiMe(token);
      set({ token, user, loading: false });
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({ token: null, user: null });
  },
}));

// auto-init
useAuthStore.getState().init?.();

export default useAuthStore;
