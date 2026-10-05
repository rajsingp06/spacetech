import { create } from 'zustand';

const useAppStore = create((set) => ({
  disaster: null,
  selectedZone: null,
  overlays: {
    population: false,
    searchZones: false,
    roads: false,
    damage: false
  },
  setDisaster: (disaster) => set({ disaster }),
  setSelectedZone: (zone) => set({ selectedZone: zone }),
  toggleOverlay: (type) => set((state) => ({
    overlays: {
      ...state.overlays,
      [type]: !state.overlays[type]
    }
  }))
}));

export default useAppStore;
