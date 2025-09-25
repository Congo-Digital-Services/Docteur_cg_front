import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, me as apiMe } from '../services/auth';

const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  loading: false,

  init: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      set({ token });
      try {
        const user = await apiMe(token);
        set({ user });
      } catch {
        set({ token: null, user: null });
        await AsyncStorage.removeItem('auth_token');
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { token } = await apiLogin(email, password);
      await AsyncStorage.setItem('auth_token', token);
      const user = await apiMe(token);
      set({ token, user, loading: false });
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  register: async (email, password) => {
    set({ loading: true });
    try {
      const { token } = await apiRegister(email, password);
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
  }
}));

// auto-init
useAuthStore.getState().init?.();

export default useAuthStore;
