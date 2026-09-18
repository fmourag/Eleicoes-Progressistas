import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Share,
  Pressable,
} from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SHARE_URL = 'https://eleicoes-progressistas.onrender.com/web/';
export const SHARE_MESSAGE =
  'Descobri o Aplicativo Eleições Progressistas, um conjunto de informações para auxiliar na escolha de candidatos, é gratuito e não coleta dados. Acesse em ' +
  SHARE_URL;

export function ShareModal({ visible, onClose }: ShareModalProps) {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  async function handleWhatsApp() {
    const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(SHARE_MESSAGE);
    try {
      await Linking.openURL(url);
    } catch {
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  }

  async function handleEmail() {
    const subject = encodeURIComponent('Conheça o Aplicativo Eleições Progressistas');
    const body = encodeURIComponent(
      'Descobri o Aplicativo Eleições Progressistas, um conjunto de informações para auxiliar na escolha de candidatos, é gratuito e não coleta dados.\n\nAcesse em: ' +
        SHARE_URL,
    );
    const url = 'mailto:?subject=' + subject + '&body=' + body;
    try {
      await Linking.openURL(url);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    }
  }

  async function handleCopy() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SHARE_MESSAGE);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleNativeShare() {
    try {
      if (Platform.OS !== 'web') {
        await Share.share({
          message: SHARE_MESSAGE,
          title: 'Eleições Progressistas',
        });
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Eleições Progressistas',
          text: SHARE_MESSAGE,
          url: SHARE_URL,
        });
      }
    } catch {}
  }

  const hasNativeShare =
    Platform.OS !== 'web' || (typeof navigator !== 'undefined' && Boolean(navigator.share));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={(e: any) => e?.stopPropagation?.()}
        >
          {/* Cabeçalho do Modal */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>📢</Text>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Compartilhar</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Fortaleça a cidadania e o voto consciente
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Pré-visualização da Mensagem */}
          <View
            style={[
              styles.previewBox,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.previewText, { color: colors.text }]}>
              &ldquo;Descobri o Aplicativo Eleições Progressistas, um conjunto de informações para
              auxiliar na escolha de candidatos, é gratuito e não coleta dados. Acesse em{' '}
              <Text
                style={[styles.previewLink, { color: colors.primary }]}
                onPress={() => Linking.openURL(SHARE_URL)}
              >
                {SHARE_URL}
              </Text>
              &rdquo;
            </Text>
          </View>

          {/* Botões de Ação */}
          <View style={styles.actionButtons}>
            {/* WhatsApp */}
            <TouchableOpacity
              style={[styles.shareBtn, styles.whatsappBtn]}
              onPress={handleWhatsApp}
              activeOpacity={0.85}
            >
              <Text style={styles.shareBtnIcon}>💬</Text>
              <Text style={styles.shareBtnText}>Compartilhar no WhatsApp</Text>
            </TouchableOpacity>

            {/* E-mail */}
            <TouchableOpacity
              style={[styles.shareBtn, styles.emailBtn]}
              onPress={handleEmail}
              activeOpacity={0.85}
            >
              <Text style={styles.shareBtnIcon}>✉️</Text>
              <Text style={styles.shareBtnText}>Compartilhar por E-mail</Text>
            </TouchableOpacity>

            {/* Copiar Texto */}
            <TouchableOpacity
              style={[
                styles.shareBtn,
                styles.copyBtn,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: copied ? colors.tertiary : colors.border,
                },
              ]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Text style={styles.shareBtnIcon}>{copied ? '✓' : '📋'}</Text>
              <Text
                style={[
                  styles.copyBtnText,
                  { color: copied ? colors.tertiary : colors.text },
                ]}
              >
                {copied ? 'Mensagem copiada com sucesso!' : 'Copiar mensagem e link'}
              </Text>
            </TouchableOpacity>

            {/* Mais Opções (quando disponível no sistema) */}
            {hasNativeShare && (
              <TouchableOpacity
                style={[
                  styles.shareBtn,
                  styles.moreBtn,
                  {
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleNativeShare}
                activeOpacity={0.7}
              >
                <Text style={styles.shareBtnIcon}>📤</Text>
                <Text style={[styles.moreBtnText, { color: colors.textSecondary }]}>
                  Outras opções de compartilhamento
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
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
    zIndex: 9999,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  previewBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  previewText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  previewLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  actionButtons: {
    gap: Spacing.sm,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.full,
    gap: 8,
  },
  shareBtnIcon: {
    fontSize: 16,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  emailBtn: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  copyBtn: {
    borderWidth: 1,
  },
  copyBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  moreBtn: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  moreBtnText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
});
