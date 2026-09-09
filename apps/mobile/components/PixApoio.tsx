import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import QRCode from 'qrcode';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';

interface PixApoioProps {
  compact?: boolean;
}

const PRESET_VALUES = [
  { label: 'R$ 5', value: '5.00', desc: 'Ajuda servidores' },
  { label: 'R$ 15', value: '15.00', desc: 'Sincroniza TSE 2026' },
  { label: 'R$ 30', value: '30.00', desc: 'CDN & Infraestrutura' },
  { label: 'Livre', value: '', desc: 'Qualquer quantia' },
];

export function PixApoio({ compact = false }: PixApoioProps) {
  const pixKey = process.env.EXPO_PUBLIC_PIX_KEY;
  const colors = useThemeColors();
  const [selectedValue, setSelectedValue] = useState('15.00');
  const [customValue, setCustomValue] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Gera o QR Code com base na chave PIX
  useEffect(() => {
    if (!pixKey) return;
    QRCode.toDataURL(pixKey, {
      width: 200,
      margin: 2,
      color: {
        dark: '#131B2E',
        light: '#FFFFFF',
      },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [pixKey]);

  // Falha silenciosa se a variável de ambiente não estiver definida
  if (!pixKey) {
    return null;
  }

  async function handleCopyPix() {
    if (!pixKey) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(pixKey);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: colors.tertiaryLight || '#E6F4EA' }]}>
          <Text style={[styles.badgeText, { color: colors.success }]}>🛡️ Financiamento 100% Coletivo</Text>
        </View>
        <View style={[styles.instantBadge, { backgroundColor: colors.secondaryContainer || '#FEF3C7' }]}>
          <Text style={[styles.instantBadgeText, { color: colors.onSecondaryContainer || '#78350F' }]}>Instantâneo</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Apoio Cívico e Independente</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Sem assinatura • Sem cadastro • Sem paywall. Seu apoio é pontual e transparente.
      </Text>

      {/* Seleção de Valores Sugeridos (Grid Stitch) */}
      <Text style={[styles.valuesSectionLabel, { color: colors.textMuted }]}>
        Escolha a cota de impacto:
      </Text>
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
                <Text
                  style={[
                    styles.valuePillText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {p.label}
                </Text>
                <Text style={{ fontSize: 13, color: isSelected ? '#FFFFFF' : colors.textMuted }}>
                  {isSelected ? '✓' : '○'}
                </Text>
              </View>
              <Text
                style={[
                  styles.pillDesc,
                  { color: isSelected ? '#FFFFFF' : colors.textMuted },
                ]}
                numberOfLines={1}
              >
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
            placeholder="Digite o valor desejado"
            placeholderTextColor={colors.textFaint}
            keyboardType="numeric"
            value={customValue}
            onChangeText={setCustomValue}
          />
        </View>
      )}

      {/* QR Code Container (Stitch Plaque Style) */}
      {!compact && qrDataUrl && (
        <View style={[styles.qrWrapper, { backgroundColor: colors.surfaceAlt }]}>
          <View style={[styles.qrPlaque, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
            <Image source={{ uri: qrDataUrl }} style={styles.qrImage} resizeMode="contain" />
          </View>
          <View style={[styles.activePixTag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.activePixDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.activePixText, { color: colors.text }]}>
              PIX Ativo • R$ {selectedValue ? selectedValue.replace('.', ',') : customValue || 'Livre'}
            </Text>
          </View>
          <Text style={[styles.scanHint, { color: colors.textMuted }]}>
            Aponte a câmera do seu banco ou copie a chave abaixo
          </Text>
        </View>
      )}

      {/* Botão Copiar Chave */}
      <TouchableOpacity
        style={[styles.copyButton, { backgroundColor: copied ? colors.success : colors.primary }]}
        onPress={handleCopyPix}
        activeOpacity={0.85}
      >
        <Text style={styles.copyButtonText}>
          {copied ? '✅ Chave PIX Copiada!' : '📋 Copiar Chave PIX'}
        </Text>
      </TouchableOpacity>

      <View style={styles.keyRow}>
        <Text style={[styles.pixKeyDisplay, { color: colors.textMuted }]} numberOfLines={1}>
          Chave direta: <Text style={{ fontFamily: 'monospace', color: colors.text }}>{pixKey}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  instantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  instantBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.xs + 1,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  valuesSectionLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
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
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  qrPlaque: {
    padding: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    elevation: 3,
  },
  qrImage: {
    width: 170,
    height: 170,
  },
  activePixTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  activePixDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activePixText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  scanHint: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  copyButton: {
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  keyRow: {
    alignItems: 'center',
  },
  pixKeyDisplay: {
    fontSize: FontSize.xs,
  },
});
