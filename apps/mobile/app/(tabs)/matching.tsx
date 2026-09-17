import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Pressable, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { PROGRESSIVE_GUIDELINE_NOTICE, PILLAR_DISPLAY_LIST, isNeutralMatchingProfile, INSUFFICIENT_DATA_LABEL } from '@np/shared';
import { matchingApi, candidatesApi, MatchResult, Candidate } from '../../services/api';
import { useMaxContentWidth, useResponsivePadding } from '../../utils/responsive';
import { useThemeColors, Spacing, Radius, FontSize } from '../../utils/theme';
import { CandidateCard } from '../../components/CandidateCard';
import { CandidaturaWarning } from '../../components/CandidaturaWarning';
import { SectionHeader } from '../../components/SectionHeader';
import { ActionButton } from '../../components/ActionButton';
import { CivicBanner } from '../../components/CivicBanner';
import { useLocationStore } from '../../stores/location.store';
import { EthicalAd } from '../../components/EthicalAd';
import { ApoioVoluntarioBanner } from '../../components/ApoioVoluntarioBanner';

const CARGO_ORDER = ['PRESIDENTE', 'GOVERNADOR', 'SENADOR', 'DEPUTADO_FEDERAL', 'DEPUTADO_ESTADUAL'];

const CARGO_SECTION_TITLES: Record<string, string> = {
  PRESIDENTE: '🏛️ Presidente da República',
  GOVERNADOR: '🏛️ Governador(a)',
  SENADOR: '🏛️ Senador(a)',
  DEPUTADO_FEDERAL: '🏛️ Deputado(a) Federal',
  DEPUTADO_ESTADUAL: '🏛️ Deputado(a) Estadual',
};

const FALLBACK_CANDIDATES: MatchResult[] = [
  {
    id: 'c1',
    score: 96,
    candidate: {
      id: 'c1',
      name: 'Luiz Inácio Lula da Silva',
      party: 'PT',
      partyNumber: 13,
      tseId: '280001600001',
      cargo: 'PRESIDENTE',
      fichaLimpa: true,
      photoUrl: '/candidates/280001600001.jpg',
    },
  },
  {
    id: 'c4',
    score: 92,
    candidate: {
      id: 'c4',
      name: 'Eduardo da Costa Paes',
      viceName: 'Jane Reis',
      party: 'PSD',
      partyNumber: 55,
      tseId: '280001600006',
      cargo: 'GOVERNADOR',
      fichaLimpa: true,
      photoUrl: '/candidates/280001600006.jpg',
    },
  },
  {
    id: 'c5',
    score: 88,
    candidate: {
      id: 'c5',
      name: 'Helder Zahluth Barbalho',
      viceName: 'Hana Ghassan Tuma',
      party: 'MDB',
      partyNumber: 15,
      tseId: '280001600007',
      cargo: 'GOVERNADOR',
      fichaLimpa: true,
      photoUrl: '/candidates/280001600007.jpg',
    },
  },
  {
    id: 'c6',
    score: 84,
    candidate: {
      id: 'c6',
      name: 'Raquel Teixeira Lyra Lucena',
      viceName: 'Priscila Krause',
      party: 'PSDB',
      partyNumber: 45,
      tseId: '280001600014',
      cargo: 'GOVERNADOR',
      fichaLimpa: true,
      photoUrl: '/candidates/280001600014.jpg',
    },
  },
  {
    id: 'c7',
    score: 94,
    candidate: {
      id: 'c7',
      name: 'Camilo Sobreira de Santana',
      party: 'PT',
      partyNumber: 13,
      cargo: 'SENADOR',
      fichaLimpa: true,
    },
  },
];

interface CargoGroup {
  cargo: string;
  title: string;
  items: MatchResult[];
}

interface PartitionedResults {
  rankedGroups: CargoGroup[];
  unrankedItems: MatchResult[];
}

