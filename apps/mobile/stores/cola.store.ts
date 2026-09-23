import { create } from 'zustand';
import { AppStorage } from '../src/storage/app-storage';

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

export type ColaSlotKey =
  | 'DEPUTADO_FEDERAL'
  | 'DEPUTADO_ESTADUAL'
  | 'SENADOR_1'
  | 'SENADOR_2'
  | 'GOVERNADOR'
  | 'PRESIDENTE';

export const COLA_SLOTS: { key: ColaSlotKey; cargo: string; title: string; digits: number; orderLabel: string }[] = [
  { key: 'DEPUTADO_FEDERAL', cargo: 'DEPUTADO_FEDERAL', title: 'Deputado(a) Federal', digits: 4, orderLabel: '1º A VOTAR' },
  { key: 'DEPUTADO_ESTADUAL', cargo: 'DEPUTADO_ESTADUAL', title: 'Deputado(a) Estadual / Distrital', digits: 5, orderLabel: '2º A VOTAR' },
  { key: 'SENADOR_1', cargo: 'SENADOR', title: 'Senador(a) — 1ª Vaga', digits: 3, orderLabel: '3º A VOTAR' },
  { key: 'SENADOR_2', cargo: 'SENADOR', title: 'Senador(a) — 2ª Vaga', digits: 3, orderLabel: '4º A VOTAR' },
  { key: 'GOVERNADOR', cargo: 'GOVERNADOR', title: 'Governador(a)', digits: 2, orderLabel: '5º A VOTAR' },
  { key: 'PRESIDENTE', cargo: 'PRESIDENTE', title: 'Presidente da República', digits: 2, orderLabel: '6º A VOTAR' },
];

interface ColaState {
  selectedCandidates: Record<string, ColaCandidate>; // Chaves: 'DEPUTADO_FEDERAL', 'DEPUTADO_ESTADUAL', 'SENADOR_1', 'SENADOR_2', 'GOVERNADOR', 'PRESIDENTE'
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  addOrReplaceCandidate: (candidate: ColaCandidate, targetSlot?: ColaSlotKey) => void;
  removeCandidate: (candidateId: string) => void;
  removeCandidateByCargo: (slotOrCargo: string) => void;
  clearCola: () => void;
  saveCola: () => void;
  hydrateCola: () => Promise<void>;
  isCandidateSelected: (candidateId: string) => boolean;
  getCandidateSlot: (candidateId: string) => ColaSlotKey | null;
  getSelectedList: () => ColaCandidate[];
  getCount: () => number;
  hasGeneratedPdfInSession: boolean;
  setHasGeneratedPdfInSession: (val: boolean) => void;
}

const STORAGE_KEY = 'np_cola_eleitoral_v2';
const LEGACY_STORAGE_KEY = 'np_cola_eleitoral_v1';

function normalizeCargoKey(rawCargo: string): ColaSlotKey | null {
  const c = rawCargo.toUpperCase();
  if (c === 'PRESIDENTE') return 'PRESIDENTE';
  if (c === 'GOVERNADOR') return 'GOVERNADOR';
  if (c === 'DEPUTADO_FEDERAL') return 'DEPUTADO_FEDERAL';
  if (c === 'DEPUTADO_ESTADUAL' || c === 'DEPUTADO_DISTRITAL') return 'DEPUTADO_ESTADUAL';
  if (c === 'SENADOR_1') return 'SENADOR_1';
  if (c === 'SENADOR_2') return 'SENADOR_2';
  return null;
}

function parseColaData(raw: string): Record<string, ColaCandidate> {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const result: Record<string, ColaCandidate> = {};
      
      // Migração e normalização de chaves
      for (const [k, v] of Object.entries(parsed)) {
        if (!v || typeof v !== 'object') continue;
        const cand = v as ColaCandidate;
        if (k === 'SENADOR' || k === 'SENADOR_1') {
          result['SENADOR_1'] = cand;
        } else if (k === 'SENADOR_2') {
          result['SENADOR_2'] = cand;
        } else {
          const slot = normalizeCargoKey(k) || normalizeCargoKey(cand.cargo);
          if (slot) {
            result[slot] = cand;
          }
        }
      }
      return result;
    }
  } catch {}
  return {};
}

function loadSavedColaSync(): Record<string, ColaCandidate> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      let raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      }
      if (raw) {
        return parseColaData(raw);
      }
    } catch {}
  }
  return {};
}

function saveColaToStorage(data: Record<string, ColaCandidate>) {
  const serialized = JSON.stringify(data);

  // Web síncrono
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch {}
  }

  // Persistência assíncrona permanente em disco (Mobile nativo)
  AppStorage.setItem(STORAGE_KEY, serialized).catch(() => {});
}

