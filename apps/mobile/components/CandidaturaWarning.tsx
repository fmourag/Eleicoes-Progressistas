import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CandidaturaStatus } from '@np/shared';
import { useThemeColors, Radius, Spacing, FontSize } from '../utils/theme';

interface CandidaturaWarningProps {
  status: CandidaturaStatus;
}

export function CandidaturaWarning({ status }: CandidaturaWarningProps) {
  const colors = useThemeColors();

  if (status !== 'EM_ANALISE') return null;

  return (
    <View style={[styles.warningBox, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }]}>
      <Text style={styles.warningText}>
        ⚠️ Candidatura em análise pela Justiça Eleitoral
      </Text>
      <Text style={styles.warningSubtext}>
        Esta candidatura ainda não foi oficializada. Os dados podem sofrer alterações até o julgamento do registro.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  warningBox: {
    padding: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  warningText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 2,
  },
  warningSubtext: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
});
