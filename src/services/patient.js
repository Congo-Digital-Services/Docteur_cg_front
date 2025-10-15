// services/patient.js
import api from './apiClient';

/**
 * Récupère les informations du patient connecté.
 * Correspond à l'endpoint GET /user/patient/read
 */
export async function getPatientData() {
  try {
    console.log("[patient] Récupération des données du patient");
    const res = await api.get('/user/patient/read');
    
    // AJOUT : Log détaillé de la réponse de l'API
    console.log("[patient] Réponse brute de l'API (patient data):", JSON.stringify(res.data, null, 2));
    
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données du patient:", error);
    throw error;
  }
}

/**
 * Crée un profil patient pour l'utilisateur connecté.
 * Correspond à l'endpoint POST /user/patient/create
 */
export async function createPatientProfile() {
  try {
    console.log("[patient] Création du profil patient");
    const res = await api.post('/user/patient/create');
    console.log("[patient] Profil patient créé:", res.data);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création du profil patient:", error);
    throw error;
  }
}