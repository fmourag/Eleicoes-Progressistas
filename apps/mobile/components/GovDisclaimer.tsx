import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';

interface GovDisclaimerProps {
  compact?: boolean;
}

export function GovDisclaimer({ compact = false }: GovDisclaimerProps) {
  const colors = useThemeColors();

  const handleOpenUrl = (url: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
        },
        compact && styles.containerCompact,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.icon}>🏛️</Text>
        <Text style={[styles.mainText, { color: colors.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Eleições Progressistas</Text> é um aplicativo independente, sem vínculo com o TSE, governo ou partidos. Fonte oficial dos dados:
        </Text>
      </View>

      <View style={styles.linksRow}>
        <TouchableOpacity
          onPress={() => handleOpenUrl('https://www.tse.jus.br')}
          activeOpacity={0.7}
          style={[styles.linkBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>🌐 tse.jus.br ↗</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenUrl('https://dadosabertos.tse.jus.br')}
          activeOpacity={0.7}
          style={[styles.linkBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>📊 dadosabertos.tse.jus.br ↗</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenUrl('https://resultados.tse.jus.br')}
          activeOpacity={0.7}
          style={[styles.linkBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>🗳️ resultados.tse.jus.br ↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    width: '100%',
    alignSelf: 'center',
  },
  containerCompact: {
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  icon: {
    fontSize: 16,
    marginTop: 1,
  },
  mainText: {
    flex: 1,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    justifyContent: 'center',
  },
  linkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  linkText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
