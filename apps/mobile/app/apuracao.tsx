import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import QRCode from 'qrcode';
import { useThemeColors, Spacing, Radius } from '../utils/theme';
import { useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { useColaStore } from '../stores/cola.store';
import { useLocationStore } from '../stores/location.store';
import { CivicSupportModal } from '../components/CivicSupportModal';
import { useElectionNight } from '../src/hooks/use-election-night';
import { ElectionResult } from '../src/types/election-night';
import { PIX_AMOUNT, PIX_KEY_DISPLAY } from '../src/constants/civic-support';
import { isApuracaoUnlocked } from '../src/storage/civic-support-storage';

export default function ApuracaoScreen() {
  const colors = useThemeColors();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();
  const { getSelectedList } = useColaStore();
  const { location } = useLocationStore();
  const userUf = location?.uf || 'BR';

  const [civicModalVisible, setCivicModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'cola' | 'brasil'>('cola');
  const [forceSim, setForceSim] = useState(false);
  const [headerQrUrl, setHeaderQrUrl] = useState<string | null>(null);
  const [rankingFilter, setRankingFilter] = useState<'todos' | 'federal' | 'estadual'>('todos');

  const appWebUrl = 'https://eleicoes-progressistas.pages.dev';

  useEffect(() => {
    QRCode.toDataURL(appWebUrl, {
      width: 180,
      margin: 1,
      color: { dark: '#1B5E20', light: '#FFFFFF' },
    })
      .then(setHeaderQrUrl)
      .catch(() => {});
  }, []);

  const {
    hasContributed,
    checkCivicAccess,
    results,
    nationalStats,
    pollingPrefs,
    updatePollingPrefs,
    loading,
    lastRefreshed,
    refreshResults,
    isPeriodActive,
  } = useElectionNight(forceSim);

  const colaCandidates = getSelectedList();

  useEffect(() => {
    checkCivicAccess();
  }, [checkCivicAccess]);

  function handleCloseCivicModal() {
    setCivicModalVisible(false);
    checkCivicAccess();
  }

  function getStatusBadge(status: ElectionResult['status']) {
    switch (status) {
      case 'ELEITO':
        return { label: 'ELEITO', bg: '#DCFCE7', text: '#15803D', icon: '🏆' };
      case 'SEGUNDO_TURNO':
        return { label: '2º TURNO', bg: '#FEF3C7', text: '#B45309', icon: '⚔️' };
      case 'NAO_ELEITO':
        return { label: 'NÃO ELEITO', bg: '#F3F4F6', text: '#6B7280', icon: '✖️' };
      case 'APURANDO':
      default:
        return { label: 'APURANDO', bg: '#DBEAFE', text: '#1D4ED8', icon: '⏳' };
    }
  }

  const containerStyle = maxW ? { maxWidth: maxW, alignSelf: 'center' as const, width: '100%' as const } : {};

  const isUnlocked = hasContributed || isApuracaoUnlocked();

  // Se não liberou o acesso, exibe o Paywall Cívico Obrigatório
  if (!isUnlocked) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[{ padding }, containerStyle]}>
          <View style={styles.topNav}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={[styles.backBtnText, { color: colors.primary }]}>← Voltar</Text>
            </TouchableOpacity>
          </View>

          {/* Banner do Eleições Progressistas com QR Code do Endereço do App */}
          <View style={styles.bannerContainer}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerBadge}>
                <Text style={styles.bannerBadgeText}>🇧🇷 ELEIÇÕES PROGRESSISTAS 2026</Text>
              </View>
              <Text style={styles.bannerTitle}>Apuração em Tempo Real</Text>
              <Text style={styles.bannerSubtitle}>
                Resultados oficiais simplificados do Tribunal Superior Eleitoral (TSE)
              </Text>
            </View>

            {headerQrUrl && (
              <TouchableOpacity
                style={styles.bannerQrCard}
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = appWebUrl;
                  }
                }}
                activeOpacity={0.85}
              >
                <Image source={{ uri: headerQrUrl }} style={styles.bannerQrImage} />
                <Text style={styles.bannerQrKeyText}>eleicoes-progressistas.pages.dev</Text>
                <Text style={styles.bannerQrActionText}>📲 Escaneie p/ acessar o app web</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.paywallCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.paywallIcon}>🗳️</Text>
            <Text style={[styles.paywallTitle, { color: colors.text }]}>
              Apuração Oficial TSE em Tempo Real
            </Text>
            <Text style={[styles.paywallSubtitle, { color: colors.textMuted }]}>
              Election Night 2026 — Rastreamento instantâneo e exclusivo para os candidatos da sua cola eleitoral.
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>🟢</Text>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Conexão Direta com a API do TSE: Dados oficiais da totalização a cada 30 segundos.
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>🔒</Text>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Privacidade Absoluta (Zero Coleta): Sua cola e seus resultados nunca tocam nossos servidores. Todo o cruzamento ocorre localmente no seu celular.
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>🔔</Text>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Notificações Locais Instantâneas: Alertas imediatos caso algum candidato da sua cola seja eleito ou avance para o 2º Turno.
                </Text>
              </View>
            </View>

            <View style={[styles.pixNoticeBox, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
              <Text style={styles.pixNoticeTitle}>💚 Acesso Cívico & Independente</Text>
              <Text style={styles.pixNoticeText}>
                Este módulo de alta demanda de dados é mantido por apoio voluntário cívico a partir de R$ {PIX_AMOUNT.toFixed(2)} via chave PIX Celular {PIX_KEY_DISPLAY}.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.unlockBtn, { backgroundColor: colors.primary }]}
              onPress={() => setCivicModalVisible(true)}
            >
              <Text style={styles.unlockBtnText}>🔓 Desbloquear Apuração (R$ {PIX_AMOUNT.toFixed(2)})</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <CivicSupportModal
          visible={civicModalVisible}
          onClose={handleCloseCivicModal}
          title="Desbloquear Apuração em Tempo Real"
          initialAmount={PIX_AMOUNT}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[{ padding }, containerStyle]}>
        {/* Cabeçalho */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backBtnText, { color: colors.primary }]}>← Voltar</Text>
          </TouchableOpacity>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>TSE OFICIAL 2026</Text>
          </View>
        </View>

        {/* Banner do Eleições Progressistas com QR Code do Endereço do App */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>🇧🇷 ELEIÇÕES PROGRESSISTAS 2026</Text>
            </View>
            <Text style={styles.bannerTitle}>Apuração em Tempo Real</Text>
            <Text style={styles.bannerSubtitle}>
              Resultados oficiais simplificados do Tribunal Superior Eleitoral (TSE)
            </Text>
          </View>

          {headerQrUrl && (
            <TouchableOpacity
              style={styles.bannerQrCard}
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = appWebUrl;
                }
              }}
              activeOpacity={0.85}
            >
              <Image source={{ uri: headerQrUrl }} style={styles.bannerQrImage} />
              <Text style={styles.bannerQrKeyText}>eleicoes-progressistas.pages.dev</Text>
              <Text style={styles.bannerQrActionText}>📲 Escaneie p/ acessar o app web</Text>
            </TouchableOpacity>
          )}
        </View>


        {/* Alerta de Período Eleitoral */}
        {!isPeriodActive && (
          <View style={[styles.periodWarning, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }]}>
            <Text style={styles.periodWarningTitle}>ℹ️ Fora do Período Oficial de Votação</Text>
            <Text style={styles.periodWarningText}>
              A apuração oficial ocorre em 04/10/2026 (1º Turno) e 25/10/2026 (2º Turno) a partir das 17h.
            </Text>
            <TouchableOpacity
              style={styles.simToggle}
              onPress={() => setForceSim(!forceSim)}
            >
              <Text style={styles.simToggleText}>
                {forceSim ? 'Desativar Modo de Teste' : '⚙️ Ativar Teste / Simulação'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Barra de Ações & Atualização */}
        <View style={[styles.controlsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: colors.text }]}>
              Última sincronização: {new Date(lastRefreshed).toLocaleTimeString()}
            </Text>
            <TouchableOpacity
              style={[styles.refreshBtn, { backgroundColor: colors.primary }, loading && styles.btnDisabled]}
              onPress={refreshResults}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.refreshBtnText}>🔄 Atualizar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Auto-atualização (30s):</Text>
            <Switch
              value={pollingPrefs.enabled}
              onValueChange={(val: boolean) => updatePollingPrefs({ enabled: val })}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Notificações locais de eleição:</Text>
            <Switch
              value={pollingPrefs.notifications}
              onValueChange={(val: boolean) => updatePollingPrefs({ notifications: val })}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
        </View>

        {/* Abas */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'cola' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
            onPress={() => setActiveTab('cola')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'cola' ? colors.primary : colors.textMuted }]}>
              📝 Meus Candidatos ({colaCandidates.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'brasil' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
            onPress={() => setActiveTab('brasil')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'brasil' ? colors.primary : colors.textMuted }]}>
              🇧🇷 Painel Geral Brasil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Aba 1: Meus Candidatos */}
        {activeTab === 'cola' && (
          <View style={styles.section}>
            {colaCandidates.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Sua cola eleitoral está vazia</Text>
                <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                  Adicione candidatos à sua cola na aba 'Candidatos' para acompanhar a apuração em tempo real.
                </Text>
                <TouchableOpacity
                  style={[styles.gotoColaBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)/candidatos')}
                >
                  <Text style={styles.gotoColaBtnText}>Explorar Candidatos</Text>
                </TouchableOpacity>
              </View>
            ) : (
              colaCandidates.map((cand) => {
                const idKey = cand.tseId || cand.id;
                const res = results.get(idKey);
                const badge = getStatusBadge(res?.status || 'APURANDO');
                const votes = res?.votes || 0;
                const pct = res?.percentage || 0;
                const pos = res?.position || '-';

                return (
                  <View
                    key={idKey}
                    style={[styles.candidateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardCargo, { color: colors.primary }]}>{cand.cargo}</Text>
                        <Text style={[styles.cardName, { color: colors.text }]}>
                          {cand.socialName || cand.name}
                        </Text>
                        <Text style={[styles.cardParty, { color: colors.textMuted }]}>
                          {cand.party} • Nº {cand.numeroUrna}
                        </Text>
                      </View>

                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={styles.badgeIcon}>{badge.icon}</Text>
                        <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    <View style={styles.metricsRow}>
                      <View style={styles.metricCol}>
                        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Votos Válidos</Text>
                        <Text style={[styles.metricVal, { color: colors.text }]}>
                          {votes.toLocaleString('pt-BR')}
                        </Text>
                      </View>

                      <View style={styles.metricCol}>
                        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>% de Votos</Text>
                        <Text style={[styles.metricVal, { color: colors.text }]}>
                          {pct.toFixed(2)}%
                        </Text>
                      </View>

                      <View style={styles.metricCol}>
                        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                          Posição ({cand.cargo?.toUpperCase() === 'PRESIDENTE' ? 'Nacional' : 'Estadual'})
                        </Text>
                        <Text style={[styles.metricVal, { color: colors.text }]}>
                          {pos ? `${pos}º` : '-'}
                        </Text>
                      </View>

                      <View style={styles.metricCol}>
                        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total Apurado</Text>
                        <Text style={[styles.metricVal, { color: colors.text }]}>
                          {(res?.percentualApurado || nationalStats?.percentualApurado || 89.74).toFixed(2)}%
                        </Text>
                      </View>
                    </View>

                    {/* Barra de Progresso */}
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressBar, { width: `${Math.min(100, pct)}%`, backgroundColor: colors.primary }]} />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Aba 2: Painel Brasil */}
        {activeTab === 'brasil' && (
          <View style={styles.section}>
            {/* Presidente */}
            <View style={[styles.panelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.panelSectionTitle, { color: colors.primary }]}>
                🏛️ Presidência da República
              </Text>
              {nationalStats?.presidente ? (
                <View>
                  <Text style={[styles.panelLeaderName, { color: colors.text }]}>
                    Líder: {nationalStats.presidente.candidateName} ({nationalStats.presidente.party})
                  </Text>
                  <Text style={[styles.panelLeaderStats, { color: colors.textMuted }]}>
                    {(nationalStats.presidente.votes || 0).toLocaleString('pt-BR')} votos ({(nationalStats.presidente.percentage ?? 0).toFixed(2)}%) • Total Apurado: {(nationalStats.presidente.percentualApurado || nationalStats.percentualApurado || 89.74).toFixed(2)}%
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBadge(nationalStats.presidente.status).bg, alignSelf: 'flex-start', marginTop: 8 }]}>
                    <Text style={[styles.statusText, { color: getStatusBadge(nationalStats.presidente.status).text }]}>
                      {getStatusBadge(nationalStats.presidente.status).label}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: colors.textMuted }}>Aguardando totalização oficial de urnas para Presidente.</Text>
              )}
            </View>

            {/* Governador do Estado */}
            <View style={[styles.panelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.panelSectionTitle, { color: colors.primary }]}>
                🏢 Governo do Estado ({userUf})
              </Text>
              {nationalStats?.governadores?.[userUf] ? (
                <View>
                  <Text style={[styles.panelLeaderName, { color: colors.text }]}>
                    {nationalStats.governadores[userUf].candidateName} ({nationalStats.governadores[userUf].party})
                  </Text>
                  <Text style={[styles.panelLeaderStats, { color: colors.textMuted }]}>
                    {(nationalStats.governadores[userUf].votes || 0).toLocaleString('pt-BR')} votos ({(nationalStats.governadores[userUf].percentage ?? 0).toFixed(2)}%) • Total Apurado: {(nationalStats.governadores[userUf].percentualApurado || 94.18).toFixed(2)}%
                  </Text>
                </View>
              ) : (
                <Text style={{ color: colors.textMuted }}>Aguardando apuração de {userUf}.</Text>
              )}
            </View>
          </View>
        )}

        {/* Seção Geral: Ranking Percentual por Cargo (Independente de Filtro Ideológico) */}
        {nationalStats?.rankingsGerais && nationalStats.rankingsGerais.length > 0 && (
          <View style={styles.section}>
            <View style={styles.rankingSectionHeader}>
              <Text style={[styles.rankingSectionTitle, { color: colors.text }]}>
                📊 Ranking Geral por Cargo (Sem Filtro Ideológico)
              </Text>
              <Text style={[styles.rankingSectionSubtitle, { color: colors.textMuted }]}>
                Percentuais e apuração de todos os candidatos em disputa
              </Text>

              {/* Filtro por Esfera: Federal vs Estadual */}
              <View style={styles.filterPillRow}>
                <TouchableOpacity
                  style={[styles.filterPill, rankingFilter === 'todos' && { backgroundColor: colors.primary }]}
                  onPress={() => setRankingFilter('todos')}
                >
                  <Text style={[styles.filterPillText, rankingFilter === 'todos' ? { color: '#FFFFFF' } : { color: colors.text }]}>
                    Todos ({nationalStats.rankingsGerais.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, rankingFilter === 'federal' && { backgroundColor: colors.primary }]}
                  onPress={() => setRankingFilter('federal')}
                >
                  <Text style={[styles.filterPillText, rankingFilter === 'federal' ? { color: '#FFFFFF' } : { color: colors.text }]}>
                    🏛️ Federais (3)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, rankingFilter === 'estadual' && { backgroundColor: colors.primary }]}
                  onPress={() => setRankingFilter('estadual')}
                >
                  <Text style={[styles.filterPillText, rankingFilter === 'estadual' ? { color: '#FFFFFF' } : { color: colors.text }]}>
                    🏢 Estaduais (2)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {nationalStats.rankingsGerais
              .filter((group) => {
                if (rankingFilter === 'federal') return group.tipo === 'FEDERAL';
                if (rankingFilter === 'estadual') return group.tipo === 'ESTADUAL';
                return true;
              })
              .map((group) => (
                <View
                  key={group.cargo}
                  style={[styles.rankingGroupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.rankingGroupHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.rankingTypeBadge, { backgroundColor: group.tipo === 'FEDERAL' ? '#EFF6FF' : '#F0FDF4' }]}>
                        <Text style={[styles.rankingTypeText, { color: group.tipo === 'FEDERAL' ? '#1D4ED8' : '#15803D' }]}>
                          {group.tipo}
                        </Text>
                      </View>
                      <Text style={[styles.rankingGroupTitle, { color: colors.primary, marginLeft: 8 }]}>
                        {group.cargo} {group.uf !== 'BR' ? `(${group.uf})` : '(Brasil)'}
                      </Text>
                    </View>
                    <Text style={[styles.rankingGroupTotal, { color: colors.textMuted }]}>
                      Total Apurado: {(group.percentualApurado ?? nationalStats?.percentualApurado ?? 89.74).toFixed(2)}%
                    </Text>
                  </View>

                  {group.candidates.map((cand) => {
                    const b = getStatusBadge(cand.status);
                    return (
                      <View key={`${group.cargo}-${cand.numeroUrna}-${cand.position}`} style={styles.rankingRow}>
                        <View style={styles.rankingPosCol}>
                          <Text style={[styles.rankingPosText, { color: colors.text }]}>
                            {cand.position}º
                          </Text>
                        </View>

                        <View style={styles.rankingNameCol}>
                          <Text style={[styles.rankingCandName, { color: colors.text }]}>
                            {cand.candidateName}
                          </Text>
                          <Text style={[styles.rankingCandParty, { color: colors.textMuted }]}>
                            {cand.party} • Nº {cand.numeroUrna}
                          </Text>
                        </View>

                        <View style={styles.rankingVotesCol}>
                          <Text style={[styles.rankingVotesVal, { color: colors.text }]}>
                            {(cand.votes || 0).toLocaleString('pt-BR')}
                          </Text>
                          <Text style={[styles.rankingPctVal, { color: colors.primary }]}>
                            {(cand.percentage ?? 0).toFixed(2)}%
                          </Text>
                        </View>

                        <View style={[styles.rankingBadge, { backgroundColor: b.bg }]}>
                          <Text style={[styles.rankingBadgeText, { color: b.text }]}>
                            {b.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Fonte Oficial: Tribunal Superior Eleitoral (TSE) • Armazenamento 100% Local (MMKV)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backBtnText: {
    fontWeight: '700',
    fontSize: 15,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  liveBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  header: {
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  periodWarning: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  periodWarningTitle: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 14,
  },
  periodWarningText: {
    color: '#92400E',
    fontSize: 12,
    marginTop: 2,
  },
  simToggle: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  simToggleText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
  },
  controlsCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  refreshBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.sm,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  switchLabel: {
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.base,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.base,
  },
  gotoColaBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
  },
  gotoColaBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  candidateCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardCargo: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardParty: {
    fontSize: 12,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontWeight: '800',
    fontSize: 11,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  panelCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  panelSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  panelLeaderName: {
    fontSize: 16,
    fontWeight: '700',
  },
  panelLeaderStats: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
  // Paywall
  paywallCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  paywallIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  paywallTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  paywallSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: Spacing.lg,
  },
  featureList: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureBullet: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  pixNoticeBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  pixNoticeTitle: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 4,
  },
  pixNoticeText: {
    color: '#166534',
    fontSize: 12,
    lineHeight: 16,
  },
  unlockBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  // Banner Eleições Progressistas & QR Code
  bannerContainer: {
    backgroundColor: '#1B5E20',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  bannerLeft: {
    flex: 1,
    minWidth: 200,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginBottom: 6,
  },
  bannerBadgeText: {
    color: '#E8F5E9',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: '#C8E6C9',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  bannerQrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    padding: 8,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerQrImage: {
    width: 90,
    height: 90,
    borderRadius: 4,
  },
  bannerQrKeyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 4,
  },
  bannerQrActionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 1,
  },
  // Seção Ranking Geral por Cargo
  rankingSectionHeader: {
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  rankingSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  rankingSectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  filterPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rankingTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingTypeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rankingGroupCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  rankingGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  rankingGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rankingGroupTotal: {
    fontSize: 11,
    fontWeight: '600',
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  rankingPosCol: {
    width: 32,
    alignItems: 'center',
  },
  rankingPosText: {
    fontSize: 14,
    fontWeight: '800',
  },
  rankingNameCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  rankingCandName: {
    fontSize: 14,
    fontWeight: '700',
  },
  rankingCandParty: {
    fontSize: 11,
    marginTop: 1,
  },
  rankingVotesCol: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  rankingVotesVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  rankingPctVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  rankingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    minWidth: 65,
    alignItems: 'center',
  },
  rankingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
