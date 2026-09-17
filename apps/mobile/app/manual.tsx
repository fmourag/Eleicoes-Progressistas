import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { router } from 'expo-router';
import { useThemeColors, Spacing, Radius, FontSize } from '../utils/theme';
import { useMaxContentWidth, useResponsivePadding } from '../utils/responsive';
import { CivicEmblem } from '../components/CivicEmblem';
import { PROGRESSIVE_FILTER_DISCLAIMER } from '@np/shared';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'O app indica em quem votar?',
    a: 'Não. O aplicativo calcula a afinidade cívica objetiva com base em votações nominais registradas, discursos e propostas oficiais dos candidatos. A decisão de voto é 100% livre e soberana do eleitor.',
  },
  {
    q: 'Funciona em todo o Brasil?',
    a: 'Sim. Cobre todos os 27 estados da federação nas Eleições Gerais 2026, com candidatos à Presidência de abrangência nacional e cargos regionais organizados por UF.',
  },
  {
    q: 'O que acontece com o app depois do dia da eleição?',
    a: 'O aplicativo se transforma no Observatório de Mandatos & Promessômetro, permitindo fiscalizar de forma contínua as votações no Congresso Nacional e o cumprimento das promessas dos candidatos eleitos durante toda a legislatura.',
  },
  {
    q: 'Por que partidos como PL, Republicanos, PP, União Brasil, Avante, MDB, Podemos e NOVO não aparecem no matching?',
    a: 'Por deliberação metodológica baseada no filtro comportamental empírico e iluminista. Siglas cujas bancadas votam sistematicamente contra salvaguardas científicas (ex: agrotóxicos sem avaliação técnica da ANVISA/IBAMA, afrouxamento de licenciamento ambiental sem estudos de impacto, marco temporal contra dados antropológicos) ou que inserem dogmas religiosos em políticas de educação e saúde são excluídas das recomendações de afinidade progressista, independentemente de sua autodeclaração ideológica.',
  },
  {
    q: 'De onde vêm as fotos dos candidatos?',
    a: 'Diretamente do repositório oficial de fotos da urna do TSE (DivulgaCandContas) e dos retratos institucionais neutros da Câmara dos Deputados e do Senado Federal, sempre sozinhos e sem poses de comício.',
  },
  {
    q: 'Como auditar a integridade dos dados?',
    a: 'Através do Portal de Dados Abertos do TSE (dadosabertos.tse.jus.br) e das APIs oficiais do Congresso Nacional. Todo o código da plataforma é aberto e auditável.',
  },
];

const PRIVACY_ITEMS = [
  {
    icon: '🚫',
    q: 'Há coleta de opinião ou respostas políticas?',
    a: 'Não. Eliminamos 100% de questionários e testes ideológicos. A seleção de até 3 prioridades reside exclusivamente na memória volátil da sessão (useState) e nunca é salva em disco ou banco de dados.',
  },
  {
    icon: '🔒',
    q: 'Minha cola eleitoral é enviada para o servidor?',
    a: 'Não. Seus candidatos escolhidos ficam salvos exclusivamente no armazenamento local do seu dispositivo (AsyncStorage / localStorage). A geração de PDF é efetuada sob demanda de forma estritamente stateless.',
  },
  {
    icon: '🔭',
    q: 'Como o Observatório sabe quais candidatos monitorar sem me espionar?',
    a: 'O aplicativo mobile apenas envia os identificadores públicos dos parlamentares da sua cola local na consulta de alertas. Nenhum dado pessoal, IP ou histórico é gravado no servidor.',
  },
  {
    icon: '🛡️',
    q: 'Vocês sabem quem eu sou ou vendem meus dados?',
    a: 'Nunca. O aplicativo opera sem cadastro, sem login obrigatório e sem rastreadores comerciais. A tecnologia é 100% sem fins lucrativos e financiada por doações voluntárias transparentes.',
  },
];

