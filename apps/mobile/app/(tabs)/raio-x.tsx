import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { candidatesApi, RaioXData, getCandidatePhotoUrl } from '../../services/api';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../../utils/responsive';
import { useThemeColors, Spacing, Radius, FontSize } from '../../utils/theme';
import { searchMandateProposals, extractKeywords, expandKeywords } from '../../utils/civic-search';

import { CandidaturaWarning } from '../../components/CandidaturaWarning';
import { useColaStore } from '../../stores/cola.store';
import { ColaModal } from '../../components/ColaModal';
import { CivicBanner } from '../../components/CivicBanner';
import { ApoioVoluntarioBanner } from '../../components/ApoioVoluntarioBanner';

import { ActionButton } from '../../components/ActionButton';
import {
  getNumeroUrna,
  resolveMandateProposalDetails,
  resolveCandidateMandateProposals,
  MandateProposalDetail,
  buildPillarJustificativa,
} from '@np/shared';

function renderHighlightedText(text: string, queryTerms: string[], defaultColor: string) {
  if (!queryTerms || queryTerms.length === 0 || !text) {
    return <Text style={{ color: defaultColor }}>{text}</Text>;
  }
  const cleanTerms = queryTerms
    .filter((t) => t && t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (cleanTerms.length === 0) {
    return <Text style={{ color: defaultColor }}>{text}</Text>;
  }
  try {
    const regex = new RegExp(`(${cleanTerms.join('|')})`, 'gi');
    const parts = text.split(regex);
    return (
      <Text style={{ color: defaultColor }}>
        {parts.map((part, i) => {
          const isMatch = regex.test(part);
          regex.lastIndex = 0;
          if (isMatch) {
            return (
              <Text
                key={i}
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.3)',
                  color: defaultColor,
                  fontWeight: '700',
                  borderRadius: 2,
                }}
              >
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  } catch {
    return <Text style={{ color: defaultColor }}>{text}</Text>;
  }
}

function formatProposalForSharing(detail: MandateProposalDetail, candName?: string): string {
  return [
    `📜 PROPOSTA DE MANDATO: ${detail.title.toUpperCase()}`,
    candName ? `👤 Candidato(a): ${candName}` : '',
    `🏛️ Âmbito: ${detail.mandatoScope}`,
    `📌 Pilar Temático: ${detail.pillarInfo.label}`,
    '',
    `🎯 DIRETRIZ E DIAGNÓSTICO:`,
    detail.diagnostico,
    `Diretriz Prioritária: ${detail.diretrizes}`,
    '',
    `📋 METAS E AÇÕES PRÁTICAS DO MANDATO:`,
    ...detail.metasAcoes.map((m) => `• ${m}`),
    '',
    `👥 PÚBLICO BENEFICIÁRIO:`,
    detail.beneficiarios,
    '',
    `📍 ABRANGÊNCIA TERRITORIAL:`,
    detail.abrangencia,
    '',
    `📈 IMPACTO ESPERADO:`,
    detail.impacto,
    detail.indicadoresSucesso ? `Indicadores: ${detail.indicadoresSucesso}` : '',
    '',
    `💼 VIABILIDADE ORÇAMENTÁRIA & GOVERNANÇA:`,
    detail.viabilidadeOrcamentaria,
    '',
    `✨ TRADUÇÃO CIDADÃ (O QUE MUDA PARA VOCÊ):`,
    detail.translatedText,
    '',
    `ℹ️ Fonte: Eleições Progressistas 2026 — Transparência e Cidadania`,
  ].filter(Boolean).join('\n');
}

export default function RaioXScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<RaioXData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();
  const isDesktop = bp === 'desktop';

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({ p1: true, p2: true });
  const [showAllPlanEixos, setShowAllPlanEixos] = useState(true);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState<number>(0);
  const [isProposalDropdownOpen, setIsProposalDropdownOpen] = useState(false);
  const [copiedProposalIndex, setCopiedProposalIndex] = useState<number | null>(null);
  const [selectedProposalModal, setSelectedProposalModal] = useState<any | null>(null);
  const [proposalSearchQuery, setProposalSearchQuery] = useState<string>('');

  // Mecanismo de Cola Eleitoral
  const { isCandidateSelected, addOrReplaceCandidate, modalOpen: colaModalOpen, setModalOpen: setColaModalOpen } = useColaStore();
  const selectedForCola = id ? isCandidateSelected(id) : false;

  const togglePillar = (pillarId: string) => {
    setExpandedPillars((prev) => ({
      ...prev,
      [pillarId]: !prev[pillarId],
    }));
  };

  const handleCopyProposal = async (text: string, idx: number) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedProposalIndex(idx);
      setTimeout(() => setCopiedProposalIndex(null), 3000);
    } catch {
      // fallback
    }
  };

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await candidatesApi.getRaioX(id);
      setData(res);
      setIsOffline(Boolean(res?.isOffline));
    } catch (err) {
      console.warn('[RaioXScreen] Erro ao carregar raio-x:', (err as Error).message);
      setIsOffline(true);
      if (!data) {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTse = async () => {
    if (!id) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await candidatesApi.syncTse(id);
      if (res?.success) {
        setSyncMessage('✓ Dados atualizados com o TSE!');
        await loadData();
      } else {
        setSyncMessage(res?.message || 'Sincronização concluída com base local.');
        await loadData();
      }
    } catch {
      setSyncMessage('⚠️ Consulta ao TSE temporariamente indisponível. Exibindo base local.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: Spacing.xl }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <View
          style={{
            backgroundColor: '#ECFDF5',
            borderColor: '#10B981',
            borderWidth: 1.5,
            borderRadius: Radius.full,
            paddingVertical: 6,
            paddingHorizontal: 18,
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
        <Text style={{ color: colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.xs }}>Carregando raio-x e propostas do candidato...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: Spacing.xl }]}>
        <Text style={[styles.errorTitle, { color: colors.errorText || '#DC2626' }]}>
          ⚠️ Erro de Conexão
        </Text>
        <Text style={[styles.errorSubtitle, { color: colors.textMuted }]}>
          {errorMessage || 'Não foi possível carregar os detalhes do candidato.'}
        </Text>
        <ActionButton title="Tentar Novamente" onPress={loadData} variant="primary" style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  const candidate = data.candidate ?? data;
  const name = candidate.name;
  const party = candidate.party;
  const cargo = candidate.cargo;
  const level = candidate.level;
  const fichaLimpa = candidate.fichaLimpa;
  const status = candidate.candidaturaStatus || 'EM_ANALISE';
  const planUrl = candidate.governmentPlanUrl || data.governmentPlanUrl;
  const planSummary = candidate.governmentPlanSummary || data.governmentPlanSummary;
  const photoUrl = candidate.photoUrl || data.photoUrl;
  const tseId = candidate.tseId || data.tseId;
  const resolvedPhoto = getCandidatePhotoUrl(photoUrl, tseId, cargo, name, candidate.id || data.id);

  const isExecutiveCargo = ['PRESIDENTE', 'GOVERNADOR', 'PREFEITO'].includes(cargo);
  const classification = data.classification ?? candidate.classification;
  const governmentPlan = data.governmentPlan || candidate.governmentPlan;

  const votingNumber = candidate.numeroUrna || data.numeroUrna || getNumeroUrna({
    cargo,
    partyNumber: candidate.partyNumber || data.partyNumber,
    party,
    tseId,
    name,
  });

  const rawProposalsList = (data.proposals && data.proposals.length > 0)
    ? data.proposals
    : ((data as any).proposalsRel && (data as any).proposalsRel.length > 0)
    ? (data as any).proposalsRel
    : ((candidate as any)?.proposals && Array.isArray((candidate as any).proposals))
    ? (candidate as any).proposals
    : [];
  const rawProposals = resolveCandidateMandateProposals(rawProposalsList, candidate);

  function handleToggleCola() {
    if (!candidate || !candidate.id) return;
    if (selectedForCola) {
      setColaModalOpen(true);
    } else {
      addOrReplaceCandidate({
        id: candidate.id,
        name: candidate.name,
        socialName: candidate.socialName,
        viceName: candidate.viceName,
        cargo: candidate.cargo,
        party: candidate.party,
        partyNumber: candidate.partyNumber,
        numeroUrna: votingNumber,
        photoUrl: candidate.photoUrl,
        tseId: candidate.tseId,
        state: candidate.state,
        fichaLimpa: candidate.fichaLimpa,
      });
    }
  }

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        <TouchableOpacity
          style={{
            alignSelf: 'flex-start',
            paddingVertical: Spacing.xs,
            paddingHorizontal: Spacing.md,
            borderRadius: Radius.full,
            borderWidth: 1,
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            marginBottom: Spacing.sm,
            marginTop: Spacing.sm,
          }}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={{ color: colors.primary, fontSize: FontSize.sm, fontWeight: '700' }}>← Voltar</Text>
        </TouchableOpacity>

        <CivicBanner variant="compact" />

        {isOffline && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FEF2F2',
              borderColor: '#F87171',
              borderWidth: 1,
              borderRadius: Radius.md,
              paddingVertical: Spacing.xs + 2,
              paddingHorizontal: Spacing.md,
              marginBottom: Spacing.sm,
            }}
          >
            <Text style={{ fontSize: FontSize.xs, color: '#991B1B', fontWeight: '600', flex: 1 }}>
              ⚡ Modo Offline: exibindo dados em cache / locais.
            </Text>
            <TouchableOpacity
              onPress={loadData}
              style={{
                backgroundColor: '#DC2626',
                paddingHorizontal: Spacing.sm,
                paddingVertical: 4,
                borderRadius: Radius.sm,
                marginLeft: Spacing.sm,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Reconectar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.header, { backgroundColor: colors.surfaceAlt, paddingHorizontal: padding }]}>
          <View style={styles.headerRow}>
            {resolvedPhoto ? (
              <View style={[styles.photoContainer, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
                <Image
                  source={{ uri: resolvedPhoto }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              </View>
            ) : null}
            <View style={styles.headerInfo}>
              <Text style={[styles.name, { color: colors.primary }, isDesktop && styles.nameDesktop]}>{name}</Text>
              {candidate.viceName ? (
                <Text style={[styles.viceText, { color: colors.textMuted }]}>
                  Vice: {candidate.viceName}
                </Text>
              ) : null}
              <Text style={[styles.party, { color: colors.textSecondary }]}>
                {party} — {cargo?.replace(/_/g, ' ')}
              </Text>
              {level && <Text style={[styles.level, { color: colors.textFaint }]}>{level}</Text>}
            </View>
          </View>

          {/* Candidatura Status Badge & Ações do TSE */}
          <View style={{ marginTop: Spacing.sm, gap: Spacing.xs }}>
            <CandidaturaWarning status={status} />
            {status === 'DEFERIDO' && (
              <View style={[styles.deferidoBadge, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
                <Text style={styles.deferidoBadgeText}>✓ Candidatura Oficial (Deferida pelo TSE)</Text>
              </View>
            )}

            {tseId && (
              <TouchableOpacity
                style={[styles.tseLinkBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  const stateCode = candidate.state === 'DF' || !candidate.state ? 'BR' : candidate.state;
                  const cleanTseId = tseId.replace(/^tse_/, '');
                  Linking.openURL(`https://divulgacandcontas.tse.jus.br/divulga/#/candidato/2026/2045202026/${stateCode}/${cleanTseId}`);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tseLinkText, { color: colors.primary }]}>
                  🏛️ Ver no Portal DivulgaCandContas (TSE) ↗
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.tseLinkBadge, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Spacing.xs }]}
              onPress={() => {
                Linking.openURL(`https://dadosabertos.tse.jus.br/dataset?q=${encodeURIComponent(candidate.name)}`);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tseLinkText, { color: colors.primary }]}>
                🏛️ Consultar no Portal de Dados Abertos do TSE (Fonte Confiável) ↗
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.syncButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
              onPress={handleSyncTse}
              disabled={syncing}
              activeOpacity={0.8}
            >
              <Text style={[styles.syncButtonText, { color: colors.primary }]}>
                {syncing ? '🔄 Sincronizando com a Justiça Eleitoral...' : '🔄 Sincronizar com Dados Oficiais do TSE'}
              </Text>
            </TouchableOpacity>

            {syncMessage && (
              <Text style={[styles.syncMessageText, { color: colors.successText || '#059669' }]}>
                {syncMessage}
              </Text>
            )}

            {/* Botão de Adicionar / Ver Cola Eleitoral */}
            <TouchableOpacity
              style={[
                styles.colaRaioXBtn,
                selectedForCola
                  ? { backgroundColor: '#047857', borderColor: '#059669' }
                  : { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={handleToggleCola}
              activeOpacity={0.85}
            >
              <Text style={styles.colaRaioXBtnText}>
                {selectedForCola ? '✓ Candidato na sua Cola (Toque para Ver / Gerar PDF)' : '⭐ Adicionar à Minha Cola Eleitoral'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Número Oficial de Votação na Urna Eletrônica */}
        <View style={[styles.urnaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.urnaCardTop}>
            <View style={styles.urnaCardTitleRow}>
              <Text style={styles.urnaIcon}>🗳️</Text>
              <View>
                <Text style={[styles.urnaTitle, { color: colors.text }]}>Número na Urna Eletrônica</Text>
                <Text style={[styles.urnaSubtitle, { color: colors.textMuted }]}>
                  {cargo?.replace(/_/g, ' ')} • {votingNumber.length} {votingNumber.length === 1 ? 'dígito' : 'dígitos'}
                </Text>
              </View>
            </View>
            <View style={[styles.urnaPartyBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.urnaPartyText, { color: colors.primary }]}>{party} {candidate.state ? `(${candidate.state})` : ''}</Text>
            </View>
          </View>

          {/* Teclas Digitadas na Urna */}
          <View style={styles.urnaDigitsContainer}>
            <Text style={styles.urnaInstructionLabel}>TECLE NA URNA:</Text>
            <View style={styles.urnaKeysRow}>
              {votingNumber.split('').map((digit: string, idx: number) => (
                <View key={idx} style={styles.urnaKeyBox}>
                  <Text style={styles.urnaKeyDigit}>{digit}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.urnaHelpBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[styles.urnaHelpText, { color: colors.textSecondary }]}>
              No dia da eleição, digite os <Text style={{ fontWeight: '700', color: colors.primary }}>{votingNumber.length} números</Text> acima no teclado numérico da urna eletrônica, confira a foto de <Text style={{ fontWeight: '700' }}>{name}</Text> na tela e aperte a tecla verde <Text style={{ fontWeight: '800', color: '#059669' }}>CONFIRMA</Text>.
            </Text>
          </View>
        </View>

        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ficha Limpa</Text>
          <View style={[styles.badge, { backgroundColor: fichaLimpa ? colors.successBg : colors.errorBg }]}>
            <Text style={[styles.badgeText, { color: fichaLimpa ? colors.successText : colors.errorText }]}>
              {fichaLimpa ? '✓ Elegível' : '✗ Inelegível'}
            </Text>
          </View>
        </View>

        {/* Pesquisa Eleitoral Homologada & Intenção de Voto */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <View style={styles.pollSectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 2 }]}>
                📊 Intenção de Voto (Pesquisa Homologada)
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Dados oficiais apurados em pesquisas registradas na Justiça Eleitoral (TSE/TREs), realizadas nos últimos 10 dias e auditadas contra vínculos corporativistas, financeiros, partidários, sindicais ou com mídias parciais.
              </Text>
            </View>
          </View>

          {data.pollResult?.hasEligiblePoll && data.pollResult.poll ? (
            <View style={[styles.pollCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Badge de Homologação e Independência */}
              <View style={styles.pollBadgeRow}>
                <View style={[styles.pollTseBadge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                  <Text style={styles.pollTseBadgeText}>✓ TSE: {data.pollResult.poll.tseRegistro}</Text>
                </View>
                <View style={[styles.pollAgeBadge, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
                  <Text style={styles.pollAgeBadgeText}>
                    🕒 {data.pollResult.audit.diasDivulgacao === 0 ? 'Divulgada hoje' : `Divulgada há ${data.pollResult.audit.diasDivulgacao} dia(s)`} (≤ 10 dias)
                  </Text>
                </View>
              </View>

              {/* Destaque Principal: Percentual e Diferença em Relação ao Líder */}
              <View style={[styles.pollMainScoreCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={styles.pollScoreHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pollCargoLabel, { color: colors.textSecondary }]}>
                      Intenção de Voto Estimulada para {cargo?.replace(/_/g, ' ')}
                    </Text>
                    <Text style={[styles.pollCandidateNameHighlight, { color: colors.primary }]}>
                      {name}
                    </Text>
                  </View>
                  <View style={styles.pollScoreBigBadge}>
                    <Text style={styles.pollScoreBigValue}>
                      {data.pollResult.candidatePercentual?.toFixed(1).replace('.', ',')}%
                    </Text>
                    <Text style={styles.pollScoreBigUnit}>votos</Text>
                  </View>
                </View>

                {/* Diferença em Relação ao Mais Votado */}
                {data.pollResult.diferenca && (
                  <View
                    style={[
                      styles.pollDiffContainer,
                      data.pollResult.isLeader
                        ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }
                        : { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
                    ]}
                  >
                    <Text style={styles.pollDiffIcon}>
                      {data.pollResult.isLeader ? '🏆' : '📉'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.pollDiffTitle,
                          { color: data.pollResult.isLeader ? '#065F46' : '#92400E' },
                        ]}
                      >
                        {data.pollResult.isLeader ? 'Vantagem sobre o 2º Colocado' : 'Diferença em Relação ao Mais Votado'}
                      </Text>
                      <Text
                        style={[
                          styles.pollDiffText,
                          { color: data.pollResult.isLeader ? '#047857' : '#B45309' },
                        ]}
                      >
                        {data.pollResult.diferenca.texto}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Card Perspectiva de Eleição */}
                {data.pollResult.perspectiva && (
                  <View
                    style={[
                      styles.pollPerspectiveContainer,
                      data.pollResult.perspectiva.status === 'PROVAVEL'
                        ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }
                        : data.pollResult.perspectiva.status === 'EM_DISPUTA'
                        ? { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }
                        : { backgroundColor: '#FEF2F2', borderColor: '#FECDD3' },
                    ]}
                  >
                    {/* Header do Card com Título e Sinalizador */}
                    <View style={styles.pollPerspectiveHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <Text style={styles.pollPerspectiveTitleIcon}>🎯</Text>
                        <Text
                          style={[
                            styles.pollPerspectiveMainTitle,
                            {
                              color:
                                data.pollResult.perspectiva.status === 'PROVAVEL'
                                  ? '#065F46'
                                  : data.pollResult.perspectiva.status === 'EM_DISPUTA'
                                  ? '#92400E'
                                  : '#991B1B',
                            },
                          ]}
                        >
                          Perspectiva de Eleição
                        </Text>
                      </View>

                      {/* Sinalizador: Provável, Em Disputa, Remota */}
                      <View
                        style={[
                          styles.pollPerspectiveBadge,
                          data.pollResult.perspectiva.status === 'PROVAVEL'
                            ? { backgroundColor: '#059669' }
                            : data.pollResult.perspectiva.status === 'EM_DISPUTA'
                            ? { backgroundColor: '#D97706' }
                            : { backgroundColor: '#DC2626' },
                        ]}
                      >
                        <Text style={styles.pollPerspectiveBadgeText}>
                          {data.pollResult.perspectiva.status === 'PROVAVEL'
                            ? '🟢 PROVÁVEL'
                            : data.pollResult.perspectiva.status === 'EM_DISPUTA'
                            ? '🟡 EM DISPUTA'
                            : '🔴 REMOTA'}
                        </Text>
                      </View>
                    </View>

                    {/* Resumo de Parâmetros Analíticos: Vagas e Tendência 30 dias */}
                    <View style={styles.pollPerspectiveMetricsRow}>
                      <View style={styles.pollPerspectiveMetricChip}>
                        <Text style={styles.pollPerspectiveMetricLabel}>🏛️ VAGAS NO CARGO</Text>
                        <Text style={styles.pollPerspectiveMetricValue}>
                          {data.pollResult.perspectiva.vagasDisponiveis === 1
                            ? '1 vaga (Majoritária)'
                            : `${data.pollResult.perspectiva.vagasDisponiveis} vagas (Renovação de 2/3)`}
                        </Text>
                      </View>

                      <View style={styles.pollPerspectiveMetricChip}>
                        <Text style={styles.pollPerspectiveMetricLabel}>📈 TENDÊNCIA (30 DIAS)</Text>
                        <Text style={styles.pollPerspectiveMetricValue}>
                          {data.pollResult.perspectiva.tendencia30Dias.variacaoPontoPercentual !== undefined
                            ? `${data.pollResult.perspectiva.tendencia30Dias.variacaoPontoPercentual >= 0 ? '+' : ''}${data.pollResult.perspectiva.tendencia30Dias.variacaoPontoPercentual.toFixed(1).replace('.', ',')} p.p. (${data.pollResult.perspectiva.tendencia30Dias.direcao === 'ALTA' ? 'Crescimento' : data.pollResult.perspectiva.tendencia30Dias.direcao === 'QUEDA' ? 'Queda' : 'Estável'})`
                            : 'Estável (Consolidada)'}
                        </Text>
                      </View>
                    </View>

                    {/* Justificativa Fundamentada do Sinalizador */}
                    <View
                      style={[
                        styles.pollPerspectiveJustifyBox,
                        {
                          backgroundColor:
                            data.pollResult.perspectiva.status === 'PROVAVEL'
                              ? '#F0FDF4'
                              : data.pollResult.perspectiva.status === 'EM_DISPUTA'
                              ? '#FFFBEB'
                              : '#FFF1F2',
                          borderColor:
                            data.pollResult.perspectiva.status === 'PROVAVEL'
                              ? '#BBF7D0'
                              : data.pollResult.perspectiva.status === 'EM_DISPUTA'
                              ? '#FDE68A'
                              : '#FECDD3',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pollPerspectiveJustifyTitle,
                          {
                            color:
                              data.pollResult.perspectiva.status === 'PROVAVEL'
                                ? '#065F46'
                                : data.pollResult.perspectiva.status === 'EM_DISPUTA'
                                ? '#92400E'
                                : '#991B1B',
                          },
                        ]}
                      >
                        ⚖️ Justificativa do Sinalizador:
                      </Text>
                      <Text
                        style={[
                          styles.pollPerspectiveJustifyText,
                          {
                            color:
                              data.pollResult.perspectiva.status === 'PROVAVEL'
                                ? '#047857'
                                : data.pollResult.perspectiva.status === 'EM_DISPUTA'
                                ? '#B45309'
                                : '#B91C1C',
                          },
                        ]}
                      >
                        {data.pollResult.perspectiva.justificativa}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Gráfico Comparativo de Votação dos Principais Concorrentes */}
              <View style={styles.pollCandidatesList}>
                <Text style={[styles.pollListTitle, { color: colors.textSecondary }]}>
                  Cenário Completo da Pesquisa no Cargo ({data.pollResult.poll.instituto}):
                </Text>

                {data.pollResult.poll.candidatos.map((cand, idx) => {
                  const isCurrentCandidate =
                    data.pollResult?.ranking === idx + 1 ||
                    cand.candidateName.toLowerCase().includes(name.toLowerCase().split(' ')[0]);
                  const isLeaderItem = idx === 0;

                  return (
                    <View key={idx} style={styles.pollCandidateRow}>
                      <View style={styles.pollCandInfoRow}>
                        <Text
                          style={[
                            styles.pollCandName,
                            { color: isCurrentCandidate ? colors.primary : colors.text },
                            isCurrentCandidate && { fontWeight: '700' },
                          ]}
                        >
                          {idx + 1}º {cand.candidateName} {cand.party ? `(${cand.party})` : ''}
                          {isCurrentCandidate ? ' ★ VOCÊ ESTÁ VENDO' : ''}
                        </Text>
                        <Text
                          style={[
                            styles.pollCandPercent,
                            { color: isCurrentCandidate ? colors.primary : colors.text },
                            isCurrentCandidate && { fontWeight: '800' },
                          ]}
                        >
                          {cand.percentual.toFixed(1).replace('.', ',')}%
                        </Text>
                      </View>

                      {/* Barra de Proporção */}
                      <View style={[styles.pollBarBg, { backgroundColor: colors.surfaceAlt }]}>
                        <View
                          style={[
                            styles.pollBarFill,
                            {
                              width: `${Math.min(100, Math.max(2, (cand.percentual / (data.pollResult?.leader?.percentual || 50)) * 100))}%`,
                              backgroundColor: isCurrentCandidate
                                ? colors.primary
                                : isLeaderItem
                                ? '#10B981'
                                : '#94A3B8',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Quem Realizou a Pesquisa */}
              <View style={[styles.pollDetailCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={styles.pollDetailHeader}>
                  <Text style={styles.pollDetailIcon}>🏢</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pollDetailSectionTitle, { color: colors.text }]}>
                      Quem Realizou a Pesquisa
                    </Text>
                    <Text style={[styles.pollDetailSectionSubtitle, { color: colors.textMuted }]}>
                      Identificação do instituto executor, responsabilidade estatística e origem dos recursos.
                    </Text>
                  </View>
                </View>

                <View style={styles.pollDetailBody}>
                  <View style={styles.pollDetailItem}>
                    <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Instituto Executor:</Text>
                    <Text style={[styles.pollDetailValue, { color: colors.text }]}>
                      {data.pollResult.poll.quemRealizou?.instituto || data.pollResult.poll.instituto}
                    </Text>
                    {data.pollResult.poll.quemRealizou?.razaoSocial && (
                      <Text style={[styles.pollDetailSubValue, { color: colors.textMuted }]}>
                        Razão Social: {data.pollResult.poll.quemRealizou.razaoSocial}
                        {data.pollResult.poll.quemRealizou.cnpj ? ` • CNPJ: ${data.pollResult.poll.quemRealizou.cnpj}` : ''}
                      </Text>
                    )}
                  </View>

                  <View style={styles.pollDetailItem}>
                    <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Estatístico(a) Responsável:</Text>
                    <Text style={[styles.pollDetailValue, { color: colors.text }]}>
                      {data.pollResult.poll.quemRealizou?.estatisticoResponsavel || 'Profissional habilitado pelo CONRE'}
                      {data.pollResult.poll.quemRealizou?.registroConre ? ` (${data.pollResult.poll.quemRealizou.registroConre})` : ''}
                    </Text>
                  </View>

                  <View style={styles.pollDetailItem}>
                    <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Contratante / Financiador:</Text>
                    <Text style={[styles.pollDetailValue, { color: colors.text }]}>
                      {data.pollResult.poll.quemRealizou?.contratante || data.pollResult.poll.contratante}
                    </Text>
                    {data.pollResult.poll.quemRealizou?.origemRecursos && (
                      <Text style={[styles.pollDetailSubValue, { color: '#047857' }]}>
                        ✓ {data.pollResult.poll.quemRealizou.origemRecursos}
                      </Text>
                    )}
                  </View>

                  <View style={styles.pollDetailItem}>
                    <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Registro Oficial na Justiça Eleitoral:</Text>
                    <Text style={[styles.pollDetailValue, { color: colors.primary, fontWeight: '800' }]}>
                      {data.pollResult.poll.tseRegistro} (Sistema PesqEle - TSE)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Como Foi Feita a Pesquisa (Metodologia e Amostragem) */}
              <View style={[styles.pollDetailCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={styles.pollDetailHeader}>
                  <Text style={styles.pollDetailIcon}>🔬</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pollDetailSectionTitle, { color: colors.text }]}>
                      Como Foi Feita a Pesquisa (Metodologia)
                    </Text>
                    <Text style={[styles.pollDetailSectionSubtitle, { color: colors.textMuted }]}>
                      Procedimento técnico de coleta, critérios de amostragem probabilística e controle de qualidade.
                    </Text>
                  </View>
                </View>

                <View style={styles.pollDetailBody}>
                  <View style={styles.pollDetailItem}>
                    <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Metodologia de Coleta:</Text>
                    <Text style={[styles.pollDetailValue, { color: colors.text }]}>
                      {data.pollResult.poll.comoFoiFeita?.metodologiaColeta || 'Entrevistas individuais presenciais (face a face) com aplicação de questionário estruturado.'}
                    </Text>
                  </View>

                  <View style={styles.pollDetailItem}>
                    <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Plano Amostral & Abrangência:</Text>
                    <Text style={[styles.pollDetailValue, { color: colors.text }]}>
                      {data.pollResult.poll.comoFoiFeita?.planoAmostral || 'Amostragem probabilística estratificada com base no Censo IBGE e dados oficiais do TSE.'}
                    </Text>
                  </View>

                  {data.pollResult.poll.comoFoiFeita?.estratificacao && (
                    <View style={styles.pollDetailItem}>
                      <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Controle por Cotas Demográficas:</Text>
                      <Text style={[styles.pollDetailValue, { color: colors.text }]}>
                        {data.pollResult.poll.comoFoiFeita.estratificacao}
                      </Text>
                    </View>
                  )}

                  {/* Grid de Métricas Científicas */}
                  <View style={styles.pollScientificGrid}>
                    <View style={[styles.pollScientificBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.pollScientificLabel, { color: colors.textMuted }]}>Amostra</Text>
                      <Text style={[styles.pollScientificNum, { color: colors.primary }]}>
                        {data.pollResult.poll.amostra.toLocaleString('pt-BR')}
                      </Text>
                      <Text style={[styles.pollScientificUnit, { color: colors.textSecondary }]}>entrevistas</Text>
                    </View>

                    <View style={[styles.pollScientificBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.pollScientificLabel, { color: colors.textMuted }]}>Margem de Erro</Text>
                      <Text style={[styles.pollScientificNum, { color: '#059669' }]}>
                        ± {data.pollResult.poll.margemErro.toFixed(1).replace('.', ',')}
                      </Text>
                      <Text style={[styles.pollScientificUnit, { color: colors.textSecondary }]}>pontos percentuais</Text>
                    </View>

                    <View style={[styles.pollScientificBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.pollScientificLabel, { color: colors.textMuted }]}>Confiança</Text>
                      <Text style={[styles.pollScientificNum, { color: '#3B82F6' }]}>
                        {data.pollResult.poll.nivelConfianca}%
                      </Text>
                      <Text style={[styles.pollScientificUnit, { color: colors.textSecondary }]}>grau de certeza</Text>
                    </View>
                  </View>

                  <View style={styles.pollDetailItem}>
                    <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Período de Campo (Coleta):</Text>
                    <Text style={[styles.pollDetailValue, { color: colors.text }]}>
                      {data.pollResult.poll.periodoCampo} (concluída há {data.pollResult.audit.diasDivulgacao === 0 ? 'menos de 24h' : `${data.pollResult.audit.diasDivulgacao} dia(s)`})
                    </Text>
                  </View>

                  <View style={styles.pollDetailItem}>
                    <Text style={[styles.pollDetailLabel, { color: colors.textSecondary }]}>Fiscalização e Controle de Qualidade:</Text>
                    <Text style={[styles.pollDetailValue, { color: colors.text }]}>
                      {data.pollResult.poll.comoFoiFeita?.controleQualidade || 'Auditoria amostral independente em pelo menos 15% dos questionários aplicados.'}
                    </Text>
                  </View>

                  {/* Auditoria Ética */}
                  <View style={styles.pollAntiBiasAudit}>
                    <Text style={styles.pollAntiBiasText}>
                      ✓ <Text style={{ fontWeight: '700' }}>Auditoria de Isenção Ética:</Text> Pesquisa sem contratação por partidos, mercado financeiro, entidades patronais ou sindicais, governos, ONGs ou mídias corporativas e com histórico de viés tendencioso.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Alerta transparente caso não haja pesquisa qualificada no prazo de 10 dias */
            <View style={[styles.pollEmptyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={styles.pollEmptyIcon}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pollEmptyTitle, { color: colors.text }]}>
                  Pesquisas Sujeitas ao Filtro Estrito de Independência
                </Text>
                <Text style={[styles.pollEmptyText, { color: colors.textSecondary }]}>
                  Não há pesquisa eleitoral nos últimos 10 dias homologada no TSE/TREs para este cargo que atenda cumulativamente a todos os critérios de isenção e independência (livre de financiamento de partidos, bancos/mercado financeiro, sindicatos, entidades patronais, governos e veículos parciais).
                </Text>
                <Text style={[styles.pollEmptySubtext, { color: colors.textMuted }]}>
                  Para preservar a integridade da informação do eleitor, levantamentos antigos ou com conflito de interesse comprovado não são exibidos.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Grau de Comprometimento com os 13 Pilares Ideológicos */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🏛️ Grau de Comprometimento com os 13 Pilares
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Classificação auditável apurada com base em posturas históricas, pronunciamentos oficiais na tribuna e votações públicas nominais.
          </Text>

          {/* Card Resumo Geral */}
          {classification && (
            <View style={[styles.overallCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View style={styles.overallHeaderRow}>
                <View style={styles.overallScoreCircle}>
                  <Text style={styles.overallScoreNum}>{classification.overallScore}%</Text>
                  <Text style={styles.overallScoreLabel}>Índice Geral</Text>
                </View>
                <View style={styles.overallTextWrap}>
                  <Text style={[styles.overallRatingTitle, { color: colors.primary }]}>
                    {classification.overallRating}
                  </Text>
                  <Text style={[styles.overallSummaryText, { color: colors.textSecondary }]}>
                    {classification.summary}
                  </Text>
                </View>
              </View>

              {/* Barra de Progresso Geral */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, Math.max(0, classification.overallScore))}%`,
                      backgroundColor:
                        classification.overallScore >= 85
                          ? '#10B981'
                          : classification.overallScore >= 70
                          ? '#3B82F6'
                          : '#F59E0B',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Lista dos 13 Pilares com Evidências Auditáveis */}
          <View style={styles.pillarsList}>
            {(classification?.pillars ?? []).map((p) => {
              const isExpanded = expandedPillars[p.pillarId] ?? false;
              const barColor =
                p.score >= 90
                  ? '#10B981'
                  : p.score >= 80
                  ? '#3B82F6'
                  : p.score >= 65
                  ? '#F59E0B'
                  : '#6B7280';

              return (
                <View
                  key={p.pillarId}
                  style={[styles.pillarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <TouchableOpacity
                    style={styles.pillarCardHeader}
                    onPress={() => togglePillar(p.pillarId)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.pillarTitleRow}>
                      <Text style={styles.pillarIconBig}>{p.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.pillarName, { color: colors.text }]}>{p.label}</Text>
                        <Text
                          style={[styles.pillarDesc, { color: colors.textMuted }]}
                          numberOfLines={isExpanded ? undefined : 1}
                        >
                          {p.description}
                        </Text>
                      </View>
                      <View style={styles.pillarScoreBadge}>
                        <Text style={[styles.pillarScoreText, { color: barColor }]}>{p.score}%</Text>
                        <Text style={[styles.pillarRatingTag, { color: barColor }]}>{p.rating}</Text>
                      </View>
                    </View>

                    {/* Barra de progresso visual por pilar */}
                    <View style={styles.pillarBarBg}>
                      <View
                        style={[
                          styles.pillarBarFill,
                          { width: `${p.score}%`, backgroundColor: barColor },
                        ]}
                      />
                    </View>

                    <Text style={[styles.toggleText, { color: colors.primary }]}>
                      {isExpanded
                        ? '▲ Ocultar Evidências (Votações, Falas e Posturas)'
                        : '▼ Ver Evidências de Votações, Pronunciamentos e Posturas'}
                    </Text>
                  </TouchableOpacity>

                  {/* Evidências Documentadas */}
                  {isExpanded && (
                    <View
                      style={[
                        styles.evidencesBox,
                        { borderTopColor: colors.border, backgroundColor: colors.surfaceAlt },
                      ]}
                    >
                      {/* === JUSTIFICATIVA DO PERCENTUAL DE COMPROMETIMENTO === */}
                      {(() => {
                        const just = (p as any).justificativa || buildPillarJustificativa({
                          pillarId: p.pillarId,
                          label: p.label,
                          score: p.score,
                          rating: p.rating,
                          party: candidate.party,
                          candidateName: candidate.name,
                        });

                        return (
                          <View style={[styles.justificativaCard, { backgroundColor: colors.surface, borderColor: `${barColor}66` }]}>
                            {/* Cabeçalho da Justificativa com Tag de Pontuação */}
                            <View style={styles.justificativaHeaderRow}>
                              <View style={styles.justificativaTitleCol}>
                                <View style={styles.justificativaTitleRow}>
                                  <Text style={styles.justificativaIcon}>⚖️</Text>
                                  <Text style={[styles.justificativaTitle, { color: colors.text }]}>
                                    Justificativa do Comprometimento
                                  </Text>
                                </View>
                                <Text style={[styles.justificativaSubtitle, { color: colors.textMuted }]}>
                                  Critérios técnicos e auditoria cívica que fundamentam a pontuação de {p.score}% ({p.rating})
                                </Text>
                              </View>
                              <View style={[styles.justificativaScoreTag, { backgroundColor: `${barColor}15`, borderColor: barColor }]}>
                                <Text style={[styles.justificativaScoreNum, { color: barColor }]}>{p.score}%</Text>
                                <Text style={[styles.justificativaScoreRating, { color: barColor }]}>{p.rating}</Text>
                              </View>
                            </View>

                            {/* Resumo Explicativo Fundamentado */}
                            <View style={[styles.justificativaResumoBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                              <Text style={[styles.justificativaResumoText, { color: colors.text }]}>
                                {just.resumo}
                              </Text>
                            </View>

                            {/* Por que o candidato está afastado de 100% de comprometimento */}
                            {just.gap100 > 0 ? (
                              <View style={[styles.gapBox, { backgroundColor: `${barColor}10`, borderColor: `${barColor}40` }]}>
                                <View style={styles.gapHeaderRow}>
                                  <View style={styles.gapTitleRow}>
                                    <Text style={styles.gapIcon}>⚠️</Text>
                                    <Text style={[styles.gapTitle, { color: colors.text }]}>
                                      Por que está afastado de 100% de Comprometimento?
                                    </Text>
                                  </View>
                                  <View style={[styles.gapBadge, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                                    <Text style={styles.gapBadgeText}>Gap: -{just.gap100}%</Text>
                                  </View>
                                </View>

                                <Text style={[styles.gapMotivoText, { color: colors.text }]}>
                                  {just.motivoAfastamento100}
                                </Text>

                                {just.pontosAfastamento && just.pontosAfastamento.length > 0 && (
                                  <View style={styles.gapPointsList}>
                                    {just.pontosAfastamento.map((pt: string, pIdx: number) => (
                                      <View key={pIdx} style={styles.gapPointRow}>
                                        <Text style={styles.gapPointBullet}>✕</Text>
                                        <Text style={[styles.gapPointText, { color: colors.textSecondary }]}>
                                          {pt}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                )}
                              </View>
                            ) : (
                              <View style={[styles.gapBox, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                                <View style={styles.gapHeaderRow}>
                                  <View style={styles.gapTitleRow}>
                                    <Text style={styles.gapIcon}>✓</Text>
                                    <Text style={[styles.gapTitle, { color: '#065F46' }]}>
                                      Comprometimento Pleno (100%)
                                    </Text>
                                  </View>
                                </View>
                                <Text style={[styles.gapMotivoText, { color: '#047857' }]}>
                                  {just.motivoAfastamento100}
                                </Text>
                              </View>
                            )}

                            {/* Ponderação dos Critérios Auditados */}
                            <Text style={[styles.criteriosHeading, { color: colors.text }]}>
                              📊 Memória de Cálculo e Pesos dos Critérios Auditados:
                            </Text>
                            <View style={styles.criteriosGrid}>
                              {just.criterios.map((crit: any, cIdx: number) => {
                                const critColor =
                                  crit.pontuacao >= 90
                                    ? '#10B981'
                                    : crit.pontuacao >= 80
                                    ? '#3B82F6'
                                    : crit.pontuacao >= 65
                                    ? '#F59E0B'
                                    : '#6B7280';

                                return (
                                  <View key={cIdx} style={[styles.criterioItemCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                                    <View style={styles.criterioTopRow}>
                                      <Text style={[styles.criterioItemName, { color: colors.text }]}>{crit.nome}</Text>
                                      <View style={styles.criterioBadgesWrap}>
                                        <View style={[styles.pesoPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                          <Text style={[styles.pesoPillText, { color: colors.textMuted }]}>Peso {crit.peso}%</Text>
                                        </View>
                                        <View style={[styles.scorePill, { backgroundColor: `${critColor}20`, borderColor: critColor }]}>
                                          <Text style={[styles.scorePillText, { color: critColor }]}>{crit.pontuacao}%</Text>
                                        </View>
                                        <View style={[styles.aderenciaPill, { backgroundColor: `${critColor}15`, borderColor: critColor }]}>
                                          <Text style={[styles.aderenciaPillText, { color: critColor }]}>{crit.aderencia}</Text>
                                        </View>
                                      </View>
                                    </View>
                                    <Text style={[styles.criterioItemDetail, { color: colors.textSecondary }]}>
                                      {crit.detalhe}
                                    </Text>
                                  </View>
                                );
                              })}
                            </View>

                            {/* Fórmula e Metodologia Auditável */}
                            <View style={[styles.formulaBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                              <Text style={[styles.formulaTitle, { color: colors.primary }]}>
                                📐 {just.formula}
                              </Text>
                              <Text style={[styles.metodologiaNotice, { color: colors.textMuted }]}>
                                ℹ️ {just.metodologia}
                              </Text>
                            </View>
                          </View>
                        );
                      })()}
                      {/* 1. Votações Públicas Nominais */}
                      <View style={styles.evidenceGroup}>
                        <Text style={[styles.evidenceGroupTitle, { color: colors.text }]}>
                          🗳️ Votações Públicas Nominais no Parlamento
                        </Text>
                        {p.evidencias.votacoes.map((v, i) => (
                          <View key={i} style={styles.evidenceItemRow}>
                            <Text style={styles.evidenceBullet}>✓</Text>
                            <Text style={[styles.evidenceItemText, { color: colors.textSecondary }]}>
                              {v}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* 2. Pronunciamentos Oficiais */}
                      <View style={styles.evidenceGroup}>
                        <Text style={[styles.evidenceGroupTitle, { color: colors.text }]}>
                          📢 Pronunciamentos & Discursos na Tribuna
                        </Text>
                        {p.evidencias.pronunciamentos.map((pr, i) => (
                          <View key={i} style={styles.evidenceItemRow}>
                            <Text style={styles.evidenceBullet}>•</Text>
                            <Text style={[styles.evidenceItemText, { color: colors.textSecondary }]}>
                              {pr}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* 3. Posturas & Proposições */}
                      <View style={styles.evidenceGroup}>
                        <Text style={[styles.evidenceGroupTitle, { color: colors.text }]}>
                          📜 Posturas, Projetos de Lei e Diretrizes
                        </Text>
                        {p.evidencias.posturas.map((pos, i) => (
                          <View key={i} style={styles.evidenceItemRow}>
                            <Text style={styles.evidenceBullet}>•</Text>
                            <Text style={[styles.evidenceItemText, { color: colors.textSecondary }]}>
                              {pos}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Plano Oficial de Governo (TSE) para Cargos Executivos */}
        {isExecutiveCargo && (
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <View style={styles.planHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                📋 Plano Oficial de Governo (TSE)
              </Text>
              <View style={[styles.tseStatusChip, { backgroundColor: '#E0F2FE', borderColor: '#38BDF8' }]}>
                <Text style={[styles.tseStatusChipText, { color: '#0369A1' }]}>✓ Registro Eleitoral Obrigatório</Text>
              </View>
            </View>

            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Diretrizes programáticas de governo apresentadas perante a Justiça Eleitoral (Eleições Gerais 2026).
            </Text>

            <View style={[styles.planCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.planTitleMain, { color: colors.primary }]}>
                {governmentPlan?.titulo || `Diretrizes do Plano de Governo — ${name}`}
              </Text>
              
              <Text style={[styles.planSummary, { color: colors.text }]}>
                {governmentPlan?.resumo || planSummary || 'O Plano de Governo reúne as diretrizes econômicas, sociais e administrativas oficiais apresentadas à Justiça Eleitoral.'}
              </Text>

              {/* Lista dos Eixos Estruturados do Plano */}
              {governmentPlan?.eixos && governmentPlan.eixos.length > 0 && (
                <View style={styles.planEixosContainer}>
                  <View style={styles.planEixosHeaderRow}>
                    <Text style={[styles.planEixosTitle, { color: colors.text }]}>
                      🏛️ Eixos e Metas Estratégicas do Governo ({governmentPlan.eixos.length} Eixos):
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAllPlanEixos(!showAllPlanEixos)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.toggleEixosText, { color: colors.primary }]}>
                        {showAllPlanEixos ? 'Recolher Eixos ▲' : 'Expandir Eixos ▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showAllPlanEixos && (
                    <View style={styles.planEixosList}>
                      {governmentPlan.eixos.map((eixo: any, idx: number) => (
                        <View
                          key={idx}
                          style={[styles.planEixoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                          <View style={styles.planEixoTop}>
                            <Text style={styles.planEixoIcon}>{eixo.icone}</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.planEixoBadge, { color: colors.primary }]}>{eixo.eixo}</Text>
                              <Text style={[styles.planEixoName, { color: colors.text }]}>{eixo.titulo}</Text>
                            </View>
                          </View>
                          <View style={styles.planEixoBullets}>
                            {eixo.detalhes.map((det: string, dIdx: number) => (
                              <View key={dIdx} style={styles.planEixoBulletRow}>
                                <Text style={styles.planEixoBulletDot}>•</Text>
                                <Text style={[styles.planEixoBulletText, { color: colors.textSecondary }]}>{det}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Ações e aviso de sincronização */}
              <View style={styles.planFooterActions}>
                <View style={[styles.tseNoticeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.tseNoticeText, { color: colors.textMuted }]}>
                    ℹ️ A íntegra das diretrizes programáticas oficiais está transcrita e auditável acima diretamente pelo aplicativo.
                  </Text>
                </View>

                {planUrl ? (
                  <TouchableOpacity
                    style={[styles.planButton, { backgroundColor: colors.primary }]}
                    onPress={() => Linking.openURL(planUrl)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.planButtonText}>Acessar Registro no Portal DivulgaCand (TSE) ↗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {data.votingHistory && data.votingHistory.length > 0 && (
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Histórico de Votos</Text>
            {isDesktop ? (
              <View style={styles.desktopGrid}>
                {data.votingHistory.map((v, i) => (
                  <View key={i} style={[styles.voteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.voteProject, { color: colors.text }]}>{v.project}</Text>
                    <Text style={[styles.voteValue, { color: colors.textMuted }]}>{v.vote}</Text>
                  </View>
                ))}
              </View>
            ) : (
              data.votingHistory.map((v, i) => (
                <View key={i} style={[styles.voteRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.voteProject, { color: colors.text }]}>{v.project}</Text>
                  <Text style={[styles.voteValue, { color: colors.textMuted }]}>{v.vote}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Seção de Propostas Legislativas e Programáticas */}
        {rawProposals && rawProposals.length > 0 && (() => {
          const allResolvedProposals = rawProposals.map((p: any) => resolveMandateProposalDetails(p, candidate));
          const searchResults = proposalSearchQuery.trim()
            ? searchMandateProposals(proposalSearchQuery, allResolvedProposals)
            : [];
          const queryTerms = proposalSearchQuery.trim()
            ? expandKeywords(extractKeywords(proposalSearchQuery))
            : [];

          const selectedIdx = Math.min(Math.max(0, selectedProposalIndex), rawProposals.length - 1);
          const detail = allResolvedProposals[selectedIdx];
          const pillarInfo = detail.pillarInfo;

          return (
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <View style={styles.proposalsHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 2 }]}>
                    📜 Propostas de Mandato do Candidato
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted, marginBottom: Spacing.sm }]}>
                    Selecione a proposta no seletor abaixo para consultar o plano de mandato detalhado.
                  </Text>
                </View>
                <View style={[styles.proposalsCountBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Text style={[styles.proposalsCountText, { color: colors.primary }]}>
                    {rawProposals.length} {rawProposals.length === 1 ? 'Proposta' : 'Propostas'}
                  </Text>
                </View>
              </View>

              {/* Card Único de Proposta com Seletor Integrado */}
              <View
                style={[
                  styles.unifiedProposalCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Campo de Busca: Pergunte à Proposta de Mandato */}
                <View style={[styles.proposalSearchBox, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.border }]}>
                  <View style={styles.proposalSearchHeader}>
                    <Text style={[styles.proposalSearchLabel, { color: colors.text }]}>
                      🔍 Pergunte à Proposta de Mandato
                    </Text>
                    {proposalSearchQuery.trim() ? (
                      <TouchableOpacity
                        onPress={() => setProposalSearchQuery('')}
                        style={styles.proposalSearchClearBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[styles.proposalSearchClearText, { color: colors.primary }]}>✕ Limpar</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={[styles.proposalSearchInputWrapper, { backgroundColor: colors.surface, borderColor: proposalSearchQuery ? colors.primary : colors.border }]}>
                    <Text style={styles.proposalSearchInputIcon}>🔍</Text>
                    <TextInput
                      style={[styles.proposalSearchInput, { color: colors.text }]}
                      placeholder="Ex: saneamento, creches, tarifa zero, impostos..."
                      placeholderTextColor={colors.textMuted}
                      value={proposalSearchQuery}
                      onChangeText={(text: string) => {
                        setProposalSearchQuery(text);
                        if (text.trim()) {
                          const res = searchMandateProposals(text, allResolvedProposals);
                          if (res.length > 0) {
                            setSelectedProposalIndex(res[0].proposalIndex);
                          }
                        }
                      }}
                    />
                  </View>

                  {/* Feedback Visual Instantâneo */}
                  {proposalSearchQuery.trim() ? (
                    searchResults.length > 0 ? (
                      <View style={[styles.proposalSearchFeedbackCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                        <View style={styles.proposalSearchFeedbackTop}>
                          <View style={[styles.proposalSearchBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.proposalSearchBadgeText}>
                              🎯 {searchResults[0].relevanceScore}% de correlação com sua pergunta
                            </Text>
                          </View>
                          <Text style={[styles.proposalSearchCount, { color: colors.textMuted }]}>
                            {searchResults.length} {searchResults.length === 1 ? 'proposta correlacionada' : 'propostas correlacionadas'}
                          </Text>
                        </View>
                        <Text style={[styles.proposalSearchSnippet, { color: colors.text }]}>
                          ❝ {searchResults[0].matchedSnippet} ❞
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.proposalSearchEmptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.proposalSearchEmptyTitle, { color: colors.text }]}>
                          Nenhuma meta explícita encontrada para "{proposalSearchQuery}"
                        </Text>
                        <Text style={[styles.proposalSearchEmptyDesc, { color: colors.textMuted }]}>
                          O plano cadastrado não possui metas explícitas sobre esse termo específico. Você pode consultar o Plano Oficial de Governo do TSE na íntegra via link externo no final desta página.
                        </Text>
                      </View>
                    )
                  ) : null}
                </View>

                {/* Seletor de Propostas via Menu Suspenso (Dropdown) */}
                <View style={[styles.proposalDropdownContainer, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.border }]}>
                  <Text style={[styles.proposalDropdownInstruction, { color: colors.textMuted }]}>
                    SELECIONE A PROPOSTA DE MANDATO:
                  </Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.proposalDropdownTrigger,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isProposalDropdownOpen ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setIsProposalDropdownOpen(!isProposalDropdownOpen)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.proposalDropdownTriggerLeft}>
                      <Text style={styles.proposalDropdownTriggerIcon}>{pillarInfo.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.proposalDropdownTriggerPillar, { color: colors.primary }]}>
                          {detail.pillar.toUpperCase()} • {pillarInfo.label}
                        </Text>
                        <Text style={[styles.proposalDropdownTriggerTitle, { color: colors.text }]} numberOfLines={1}>
                          {detail.title}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.proposalDropdownArrowBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <Text style={[styles.proposalDropdownArrow, { color: colors.primary }]}>
                        {isProposalDropdownOpen ? '▲' : '▼'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Menu Suspenso Aberto */}
                  {isProposalDropdownOpen && (
                    <View style={[styles.proposalDropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      {rawProposals.map((propItem: any, idx: number) => {
                        const itemDetail = resolveMandateProposalDetails(propItem, candidate);
                        const isSelected = idx === selectedIdx;
                        const matchForThis = searchResults.find((r) => r.proposalIndex === idx);
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.proposalDropdownMenuItem,
                              {
                                backgroundColor: isSelected ? (colors.surfaceAlt || 'rgba(0,0,0,0.04)') : 'transparent',
                                borderBottomColor: idx === rawProposals.length - 1 ? 'transparent' : colors.border,
                              },
                            ]}
                            onPress={() => {
                              setSelectedProposalIndex(idx);
                              setIsProposalDropdownOpen(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.proposalMenuItemIcon}>{itemDetail.pillarInfo.icon}</Text>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[styles.proposalMenuItemPillar, { color: isSelected ? colors.primary : colors.textMuted }]}>
                                  {itemDetail.pillar.toUpperCase()} • {itemDetail.pillarInfo.label}
                                </Text>
                                {matchForThis ? (
                                  <Text style={[styles.proposalDropdownMatchBadge, { color: colors.primary }]}>
                                    🎯 {matchForThis.relevanceScore}%
                                  </Text>
                                ) : null}
                              </View>
                              <Text style={[styles.proposalMenuItemTitle, { color: colors.text, fontWeight: isSelected ? '800' : '600' }]}>
                                {itemDetail.title}
                              </Text>
                            </View>
                            {isSelected ? (
                              <View style={[styles.proposalMenuItemCheck, { backgroundColor: colors.primary }]}>
                                <Text style={styles.proposalMenuItemCheckText}>✓</Text>
                              </View>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Conteúdo Completo da Proposta Selecionada */}
                <View style={styles.unifiedProposalBody}>
                  {/* Cabeçalho da Proposta */}
                  <View style={styles.proposalCardHeader}>
                    <View style={[styles.proposalPillarTag, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <Text style={styles.proposalPillarIcon}>{pillarInfo.icon}</Text>
                      <Text style={[styles.proposalPillarLabel, { color: colors.primary }]}>
                        {detail.pillar.toUpperCase()} • {pillarInfo.label}
                      </Text>
                    </View>
                    <View style={[styles.proposalNumberTag, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <Text style={[styles.proposalNumberTagText, { color: colors.textMuted }]}>
                        Proposta {selectedIdx + 1} de {rawProposals.length}
                      </Text>
                    </View>
                  </View>

                  {/* Título Principal com Highlight */}
                  <Text style={[styles.unifiedProposalTitle, { color: colors.text }]}>
                    {renderHighlightedText(detail.title, queryTerms, colors.text)}
                  </Text>

                  {/* Box de Detalhamento do Mandato */}
                  <View style={[styles.proposalDetailsBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    
                    {/* Âmbito & Competência do Mandato */}
                    <View style={[styles.mandatoScopeTag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={styles.mandatoScopeTagIcon}>🏛️</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.mandatoScopeTagLabel, { color: colors.primary }]}>
                          {detail.mandatoScope}
                        </Text>
                        <Text style={[styles.mandatoScopeCompetencia, { color: colors.textMuted }]}>
                          {detail.competenciaMandato}
                        </Text>
                      </View>
                    </View>

                    {/* Diagnóstico & Diretriz com Highlight */}
                    <View style={styles.proposalSectionBlock}>
                      <Text style={[styles.proposalSectionBadgeTitle, { color: colors.primary }]}>
                        🎯 Diretriz e Diagnóstico do Mandato
                      </Text>
                      <Text style={[styles.proposalDiagnosticoText, { color: colors.textSecondary }]}>
                        {renderHighlightedText(detail.diagnostico, queryTerms, colors.textSecondary)}
                      </Text>
                      <View style={[styles.proposalDiretrizCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.proposalDiretrizLabel, { color: colors.textMuted }]}>Diretriz Prioritária:</Text>
                        <Text style={[styles.proposalDiretrizValue, { color: colors.text }]}>
                          {renderHighlightedText(detail.diretrizes, queryTerms, colors.text)}
                        </Text>
                      </View>
                    </View>

                    {/* Metas e Ações Práticas do Mandato com Highlight */}
                    <View style={styles.proposalSectionBlock}>
                      <Text style={[styles.proposalSectionBadgeTitle, { color: colors.primary }]}>
                        📋 Metas e Ações Práticas do Mandato
                      </Text>
                      <View style={styles.proposalMetasList}>
                        {detail.metasAcoes.map((meta, mIdx) => (
                          <View key={mIdx} style={styles.proposalMetaRow}>
                            <Text style={[styles.proposalMetaCheck, { color: colors.primary }]}>✓</Text>
                            <Text style={[styles.proposalMetaText, { color: colors.text }]}>
                              {renderHighlightedText(meta, queryTerms, colors.text)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Beneficiários e Abrangência */}
                    <View style={styles.proposalMetaDuoRow}>
                      <View style={[styles.proposalDuoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.proposalDuoLabel, { color: colors.primary }]}>👥 Público Beneficiário</Text>
                        <Text style={[styles.proposalDuoValue, { color: colors.textSecondary }]}>{detail.beneficiarios}</Text>
                      </View>
                      <View style={[styles.proposalDuoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.proposalDuoLabel, { color: colors.primary }]}>📍 Abrangência Territorial</Text>
                        <Text style={[styles.proposalDuoValue, { color: colors.textSecondary }]}>{detail.abrangencia}</Text>
                      </View>
                    </View>

                    {/* Impacto Social e Indicadores */}
                    <View style={[styles.proposalHighlightBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.proposalDuoLabel, { color: '#10B981' }]}>📈 Impacto Esperado para a População</Text>
                      <Text style={[styles.proposalDuoValue, { color: colors.text }]}>{detail.impacto}</Text>
                      {detail.indicadoresSucesso ? (
                        <Text style={[styles.proposalIndicadoresText, { color: colors.textMuted }]}>
                          Indicadores-chave: {detail.indicadoresSucesso}
                        </Text>
                      ) : null}
                    </View>

                    {/* Viabilidade Orçamentária */}
                    <View style={[styles.proposalViabilidadeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.proposalViabilidadeLabel, { color: colors.textMuted }]}>💼 Viabilização Orçamentária & Governança:</Text>
                      <Text style={[styles.proposalViabilidadeText, { color: colors.textSecondary }]}>{detail.viabilidadeOrcamentaria}</Text>
                    </View>

                    {/* Tradução Cidadã */}
                    {detail.translatedText ? (
                      <View style={[styles.translatedBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.translatedLabel, { color: colors.primary }]}>
                          ✨ Tradução Cidadã (Linguagem Clara):
                        </Text>
                        <Text style={[styles.translatedText, { color: colors.textSecondary }]}>
                          {detail.translatedText}
                        </Text>
                      </View>
                    ) : null}

                    {/* Botões de Ação */}
                    <View style={styles.proposalActionsRow}>
                      <TouchableOpacity
                        style={[styles.proposalActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={(e: any) => {
                          e.stopPropagation?.();
                          handleCopyProposal(formatProposalForSharing(detail, name), selectedIdx);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.proposalActionBtnText, { color: colors.primary }]}>
                          {copiedProposalIndex === selectedIdx ? '✓ Copiado!' : '📋 Copiar Proposta Completa'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.proposalActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={(e: any) => {
                          e.stopPropagation?.();
                          setSelectedProposalModal(detail);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.proposalActionBtnText, { color: colors.primary }]}>
                          🔍 Tela Cheia
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })()}

        {/* Card Financiamento de Campanha (TSE) no final da página */}
        {data.financedBy && (
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>💰 Financiamento de Campanha (TSE)</Text>
            <View style={[styles.financeCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.financeAmount, { color: colors.primary }]}>
                R$ {data.financedBy.amount?.toLocaleString('pt-BR')}
              </Text>
              <Text style={[styles.financeSubtitle, { color: colors.textSecondary }]}>
                Total de recursos declarados à Justiça Eleitoral (Eleições 2026)
              </Text>

              {data.financedBy.sources && data.financedBy.sources.length > 0 && (
                <View style={styles.sourcesList}>
                  <Text style={[styles.sourcesHeader, { color: colors.text }]}>Origem das Receitas Oficiais:</Text>
                  {data.financedBy.sources.map((src: string, idx: number) => (
                    <View key={idx} style={[styles.sourceItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.sourceText, { color: colors.textSecondary }]}>• {src}</Text>
                    </View>
                  ))}
                </View>
              )}

              {(data.financedBy as any).tsePrestadorUrl ? (
                <TouchableOpacity
                  style={[styles.financeLink, { borderColor: colors.primary }]}
                  onPress={() => Linking.openURL((data.financedBy as any).tsePrestadorUrl)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.financeLinkText, { color: colors.primary }]}>
                    📊 Prestação de Contas Detalhada no TSE ↗
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        {/* Banner Estratégico de Apoio Voluntário via PIX */}
        <ApoioVoluntarioBanner
          variant="card"
          style={{ marginHorizontal: Spacing.sm, marginVertical: Spacing.xl }}
        />
      </View>
    </ScrollView>

    {/* Modal de Detalhes da Proposta em Tela Cheia */}
    {selectedProposalModal && (
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <View style={[styles.proposalPillarTag, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={styles.proposalPillarIcon}>{selectedProposalModal.pillarInfo?.icon}</Text>
              <Text style={[styles.proposalPillarLabel, { color: colors.primary }]}>
                {selectedProposalModal.pillar?.toUpperCase()} • {selectedProposalModal.pillarInfo?.label}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => setSelectedProposalModal(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCloseText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
            <Text style={[styles.modalProposalTitle, { color: colors.text }]}>
              {selectedProposalModal.title}
            </Text>

            {/* Scope Badge */}
            <View style={[styles.mandatoScopeTag, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginTop: Spacing.sm }]}>
              <Text style={styles.mandatoScopeTagIcon}>🏛️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mandatoScopeTagLabel, { color: colors.primary }]}>
                  {selectedProposalModal.mandatoScope}
                </Text>
                <Text style={[styles.mandatoScopeCompetencia, { color: colors.textMuted }]}>
                  {selectedProposalModal.competenciaMandato}
                </Text>
              </View>
            </View>

            {/* Diagnóstico e Diretriz */}
            <View style={styles.proposalSectionBlock}>
              <Text style={[styles.proposalSectionBadgeTitle, { color: colors.primary }]}>
                🎯 Diretriz e Diagnóstico do Mandato
              </Text>
              <Text style={[styles.proposalDiagnosticoText, { color: colors.textSecondary }]}>
                {selectedProposalModal.diagnostico}
              </Text>
              <View style={[styles.proposalDiretrizCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Text style={[styles.proposalDiretrizLabel, { color: colors.textMuted }]}>Diretriz Prioritária:</Text>
                <Text style={[styles.proposalDiretrizValue, { color: colors.text }]}>{selectedProposalModal.diretrizes}</Text>
              </View>
            </View>

            {/* Metas e Ações Práticas */}
            <View style={styles.proposalSectionBlock}>
              <Text style={[styles.proposalSectionBadgeTitle, { color: colors.primary }]}>
                📋 Metas e Ações Práticas do Mandato
              </Text>
              <View style={styles.proposalMetasList}>
                {selectedProposalModal.metasAcoes?.map((meta: string, mIdx: number) => (
                  <View key={mIdx} style={styles.proposalMetaRow}>
                    <Text style={[styles.proposalMetaCheck, { color: colors.primary }]}>✓</Text>
                    <Text style={[styles.proposalMetaText, { color: colors.text }]}>{meta}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Beneficiários e Abrangência */}
            <View style={[styles.proposalMetaDuoRow, { marginTop: Spacing.xs }]}>
              <View style={[styles.proposalDuoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Text style={[styles.proposalDuoLabel, { color: colors.primary }]}>👥 Público Beneficiário</Text>
                <Text style={[styles.proposalDuoValue, { color: colors.textSecondary }]}>{selectedProposalModal.beneficiarios}</Text>
              </View>
              <View style={[styles.proposalDuoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Text style={[styles.proposalDuoLabel, { color: colors.primary }]}>📍 Abrangência Territorial</Text>
                <Text style={[styles.proposalDuoValue, { color: colors.textSecondary }]}>{selectedProposalModal.abrangencia}</Text>
              </View>
            </View>

            {/* Impacto */}
            <View style={[styles.proposalHighlightBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.proposalDuoLabel, { color: '#10B981' }]}>📈 Impacto Esperado para a População</Text>
              <Text style={[styles.proposalDuoValue, { color: colors.text }]}>{selectedProposalModal.impacto}</Text>
              {selectedProposalModal.indicadoresSucesso ? (
                <Text style={[styles.proposalIndicadoresText, { color: colors.textMuted }]}>
                  Indicadores-chave: {selectedProposalModal.indicadoresSucesso}
                </Text>
              ) : null}
            </View>

            {/* Viabilidade Orçamentária */}
            <View style={[styles.proposalViabilidadeCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.proposalViabilidadeLabel, { color: colors.textMuted }]}>💼 Viabilização Orçamentária & Governança:</Text>
              <Text style={[styles.proposalViabilidadeText, { color: colors.textSecondary }]}>{selectedProposalModal.viabilidadeOrcamentaria}</Text>
            </View>

            {/* Tradução Cidadã */}
            {selectedProposalModal.translatedText ? (
              <View style={[styles.translatedBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginTop: Spacing.sm }]}>
                <Text style={[styles.translatedLabel, { color: colors.primary }]}>
                  ✨ Tradução Cidadã (Linguagem Clara):
                </Text>
                <Text style={[styles.translatedText, { color: colors.textSecondary }]}>
                  {selectedProposalModal.translatedText}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.proposalActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginRight: Spacing.sm }]}
              onPress={() => handleCopyProposal(formatProposalForSharing(selectedProposalModal, name), -1)}
              activeOpacity={0.7}
            >
              <Text style={[styles.proposalActionBtnText, { color: colors.primary }]}>
                {copiedProposalIndex === -1 ? '✓ Copiado!' : '📋 Copiar Proposta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalDismissBtn, { backgroundColor: colors.primary }]}
              onPress={() => setSelectedProposalModal(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDismissBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}

      {/* Modal da Cola Eleitoral */}
      <ColaModal
        visible={colaModalOpen}
        onClose={() => setColaModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  colaRaioXBtn: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colaRaioXBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FontSize.sm,
  },
  rootContainer: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { fontSize: FontSize.xl, fontWeight: 'bold', marginBottom: Spacing.xs, textAlign: 'center' },
  errorSubtitle: { fontSize: FontSize.base, textAlign: 'center', marginBottom: Spacing.md },
  inner: { flex: 1 },
  header: { paddingVertical: Spacing.xl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  photoContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  name: { fontSize: FontSize.title, fontWeight: 'bold' },
  nameDesktop: { fontSize: 28 },
  viceText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  party: { fontSize: FontSize.base, marginTop: Spacing.xs },
  level: { fontSize: FontSize.sm, marginTop: Spacing.xs, textTransform: 'uppercase' },
  deferidoBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  deferidoBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#065F46',
  },
  section: { padding: Spacing.base, borderBottomWidth: 1 },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: 'bold', marginBottom: Spacing.sm },
  planCard: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  planNotice: { fontSize: FontSize.xs, fontWeight: '700', marginBottom: Spacing.xs },
  planSummary: { fontSize: FontSize.base, lineHeight: 22, marginBottom: Spacing.md },
  planButton: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  planButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: FontSize.sm },
  badge: { padding: Spacing.sm, borderRadius: Radius.sm, overflow: 'hidden' },
  badgeText: { fontSize: FontSize.xl, fontWeight: '600', textAlign: 'center' },
  text: { fontSize: FontSize.xl, marginBottom: Spacing.xs },
  desktopGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm + 2, borderBottomWidth: 1 },
  voteCard: { width: '48%', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  voteProject: { fontSize: FontSize.md, flex: 1 },
  voteValue: { fontSize: FontSize.md, fontWeight: '600' },
  proposalsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  proposalsCountBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  proposalsCountText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  proposalsList: {
    gap: Spacing.md,
  },
  unifiedProposalCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    elevation: 2,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  },
  proposalDropdownContainer: {
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  proposalDropdownInstruction: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  proposalDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    cursor: 'pointer',
  },
  proposalDropdownTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  proposalDropdownTriggerIcon: {
    fontSize: 22,
  },
  proposalDropdownTriggerPillar: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  proposalDropdownTriggerTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 1,
  },
  proposalDropdownArrowBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proposalDropdownArrow: {
    fontSize: 11,
    fontWeight: '900',
  },
  proposalDropdownMenu: {
    marginTop: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    elevation: 4,
  },
  proposalDropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
    cursor: 'pointer',
  },
  proposalMenuItemIcon: {
    fontSize: 20,
  },
  proposalMenuItemPillar: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  proposalMenuItemTitle: {
    fontSize: FontSize.xs + 1,
    marginTop: 1,
    lineHeight: 18,
  },
  proposalMenuItemCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proposalMenuItemCheckText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  unifiedProposalBody: {
    padding: Spacing.md,
  },
  unifiedProposalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    lineHeight: 26,
    marginVertical: Spacing.xs,
  },
  proposalNumberTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  proposalNumberTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  proposalInteractiveCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    cursor: 'pointer',
    elevation: 2,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
  },
  proposalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  proposalPillarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
    flexShrink: 1,
  },
  proposalPillarIcon: {
    fontSize: 14,
  },
  proposalPillarLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  proposalExpandBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  proposalExpandBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  proposalTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  proposalPreviewText: {
    fontSize: FontSize.xs + 1,
    lineHeight: 20,
  },
  proposalDetailsBox: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  mandatoScopeTag: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  mandatoScopeTagIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  mandatoScopeTagLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  mandatoScopeCompetencia: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  proposalSectionBlock: {
    marginTop: Spacing.sm,
    gap: 4,
  },
  proposalSectionBadgeTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  proposalDiagnosticoText: {
    fontSize: FontSize.xs + 0.5,
    lineHeight: 18,
  },
  proposalDiretrizCard: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginTop: 4,
  },
  proposalDiretrizLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  proposalDiretrizValue: {
    fontSize: FontSize.xs + 0.5,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 2,
  },
  proposalMetasList: {
    marginTop: 4,
    gap: 6,
  },
  proposalMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  proposalMetaCheck: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 1,
  },
  proposalMetaText: {
    fontSize: FontSize.xs + 0.5,
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },
  proposalMetaDuoRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  proposalDuoCard: {
    flex: 1,
    minWidth: 160,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  proposalDuoLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  proposalDuoValue: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  proposalHighlightBox: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  proposalIndicadoresText: {
    fontSize: 10.5,
    marginTop: 4,
    fontStyle: 'italic',
  },
  proposalViabilidadeCard: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  proposalViabilidadeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  proposalViabilidadeText: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 2,
  },
  proposalDetailsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  proposalDetailsText: {
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  translatedBox: {
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  translatedLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: 2,
  },
  translatedText: {
    fontSize: FontSize.xs + 1,
    lineHeight: 20,
  },
  proposalActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  proposalActionBtn: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  proposalActionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    zIndex: 9999,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    elevation: 10,
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: FontSize.base,
    fontWeight: 'bold',
  },
  modalBody: {
    marginVertical: Spacing.sm,
  },
  modalProposalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    lineHeight: 26,
  },
  modalProposalDesc: {
    fontSize: FontSize.base,
    lineHeight: 24,
    marginTop: 4,
  },
  modalFooter: {
    marginTop: Spacing.md,
    alignItems: 'flex-end',
  },
  modalDismissBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
  },
  modalDismissBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FontSize.sm,
  },
  tseLinkBadge: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  tseLinkText: { fontSize: FontSize.xs, fontWeight: '600' },
  syncButton: {
    paddingVertical: Spacing.xs + 3,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  syncButtonText: { fontSize: FontSize.xs, fontWeight: '700' },
  syncMessageText: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 2 },
  financeCard: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  financeAmount: { fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
  financeSubtitle: { fontSize: FontSize.xs, marginBottom: Spacing.md },
  sourcesList: { gap: Spacing.xs, marginBottom: Spacing.md },
  sourcesHeader: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: 2 },
  sourceItem: { paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1 },
  sourceText: { fontSize: FontSize.xs, fontWeight: '500' },
  financeLink: { paddingVertical: Spacing.xs + 3, paddingHorizontal: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  financeLinkText: { fontSize: FontSize.xs, fontWeight: '700' },
  sectionSubtitle: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  overallCard: {
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  overallHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  overallScoreCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  overallScoreNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  overallScoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E6FFFA',
    textTransform: 'uppercase',
  },
  overallTextWrap: {
    flex: 1,
  },
  overallRatingTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  overallSummaryText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  pillarsList: {
    gap: Spacing.md,
  },
  pillarCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pillarCardHeader: {
    padding: Spacing.md,
  },
  pillarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  pillarIconBig: {
    fontSize: 26,
  },
  pillarName: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  pillarDesc: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  pillarScoreBadge: {
    alignItems: 'flex-end',
    minWidth: 64,
  },
  pillarScoreText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  pillarRatingTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pillarBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  pillarBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  toggleText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 4,
  },
  justificativaCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  justificativaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  justificativaTitleCol: {
    flex: 1,
    minWidth: 200,
  },
  justificativaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  justificativaIcon: {
    fontSize: 18,
  },
  justificativaTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  justificativaSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  justificativaScoreTag: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
  },
  justificativaScoreNum: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  justificativaScoreRating: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  justificativaResumoBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  justificativaResumoText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontWeight: '500',
  },
  gapBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  gapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  gapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  gapIcon: {
    fontSize: 14,
  },
  gapTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  gapBadge: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  gapBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  gapMotivoText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontWeight: '500',
  },
  gapPointsList: {
    gap: 4,
    marginTop: 2,
  },
  gapPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  gapPointBullet: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 1,
  },
  gapPointText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
    flex: 1,
  },
  criteriosHeading: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  criteriosGrid: {
    gap: Spacing.xs,
  },
  criterioItemCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  criterioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  criterioItemName: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  criterioBadgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pesoPill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  pesoPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  scorePill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  scorePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  aderenciaPill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  aderenciaPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  criterioItemDetail: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  formulaBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  formulaTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  metodologiaNotice: {
    fontSize: 11,
    lineHeight: 15,
  },
  evidencesBox: {
    borderTopWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  evidenceGroup: {
    gap: Spacing.xs,
  },
  evidenceGroupTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  evidenceItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  evidenceBullet: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 1,
  },
  evidenceItemText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    flex: 1,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tseStatusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tseStatusChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  planTitleMain: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  planEixosContainer: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: Spacing.md,
  },
  planEixosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  planEixosTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    flex: 1,
  },
  toggleEixosText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  planEixosList: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  planEixoCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  planEixoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  planEixoIcon: {
    fontSize: 22,
  },
  planEixoBadge: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planEixoName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 1,
  },
  planEixoBullets: {
    gap: 4,
    marginTop: 4,
    paddingLeft: 4,
  },
  planEixoBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  planEixoBulletDot: {
    fontSize: FontSize.xs,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  planEixoBulletText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    flex: 1,
  },
  planFooterActions: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  tseNoticeBox: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  tseNoticeText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  urnaCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  urnaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  urnaCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  urnaIcon: {
    fontSize: 26,
  },
  urnaTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  urnaSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
    fontWeight: '600',
  },
  urnaPartyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  urnaPartyText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  urnaDigitsContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: '#0F172A',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  urnaInstructionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  urnaKeysRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urnaKeyBox: {
    width: 46,
    height: 54,
    backgroundColor: '#1E293B',
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urnaKeyDigit: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  urnaHelpBox: {
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  urnaHelpText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
  // Pesquisa Eleitoral Homologada Styles
  pollSectionHeader: {
    marginBottom: Spacing.sm,
  },
  pollCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  pollBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pollTseBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pollTseBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#065F46',
  },
  pollAgeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pollAgeBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: '#1E40AF',
  },
  pollMainScoreCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  pollScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollCargoLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pollCandidateNameHighlight: {
    fontSize: FontSize.md,
    fontWeight: '800',
    marginTop: 2,
  },
  pollScoreBigBadge: {
    alignItems: 'flex-end',
  },
  pollScoreBigValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
    lineHeight: 36,
  },
  pollScoreBigUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  pollDiffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  pollDiffIcon: {
    fontSize: 20,
  },
  pollDiffTitle: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pollDiffText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 1,
  },
  pollPerspectiveContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  pollPerspectiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollPerspectiveTitleIcon: {
    fontSize: 16,
  },
  pollPerspectiveMainTitle: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pollPerspectiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  pollPerspectiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pollPerspectiveMetricsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
  },
  pollPerspectiveMetricChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  pollPerspectiveMetricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pollPerspectiveMetricValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  pollPerspectiveJustifyBox: {
    padding: Spacing.xs + 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginTop: 2,
  },
  pollPerspectiveJustifyTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pollPerspectiveJustifyText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontWeight: '500',
  },
  pollCandidatesList: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  pollListTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pollCandidateRow: {
    gap: 4,
    marginBottom: 6,
  },
  pollCandInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollCandName: {
    fontSize: FontSize.xs,
    flex: 1,
  },
  pollCandPercent: {
    fontSize: FontSize.xs,
    marginLeft: Spacing.sm,
  },
  pollBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  pollBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  pollDetailCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pollDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  pollDetailIcon: {
    fontSize: 22,
  },
  pollDetailSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  pollDetailSectionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  pollDetailBody: {
    gap: Spacing.sm,
  },
  pollDetailItem: {
    gap: 2,
  },
  pollDetailLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pollDetailValue: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    lineHeight: 19,
  },
  pollDetailSubValue: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 1,
  },
  pollScientificGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  pollScientificBox: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  pollScientificLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pollScientificNum: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  pollScientificUnit: {
    fontSize: 9.5,
    marginTop: 2,
    textAlign: 'center',
  },
  pollAntiBiasAudit: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  pollAntiBiasText: {
    fontSize: 10.5,
    lineHeight: 15,
    color: '#047857',
  },
  pollEmptyCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  pollEmptyIcon: {
    fontSize: 24,
  },
  pollEmptyTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  pollEmptyText: {
    fontSize: FontSize.xs,
    lineHeight: 17,
  },
  pollEmptySubtext: {
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
  // Pergunte à Proposta de Mandato (Busca Inteligente Client-Side)
  proposalSearchBox: {
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  proposalSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  proposalSearchLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  proposalSearchClearBtn: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
  },
  proposalSearchClearText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  proposalSearchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    height: 44,
  },
  proposalSearchInputIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  proposalSearchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    height: '100%',
  },
  proposalSearchFeedbackCard: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  proposalSearchFeedbackTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  proposalSearchBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  proposalSearchBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  proposalSearchCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  proposalSearchSnippet: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 2,
  },
  proposalSearchEmptyCard: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  proposalSearchEmptyTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: 2,
  },
  proposalSearchEmptyDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  proposalDropdownMatchBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
});

