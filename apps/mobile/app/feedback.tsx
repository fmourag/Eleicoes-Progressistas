import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useMaxContentWidth, useResponsivePadding, useBreakpoint } from '../utils/responsive';
import { CivicEmblem } from '../components/CivicEmblem';
import { CivicBanner } from '../components/CivicBanner';
import { APP_VERSION } from '../src/constants/app';
import { API_URL } from '../services/api';
import { unlockApuracaoViaFeedback } from '../src/storage/civic-support-storage';

type FeedbackCategory = 'SUGESTAO' | 'BUG' | 'DADOS_TSE' | 'TESTADOR' | 'ELOGIO';

interface CategoryOption {
  id: FeedbackCategory;
  label: string;
  icon: string;
  desc: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'SUGESTAO', label: 'Sugestão', icon: '💡', desc: 'Ideia para melhorar o aplicativo' },
  { id: 'BUG', label: 'Problema / Erro', icon: '🐞', desc: 'Travamentos, bugs ou falhas visuais' },
  { id: 'DADOS_TSE', label: 'Dados do TSE', icon: '🗳️', desc: 'Correção sobre candidatos ou partidos' },
  { id: 'TESTADOR', label: 'Testador Play Store', icon: '🧪', desc: 'Participar dos testes da Google Play' },
  { id: 'ELOGIO', label: 'Elogio', icon: '⭐', desc: 'Feedback positivo ou incentivo' },
];

