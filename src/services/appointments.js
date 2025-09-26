import { delay } from '../utils/delay';
import baseAppointments from '../mocks/appointments.json';
import baseDoctors from '../mocks/doctors.json';
import baseSlots from '../mocks/slots.json';

let appts = [...baseAppointments]; // in-memory

export async function getMyAppointments() {
  await delay(400);
  
  // Enrichir les rendez-vous avec les données du médecin et du créneau
  return appts.map(appointment => {
    const doctor = baseDoctors.find(d => d.id === appointment.doctorId);
    const slot = baseSlots.find(s => s.id === appointment.slotId);
    
    return {
      ...appointment,
      doctor,
      date: slot?.date || '2024-01-15',
      time: slot?.time || '10:00'
    };
  });
}

export async function createAppointment({ doctorId, slotId }) {
  await delay(600);
  // simulate taken slot
  if (Math.random() < 0.18) {
    const err = new Error('Créneau déjà pris. Essayez un autre créneau.');
    err.code = 'SLOT_TAKEN';
    throw err;
  }
  const newAppt = {
    id: 'a_' + Math.random().toString(36).slice(2),
    doctorId,
    slotId,
    status: 'PENDING'
  };
  appts.unshift(newAppt);
  return newAppt;
}

export async function cancelAppointment(id) {
  await delay(300);
  appts = appts.map((a) => (a.id === id ? { ...a, status: 'DECLINED' } : a));
}
