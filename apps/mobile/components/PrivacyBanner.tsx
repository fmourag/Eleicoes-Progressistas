import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';

export function PrivacyBanner() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          🔒 Consulta 100% Anônima • Coleta Zero
        </Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Não perguntamos suas opiniões. Você escolhe os temas de seu interesse; nós mostramos quem se comprometeu com eles.
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
        onPress={() => router.push('/transparencia')}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>
          Ver Nota de Transparência ➔
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.base,
  },
  textContainer: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: 4,
  },
  buttonText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
