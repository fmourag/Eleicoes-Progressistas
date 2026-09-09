import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../utils/theme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  height = 4,
  color,
  backgroundColor,
}: ProgressBarProps) {
  const colors = useThemeColors();
  const trackBg = backgroundColor ?? colors.primaryLight;
  const fillBg = color ?? colors.primary;

  return (
    <View style={[styles.track, { height, backgroundColor: trackBg, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { height, backgroundColor: fillBg, borderRadius: height / 2 },
          { width: `${Math.min(Math.max(progress, 0), 100)}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0 },
});
