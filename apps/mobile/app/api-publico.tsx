import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { CivicEmblem } from '../components/CivicEmblem';
import { API_URL } from '../services/api';

const API_BASE_URL = `${API_URL}/api`;

export default function ApiPublicoScreen() {
  const colors = useThemeColors();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  // Form state
  const [contactEmail, setContactEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerateKey() {
    if (!contactEmail.trim() || !purpose.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, informe seu e-mail e a finalidade de uso.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/public/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactEmail: contactEmail.trim(),
          purpose: purpose.trim(),
          website: websiteHoneypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Erro na Emissão', data.message || 'Não foi possível emitir a chave.');
        return;
      }

      setGeneratedKey(data.key);
      setContactEmail('');
      setPurpose('');
    } catch (err: any) {
      Alert.alert('Erro de Conexão', err.message || 'Falha ao conectar com o servidor da API.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyKey() {
    if (!generatedKey) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      Alert.alert('Chave Gerada', generatedKey);
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
          <Text style={[styles.title, { color: colors.text }]}>API Pública de Dados Eleitorais</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>Acesso Aberto & Tiered para Pesquisa e Jornalismo</Text>
          <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>DADOS ABERTOS • LGPD COORDENADA</Text>
          </View>
        </View>

        {/* Comparativo dos Tiers */}
        <View style={styles.tierGrid}>
          {/* Card FREE */}
          <View style={[styles.tierCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.tierBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.tierBadgeText, { color: colors.primary }]}>TIER GRATUITO</Text>
            </View>
            <Text style={[styles.tierTitle, { color: colors.text }]}>Pesquisa & Cidadania</Text>
            <Text style={[styles.tierPrice, { color: colors.primary }]}>R$ 0,00</Text>
            <Text style={[styles.tierDetail, { color: colors.textMuted }]}>
              • 1.000 requisições / dia{'\n'}
              • Catálogo dos 13 Pilares{'\n'}
              • Candidatos & Propostas Traduzidas{'\n'}
              • Estatísticas Agregadas Nacionais{'\n'}
              • Emissão instantânea self-service
            </Text>
          </View>

          {/* Card PAID */}
          <View style={[styles.tierCard, { backgroundColor: colors.surface, borderColor: '#F59E0B' }]}>
            <View style={[styles.tierBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.tierBadgeText, { color: '#B45309' }]}>TIER PROFISSIONAL</Text>
            </View>
            <Text style={[styles.tierTitle, { color: colors.text }]}>Redações & Institutos</Text>
            <Text style={[styles.tierPrice, { color: '#B45309' }]}>R$ 200,00 / mês</Text>
            <Text style={[styles.tierDetail, { color: colors.textMuted }]}>
              • 10.000 requisições / dia{'\n'}
              • Histórico Completo de Votações Nominais{'\n'}
              • Certidões de Integridade & Ficha Limpa{'\n'}
              • Gap Analysis (Demanda vs. Oferta){'\n'}
              • Dump massivo em CSV (1x a cada 24h){'\n'}
              • Ativação manual via contrato PIX
            </Text>
          </View>
        </View>

        {/* Formulário de Emissão FREE */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>⚡ Obter Chave Gratuita (Tier FREE)</Text>
          <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
            Preencha seus dados para receber uma chave imediata com cota de 1.000 requisições diárias.
          </Text>

          {/* E-mail */}
          <Text style={[styles.label, { color: colors.text }]}>E-mail de Contato *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
            placeholder="pesquisador@instituicao.edu.br"
            placeholderTextColor={colors.textMuted}
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={[styles.hint, { color: colors.textFaint }]}>
            🔒 LGPD: Utilizado unicamente para gestão técnica da chave e alertas de segurança. Zero marketing.
          </Text>

          {/* Propósito */}
          <Text style={[styles.label, { color: colors.text, marginTop: Spacing.md }]}>Declaração de Uso / Propósito *</Text>
          <TextInput
            style={[styles.inputMulti, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex: Trabalho de conclusão de curso sobre transição energética nas eleições 2026..."
            placeholderTextColor={colors.textMuted}
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={3}
            maxLength={300}
          />

          {/* Honeypot invisível */}
          <TextInput
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
            value={websiteHoneypot}
            onChangeText={setWebsiteHoneypot}
            tabIndex={-1}
            autoComplete="off"
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleGenerateKey}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'Gerando Chave Criptográfica...' : '🔑 Gerar Chave de API Gratuita'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card de Chave Gerada */}
        {generatedKey && (
          <View style={[styles.keyCard, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
            <Text style={styles.keyCardTitle}>🎉 Chave de API Emitida com Sucesso!</Text>
            <Text style={styles.keyCardAlert}>
              ⚠️ ATENÇÃO: Por segurança criptográfica (hash SHA-256 irreversível), esta chave não será exibida novamente. Copie e guarde em local protegido.
            </Text>

            <View style={styles.keyBox}>
              <Text style={styles.keyText} selectable>{generatedKey}</Text>
            </View>

            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: copied ? '#059669' : '#10B981' }]}
              onPress={handleCopyKey}
              activeOpacity={0.8}
            >
              <Text style={styles.copyBtnText}>
                {copied ? '✅ Chave Copiada para a Área de Transferência!' : '📋 Copiar Chave de API'}
              </Text>
            </TouchableOpacity>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>Exemplo de Uso via curl:</Text>
              <Text style={styles.exampleCode} selectable>
                {`curl -H "x-api-key: ${generatedKey}" \\\n  http://localhost:3000/api/public/v1/candidates?state=SP`}
              </Text>
            </View>
          </View>
        )}

        {/* Como assinar o Tier PAID */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>💼 Como Ativar o Tier PAID (R$ 200/mês)</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Para garantir sustentabilidade financeira sem recorrer a intermediários ou taxas abusivas de gateway, a assinatura do Tier Profissional é realizada via contrato institucional direto e chave PIX:
          </Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            1. Envie uma mensagem para <Text style={{ fontWeight: '700', color: colors.primary }}>fmourag@gmail.com</Text> com o nome da redação/instituto e CNPJ.{'\n'}
            2. Realize o PIX de R$ 200,00 para a chave oficial de custeio.{'\n'}
            3. Nossa equipe homologa o contrato e emite sua chave de alta vazão (10.000 req/dia) em até 2 horas úteis.
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
  tierGrid: { gap: Spacing.md, marginBottom: Spacing.lg },
  tierCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  tierBadgeText: { fontSize: FontSize.xs, fontWeight: '800' },
  tierTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: 2 },
  tierPrice: { fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.xs },
  tierDetail: { fontSize: FontSize.sm, lineHeight: 22 },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.xs },
  cardDesc: { fontSize: FontSize.sm, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
  },
  inputMulti: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  hint: { fontSize: FontSize.xs, marginTop: 4, fontStyle: 'italic' },
  primaryBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: FontSize.base, fontWeight: '700' },
  keyCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  keyCardTitle: { fontSize: FontSize.md, fontWeight: '700', color: '#065F46', marginBottom: Spacing.xs },
  keyCardAlert: { fontSize: FontSize.xs, color: '#047857', lineHeight: 18, marginBottom: Spacing.md },
  keyBox: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#6EE7B7',
    marginBottom: Spacing.md,
  },
  keyText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: FontSize.xs,
    color: '#065F46',
    fontWeight: '700',
  },
  copyBtn: {
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  copyBtnText: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: '700' },
  exampleBox: {
    backgroundColor: '#1E293B',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  exampleTitle: { color: '#94A3B8', fontSize: FontSize.xs, fontWeight: '700', marginBottom: 4 },
  exampleCode: {
    color: '#38BDF8',
    fontSize: FontSize.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
  paragraph: { fontSize: FontSize.sm, lineHeight: 22, marginBottom: Spacing.xs },
});
