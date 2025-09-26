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
  },

  // Simulation de connexion pour les tests
  simulateLogin: () => {
    const mockUser = {
      id: '1',
      firstName: 'Jean-Baptiste',
      lastName: 'Moukengue',
      email: 'jean.moukengue@example.cg',
      phone: '+242 05 12 34 56 78',
      birthDate: '15/03/1985',
      address: '123 Avenue de l\'Indépendance',
      city: 'Brazzaville',
      district: 'Moungali',
      emergencyContact: 'Marie Mabiala',
      emergencyPhone: '+242 05 98 76 54 32'
    };
    const mockToken = 'mock_token_123';
    
    set({ token: mockToken, user: mockUser });
    AsyncStorage.setItem('auth_token', mockToken);
  }
}));

// auto-init
useAuthStore.getState().init?.();

export default useAuthStore;
