import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { CivicEmblem } from '../components/CivicEmblem';

export default function TransparenciaScreen() {
  const colors = useThemeColors();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  function handleOpenTse() {
    const url = 'https://dadosabertos.tse.jus.br/';
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        
        {/* Header de Navegação */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>

        {/* Emblema e Título */}
        <View style={styles.header}>
          <CivicEmblem size={56} />
          <Text style={[styles.title, { color: colors.text }]}>Nota de Transparência Pública</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>Evolução para Coleta Zero • Versão 2.2.0</Text>
          <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>PRIVACY BY DESIGN • LGPD-FIRST</Text>
          </View>
        </View>

        {/* Bloco 1: O que mudou */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>1. Por que Coleta Zero?</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Em conformidade irrestrita com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), 
            eliminamos permanentemente qualquer questionário, teste ou perfilamento ideológico.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            O aplicativo opera no modelo <Text style={{ fontWeight: '700', color: colors.text }}>Consulta por Prioridades</Text>: 
            você escolhe até 3 temas de interesse temático em memória volátil de sessão. Suas preferências 
            <Text style={{ fontWeight: '700', color: colors.text }}> nunca são gravadas em disco ou servidores</Text>.
          </Text>
        </View>

        {/* Bloco 2: O que permanece */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>2. O que Permanece e se Fortalece</Text>
          
          <View style={styles.itemRow}>
            <Text style={styles.itemIcon}>🔍</Text>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Raio-X Auditável dos Candidatos</Text>
              <Text style={[styles.itemDesc, { color: colors.textMuted }]}>
                Memória de cálculo auditável: (Votações: 40%) + (Discursos: 30%) + (Posturas: 30%) e Gap Analysis.
              </Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemIcon}>📝</Text>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Cola Eleitoral 2026 (100% Local)</Text>
              <Text style={[styles.itemDesc, { color: colors.textMuted }]}>
                Sequência oficial da urna do TSE, caixas de dígitos grandes, PDF para impressão e compartilhamento WhatsApp/E-mail.
              </Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemIcon}>🤖</Text>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Tradutor de Propostas de Governo</Text>
              <Text style={[styles.itemDesc, { color: colors.textMuted }]}>
                Propostas oficiais registradas no TSE traduzidas para linguagem simples e acessível a qualquer cidadão.
              </Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemIcon}>🏛️</Text>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Auditoria Direta no TSE</Text>
              <Text style={[styles.itemDesc, { color: colors.textMuted }]}>
                Links e atalhos de checagem direta no Portal de Dados Abertos da Justiça Eleitoral.
              </Text>
            </View>
          </View>
        </View>

        {/* Botões de Ação */}
        <TouchableOpacity
          style={[styles.tseButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={handleOpenTse}
          activeOpacity={0.7}
        >
          <Text style={[styles.tseButtonText, { color: colors.primary }]}>
            🏛️ Auditar no Portal de Dados Abertos do TSE ↗
          </Text>
        </TouchableOpacity>

        {/* Rodapé institucional */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Eleições Progressistas • "Cheque o passado. Escolha o futuro."
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>
            Encarregado de Dados (DPO): contato-dpo@norteprogressista.com.br
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: Spacing.xl },
  inner: { width: '100%' },
  backButton: { marginBottom: Spacing.md },
  backText: { fontSize: FontSize.sm, fontWeight: '700' },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', textAlign: 'center', marginTop: Spacing.sm },
  subtitle: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.sm },
  paragraph: { fontSize: FontSize.sm, lineHeight: 22, marginBottom: Spacing.sm },
  itemRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  itemIcon: { fontSize: 24 },
  itemTextContainer: { flex: 1 },
  itemTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: 2 },
  itemDesc: { fontSize: FontSize.xs, lineHeight: 18 },
  tseButton: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  tseButtonText: { fontSize: FontSize.sm, fontWeight: '700' },
  footer: { alignItems: 'center', marginTop: Spacing.md },
  footerText: { fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
  footerSubtext: { fontSize: 10, marginTop: 4, textAlign: 'center' },
});
