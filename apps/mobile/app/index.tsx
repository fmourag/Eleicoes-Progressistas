import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Platform, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { PILLAR_DISPLAY_LIST } from '@np/shared';
import { useMaxContentWidth, useResponsivePadding, useBreakpoint } from '../utils/responsive';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { ActionButton } from '../components/ActionButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { CivicEmblem } from '../components/CivicEmblem';
import { CivicBanner } from '../components/CivicBanner';
import { PrivacyBanner } from '../components/PrivacyBanner';
import { ApoioVoluntarioBanner } from '../components/ApoioVoluntarioBanner';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { ShareModal } from '../components/ShareModal';
import { useLocationStore } from '../stores/location.store';
import { fetchMunicipalities } from '../services/location.service';
import { API_URL } from '../services/api';
import { APP_VERSION } from '../src/constants/app';

const UF_OPTIONS: DropdownOption[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((uf) => ({ value: uf, label: uf }));

export default function HomeScreen() {
  const [showShareModal, setShowShareModal] = useState(false);
  const bp = useBreakpoint();
  const isDesktop = bp === 'desktop';
  const colors = useThemeColors();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();
  const { location, resetLocation, setLocation, setConsent, openConsentModal } = useLocationStore();

  const apkDownloadUrl = typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/download/apk`
    : `${API_URL}/download/apk`;

  const betaGuideUrl = typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/beta`
    : `${API_URL}/beta`;

  const [selectedUf, setSelectedUf] = useState(location?.uf ?? '');
  const [selectedMunicipio, setSelectedMunicipio] = useState(location?.municipality ?? '');
  const [municipioOptions, setMunicipioOptions] = useState<DropdownOption[]>(
    location ? [{ value: location.ibge_code, label: location.municipality }] : []
  );
  const [loadingMun, setLoadingMun] = useState(false);
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const activePillarId = hoveredPillar || selectedPillar;
  const activePillar = PILLAR_DISPLAY_LIST.find((p) => p.id === activePillarId);

  useEffect(() => {
    if (location) {
      setSelectedUf(location.uf);
      setSelectedMunicipio(location.ibge_code);
      setMunicipioOptions((prev) =>
        prev.length > 1 ? prev : [{ value: location.ibge_code, label: location.municipality }]
      );
    }
  }, [location]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const referrer = typeof document !== 'undefined' ? document.referrer : undefined;
        fetch(`${API_URL}/api/telemetry/access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'WEB_VISIT', referrer }),
        }).catch(() => {});
      } catch {}
    }
  }, []);

  async function handleUfChange(uf: string) {
    setSelectedUf(uf);
    setSelectedMunicipio('');
    setMunicipioOptions([]);
    setLoadingMun(true);
    setLocation({ uf, municipality: '', ibge_code: '' });
    setConsent(true);
    try {
      const list = await fetchMunicipalities(uf);
      setMunicipioOptions(list.map((m) => ({ value: m.code, label: m.name })));
    } catch {
      setMunicipioOptions([]);
    } finally {
      setLoadingMun(false);
    }
  }

  function handleMunicipioChange(code: string) {
    setSelectedMunicipio(code);
    const opt = municipioOptions.find((o) => o.value === code);
    if (opt && selectedUf) {
      setLocation({ uf: selectedUf, municipality: opt.label, ibge_code: code });
      setConsent(true);
    }
  }

  function handleUseGps() {
    openConsentModal();
  }

  function handleReset() {
    resetLocation();
    setSelectedUf('');
    setSelectedMunicipio('');
    setMunicipioOptions([]);
  }

  const locationDisplay = location?.uf
    ? `${location.municipality ? `${location.municipality} - ` : ''}${location.uf}`
    : 'Todo o Brasil';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.inner, { paddingHorizontal: padding }, maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined]}>
        
        {/* ======================================================== */}
        {/* STITCH CIVIC TOP BAR                                     */}
        {/* ======================================================== */}
        <View style={[styles.topBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.brandRow}>
            <View style={styles.brandLogo}>
              <CivicEmblem size={36} />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.brandTitle, { color: colors.text }]}>Eleições Progressistas</Text>
                <View style={[styles.versionBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.warning }]}>
                  <Text style={[styles.versionBadgeText, { color: colors.warning }]}>{APP_VERSION}</Text>
                </View>
              </View>
              <Text style={[styles.brandSub, { color: colors.textMuted }]}>Cheque o passado. Escolha o futuro.</Text>
            </View>
          </View>

          <View style={styles.topRightControls}>
            <TouchableOpacity
              style={[styles.manualBtn, { backgroundColor: '#1B5E20', borderColor: '#2E7D32' }]}
              onPress={() => Linking.openURL(`${API_URL}/feedback`)}
              activeOpacity={0.7}
            >
              <Text style={[styles.manualBtnText, { color: '#ffffff', fontWeight: 'bold' }]}>💬 Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.manualBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => router.push('/manual')}
              activeOpacity={0.7}
            >
              <Text style={[styles.manualBtnText, { color: colors.text }]}>📖 Manual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.manualBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => setShowShareModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.manualBtnText, { color: colors.text, fontWeight: 'bold' }]}>🔗 Compartilhar</Text>
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </View>

        {/* ======================================================== */}
        {/* HERO TITLE BANNER                                        */}
        {/* ======================================================== */}
        <CivicBanner variant="hero" />

        {/* ======================================================== */}
        {/* WEB EXCLUSIVE: DOWNLOAD APP BANNER (RENDER SIDELOAD)      */}
        {/* ======================================================== */}
        {Platform.OS === 'web' && (
          <View
            style={[
              styles.downloadAppCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Bloco Superior: Ícone + Badges + Título + Descrição */}
            <View style={styles.downloadTopSection}>
              <View
                style={[
                  styles.downloadAppIconBox,
                  {
                    backgroundColor: colors.successBg,
                    borderColor: colors.tertiary,
                  },
                ]}
              >
                <Text style={{ fontSize: 24 }}>📱</Text>
              </View>

              <View style={styles.downloadTextContainer}>
                <View style={styles.downloadBadgeRow}>
                  <View style={[styles.downloadBadge, { backgroundColor: colors.successBg, borderColor: colors.tertiary }]}>
                    <View style={[styles.downloadBadgeDot, { backgroundColor: colors.tertiary }]} />
                    <Text style={[styles.downloadBadgeText, { color: colors.successText }]}>APLICATIVO ANDROID OFICIAL</Text>
                  </View>
                  <View style={[styles.downloadBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={[styles.downloadBadgeText, { color: colors.textSecondary }]}>{APP_VERSION}</Text>
                  </View>
                  <View style={[styles.downloadBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={[styles.downloadBadgeText, { color: colors.tertiary }]}>100% OFFLINE</Text>
                  </View>
                </View>

                <Text style={[styles.downloadTitle, { color: colors.text }]}>
                  Instale o Eleições Progressistas no seu Celular
                </Text>

                <Text style={[styles.downloadDescription, { color: colors.textSecondary }]}>
                  Navegação instantânea e colinha eleitoral 100% offline na cabine de votação, sem depender de internet ou gastar plano de dados.
                </Text>
              </View>
            </View>

            {/* Bloco de Ação Centralizado e Totalmente Confinado no Card */}
            <View style={styles.downloadActionBox}>
              <TouchableOpacity
                style={[styles.downloadBtn, { backgroundColor: '#1B5E20', borderColor: '#2E7D32' }]}
                onPress={() => Linking.openURL(apkDownloadUrl)}
                activeOpacity={0.85}
              >
                <Text style={styles.downloadBtnText}>📥 Baixar APK Android (61,5 MB)</Text>
              </TouchableOpacity>

              <View style={styles.downloadSecurityMeta}>
                <Text style={[styles.downloadMetaText, { color: colors.textMuted }]}>
                  🔐 SHA-256 verificado • Servidor Oficial Render
                </Text>
                <Text style={{ color: colors.textMuted }}>•</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(betaGuideUrl)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.downloadHelpLink, { color: colors.primary }]}>
                    📖 Guia de instalação
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* PRIVACIDADE POR DESIGN (STITCH CIVIC CARD)               */}
        {/* ======================================================== */}
        <View style={[styles.privacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.privacyIconCircle, { backgroundColor: colors.surfaceAlt, borderColor: colors.tertiary }]}>
            <Text style={{ fontSize: 18 }}>🔒</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={[styles.privacyTag, { color: colors.tertiary }]}>PRIVACIDADE POR DESIGN</Text>
              <Text style={{ color: colors.textMuted }}>•</Text>
              <Text style={[styles.privacySub, { color: colors.textMuted }]}>Zero Cadastro</Text>
            </View>
            <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
              Consulta 100% anônima e sem coleta de dados. Suas preferências de voto são calculadas estritamente em memória no seu dispositivo.
            </Text>
          </View>
        </View>

        {/* ======================================================== */}
        {/* LOCATION & QUICK ACCESS CARD                             */}
        {/* ======================================================== */}
        <View style={[styles.locationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.locationHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Sua Circunscrição Eleitoral</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
                  {location?.uf
                    ? `Filtro ativo para eleitores de ${locationDisplay}`
                    : 'Filtre as candidaturas por Estado e Município'}
                </Text>
              </View>
            </View>

            {location?.uf && (
              <TouchableOpacity
                style={[styles.clearLocationBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Text style={[styles.clearLocationText, { color: colors.textMuted }]}>↺ Limpar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Seletor GPS */}
          <TouchableOpacity
            style={[styles.gpsButton, { backgroundColor: colors.primary }]}
            onPress={handleUseGps}
            activeOpacity={0.85}
          >
            <Text style={styles.gpsButtonText}>📡 Usar minha localização (GPS)</Text>
          </TouchableOpacity>

          {/* Dropdowns */}
          <View style={styles.dropdownsGrid}>
            <View style={{ flex: 1, minWidth: 140 }}>
              <Dropdown
                label="Estado (UF)"
                value={selectedUf}
                options={UF_OPTIONS}
                onSelect={handleUfChange}
                placeholder="Selecione o Estado"
              />
            </View>
            <View style={{ flex: 2, minWidth: 200 }}>
              <Dropdown
                label="Município"
                value={selectedMunicipio}
                options={municipioOptions}
                onSelect={handleMunicipioChange}
                placeholder={selectedUf ? 'Selecione o Município' : 'Escolha o Estado primeiro'}
                disabled={!selectedUf}
                loading={loadingMun}
              />
            </View>
          </View>

          {/* Destaque para Acesso Direto às Candidaturas */}
          <View style={styles.ctaBanner}>
            <TouchableOpacity
              style={[styles.mainCtaBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/candidatos')}
              activeOpacity={0.85}
            >
              <Text style={styles.mainCtaBtnText}>
                🏛️ Acessar Candidatos {location?.uf ? `de ${location.uf}` : 'do Brasil'} ➔
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* FAST TRACK NAVIGATION JUMP (STITCH GRID)                */}
        {/* ======================================================== */}
        <View style={styles.navGrid}>
          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/matching')}
            activeOpacity={0.8}
          >
            <View style={[styles.navCardIconBox, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={{ fontSize: 24 }}>🎯</Text>
            </View>
            <Text style={[styles.navCardTitle, { color: colors.text }]}>Prioridades</Text>
            <Text style={[styles.navCardDesc, { color: colors.textMuted }]}>
              Selecione até 3 causas cívicas prioritárias para matching stateless em memória.
            </Text>
            <Text style={[styles.navCardLink, { color: colors.primary }]}>Consultar ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/candidatos')}
            activeOpacity={0.8}
          >
            <View style={[styles.navCardIconBox, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={{ fontSize: 24 }}>🏛️</Text>
            </View>
            <Text style={[styles.navCardTitle, { color: colors.text }]}>Candidaturas</Text>
            <Text style={[styles.navCardDesc, { color: colors.textMuted }]}>
              Explore nomes, número de urna, histórico, fichas limpas e partidos.
            </Text>
            <Text style={[styles.navCardLink, { color: colors.primary }]}>Explorar ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/cola')}
            activeOpacity={0.8}
          >
            <View style={[styles.navCardIconBox, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={{ fontSize: 24 }}>📝</Text>
            </View>
            <Text style={[styles.navCardTitle, { color: colors.text }]}>Minha Cola</Text>
            <Text style={[styles.navCardDesc, { color: colors.textMuted }]}>
              Simulador da urna do TSE com caixas de dígitos e exportação em PDF.
            </Text>
            <Text style={[styles.navCardLink, { color: colors.primary }]}>Abrir Cola ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/observatorio')}
            activeOpacity={0.8}
          >
            <View style={[styles.navCardIconBox, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={{ fontSize: 24 }}>🔭</Text>
            </View>
            <Text style={[styles.navCardTitle, { color: colors.text }]}>Observatório</Text>
            <Text style={[styles.navCardDesc, { color: colors.textMuted }]}>
              Monitoramento de votações nominais e promessas dos eleitos via diários oficiais.
            </Text>
            <Text style={[styles.navCardLink, { color: colors.primary }]}>Acompanhar ➔</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* OS 13 PILARES PROGRESSISTAS (EXPLORADOR)                 */}
        {/* ======================================================== */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🏛️ Os 13 Pilares de Avaliação</Text>
          <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
            Cada candidato é classificado de 0 a 100% em cada pilar com base nas posturas, discursos oficiais e votações nominais no plenário:
          </Text>

          {/* 13 Pillars Harmonious Grid */}
          <View style={styles.pillarsGrid}>
            {PILLAR_DISPLAY_LIST.map((item, idx) => {
              const isActive = activePillarId === item.id;
              const pillarNum = String(idx + 1).padStart(2, '0');

              return (
                <Pressable
                  key={item.id}
                  onHoverIn={() => setHoveredPillar(item.id)}
                  onHoverOut={() => setHoveredPillar((prev) => (prev === item.id ? null : prev))}
                  onPress={() => setSelectedPillar((prev) => (prev === item.id ? null : item.id))}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}: ${item.description}`}
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.pillarCard,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surfaceAlt,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                    isActive && styles.pillarCardActive,
                    pressed && styles.pillarCardPressed,
                    Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.18s ease' } as any),
                  ]}
                >
                  <View
                    style={[
                      styles.pillarIconBadge,
                      {
                        backgroundColor: isActive
                          ? 'rgba(255, 255, 255, 0.2)'
                          : (colors.surfaceContainerHigh || colors.surface),
                      },
                    ]}
                  >
                    <Text style={styles.pillarIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.pillarTextGroup}>
                    <View style={styles.pillarMetaRow}>
                      <Text
                        style={[
                          styles.pillarNumber,
                          { color: isActive ? '#FFE4E1' : colors.textMuted },
                        ]}
                      >
                        PILAR {pillarNum}
                      </Text>
                      {isActive && (
                        <View style={styles.activeCheckBadge}>
                          <Text style={styles.activeCheckText}>✓ Ativo</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.pillarLabel,
                        { color: isActive ? '#FFFFFF' : colors.text },
                        isActive && styles.pillarLabelActive,
                      ]}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Painel Explicativo do Pilar */}
          <View
            style={[
              styles.explanationBox,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: activePillar ? colors.primary : colors.border,
              },
            ]}
          >
            {activePillar ? (
              <View style={styles.explanationContent}>
                <View style={styles.explanationHeader}>
                  <Text style={styles.explanationIconLarge}>{activePillar.icon}</Text>
                  <View style={styles.explanationTextGroup}>
                    <Text style={[styles.explanationHeading, { color: colors.primary }]}>
                      {activePillar.label}
                    </Text>
                    <Text style={[styles.explanationDesc, { color: colors.text }]}>
                      {activePillar.description}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.explanationPlaceholder}>
                <Text style={styles.explanationPlaceholderIcon}>💡</Text>
                <Text style={[styles.explanationPlaceholderText, { color: colors.textMuted }]}>
                  Selecione qualquer pilar acima para conferir os critérios e descrição detalhada.
                </Text>
              </View>
            )}
          </View>

          <PrivacyBanner />

          <ActionButton
            title="🔍 Explorar Candidatos & Ver Comprometimento"
            onPress={() => router.push('/(tabs)/candidatos')}
            variant="primary"
          />

          <View style={{ marginTop: Spacing.sm }}>
            <ActionButton
              title="📝 Gerar Cola Eleitoral (PDF & WhatsApp)"
              onPress={() => router.push('/(tabs)/cola')}
              variant="secondary"
            />
          </View>

          {/* Banner Estratégico de Apoio Voluntário via PIX */}
          <ApoioVoluntarioBanner
            variant="card"
            style={{ marginTop: Spacing.xl, marginBottom: Spacing.md }}
          />
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.sm }}>
            <TouchableOpacity
              onPress={() => router.push('/apoie')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: '#047857', textDecorationLine: 'underline' }}>
                🤝 Apoio Voluntário (PIX)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/manual')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }}>
                📖 Manual do Usuário
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/transparencia')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }}>
                📜 Transparência Pública
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/media-kit')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }}>
                📊 Media Kit Ético
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/anuncie')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }}>
                📢 Anuncie Conosco
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/api-publico')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }}>
                ⚡ API Pública (Tiered)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(`${API_URL}/feedback`)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: '#1B5E20', textDecorationLine: 'underline' }}>
                💬 Enviar Feedback de Auditoria
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/observatorio')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }}>
                🔭 Observatório
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const url = typeof window !== 'undefined' && window.location?.origin
                  ? `${window.location.origin}/dashboard`
                  : `${API_URL}/dashboard`;
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch(() => {});
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: '#0284c7', textDecorationLine: 'underline' }}>
                📈 Monitor de Acessos
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.guidelineNotice, { color: colors.textMuted }]}>
            💡 Mapeamento independente com dados abertos oficiais do TSE (DivulgaCandContas) e Congresso Nacional.
          </Text>
          <Text style={[styles.footerText, { color: colors.textFaint }]}>
            Versão {APP_VERSION.replace(/^v/, '')} • 100% Anônimo • Código Auditável • Conforme LGPD
          </Text>
        </View>

        <ShareModal visible={showShareModal} onClose={() => setShowShareModal(false)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingVertical: Spacing.lg,
  },
  inner: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandLogo: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: FontSize.base,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  brandSub: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  versionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  versionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  manualBtn: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  watchdogBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  watchdogText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  heroTitleDesktop: {
    fontSize: 44,
  },
  heroSubtitle: {
    fontSize: FontSize.lg,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
    maxWidth: 620,
  },
  heroSubdetail: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 600,
    marginTop: Spacing.xs,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  privacyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  privacyTag: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  privacySub: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
    marginTop: 3,
  },
  locationCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  clearLocationBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  clearLocationText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  dropdownsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gpsButton: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: Spacing.md,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  ctaBanner: {
    marginTop: Spacing.xs,
  },
  mainCtaBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCtaBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  navCard: {
    flex: 1,
    minWidth: 220,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    justifyContent: 'flex-start',
    gap: 4,
  },
  navCardIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  navCardTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: 4,
  },
  navCardDesc: {
    fontSize: FontSize.xs,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  navCardLink: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '12px',
        }
      : {}),
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 10,
    minHeight: 64,
    flexGrow: 1,
    flexBasis: 240,
  },
  pillarCardActive: {
    transform: [{ scale: 1.015 }],
    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)',
  },
  pillarCardPressed: {
    opacity: 0.85,
  },
  pillarIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pillarIcon: {
    fontSize: 18,
  },
  pillarTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  pillarMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  pillarNumber: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeCheckBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  activeCheckText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  pillarLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    lineHeight: 16,
  },
  pillarLabelActive: {
    fontWeight: '700',
  },
  explanationBox: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    minHeight: 76,
    justifyContent: 'center',
  },
  explanationContent: {
    width: '100%',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  explanationIconLarge: {
    fontSize: FontSize.xxl,
    marginTop: 2,
  },
  explanationTextGroup: {
    flex: 1,
  },
  explanationHeading: {
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: 3,
  },
  explanationDesc: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  explanationPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  explanationPlaceholderIcon: {
    fontSize: FontSize.base,
  },
  explanationPlaceholderText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    flexShrink: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  guidelineNotice: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    maxWidth: 550,
    lineHeight: 16,
  },
  footerText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  downloadAppCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  downloadTopSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  downloadAppIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  downloadTextContainer: {
    flex: 1,
  },
  downloadBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: Spacing.xs,
  },
  downloadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 5,
  },
  downloadBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  downloadBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  downloadTitle: {
    fontSize: FontSize.base + 1,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
    lineHeight: 22,
  },
  downloadDescription: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
  },
  downloadActionBox: {
    marginTop: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs + 2,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 440,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  downloadSecurityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.xs,
  },
  downloadMetaText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  downloadHelpLink: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
