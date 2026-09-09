import { Stack } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { setAuthToken, api } from '../services/api';
import { useThemeColors } from '../utils/theme';
import { LocationConsentModal } from '../components/LocationConsentModal';

export default function RootLayout() {
  const { token } = useAuthStore();
  const colors = useThemeColors();
  const [isArchiveMode, setIsArchiveMode] = useState(false);

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  useEffect(() => {
    api.get<{ mode: string }>('/api/ops/mode')
      .then((res) => {
        if (res?.mode === 'archive') {
          setIsArchiveMode(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {isArchiveMode && (
        <View style={styles.archiveBanner}>
          <Text style={styles.archiveBannerText}>
            🏛️ Arquivo histórico Eleições 2026 — modo somente leitura
          </Text>
        </View>
      )}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      />
      <LocationConsentModal />
    </>
  );
}

const styles = StyleSheet.create({
  archiveBanner: {
    backgroundColor: '#78350F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  archiveBannerText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
