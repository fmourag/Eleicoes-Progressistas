import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';

interface FeedbackReturnModalProps {
  visible: boolean;
  onClose: () => void;
  onFeedback: () => void;
}

export function FeedbackReturnModal({
  visible,
  onClose,
  onFeedback,
}: FeedbackReturnModalProps) {
  const colors = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header com Badge e botão fechar */}
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]}>
              <Text style={styles.badgeText}>💬 SUA OPINIÃO IMPORTA</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Fechar aviso"
              accessibilityRole="button"
            >
              <Text style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Ícone Ilustrativo Central */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
              <Text style={styles.iconEmoji}>🗳️</Text>
            </View>
          </View>

          {/* Textos */}
          <View style={styles.body}>
            <Text style={[styles.title, { color: colors.text }]}>
              Ajude-nos com o seu Feedback
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Sua avaliação, sugestões e críticas ajudam a manter a plataforma rápida, transparente e útil para todos os eleitores.
            </Text>
          </View>

          {/* Botões de Ação */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#1B5E20', borderColor: '#2E7D32' }]}
              onPress={onFeedback}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Dar feedback agora"
            >
              <Text style={styles.primaryBtnText}>💬 Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Mais tarde"
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>
                Mais Tarde
              </Text>
            </TouchableOpacity>
          </View>
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
    padding: Spacing.md,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1B5E20',
    letterSpacing: 0.4,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radius.full,
  },
  closeText: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 28,
  },
  body: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    marginTop: Spacing.md,
    gap: Spacing.xs + 2,
  },
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm + 1,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
