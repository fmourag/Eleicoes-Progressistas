import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { PILLAR_DISPLAY_LIST } from '@np/shared';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { api } from '../services/api';

const CATEGORIES = [
  { id: 'ONG', label: 'ONG / Fundação de Direitos' },
  { id: 'COOPERATIVA', label: 'Cooperativa / Economia Popular' },
  { id: 'EMPRESA_SUSTENTAVEL', label: 'Empresa Verde / B-Corp' },
  { id: 'SINDICATO', label: 'Sindicato / Associação Trabalhista' },
  { id: 'INSTITUTO', label: 'Instituto de Pesquisa / Editorial' },
];

export default function AnuncieScreen() {
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [category, setCategory] = useState('ONG');
  const [selectedPillars, setSelectedPillars] = useState<string[]>(['p3']);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [applicationNote, setApplicationNote] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ protocol: string; sla: string; blackoutNotice: string } | null>(null);

  function maskCnpj(value: string) {
    const numeric = value.replace(/\D/g, '').slice(0, 14);
    if (numeric.length <= 2) return numeric;
    if (numeric.length <= 5) return `${numeric.slice(0, 2)}.${numeric.slice(2)}`;
    if (numeric.length <= 8) return `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5)}`;
    if (numeric.length <= 12) return `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5, 8)}/${numeric.slice(8)}`;
    return `${numeric.slice(0, 2)}.${numeric.slice(2, 5)}.${numeric.slice(5, 8)}/${numeric.slice(8, 12)}-${numeric.slice(12, 14)}`;
  }

  function togglePillar(id: string) {
    setSelectedPillars(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // mínimo 1
        return prev.filter(p => p !== id);
      }
      if (prev.length < 3) return [...prev, id];
      return prev;
    });
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim() || !cnpj.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ protocol: string; sla: string; blackoutNotice: string }>('/api/ads/apply', {
        name: name.trim(),
        cnpj: cnpj.trim(),
        category,
        pillarAlignment: selectedPillars,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        applicationNote: applicationNote.trim() || undefined,
        website: website || undefined,
      });

      setSuccessData(res);
    } catch (err: any) {
      setError(err?.message || 'Falha ao enviar proposta. Verifique os dados ou o CNPJ informado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        
        {/* Navegação de Topo */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🌱</Text>
          <Text style={[styles.title, { color: colors.text }]}>Anuncie com Propósito</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>Rede de Anúncios Éticos • Eleições Progressistas 2026</Text>
          <View style={[styles.blackoutBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Text style={[styles.blackoutText, { color: colors.primary }]}>
              ⚖️ Compliance Eleitoral: Veiculação ativa a partir de 05/10/2026
            </Text>
          </View>
        </View>

        {successData ? (
          /* Tela de Sucesso */
          <View style={[styles.card, styles.successCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={[styles.successTitle, { color: colors.text }]}>Proposta Recebida com Sucesso!</Text>
            <Text style={[styles.successDesc, { color: colors.textMuted }]}>
              Sua solicitação de parceria cívica foi registrada em nossa fila de curadoria ética.
            </Text>

            <View style={[styles.protocolBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.protocolLabel, { color: colors.textMuted }]}>Número do Protocolo:</Text>
              <Text style={[styles.protocolValue, { color: colors.primary }]}>{successData.protocol}</Text>
              <Text style={[styles.protocolSla, { color: colors.textMuted }]}>Prazo de Análise: {successData.sla}</Text>
            </View>

            <Text style={[styles.blackoutAlert, { color: colors.text }]}>
              📅 {successData.blackoutNotice}
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/media-kit')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Ver Media Kit & Especificações ➔</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Formulário de Onboarding */
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Onboarding de Patrocinador</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              Zero tracking, curadoria rigorosa alinhada aos 13 pilares e transparência pública contratual.
            </Text>

            {error && (
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#DC2626' }]}>
                <Text style={{ color: '#DC2626', fontSize: FontSize.xs, fontWeight: '600' }}>⚠️ {error}</Text>
              </View>
            )}

            {/* Nome da Organização */}
            <Text style={[styles.label, { color: colors.text }]}>Razão Social / Nome da Entidade *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
              placeholder="Ex: Cooperativa de Energia Limpa Solar"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            {/* CNPJ */}
            <Text style={[styles.label, { color: colors.text }]}>CNPJ da Organização *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
              placeholder="00.000.000/0000-00"
              placeholderTextColor={colors.textMuted}
              value={cnpj}
              onChangeText={(t: string) => setCnpj(maskCnpj(t))}
              keyboardType="numeric"
            />

            {/* Categoria */}
            <Text style={[styles.label, { color: colors.text }]}>Categoria de Atuação *</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat.id ? colors.primaryLight : colors.surfaceAlt,
                      borderColor: category === cat.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, { color: category === cat.id ? colors.primary : colors.text }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pilares Alinhados */}
            <Text style={[styles.label, { color: colors.text }]}>
              Pilares de Alinhamento (selecione de 1 a 3) *
            </Text>
            <View style={styles.pillarContainer}>
              {PILLAR_DISPLAY_LIST.map(p => {
                const selected = selectedPillars.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.pillarChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.surfaceAlt,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => togglePillar(p.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillarChipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                      {p.icon} {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Contato Responsável */}
            <Text style={[styles.label, { color: colors.text }]}>Nome do Responsável / Ponto de Contato *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
              placeholder="Ex: Maria da Silva"
              placeholderTextColor={colors.textMuted}
              value={contactName}
              onChangeText={setContactName}
            />

            <Text style={[styles.label, { color: colors.text }]}>E-mail de Contato Corporativo *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
              placeholder="contato@entidade.org.br"
              placeholderTextColor={colors.textMuted}
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Mensagem Opcional */}
            <Text style={[styles.label, { color: colors.text }]}>Mensagem / Proposta de Apoio (opcional, máx 500)</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
              placeholder="Descreva brevemente o formato de interesse (CPT, patrocínio fixo de pilar, etc.)"
              placeholderTextColor={colors.textMuted}
              value={applicationNote}
              onChangeText={setApplicationNote}
              multiline
              maxLength={500}
            />

            {/* Honeypot field (oculto visualmente) */}
            <TextInput
              style={{ display: 'none', height: 0, opacity: 0 }}
              value={website}
              onChangeText={setWebsite}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Botão de Envio */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Enviar Proposta de Apoio Ético ➔</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaKitLink} onPress={() => router.push('/media-kit')} activeOpacity={0.7}>
              <Text style={[styles.mediaKitLinkText, { color: colors.primary }]}>
                📊 Consultar Tabela de Formatos e Preços no Media Kit ↗
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
  headerIcon: { fontSize: 44, marginBottom: 4 },
  title: { fontSize: FontSize.xxl, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  blackoutBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  blackoutText: { fontSize: 11, fontWeight: '800' },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { fontSize: FontSize.xs, lineHeight: 18, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.xs, fontWeight: '700', marginBottom: 6, marginTop: Spacing.md },
  input: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.sm,
  },
  textArea: {
    height: 90,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    textAlignVertical: 'top',
  },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: 4 },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: FontSize.xs, fontWeight: '600' },
  pillarContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  pillarChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillarChipText: { fontSize: 11, fontWeight: '600' },
  primaryButton: {
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '800' },
  mediaKitLink: { alignItems: 'center', marginTop: Spacing.md },
  mediaKitLinkText: { fontSize: FontSize.xs, fontWeight: '700', textDecorationLine: 'underline' },
  errorBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  successCard: { alignItems: 'center', paddingVertical: Spacing.xxl },
  successIcon: { fontSize: 50, marginBottom: Spacing.md },
  successTitle: { fontSize: FontSize.xl, fontWeight: '800', textAlign: 'center', marginBottom: Spacing.xs },
  successDesc: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20, maxWidth: 450, marginBottom: Spacing.lg },
  protocolBox: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  protocolLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  protocolValue: { fontSize: FontSize.lg, fontWeight: '800', marginVertical: 4 },
  protocolSla: { fontSize: 11 },
  blackoutAlert: { fontSize: FontSize.xs, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.lg },
});
