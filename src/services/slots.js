import { delay } from '../utils/delay';
import slots from '../mocks/slots.json';
import { formatSlotLabel } from '../utils/dates';

export async function getDoctorSlots(doctorId) {
  await delay(400);
  const list = slots.filter((s) => s.doctorId === doctorId).slice(0, 28);
  return list.map((s) => ({ ...s, time: formatSlotLabel(s.iso) }));
}