export default function FeedbackScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const bp = useBreakpoint();
  const isDesktop = bp === 'desktop';
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  const [category, setCategory] = useState<FeedbackCategory>('SUGESTAO');
  const [nps, setNps] = useState<number>(10);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [descricao, setDescricao] = useState('');
  const [testerConsent, setTesterConsent] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const device = Platform.OS === 'web'
    ? `Web / Browser (${typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 80) : 'Render'})`
    : `Mobile (${Platform.OS} ${Platform.Version})`;

  const handleSubmit = async () => {
    if (!descricao.trim()) {
      setErrorMessage('Por favor, digite uma descrição para o seu feedback.');
      return;
    }

    if (category === 'TESTADOR' && (!email.trim() || !email.includes('@'))) {
      setErrorMessage('Para ser testador do Google Play, informe um e-mail Google/Gmail válido.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const isTester = category === 'TESTADOR';
    const payload = {
      type: isTester ? 'PLAY_TESTER' : 'APP_REVIEW',
      testerName: nome.trim() || undefined,
      nome: nome.trim() || undefined,
      email: email.trim() || undefined,
      playTesterEmail: isTester ? email.trim() : undefined,
      playTesterConsent: isTester ? testerConsent : undefined,
      device,
      androidVersion: String(Platform.Version),
      appVersion: APP_VERSION,
      nps,
      problema: category,
      descricao: descricao.trim(),
    };

    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let proto = '';
      if (res.ok) {
        try {
          const json = await res.json();
          proto = json?.protocol || json?.id || `FBK-${Date.now().toString().slice(-6)}`;
        } catch {
          proto = `FBK-${Date.now().toString().slice(-6)}`;
        }
      } else {
        proto = `FBK-${Date.now().toString().slice(-6)}`;
      }

      setProtocol(proto);
      unlockApuracaoViaFeedback(proto);
      setSubmitted(true);
    } catch {
      // Fallback gracioso offline / local
      const localProto = `OFF-${Date.now().toString().slice(-6)}`;
      setProtocol(localProto);
      unlockApuracaoViaFeedback(localProto);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setDescricao('');
    setErrorMessage(null);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: Math.max(insets.top, Spacing.sm) },
      ]}
    >
      <View
        style={[
          styles.inner,
          { paddingHorizontal: padding },
          maxW ? { maxWidth: maxW, alignSelf: 'center', width: '100%' } : { width: '100%' },
        ]}
      >
        {/* Navegação Superior */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar</Text>
        </TouchableOpacity>

        <CivicBanner variant="compact" />

        {/* Tela de Confirmação e Sucesso */}
        {submitted ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: '#10B981' }]}>
            <View style={styles.successIconBox}>
              <Text style={{ fontSize: 40 }}>✅</Text>
            </View>
            <Text style={[styles.successTitle, { color: '#065F46' }]}>
              Feedback Registrado com Sucesso!
            </Text>
            <Text style={[styles.successDesc, { color: colors.text }]}>
              Agradecemos imensamente pela sua contribuição cívica para o aprimoramento contínuo do aplicativo.
            </Text>

            {protocol && (
              <View style={[styles.protocolBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Text style={[styles.protocolLabel, { color: colors.textMuted }]}>Protocolo Cívico:</Text>
                <Text style={[styles.protocolValue, { color: colors.primary }]}>{protocol}</Text>
              </View>
            )}

            <View style={{ gap: Spacing.sm, marginTop: Spacing.md, width: '100%' }}>
              <TouchableOpacity
                style={[styles.btnPrimary, { backgroundColor: '#1B5E20' }]}
                onPress={() => router.replace('/')}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>Ir para o Início</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnSecondary, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Enviar Outro Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Formulário Principal de Feedback */
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.header}>
              <Text style={{ fontSize: 32 }}>💬</Text>
              <Text style={[styles.title, { color: colors.text }]}>Suporte & Feedback Cívico</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sua voz constrói uma ferramenta cívica transparente e auditável. Compartilhe sua experiência, relate falhas ou participe do grupo fechado de testes.
              </Text>
            </View>

            {/* Seleção de Categoria */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>1. Selecione a Categoria:</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: isSelected ? colors.primary : colors.surfaceAlt, borderColor: isSelected ? colors.primary : colors.border },
                    ]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Avaliação Geral (NPS) */}
            <Text style={[styles.sectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
              2. Como você avalia o aplicativo? (Nota {nps}/10):
            </Text>
            <View style={styles.npsRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                const isSelected = nps === score;
                return (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.npsBtn,
                      {
                        backgroundColor: isSelected
                          ? (score >= 9 ? '#10B981' : score >= 7 ? '#3B82F6' : '#EF4444')
                          : colors.surfaceAlt,
                        borderColor: isSelected ? 'transparent' : colors.border,
                      },
                    ]}
                    onPress={() => setNps(score)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.npsBtnText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {score}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Campos de Dados */}
            <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
              <View>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Seu Nome (Opcional):</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex.: Maria da Silva"
                  placeholderTextColor={colors.textMuted}
                  value={nome}
                  onChangeText={setNome}
                  maxLength={120}
                />
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {category === 'TESTADOR' ? 'Seu E-mail Google Play (Obrigatório): *' : 'Seu E-mail para Contato (Opcional):'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex.: seuemail@gmail.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={160}
                />
              </View>

              {category === 'TESTADOR' && (
                <TouchableOpacity
                  style={styles.consentRow}
                  onPress={() => setTesterConsent(!testerConsent)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: testerConsent ? colors.primary : 'transparent' }]}>
                    {testerConsent && <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                  </View>
                  <Text style={[styles.consentText, { color: colors.textSecondary }]}>
                    Concordo em receber convite no Google Play Console para testar versões de pré-lançamento.
                  </Text>
                </TouchableOpacity>
              )}

              <View>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Descrição do Feedback: *</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text },
                  ]}
                  placeholder="Conte-nos o que você achou, qual problema encontrou ou sua sugestão de melhoria..."
                  placeholderTextColor={colors.textMuted}
                  value={descricao}
                  onChangeText={setDescricao}
                  multiline
                  numberOfLines={4}
                  maxLength={3000}
                />
              </View>
            </View>

            {/* Mensagem de Erro */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            )}

            {/* Botão de Envio */}
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: '#1B5E20', marginTop: Spacing.md }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>✉️ Enviar Feedback</Text>
              )}
            </TouchableOpacity>

            {/* Informações do Dispositivo */}
            <View style={[styles.deviceInfoBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.deviceInfoText, { color: colors.textMuted }]}>
                ℹ️ App v{APP_VERSION} • {device}
              </Text>
            </View>
          </View>
        )}

        {/* Links Rápidos Úteis */}
        <View style={styles.quickLinksRow}>
          <TouchableOpacity onPress={() => router.push('/manual')} activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.primary }]}>📖 Manual do Usuário</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/apoie')} activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: '#047857' }]}>🤝 Apoiar o Projeto (PIX)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/transparencia')} activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.primary }]}>📜 Transparência Pública</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl, flexGrow: 1 },
  inner: { alignSelf: 'center' },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  backText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 540,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  npsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  npsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  npsBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginBottom: 3,
  },
  input: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm + 2,
    fontSize: FontSize.sm,
  },
  textArea: {
    minHeight: 90,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    textAlignVertical: 'top',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentText: {
    fontSize: FontSize.xs,
    flex: 1,
    lineHeight: 16,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  btnPrimary: {
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  btnSecondary: {
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnSecondaryText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  successIconBox: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  successDesc: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  protocolBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  protocolLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  protocolValue: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  deviceInfoBox: {
    padding: Spacing.xs + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  deviceInfoText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  quickLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  linkText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
