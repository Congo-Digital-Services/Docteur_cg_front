import api from './apiClient';
import * as Location from 'expo-location';

/**
 * Recherche des médecins selon plusieurs critères.
 * Correspond à l'endpoint GET /user/doctor/search
 */
export async function searchDoctors({ specialty, city, name, page = 1, pageSize = 10, lat, lon }) {
  try {
    const params = new URLSearchParams();
    if (specialty) params.append('specializationId', specialty);
    if (city) params.append('city', city);
    if (name) params.append('name', name);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    
    // Utilisation des coordonnées fournies ou récupération de la position actuelle
    if (lat && lon) {
      params.append('lat', lat.toString());
      params.append('lon', lon.toString());
    } else {
      // Récupération de la position actuelle si non fournie
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission de localisation refusée, utilisation des coordonnées par défaut');
          params.append('lat', '-4.2636'); // Brazzaville par défaut
          params.append('lon', '15.2429');
        } else {
          const location = await Location.getCurrentPositionAsync({});
          params.append('lat', location.coords.latitude.toString());
          params.append('lon', location.coords.longitude.toString());
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la localisation:", error);
        params.append('lat', '-4.2636'); // Brazzaville par défaut
        params.append('lon', '15.2429');
      }
    }

    const res = await api.get(`/user/doctor/search?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la recherche de médecins:", error);
    throw error;
  }
}

/**
 * Récupère les détails d'un médecin spécifique.
 * Correspond à l'endpoint GET /user/doctor/one?id=...
 */
export async function getDoctor(id) {
  try {
    if (!id) {
      throw new Error("L'ID du médecin est requis.");
    }
    const res = await api.get(`/user/doctor/one?id=${id}`);
    return res.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du médecin ${id}:`, error);
    throw error;
  }
}

/**
 * Fonction pour obtenir la position actuelle de l'utilisateur
 */
export async function getCurrentPosition() {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }
    
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la position:", error);
    // Retourner les coordonnées par défaut (Brazzaville)
    return {
      latitude: -4.2636,
      longitude: 15.2429,
    };
  }
}