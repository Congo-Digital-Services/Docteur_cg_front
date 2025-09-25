import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchDoctors } from '../services/doctors';

const useSearchStore = create(
  persist(
    (set, get) => ({
      filters: { specialty: null, city: null, name: '' },
      results: [],
      loading: false,
      location: null, // {lat, lng} or null

      setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
      setLocation: (loc) => set({ location: loc }),

      run: async () => {
        set({ loading: true });
        try {
          const { filters } = get();
          const res = await searchDoctors(filters);
          set({ results: res, loading: false });
        } catch (e) {
          set({ loading: false });
          throw e;
        }
      }
    }),
    {
      name: 'search',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export default useSearchStore;