export default function ManualDoUsuarioScreen() {
  const colors = useThemeColors();
  const maxW = useMaxContentWidth();
  const padding = useResponsivePadding();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  function toggleFaq(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === index ? null : index);
  }

  function handleOpenLink(url: string) {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View
        style={[
          styles.inner,
          { paddingHorizontal: padding },
          maxW ? { maxWidth: maxW, alignSelf: 'center' } : undefined,
        ]}
      >
        {/* Navegação Superior */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Voltar para o Início</Text>
        </TouchableOpacity>

        {/* Header Oficial do Manual */}
        <View style={styles.header}>
          <CivicEmblem size={64} />
          <Text style={[styles.title, { color: colors.text }]}>Manual do Usuário</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>
            Guia Completo de Uso & Metodologia Cívica • Versão 2.2.0
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>PRIVACIDADE POR DESIGN • ZERO CADASTRO</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Text style={[styles.badgeText, { color: '#065F46' }]}>AUDITÁVEL • DADOS ABERTOS DO TSE</Text>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* BLOCO 1: DEFINIÇÃO DE PROGRESSISMO (ILUMINISMO CÍVICO)   */}
        {/* ======================================================== */}
        <View
          style={[
            styles.definitionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
            },
          ]}
        >
          <View style={styles.definitionHeader}>
            <View style={[styles.definitionIconBox, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 22 }}>💡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.definitionTag, { color: colors.primary }]}>FUNDAMENTO FILOSÓFICO</Text>
              <Text style={[styles.definitionTitle, { color: colors.text }]}>O que é o Progressismo?</Text>
            </View>
          </View>

          <View style={[styles.quoteContainer, { borderLeftColor: colors.primary, backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.quoteText, { color: colors.text }]}>
              "O <Text style={{ fontWeight: '800', color: colors.primary }}>progressismo</Text> é um movimento político que se refere a um conjunto de doutrinas filosóficas, sociais e econômicas baseado na ideia de que o <Text style={{ fontWeight: '700' }}>progresso</Text>, entendido como avanço científico, tecnológico, econômico e comunitário, é vital para o <Text style={{ fontWeight: '700' }}>aperfeiçoamento da condição humana</Text>. Essa ideia de progresso integra o ideário iluminista e tem, como corolário, a crença de que as sociedades podem passar da barbárie à civilização, mediante o fortalecimento das bases do conhecimento empírico."
            </Text>
            <Text style={[styles.quoteAuthor, { color: colors.textMuted }]}>— Wikipédia, a Enciclopédia Livre</Text>
          </View>

          <Text style={[styles.definitionFooter, { color: colors.textSecondary }]}>
            No <Text style={{ fontWeight: '700', color: colors.text }}>Eleições Progressistas</Text>, esse princípio se traduz na avaliação técnica e objetiva de votações concretas em prol da ciência, do SUS, da soberania nacional, da preservação ambiental e da dignidade do povo trabalhador.
          </Text>
        </View>

        {/* ======================================================== */}
        {/* BLOCO DE FILTRO PARTIDÁRIO & DISCLAIMER IDEOLÓGICO-EMPÍRICO */}
        {/* ======================================================== */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
            <View style={[styles.definitionIconBox, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 22 }}>⚖️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.definitionTag, { color: colors.primary }]}>METODOLOGIA DE FILTRO OBJETIVO</Text>
              <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>
                {PROGRESSIVE_FILTER_DISCLAIMER.title}
              </Text>
            </View>
          </View>

          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {PROGRESSIVE_FILTER_DISCLAIMER.intro}
          </Text>

          <View style={[styles.caveatBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#B45309', marginBottom: 4 }}>
              ⚠️ Ressalvas Analíticas Importantes
            </Text>
            <Text style={{ fontSize: FontSize.xs + 1, color: '#92400E', lineHeight: 19 }}>
              {PROGRESSIVE_FILTER_DISCLAIMER.caveat}
            </Text>
          </View>

          {/* Categoria 1 */}
          <Text style={[styles.sectionSubtitle, { color: colors.text, marginTop: Spacing.md }]}>
            1. Partidos com padrão sistemático de votação contra salvaguardas científicas e empíricas
          </Text>
          <Text style={[styles.paragraphMuted, { color: colors.textMuted }]}>
            Estes partidos orientaram suas bancadas, ou tiveram a maioria esmagadora de seus membros votando, a favor de projetos que enfraquecem a avaliação técnica e empírica de impactos, substituindo-a por autodeclarações ou interesses setoriais sem base científica:
          </Text>

          <View style={{ gap: Spacing.sm, marginBottom: Spacing.md }}>
            {PROGRESSIVE_FILTER_DISCLAIMER.systematicParties.map((item, idx) => (
              <View key={idx} style={[styles.partyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={styles.partyHeaderRow}>
                  <View style={[styles.partyBadge, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#991B1B' }}>EXCLUÍDO PELO FILTRO</Text>
                  </View>
                  <Text style={[styles.partyTitle, { color: colors.text }]}>{item.party}</Text>
                </View>
                <Text style={[styles.partyRationale, { color: colors.textSecondary }]}>{item.rationale}</Text>
              </View>
            ))}
          </View>

          {/* Categoria 2 */}
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            2. Partidos com contradições internas severas (Zona de Alerta)
          </Text>
          <Text style={[styles.paragraphMuted, { color: colors.textMuted }]}>
            Alguns partidos possuem uma retórica de "progresso", mas suas votações revelam uma contradição entre o discurso de modernidade e a prática antiempírica:
          </Text>

          <View style={{ gap: Spacing.sm, marginBottom: Spacing.md }}>
            {PROGRESSIVE_FILTER_DISCLAIMER.contradictoryParties.map((item, idx) => (
              <View key={idx} style={[styles.partyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={styles.partyHeaderRow}>
                  <View style={[styles.partyBadge, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#92400E' }}>ZONA DE ALERTA • EXCLUÍDO</Text>
                  </View>
                  <Text style={[styles.partyTitle, { color: colors.text }]}>{item.party}</Text>
                </View>
                <Text style={[styles.partyRationale, { color: colors.textSecondary }]}>{item.rationale}</Text>
              </View>
            ))}
          </View>

          {/* Contraste: Partidos que NÃO são atingidos */}
          <View style={[styles.contrastCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Text style={{ fontSize: 18 }}>✅</Text>
              <Text style={{ fontSize: FontSize.sm + 1, fontWeight: '800', color: '#065F46' }}>
                Partidos que NÃO são atingidos por este filtro (Contraste)
              </Text>
            </View>
            <View style={styles.validPartiesRow}>
              {PROGRESSIVE_FILTER_DISCLAIMER.nonExcludedParties.parties.map((p, idx) => (
                <View key={idx} style={styles.validPartyPill}>
                  <Text style={styles.validPartyPillText}>{p}</Text>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: FontSize.xs + 1, color: '#047857', lineHeight: 19, marginTop: 8 }}>
              {PROGRESSIVE_FILTER_DISCLAIMER.nonExcludedParties.rationale}
            </Text>
          </View>

          {/* Resumo da Aplicação do Filtro */}
          <View style={[styles.summaryBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginTop: Spacing.md }]}>
            <Text style={[styles.summaryBoxTitle, { color: colors.text }]}>
              📌 Resumo da Aplicação do Filtro Comportamental
            </Text>
            {PROGRESSIVE_FILTER_DISCLAIMER.summaryPoints.map((point, idx) => (
              <View key={idx} style={styles.summaryPointRow}>
                <View style={[styles.summaryBullet, { backgroundColor: colors.primary }]}>
                  <Text style={styles.summaryBulletText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.summaryPointText, { color: colors.textSecondary }]}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ======================================================== */}
        {/* BLOCO 2: VISÃO GERAL DA PLATAFORMA                       */}
        {/* ======================================================== */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>1. Visão Geral da Plataforma</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            O aplicativo <Text style={{ fontWeight: '700', color: colors.text }}>Eleições Progressistas</Text> opera sob o lema <Text style={{ fontWeight: '700', color: colors.primary }}>"Cheque o passado. Escolha o futuro."</Text> Foi concebido para desmistificar promessas eleitorais vazias e confrontar discursos com os registros públicos oficiais dos parlamentares.
          </Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>13</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pilares Temáticos Auditados</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.tertiary }]}>100%</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Stateless • Sem Coleta de Dados</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>27</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Estados & Circunscrição Nacional</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: '#059669' }]}>Pós-2026</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Observatório de Mandatos Ativo</Text>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* BLOCO 3: FLUXO DE USO (PASSO A PASSO)                    */}
        {/* ======================================================== */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>2. Como Navegar: Jornada do Eleitor</Text>

          {/* Passo 1 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Localização & Circunscrição Eleitoral</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Escolha seu estado e município através da janela de seleção responsiva ou utilize a geolocalização segura (GPS local). Candidatos à Presidência possuem abrangência nacional e aparecem automaticamente em qualquer UF.
              </Text>
            </View>
          </View>

          {/* Passo 2 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Consulta por Prioridades (13 Pilares)</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Selecione até 3 causas que mais importam para você (Saúde Pública, Meio Ambiente, Relações de Trabalho, etc.). A seleção fica estritamente na memória volátil do aparelho (<Text style={{ fontWeight: '700' }}>sem cadastro e sem gravação em banco</Text>).
              </Text>
            </View>
          </View>

          {/* Passo 3 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Mecanismo de Matching & Afinidade</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Os pilares marcados recebem peso triplo (3.0x) no cálculo de afinidade. Candidatos com certidão Ficha Limpa comprovada recebem bônus de integridade (+5 pontos cívicos). Siglas conservadoras de direita são excluídas por padrão.
              </Text>
            </View>
          </View>

          {/* Passo 4 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Rolagem Lateral de Cargos & Busca Rápida</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                A barra de cargos conta com rolagem lateral suave (swipe no mobile, setas flutuantes e scroll no mouse), garantindo visibilidade para Presidente, Governador, Senador, Deputado Federal e Deputado Estadual.
              </Text>
            </View>
          </View>

          {/* Passo 5 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Raio-X do Candidato & Gap Analysis</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Analise o histórico completo: status da chapa (titular e vice), retrato oficial isolado, link do plano de governo no TSE e a memória de cálculo: 40% Votações Nominais + 30% Discursos + 30% Posturas Públicas.
              </Text>
            </View>
          </View>

          {/* Passo 6 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>6</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Minha Cola Eleitoral (PDF & Impressão)</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Monte sua seleção completa na exata ordem da urna do TSE (Dep. Federal → Dep. Estadual → Senador → Governador → Presidente). Exporte para PDF de meia folha A4 para levar impresso no dia da eleição (o uso do celular é proibido na cabine!).
              </Text>
            </View>
          </View>

          {/* Passo 7 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>7</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Observatório de Mandatos & Promessômetro</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Após a eleição, fiscalize seus eleitos: alertas em tempo real se votarem contra pautas prioritárias no Congresso e acompanhamento de status de promessas de campanha (PROPOSTA, EM ANDAMENTO, CUMPRIDA, QUEBRADA).
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* BLOCO 4: PRIVACIDADE POR DESIGN                          */}
        {/* ======================================================== */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>3. Nossos Compromissos de Privacidade</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Nenhum dado que possa identificar sua convicção política, preferência partidária ou voto é transmitido ou comercializado.
          </Text>

          <View style={{ gap: Spacing.sm }}>
            {PRIVACY_ITEMS.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.privacyCard,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                ]}
              >
                <Text style={{ fontSize: 24, marginRight: Spacing.sm }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.privacyQ, { color: colors.text }]}>{item.q}</Text>
                  <Text style={[styles.privacyA, { color: colors.textMuted }]}>{item.a}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ======================================================== */}
        {/* BLOCO 5: PERGUNTAS FREQUENTES (FAQ)                      */}
        {/* ======================================================== */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>4. Perguntas Frequentes</Text>

          <View style={{ gap: Spacing.xs }}>
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.faqItem,
                    {
                      backgroundColor: isOpen ? colors.primaryLight : colors.surfaceAlt,
                      borderColor: isOpen ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleFaq(idx)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.q}</Text>
                    <Text style={[styles.faqArrow, { color: colors.primary }]}>{isOpen ? '▲' : '▼'}</Text>
                  </View>
                  {isOpen && (
                    <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.a}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ======================================================== */}
        {/* BLOCO 6: CANAIS DE SUPORTE E AUDITORIA                   */}
        {/* ======================================================== */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>5. Auditoria Pública e Contato</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Este projeto cívico é auditável, independente e de código aberto. Você pode verificar diretamente as fontes de dados ou entrar em contato com nossa equipe técnica:
          </Text>

          <View style={styles.supportButtonsGrid}>
            <TouchableOpacity
              style={[styles.supportBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => handleOpenLink('https://dadosabertos.tse.jus.br/')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>🏛️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.supportBtnTitle, { color: colors.text }]}>Dados Abertos do TSE</Text>
                <Text style={[styles.supportBtnSub, { color: colors.textMuted }]}>dadosabertos.tse.jus.br</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.supportBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => handleOpenLink('https://github.com/norte-progressista')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>💻</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.supportBtnTitle, { color: colors.text }]}>Repositório Aberto</Text>
                <Text style={[styles.supportBtnSub, { color: colors.textMuted }]}>github.com/norte-progressista</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.supportBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => handleOpenLink('mailto:suporte@norteprogressista.com.br')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>✉️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.supportBtnTitle, { color: colors.text }]}>Suporte ao Eleitor</Text>
                <Text style={[styles.supportBtnSub, { color: colors.textMuted }]}>suporte@norteprogressista.com.br</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.supportBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => router.push('/transparencia')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>📜</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.supportBtnTitle, { color: colors.text }]}>Nota de Transparência</Text>
                <Text style={[styles.supportBtnSub, { color: colors.textMuted }]}>LGPD & Diretrizes v2.2.5</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rodapé de Encerramento */}
        <View style={styles.footerNotice}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Eleições Progressistas v2.2.5 • Tecnologia Cívica Auditável • 100% Independente
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingVertical: Spacing.lg },
  inner: { width: '100%' },

  backButton: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.title + 4,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: Spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  // Definição de Progressismo
  definitionCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    marginBottom: Spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  definitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  definitionIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  definitionTag: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  definitionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  quoteContainer: {
    borderLeftWidth: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  quoteText: {
    fontSize: FontSize.sm + 1,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginTop: Spacing.sm,
    textAlign: 'right',
  },
  definitionFooter: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },

  // Cards Padrão
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  paragraph: {
    fontSize: FontSize.sm,
    lineHeight: 21,
    marginBottom: Spacing.md,
  },

  // Estatísticas
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statBox: {
    flex: 1,
    minWidth: 130,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Passos
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },

  // Privacidade
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  privacyQ: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  privacyA: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
  },

  // FAQ
  faqItem: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  faqQuestion: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    flex: 1,
  },
  faqArrow: {
    fontSize: 12,
    fontWeight: '800',
  },
  faqAnswer: {
    fontSize: FontSize.xs + 1,
    lineHeight: 19,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },

  // Suporte
  supportButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  supportBtn: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  supportBtnTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  // Filtro Partidário & Disclaimer
  caveatBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSize.base,
    fontWeight: '800',
    marginBottom: 4,
  },
  paragraphMuted: {
    fontSize: FontSize.xs + 1,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  partyCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  partyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  partyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  partyTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '800',
  },
  partyRationale: {
    fontSize: FontSize.xs + 1,
    lineHeight: 19,
  },
  contrastCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  validPartiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  validPartyPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  validPartyPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  summaryBoxTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  summaryPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  summaryBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  summaryBulletText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  summaryPointText: {
    fontSize: FontSize.xs + 1,
    lineHeight: 19,
    flex: 1,
  },

  footerNotice: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});
