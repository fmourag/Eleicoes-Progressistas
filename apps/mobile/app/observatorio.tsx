import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useColaStore } from '../stores/cola.store';
import { watchdogApi, WatchdogAlert, WatchdogPledge, WatchdogDashboard } from '../services/api';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { CivicEmblem } from '../components/CivicEmblem';
import { EthicalAd } from '../components/EthicalAd';

const PILLARS_MAP: Record<string, { name: string; icon: string }> = {
  p1: { name: 'Direitos Trabalhistas & Renda', icon: '💼' },
  p2: { name: 'Soberania Nacional & Patrimônio', icon: '🇧🇷' },
  p3: { name: 'Saúde Pública & SUS', icon: '🏥' },
  p4: { name: 'Educação Pública Universal', icon: '🎓' },
  p5: { name: 'Meio Ambiente & Justiça Climática', icon: '🌱' },
  p6: { name: 'Direitos Humanos & Diversidade', icon: '🤝' },
  p7: { name: 'Combate às Desigualdades', icon: '⚖️' },
  p8: { name: 'Reforma Agrária & Alimentação', icon: '🌾' },
  p9: { name: 'Segurança Cidadã', icon: '🛡️' },
  p10: { name: 'Cultura & Identidade Popular', icon: '🎨' },
  p11: { name: 'Ciência, Tecnologia & Inovação', icon: '🔬' },
  p12: { name: 'Democracia & Participação Social', icon: '🗳️' },
  p13: { name: 'Transparência & Ética Pública', icon: '🔍' },
};

const LAST_VISITED_KEY = 'watchdog_last_visited';

async function getStorageItem(key: string): Promise<string | null> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {}
  }
  return null;
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }
}

