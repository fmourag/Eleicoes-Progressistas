import { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { PROGRESSIVE_GUIDELINE_NOTICE, EXCLUDED_CONSERVATIVE_PARTIES, getTseDadosAbertosSearchUrl, isCandidateAllowedInProgressiveRoll } from '@np/shared';
import { candidatesApi, retryWithBackoff } from '../../services/api';
import { useBreakpoint, useMaxContentWidth, useResponsivePadding } from '../../utils/responsive';
import { useThemeColors, Spacing, Radius, FontSize } from '../../utils/theme';
import { CandidateCard } from '../../components/CandidateCard';
import { CandidaturaWarning } from '../../components/CandidaturaWarning';
import { ActionButton } from '../../components/ActionButton';
import { Dropdown, DropdownOption } from '../../components/Dropdown';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useLocationStore } from '../../stores/location.store';
import { fetchMunicipalities } from '../../services/location.service';
import { useColaStore } from '../../stores/cola.store';
import { ColaModal } from '../../components/ColaModal';
import { EthicalAd } from '../../components/EthicalAd';
import { CivicBanner } from '../../components/CivicBanner';
import { ApoioVoluntarioBanner } from '../../components/ApoioVoluntarioBanner';

interface CandidateListItem {
  id: string;
  name: string;
  socialName?: string;
  viceName?: string;
  party: string;
  partyNumber?: number;
  numeroUrna?: string;
  tseId?: string;
  cargo: string;
  level?: string;
  state?: string;
  municipality?: string;
  photoUrl?: string;
  coalition?: string | null;
  isProgressiveSupported?: boolean;
  supportedBy?: string | null;
  fichaLimpa: boolean;
  candidaturaStatus?: 'EM_ANALISE' | 'DEFERIDO' | 'INDEFERIDO' | 'CASSADO' | 'RENUNCIA';
  overallCommitmentScore?: number;
  hasInsufficientData?: boolean;
  profileScores?: Record<string, number> | null;
}

const CARGO_ORDER = ['PRESIDENTE', 'GOVERNADOR', 'SENADOR', 'DEPUTADO_FEDERAL', 'DEPUTADO_ESTADUAL'];

const CARGO_SECTION_TITLES: Record<string, string> = {
  PRESIDENTE: '🏛️ Presidente da República (Circunscrição Nacional)',
  GOVERNADOR: '🏛️ Governador(a) do Estado',
  SENADOR: '🏛️ Senador(a) da República',
  DEPUTADO_FEDERAL: '🏛️ Deputado(a) Federal',
  DEPUTADO_ESTADUAL: '🏛️ Deputado(a) Estadual',
};

const CARGO_PILLS = [
  { value: null, label: 'Todos os Cargos' },
  { value: 'PRESIDENTE', label: 'Presidente' },
  { value: 'GOVERNADOR', label: 'Governador(a)' },
  { value: 'SENADOR', label: 'Senador(a)' },
  { value: 'DEPUTADO_FEDERAL', label: 'Dep. Federal' },
  { value: 'DEPUTADO_ESTADUAL', label: 'Dep. Estadual' },
];

const ALL_BRAZILIAN_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const UF_OPTIONS: DropdownOption[] = ALL_BRAZILIAN_UFS.map((uf) => ({ value: uf, label: uf }));

