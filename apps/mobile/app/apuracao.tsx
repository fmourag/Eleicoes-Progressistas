import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { useColaStore } from '../stores/cola.store';
import { useLocationStore } from '../stores/location.store';
import { CivicSupportModal } from '../components/CivicSupportModal';
import { useElectionNight } from '../src/hooks/use-election-night';
import { ElectionResult } from '../src/types/election-night';
import { PIX_AMOUNT, PIX_KEY_DISPLAY } from '../src/constants/civic-support';

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

  // Se não contribuiu com o apoio cívico, exibe o Paywall Cívico Obrigatório
  if (!hasContributed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[{ padding }, containerStyle]}>
          <View style={styles.topNav}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={[styles.backBtnText, { color: colors.primary }]}>← Voltar</Text>
            </TouchableOpacity>
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

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Apuração em Tempo Real</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Resultados oficiais simplificados do Tribunal Superior Eleitoral
          </Text>
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
                        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Posição</Text>
                        <Text style={[styles.metricVal, { color: colors.text }]}>
                          {pos ? `${pos}º` : '-'}
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
                    {nationalStats.presidente.votes.toLocaleString('pt-BR')} votos ({nationalStats.presidente.percentage.toFixed(2)}%)
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
              {nationalStats?.governadores[userUf] ? (
                <View>
                  <Text style={[styles.panelLeaderName, { color: colors.text }]}>
                    {nationalStats.governadores[userUf].candidateName} ({nationalStats.governadores[userUf].party})
                  </Text>
                  <Text style={[styles.panelLeaderStats, { color: colors.textMuted }]}>
                    {nationalStats.governadores[userUf].votes.toLocaleString('pt-BR')} votos ({nationalStats.governadores[userUf].percentage.toFixed(2)}%)
                  </Text>
                </View>
              ) : (
                <Text style={{ color: colors.textMuted }}>Aguardando apuração de {userUf}.</Text>
              )}
            </View>
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
});
