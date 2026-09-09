import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocationStore } from '../stores/location.store';
import { fetchUserLocationWithConsent } from '../services/location.service';
import { useThemeColors, Radius, Spacing, FontSize } from '../utils/theme';

export function LocationConsentModal() {
  const { consentModalVisible, closeConsentModal, setConsent, setLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colors = useThemeColors();

  // Exibido apenas quando acionado (ex.: botão "Usar GPS" na home)
  if (!consentModalVisible) {
    return null;
  }

  async function handleAccept() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const locationData = await fetchUserLocationWithConsent();
      setLocation(locationData);
      setConsent(true);
      closeConsentModal();
    } catch (err: any) {
      setErrorMessage('Não foi possível obter o GPS. Selecione o local manualmente abaixo.');
    } finally {
      setLoading(false);
    }
  }

  function handleDecline() {
    setConsent(false);
    closeConsentModal();
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={consentModalVisible}
      onRequestClose={handleDecline}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header Icon */}
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.iconText}>📍</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Encontre Candidatos da sua Região
          </Text>

          {/* LGPD Compliance Notice */}
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Em estrita conformidade com a <Text style={{ fontWeight: 'bold', color: colors.primary }}>LGPD (Lei 13.709/2018)</Text>, solicitamos permissão para identificar sua cidade e Estado.
          </Text>

          {/* Info Points */}
          <View style={[styles.infoBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              🔒 <Text style={styles.bold}>Privacidade Total:</Text> Suas coordenadas são processadas localmente e nunca vinculadas ao seu nome ou CPF.
            </Text>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              🎯 <Text style={styles.bold}>Finalidade Exclusiva:</Text> Exibir os candidatos e propostas do seu município e Estado.
            </Text>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              🛡️ <Text style={styles.bold}>Livre Opção:</Text> Você pode recusar e utilizar o aplicativo normalmente a qualquer momento.
            </Text>
          </View>

          {errorMessage ? (
            <Text style={[styles.errorText, { color: colors.errorText }]}>{errorMessage}</Text>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
              onPress={handleAccept}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnPrimaryText}>Autorizar Localização</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSecondary, { borderColor: colors.border }]}
              onPress={handleDecline}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnSecondaryText, { color: colors.textMuted }]}>
                Agora Não (Manter Geral)
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerNotice, { color: colors.textFaint }]}>
            Conforme Art. 7º, I da LGPD • Consentimento Revogável
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 5,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  infoBox: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoItem: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
  },
  errorText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  btnPrimary: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: 'bold',
  },
  btnSecondary: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnSecondaryText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  footerNotice: {
    fontSize: 10,
    textAlign: 'center',
  },
});
