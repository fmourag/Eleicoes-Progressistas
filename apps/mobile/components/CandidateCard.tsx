import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useBreakpoint } from '../utils/responsive';

import { getCandidatePhotoFallbackChain } from '../services/api';
import { getNumeroUrna } from '@np/shared';
import { useColaStore } from '../stores/cola.store';

interface CandidateCardProps {
  id?: string;
  name: string;
  viceName?: string;
  party: string;
  partyNumber?: number;
  numeroUrna?: string;
  tseId?: string;
  state?: string;
  cargo: string;
  score?: number;
  photoUrl?: string;
  coalition?: string | null;
  isProgressiveSupported?: boolean;
  supportedBy?: string | null;
  candidaturaStatus?: 'EM_ANALISE' | 'DEFERIDO' | 'INDEFERIDO' | 'CASSADO' | 'RENUNCIA';
  fichaLimpa?: boolean;
  onPress?: () => void;
}

function formatCargoLabel(cargo: string, hasVice?: boolean): string {
  const map: Record<string, string> = {
    PRESIDENTE: hasVice ? 'Presidente (Chapa Unificada)' : 'Presidente da República',
    GOVERNADOR: hasVice ? 'Governador(a) (Chapa Unificada)' : 'Governador(a)',
    SENADOR: 'Senador(a)',
    DEPUTADO_FEDERAL: 'Deputado(a) Federal',
    DEPUTADO_ESTADUAL: 'Deputado(a) Estadual',
    PREFEITO: hasVice ? 'Prefeito(a) (Chapa Unificada)' : 'Prefeito(a)',
    VEREADOR: 'Vereador(a)',
  };
  return map[cargo] || cargo.replace(/_/g, ' ');
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0]?.substring(0, 2).toUpperCase() || 'CA';
  return `${parts[0]?.substring(0, 1)}${parts[parts.length - 1]?.substring(0, 1)}`.toUpperCase();
}

