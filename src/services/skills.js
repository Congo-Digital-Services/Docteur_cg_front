import api from './apiClient';

/**
 * Récupère la liste des spécialités actives.
 * Correspond à l'endpoint GET /skill
 */
export async function getActiveSkills() {
  try {
    const res = await api.get('/skill');
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des spécialités:", error);
    throw error;
  }
}