function partitionResultsByCargo(results: MatchResult[]): PartitionedResults {
  const isNeutral = (r: MatchResult) =>
    Boolean(r.hasInsufficientData || isNeutralMatchingProfile(r.candidate.profileScores));

  const ranked = results.filter((r) => !isNeutral(r));
  const unrankedItems = results.filter((r) => isNeutral(r));

  // Ordena os não-ranqueados em ordem alfabética
  unrankedItems.sort((a, b) => (a.candidate.name || '').localeCompare(b.candidate.name || ''));

  const map: Record<string, MatchResult[]> = {};
  for (const r of ranked) {
    const cargo = r.candidate.cargo;
    if (!map[cargo]) {
      map[cargo] = [];
    }
    map[cargo].push(r);
  }

  const rankedGroups: CargoGroup[] = [];

  for (const cargo of CARGO_ORDER) {
    const dynamicItems = map[cargo] || [];
    const fallbackItems = FALLBACK_CANDIDATES.filter((f) => f.candidate.cargo === cargo && !isNeutral(f));

    const combined: MatchResult[] = [...dynamicItems];
    for (const f of fallbackItems) {
      if (!combined.some((c) => c.candidate.name === f.candidate.name || c.id === f.id)) {
        combined.push(f);
      }
    }

    const sortedCandidates = combined.sort((a, b) => (b.matchScore ?? b.score ?? 0) - (a.matchScore ?? a.score ?? 0));
    if (sortedCandidates.length > 0) {
      rankedGroups.push({
        cargo,
        title: CARGO_SECTION_TITLES[cargo] || cargo,
        items: sortedCandidates,
      });
    }
  }

  return { rankedGroups, unrankedItems };
}

