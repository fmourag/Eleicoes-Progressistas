import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, Spacing, FontSize } from '../utils/theme';
import { useBreakpoint } from '../utils/responsive';

interface ScoreBarProps {
  label: string;
  score: number;
  color: string;
}

export function ScoreBar({ label, score, color }: ScoreBarProps) {
  const bp = useBreakpoint();
  const colors = useThemeColors();
  const barHeight = bp === 'desktop' ? 24 : 18;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.text }, bp === 'desktop' && styles.labelDesktop]}>{label}</Text>
      <View style={[styles.barBg, { backgroundColor: colors.surfaceAlt, height: barHeight }]}>
        <View
          style={[
            styles.barFill,
            { width: `${score}%`, backgroundColor: color, height: barHeight, borderRadius: barHeight / 2 },
          ]}
        />
      </View>
      <Text style={[styles.value, { color: colors.textMuted }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: Spacing.sm },
  label: { fontSize: FontSize.sm + 1, fontWeight: '600', marginBottom: 2 },
  labelDesktop: { fontSize: FontSize.xl },
  barBg: { borderRadius: 12, overflow: 'hidden' },
  barFill: { position: 'absolute', left: 0, top: 0 },
  value: { fontSize: FontSize.sm, textAlign: 'right', marginTop: Spacing.xs },
});
