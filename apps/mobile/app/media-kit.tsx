import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { CivicEmblem } from '../components/CivicEmblem';

const FORMATS = [
  {
    tag: 'CARD_APOIO',
    title: 'Card de Apoio Cívico',
    desc: 'Card discreto e contextual exibido nas telas de Consulta e Comparador. Não intrusivo, sem animações pesadas.',
    specs: '320x100 ou responsivo, texto + logotipo + link direto.',
  },
  {
    tag: 'BANNER',
    title: 'Banner Contextual',
    desc: 'Posicionamento fixo de cabeçalho ou rodapé em telas de consulta temáticas por pilar republicano.',
    specs: 'Dimensões padrão web/mobile, carregamento estático e leve.',
  },
  {
    tag: 'PILAR_SPONSOR',
    title: 'Patrocínio Temático de Pilar',
    desc: 'Vinculação institucional a um dos 13 pilares (ex: P3 Transição Energética, P11 Cultura & Memória).',
    specs: 'Exibição exclusiva no topo das telas vinculadas àquele pilar específico.',
  },
  {
    tag: 'COLA_FOOTER',
    title: 'Rodapé de Cola Eleitoral',
    desc: 'Menção institucional discreta no rodapé da Cola Eleitoral gerada em PDF e resumo compartilhado.',
    specs: 'Texto simples de apoio cultural/cívico ("Incentivado por...").',
  },
];

const PRICING = [
  { model: 'CPT (Custo por Visualização Contextual)', price: 'R$ 18,00 / mil', detail: 'Sem cookies ou fingerprinting' },
  { model: 'CPC (Custo por Clique Transparente)', price: 'R$ 0,85 / clique', detail: 'Redirecionamento limpo e direto' },
  { model: 'Patrocínio Mensal Fixo (Pilar)', price: 'R$ 600,00 / mês', detail: 'Presença garantida no pilar temático' },
  { model: 'Pacote Semestral Antecipado', price: '20% OFF até 20/09', detail: 'Ativação prioritária pós-blackout' },
];

