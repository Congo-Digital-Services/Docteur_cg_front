import { create } from 'zustand';
import { searchDoctors as apiSearchDoctors, getDoctor as apiGetDoctor, getCurrentPosition } from '@/services/doctors';

const useDoctorStore = create((set, get) => ({
    // État pour la recherche
    searchResults: [],
    searchLoading: false,
    searchError: null,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: true,
    userLocation: null,

    // État pour le détail d'un médecin
    selectedDoctor: null,
    doctorLoading: false,
    doctorError: null,

    // Actions
    setUserLocation: (location) => set({ userLocation: location }),

    searchDoctors: async (criteria, resetPage = true) => {
        set({ searchLoading: true, searchError: null });
        if (resetPage) {
            set({ currentPage: 1, searchResults: [] });
        }

        try {
            const page = resetPage ? 1 : get().currentPage;
            const userLocation = get().userLocation;
            
            // Utiliser la position de l'utilisateur si disponible
            const searchParams = {
                ...criteria,
                page,
                lat: userLocation?.latitude,
                lon: userLocation?.longitude
            };

            const response = await apiSearchDoctors(searchParams);

            // Le backend retourne un objet avec la structure { total, page, pageSize, results }
            const items = response.results || [];
            const total = response.total || 0;
            const pageSize = response.pageSize || 10;
            const totalPages = Math.ceil(total / pageSize);
            const hasNext = page < totalPages;

            set((state) => ({
                searchResults: resetPage ? items : [...state.searchResults, ...items],
                total,
                totalPages,
                hasMore: hasNext,
                currentPage: page + 1,
                searchLoading: false,
            }));
        } catch (error) {
            let errorMessage = "Une erreur est survenue. Veuillez réessayer.";

            // Gère les erreurs réseau ou serveur
            if (error.response) {
                if (error.response.status >= 500) {
                    errorMessage = "Le service est temporairement indisponible.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                errorMessage = "Problème de connexion. Vérifiez votre réseau.";
            } else {
                errorMessage = error.message; // Erreur locale (ex: validation)
            }

            set({ searchError: errorMessage, searchLoading: false });
        }
    },

    loadMoreDoctors: async (criteria) => {
        const { hasMore, searchLoading } = get();
        if (!hasMore || searchLoading) return;

        // Ne pas réinitialiser les résultats ni la page
        get().searchDoctors(criteria, false);
    },

    getDoctorDetails: async (id) => {
        set({ doctorLoading: true, doctorError: null, selectedDoctor: null });
        try {
            const doctorData = await apiGetDoctor(id);
            set({ selectedDoctor: doctorData, doctorLoading: false });
        } catch (error) {
            set({ doctorError: error.message, doctorLoading: false });
        }
    },

    clearSelectedDoctor: () => {
        set({ selectedDoctor: null, doctorError: null });
    },

    clearSearchResults: () => {
        set({
            searchResults: [],
            currentPage: 1,
            totalPages: 1,
            total: 0,
            hasMore: true,
            searchError: null
        });
    },

    initializeLocation: async () => {
        try {
            const location = await getCurrentPosition();
            set({ userLocation: location });
            return location;
        } catch (error) {
            console.error("Erreur lors de l'initialisation de la localisation:", error);
            return null;
        }
    },
}));

export default useDoctorStore;