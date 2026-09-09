import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light', // Padrão: Modo Claro
  setMode: (mode) => set({ mode }),
  toggleTheme: () =>
    set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
}));
