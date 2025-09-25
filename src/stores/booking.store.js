import { create } from 'zustand';
import { getDoctorSlots } from '../services/slots';
import { createAppointment, getMyAppointments, cancelAppointment } from '../services/appointments';

const useBookingStore = create((set, get) => ({
  selectedDoctor: null,
  slots: [],
  selectedSlot: null,
  appointments: [],
  loading: false,

  loadSlots: async (doctorId) => {
    set({ loading: true });
    try {
      const data = await getDoctorSlots(doctorId);
      set({ slots: data, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  selectDoctor: (doctor) => set({ selectedDoctor: doctor }),
  selectSlot: (slot) => set({ selectedSlot: slot }),

  book: async () => {
    const { selectedDoctor, selectedSlot } = get();
    if (!selectedDoctor || !selectedSlot) throw new Error('Sélection incomplète');
    const appt = await createAppointment({
      doctorId: selectedDoctor.id,
      slotId: selectedSlot.id
    });
    return appt;
  },

  loadMine: async () => {
    const list = await getMyAppointments();
    set({ appointments: list });
  },

  cancel: async (id) => {
    await cancelAppointment(id);
    await get().loadMine();
  }
}));

export default useBookingStore;