export default function ObservatorioScreen() {
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();
  const isDesktop = bp === 'desktop';

  const selectedCandidatesMap = useColaStore((state) => state.selectedCandidates);
  const candidatesList = Object.values(selectedCandidatesMap);
  const candidateIds = candidatesList.map((c) => c.id);

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<WatchdogAlert[]>([]);
  const [pledges, setPledges] = useState<WatchdogPledge[]>([]);
  const [dashboard, setDashboard] = useState<WatchdogDashboard | null>(null);
  const [newVotesNotice, setNewVotesNotice] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const lastVisited = await getStorageItem(LAST_VISITED_KEY);
        
        // Carrega dashboard público geral
        const dashData = await watchdogApi.getDashboard().catch(() => null);
        if (dashData) {
          setDashboard(dashData);
          if (lastVisited && dashData.totalVotacoes) {
            const visitedDate = new Date(lastVisited).getTime();
            if (Date.now() - visitedDate > 24 * 60 * 60 * 1000) {
              setNewVotesNotice(Math.min(dashData.totalVotacoes, 3));
            }
          }
        }

        // Se tem candidatos na cola, busca alertas stateless e promessas
        if (candidateIds.length > 0) {
          const savedPriorities = ['p1', 'p3', 'p5', 'p13'];
          const alertRes = await watchdogApi.getAlerts(candidateIds, savedPriorities).catch(() => ({ alerts: [], total: 0 }));
          setAlerts(alertRes.alerts || []);

          // Busca promessas dos candidatos
          const allPledges: WatchdogPledge[] = [];
          for (const c of candidatesList) {
            const pRes = await watchdogApi.getPledges(c.id).catch(() => ({ pledges: [] }));
            if (pRes?.pledges) {
              allPledges.push(...pRes.pledges);
            }
          }
          setPledges(allPledges);
        }

        await setStorageItem(LAST_VISITED_KEY, new Date().toISOString());
      } catch (err) {
        console.error('[Observatorio] Falha ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [candidateIds.join(',')]);

  function handleOpenLink(url?: string) {
    if (!url) return;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  }

  function getStatusBadgeStyle(status: string) {
    switch (status) {
      case 'CUMPRIDA':
        return { bg: '#DCFCE7', text: '#15803D', label: '✅ CUMPRIDA' };
      case 'QUEBRADA':
        return { bg: '#FEE2E2', text: '#B91C1C', label: '❌ QUEBRADA' };
      case 'EM_ANDAMENTO':
        return { bg: '#FEF3C7', text: '#B45309', label: '⏳ EM ANDAMENTO' };
      case 'PROPOSTA':
      default:
        return { bg: '#E2E8F0', text: '#475569', label: '📋 PROPOSTA' };
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View
        style={[
          styles.inner,
          { paddingHorizontal: padding },
          maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined,
        ]}
      >
        {/* Header de Navegação */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>

        {/* Emblema e Título */}
        <View style={styles.header}>
          <CivicEmblem size={56} />
          <Text style={[styles.title, { color: colors.text }]}>Observatório de Mandatos</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>
            Monitoramento Pós-Eleição de Votações e Promessômetro
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              100% STATELESS • DADOS OFICIAIS DO CONGRESSO NACIONAL
            </Text>
          </View>
        </View>

        {/* Notificação Local de Novas Votações */}
        {newVotesNotice !== null && newVotesNotice > 0 && (
          <View style={[styles.noticeBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.primary }]}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🔔</Text>
            <Text style={[styles.noticeText, { color: colors.text }]}>
              <Text style={{ fontWeight: '700' }}>{newVotesNotice} novas votações nominais</Text> foram
              registradas no Congresso desde sua última visita!
            </Text>
          </View>
        )}

        {/* Patrocínio Ético no topo */}
        <EthicalAd screen="observatorio" format="PILAR_SPONSOR" />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Consultando diários oficiais e votações nominais...
            </Text>
          </View>
        ) : candidatesList.length === 0 ? (
          /* ESTADO EXPLICATIVO QUANDO COLA ELEITORAL ESTÁ VAZIA */
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Sua Cola Eleitoral está Vazia
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              Adicione candidatos à sua cola eleitoral para ativar o monitoramento personalizado de
              mandatos, alertas de divergência e acompanhamento de promessas pós-eleição.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/matching')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>🎯 Definir Prioridades & Escolher Candidatos</Text>
            </TouchableOpacity>

            {/* Mostra Dashboard Geral mesmo sem cola */}
            {dashboard && (
              <View style={styles.dashboardSummaryBox}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🏛️ Panorama Atual do Congresso Monitorado
                </Text>
                <View style={styles.metricsGrid}>
                  <View style={[styles.metricCard, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {dashboard.totalEleitos}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Mandatos Monitorados
                    </Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {dashboard.totalVotacoes}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Votações Nominais
                    </Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {dashboard.fidelidadeMedia}%
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Fidelidade Média
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* SEÇÃO 1: ALERTAS DE DIVERGÊNCIA */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  ⚠️ Alertas de Divergência ({alerts.length})
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Votações nominais contrárias às prioridades cívicas
                </Text>
              </View>

              {alerts.length === 0 ? (
                <View style={styles.alignedBox}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>🎯</Text>
                  <Text style={[styles.alignedTitle, { color: colors.text }]}>
                    100% Alinhado até o momento!
                  </Text>
                  <Text style={[styles.alignedDesc, { color: colors.textMuted }]}>
                    Nenhuma divergência registrada entre as votações dos seus candidatos eleitos e suas
                    causas prioritárias.
                  </Text>
                </View>
              ) : (
                alerts.map((al) => {
                  const pilarInfo = PILLARS_MAP[al.pillarId] || { name: al.pillarId, icon: '🏛️' };
                  return (
                    <View
                      key={`${al.candidateId}-${al.voteId}`}
                      style={[styles.alertCard, { backgroundColor: colors.surfaceAlt, borderColor: '#EF4444' }]}
                    >
                      <View style={styles.alertHeaderRow}>
                        <View style={styles.pillarTag}>
                          <Text style={{ fontSize: 13, marginRight: 4 }}>{pilarInfo.icon}</Text>
                          <Text style={styles.pillarTagText}>{pilarInfo.name}</Text>
                        </View>
                        <View style={styles.voteTagNeg}>
                          <Text style={styles.voteTagNegText}>VOTOU: {al.candidateChoice}</Text>
                        </View>
                      </View>

                      <Text style={[styles.candidateNameText, { color: colors.text }]}>
                        {al.candidateName} ({al.candidateParty} - {al.cargo})
                      </Text>

                      <Text style={[styles.voteDescription, { color: colors.textSecondary }]}>
                        {al.description}
                      </Text>

                      <Text style={[styles.divergenceDetail, { color: colors.textMuted }]}>
                        {al.divergenceReason}
                      </Text>

                      <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => handleOpenLink(al.summaryUrl)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.linkButtonText, { color: colors.primary }]}>
                          Ver votação oficial no Congresso ↗
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>

            {/* SEÇÃO 2: PROMESSÔMETRO */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  📊 Promessômetro de Mandato
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Acompanhamento de promessas de campanha registradas no TSE
                </Text>
              </View>

              {pledges.length === 0 ? (
                <Text style={[styles.emptyPledgesText, { color: colors.textMuted }]}>
                  Nenhuma promessa cadastrada para os candidatos da sua cola no momento.
                </Text>
              ) : (
                pledges.map((pl) => {
                  const badge = getStatusBadgeStyle(pl.status);
                  const pilarInfo = PILLARS_MAP[pl.pillar] || { name: pl.pillar, icon: '📌' };
                  return (
                    <View
                      key={pl.id}
                      style={[styles.pledgeCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                    >
                      <View style={styles.pledgeHeaderRow}>
                        <View style={styles.pillarTag}>
                          <Text style={{ fontSize: 13, marginRight: 4 }}>{pilarInfo.icon}</Text>
                          <Text style={styles.pillarTagText}>{pilarInfo.name}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                            {badge.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.pledgeTitle, { color: colors.text }]}>{pl.title}</Text>
                      <Text style={[styles.pledgeDesc, { color: colors.textSecondary }]}>
                        {pl.description}
                      </Text>

                      <View style={styles.pledgeLinksRow}>
                        {pl.sourceUrl && (
                          <TouchableOpacity
                            onPress={() => handleOpenLink(pl.sourceUrl)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.smallLink, { color: colors.primary }]}>
                              📄 Plano Oficial no TSE ↗
                            </Text>
                          </TouchableOpacity>
                        )}
                        {pl.evidenceUrl && (
                          <TouchableOpacity
                            onPress={() => handleOpenLink(pl.evidenceUrl)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.smallLink, { color: colors.tertiary }]}>
                              🏛️ Evidência de Cumprimento ↗
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* SEÇÃO 3: PAINEL GERAL DO CONGRESSO */}
            {dashboard && (
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🌐 Painel Geral de Mandatos Eleitos
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Dados consolidados de todos os parlamentares monitorados
                </Text>

                <View style={styles.metricsGrid}>
                  <View style={[styles.metricCard, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {dashboard.totalEleitos}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Mandatos
                    </Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {dashboard.totalVotacoes}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Votações
                    </Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {dashboard.fidelidadeMedia}%
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Fidelidade
                    </Text>
                  </View>
                </View>

                {dashboard.topDivergencias && dashboard.topDivergencias.length > 0 && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.subheading, { color: colors.text }]}>
                      Top Temas com Divergências Recorrentes:
                    </Text>
                    {dashboard.topDivergencias.map((td, idx) => (
                      <View key={idx} style={styles.divergenceRow}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                          • {td.description}: <Text style={{ fontWeight: '700', color: colors.primary }}>{td.divergenceCount} votos divergentes</Text>
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Observatório de Mandatos • Eleições Progressistas v2.2.3
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textFaint }]}>
            100% Stateless • Dados abertos da Câmara dos Deputados e Senado Federal • Atualização noturna às 02:00
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingVertical: Spacing.xl },
  inner: { width: '100%' },
  backButton: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  backText: { fontSize: FontSize.sm, fontWeight: '700' },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginTop: Spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  noticeText: { fontSize: FontSize.sm, flex: 1 },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { fontSize: FontSize.sm, marginTop: 12 },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.xs, textAlign: 'center' },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: FontSize.sm },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  sectionSubtitle: { fontSize: FontSize.xs, marginTop: 2 },
  alignedBox: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  alignedTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  alignedDesc: { fontSize: FontSize.xs, textAlign: 'center', lineHeight: 18 },
  alertCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pillarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pillarTagText: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  voteTagNeg: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  voteTagNegText: { fontSize: 11, fontWeight: '800', color: '#DC2626' },
  candidateNameText: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: 4 },
  voteDescription: { fontSize: FontSize.xs, lineHeight: 17, marginBottom: 6 },
  divergenceDetail: { fontSize: 11, fontStyle: 'italic', marginBottom: 8 },
  linkButton: { alignSelf: 'flex-start' },
  linkButtonText: { fontSize: FontSize.xs, fontWeight: '700', textDecorationLine: 'underline' },
  emptyPledgesText: { fontSize: FontSize.xs, fontStyle: 'italic' },
  pledgeCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  pledgeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  pledgeTitle: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: 4 },
  pledgeDesc: { fontSize: FontSize.xs, lineHeight: 17, marginBottom: 8 },
  pledgeLinksRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  smallLink: { fontSize: 11, fontWeight: '700', textDecorationLine: 'underline' },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  metricValue: { fontSize: FontSize.xl, fontWeight: '800' },
  metricLabel: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  subheading: { fontSize: FontSize.xs, fontWeight: '700', marginBottom: 6 },
  divergenceRow: { marginBottom: 4 },
  dashboardSummaryBox: { marginTop: Spacing.xl, width: '100%' },
  footer: { marginTop: Spacing.xl, alignItems: 'center', paddingBottom: Spacing.xl },
  footerText: { fontSize: FontSize.xs, fontWeight: '600' },
  footerSubtext: { fontSize: 10, marginTop: 4, textAlign: 'center' },
});
