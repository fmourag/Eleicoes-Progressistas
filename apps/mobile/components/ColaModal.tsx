import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useBreakpoint } from '../utils/responsive';
import { useColaStore, ColaCandidate, COLA_SLOTS } from '../stores/cola.store';
import { useLocationStore } from '../stores/location.store';
import { getCandidatePhotoUrl, API_URL } from '../services/api';
import { PixApoio } from './PixApoio';

interface ColaModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCargoToChoose?: (cargo: string) => void;
}

const VOTING_SEQUENCE = COLA_SLOTS;

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0]?.substring(0, 2).toUpperCase() || 'CA';
  return `${parts[0]?.substring(0, 1)}${parts[parts.length - 1]?.substring(0, 1)}`.toUpperCase();
}

export function ColaModal({ visible, onClose, onSelectCargoToChoose }: ColaModalProps) {
  const colors = useThemeColors();
  const bp = useBreakpoint();
  const isDesktop = bp === 'desktop';

  const {
    selectedCandidates,
    removeCandidateByCargo,
    clearCola,
    getSelectedList,
    hasGeneratedPdfInSession,
    setHasGeneratedPdfInSession,
  } = useColaStore();
  const { location } = useLocationStore();

  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedList = getSelectedList();
  const selectedIds = selectedList.map((c) => c.id).join(',');
  const userUf = location?.uf || 'BR';
  const userMun = location?.municipality || '';

  const apiUrl = API_URL;
  const pdfViewUrl = `${apiUrl}/api/cola/pdf?ids=${encodeURIComponent(selectedIds)}&state=${encodeURIComponent(userUf)}&municipality=${encodeURIComponent(userMun)}`;
  const pdfDownloadUrl = `${apiUrl}/api/cola/pdf/download?ids=${encodeURIComponent(selectedIds)}&state=${encodeURIComponent(userUf)}&municipality=${encodeURIComponent(userMun)}`;

  function handleViewPdf() {
    setHasGeneratedPdfInSession(true);
    if (typeof window !== 'undefined') {
      window.open(pdfViewUrl, '_blank');
    } else {
      Linking.openURL(pdfViewUrl);
    }
  }

  function handleDownloadPdf() {
    setHasGeneratedPdfInSession(true);
    setDownloading(true);
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = pdfDownloadUrl;
      link.download = 'cola-eleitoral-2026.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setDownloading(false), 1500);
    } else {
      Linking.openURL(pdfDownloadUrl);
      setTimeout(() => setDownloading(false), 1500);
    }
  }

  function handlePrint() {
    setHasGeneratedPdfInSession(true);
    if (typeof window !== 'undefined') {
      window.open(pdfViewUrl, '_blank');
    } else {
      Linking.openURL(pdfViewUrl);
    }
  }

  function generateShareText(): string {
    const lines: string[] = [
      '🏛️ *MINHA COLA ELEITORAL 2026* 🇧🇷',
      'Plataforma Eleições Progressistas • Voto Consciente & Ficha Limpa',
      `📍 Circunscrição: ${userUf}${userMun ? ' • ' + userMun : ''}`,
      '----------------------------------------',
      '🗳️ *SEQUÊNCIA OFICIAL NA URNA:*',
      '',
    ];

    for (const seq of VOTING_SEQUENCE) {
      const cand = selectedCandidates[seq.key];
      if (cand) {
        lines.push(`▶ *${seq.orderLabel} • ${seq.title.toUpperCase()}*`);
        lines.push(`   👤 Candidato(a): *${cand.name}*`);
        if (cand.viceName) lines.push(`   🤝 Vice: ${cand.viceName}`);
        lines.push(`   🏷️ Partido: ${cand.party}${cand.partyNumber ? ' (' + cand.partyNumber + ')' : ''}`);
        lines.push(`   🔢 *NÚMERO NA URNA: [ ${cand.numeroUrna.split('').join(' ')} ]*`);
        lines.push('');
      } else {
        lines.push(`▶ *${seq.orderLabel} • ${seq.title.toUpperCase()}*`);
        lines.push(`   [ Ainda não definido ]`);
        lines.push('');
      }
    }

    lines.push('----------------------------------------');
    lines.push('📄 _Resolução TSE nº 23.736/2024: É permitido levar colinha em papel para a cabine de votação._');
    lines.push('📲 Baixe o App Eleições Progressistas: https://eleicoes-progressistas.onrender.com/download');

    return lines.join('\n');
  }

  function handleShareWhatsApp() {
    setHasGeneratedPdfInSession(true);
    const text = generateShareText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    Linking.openURL(url);
  }

  function handleShareEmail() {
    setHasGeneratedPdfInSession(true);
    const text = generateShareText();
    const subject = encodeURIComponent('Minha Cola Eleitoral 2026 - Eleições Progressistas');
    const body = encodeURIComponent(text);
    const url = `mailto:?subject=${subject}&body=${body}`;
    Linking.openURL(url);
  }

  function handleCopyText() {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generateShareText());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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

          {/* Scrollable Content */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
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
                style={[styles.primaryActionBtn, { backgroundColor: '#047857' }]}
                onPress={handleViewPdf}
                activeOpacity={0.8}
                disabled={selectedList.length === 0}
              >
                <Text style={styles.primaryActionBtnText}>👁️ Visualizar PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleDownloadPdf}
                activeOpacity={0.8}
                disabled={selectedList.length === 0 || downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionBtnText}>⬇️ Baixar PDF</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionBtn, { backgroundColor: '#25D366' }]}
                onPress={handleShareWhatsApp}
                activeOpacity={0.8}
                disabled={selectedList.length === 0}
              >
                <Text style={styles.secondaryActionBtnText}>💬 WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={handleShareEmail}
                activeOpacity={0.8}
                disabled={selectedList.length === 0}
              >
                <Text style={[styles.secondaryActionBtnText, { color: colors.text }]}>✉️ E-mail</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={handlePrint}
                activeOpacity={0.8}
                disabled={selectedList.length === 0}
              >
                <Text style={[styles.secondaryActionBtnText, { color: colors.text }]}>🖨️ Imprimir</Text>
              </TouchableOpacity>
            </View>

            {copySuccess && (
              <View style={styles.copyNotice}>
                <Text style={styles.copyNoticeText}>✓ Cola copiada para a área de transferência com sucesso!</Text>
              </View>
            )}

            {/* Apoio Pontual via PIX pós-geração/compartilhamento */}
            {hasGeneratedPdfInSession && (
              <PixApoio compact />
            )}

            {/* Voting sequence list */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🗳️ Ordem de Votação na Urna Eletrônica
            </Text>

            {VOTING_SEQUENCE.map((seq, index) => {
              const cand = selectedCandidates[seq.key];

              if (cand) {
                const resolvedPhoto = getCandidatePhotoUrl(cand.photoUrl, cand.tseId, cand.cargo, cand.name, cand.id);
                const digits = cand.numeroUrna.split('');

                return (
                  <View
                    key={seq.key}
                    style={[styles.candidateCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  >
                    {/* Cargo Header */}
                    <View style={styles.cargoHeaderRow}>
                      <View style={styles.cargoTag}>
                        <Text style={styles.cargoTagOrder}>{seq.orderLabel}</Text>
                        <Text style={styles.cargoTagTitle}>• {seq.title} ({seq.digits} dígitos)</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeCandidateByCargo(seq.key)}
                        style={styles.removeBtn}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={styles.removeBtnText}>✕ Remover</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardMainRow}>
                      {/* Photo or Initials */}
                      <View style={[styles.photoContainer, { borderColor: colors.primary }]}>
                        {resolvedPhoto ? (
                          <Image source={{ uri: resolvedPhoto }} style={styles.photoImage} resizeMode="cover" />
                        ) : (
                          <View style={[styles.avatarFallback, { backgroundColor: colors.primaryLight }]}>
                            <Text style={[styles.avatarInitials, { color: colors.primary }]}>
                              {getInitials(cand.name)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Info */}
                      <View style={styles.cardInfo}>
                        <Text style={[styles.candidateName, { color: colors.text }]} numberOfLines={1}>
                          {cand.name}
                        </Text>
                        {cand.viceName && (
                          <Text style={[styles.candidateVice, { color: colors.textMuted }]} numberOfLines={1}>
                            Vice: {cand.viceName}
                          </Text>
                        )}
                        <Text style={[styles.candidateParty, { color: '#047857' }]}>
                          {cand.party} {cand.partyNumber ? `• ${cand.partyNumber}` : ''}
                        </Text>
                        <Text style={styles.fichaLimpaBadge}>✓ Registro TSE • Ficha Limpa</Text>
                      </View>

                      {/* Digit boxes in Urna style */}
                      <View style={styles.digitsWrapper}>
                        <Text style={styles.digitsLabel}>Nº NA URNA</Text>
                        <View style={styles.digitsRow}>
                          {digits.map((digit, dIdx) => (
                            <View key={dIdx} style={styles.digitBox}>
                              <Text style={styles.digitNumber}>{digit}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }

              // Empty Slot
              return (
                <View
                  key={seq.key}
                  style={[styles.emptySlotCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
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

            {/* Clear button */}
            {selectedList.length > 0 && (
              <View style={styles.footerRow}>
                <TouchableOpacity onPress={handleCopyText} style={styles.copyBtn}>
                  <Text style={[styles.copyBtnText, { color: colors.primary }]}>📋 Copiar Texto da Cola</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={clearCola} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>🗑️ Limpar Toda a Cola</Text>
                </TouchableOpacity>
              </View>
            )}
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
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalCardDesktop: {
    maxWidth: 720,
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
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
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
