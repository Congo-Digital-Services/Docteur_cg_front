import { delay } from '../utils/delay';
import doctors from '../mocks/doctors.json';

export async function searchDoctors({ specialty, city, name }) {
  await delay(500);
  let res = doctors;
  if (specialty) res = res.filter((d) => d.specialty === specialty);
  if (city) res = res.filter((d) => d.city === city);
  if (name) {
    const n = name.toLowerCase();
    res = res.filter((d) => `${d.title} ${d.lastName}`.toLowerCase().includes(n));
  }
  return res;
}

export async function getDoctor(id) {
  await delay(250);
  return doctors.find((d) => d.id === id);
}
