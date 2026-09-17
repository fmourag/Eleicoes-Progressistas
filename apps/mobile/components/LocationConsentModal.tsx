import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocationStore } from '../stores/location.store';
import { fetchUserLocationWithConsent, IBGE_MAP } from '../services/location.service';
import { useThemeColors, Radius, Spacing, FontSize } from '../utils/theme';

export function LocationConsentModal() {
  const { consentModalVisible, closeConsentModal, setConsent, setLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
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
    } catch {
      setErrorMessage('GPS indisponível ou permissão negada. Selecione seu Estado abaixo:');
      setShowManualSelection(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectUf(uf: string) {
    const loc = IBGE_MAP[uf] || { uf, municipality: '', ibge_code: '' };
    setLocation(loc);
    setConsent(true);
    closeConsentModal();
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
              Em estrita conformidade com a <Text style={{ fontWeight: 'bold', color: colors.primary }}>LGPD (Lei 13.709/2018)</Text>, identificamos seu Estado para exibir os candidatos da sua circunscrição eleitoral.
            </Text>

            {/* Info Points */}
            <View style={[styles.infoBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
                🔒 <Text style={styles.bold}>Privacidade Total:</Text> Suas coordenadas são processadas localmente e nunca vinculadas ao seu nome ou CPF.
              </Text>
              <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
                🎯 <Text style={styles.bold}>Finalidade Exclusiva:</Text> Exibir Governador(a), Senador(a) e Deputados do seu Estado.
              </Text>
              <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
                🛡️ <Text style={styles.bold}>Livre Opção:</Text> Você pode autorizar o GPS ou selecionar sua UF manualmente.
              </Text>
            </View>

            {errorMessage ? (
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                <Text style={[styles.errorText, { color: '#991B1B' }]}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Seletor Manual Rápido de Estados */}
            {(showManualSelection || errorMessage) ? (
              <View style={styles.manualSelectionContainer}>
                <Text style={[styles.manualSelectionTitle, { color: colors.text }]}>
                  Selecione seu Estado (UF):
                </Text>
                <View style={styles.ufGrid}>
                  {Object.keys(IBGE_MAP).map((uf) => (
                    <TouchableOpacity
                      key={uf}
                      style={[styles.ufChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                      onPress={() => handleSelectUf(uf)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.ufChipText, { color: colors.text }]}>{uf}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
                  <Text style={styles.btnPrimaryText}>🛰️ Autorizar GPS Nativo</Text>
                )}
              </TouchableOpacity>

              {!showManualSelection && !errorMessage ? (
                <TouchableOpacity
                  style={[styles.btnManual, { borderColor: colors.primary, backgroundColor: colors.surfaceAlt }]}
                  onPress={() => setShowManualSelection(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.btnManualText, { color: colors.primary }]}>
                    🗺️ Escolher Estado Manualmente
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[styles.btnSecondary, { borderColor: colors.border }]}
                onPress={handleDecline}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={[styles.btnSecondaryText, { color: colors.textMuted }]}>
                  Ver Todos os Candidatos (Brasil)
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.footerNotice, { color: colors.textFaint }]}>
              Conforme Art. 7º, I da LGPD • Consentimento Revogável
            </Text>
          </ScrollView>
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
  scrollContent: {
    alignItems: 'center',
    width: '100%',
  },
  errorBox: {
    width: '100%',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  manualSelectionContainer: {
    width: '100%',
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  manualSelectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  ufGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    maxHeight: 140,
  },
  ufChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minWidth: 36,
    alignItems: 'center',
  },
  ufChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
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
  btnManual: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnManualText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
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