export function CandidateCard({
  id,
  name,
  viceName,
  party,
  partyNumber,
  numeroUrna,
  tseId,
  state,
  cargo,
  score,
  photoUrl,
  coalition,
  isProgressiveSupported,
  supportedBy,
  candidaturaStatus = 'EM_ANALISE',
  fichaLimpa,
  onPress,
}: CandidateCardProps) {
  const bp = useBreakpoint();
  const colors = useThemeColors();
  const initials = getInitials(name);

  const fallbackChain = useMemo(() => {
    return getCandidatePhotoFallbackChain({
      photoUrl,
      tseId,
      cargo,
      name,
      id,
      state,
      party,
    });
  }, [photoUrl, tseId, cargo, name, id, state, party]);

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Reinicia o índice quando os dados do candidato mudam
  useEffect(() => {
    setCurrentSourceIndex(0);
    setImageError(false);
  }, [photoUrl, tseId, id]);

  const currentPhoto = fallbackChain[currentSourceIndex] || '';
  const showImage = Boolean(currentPhoto) && !imageError;

  const handleImageError = () => {
    if (currentSourceIndex < fallbackChain.length - 1) {
      setCurrentSourceIndex((prev) => prev + 1);
    } else {
      setImageError(true);
    }
  };

  const { isCandidateSelected, addOrReplaceCandidate, removeCandidate } = useColaStore();
  const selectedForCola = id ? isCandidateSelected(id) : false;

  const isPending = candidaturaStatus === 'EM_ANALISE';
  const votingNumber = numeroUrna || getNumeroUrna({ cargo, partyNumber, party, tseId, name });
  const hasAlliance = isProgressiveSupported || Boolean(supportedBy) || Boolean(coalition);

  function handleToggleCola(e: any) {
    e.stopPropagation?.();
    if (!id) return;
    if (selectedForCola) {
      removeCandidate(id);
    } else {
      addOrReplaceCandidate({
        id,
        name,
        viceName,
        cargo,
        party,
        partyNumber,
        numeroUrna: votingNumber,
        photoUrl: currentPhoto || photoUrl,
        tseId,
        state,
        fichaLimpa,
      });
    }
  }

  const isHighScore = score !== undefined && score >= 85;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selectedForCola && { borderColor: colors.primary, borderWidth: 2 },
        bp !== 'mobile' && styles.cardWide,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Subtle top indicator strip for high affinity / featured */}
      {isHighScore && (
        <View style={[styles.topStrip, { backgroundColor: colors.primary }]} />
      )}

      <View style={styles.contentRow}>
        {/* Photo Avatar or Initials Circle with Urna Badge Overlay */}
        <View style={styles.photoWrapper}>
          <View style={[styles.photoContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.primaryBorder }]}>
            {showImage ? (
              <Image
                source={{ uri: currentPhoto }}
                style={styles.photoImage}
                resizeMode="cover"
                onError={handleImageError}
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.avatarInitials, { color: colors.primary }]}>{initials}</Text>
              </View>
            )}
          </View>
          {fichaLimpa && (
            <View style={[styles.photoBadgeCheck, { backgroundColor: colors.success }]}>
              <Text style={styles.photoBadgeCheckText}>✓</Text>
            </View>
          )}
        </View>

        {/* Main Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.name, { color: colors.text }, bp === 'desktop' && styles.nameDesktop]} numberOfLines={2}>
              {name}
            </Text>
            {score !== undefined && (
              <View style={styles.headerBadgesRow}>
                <View
                  style={[
                    styles.scoreBadge,
                    {
                      backgroundColor: score >= 75 ? colors.primaryLight : score >= 50 ? colors.warningBg : colors.errorBg,
                      borderColor: score >= 75 ? colors.primaryBorder : score >= 50 ? colors.warningBorder : colors.error,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={[styles.scoreText, { color: score >= 75 ? colors.primary : score >= 50 ? colors.warning : colors.error }]}>
                    ⚡ {Math.round(score)}% Match
                  </Text>
                </View>
              </View>
            )}
          </View>

          {viceName ? (
            <Text style={[styles.viceText, { color: colors.textMuted }]} numberOfLines={1}>
              Vice: {viceName}
            </Text>
          ) : null}

          {/* Cargo Label */}
          <Text style={[styles.cargoText, { color: colors.primary }]}>
            {formatCargoLabel(cargo, Boolean(viceName))}
          </Text>

          {/* Party, Urna Voting Number & Candidatura Status Badge */}
          <View style={styles.metaRow}>
            <View style={[styles.partyBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.partyText, { color: colors.text }]}>
                {party} {cargo === 'PRESIDENTE' ? '(Nacional)' : state ? `(${state})` : ''}
              </Text>
            </View>

            {/* Número de Urna Eletrônica */}
            <View style={[styles.urnaBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={styles.urnaBadgeIcon}>🗳️</Text>
              <Text style={[styles.urnaBadgeLabel, { color: colors.textMuted }]}>Urna:</Text>
              <Text style={[styles.urnaBadgeNumber, { color: colors.primary }]}>{votingNumber}</Text>
            </View>

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                isPending
                  ? { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }
                  : { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isPending ? { color: '#B45309' } : { color: '#065F46' },
                ]}
              >
                {isPending ? '🟡 Em Análise' : '🟢 Deferido'}
              </Text>
            </View>
          </View>

          {/* Alliance / Coalition / Support Badge if applicable */}
          {hasAlliance && (
            <View style={[styles.allianceBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.primaryBorder }]}>
              <Text style={[styles.allianceBadgeText, { color: colors.primary }]} numberOfLines={1}>
                🤝 {supportedBy || coalition || 'Apoio de Coligação Progressista'}
              </Text>
            </View>
          )}

          {/* Bottom Card Row: Ficha Limpa & Cola Button */}
          <View style={styles.bottomCardRow}>
            {fichaLimpa ? (
              <View style={[styles.fichaLimpaPill, { backgroundColor: colors.tertiaryLight || '#E6F4EA' }]}>
                <Text style={[styles.fichaLimpa, { color: colors.success }]}>
                  ✓ Ficha Limpa (TSE)
                </Text>
              </View>
            ) : <View />}

            {id ? (
              <TouchableOpacity
                style={[
                  styles.colaBtn,
                  selectedForCola
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                ]}
                onPress={handleToggleCola}
                activeOpacity={0.8}
              >
                <Text style={[styles.colaBtnText, { color: selectedForCola ? '#FFFFFF' : colors.text }]}>
                  {selectedForCola ? '★ Na sua Cola' : '+ Adicionar à Cola'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    elevation: 2,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  topStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardWide: {
    maxWidth: 540,
    alignSelf: 'center',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBadgeCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  photoBadgeCheckText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  detailsContainer: {
    flex: 1,
  },
  fichaLimpaPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.base + 1,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 20,
  },
  nameDesktop: {
    fontSize: FontSize.xl,
  },
  viceText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    marginBottom: 2,
  },
  scoreBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.xs,
    flexShrink: 0,
  },
  scoreText: {
    fontWeight: '800',
    fontSize: FontSize.xs + 1,
  },
  cargoText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 2,
  },
  partyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  partyText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  urnaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  urnaBadgeIcon: {
    fontSize: 11,
  },
  urnaBadgeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#94A3B8',
  },
  urnaBadgeNumber: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  allianceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  allianceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tseText: {
    fontSize: 11,
  },
  fichaLimpa: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  headerBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  bottomCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    paddingTop: 4,
  },
  colaBtn: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexShrink: 0,
  },
  colaBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