export default function CandidatosScreen() {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCargo, setSelectedCargo] = useState<string | null>(null);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [showAllStates, setShowAllStates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rolagem Lateral de Cargos
  const cargoScrollRef = useRef<any>(null);
  const [cargoScrollX, setCargoScrollX] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function handleCargoScroll(e: any) {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const x = contentOffset?.x ?? 0;
    const max = (contentSize?.width ?? 0) - (layoutMeasurement?.width ?? 0);
    setCargoScrollX(x);
    setCanScrollLeft(x > 10);
    setCanScrollRight(max > 10 && x < max - 10);
  }

  function scrollCargo(direction: 'left' | 'right') {
    const delta = direction === 'left' ? -220 : 220;
    const targetX = Math.max(0, cargoScrollX + delta);
    cargoScrollRef.current?.scrollTo({ x: targetX, animated: true });
  }

  // Mecanismo de Seleção de Local Integrado
  const { location, setLocation, setConsent } = useLocationStore();
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [tempUf, setTempUf] = useState(location?.uf ?? '');
  const [tempMunicipio, setTempMunicipio] = useState(location?.municipality ?? '');
  const [tempMunOptions, setTempMunOptions] = useState<DropdownOption[]>(
    location?.municipality ? [{ value: location.municipality, label: location.municipality }] : []
  );
  const [loadingMun, setLoadingMun] = useState(false);

  // Mecanismo de Cola Eleitoral
  const { modalOpen: colaModalOpen, setModalOpen: setColaModalOpen, getCount: getColaCount } = useColaStore();
  const colaCount = getColaCount();

  const colors = useThemeColors();
  const bp = useBreakpoint();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  const params = useLocalSearchParams<{ uf?: string; state?: string; municipality?: string }>();

  useEffect(() => {
    const targetUf = params.uf || params.state;
    if (targetUf && typeof targetUf === 'string') {
      const cleanUf = targetUf.toUpperCase().trim();
      const cleanMun = typeof params.municipality === 'string' ? params.municipality.trim() : '';
      setLocation({
        uf: cleanUf,
        municipality: cleanMun,
        ibge_code: '',
      });
      setConsent(true);
      setShowAllStates(false);
    }
  }, [params.uf, params.state, params.municipality]);

  useEffect(() => {
    const ufToQuery = !showAllStates && location?.uf ? location.uf : undefined;
    loadCandidates(ufToQuery);
  }, [location?.uf, showAllStates]);

  async function loadCandidates(stateFilter?: string) {
    setLoading(true);
    setIsOffline(false);
    setErrorMessage(null);
    try {
      const res = await retryWithBackoff(
        async () => {
          const apiRes = await candidatesApi.getAll(stateFilter ? { state: stateFilter } : undefined);
          if (apiRes && !Array.isArray(apiRes) && (apiRes as { isFallback?: boolean }).isFallback) {
            throw new Error((apiRes as { message?: string }).message || 'Servidor indisponível');
          }
          return apiRes;
        },
        3,
        1500
      ).catch(() => null);

      if (res && !Array.isArray(res) && (res as { isFallback?: boolean }).isFallback) {
        setIsOffline(true);
        setErrorMessage((res as { message?: string }).message || 'Servidor temporariamente em inicialização. Toque em tentar novamente.');
        setCandidates([]);
        return;
      }
      const list = Array.isArray(res) ? res : ((res as { results?: CandidateListItem[] })?.results ?? []);
      if (list.length === 0 && !res) {
        setIsOffline(true);
        setErrorMessage('Não foi possível conectar ao servidor eleitoral após 3 tentativas. Verifique sua conexão ou tente novamente.');
      }
      setCandidates(list as CandidateListItem[]);
    } catch {
      setIsOffline(true);
      setErrorMessage('Não foi possível carregar os candidatos do TSE no momento. Toque no botão abaixo para tentar novamente.');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  // Abre modal de seleção de local
  async function handleOpenLocationModal() {
    const currentUf = location?.uf ?? 'SP';
    setTempUf(currentUf);
    setTempMunicipio(location?.municipality ?? '');
    setLocationModalOpen(true);
    if (currentUf) {
      setLoadingMun(true);
      try {
        const list = await fetchMunicipalities(currentUf);
        setTempMunOptions(list.map((m) => ({ value: m.name, label: m.name })));
      } catch {
        setTempMunOptions([]);
      } finally {
        setLoadingMun(false);
      }
    }
  }

  async function handleModalUfChange(uf: string) {
    setTempUf(uf);
    setTempMunicipio('');
    setTempMunOptions([]);
    setLoadingMun(true);
    try {
      const list = await fetchMunicipalities(uf);
      setTempMunOptions(list.map((m) => ({ value: m.name, label: m.name })));
    } catch {
      setTempMunOptions([]);
    } finally {
      setLoadingMun(false);
    }
  }

  function handleSaveLocationModal() {
    if (tempUf) {
      setLocation({
        uf: tempUf,
        municipality: tempMunicipio,
        ibge_code: '',
      });
      setConsent(true);
      setShowAllStates(false);
    }
    setLocationModalOpen(false);
  }

  function handleClearLocation() {
    setShowAllStates(true);
    setLocationModalOpen(false);
  }

  // Filtra pela circunscrição eleitoral do usuário (Constituição Federal / Código Eleitoral)
  // Presidente: Circunscrição nacional (todo cidadão vota)
  // Governador, Senador, Deputado Federal, Deputado Estadual: Circunscrição estadual (eleitores da respectiva UF votam)
  const byLocation = useMemo(() => {
    let list = candidates.filter((c) => isCandidateAllowedInProgressiveRoll(c));

    if (!location?.uf || showAllStates) return list;

    const uf = location.uf.toUpperCase();
    return list.filter(
      (c) => c.cargo === 'PRESIDENTE' || c.state?.toUpperCase() === uf
    );
  }, [candidates, location, showAllStates]);

  // Contagem de candidatos por cargo na localização selecionada
  const cargoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of byLocation) {
      const cargo = c.cargo || 'DEPUTADO_FEDERAL';
      counts[cargo] = (counts[cargo] || 0) + 1;
    }
    return counts;
  }, [byLocation]);

  // Partidos disponíveis para o filtro (derivados da lista por localização)
  const parties = useMemo(() => {
    const set = new Set<string>();
    byLocation.forEach((c) => c.party && set.add(c.party));
    return Array.from(set).sort();
  }, [byLocation]);

  // Filtro completo: Localização + Cargo + Partido + Busca Textual
  const filtered = useMemo(() => {
    let list = byLocation;

    if (selectedCargo) {
      list = list.filter((c) => c.cargo === selectedCargo);
    }

    if (selectedParty) {
      list = list.filter((c) => c.party === selectedParty);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const name = (c.name || '').toLowerCase();
        const socialName = (c.socialName || '').toLowerCase();
        const party = (c.party || '').toLowerCase();
        const numero = (c.numeroUrna || '').toLowerCase();
        const cargo = (c.cargo || '').toLowerCase();
        const state = (c.state || '').toLowerCase();
        const cargoTitle = (CARGO_SECTION_TITLES[c.cargo] || '').toLowerCase();

        return (
          name.includes(q) ||
          socialName.includes(q) ||
          party.includes(q) ||
          numero.includes(q) ||
          cargo.includes(q) ||
          state.includes(q) ||
          cargoTitle.includes(q)
        );
      });
    }

    return list;
  }, [byLocation, selectedCargo, selectedParty, searchQuery]);

  const grouped = useMemo(() => {
    const map: Record<string, CandidateListItem[]> = {};
    for (const c of filtered) {
      const cargo = c.cargo || 'DEPUTADO_FEDERAL';
      (map[cargo] ??= []).push(c);
    }
    const groups: { cargo: string; title: string; items: CandidateListItem[] }[] = [];
    for (const cargo of CARGO_ORDER) {
      const items = map[cargo];
      if (items && items.length > 0) {
        groups.push({ cargo, title: CARGO_SECTION_TITLES[cargo] || cargo, items });
      }
    }
    for (const [cargo, items] of Object.entries(map)) {
      if (!CARGO_ORDER.includes(cargo)) {
        groups.push({ cargo, title: CARGO_SECTION_TITLES[cargo] || cargo, items });
      }
    }
    return groups;
  }, [filtered]);

  function handleClearFilters() {
    setSearchQuery('');
    setSelectedCargo(null);
    setSelectedParty(null);
  }

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCargo || selectedParty);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: Spacing.xl }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.md, textAlign: 'center' }}>
          Carregando candidaturas oficiais do TSE...
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.xs, textAlign: 'center', maxWidth: 320 }}>
          Aguardando servidor seguro. Caso seja o primeiro acesso, o carregamento pode levar até 60s.
        </Text>
      </View>
    );
  }

  const locationDisplay =
    location?.uf && !showAllStates
      ? `${location.municipality ? `${location.municipality} - ` : ''}${location.uf}`
      : 'Todo o Brasil';

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      <EthicalAd screen="search" format="banner" />

      {/* ======================================================== */}
      {/* CABEÇALHO FIXO (STICKY): NUNCA SOME AO ROLAR OS CANDIDATOS*/}
      {/* ======================================================== */}
      <View style={[styles.pinnedHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.pinnedHeaderInner, maxW ? { maxWidth: maxW, alignSelf: 'center', width: '100%' } : { width: '100%' }, { paddingHorizontal: padding }]}>
          
          {/* Linha 1: Voltar + Seletor de Localização + Escopo + Tema */}
          <View style={styles.topControlRow}>
            <View style={styles.leftControlGroup}>
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => router.replace('/')}
                activeOpacity={0.75}
              >
                <Text style={[styles.backButtonText, { color: colors.primary }]}>
                  ← Início
                </Text>
              </TouchableOpacity>

              {/* Botão Principal de Localização */}
              <TouchableOpacity
                style={[styles.locationSelectorBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={handleOpenLocationModal}
                activeOpacity={0.8}
                accessibilityLabel="Alterar localização selecionada"
              >
                <Text style={[styles.locationSelectorText, { color: colors.primary }]} numberOfLines={1}>
                  📍 {locationDisplay} ▾
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rightControlGroup}>
              {location?.uf && (
                <TouchableOpacity
                  style={[
                    styles.scopeToggleButton,
                    {
                      backgroundColor: showAllStates ? colors.primaryLight : colors.surfaceAlt,
                      borderColor: showAllStates ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setShowAllStates(!showAllStates)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.scopeToggleText, { color: colors.primary }]}>
                    {showAllStates ? `📍 ${location.uf}` : '🇧🇷 Brasil'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.colaHeaderBtn,
                  colaCount > 0
                    ? { backgroundColor: '#047857', borderColor: '#059669' }
                    : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                ]}
                onPress={() => setColaModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.colaHeaderBtnText, { color: colaCount > 0 ? '#FFFFFF' : colors.text }]}>
                  📝 Minha Cola{colaCount > 0 ? ` (${colaCount})` : ''}
                </Text>
              </TouchableOpacity>
              <ThemeToggle />
            </View>
          </View>

          {/* Linha 2: Barra de Busca Textual Instantânea */}
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Buscar por candidato, cargo, partido ou número de urna...`}
              placeholderTextColor={colors.textFaint}
              clearButtonMode="while-editing"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.clearSearchText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Banner de busca direta no portal oficial de Dados Abertos do TSE */}
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              style={[styles.tseSearchBanner, { backgroundColor: colors.surfaceAlt, borderColor: colors.primary }]}
              onPress={() => Linking.openURL(getTseDadosAbertosSearchUrl(searchQuery))}
              activeOpacity={0.8}
            >
              <Text style={[styles.tseSearchBannerText, { color: colors.primary }]}>
                🏛️ Buscar "{searchQuery.trim()}" no Portal de Dados Abertos do TSE (Fonte Confiável) ↗
              </Text>
            </TouchableOpacity>
          )}

          {/* Selo de Fonte Oficial e Confiável */}
          <View style={styles.tseTrustedHeaderRow}>
            <TouchableOpacity
              style={styles.tseTrustedBadge}
              onPress={() => Linking.openURL('https://dadosabertos.tse.jus.br/')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tseTrustedBadgeText, { color: colors.textMuted }]}>
                ✓ Fonte Oficial e Confiável:{' '}
                <Text style={{ color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' }}>
                  dadosabertos.tse.jus.br
                </Text>{' '}
                ↗
              </Text>
            </TouchableOpacity>
          </View>

          {/* Linha 3: Pílulas de Filtro por Cargo com Rolagem Lateral */}
          <View style={styles.cargoScrollWrapper}>
            {canScrollLeft && (
              <TouchableOpacity
                style={[styles.cargoNavBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => scrollCargo('left')}
                activeOpacity={0.7}
                accessibilityLabel="Rolar cargos para a esquerda"
              >
                <Text style={[styles.cargoNavBtnText, { color: colors.primary }]}>‹</Text>
              </TouchableOpacity>
            )}

            <View style={styles.cargoScrollContainer}>
              <ScrollView
                ref={cargoScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={handleCargoScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.cargoPillsScroll}
                {...(Platform.OS === 'web'
                  ? {
                      onWheel: (e: any) => {
                        if (e.deltaY) {
                          const targetX = Math.max(0, cargoScrollX + e.deltaY);
                          cargoScrollRef.current?.scrollTo({ x: targetX, animated: false });
                        }
                      },
                    }
                  : {})}
              >
                {CARGO_PILLS.map((p) => {
                  const isSelected = selectedCargo === p.value;
                  const count = p.value ? (cargoCounts[p.value] || 0) : byLocation.length;
                  return (
                    <TouchableOpacity
                      key={p.label}
                      style={[
                        styles.cargoPill,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedCargo(isSelected ? null : p.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.cargoPillText, isSelected && { color: '#FFFFFF' }]}>
                        {p.label} <Text style={isSelected ? styles.countSelected : styles.countUnselected}>({count})</Text>
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {hasActiveFilters && (
                  <TouchableOpacity onPress={handleClearFilters} style={[styles.clearPill, { borderColor: colors.primary }]}>
                    <Text style={[styles.clearPillText, { color: colors.primary }]}>Limpar ↺</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            {canScrollRight && (
              <TouchableOpacity
                style={[styles.cargoNavBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => scrollCargo('right')}
                activeOpacity={0.7}
                accessibilityLabel="Rolar cargos para a direita"
              >
                <Text style={[styles.cargoNavBtnText, { color: colors.primary }]}>›</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>

      {/* ======================================================== */}
      {/* ÁREA ROLÁVEL COM A LISTA DE CANDIDATOS                   */}
      {/* ======================================================== */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={[
          styles.scrollListContent,
          maxW ? { maxWidth: maxW, alignSelf: 'center', width: '100%' } : { width: '100%' },
          { paddingHorizontal: padding },
        ]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <CivicBanner variant="compact" />

        {/* Banner Informativo de Critérios Progressistas & Disclaimer Ideológico */}
        <TouchableOpacity
          style={[styles.noticeBanner, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => router.push('/manual')}
          activeOpacity={0.8}
        >
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            {PROGRESSIVE_GUIDELINE_NOTICE}{' '}
            <Text style={{ fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }}>
              Entenda o Critério de Exclusão & Disclaimer Ideológico →
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Resumo de Resultados */}
        <View style={styles.resultSummaryRow}>
          <Text style={[styles.resultSummaryText, { color: colors.textSecondary }]}>
            Exibindo <Text style={{ fontWeight: 'bold', color: colors.primary }}>{filtered.length}</Text> candidaturas
            {searchQuery ? ` para "${searchQuery}"` : ''}
            {location?.uf && !showAllStates ? ` em ${location.uf}` : ' em todo o Brasil'}
          </Text>
        </View>

        {/* Lista Hierárquica por Cargo */}
        {grouped.length > 0 ? (
          <View style={styles.listContainer}>
            {grouped.map((group) => (
              <View key={group.cargo} style={styles.cargoSection}>
                <View style={[styles.cargoHeaderBanner, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Text style={[styles.cargoTitle, { color: colors.text }]}>{group.title}</Text>
                  <Text style={[styles.countBadge, { color: colors.primary }]}>{group.items.length}</Text>
                </View>
                {group.items.map((item) => (
                  <View key={item.id}>
                    <CandidateCard
                      id={item.id}
                      name={item.socialName || item.name}
                      viceName={item.viceName || undefined}
                      party={item.party}
                      partyNumber={item.partyNumber}
                      numeroUrna={item.numeroUrna}
                      tseId={item.tseId}
                      state={item.state}
                      cargo={item.cargo}
                      score={item.overallCommitmentScore}
                      photoUrl={item.photoUrl}
                      coalition={item.coalition}
                      isProgressiveSupported={item.isProgressiveSupported}
                      supportedBy={item.supportedBy}
                      candidaturaStatus={item.candidaturaStatus}
                      fichaLimpa={item.fichaLimpa}
                      hasInsufficientData={item.hasInsufficientData}
                      profileScores={item.profileScores}
                      onPress={() => router.push(`/(tabs)/raio-x?id=${item.id}`)}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{isOffline ? '⚠️' : '🔍'}</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {isOffline ? 'Falha ao Conectar com o Servidor Eleitoral' : 'Nenhum candidato encontrado'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {isOffline
                ? (errorMessage || 'Não foi possível carregar os dados eleitorais. Toque no botão abaixo para tentar novamente.')
                : 'Não foram localizadas candidaturas para os critérios e localização atuais.'}
            </Text>
            <View style={styles.emptyActionsRow}>
              {isOffline ? (
                <TouchableOpacity
                  style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                  onPress={loadCandidates}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyActionBtnText}>↺ Tentar Novamente</Text>
                </TouchableOpacity>
              ) : (
                <>
                  {hasActiveFilters && (
                    <TouchableOpacity
                      style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                      onPress={handleClearFilters}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.emptyActionBtnText}>↺ Limpar Filtros e Busca</Text>
                    </TouchableOpacity>
                  )}
                  {location?.uf && !showAllStates && (
                    <TouchableOpacity
                      style={[styles.emptyActionBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1 }]}
                      onPress={() => setShowAllStates(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.emptyActionBtnText, { color: colors.primary }]}>🇧🇷 Ver Todo o Brasil</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {/* Banner Estratégico de Apoio Voluntário via PIX */}
        <ApoioVoluntarioBanner
          variant="compact"
          style={{ marginTop: Spacing.xl, marginBottom: Spacing.xxl }}
        />
      </ScrollView>

      {/* Barra Flutuante de Ação Rápida: Gerar Cola Eleitoral */}
      {colaCount > 0 && (
        <View style={[styles.floatingColaBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.floatingColaBtn}
            onPress={() => setColaModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.floatingColaBtnLeft}>
              <Text style={styles.floatingColaBtnTitle}>
                📝 Minha Cola Eleitoral ({colaCount} candidato{colaCount > 1 ? 's' : ''})
              </Text>
              <Text style={[styles.floatingColaBtnSubtitle, { color: colors.textMuted }]}>
                Visualizar PDF, baixar ou compartilhar no WhatsApp
              </Text>
            </View>
            <View style={styles.floatingColaBtnBadge}>
              <Text style={styles.floatingColaBtnBadgeText}>Gerar Cola ➔</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Interativo da Cola Eleitoral */}
      <ColaModal
        visible={colaModalOpen}
        onClose={() => setColaModalOpen(false)}
        onSelectCargoToChoose={(cargo) => setSelectedCargo(cargo)}
      />

      {/* ======================================================== */}
      {/* MODAL DE SELEÇÃO DE LOCALIZAÇÃO (UF e MUNICÍPIO)        */}
      {/* ======================================================== */}
      <Modal
        visible={locationModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.modalScrollContent}>
              
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>📍 Selecionar Localização</Text>
                <TouchableOpacity onPress={() => setLocationModalOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[styles.modalCloseText, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
                Selecione seu Estado (UF) para ver os candidatos ao governo, senado e deputados da sua circunscrição, além da chapa presidencial nacional.
              </Text>

              {/* Grade Rápida com Todos os 27 Estados do Brasil */}
              <Text style={[styles.quickUfLabel, { color: colors.textSecondary }]}>Escolha o Estado (UF):</Text>
              <View style={styles.quickUfGrid}>
                {ALL_BRAZILIAN_UFS.map((uf) => {
                  const isSelected = tempUf === uf;
                  return (
                    <TouchableOpacity
                      key={uf}
                      style={[
                        styles.quickUfChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleModalUfChange(uf)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.quickUfChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {uf}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Dropdown
                label="Estado Selecionado"
                value={tempUf}
                options={UF_OPTIONS}
                onSelect={handleModalUfChange}
                placeholder="Selecione o Estado"
              />

              <Dropdown
                label="Município (Opcional)"
                value={tempMunicipio}
                options={tempMunOptions}
                onSelect={setTempMunicipio}
                placeholder={tempUf ? 'Selecione o Município (opcional)' : 'Escolha o Estado primeiro'}
                disabled={!tempUf}
                loading={loadingMun}
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalApplyBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveLocationModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalApplyBtnText}>✓ Confirmar Localização ({tempUf})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={handleClearLocation}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.textMuted }]}>
                    🇧🇷 Ver Todo o Brasil (Sem filtro estadual)
                  </Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  
  // Cabeçalho Pinned (Sticky)
  pinnedHeader: {
    borderBottomWidth: 1,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    elevation: 4,
    zIndex: 10,
  },
  pinnedHeaderInner: {
    gap: 6,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  leftControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  rightControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexShrink: 0,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  locationSelectorBtn: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: 200,
  },
  locationSelectorText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  scopeToggleButton: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  scopeToggleText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  colaHeaderBtn: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexShrink: 0,
  },
  colaHeaderBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },

  // Barra de Busca
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
  },
  searchIcon: {
    fontSize: FontSize.sm,
    marginRight: Spacing.xs + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    paddingVertical: 2,
    outlineWidth: 0 as any,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },

  // Scroll e Controles de Cargos
  cargoScrollWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 4,
    width: '100%',
  },
  cargoNavBtn: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    zIndex: 5,
  },
  cargoNavBtnText: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  cargoScrollContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  cargoPillsScroll: {
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  cargoPill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  cargoPillText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  countSelected: {
    color: '#E0E7FF',
    fontWeight: '800',
  },
  countUnselected: {
    opacity: 0.65,
    fontWeight: '600',
  },
  clearPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  clearPillText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '800',
  },

  // Scroll de Conteúdo da Lista
  scrollList: {
    flex: 1,
  },
  scrollListContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl + 48,
  },
  noticeBanner: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  noticeText: {
    fontSize: FontSize.xs - 1,
    lineHeight: 15,
  },
  resultSummaryRow: {
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  resultSummaryText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  listContainer: {
    width: '100%',
  },
  cargoSection: {
    marginBottom: Spacing.md,
  },
  cargoHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  cargoTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '800',
  },
  countBadge: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FontSize.xs + 1,
    marginBottom: Spacing.md,
    textAlign: 'center',
    maxWidth: 400,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  emptyActionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.xs,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    elevation: 8,
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  modalCloseText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    paddingHorizontal: Spacing.xs,
  },
  modalDesc: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  quickUfLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickUfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  quickUfChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minWidth: 32,
    alignItems: 'center',
  },
  quickUfChipText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '700',
  },
  modalButtonsRow: {
    flexDirection: 'column',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  modalApplyBtn: {
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs + 1,
    fontWeight: '800',
  },
  modalCancelBtn: {
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  tseSearchBanner: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tseSearchBannerText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  tseTrustedHeaderRow: {
    marginTop: 4,
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  tseTrustedBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.sm,
  },
  tseTrustedBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  floatingColaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingColaBtn: {
    backgroundColor: '#047857',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingColaBtnLeft: {
    flex: 1,
  },
  floatingColaBtnTitle: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  floatingColaBtnSubtitle: {
    color: '#D1FAE5',
    fontSize: 11,
    marginTop: 2,
  },
  floatingColaBtnBadge: {
    backgroundColor: '#065F46',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  floatingColaBtnBadgeText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
});
