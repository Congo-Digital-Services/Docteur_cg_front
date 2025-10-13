import { create } from 'zustand';
import { getActiveSkills as apiGetActiveSkills } from '@/services/skills';

const useSkillStore = create((set, get) => ({
  // État pour les spécialités
  skills: [],
  skillsLoading: false,
  skillsError: null,
  
  // Actions
  fetchSkills: async () => {
    const { skills } = get();
    
    // Si nous avons déjà des spécialités, ne pas recharger
    if (skills.length > 0) return;
    
    set({ skillsLoading: true, skillsError: null });
    
    try {
      const skillsData = await apiGetActiveSkills();
      
      // Transformation des données si nécessaire
      const formattedSkills = skillsData.map(skill => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        isActive: skill.isActive,
        // Ajoutez d'autres propriétés si nécessaire
      }));
      
      set({ 
        skills: formattedSkills, 
        skillsLoading: false 
      });
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors du chargement des spécialités.";
      
      if (error.response) {
        if (error.response.status >= 500) {
          errorMessage = "Le service est temporairement indisponible.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Problème de connexion. Vérifiez votre réseau.";
      } else {
        errorMessage = error.message;
      }
      
      set({ skillsError: errorMessage, skillsLoading: false });
    }
  },
  
  // Réinitialiser les erreurs
  clearSkillsError: () => set({ skillsError: null }),
  
  // Réinitialiser complètement l'état
  resetSkills: () => set({
    skills: [],
    skillsLoading: false,
    skillsError: null
  }),
}));

export default useSkillStore;