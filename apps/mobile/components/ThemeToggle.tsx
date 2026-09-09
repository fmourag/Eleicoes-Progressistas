import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../stores/theme.store';
import { useThemeColors, Radius, Spacing, FontSize } from '../utils/theme';

export function ThemeToggle() {
  const { mode, toggleTheme } = useThemeStore();
  const colors = useThemeColors();

  const isDark = mode === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
        },
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}
      accessibilityLabel={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
    >
      <Text style={styles.icon}>{isDark ? '🌙' : '☀️'}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {isDark ? 'Escuro' : 'Claro'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: FontSize.md,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