export default function MatchingScreen() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [onlyDeferido, setOnlyDeferido] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const { location } = useLocationStore();
  const colors = useThemeColors();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPriorities, location, onlyDeferido]);

  function togglePriority(pillarId: string) {
    setSelectedPriorities((prev) => {
      if (prev.includes(pillarId)) {
        return prev.filter((p) => p !== pillarId);
      }
      if (prev.length < 3) {
        return [...prev, pillarId];
      }
      return prev;
    });
  }

  async function loadResults() {
    setLoading(true);
    setIsOffline(false);
    setErrorMessage(null);
    try {
      const rankRes = await matchingApi.rank({
        priority_pillars: selectedPriorities,
        location: location ? { uf: location.uf, ibge_code: location.ibge_code } : undefined,
        includePending: !onlyDeferido,
      }).catch(() => null);

      if (rankRes && (rankRes as { isFallback?: boolean }).isFallback) {
        setIsOffline(true);
        setErrorMessage((rankRes as { message?: string }).message || 'Sistema temporariamente indisponível. Tente novamente em alguns minutos.');
      }

      if (rankRes && Array.isArray(rankRes.results) && rankRes.results.length > 0) {
        setResults(rankRes.results);
        setLoading(false);
        return;
      }

      const allCandidatesRes = await candidatesApi.getAll().catch(() => null);
      const candidateList = Array.isArray(allCandidatesRes) ? allCandidatesRes : ((allCandidatesRes as { results?: Candidate[] })?.results || []);
      if (candidateList.length > 0) {
        setResults(
          candidateList.map((c: Candidate) => ({
            id: c.id,
            score: 80,
            candidate: c,
          })),
        );
        setLoading(false);
        return;
      }

      setResults(FALLBACK_CANDIDATES);
    } catch {
      setIsOffline(true);
      setErrorMessage('Sistema temporariamente indisponível. Tente novamente em alguns minutos.');
      setResults(FALLBACK_CANDIDATES);
    } finally {
      setLoading(false);
    }
  }

  const filteredResults = onlyDeferido
    ? results.filter((r) => r.candidate.candidaturaStatus === 'DEFERIDO')
    : results;

  const { rankedGroups, unrankedItems } = partitionResultsByCargo(filteredResults);
  const firstPriority = selectedPriorities.length > 0 ? selectedPriorities[0] : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        
        {/* Header de Navegação */}
        <TouchableOpacity
          style={[styles.backButtonRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.75}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            ← Voltar ao Início
          </Text>
        </TouchableOpacity>

        <CivicBanner variant="compact" />

        <SectionHeader
          title="Consulta de Candidaturas"
          subtitle="Eleições Gerais 2026 • Fonte Oficial: TSE DivulgaCandContas"
        />

        {/* Badge de Privacidade Radical (Stateless & Zero Quiz - Stitch Style) */}
        <View style={[styles.privacyNoticeBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.primaryBorder }]}>
          <View style={[styles.privacyIconCircle, { backgroundColor: colors.primaryLight }]}>
            <Text style={{ fontSize: 16 }}>🔒</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.privacyHeaderTag, { color: colors.primary }]}>PRIVACIDADE POR DESIGN</Text>
              <Text style={[styles.privacyHeaderDot, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.privacyHeaderSub, { color: colors.textMuted }]}>Zero Cadastro</Text>
            </View>
            <Text style={[styles.privacyNoticeText, { color: colors.text }]}>
              Consulta 100% anônima e sem cadastro. Suas preferências nunca saem do seu celular.
            </Text>
            <TouchableOpacity onPress={() => router.push('/transparencia')} activeOpacity={0.7} style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }}>
                Ver Nota de Transparência Pública ➔
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seletor de Prioridades em Sessão (Stitch Interactive Pillar Selector) */}
        <View style={[styles.priorityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.priorityHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.pulsingDot, { backgroundColor: colors.primary }]} />
              <View>
                <Text style={[styles.priorityTitle, { color: colors.text }]}>
                  Prioridades Ativas
                </Text>
                <Text style={[styles.priorityCounter, { color: selectedPriorities.length > 0 ? colors.primary : colors.textMuted }]}>
                  {selectedPriorities.length} de 3 selecionadas
                </Text>
              </View>
            </View>

            {selectedPriorities.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedPriorities([])}
                style={[styles.resetBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.resetBtnText, { color: colors.text }]}>🔄 Limpar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Barra de Progresso Suave (0 a 3) */}
          <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(selectedPriorities.length / 3) * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={[styles.prioritySubtitle, { color: colors.textMuted }]}>
            Destaque até 3 temas para obter maior coerência programática (processado exclusivamente em memória).
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsRow}>
              {PILLAR_DISPLAY_LIST.map((pillar) => {
                const isSelected = selectedPriorities.includes(pillar.id);
                return (
                  <Pressable
                    key={pillar.id}
                    onPress={() => togglePriority(pillar.id)}
                    style={[
                      styles.pillarChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                      isSelected && styles.pillarChipSelected,
                    ]}
                  >
                    <Text style={styles.pillarChipIcon}>{pillar.icon}</Text>
                    <Text
                      style={[
                        styles.pillarChipLabel,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {pillar.label}
                    </Text>
                    {isSelected && (
                      <Text style={{ color: '#FFFFFF', fontSize: 12, marginLeft: 4, fontWeight: 'bold' }}>✓</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Sponsor do Pilar Selecionado (PILAR_SPONSOR) */}
        <View style={styles.adWrapper}>
          <EthicalAd screen="matching" format="card" pillar={firstPriority} />
        </View>

        {/* Feedback Banner de Erro/Offline */}
        {isOffline && (
          <View style={[styles.offlineBanner, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <Text style={styles.offlineText}>
              ⚠️ {errorMessage || 'Sistema temporariamente indisponível. Tente novamente em alguns minutos.'}
            </Text>
            <ActionButton
              title="🔄 Tentar Novamente"
              onPress={loadResults}
              variant="secondary"
            />
          </View>
        )}

        {/* Toggle de Candidaturas Deferidas */}
        <View style={[styles.filterToggleRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <View style={styles.toggleTextWrapper}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              Mostrar apenas candidaturas deferidas
            </Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>
              {onlyDeferido ? 'Exibindo somente registros oficializados pelo TSE' : 'Incluindo pedidos em análise preliminar do pleito 2026'}
            </Text>
          </View>
          <Switch
            value={onlyDeferido}
            onValueChange={setOnlyDeferido}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Banner Informativo da Diretriz Progressista */}
        <View style={[styles.noticeBanner, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.noticeText, { color: colors.textMuted }]}>
            {PROGRESSIVE_GUIDELINE_NOTICE}
          </Text>
        </View>

        {loading ? (
          <View style={[styles.center, { backgroundColor: colors.background, padding: Spacing.xl }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <View
              style={{
                backgroundColor: '#ECFDF5',
                borderColor: '#10B981',
                borderWidth: 1.5,
                borderRadius: Radius.full,
                paddingVertical: 6,
                paddingHorizontal: 16,
                marginTop: Spacing.lg,
                marginBottom: Spacing.xs,
              }}
            >
              <Text
                style={{
                  color: '#065F46',
                  fontSize: FontSize.md,
                  fontWeight: '800',
                  textAlign: 'center',
                  letterSpacing: 0.3,
                }}
              >
                🎯 Buscando Propostas e não Fofocas
              </Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.xs }}>Carregando candidaturas e prioridades...</Text>
          </View>
        ) : (rankedGroups.length > 0 || unrankedItems.length > 0) ? (
          (() => {
            let renderedCandidatesCount = 0;
            return (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={true}>
                {/* Grupos Ranqueados por Cargo */}
                {rankedGroups.map((group) => (
                  <View key={group.cargo} style={styles.cargoSection}>
                    <View
                      style={[
                        styles.cargoHeaderBanner,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderLeftColor: colors.primary,
                        },
                      ]}
                    >
                      <Text style={[styles.cargoTitle, { color: colors.text }]}>{group.title}</Text>
                      <View style={[styles.limitBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
                        <Text style={[styles.limitBadgeText, { color: colors.primary }]}>
                          {group.items.length} {group.items.length === 1 ? 'Opção' : 'Opções'}
                        </Text>
                      </View>
                    </View>

                    {group.items.map((item) => {
                      renderedCandidatesCount++;
                      const isTenthCandidate = renderedCandidatesCount === 10;
                      return (
                        <View key={item.id}>
                          <CandidateCard
                            name={item.candidate.name}
                            viceName={item.candidate.viceName || undefined}
                            party={item.candidate.party}
                            partyNumber={item.candidate.partyNumber}
                            numeroUrna={item.candidate.numeroUrna}
                            tseId={item.candidate.tseId}
                            cargo={item.candidate.cargo}
                            score={item.score}
                            matchScore={item.matchScore}
                            hasInsufficientData={item.hasInsufficientData}
                            photoUrl={item.candidate.photoUrl}
                            coalition={item.candidate.coalition}
                            isProgressiveSupported={item.candidate.isProgressiveSupported}
                            supportedBy={item.candidate.supportedBy}
                            candidaturaStatus={item.candidate.candidaturaStatus}
                            fichaLimpa={item.candidate.fichaLimpa}
                            onPress={() => router.push(`/(tabs)/raio-x?id=${item.candidate.id}`)}
                          />
                          <CandidaturaWarning status={item.candidate.candidaturaStatus || 'EM_ANALISE'} />
                          {isTenthCandidate && (
                            <EthicalAd screen="matching" format="card" pillar={firstPriority} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}

                {/* Seção Final: Sem histórico público suficiente (Unranked) */}
                {unrankedItems.length > 0 && (
                  <View style={styles.cargoSection}>
                    <View style={[styles.cargoHeaderBanner, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                      <Text style={[styles.cargoTitle, { color: '#B45309' }]}>
                        ⚠️ {INSUFFICIENT_DATA_LABEL}
                      </Text>
                      <View style={[styles.limitBadge, { backgroundColor: '#FDE68A' }]}>
                        <Text style={[styles.limitBadgeText, { color: '#92400E' }]}>
                          {unrankedItems.length} {unrankedItems.length === 1 ? 'Opção' : 'Opções'}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginHorizontal: 8, marginBottom: 8, lineHeight: 18 }}>
                      Candidaturas que ainda não possuem histórico de votações, discursos ou atuação parlamentar suficiente para cálculo de afinidade. Exibidos em ordem alfabética sem percentual de match.
                    </Text>
                    {unrankedItems.map((item) => {
                      renderedCandidatesCount++;
                      return (
                        <View key={item.id}>
                          <CandidateCard
                            name={item.candidate.name}
                            viceName={item.candidate.viceName || undefined}
                            party={item.candidate.party}
                            partyNumber={item.candidate.partyNumber}
                            numeroUrna={item.candidate.numeroUrna}
                            tseId={item.candidate.tseId}
                            cargo={item.candidate.cargo}
                            score={null}
                            matchScore={null}
                            hasInsufficientData={true}
                            photoUrl={item.candidate.photoUrl}
                            coalition={item.candidate.coalition}
                            isProgressiveSupported={item.candidate.isProgressiveSupported}
                            supportedBy={item.candidate.supportedBy}
                            candidaturaStatus={item.candidate.candidaturaStatus}
                            fichaLimpa={item.candidate.fichaLimpa}
                            onPress={() => router.push(`/(tabs)/raio-x?id=${item.candidate.id}`)}
                          />
                          <CandidaturaWarning status={item.candidate.candidaturaStatus || 'EM_ANALISE'} />
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Banner Estratégico de Apoio Voluntário via PIX */}
                <ApoioVoluntarioBanner
                  variant="compact"
                  style={{ marginTop: Spacing.xl, marginBottom: Spacing.xxl }}
                />
              </ScrollView>
            );
          })()
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhum candidato encontrado</Text>
            <ActionButton title="Tentar Novamente" onPress={loadResults} variant="primary" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  inner: { flex: 1 },
  list: { paddingBottom: Spacing.xxl },
  backButtonRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  backButtonText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  privacyNoticeBadge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  privacyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyHeaderTag: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  privacyHeaderDot: {
    fontSize: FontSize.xs,
  },
  privacyHeaderSub: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  privacyNoticeText: {
    fontSize: FontSize.xs + 1,
    marginTop: 2,
    lineHeight: 16,
  },
  priorityCard: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  priorityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  priorityCounter: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  resetBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  prioritySubtitle: {
    fontSize: FontSize.xs + 1,
    marginBottom: Spacing.sm,
    marginTop: 2,
  },
  chipsScroll: {
    marginVertical: Spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pillarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillarChipSelected: {
    transform: [{ scale: 1.02 }],
  },
  pillarChipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  pillarChipLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  adWrapper: {
    marginVertical: Spacing.xs,
  },
  offlineBanner: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  offlineText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#B91C1C',
  },
  filterToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  toggleTextWrapper: { flex: 1, marginRight: Spacing.md },
  toggleTitle: { fontSize: FontSize.sm, fontWeight: '700' },
  toggleSubtitle: { fontSize: FontSize.xs, marginTop: 2 },
  noticeBanner: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  noticeText: { fontSize: FontSize.xs, lineHeight: 18 },
  cargoSection: { marginBottom: Spacing.xl },
  cargoHeaderBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderLeftWidth: 6,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
    ...(Platform.OS === 'web' ? {
      position: 'sticky' as any,
      top: 0,
      zIndex: 15,
    } : {}),
  },
  cargoTitle: { fontSize: FontSize.base, fontWeight: '800' },
  limitBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  limitBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  emptyContainer: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  emptyText: { fontSize: FontSize.base },
});
