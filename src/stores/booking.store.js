// stores/booking.store.js
import { create } from 'zustand';
import { 
  createAppointment, 
  getMyAppointments, 
  cancelAppointment, 
  updateAppointment,
  getAppointment
} from '../services/appointments';
import { getDoctorOpeningHours, generateWeeklySlots } from '../services/slots';
import useAuthStore from './auth.store';

const useBookingStore = create((set, get) => ({
  // État pour la réservation
  selectedDoctor: null,
  slots: [],
  selectedSlot: null,
  appointments: [],
  appointmentDetails: null,
  loading: false,
  error: null,

  // Actions pour les créneaux
  loadSlots: async (doctorId) => {
    set({ loading: true, error: null });
    try {
      const openingHours = await getDoctorOpeningHours(doctorId);
      const slots = generateWeeklySlots(openingHours);
      set({ slots, loading: false });
    } catch (error) {
      set({ 
        error: error.message || "Erreur lors du chargement des créneaux", 
        loading: false 
      });
      throw error;
    }
  },

  selectDoctor: (doctor) => set({ selectedDoctor: doctor }),
  selectSlot: (slot) => set({ selectedSlot: slot }),
  clearSelection: () => set({ selectedDoctor: null, selectedSlot: null }),

  // Actions pour les rendez-vous
  // CORRECTION: La fonction bookAppointment doit accepter les données en paramètre
  bookAppointment: async (appointmentData) => {
    // Vérifier que les données sont fournies
    if (!appointmentData) {
      throw new Error('Données de rendez-vous manquantes');
    }
    
    try {
      set({ loading: true, error: null });
      
      console.log("[useBookingStore] Création du rendez-vous avec les données:", appointmentData);
      
      // Le backend utilisera le contexte utilisateur pour trouver le patient correspondant
      const appointment = await createAppointment(appointmentData);
      
      // Rafraîchir la liste des rendez-vous
      await get().loadMyAppointments();
      
      set({ loading: false });
      return appointment;
    } catch (error) {
      console.error("[useBookingStore] Erreur lors de la réservation:", error);
      set({ 
        error: error.message || "Erreur lors de la réservation", 
        loading: false 
      });
      throw error;
    }
  },

  loadMyAppointments: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      console.log("[useBookingStore] Chargement des rendez-vous avec les paramètres:", params);
      
      // Le backend utilisera le contexte utilisateur pour trouver le patient correspondant
      const response = await getMyAppointments(params);
      
      // Le backend retourne un objet paginé
      const appointments = response.items || [];
      
      console.log("[useBookingStore] Rendez-vous récupérés:", appointments);
      
      set({ 
        appointments, 
        loading: false 
      });
      return response;
    } catch (error) {
      console.error("[useBookingStore] Erreur lors du chargement des rendez-vous:", error);
      set({ 
        error: error.message || "Erreur lors du chargement des rendez-vous", 
        loading: false 
      });
      throw error;
    }
  },

  loadAppointmentDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      console.log("[useBookingStore] Chargement des détails du rendez-vous:", id);
      const appointment = await getAppointment(id);
      set({ 
        appointmentDetails: appointment, 
        loading: false 
      });
      return appointment;
    } catch (error) {
      console.error("[useBookingStore] Erreur lors du chargement des détails du rendez-vous:", error);
      set({ 
        error: error.message || "Erreur lors du chargement des détails du rendez-vous", 
        loading: false 
      });
      throw error;
    }
  },

  updateAppointment: async (appointmentData) => {
    set({ loading: true, error: null });
    try {
      console.log("[useBookingStore] Mise à jour du rendez-vous:", appointmentData);
      const updatedAppointment = await updateAppointment(appointmentData);
      
      // Mettre à jour le rendez-vous dans la liste
      set(state => ({
        appointments: state.appointments.map(apt => 
          apt.id === updatedAppointment.id ? updatedAppointment : apt
        ),
        appointmentDetails: state.appointmentDetails?.id === updatedAppointment.id 
          ? updatedAppointment 
          : state.appointmentDetails,
        loading: false
      }));
      
      return updatedAppointment;
    } catch (error) {
      console.error("[useBookingStore] Erreur lors de la mise à jour du rendez-vous:", error);
      set({ 
        error: error.message || "Erreur lors de la mise à jour du rendez-vous", 
        loading: false 
      });
      throw error;
    }
  },

  cancelAppointment: async (id) => {
    set({ loading: true, error: null });
    try {
      console.log("[useBookingStore] Annulation du rendez-vous:", id);
      await cancelAppointment(id);
      
      // Mettre à jour le statut du rendez-vous dans la liste
      set(state => ({
        appointments: state.appointments.map(apt => 
          apt.id === id ? { ...apt, status: 'CANCELED' } : apt
        ),
        appointmentDetails: state.appointmentDetails?.id === id 
          ? { ...state.appointmentDetails, status: 'CANCELED' } 
          : state.appointmentDetails,
        loading: false
      }));
    } catch (error) {
      console.error("[useBookingStore] Erreur lors de l'annulation du rendez-vous:", error);
      set({ 
        error: error.message || "Erreur lors de l'annulation du rendez-vous", 
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearAppointmentDetails: () => set({ appointmentDetails: null }),
}));

export default useBookingStore;