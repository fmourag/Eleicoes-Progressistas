import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { CivicEmblem } from './CivicEmblem';
import { GovDisclaimer } from './GovDisclaimer';
import { APP_VERSION } from '../src/constants/app';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AboutModal({ visible, onClose }: AboutModalProps) {
  const colors = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <CivicEmblem size={52} />
              <Text style={[styles.title, { color: colors.text }]}>Sobre o Eleições Progressistas</Text>
              <Text style={[styles.version, { color: colors.primary }]}>Versão {APP_VERSION}</Text>
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Plataforma cívica sem fins lucrativos desenvolvida para oferecer transparência democrática, matching programático baseado em prioridades e acesso direto aos registros oficiais de candidaturas.
            </Text>

            {/* Disclaimer Universal de Independência e Links Oficiais */}
            <GovDisclaimer />

            <View style={[styles.principlesCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.principlesTitle, { color: colors.text }]}>🛡️ Princípios de Operação:</Text>
              <Text style={[styles.principleItem, { color: colors.textSecondary }]}>• <Text style={{ fontWeight: '700' }}>Coleta Zero:</Text> Nenhuma opinião ou intenção de voto é armazenada.</Text>
              <Text style={[styles.principleItem, { color: colors.textSecondary }]}>• <Text style={{ fontWeight: '700' }}>Matching Independente:</Text> Cálculo 100% local no dispositivo.</Text>
              <Text style={[styles.principleItem, { color: colors.textSecondary }]}>• <Text style={{ fontWeight: '700' }}>Código Aberto:</Text> Totalmente auditável no GitHub.</Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>Entendido</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  scrollContent: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  version: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginTop: 2,
  },
  description: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  principlesCard: {
    width: '100%',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  principlesTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: 4,
  },
  principleItem: {
    fontSize: FontSize.xs - 1,
    lineHeight: 16,
    marginBottom: 2,
  },
  closeBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
