import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { PixApoio } from '../components/PixApoio';
import { CivicBanner } from '../components/CivicBanner';
import { api } from '../services/api';

interface FinanceCostsData {
  monthlyBudget: {
    items: Array<{ category: string; monthlyCostBrl: number; description: string }>;
    totalMonthlyCostBrl: number;
  };
  period: {
    startDate: string;
    monthsOperating: number;
    totalAccumulatedCostBrl: number;
  };
  revenue: {
    donationsBrl: number;
    donationsCount: number;
    ethicalAdsBrl: number;
    totalAccumulatedRevenueBrl: number;
  };
  breakEven: {
    isBreakEven: boolean;
    balanceBrl: number;
    percentageCovered: number;
  };
}

export default function ApoieScreen() {
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  const [costs, setCosts] = useState<FinanceCostsData | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  useEffect(() => {
    api.get<FinanceCostsData>('/api/finance/costs')
      .then((res) => {
        if (res) setCosts(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleOpenTransparency() {
    const url = `${apiUrl}/api/ads/transparency`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        
        {/* Top bar */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Voltar ao Início</Text>
        </TouchableOpacity>

        <CivicBanner variant="compact" />

        {/* Title */}
        <Text style={[styles.headerTitle, { color: colors.text }]}>🌱 Publicação Sem Prejuízo</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Tecnologia cívica aberta, sem paywall, sem fins lucrativos e sustentada pela comunidade progressista.
        </Text>

        {/* PIX Apoio Component */}
        <PixApoio />

        {/* Planilha de Custos ao Vivo */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Custos Operacionais em Tempo Real</Text>
            <Text style={[styles.cardTag, { color: '#059669', backgroundColor: '#ECFDF5' }]}>Free-Tier + Domínio</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : costs ? (
            <View style={styles.tableContainer}>
              {/* Status de Break-Even */}
              <View style={[styles.breakEvenBanner, { backgroundColor: costs.breakEven.isBreakEven ? '#ECFDF5' : '#FEF3C7', borderColor: costs.breakEven.isBreakEven ? '#10B981' : '#F59E0B' }]}>
                <Text style={[styles.breakEvenTitle, { color: costs.breakEven.isBreakEven ? '#065F46' : '#92400E' }]}>
                  {costs.breakEven.isBreakEven ? '✅ Custos do Projeto 100% Cobertos!' : '⚖️ Meta de Equilíbrio (Break-Even)'}
                </Text>
                <Text style={[styles.breakEvenText, { color: costs.breakEven.isBreakEven ? '#047857' : '#78350F' }]}>
                  Saldo operacional atual: <Text style={{ fontWeight: 'bold' }}>R$ {costs.breakEven.balanceBrl.toFixed(2)}</Text> ({costs.breakEven.percentageCovered}% dos custos acumulados cobertos).
                </Text>
              </View>

              {/* Tabela de Itens de Custo */}
              <View style={styles.costTable}>
                {costs.monthlyBudget.items.map((item, idx) => (
                  <View key={idx} style={[styles.costRow, { borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.costCategory, { color: colors.text }]}>{item.category}</Text>
                      <Text style={[styles.costDesc, { color: colors.textMuted }]}>{item.description}</Text>
                    </View>
                    <Text style={[styles.costValue, { color: item.monthlyCostBrl === 0 ? '#059669' : colors.text }]}>
                      {item.monthlyCostBrl === 0 ? 'R$ 0,00' : `R$ ${item.monthlyCostBrl.toFixed(2)}/mês`}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Resumo Financeiro Acumulado */}
              <View style={[styles.summaryBox, { backgroundColor: colors.surfaceAlt }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Custo Total Acumulado ({costs.period.monthsOperating} meses):</Text>
                  <Text style={[styles.summaryVal, { color: colors.text }]}>R$ {costs.period.totalAccumulatedCostBrl.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Doações da Comunidade ({costs.revenue.donationsCount} apoios):</Text>
                  <Text style={[styles.summaryVal, { color: '#059669' }]}>+ R$ {costs.revenue.donationsBrl.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Anúncios Éticos Aprovados:</Text>
                  <Text style={[styles.summaryVal, { color: '#0284C7' }]}>+ R$ {costs.revenue.ethicalAdsBrl.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6, marginTop: 4 }]}>
                  <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: 'bold' }]}>Receita Total Acumulada:</Text>
                  <Text style={[styles.summaryVal, { color: colors.primary, fontWeight: 'bold' }]}>R$ {costs.revenue.totalAccumulatedRevenueBrl.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={{ color: colors.textMuted }}>Não foi possível carregar a planilha de custos.</Text>
          )}

          {/* Link para Auditoria de Anúncios */}
          <TouchableOpacity style={[styles.transparencyBtn, { borderColor: colors.primary }]} onPress={handleOpenTransparency} activeOpacity={0.8}>
            <Text style={[styles.transparencyBtnText, { color: colors.primary }]}>
              🔍 Ver Relatório de Transparência Radical dos Anunciantes Éticos →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: Spacing.xl },
  inner: { width: '100%' },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  backButtonText: { fontSize: FontSize.sm, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  cardTag: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tableContainer: { width: '100%' },
  breakEvenBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  breakEvenTitle: { fontSize: FontSize.sm, fontWeight: 'bold', marginBottom: 2 },
  breakEvenText: { fontSize: FontSize.xs, lineHeight: 18 },
  costTable: { marginBottom: Spacing.md },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  costCategory: { fontSize: FontSize.sm, fontWeight: '600' },
  costDesc: { fontSize: 11, marginTop: 2 },
  costValue: { fontSize: FontSize.sm, fontWeight: 'bold', marginLeft: 10 },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: { fontSize: FontSize.xs },
  summaryVal: { fontSize: FontSize.xs, fontWeight: '600' },
  transparencyBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  transparencyBtnText: { fontSize: FontSize.xs, fontWeight: '700' },
});
