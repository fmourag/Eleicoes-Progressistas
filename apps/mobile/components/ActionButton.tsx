import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export function ActionButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ActionButtonProps) {
  const colors = useThemeColors();

  const variantStyle = variant === 'secondary'
    ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
    : variant === 'danger'
      ? { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.error }
      : { backgroundColor: colors.primary };

  const textStyle = variant === 'secondary'
    ? { color: colors.text }
    : variant === 'danger'
      ? { color: colors.errorText }
      : { color: '#FFFFFF' };

  return (
    <TouchableOpacity
      style={[styles.button, variantStyle, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    padding: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: { opacity: 0.5 },
  text: { fontSize: FontSize.xl, fontWeight: 'bold' },
});
