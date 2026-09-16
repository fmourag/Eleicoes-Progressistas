import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { OFFICIAL_PIX_KEY, generatePixPayload, generatePixQrDataUrl } from '../utils/pix';

interface ApoioVoluntarioBannerProps {
  variant?: 'card' | 'compact' | 'strategic';
  style?: any;
  title?: string;
}

const PRESET_VALUES = [
  { label: 'R$ 5', value: '5.00', desc: 'Servidores' },
  { label: 'R$ 15', value: '15.00', desc: 'Sincronização TSE' },
  { label: 'R$ 30', value: '30.00', desc: 'Infraestrutura' },
  { label: 'Livre', value: '', desc: 'Qualquer quantia' },
];

export function ApoioVoluntarioBanner({
  variant = 'card',
  style,
  title = 'Apoio Voluntário para Manutenção do App',
}: ApoioVoluntarioBannerProps) {
  const colors = useThemeColors();
  const [selectedValue, setSelectedValue] = useState('15.00');
  const [customValue, setCustomValue] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isExpanded, setIsExpanded] = useState(variant !== 'compact');

  const effectiveAmount = selectedValue === '' ? customValue : selectedValue;

  useEffect(() => {
    const payload = generatePixPayload({ amount: effectiveAmount });
    generatePixQrDataUrl(payload, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [effectiveAmount]);

  async function handleCopyKey() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(OFFICIAL_PIX_KEY);
      }
      setCopiedKey(true);
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
      setTimeout(() => setCopiedPayload(false), 3000);
    } catch {}
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
        },
        style,
      ]}
    >
      {/* Top Banner Tag */}
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
          <Text style={styles.badgeText}>🤝 MANUTENÇÃO CÍVICA & INDEPENDENTE</Text>
        </View>
        <View style={[styles.pixTag, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
          <Text style={styles.pixTagText}>⚡ PIX DIRETO</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        O <Text style={{ fontWeight: '700', color: colors.primary }}>Eleições Progressistas</Text> é uma plataforma
        sem fins lucrativos, sem verbas partidárias e sem paywall. Sua contribuição voluntária é essencial para pagar os
        servidores, manter o banco de dados sincronizado com o TSE e disponibilizar fotos e propostas para eleitores de
        todo o Brasil.
      </Text>

      {/* Botão de Expansão para modo compacto */}
      {variant === 'compact' && !isExpanded && (
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>✨ Ver QR Code e Contribuir via PIX ➔</Text>
        </TouchableOpacity>
      )}

      {/* Bloco Completo de Doação */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Seletor de Valores */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Escolha uma sugestão de apoio:</Text>
          <View style={styles.valuesGrid}>
            {PRESET_VALUES.map((p) => {
              const isSelected = selectedValue === p.value;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={[
                    styles.valuePill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedValue(p.value);
                    if (p.value !== '') setCustomValue('');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.pillTopRow}>
                    <Text style={[styles.valuePillText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                      {p.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: isSelected ? '#FFFFFF' : colors.textMuted }}>
                      {isSelected ? '✓' : '○'}
                    </Text>
                  </View>
                  <Text style={[styles.pillDesc, { color: isSelected ? '#FFFFFF' : colors.textMuted }]} numberOfLines={1}>
                    {p.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedValue === '' && (
            <View style={[styles.customInputWrapper, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.currencyPrefix, { color: colors.textMuted }]}>R$</Text>
              <TextInput
                style={[styles.customInput, { color: colors.text }]}
                placeholder="Digite qualquer quantia (ex: 20)"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
                value={customValue}
                onChangeText={setCustomValue}
              />
            </View>
          )}

          {/* QR Code Container */}
          {qrDataUrl && (
            <View style={[styles.qrWrapper, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View style={styles.qrPlaque}>
                <Image source={{ uri: qrDataUrl }} style={styles.qrImage} resizeMode="contain" />
              </View>
              <View style={styles.qrValueBadge}>
                <View style={styles.greenPulse} />
                <Text style={[styles.qrValueText, { color: colors.text }]}>
                  PIX: R$ {effectiveAmount ? parseFloat(effectiveAmount).toFixed(2).replace('.', ',') : 'Qualquer valor'}
                </Text>
              </View>
              <Text style={[styles.scanHint, { color: colors.textMuted }]}>
                Aponte a câmera do aplicativo do seu banco para escanear
              </Text>
            </View>
          )}

          {/* Ações de Cópia com 1 Clique */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: copiedKey ? '#059669' : colors.primary }]}
              onPress={handleCopyKey}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>
                {copiedKey ? '✅ Chave PIX Copiada!' : `📋 Copiar Chave: ${OFFICIAL_PIX_KEY}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtnSecondary,
                {
                  backgroundColor: copiedPayload ? '#ECFDF5' : colors.surfaceAlt,
                  borderColor: copiedPayload ? '#059669' : colors.border,
                },
              ]}
              onPress={handleCopyPayload}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionBtnSecondaryText, { color: copiedPayload ? '#059669' : colors.text }]}>
                {copiedPayload ? '✅ Código PIX Copiado!' : '⚡ Copiar Código PIX (Copia e Cola)'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rodapé de Transparência */}
          <View style={styles.footerNote}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              🔒 Favorecido oficial: <Text style={{ fontWeight: '700', color: colors.text }}>Fernando Gonçalves</Text> • Chave:{' '}
              <Text style={{ fontFamily: 'monospace', fontWeight: '700', color: colors.primary }}>{OFFICIAL_PIX_KEY}</Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  pixTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  pixTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.xs + 1,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  expandedContent: {
    marginTop: Spacing.xs,
  },
  sectionLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  valuePill: {
    flex: 1,
    minWidth: '46%',
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  pillTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  valuePillText: {
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  pillDesc: {
    fontSize: FontSize.xs,
  },
  customInputWrapper: {
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
  qrWrapper: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: Spacing.sm,
  },
  greenPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  qrValueText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '800',
  },
  scanHint: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  actionBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondaryText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  footerNote: {
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
