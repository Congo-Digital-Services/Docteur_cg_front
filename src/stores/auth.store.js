import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  login as apiLogin, 
  register as apiRegister, 
  me as apiMe,
  confirmAccount as apiConfirmAccount,
  requestPasswordReset as apiRequestPasswordReset,
  confirmPasswordReset as apiConfirmPasswordReset,
  resendVerificationCode as apiResendVerificationCode
} from '@/services/auth';

const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  loading: false,
  confirmationToken: null,
  passwordResetToken: null,

  init: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      set({ token });
      try {
        const { client } = await apiMe(); // me() renvoie { client, access_token }
        set({ user: client });
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
      const { client, access_token } = await apiLogin(credentials);
      if (!access_token) throw new Error("Token manquant à la connexion");

      await AsyncStorage.setItem('auth_token', access_token);
      set({ token: access_token, user: client, loading: false });
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  // data = { email, password, firstName, lastName, phone?, role? }
  register: async (data) => {
    set({ loading: true });
    try {
      const { confim_token } = await apiRegister(data);
      if (!confim_token) throw new Error("Échec de la création du compte");
      
      // Stocke le token de confirmation temporairement
      await AsyncStorage.setItem('confirm_token', confim_token);
      set({ confirmationToken: confim_token, loading: false });
      
      return { success: true, confirmationToken: confim_token };
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  // Vérification du compte avec OTP
  confirmAccount: async (code) => {
    set({ loading: true });
    try {
      const confirmationToken = get().confirmationToken || 
        await AsyncStorage.getItem('confirm_token');
      
      if (!confirmationToken) throw new Error("Token de confirmation manquant");
      
      const { user, access_token } = await apiConfirmAccount(code, confirmationToken);
      
      // Stocke le token permanent
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.removeItem('confirm_token');
      
      set({ 
        token: access_token, 
        user, 
        confirmationToken: null, 
        loading: false 
      });
      
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  // Demande de réinitialisation de mot de passe
  requestPasswordReset: async ({ email, phone }) => {
    set({ loading: true });
    try {
      const { confim_token } = await apiRequestPasswordReset({ email, phone });
      if (!confim_token) throw new Error("Échec de la demande de réinitialisation");
      
      // Stocke le token de réinitialisation
      await AsyncStorage.setItem('reset_token', confim_token);
      set({ passwordResetToken: confim_token, loading: false });
      
      return { success: true, resetToken: confim_token };
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  // Confirmation de réinitialisation de mot de passe
  confirmPasswordReset: async (code, newPassword) => {
    set({ loading: true });
    try {
      const resetToken = get().passwordResetToken || 
        await AsyncStorage.getItem('reset_token');
      
      if (!resetToken) throw new Error("Token de réinitialisation manquant");
      
      const { user, access_token } = await apiConfirmPasswordReset(code, newPassword, resetToken);
      
      // Stocke le nouveau token
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.removeItem('reset_token');
      
      set({ 
        token: access_token, 
        user, 
        passwordResetToken: null, 
        loading: false 
      });
      
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  // Renvoi du code de vérification
  resendVerificationCode: async () => {
    set({ loading: true });
    try {
      const confirmationToken = get().confirmationToken || 
        await AsyncStorage.getItem('confirm_token');
      
      if (!confirmationToken) throw new Error("Token de confirmation manquant");
      
      const { confim_token } = await apiResendVerificationCode(confirmationToken);
      
      // Met à jour le token si nécessaire
      if (confim_token !== confirmationToken) {
        await AsyncStorage.setItem('confirm_token', confim_token);
        set({ confirmationToken: confim_token });
      }
      
      set({ loading: false });
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['auth_token', 'confirm_token', 'reset_token']);
    set({ 
      token: null, 
      user: null, 
      confirmationToken: null, 
      passwordResetToken: null 
    });
  },
}));

// auto-init
useAuthStore.getState().init?.();

export default useAuthStore;