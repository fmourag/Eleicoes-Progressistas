import { create } from 'zustand';

export interface ColaCandidate {
  id: string;
  name: string;
  socialName?: string;
  viceName?: string;
  cargo: string;
  party: string;
  partyNumber?: number;
  numeroUrna: string;
  photoUrl?: string;
  tseId?: string;
  state?: string;
  municipality?: string;
  fichaLimpa?: boolean;
}

interface ColaState {
  selectedCandidates: Record<string, ColaCandidate>; // chave: cargo (ex: 'PRESIDENTE', 'GOVERNADOR', etc.)
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  addOrReplaceCandidate: (candidate: ColaCandidate) => void;
  removeCandidate: (candidateId: string) => void;
  removeCandidateByCargo: (cargo: string) => void;
  clearCola: () => void;
  isCandidateSelected: (candidateId: string) => boolean;
  getSelectedList: () => ColaCandidate[];
  getCount: () => number;
  hasGeneratedPdfInSession: boolean;
  setHasGeneratedPdfInSession: (val: boolean) => void;
}

const STORAGE_KEY = 'np_cola_eleitoral_v1';

function loadSavedCola(): Record<string, ColaCandidate> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {}
  }
  return {};
}

function saveColaToStorage(data: Record<string, ColaCandidate>) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }
}

export const useColaStore = create<ColaState>((set, get) => ({
  selectedCandidates: loadSavedCola(),
  modalOpen: false,
  hasGeneratedPdfInSession: false,

  setModalOpen: (modalOpen) => set({ modalOpen }),
  setHasGeneratedPdfInSession: (hasGeneratedPdfInSession) => set({ hasGeneratedPdfInSession }),

  addOrReplaceCandidate: (candidate) => {
    const cargoKey = candidate.cargo.toUpperCase();
    set((state) => {
      const updated = {
        ...state.selectedCandidates,
        [cargoKey]: candidate,
      };
      saveColaToStorage(updated);
      return { selectedCandidates: updated };
    });
  },

  removeCandidate: (candidateId) => {
    set((state) => {
      const updated = { ...state.selectedCandidates };
      for (const key of Object.keys(updated)) {
        if (updated[key]?.id === candidateId) {
          delete updated[key];
        }
      }
      saveColaToStorage(updated);
      return { selectedCandidates: updated };
    });
  },

  removeCandidateByCargo: (cargo) => {
    const cargoKey = cargo.toUpperCase();
    set((state) => {
      const updated = { ...state.selectedCandidates };
      delete updated[cargoKey];
      saveColaToStorage(updated);
      return { selectedCandidates: updated };
    });
  },

  clearCola: () => {
    saveColaToStorage({});
    set({ selectedCandidates: {} });
  },

  isCandidateSelected: (candidateId) => {
    const map = get().selectedCandidates;
    return Object.values(map).some((c) => c.id === candidateId);
  },

  getSelectedList: () => {
    return Object.values(get().selectedCandidates);
  },

  getCount: () => {
    return Object.keys(get().selectedCandidates).length;
  },
}));
