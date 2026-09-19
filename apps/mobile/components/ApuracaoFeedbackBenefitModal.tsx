import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { unlockApuracaoViaFeedback } from '../src/storage/civic-support-storage';
import { API_URL } from '../services/api';
import { APP_VERSION } from '../src/constants/app';

interface ApuracaoFeedbackBenefitModalProps {
  visible: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
}

type ModalStep = 'PROMPT' | 'FORM' | 'SUCCESS_5S';

const PROBLEMA_OPTIONS = [
  { value: 'nenhum', label: '✅ Nenhum problema — Tudo funcionou com sucesso' },
  { value: 'sugestao', label: '💡 Sugestão para o aplicativo' },
  { value: 'layout', label: '📱 Ajuste visual ou texto' },
  { value: 'fotos', label: '📸 Foto ou dado de candidato' },
  { value: 'outro', label: '📝 Outro comentário' },
];

export function ApuracaoFeedbackBenefitModal({
  visible,
  onClose,
  onUnlocked,
}: ApuracaoFeedbackBenefitModalProps) {
  const colors = useThemeColors();
  const [step, setStep] = useState<ModalStep>('PROMPT');
  const [nps, setNps] = useState<number>(10);
  const [problema, setProblema] = useState<string>('nenhum');
  const [descricao, setDescricao] = useState<string>('');
  const [testerName, setTesterName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reinicia estado ao abrir o modal
  useEffect(() => {
    if (visible) {
      setStep('PROMPT');
      setNps(10);
      setProblema('nenhum');
      setDescricao('');
      setErrorMessage(null);
      setCountdown(5);
    } else {
      clearTimers();
    }
  }, [visible]);

  function clearTimers() {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }

  // Timer de 5 segundos para a tela de confirmação de liberação
  useEffect(() => {
    if (step === 'SUCCESS_5S') {
      setCountdown(5);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      closeTimeoutRef.current = setTimeout(() => {
        handleClose();
      }, 5000);
    }

    return () => {
      clearTimers();
    };
  }, [step]);

  function handleClose() {
    clearTimers();
    onClose();
  }

  function handleGoToApuracao() {
    handleClose();
    router.push('/apuracao');
  }

  async function handleSubmitFeedback() {
    setSubmitting(true);
    setErrorMessage(null);

    let device = 'Navegador Web';
    let os = Platform.OS;
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) device = 'Android Device';
      else if (/iPhone|iPad/i.test(ua)) device = 'iOS Device';
      else if (/Windows/i.test(ua)) device = 'PC Windows';
      else if (/Macintosh/i.test(ua)) device = 'Mac';
    }

    const payload = {
      testerName: testerName.trim() || undefined,
      nome: testerName.trim() || undefined,
      email: email.trim() || undefined,
      device,
      androidVersion: os,
      appVersion: APP_VERSION,
      nps,
      problema,
      descricao: descricao.trim() || 'Feedback enviado via conclusão da cola eleitoral',
    };

    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let protocol = '';
      if (res.ok) {
        try {
          const json = await res.json();
          protocol = json?.protocol || json?.id || '';
        } catch {}
      }

      // Libera a apuração no dispositivo
      unlockApuracaoViaFeedback(protocol);
      onUnlocked?.();

      // Transiciona para a janela de 5 segundos
      setStep('SUCCESS_5S');
    } catch {
      // Mesmo se houver falha de rede temporária no feedback, garante a liberação do usuário
      unlockApuracaoViaFeedback();
      onUnlocked?.();
      setStep('SUCCESS_5S');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={step === 'SUCCESS_5S' ? handleClose : onClose}
    >
      <Pressable style={styles.overlay} onPress={step === 'SUCCESS_5S' ? handleClose : onClose}>
        <Pressable
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={(e: any) => e?.stopPropagation?.()}
        >
          {/* ======================================================== */}
          {/* ETAPA 1: PROMPT DO BENEFÍCIO (Pop-Up Solicitado)          */}
          {/* ======================================================== */}
          {step === 'PROMPT' && (
            <View style={styles.promptContainer}>
              <View style={[styles.iconWrap, { backgroundColor: '#E8F5E9' }]}>
                <Text style={{ fontSize: 32 }}>🗳️</Text>
              </View>

              <Text style={[styles.badgeText, { color: '#16a34a' }]}>
                BENEFÍCIO CÍVICO EXCLUSIVO
              </Text>

              <Text style={[styles.mainMessage, { color: colors.text }]}>
                Preencha o formulario de FeedBack  e tenha acesso a apuração de seus candidatos
              </Text>

              <Text style={[styles.subMessage, { color: colors.textMuted }]}>
                Ao enviar suas impressões, a apuração oficial do TSE em tempo real será liberada permanentemente neste aparelho.
              </Text>

              {/* Dois botões lado a lado */}
              <View style={styles.buttonRow}>
                {/* Botão Amarelo: Mais Tarde */}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnYellow]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnYellowText}>Mais Tarde</Text>
                </TouchableOpacity>

                {/* Botão Verde: Quero esse beneficio */}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnGreen]}
                  onPress={() => setStep('FORM')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnGreenText}>Quero esse beneficio</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* ETAPA 2: FORMULÁRIO DE FEEDBACK INTEGRADO                */}
          {/* ======================================================== */}
          {step === 'FORM' && (
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  📝 Formulário de Avaliação
                </Text>
                <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
                  Ajude a aprimorar o app e libere o monitor de votos ao vivo
                </Text>
              </View>

              {/* NPS */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Qual a probabilidade de recomendar este app? (0 a 10) *
                </Text>
                <View style={styles.npsRow}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                    const isSelected = nps === val;
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.npsBtn,
                          {
                            backgroundColor: isSelected ? '#16a34a' : colors.surfaceAlt,
                            borderColor: isSelected ? '#16a34a' : colors.border,
                          },
                        ]}
                        onPress={() => setNps(val)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.npsBtnText,
                            { color: isSelected ? '#FFFFFF' : colors.text },
                          ]}
                        >
                          {val}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Tipo de Feedback */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Status do Teste / Avaliação *
                </Text>
                <View style={styles.pillsContainer}>
                  {PROBLEMA_OPTIONS.map((opt) => {
                    const isSelected = problema === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.pillBtn,
                          {
                            backgroundColor: isSelected ? '#DCFCE7' : colors.surfaceAlt,
                            borderColor: isSelected ? '#16a34a' : colors.border,
                          },
                        ]}
                        onPress={() => setProblema(opt.value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.pillBtnText,
                            { color: isSelected ? '#15803D' : colors.text },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Comentário */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Observações ou sugestões (Opcional)
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.surfaceAlt,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Ex.: Gostei da colinha eleitoral, tudo funcionou perfeitamente..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={descricao}
                  onChangeText={setDescricao}
                />
              </View>

              {/* Nome opcional */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Seu Nome (Opcional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceAlt,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Ex.: Maria Silva ou Eleitor Cívico"
                  placeholderTextColor={colors.textMuted}
                  value={testerName}
                  onChangeText={setTesterName}
                />
              </View>

              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              {/* Botões do Formulário */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnYellow, { flex: 0.8 }]}
                  onPress={() => setStep('PROMPT')}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnYellowText}>← Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnGreen, { flex: 1.2 }]}
                  onPress={handleSubmitFeedback}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnGreenText}>🚀 Enviar & Liberar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* ======================================================== */}
          {/* ETAPA 3: CONFIRMAÇÃO POR 5 SEGUNDOS                       */}
          {/* ======================================================== */}
          {step === 'SUCCESS_5S' && (
            <View style={styles.promptContainer}>
              <View style={[styles.iconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Text style={{ fontSize: 36 }}>🎉</Text>
              </View>

              <Text style={[styles.successTitle, { color: '#15803D' }]}>
                Funcionalidade de Apuração Liberada
              </Text>

              <Text style={[styles.successDesc, { color: colors.text }]}>
                Obrigado pelo seu feedback! O acesso à apuração em tempo real dos seus candidatos do TSE já está disponível no seu dispositivo.
              </Text>

              {/* Contador regressivo visual */}
              <View style={styles.timerBadge}>
                <Text style={styles.timerBadgeText}>
                  ⏳ Fechando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
                </Text>
              </View>

              {/* Botão para ir direto se desejar */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnGreen, { width: '100%', marginTop: Spacing.md }]}
                onPress={handleGoToApuracao}
                activeOpacity={0.8}
              >
                <Text style={styles.btnGreenText}>🗳️ Ver Apuração dos Candidatos</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  promptContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  mainMessage: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.sm,
  },
  subMessage: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGreen: {
    backgroundColor: '#16a34a',
  },
  btnGreenText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
    textAlign: 'center',
  },
  btnYellow: {
    backgroundColor: '#d97706',
  },
  btnYellowText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
    textAlign: 'center',
  },
  formScroll: {
    width: '100%',
  },
  formContent: {
    padding: Spacing.lg,
  },
  formHeader: {
    marginBottom: Spacing.base,
  },
  formTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: Spacing.base,
  },
  fieldLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  npsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  npsBtn: {
    width: 32,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  npsBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillsContainer: {
    gap: 6,
  },
  pillBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  pillBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSize.sm,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#dc2626',
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successDesc: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  timerBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  timerBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#4B5563',
  },
});
