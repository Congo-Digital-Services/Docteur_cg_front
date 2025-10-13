import api from './apiClient';

/**
 * Récupère les heures d'ouverture d'un médecin.
 * Correspond à l'endpoint GET /user/doctor/openinghour
 */
export async function getDoctorOpeningHours(doctorId) {
  try {
    if (!doctorId) {
      throw new Error("L'ID du médecin est requis.");
    }
    const res = await api.get(`/user/doctor/openinghour?doctorId=${doctorId}`);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des heures d'ouverture:", error);
    throw error;
  }
}

/**
 * Formate les heures d'ouverture en créneaux disponibles
 */
export function formatOpeningHoursToSlots(openingHours) {
  if (!openingHours || openingHours.length === 0) return [];
  
  const slots = [];
  const daysOfWeek = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  
  openingHours.forEach(hour => {
    if (hour.isClosed) return;
    
    const dayName = daysOfWeek[hour.day - 1]; // Conversion de l'index vers le nom du jour
    
    // Convertir les heures en minutes depuis minuit
    const openMinutes = Math.floor(hour.openHour);
    const closeMinutes = Math.floor(hour.closeHour);
    
    // Générer des créneaux de 30 minutes
    for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      slots.push({
        id: `${hour.id}-${minutes}`,
        day: dayName,
        dayIndex: hour.day,
        time: timeString,
        timeMinutes: minutes,
        date: null, // Sera rempli lors de la sélection d'une date
        available: true // Par défaut, tous les créneaux sont disponibles
      });
    }
  });
  
  return slots;
}

/**
 * Génère les créneaux disponibles pour une semaine à partir des heures d'ouverture
 */
export function generateWeeklySlots(openingHours, startDate = new Date()) {
  const allSlots = formatOpeningHoursToSlots(openingHours);
  const weeklySlots = [];
  
  // Générer les créneaux pour les 7 prochains jours
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayIndex = date.getDay(); // 0 = Dimanche, 1 = Lundi, ...
    const adjustedDayIndex = dayIndex === 0 ? 7 : dayIndex; // Ajuster pour que Dimanche = 7
    
    // Filtrer les créneaux pour ce jour
    const daySlots = allSlots.filter(slot => slot.dayIndex === adjustedDayIndex);
    
    // Ajouter la date à chaque créneau
    daySlots.forEach(slot => {
      weeklySlots.push({
        ...slot,
        date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('fr-FR', { month: 'short' })
      });
    });
  }
  
  return weeklySlots;
}