export const useColaStore = create<ColaState>((set, get) => ({
  selectedCandidates: loadSavedColaSync(),
  modalOpen: false,
  hasGeneratedPdfInSession: false,

  setModalOpen: (modalOpen) => set({ modalOpen }),
  setHasGeneratedPdfInSession: (hasGeneratedPdfInSession) => set({ hasGeneratedPdfInSession }),

  hydrateCola: async () => {
    try {
      const raw = await AppStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = parseColaData(raw);
        if (parsed && Object.keys(parsed).length > 0) {
          set((state) => ({
            selectedCandidates: {
              ...parsed,
              ...state.selectedCandidates, // preserva alterações recentes em memória
            },
          }));
        }
      }
    } catch {}
  },

  addOrReplaceCandidate: (candidate, targetSlot) => {
    set((state) => {
      const current = { ...state.selectedCandidates };
      const rawCargo = candidate.cargo.toUpperCase();

      let assignedSlot: ColaSlotKey | null = targetSlot || null;

      if (!assignedSlot) {
        if (rawCargo === 'PRESIDENTE') {
          assignedSlot = 'PRESIDENTE';
        } else if (rawCargo === 'GOVERNADOR') {
          assignedSlot = 'GOVERNADOR';
        } else if (rawCargo === 'DEPUTADO_FEDERAL') {
          assignedSlot = 'DEPUTADO_FEDERAL';
        } else if (rawCargo === 'DEPUTADO_ESTADUAL' || rawCargo === 'DEPUTADO_DISTRITAL') {
          assignedSlot = 'DEPUTADO_ESTADUAL';
        } else if (rawCargo === 'SENADOR' || rawCargo === 'SENADOR_1' || rawCargo === 'SENADOR_2') {
          // Regra de 2 Senadores:
          if (current['SENADOR_1']?.id === candidate.id) {
            assignedSlot = 'SENADOR_1';
          } else if (current['SENADOR_2']?.id === candidate.id) {
            assignedSlot = 'SENADOR_2';
          } else if (!current['SENADOR_1']) {
            assignedSlot = 'SENADOR_1';
          } else if (!current['SENADOR_2']) {
            assignedSlot = 'SENADOR_2';
          } else {
            assignedSlot = 'SENADOR_2';
          }
        }
      }

      if (!assignedSlot) {
        return state;
      }

      // Evita o mesmo candidato duplicado em vagas diferentes de Senador
      if (assignedSlot === 'SENADOR_1' && current['SENADOR_2']?.id === candidate.id) {
        delete current['SENADOR_2'];
      }
      if (assignedSlot === 'SENADOR_2' && current['SENADOR_1']?.id === candidate.id) {
        delete current['SENADOR_1'];
      }

      current[assignedSlot] = {
        ...candidate,
        cargo: assignedSlot.startsWith('SENADOR') ? 'SENADOR' : candidate.cargo,
      };

      saveColaToStorage(current);
      return { selectedCandidates: current };
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

  removeCandidateByCargo: (slotOrCargo) => {
    set((state) => {
      const updated = { ...state.selectedCandidates };
      const key = slotOrCargo.toUpperCase();
      if (updated[key]) {
        delete updated[key];
      } else if (key === 'SENADOR') {
        delete updated['SENADOR_1'];
        delete updated['SENADOR_2'];
      }
      saveColaToStorage(updated);
      return { selectedCandidates: updated };
    });
  },

  clearCola: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    AppStorage.removeItem(STORAGE_KEY).catch(() => {});
    set({ selectedCandidates: {} });
  },

  saveCola: () => {
    const current = get().selectedCandidates;
    saveColaToStorage(current);
  },

  isCandidateSelected: (candidateId) => {
    const map = get().selectedCandidates;
    return Object.values(map).some((c) => c.id === candidateId);
  },

  getCandidateSlot: (candidateId) => {
    const map = get().selectedCandidates;
    for (const [k, v] of Object.entries(map)) {
      if (v?.id === candidateId) return k as ColaSlotKey;
    }
    return null;
  },

  getSelectedList: () => {
    const map = get().selectedCandidates;
    const list: ColaCandidate[] = [];
    for (const slot of COLA_SLOTS) {
      if (map[slot.key]) {
        list.push(map[slot.key]);
      }
    }
    return list;
  },

  getCount: () => {
    return Object.keys(get().selectedCandidates).length;
  },
}));

// Hidratação automática e silenciosa na inicialização
AppStorage.getItem(STORAGE_KEY).then((raw) => {
  if (raw) {
    const parsed = parseColaData(raw);
    if (parsed && Object.keys(parsed).length > 0) {
      useColaStore.setState((state) => ({
        selectedCandidates: {
          ...parsed,
          ...state.selectedCandidates,
        },
      }));
    }
  }
}).catch(() => {});