export default function MediaKitScreen() {
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  function handleOpenTransparency() {
    const url = 'http://localhost:3000/api/ads/transparency';
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        
        {/* Navegação Voltar */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <CivicEmblem size={56} />
          <Text style={[styles.title, { color: colors.text }]}>Media Kit de Anúncios Éticos</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>Publicidade Cívica, Contextual e Sem Rastreamento</Text>
          <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>PRIVACY-FIRST • LGPD COMPLIANT</Text>
          </View>
        </View>

        {/* Blackout Notice */}
        <View style={[styles.blackoutCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
          <Text style={styles.blackoutTitle}>⚖️ Período de Blackout Eleitoral Ativo</Text>
          <Text style={styles.blackoutText}>
            Em estrito cumprimento aos princípios republicanos e integridade democrática, 
            <Text style={{ fontWeight: '700' }}> nenhum anúncio de qualquer natureza é veiculado entre 16/08 e 05/10/2026</Text>.
          </Text>
          <Text style={styles.blackoutSub}>
            As propostas submetidas agora passam por análise prévia e aprovação cadastral para ativação em 06/10/2026.
          </Text>
        </View>

        {/* CTA Rápido */}
        <TouchableOpacity
          style={[styles.primaryCta, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/anuncie')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryCtaText}>🚀 Submeter Proposta de Anunciante ➔</Text>
        </TouchableOpacity>

        {/* Formatos de Anúncio */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📐 Formatos Disponíveis</Text>
          <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
            Todos os formatos são desenhados para não poluir a experiência e respeitar o cidadão.
          </Text>
          
          <View style={styles.formatGrid}>
            {FORMATS.map((f) => (
              <View key={f.tag} style={[styles.formatItem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={[styles.formatTagBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.formatTagText, { color: colors.primary }]}>{f.tag}</Text>
                </View>
                <Text style={[styles.formatTitle, { color: colors.text }]}>{f.title}</Text>
                <Text style={[styles.formatDesc, { color: colors.textMuted }]}>{f.desc}</Text>
                <Text style={[styles.formatSpecs, { color: colors.textFaint }]}>Especificações: {f.specs}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Matriz de Preços */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>💰 Matriz de Preços & Condições</Text>
          <View style={styles.table}>
            {PRICING.map((p, idx) => (
              <View key={idx} style={[styles.tableRow, { borderColor: colors.border }]}>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.tableModel, { color: colors.text }]}>{p.model}</Text>
                  <Text style={[styles.tableDetail, { color: colors.textMuted }]}>{p.detail}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={[styles.tablePrice, { color: colors.primary }]}>{p.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Whitelist & Blacklist */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🛡️ Política Editorial de Anunciantes</Text>
          
          <View style={styles.rulesSection}>
            <Text style={[styles.ruleHeader, { color: '#059669' }]}>✅ Quem Pode Anunciar (Whitelist):</Text>
            <Text style={[styles.ruleItem, { color: colors.textMuted }]}>
              • Cooperativas sustentáveis e agricultura familiar{'\n'}
              • Editoras de literatura, ciências sociais e direitos humanos{'\n'}
              • Institutos de cidadania, pesquisa e tecnologia social{'\n'}
              • Empresas de energias renováveis e mobilidade limpa{'\n'}
              • Iniciativas de economia solidária e finanças éticas
            </Text>
          </View>

          <View style={[styles.rulesSection, { marginTop: Spacing.md }]}>
            <Text style={[styles.ruleHeader, { color: '#DC2626' }]}>🚫 Vetados Irrestritamente (Blacklist):</Text>
            <Text style={[styles.ruleItem, { color: colors.textMuted }]}>
              • Partidos políticos, coligações ou candidatos{'\n'}
              • Casas de apostas esportivas, cassinos ou bets{'\n'}
              • Criptomoedas especulativas ou esquemas financeiros{'\n'}
              • Tabaco, bebidas alcoólicas, armas ou munições{'\n'}
              • Qualquer publicidade com rastreadores invasivos de terceiros
            </Text>
          </View>
        </View>

        {/* Transparência & CTA Final */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🔍 Transparência Total</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Todas as métricas de veiculação e receita gerada por anúncios éticos são públicas e auditáveis 
            por qualquer cidadão ou órgão de controle.
          </Text>
          
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: colors.primary }]}
            onPress={handleOpenTransparency}
            activeOpacity={0.7}
          >
            <Text style={[styles.outlineBtnText, { color: colors.primary }]}>
              📊 Acessar Painel Público de Transparência de Anúncios
            </Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.md }} />

          <TouchableOpacity
            style={[styles.primaryCta, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/anuncie')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryCtaText}>✍️ Preencher Formulário de Cadastro</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: Spacing.xl },
  inner: { width: '100%' },
  backButton: { marginBottom: Spacing.md, alignSelf: 'flex-start', paddingVertical: Spacing.xs },
  backText: { fontSize: FontSize.sm, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', textAlign: 'center', marginTop: Spacing.sm },
  subtitle: { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center', marginTop: Spacing.xs },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  blackoutCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  blackoutTitle: { fontSize: FontSize.md, fontWeight: '700', color: '#92400E', marginBottom: Spacing.xs },
  blackoutText: { fontSize: FontSize.sm, color: '#78350F', lineHeight: 20 },
  blackoutSub: { fontSize: FontSize.xs, color: '#92400E', marginTop: Spacing.xs, fontStyle: 'italic' },
  primaryCta: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  primaryCtaText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.xs },
  cardDesc: { fontSize: FontSize.sm, marginBottom: Spacing.md },
  formatGrid: { gap: Spacing.md },
  formatItem: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  formatTagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  formatTagText: { fontSize: FontSize.xs, fontWeight: '700' },
  formatTitle: { fontSize: FontSize.base, fontWeight: '700', marginBottom: 2 },
  formatDesc: { fontSize: FontSize.sm, lineHeight: 18, marginBottom: Spacing.xs },
  formatSpecs: { fontSize: FontSize.xs, fontStyle: 'italic' },
  table: { marginTop: Spacing.sm },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  tableModel: { fontSize: FontSize.sm, fontWeight: '700' },
  tableDetail: { fontSize: FontSize.xs },
  tablePrice: { fontSize: FontSize.sm, fontWeight: '800' },
  rulesSection: { marginTop: Spacing.xs },
  ruleHeader: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: Spacing.xs },
  ruleItem: { fontSize: FontSize.sm, lineHeight: 22 },
  paragraph: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  outlineBtn: {
    borderWidth: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  outlineBtnText: { fontSize: FontSize.sm, fontWeight: '700' },
});
