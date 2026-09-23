import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useIsDesktop } from '../utils/responsive';
import { useColaStore, COLA_SLOTS } from '../stores/cola.store';
import { useLocationStore } from '../stores/location.store';
import { getCandidatePhotoUrl, API_URL } from '../services/api';
import { PixApoio } from './PixApoio';
import { ApoioVoluntarioBanner } from './ApoioVoluntarioBanner';
import { storeReviewService } from '../services/store-review.service';

interface ColaModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCargoToChoose?: (cargo: string) => void;
}

const VOTING_SEQUENCE = COLA_SLOTS.map((s, idx) => ({
  ...s,
  orderNum: `${idx + 1}º`,
}));

export function ColaModal({ visible, onClose, onSelectCargoToChoose }: ColaModalProps) {
  const colors = useThemeColors();
  const isDesktop = useIsDesktop();
  const {
    selectedCandidates,
    removeCandidateByCargo,
    clearCola,
    getSelectedList,
    setHasGeneratedPdfInSession,
    hydrateCola,
    saveCola,
  } = useColaStore();
  const { location } = useLocationStore();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Garante a hidratação da cola gravada em disco sempre que o modal é aberto
  useEffect(() => {
    if (visible) {
      hydrateCola?.();
    }
  }, [visible, hydrateCola]);

  const selectedList = getSelectedList();
  const selectedIds = selectedList.map((c) => c.id).join(',');
  const userUf = location?.uf || 'BR';
  const userMun = location?.municipality || '';

  const apiUrl = API_URL;
  const pdfViewUrl = `${apiUrl}/api/cola/pdf?ids=${encodeURIComponent(selectedIds)}&state=${encodeURIComponent(userUf)}&municipality=${encodeURIComponent(userMun)}`;
  const pdfDownloadUrl = `${apiUrl}/api/cola/pdf/download?ids=${encodeURIComponent(selectedIds)}&state=${encodeURIComponent(userUf)}&municipality=${encodeURIComponent(userMun)}`;

  async function getLocalPdfUri(): Promise<string> {
    const targetFile = `${FileSystem.cacheDirectory}cola-eleitoral-2026.pdf`;
    const downloadResult = await FileSystem.downloadAsync(pdfDownloadUrl, targetFile);
    return downloadResult.uri;
  }

  async function handleShare() {
    setHasGeneratedPdfInSession(true);
    storeReviewService.recordPdfGenerated();

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(pdfViewUrl, '_blank');
      }
      return;
    }

    try {
      setLoadingAction('share');
      const localUri = await getLocalPdfUri();
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar Cola Eleitoral',
          UTI: 'com.adobe.pdf',
        });
      } else {
        await Linking.openURL(pdfViewUrl);
      }
    } catch (e) {
      console.warn('Erro ao compartilhar PDF:', e);
      Alert.alert(
        'Compartilhar',
        'Não foi possível compartilhar o arquivo PDF. Verifique sua conexão com a internet.',
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function handleCopyText() {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`Cola eleitoral anexa:\n\n${pdfViewUrl}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  }

  function handleSaveCola() {
    saveCola();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isDesktop && styles.modalCardDesktop,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>📝 Minha Cola Eleitoral 2026</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                {selectedList.length} de {VOTING_SEQUENCE.length} cargos preenchidos • {userUf}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content com Rolagem e Responsividade 100% no Mobile e Web */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            overScrollMode="always"
          >
            {/* Aviso do TSE */}
            <View style={styles.tseAlert}>
              <Text style={styles.tseAlertTitle}>⚖️ AVISO OFICIAL DA JUSTIÇA ELEITORAL (TSE):</Text>
              <Text style={styles.tseAlertText}>
                É <Text style={styles.bold}>100% permitido</Text> levar sua colinha impressa em papel para a cabine de votação.
                No entanto, é <Text style={styles.bold}>proibido entrar na cabine com celular ou câmera</Text> (Resolução TSE nº 23.736/2024).
                Imprima o documento em PDF ou copie os números no papel!
              </Text>
            </View>

            {/* Quick Action Buttons Toolbar */}
            <View style={styles.actionToolbar}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary, flex: 1, marginRight: 8 }]}
                onPress={handleShare}
                activeOpacity={0.8}
                disabled={selectedList.length === 0 || !!loadingAction}
              >
                {loadingAction === 'share' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionBtnText}>📤 Compartilhar Cola (PDF)</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryActionBtn, { backgroundColor: saveSuccess ? '#047857' : colors.surfaceAlt, borderColor: saveSuccess ? '#047857' : colors.border, flex: 1 }]}
                onPress={handleSaveCola}
                activeOpacity={0.8}
                disabled={selectedList.length === 0}
              >
                <Text style={[styles.secondaryActionBtnText, { color: saveSuccess ? '#FFFFFF' : colors.text }]}>
                  {saveSuccess ? '✅ Salvo!' : '💾 Salvar Cola'}
                </Text>
              </TouchableOpacity>
            </View>

            {copySuccess && (
              <View style={styles.copyNotice}>
                <Text style={styles.copyNoticeText}>✓ Link da Cola copiado com sucesso!</Text>
              </View>
            )}
            
            {saveSuccess && (
              <View style={[styles.copyNotice, { backgroundColor: '#047857' }]}>
                <Text style={[styles.copyNoticeText, { color: '#FFFFFF' }]}>✓ Cola eleitoral salva no dispositivo!</Text>
              </View>
            )}

            {/* Section Title */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🗳️ Ordem de Votação na Urna Eletrônica
            </Text>

            {/* List of 6 voting slots */}
            {VOTING_SEQUENCE.map((seq) => {
              const cand = selectedCandidates[seq.key];

              if (cand) {
                const digits = cand.numeroUrna.split('');
                const photoSrc = getCandidatePhotoUrl(cand.photoUrl || cand.tseId);

                return (
                  <View
                    key={seq.key}
                    style={[
                      styles.candidateCard,
                      { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    ]}
                  >
                    {/* Header do Cargo */}
                    <View style={styles.cargoHeaderRow}>
                      <View style={styles.cargoTag}>
                        <Text style={styles.cargoTagOrder}>{seq.orderLabel}</Text>
                        <Text style={styles.cargoTagTitle}>• {seq.title} ({seq.digits} dígitos)</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeCandidateByCargo(seq.key)}
                        style={styles.removeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.removeBtnText}>✕ Remover</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Conteúdo do Candidato */}
                    <View style={styles.cardMainRow}>
                      {/* Foto */}
                      <View style={[styles.photoContainer, { borderColor: colors.border }]}>
                        {photoSrc ? (
                          <Image
                            source={{ uri: photoSrc }}
                            style={styles.photoImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.avatarFallback, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.avatarInitials, { color: colors.primary }]}>
                              {cand.name.substring(0, 2).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Dados */}
                      <View style={styles.cardInfo}>
                        <Text style={[styles.candidateName, { color: colors.text }]} numberOfLines={1}>
                          {cand.name}
                        </Text>
                        {cand.viceName && (
                          <Text style={[styles.candidateVice, { color: colors.textMuted }]} numberOfLines={1}>
                            Vice: {cand.viceName}
                          </Text>
                        )}
                        <Text style={[styles.candidateParty, { color: colors.primary }]}>
                          {cand.party}{cand.partyNumber ? ` • ${cand.partyNumber}` : ''}
                        </Text>
                        <Text style={styles.fichaLimpaBadge}>
                          ✓ Registro TSE • Ficha Limpa
                        </Text>
                      </View>

                      {/* Dígitos da Urna */}
                      <View style={styles.digitsWrapper}>
                        <Text style={styles.digitsLabel}>Nº NA URNA</Text>
                        <View style={styles.digitsRow}>
                          {digits.map((d, i) => (
                            <View key={i} style={styles.digitBox}>
                              <Text style={styles.digitNumber}>{d}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }

              return (
                <View
                  key={seq.key}
                  style={[
                    styles.emptySlotCard,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                >
                  <View style={styles.emptySlotLeft}>
                    <View style={styles.emptySlotTag}>
                      <Text style={styles.emptySlotOrder}>{seq.orderLabel}</Text>
                      <Text style={[styles.emptySlotCargo, { color: colors.text }]}>• {seq.title}</Text>
                    </View>
                    <Text style={[styles.emptySlotNotice, { color: colors.textMuted }]}>
                      Nenhum(a) candidato(a) escolhido(a) ainda ({seq.digits} dígitos)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.chooseBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      onClose();
                      onSelectCargoToChoose?.((seq as any).cargo || seq.key);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chooseBtnText}>+ Escolher</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Clear button e Ações de rodapé */}
            {selectedList.length > 0 && (
              <View style={styles.footerRow}>
                <TouchableOpacity onPress={handleCopyText} style={styles.copyBtn}>
                  <Text style={[styles.copyBtnText, { color: colors.primary }]}>📋 Copiar Link da Cola</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={clearCola} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>🗑️ Limpar Toda a Cola</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Banner de Apoio Voluntário para Manutenção da Cola */}
            <ApoioVoluntarioBanner
              variant="compact"
              title="Apoie a Manutenção da Cola Eleitoral Gratuita"
              style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}
            />
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
    padding: Spacing.sm,
  },
  modalCard: {
    width: '100%',
    maxWidth: 720,
    height: Platform.OS === 'web' ? undefined : '90%',
    maxHeight: '92%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalCardDesktop: {
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 90,
    gap: Spacing.md,
    flexGrow: 1,
  },
  tseAlert: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  tseAlertTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  tseAlertText: {
    fontSize: FontSize.xs,
    color: '#78350F',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
  },
  actionToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: 4,
  },
  primaryActionBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  secondaryActionBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 90,
  },
  secondaryActionBtnText: {
    fontWeight: '600',
    fontSize: FontSize.sm,
    color: '#FFFFFF',
  },
  copyNotice: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  copyNoticeText: {
    color: '#15803D',
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginTop: 6,
  },
  candidateCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cargoHeaderRow: {
    backgroundColor: '#1E293B',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cargoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cargoTagOrder: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: FontSize.xs,
  },
  cargoTagTitle: {
    color: '#F1F5F9',
    fontWeight: '600',
    fontSize: FontSize.xs,
  },
  removeBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  removeBtnText: {
    color: '#F87171',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  cardMainRow: {
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  photoContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  candidateName: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  candidateVice: {
    fontSize: FontSize.xs,
  },
  candidateParty: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  fichaLimpaBadge: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
  },
  digitsWrapper: {
    alignItems: 'center',
  },
  digitsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  digitsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  digitBox: {
    width: 24,
    height: 32,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  emptySlotCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptySlotLeft: {
    flex: 1,
  },
  emptySlotTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  emptySlotOrder: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#0284C7',
  },
  emptySlotCargo: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  emptySlotNotice: {
    fontSize: FontSize.xs,
  },
  chooseBtn: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  chooseBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  copyBtn: {
    padding: Spacing.xs,
  },
  copyBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
