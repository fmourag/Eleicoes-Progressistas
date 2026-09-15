import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CivicEmblem } from './CivicEmblem';
import { useBreakpoint } from '../utils/responsive';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';

interface CivicBannerProps {
  variant?: 'hero' | 'compact';
  showSubtitle?: boolean;
}

export function CivicBanner({ variant = 'hero', showSubtitle = true }: CivicBannerProps) {
  const bp = useBreakpoint();
  const isDesktop = bp === 'desktop';
  const colors = useThemeColors();

  if (variant === 'compact') {
    return (
      <View
        style={[
          styles.compactContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.compactLeft}>
          <CivicEmblem size={38} />
          <View style={{ marginLeft: Spacing.sm }}>
            <Text style={[styles.compactTitle, { color: colors.text }]}>
              Eleições <Text style={{ color: '#C53030' }}>Progressistas</Text>
            </Text>
            <View style={styles.sloganRow}>
              <View style={styles.emeraldDot} />
              <Text style={[styles.compactSlogan, { color: colors.textSecondary }]}>
                Cheque o passado. <Text style={{ fontWeight: '700', color: colors.text }}>Escolha o futuro.</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.badgesRow}>
          {isDesktop && (
            <>
              <View style={[styles.badgePill, styles.badgePillRed]}>
                <View style={[styles.badgeDot, { backgroundColor: '#DC2626' }]} />
                <Text style={styles.badgeTextRed}>ELEIÇÕES 2026</Text>
              </View>
              <View style={[styles.badgePill, styles.badgePillGreen]}>
                <View style={[styles.badgeDot, { backgroundColor: '#059669' }]} />
                <Text style={styles.badgeTextGreen}>FICHA LIMPA</Text>
              </View>
            </>
          )}
          <View style={[styles.badgePill, styles.badgePillBlue]}>
            <View style={[styles.badgeDot, { backgroundColor: '#2563EB' }]} />
            <Text style={styles.badgeTextBlue}>v2.2.3</Text>
          </View>
        </View>
      </View>
    );
  }

  // Variant 'hero'
  return (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isDesktop ? styles.heroCardDesktop : styles.heroCardMobile,
      ]}
    >
      {/* Bloco do Emblema */}
      <View style={isDesktop ? styles.emblemWrapperDesktop : styles.emblemWrapperMobile}>
        <CivicEmblem size={isDesktop ? 120 : 80} />
      </View>

      {/* Divisória Vertical no Desktop */}
      {isDesktop && <View style={[styles.divider, { backgroundColor: colors.border }]} />}

      {/* Bloco Tipográfico */}
      <View style={isDesktop ? styles.typographyDesktop : styles.typographyMobile}>
        {/* Badges Cívicos */}
        <View style={styles.badgesRow}>
          <View style={[styles.badgePill, styles.badgePillRed]}>
            <View style={[styles.badgeDot, { backgroundColor: '#DC2626' }]} />
            <Text style={styles.badgeTextRed}>ELEIÇÕES 2026</Text>
          </View>

          <View style={[styles.badgePill, styles.badgePillGreen]}>
            <View style={[styles.badgeDot, { backgroundColor: '#059669' }]} />
            <Text style={styles.badgeTextGreen}>FICHA LIMPA</Text>
          </View>

          <View style={[styles.badgePill, styles.badgePillBlue]}>
            <View style={[styles.badgeDot, { backgroundColor: '#2563EB' }]} />
            <Text style={styles.badgeTextBlue}>v2.2.3</Text>
          </View>
        </View>

        {/* Nome da Marca */}
        <Text
          style={[
            styles.brandTitle,
            { color: colors.text },
            isDesktop ? styles.brandTitleDesktop : styles.brandTitleMobile,
          ]}
        >
          Eleições <Text style={{ color: '#C53030' }}>Progressistas</Text>
        </Text>

        {/* Slogan Oficial */}
        <View style={styles.sloganRow}>
          <View style={styles.emeraldDot} />
          <Text
            style={[
              styles.sloganText,
              { color: colors.textSecondary },
              isDesktop ? styles.sloganTextDesktop : styles.sloganTextMobile,
            ]}
          >
            Cheque o passado.{' '}
            <Text style={{ fontWeight: '800', color: colors.text }}>Escolha o futuro.</Text>
          </Text>
        </View>

        {/* Linha de Credibilidade & Subtítulo */}
        {showSubtitle && (
          <View style={styles.credibilityWrapper}>
            <Text style={[styles.credibilityText, { color: colors.textMuted }]}>
              TECNOLOGIA CÍVICA AUDITÁVEL • 100% INDEPENDENTE
            </Text>
            <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
              Classificação oficial e grau de compromisso com os 13 pilares progressistas através de votações nominais e posturas legislativas registradas.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Hero Styles
  heroCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: Spacing.base,
  },
  heroCardDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  heroCardMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  emblemWrapperDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: Spacing.sm,
  },
  emblemWrapperMobile: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  divider: {
    width: 1.5,
    height: 120,
    alignSelf: 'center',
  },
  typographyDesktop: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  typographyMobile: {
    width: '100%',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 6,
    borderWidth: 1,
  },
  badgePillRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  badgePillGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgePillBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeTextRed: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
    letterSpacing: 0.8,
  },
  badgeTextGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.6,
  },
  badgeTextBlue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
    letterSpacing: 0.6,
  },
  brandTitle: {
    fontFamily: 'System',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandTitleDesktop: {
    fontSize: FontSize.xxl + 4,
    lineHeight: FontSize.xxl + 10,
    marginBottom: 4,
  },
  brandTitleMobile: {
    fontSize: FontSize.xl + 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  sloganRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  emeraldDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  sloganText: {
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  sloganTextDesktop: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  sloganTextMobile: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  credibilityWrapper: {
    marginTop: Spacing.xs,
  },
  credibilityText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: FontSize.sm,
    lineHeight: 19,
  },

  // Compact Styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.base,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  compactSlogan: {
    fontSize: FontSize.xs,
  },
});
