import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import {
  PIX_KEY_DISPLAY,
  PIX_KEY_TYPE,
  PIX_AMOUNT,
  PIX_BENEFICIARY_NAME,
  PIX_CITY,
} from '../src/constants/civic-support';
import { generatePixPayload, generatePixQrDataUrl } from '../src/utils/pix-generator';
import { recordContribution } from '../src/storage/civic-support-storage';

interface CivicSupportModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  initialAmount?: number;
}

const PRESET_TIERS = [
  { label: 'R$ 3', value: '3.00', desc: 'Apoio Cívico Básico' },
  { label: 'R$ 5', value: '5.00', desc: 'Servidores & Banco de Dados' },
  { label: 'R$ 15', value: '15.00', desc: 'Sincronização TSE 2026' },
  { label: 'R$ 30', value: '30.00', desc: 'Infraestrutura & CDN' },
  { label: 'Livre', value: '', desc: 'Qualquer quantia' },
];

export function CivicSupportModal({
  visible,
  onClose,
  title = 'Apoio Cívico e Independente',
  initialAmount = PIX_AMOUNT,
}: CivicSupportModalProps) {
  const colors = useThemeColors();
  const [selectedValue, setSelectedValue] = useState(initialAmount.toFixed(2));
  const [customValue, setCustomValue] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const effectiveAmount = selectedValue === '' ? customValue : selectedValue;

  useEffect(() => {
    if (!visible) return;
    const payload = generatePixPayload({ amount: effectiveAmount });
    generatePixQrDataUrl(payload, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [effectiveAmount, visible]);

  async function handleCopyKey() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(PIX_KEY_DISPLAY);
      }
      setCopiedKey(true);
      recordContribution(parseFloat(effectiveAmount) || PIX_AMOUNT);
      setTimeout(() => setCopiedKey(false), 3000);
    } catch {}
  }

  async function handleCopyPayload() {
    try {
      const payload = generatePixPayload({ amount: effectiveAmount });
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(payload);
      }
      setCopiedPayload(true);
      recordContribution(parseFloat(effectiveAmount) || PIX_AMOUNT);
      setTimeout(() => setCopiedPayload(false), 3000);
    } catch {}
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                <Text style={styles.badgeText}>🤝 MANUTENÇÃO CÍVICA</Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
                <Text style={styles.typeBadgeText}>📱 CHAVE {PIX_KEY_TYPE}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Plataforma aberta, sem anúncios comerciais, sem verbas partidárias e sem paywall.
              Sua contribuição voluntária mantém nossos servidores e a apuração em tempo real.
            </Text>

            {/* Presets */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Selecione um valor:</Text>
            <View style={styles.presetsGrid}>
              {PRESET_TIERS.map((tier) => {
                const isSelected = selectedValue === tier.value;
                return (
                  <TouchableOpacity
                    key={tier.label}
                    style={[
                      styles.tierPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedValue(tier.value);
                      if (tier.value !== '') setCustomValue('');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tierTopRow}>
                      <Text style={[styles.tierLabel, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {tier.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: isSelected ? '#FFFFFF' : colors.textMuted }}>
                        {isSelected ? '✓' : '○'}
                      </Text>
                    </View>
                    <Text
                      style={[styles.tierDesc, { color: isSelected ? '#FFFFFF' : colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {tier.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedValue === '' && (
              <View style={[styles.customInputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Text style={[styles.currencyPrefix, { color: colors.textMuted }]}>R$</Text>
                <TextInput
                  style={[styles.customInput, { color: colors.text }]}
                  placeholder="Digite qualquer quantia"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  value={customValue}
                  onChangeText={setCustomValue}
                />
              </View>
            )}

            {/* QR Code */}
            {qrDataUrl && (
              <View style={[styles.qrContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={styles.qrPlaque}>
                  <Image source={{ uri: qrDataUrl }} style={styles.qrImage} resizeMode="contain" />
                </View>
                <View style={styles.qrAmountBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={[styles.qrAmountText, { color: colors.text }]}>
                    PIX: R$ {effectiveAmount ? parseFloat(effectiveAmount).toFixed(2).replace('.', ',') : 'Qualquer valor'}
                  </Text>
                </View>
                <Text style={[styles.scanHint, { color: colors.textMuted }]}>
                  Aponte o leitor de QR Code do aplicativo do seu banco
                </Text>
              </View>
            )}

            {/* Ações de Copiar */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.copyBtnPrimary, { backgroundColor: copiedKey ? '#059669' : colors.primary }]}
                onPress={handleCopyKey}
                activeOpacity={0.85}
              >
                <Text style={styles.copyBtnText}>
                  {copiedKey ? '✅ Chave Copiada!' : `📋 Copiar Chave: ${PIX_KEY_DISPLAY}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.copyBtnSecondary,
                  {
                    backgroundColor: copiedPayload ? '#ECFDF5' : colors.surfaceAlt,
                    borderColor: copiedPayload ? '#059669' : colors.border,
                  },
                ]}
                onPress={handleCopyPayload}
                activeOpacity={0.85}
              >
                <Text style={[styles.copyBtnSecondaryText, { color: copiedPayload ? '#059669' : colors.text }]}>
                  {copiedPayload ? '✅ Código PIX Copiado!' : '⚡ Copiar Código PIX (Copia e Cola)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer de Transparência */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                🔒 Favorecido: <Text style={{ fontWeight: '700', color: colors.text }}>{PIX_BENEFICIARY_NAME}</Text> ({PIX_CITY})
              </Text>
              <Text style={[styles.footerText, { color: colors.textMuted, marginTop: 2 }]}>
                Chave Oficial: <Text style={{ fontFamily: 'monospace', fontWeight: '700', color: colors.primary }}>{PIX_KEY_DISPLAY}</Text>
              </Text>
            </View>
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
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radius.full,
  },
  closeText: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  scrollArea: {
    flexGrow: 0,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tierPill: {
    flex: 1,
    minWidth: '46%',
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  tierTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  tierLabel: {
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  tierDesc: {
    fontSize: FontSize.xs,
  },
  customInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  currencyPrefix: {
    fontSize: FontSize.base,
    fontWeight: '800',
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: 4,
  },
  qrContainer: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  qrPlaque: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 170,
    height: 170,
  },
  qrAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: Spacing.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  qrAmountText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '800',
  },
  scanHint: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  actionButtons: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  copyBtnPrimary: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  copyBtnSecondary: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnSecondaryText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  footer: {
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});
