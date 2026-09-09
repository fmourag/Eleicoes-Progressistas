import { create } from 'zustand';

export interface UserLocation {
  uf: string;
  municipality: string;
  ibge_code: string;
  latitude?: number;
  longitude?: number;
}

interface LocationState {
  hasConsented: boolean | null; // null = pendente, true = aceitou, false = recusou
  location: UserLocation | null;
  loading: boolean;
  consentModalVisible: boolean;
  setConsent: (consent: boolean) => void;
  setLocation: (location: UserLocation | null) => void;
  setLoading: (loading: boolean) => void;
  openConsentModal: () => void;
  closeConsentModal: () => void;
  resetLocation: () => void;
}

function loadSavedLocation(): UserLocation | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem('np_user_location');
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return null;
}

function saveLocation(loc: UserLocation | null) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (loc) {
        window.localStorage.setItem('np_user_location', JSON.stringify(loc));
      } else {
        window.localStorage.removeItem('np_user_location');
      }
    } catch {}
  }
}

export const useLocationStore = create<LocationState>((set) => ({
  hasConsented: null,
  location: loadSavedLocation(),
  loading: false,
  consentModalVisible: false,
  setConsent: (hasConsented) => set({ hasConsented }),
  setLocation: (location) => {
    saveLocation(location);
    set({ location });
  },
  setLoading: (loading) => set({ loading }),
  openConsentModal: () => set({ consentModalVisible: true }),
  closeConsentModal: () => set({ consentModalVisible: false }),
  resetLocation: () => {
    saveLocation(null);
    set({ hasConsented: null, location: null, loading: false, consentModalVisible: false });
  },
}));
