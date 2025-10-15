import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  login as apiLogin, 
  register as apiRegister, 
  me as apiMe,
  confirmAccount as apiConfirmAccount,
  requestPasswordReset as apiRequestPasswordReset,
  confirmPasswordReset as apiConfirmPasswordReset,
  resendVerificationCode as apiResendVerificationCode,
  guestAuth as apiGuestAuth
} from '@/services/auth';
import { getPatientData, createPatientProfile } from '@/services/patient'; // Assurez-vous que ce service est importé

const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  patient: null, // Cet état contiendra maintenant uniquement l'objet patient imbriqué
  loading: false,
  confirmationToken: null,
  passwordResetToken: null,
  isGuest: false,
  isInitialized: false,

  init: async () => {
    console.log("AuthStore: Initializing...");
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const isGuest = await AsyncStorage.getItem('is_guest') === 'true';
      
      if (token) {
        set({ token, isGuest });
        const { client } = await apiMe();
        console.log("AuthStore: Initialized with user.", client.email);
        
        if (client.role === 'PATIENT') {
          console.log("AuthStore: User is a patient, fetching patient data");
          try {
            const patientData = await getPatientData();
            // CORRECTION : On stocke uniquement l'objet patient imbriqué pour simplifier l'accès
            set({ patient: patientData.patient });
          } catch (error) {
            console.log("AuthStore: Patient profile not found, creating one");
            const newPatientData = await createPatientProfile();
            // CORRECTION : On stocke également l'objet patient imbriqué ici
            set({ patient: newPatientData.patient });
          }
        }
        
        set({ user: client });
      } else {
        console.log("AuthStore: No token found, user is logged out.");
      }
    } catch (error) {
      console.error("AuthStore: Failed to initialize auth.", error);
      set({ token: null, user: null, patient: null, isGuest: false });
      await AsyncStorage.multiRemove(['auth_token', 'is_guest']);
    } finally {
      set({ isInitialized: true });
      console.log("AuthStore: Initialization finished.");
    }
  },

  login: async (credentials) => {
    set({ loading: true });
    try {
      const { client, access_token } = await apiLogin(credentials);
      if (!access_token) throw new Error("Token manquant à la connexion");

      await AsyncStorage.multiSet([
        ['auth_token', access_token],
        ['is_guest', 'false']
      ]);
      
      if (client.role === 'PATIENT') {
        console.log("AuthStore: User is a patient, fetching patient data");
        try {
          const patientData = await getPatientData();
          // CORRECTION : On stocke uniquement l'objet patient imbriqué
          set({ patient: patientData.patient });
        } catch (error) {
          console.log("AuthStore: Patient profile not found, creating one");
          const newPatientData = await createPatientProfile();
          // CORRECTION : On stocke également l'objet patient imbriqué ici
          set({ patient: newPatientData.patient });
        }
      }
      
      set({ token: access_token, user: client, loading: false, isGuest: false });
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const { confim_token } = await apiRegister(data);
      if (!confim_token) throw new Error("Échec de la création du compte");
      
      await AsyncStorage.setItem('confirm_token', confim_token);
      set({ confirmationToken: confim_token, loading: false });
      
      return { success: true, confirmationToken: confim_token };
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  confirmAccount: async (code) => {
    set({ loading: true });
    try {
      const confirmationToken = get().confirmationToken || await AsyncStorage.getItem('confirm_token');
      if (!confirmationToken) throw new Error("Token de confirmation manquant");
      
      const { user, access_token } = await apiConfirmAccount(code, confirmationToken);
      
      await AsyncStorage.multiSet([
        ['auth_token', access_token],
        ['is_guest', 'false']
      ]);
      await AsyncStorage.removeItem('confirm_token');
      
      if (user.role === 'PATIENT') {
        console.log("AuthStore: User is a patient, fetching patient data");
        try {
          const patientData = await getPatientData();
          // CORRECTION : On stocke uniquement l'objet patient imbriqué
          set({ patient: patientData.patient });
        } catch (error) {
          console.log("AuthStore: Patient profile not found, creating one");
          const newPatientData = await createPatientProfile();
          // CORRECTION : On stocke également l'objet patient imbriqué ici
          set({ patient: newPatientData.patient });
        }
      }
      
      set({ 
        token: access_token, 
        user, 
        confirmationToken: null, 
        loading: false,
        isGuest: false
      });
      
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  requestPasswordReset: async ({ email, phone }) => {
    set({ loading: true });
    try {
      const { confim_token } = await apiRequestPasswordReset({ email, phone });
      if (!confim_token) throw new Error("Échec de la demande de réinitialisation");
      
      await AsyncStorage.setItem('reset_token', confim_token);
      set({ passwordResetToken: confim_token, loading: false });
      
      return { success: true, resetToken: confim_token };
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  confirmPasswordReset: async (code, newPassword) => {
    set({ loading: true });
    try {
      const resetToken = get().passwordResetToken || await AsyncStorage.getItem('reset_token');
      if (!resetToken) throw new Error("Token de réinitialisation manquant");
      
      const { user, access_token } = await apiConfirmPasswordReset(code, newPassword, resetToken);
      
      await AsyncStorage.multiSet([
        ['auth_token', access_token],
        ['is_guest', 'false']
      ]);
      await AsyncStorage.removeItem('reset_token');
      
      if (user.role === 'PATIENT') {
        console.log("AuthStore: User is a patient, fetching patient data");
        try {
          const patientData = await getPatientData();
          // CORRECTION : On stocke uniquement l'objet patient imbriqué
          set({ patient: patientData.patient });
        } catch (error) {
          console.log("AuthStore: Patient profile not found, creating one");
          const newPatientData = await createPatientProfile();
          // CORRECTION : On stocke également l'objet patient imbriqué ici
          set({ patient: newPatientData.patient });
        }
      }
      
      set({ 
        token: access_token, 
        user, 
        passwordResetToken: null, 
        loading: false,
        isGuest: false
      });
      
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  resendVerificationCode: async () => {
    set({ loading: true });
    try {
      const confirmationToken = get().confirmationToken || await AsyncStorage.getItem('confirm_token');
      if (!confirmationToken) throw new Error("Token de confirmation manquant");
      
      const { confim_token } = await apiResendVerificationCode(confirmationToken);
      
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

  guestAuth: async () => {
    set({ loading: true });
    try {
      const { access_token } = await apiGuestAuth();
      if (!access_token) throw new Error("Échec de l'authentification invité");
      
      await AsyncStorage.multiSet([
        ['auth_token', access_token],
        ['is_guest', 'true']
      ]);
      
      set({ 
        token: access_token, 
        user: null, 
        patient: null,
        loading: false,
        isGuest: true
      });
      
      return true;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['auth_token', 'confirm_token', 'reset_token', 'is_guest']);
    set({ 
      token: null, 
      user: null, 
      patient: null,
      confirmationToken: null, 
      passwordResetToken: null,
      isGuest: false
    });
  },
}));

// L'initialisation est toujours lancée ici, au démarrage de l'app
useAuthStore.getState().init();

export default useAuthStore;