import api from './apiClient';

/**
 * Récupère les rendez-vous du patient connecté.
 * Correspond à l'endpoint GET /user/patient/appointment
 */
export async function getMyAppointments(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.order) queryParams.append('order', params.order);
    
    const res = await api.get(`/user/patient/appointment?${queryParams.toString()}`);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    throw error;
  }
}

/**
 * Récupère les détails d'un rendez-vous spécifique.
 * Correspond à l'endpoint GET /user/patient/appointment/:id
 */
export async function getAppointment(id) {
  try {
    if (!id) {
      throw new Error("L'ID du rendez-vous est requis.");
    }
    const res = await api.get(`/user/patient/appointment/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du rendez-vous ${id}:`, error);
    throw error;
  }
}

/**
 * Crée un nouveau rendez-vous.
 * Correspond à l'endpoint POST /user/patient/appointment
 */
export async function createAppointment(appointmentData) {
  try {
    const res = await api.post('/user/patient/appointment', appointmentData);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 409) {
      const err = new Error('Créneau déjà pris. Essayez un autre créneau.');
      err.code = 'SLOT_TAKEN';
      throw err;
    }
    
    throw error;
  }
}

/**
 * Met à jour un rendez-vous existant.
 * Correspond à l'endpoint PATCH /user/patient/appointment
 */
export async function updateAppointment(appointmentData) {
  try {
    if (!appointmentData.id) {
      throw new Error("L'ID du rendez-vous est requis.");
    }
    const res = await api.patch('/user/patient/appointment', appointmentData);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error);
    throw error;
  }
}

/**
 * Annule un rendez-vous.
 * Correspond à l'endpoint DELETE /user/patient/appointment/:id
 */
export async function cancelAppointment(id) {
  try {
    if (!id) {
      throw new Error("L'ID du rendez-vous est requis.");
    }
    const res = await api.delete(`/user/patient/appointment/${id}`);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous:", error);
    throw error;
  }
}