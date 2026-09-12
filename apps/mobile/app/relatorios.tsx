import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { CivicEmblem } from '../components/CivicEmblem';
import { API_URL } from '../services/api';

const API_BASE_URL = `${API_URL}/api`;

interface ReportProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  priceCents: number;
  publicSummary: string;
}

export default function RelatoriosScreen() {
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  const [products, setProducts] = useState<ReportProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/reports/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // Silencioso
    } finally {
      setLoading(false);
    }
  }

  function handleOrder(product: ReportProduct) {
    Alert.alert(
      'Solicitação de Relatório',
      `Para adquirir "${product.title}" (R$ ${(product.priceCents / 100).toFixed(2)}), entre em contato pelo canal de relatórios institucionais via PIX manual com chave comprovada.`,
      [{ text: 'Entendido' }]
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: padding,
          maxWidth: maxW,
          alignSelf: 'center',
          width: '100%',
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.backButton, { borderColor: colors.border }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>← Voltar</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <CivicEmblem size={56} />
        <Text style={[styles.title, { color: colors.text }]}>Relatórios Cívicos B2B</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Dossiês analíticos para organizações, academia e veículos de imprensa com telemetria estritamente agregada (Coleta Zero).
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Catálogo Disponível</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
      ) : products.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Análise de Alinhamento Temático 2026</Text>
          <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
            Dossiê estruturado com agregação estatística de prioridades cívicas selecionadas e comparativo legislativo por bancada.
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceTag, { color: colors.primary }]}>R$ 490,00</Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Contato B2B', 'Envie mensagem para relatorios@eleicoesprogressistas.org')}
            >
              <Text style={styles.actionBtnText}>Solicitar Dossiê</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        products.map((p) => (
          <View key={p.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
                <Text style={[styles.categoryBadgeText, { color: colors.textMuted }]}>{p.category}</Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{p.title}</Text>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{p.description}</Text>
            <Text style={[styles.summaryText, { color: colors.textMuted }]}>{p.publicSummary}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceTag, { color: colors.primary }]}>
                R$ {(p.priceCents / 100).toFixed(2).replace('.', ',')}
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleOrder(p)}
              >
                <Text style={styles.actionBtnText}>Adquirir via PIX</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={[styles.ethicsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.ethicsTitle, { color: colors.text }]}>Garantia de Coleta Zero</Text>
        <Text style={[styles.ethicsText, { color: colors.textMuted }]}>
          Nenhum relatório comercializado contém dados pessoais, IP ou histórico individual de eleitores. Toda a métrica provém de somatórios agregados anônimos gerados em memória e dados públicos do TSE e Congresso Nacional.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: Spacing.xl },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  backButtonText: { fontSize: FontSize.sm, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginTop: Spacing.md, textAlign: 'center' },
  subtitle: { fontSize: FontSize.md, textAlign: 'center', marginTop: Spacing.xs, lineHeight: 22, maxWidth: 600 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  card: { padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md },
  emptyCard: { padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md },
  badgeRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  categoryBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  categoryBadgeText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.xs },
  cardDesc: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.sm },
  summaryText: { fontSize: FontSize.xs, fontStyle: 'italic', marginBottom: Spacing.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  priceTag: { fontSize: FontSize.xl, fontWeight: '800' },
  actionBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  actionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: FontSize.sm },
  ethicsBox: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.lg, marginBottom: Spacing.xxl },
  ethicsTitle: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: 4 },
  ethicsText: { fontSize: FontSize.xs, lineHeight: 18 },
});
