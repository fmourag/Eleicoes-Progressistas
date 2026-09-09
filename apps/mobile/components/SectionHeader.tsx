import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, Spacing, FontSize } from '../utils/theme';
import { useBreakpoint } from '../utils/responsive';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const bp = useBreakpoint();
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.primary }, bp === 'desktop' && styles.titleDesktop]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.lg, alignItems: 'center' },
  title: { fontSize: FontSize.hero, fontWeight: 'bold', textAlign: 'center' },
  titleDesktop: { fontSize: 28 },
  subtitle: { fontSize: FontSize.base, textAlign: 'center', marginTop: Spacing.xs },
});
