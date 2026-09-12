import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../../utils/theme';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../../utils/responsive';
import { useColaStore } from '../../stores/cola.store';
import { useLocationStore } from '../../stores/location.store';
import { PixApoio } from '../../components/PixApoio';
import { ColaModal } from '../../components/ColaModal';
import { CivicBanner } from '../../components/CivicBanner';
import { API_URL } from '../../services/api';

const VOTING_SEQUENCE = [
  { key: 'DEPUTADO_FEDERAL', title: 'Deputado(a) Federal', orderLabel: '1º A VOTAR', digits: 4, orderNum: '1º' },
  { key: 'DEPUTADO_ESTADUAL', title: 'Deputado(a) Estadual', orderLabel: '2º A VOTAR', digits: 5, orderNum: '2º' },
  { key: 'SENADOR', title: 'Senador(a)', orderLabel: '3º A VOTAR', digits: 3, orderNum: '3º' },
  { key: 'GOVERNADOR', title: 'Governador(a)', orderLabel: '4º A VOTAR', digits: 2, orderNum: '4º' },
  { key: 'PRESIDENTE', title: 'Presidente da República', orderLabel: '5º A VOTAR', digits: 2, orderNum: '5º' },
];

export default function ColaScreen() {
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  const {
    selectedCandidates,
    getSelectedList,
    removeCandidateByCargo,
    hasGeneratedPdfInSession,
    setHasGeneratedPdfInSession,
  } = useColaStore();
  const { location } = useLocationStore();
  const [downloading, setDownloading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedList = getSelectedList();
  const selectedIds = selectedList.map((c) => c.id).join(',');
  const userUf = location?.uf || 'BR';
  const userMun = location?.municipality || '';

  const apiUrl = API_URL;
  const pdfViewUrl = `${apiUrl}/api/cola/pdf?ids=${encodeURIComponent(selectedIds)}&state=${encodeURIComponent(userUf)}&municipality=${encodeURIComponent(userMun)}`;
  const pdfDownloadUrl = `${apiUrl}/api/cola/pdf/download?ids=${encodeURIComponent(selectedIds)}&state=${encodeURIComponent(userUf)}&municipality=${encodeURIComponent(userMun)}`;

  function handleViewPdf() {
    setHasGeneratedPdfInSession(true);
    if (typeof window !== 'undefined') {
      window.open(pdfViewUrl, '_blank');
    } else {
      Linking.openURL(pdfViewUrl);
    }
  }

  function handleDownloadPdf() {
    setHasGeneratedPdfInSession(true);
    setDownloading(true);
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = pdfDownloadUrl;
      link.download = 'cola-eleitoral-2026.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setDownloading(false), 1500);
    } else {
      Linking.openURL(pdfDownloadUrl);
      setTimeout(() => setDownloading(false), 1500);
    }
  }

  function handleShareWhatsApp() {
    setHasGeneratedPdfInSession(true);
    const lines = [
      '🗳️ MINHA COLA ELEITORAL 2026',
      'Eleições Gerais 2026 — Ordem Oficial do TSE:',
      '',
    ];
    for (const seq of VOTING_SEQUENCE) {
      const cand = selectedCandidates[seq.key];
      if (cand) {
        lines.push(`• ${seq.orderLabel} — ${seq.title}:`);
        lines.push(`  ${cand.name} (${cand.party}) - Nº ${cand.numeroUrna}`);
      } else {
        lines.push(`• ${seq.orderLabel} — ${seq.title}: [Em aberto]`);
      }
    }
    lines.push('');
    lines.push('⚠️ Atenção: Leve a cola impressa! É proibido entrar com celular na cabine (TSE).');
    lines.push('📱 Monte sua cola em: https://eleicoesprogressistas.org.br');
    const text = encodeURIComponent(lines.join('\n'));
    Linking.openURL(`https://api.whatsapp.com/send?text=${text}`);
  }

  function handleShareEmail() {
    setHasGeneratedPdfInSession(true);
    const subject = encodeURIComponent('Minha Cola Eleitoral 2026');
    const body = encodeURIComponent(
      `Confira minha colinha eleitoral para o dia da votação:\n\n${pdfViewUrl}\n\nLembre-se de imprimir antes de ir votar!`
    );
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        
        {/* Header de Navegação */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            onPress={() => router.replace('/')}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Início</Text>
          </TouchableOpacity>

          <CivicBanner variant="compact" />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.title, { color: colors.text }]}>📝 Minha Cola Eleitoral</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View style={[styles.countDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.countText, { color: colors.text }]}>
                {selectedList.length} de {VOTING_SEQUENCE.length}
              </Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Sequência oficial auditada pelo TSE para as Eleições Gerais 2026
          </Text>
        </View>

        {/* Banner de Advertência TSE (Stitch Style) */}
        <View style={[styles.tseBanner, { backgroundColor: colors.secondaryContainer || '#FEF3C7' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Text style={{ fontSize: 24, marginTop: 2 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={[styles.tseBannerTag, { color: colors.onSecondaryContainer || '#78350F' }]}>
                  ATENÇÃO ELEITOR(A)
                </Text>
                <View style={[styles.tsePill, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.tsePillText, { color: colors.secondary }]}>TSE 2026</Text>
                </View>
              </View>
              <Text style={[styles.tseBannerBody, { color: colors.onSecondaryContainer || '#78350F' }]}>
                O uso de celular ou dispositivos eletrônicos dentro da cabina de votação é <Text style={{ fontWeight: 'bold' }}>terminantemente PROIBIDO</Text> (Resolução TSE nº 23.736/2024). Baixe o PDF e <Text style={{ fontWeight: 'bold' }}>imprima sua colinha</Text> para levar em papel no dia da eleição!
              </Text>
            </View>
          </View>
        </View>

        {/* Ordem Oficial da Urna (Cards de Voto) */}
        <View style={styles.sequenceContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🏛️ Ordem Oficial de Votação na Urna
          </Text>

          {VOTING_SEQUENCE.map((seq) => {
            const cand = selectedCandidates[seq.key];

            if (cand) {
              const digits = (cand.numeroUrna || '').split('');
              return (
                <View
                  key={seq.key}
                  style={[styles.urnaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.urnaCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.orderCircle, { backgroundColor: colors.surfaceAlt }]}>
                        <Text style={[styles.orderCircleText, { color: colors.text }]}>{seq.orderNum}</Text>
                      </View>
                      <View>
                        <Text style={[styles.cargoTitle, { color: colors.text }]}>{seq.title}</Text>
                        <Text style={[styles.digitsInfo, { color: colors.textMuted }]}>{seq.digits} dígitos</Text>
                      </View>
                    </View>
                    <View style={[styles.fichaBadge, { backgroundColor: colors.tertiaryLight || '#E6F4EA' }]}>
                      <Text style={[styles.fichaBadgeText, { color: colors.success }]}>✓ Ficha Limpa</Text>
                    </View>
                  </View>

                  <View style={[styles.candidateRow, { backgroundColor: colors.surfaceAlt }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.candName, { color: colors.text }]} numberOfLines={1}>{cand.name}</Text>
                      {cand.viceName ? (
                        <Text style={[styles.candVice, { color: colors.textMuted }]} numberOfLines={1}>
                          Vice: {cand.viceName}
                        </Text>
                      ) : null}
                      <Text style={[styles.candParty, { color: colors.textMuted }]}>{cand.party}</Text>
                    </View>

                    {/* Urna Digit Boxes */}
                    <View style={styles.digitsRow}>
                      {digits.map((d, idx) => (
                        <View key={idx} style={[styles.digitBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <Text style={[styles.digitChar, { color: colors.text }]}>{d}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              );
            }

            return (
              <View
                key={seq.key}
                style={[styles.emptyUrnaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View style={[styles.orderCircle, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.orderCircleText, { color: colors.textMuted }]}>{seq.orderNum}</Text>
                  </View>
                  <View>
                    <Text style={[styles.cargoTitle, { color: colors.text }]}>{seq.title}</Text>
                    <Text style={[styles.digitsInfo, { color: colors.textMuted }]}>Ainda não escolhido ({seq.digits} dígitos)</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.selectBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)/candidatos')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectBtnText}>+ Escolher</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Painel de Exportação e Ações Rápidas */}
        <View style={[styles.exportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.exportTitle, { color: colors.text }]}>
            📄 Exportar para o Dia do Voto
          </Text>
          <Text style={[styles.exportSubtitle, { color: colors.textMuted }]}>
            Formato pronto para impressão em meia folha A4
          </Text>

          <TouchableOpacity
            style={[styles.mainPdfBtn, { backgroundColor: colors.primary }]}
            onPress={handleDownloadPdf}
            disabled={selectedList.length === 0 || downloading}
            activeOpacity={0.8}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.mainPdfBtnText}>⬇️ Baixar PDF da Colinha (Para Impressão)</Text>
            )}
          </TouchableOpacity>

          <View style={styles.secondaryActionsGrid}>
            <TouchableOpacity
              style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={handleViewPdf}
              disabled={selectedList.length === 0}
            >
              <Text style={{ fontSize: 18 }}>👁️</Text>
              <Text style={[styles.secondaryBtnLabel, { color: colors.text }]}>Visualizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={handleShareWhatsApp}
              disabled={selectedList.length === 0}
            >
              <Text style={{ fontSize: 18 }}>💬</Text>
              <Text style={[styles.secondaryBtnLabel, { color: colors.text }]}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={handleShareEmail}
              disabled={selectedList.length === 0}
            >
              <Text style={{ fontSize: 18 }}>✉️</Text>
              <Text style={[styles.secondaryBtnLabel, { color: colors.text }]}>E-mail</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => setModalOpen(true)}
            >
              <Text style={{ fontSize: 18 }}>⚙️</Text>
              <Text style={[styles.secondaryBtnLabel, { color: colors.text }]}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Apoio Cívico (PixApoio Não-Bloqueante) */}
        <View style={styles.supportWrapper}>
          <PixApoio />
        </View>

        <ColaModal visible={modalOpen} onClose={() => setModalOpen(false)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: Spacing.xl },
  inner: { width: '100%' },
  header: { marginBottom: Spacing.md },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  backButtonText: { fontSize: FontSize.sm, fontWeight: '600' },
  title: { fontSize: FontSize.hero, fontWeight: 'bold' },
  subtitle: { fontSize: FontSize.xs + 1, marginTop: 4 },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  countDot: { width: 8, height: 8, borderRadius: 4 },
  countText: { fontSize: FontSize.xs, fontWeight: '700' },
  tseBanner: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
  },
  tseBannerTag: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tsePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tsePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tseBannerBody: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
  },
  sequenceContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  urnaCard: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  urnaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  orderCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCircleText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  cargoTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  digitsInfo: {
    fontSize: FontSize.xs,
  },
  fichaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  fichaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    marginTop: 4,
  },
  candName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  candVice: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 1,
  },
  candParty: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  digitsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  digitBox: {
    width: 26,
    height: 34,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitChar: {
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  emptyUrnaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  selectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  exportCard: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  exportTitle: {
    fontSize: FontSize.base,
    fontWeight: '800',
    marginBottom: 2,
  },
  exportSubtitle: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
  },
  mainPdfBtn: {
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  mainPdfBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FontSize.sm,
  },
  secondaryActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  secondaryActionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  secondaryBtnLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  supportWrapper: {
    marginTop: Spacing.xs,
  },
});
