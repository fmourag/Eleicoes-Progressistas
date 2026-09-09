import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';

interface PrivacyBadgeProps {
  text?: string;
}

const DEFAULT_TEXT = '🔒 Modo Anônimo: Suas respostas são processadas localmente e nunca vinculadas ao seu CPF ou nome.';

export function PrivacyBadge({ text = DEFAULT_TEXT }: PrivacyBadgeProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.lg,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.base,
    borderWidth: 1,
  },
  text: { fontSize: FontSize.xs, textAlign: 'center' },
});
