import { create } from 'zustand';
import { 
  createAppointment, 
  getMyAppointments, 
  cancelAppointment, 
  updateAppointment,
  getAppointment,
  getDoctorSlots
} from '../services/appointments';

const useBookingStore = create((set, get) => ({
  // État pour la sélection
  selectedDoctor: null,
  selectedDate: null,
  selectedSlot: null,
  
  // État pour les créneaux
  slots: [],
  slotsLoading: false,
  slotsError: null,
  
  // État pour les rendez-vous
  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,
  currentAppointment: null,
  currentAppointmentLoading: false,
  currentAppointmentError: null,
  
  // État pour la pagination
  currentPage: 1,
  totalPages: 1,
  total: 0,
  hasMore: true,
  
  // Actions pour les créneaux
  loadSlots: async (doctorId, date) => {
    set({ slotsLoading: true, slotsError: null });
    
    try {
      const data = await getDoctorSlots(doctorId, date);
      set({ 
        slots: data || [], 
        slotsLoading: false 
      });
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors du chargement des créneaux.";
      
      if (error.response) {
        if (error.response.status >= 500) {
          errorMessage = "Le service est temporairement indisponible.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Problème de connexion. Vérifiez votre réseau.";
      } else {
        errorMessage = error.message;
      }
      
      set({ slotsError: errorMessage, slotsLoading: false });
    }
  },
  
  // Actions pour la sélection
  selectDoctor: (doctor) => set({ selectedDoctor: doctor }),
  selectDate: (date) => set({ selectedDate: date }),
  selectSlot: (slot) => set({ selectedSlot: slot }),
  clearSelection: () => set({ 
    selectedDoctor: null, 
    selectedDate: null, 
    selectedSlot: null 
  }),
  
  // Actions pour les rendez-vous
  bookAppointment: async () => {
    const { selectedDoctor, selectedDate, selectedSlot } = get();
    
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      throw new Error('Sélection incomplète');
    }
    
    try {
      const appointment = await createAppointment({
        doctorId: selectedDoctor.id,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
        notes: ''
      });
      
      // Rafraîchir la liste des rendez-vous après la création
      get().loadMyAppointments();
      
      return appointment;
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      throw error;
    }
  },
  
  loadMyAppointments: async (resetPage = true) => {
    set({ appointmentsLoading: true, appointmentsError: null });
    
    if (resetPage) {
      set({ currentPage: 1, appointments: [] });
    }
    
    try {
      const page = resetPage ? 1 : get().currentPage;
      const response = await getMyAppointments({ page });
      
      // Le backend retourne un objet paginé
      const items = response.items || [];
      const total = response.total || 0;
      const pageSize = response.pageSize || 10;
      const totalPages = Math.ceil(total / pageSize);
      const hasNext = page < totalPages;
      
      set((state) => ({
        appointments: resetPage ? items : [...state.appointments, ...items],
        total,
        totalPages,
        hasMore: hasNext,
        currentPage: page + 1,
        appointmentsLoading: false,
      }));
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors du chargement des rendez-vous.";
      
      if (error.response) {
        if (error.response.status >= 500) {
          errorMessage = "Le service est temporairement indisponible.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Problème de connexion. Vérifiez votre réseau.";
      } else {
        errorMessage = error.message;
      }
      
      set({ appointmentsError: errorMessage, appointmentsLoading: false });
    }
  },
  
  loadMoreAppointments: async () => {
    const { hasMore, appointmentsLoading } = get();
    if (!hasMore || appointmentsLoading) return;
    
    // Ne pas réinitialiser les résultats ni la page
    get().loadMyAppointments(false);
  },
  
  getAppointmentDetails: async (id) => {
    set({ currentAppointmentLoading: true, currentAppointmentError: null });
    
    try {
      const appointment = await getAppointment(id);
      set({ 
        currentAppointment: appointment, 
        currentAppointmentLoading: false 
      });
      return appointment;
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors du chargement du rendez-vous.";
      
      if (error.response) {
        if (error.response.status >= 500) {
          errorMessage = "Le service est temporairement indisponible.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Problème de connexion. Vérifiez votre réseau.";
      } else {
        errorMessage = error.message;
      }
      
      set({ currentAppointmentError: errorMessage, currentAppointmentLoading: false });
      throw error;
    }
  },
  
  updateAppointment: async (id, updates) => {
    try {
      const appointment = await updateAppointment({ id, ...updates });
      
      // Mettre à jour le rendez-vous dans la liste
      set((state) => ({
        appointments: state.appointments.map((apt) => 
          apt.id === id ? { ...apt, ...updates } : apt
        ),
        currentAppointment: state.currentAppointment?.id === id 
          ? { ...state.currentAppointment, ...updates } 
          : state.currentAppointment
      }));
      
      return appointment;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rendez-vous:", error);
      throw error;
    }
  },
  
  cancelAppointment: async (id) => {
    try {
      await cancelAppointment(id);
      
      // Mettre à jour le statut du rendez-vous dans la liste
      set((state) => ({
        appointments: state.appointments.map((apt) => 
          apt.id === id ? { ...apt, status: 'CANCELED' } : apt
        ),
        currentAppointment: state.currentAppointment?.id === id 
          ? { ...state.currentAppointment, status: 'CANCELED' } 
          : state.currentAppointment
      }));
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error);
      throw error;
    }
  },
  
  // Réinitialiser les erreurs
  clearErrors: () => set({ 
    slotsError: null, 
    appointmentsError: null, 
    currentAppointmentError: null 
  }),
  
  // Réinitialiser complètement l'état
  reset: () => set({
    selectedDoctor: null,
    selectedDate: null,
    selectedSlot: null,
    slots: [],
    slotsLoading: false,
    slotsError: null,
    appointments: [],
    appointmentsLoading: false,
    appointmentsError: null,
    currentAppointment: null,
    currentAppointmentLoading: false,
    currentAppointmentError: null,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: true,
  }),
}));

export default useBookingStore;