import { View, Text, StyleSheet, Platform, Linking, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActionButton } from '../../components/ActionButton';
import { CivicEmblem } from '../../components/CivicEmblem';
import { GovDisclaimer } from '../../components/GovDisclaimer';
import { useThemeColors, Spacing, Radius, FontSize } from '../../utils/theme';
import { useMaxContentWidth, useResponsivePadding } from '../../utils/responsive';

const OFFICIAL_APK_URL = 'https://eleicoes-progressistas.onrender.com/download/apk';

export default function DownloadApkScreen() {
  const colors = useThemeColors();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  useEffect(() => {
    // Inicia download automaticamente no navegador web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          window.location.href = OFFICIAL_APK_URL;
          setDownloadTriggered(true);
        } catch {
          // Fallback silencioso se o navegador bloquear o redirecionamento
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleManualDownload = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = OFFICIAL_APK_URL;
    } else {
      await Linking.openURL(OFFICIAL_APK_URL).catch(() => {});
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { maxWidth: maxW, padding, backgroundColor: colors.surface, borderColor: colors.border }]}>
        <CivicEmblem size={64} />
        
        <Text style={[styles.title, { color: colors.text }]}>
          📱 Download do Aplicativo Android
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Eleições Progressistas 2026 — Consulta Cívica Independente
        </Text>

        <View style={styles.statusBox}>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.statusText, { color: colors.textMuted }]}>
            {downloadTriggered
              ? 'Download iniciado! Caso não tenha começado, utilize o botão abaixo.'
              : 'Iniciando o download oficial do arquivo APK...'}
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionButton
            title="⬇️ Baixar APK Diretamente"
            variant="primary"
            onPress={handleManualDownload}
          />

          <ActionButton
            title="🌐 Usar no Navegador (Sem Instalar)"
            variant="secondary"
            onPress={() => {
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.location.href = '/';
              } else {
                router.replace('/');
              }
            }}
          />
        </View>

        <View style={styles.instructions}>
          <Text style={[styles.instTitle, { color: colors.text }]}>
            Como instalar no seu celular Android:
          </Text>
          <Text style={[styles.instStep, { color: colors.textMuted }]}>
            1. Ao concluir o download, abra a notificação do arquivo baixado.
          </Text>
          <Text style={[styles.instStep, { color: colors.textMuted }]}>
            2. Se solicitado, permita a instalação a partir do navegador.
          </Text>
          <Text style={[styles.instStep, { color: colors.textMuted }]}>
            3. Toque em "Instalar" para abrir o aplicativo.
          </Text>
        </View>

        <View style={styles.disclaimerWrapper}>
          <GovDisclaimer />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  card: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    flexShrink: 1,
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  instructions: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginBottom: Spacing.md,
  },
  instTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  instStep: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 4,
  },
  disclaimerWrapper: {
    width: '100%',
    marginTop: Spacing.xs,
  },
});
