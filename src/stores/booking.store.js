import { create } from 'zustand';
import { 
  createAppointment, 
  getMyAppointments, 
  cancelAppointment, 
  updateAppointment,
  getAppointment
} from '../services/appointments';
import { getDoctorOpeningHours, generateWeeklySlots } from '../services/slots';

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
  bookAppointment: async () => {
    const { selectedDoctor, selectedSlot } = get();
    if (!selectedDoctor || !selectedSlot) {
      throw new Error('Sélection incomplète');
    }
    
    try {
      set({ loading: true, error: null });
      
      // Créer l'objet de rendez-vous
      const appointmentData = {
        doctorId: selectedDoctor.id,
        startsAt: new Date(`${selectedSlot.date}T${selectedSlot.time}:00`).toISOString(),
        endsAt: new Date(`${selectedSlot.date}T${selectedSlot.time}:00`).toISOString(), // À ajuster selon la durée du rendez-vous
        status: 'PENDING'
      };
      
      const appointment = await createAppointment(appointmentData);
      
      // Rafraîchir la liste des rendez-vous
      await get().loadMyAppointments();
      
      set({ loading: false });
      return appointment;
    } catch (error) {
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
      const response = await getMyAppointments(params);
      
      // Le backend retourne un objet paginé
      const appointments = response.items || [];
      
      set({ 
        appointments, 
        loading: false 
      });
      return response;
    } catch (error) {
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
      const appointment = await getAppointment(id);
      set({ 
        appointmentDetails: appointment, 
        loading: false 
      });
      return appointment;
    } catch (error) {
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