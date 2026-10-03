import { PillarId } from './quiz-core';
export * from './quiz-core';

export const PILLAR_DESCRIPTIONS: Record<PillarId, string> = {
  p1: 'Garantia de segurança alimentar, saneamento básico, habitação popular digna e assistência social integrada.',
  p2: 'Combate às desigualdades de gênero, raça e defesa intransigente dos direitos civis.',
  p3: 'Transição energética verde, combate ao desmatamento e justiça climática.',
  p4: 'Defesa das riquezas estratégicas, fomento à cultura nacional e soberania.',
  p5: 'Nova Indústria Brasil, inovação tecnológica sustentável e geração de empregos qualificados.',
  p6: 'Tributação de grandes fortunas, valorização do salário mínimo e combate à pobreza.',
  p7: 'Segurança alimentar, inclusão de PcD, idosos, crianças e populações tradicionais.',
  p8: 'Fiscalização republicana, controle social dos gastos e extinção de privilégios.',
  p9: 'Acesso universal gratuito, saúde da família e fortalecimento integral do SUS.',
  p10: 'Inteligência contra o crime organizado, cumprimento da lei e prevenção social nas periferias.',
  p11: 'Melhoria na qualidade do ensino através de maior investimento financeiro em escolas, infraestrutura, suprimentos pedagógicos, bolsas e valorização docente.',
  p12: 'Valorização do trabalho formal, defesa dos direitos trabalhistas, combate à precarização, segurança jurídica nas relações laborais e qualificação profissional.',
  p13: 'Incentivo aos microempreendedores individuais, desoneração fiscal orientada ao investimento e geração de empregos, desburocratização e microcrédito orientado.',
};

export interface PillarScores {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  p6: number;
  p7: number;
  p8: number;
  p9?: number;
  p10?: number;
  p11?: number;
  p12?: number;
  p13?: number;
}

export function isNeutralMatchingProfile(scores: Record<string, number> | null | undefined): boolean {
  if (!scores) return true;
  for (let i = 1; i <= 13; i++) {
    const v = Number(scores[`p${i}`]);
    if (Number.isNaN(v) || Math.abs(v - 0.5) > 0.001) return false;
  }
  return true;
}

export const INSUFFICIENT_DATA_LABEL = 'Sem histórico público suficiente';

export type Cargo =
  | 'VEREADOR'
  | 'PREFEITO'
  | 'VICE_PREFEITO'
  | 'DEPUTADO_ESTADUAL'
  | 'GOVERNADOR'
  | 'VICE_GOVERNADOR'
  | 'SENADOR'
  | 'DEPUTADO_FEDERAL'
  | 'PRESIDENTE'
  | 'VICE_PRESIDENTE';

export type ElectionLevel = 'MUNICIPAL' | 'ESTADUAL' | 'FEDERAL';

export type CandidaturaStatus = 'EM_ANALISE' | 'DEFERIDO' | 'INDEFERIDO' | 'CASSADO' | 'RENUNCIA';

export interface PillarEvidence {
  votacoes: string[];
  pronunciamentos: string[];
  posturas: string[];
}

export interface PillarCommitment {
  pillarId: PillarId;
  label: string;
  icon: string;
  description: string;
  score: number; // 0-100%
  rating: 'Altíssimo' | 'Alto' | 'Consistente' | 'Moderado';
  evidencias: PillarEvidence;
  justificativa?: import('./pillar-justificativa').PillarJustificativa;
}

export interface CandidateClassification {
  overallScore: number; // 0-100%
  overallRating: string;
  summary: string;
  pillars: PillarCommitment[];
}

export interface GovernmentPlanSection {
  eixo: string;
  titulo: string;
  icone: string;
  detalhes: string[];
}

export interface GovernmentPlanDetail {
  titulo: string;
  resumo: string;
  statusRegistro: string;
  urlOficial?: string;
  eixos: GovernmentPlanSection[];
}

export interface Candidate {
  id: string;
  tseId: string;
  electionYear?: number;
  name: string;
  socialName?: string | null;
  viceName?: string | null;
  party: string;
  partyNumber: number;
  cargo: Cargo;
  level: ElectionLevel;
  candidaturaStatus: CandidaturaStatus;
  dataRegistro?: string;
  hasWarning?: boolean;
  warningMessage?: string;
  municipality?: string;
  state?: string;
  cpfHash?: string;
  photoUrl?: string | null;
  fichaLimpa: boolean;
  financedBy?: Record<string, unknown>;
  votingHistory?: Record<string, unknown>;
  proposals?: Record<string, unknown>;
  governmentPlanUrl?: string | null;
  governmentPlanSummary?: string | null;
  profileScores?: PillarScores;
  classification?: CandidateClassification;
  governmentPlan?: GovernmentPlanDetail;
  numeroUrna?: string;
  coalition?: string | null;
  isProgressiveSupported?: boolean;
  supportedBy?: string | null;
}

export function getCargoDigitsCount(cargo: Cargo | string): number {
  switch (cargo) {
    case 'PRESIDENTE':
    case 'GOVERNADOR':
    case 'PREFEITO':
      return 2;
    case 'SENADOR':
      return 3;
    case 'DEPUTADO_FEDERAL':
      return 4;
    case 'DEPUTADO_ESTADUAL':
    case 'VEREADOR':
      return 5;
    default:
      return 2;
  }
}

export const KNOWN_URNA_NUMBERS: Record<string, string> = {
  // Presidente
  'pres_lula': '13',
  '280001600001': '13',
  'pres_ciro': '12',
  'pres_glauber': '50',
  'pres_leonardo': '80',
  'pres_sofia': '21',
  'pres_veralucia': '16',
  'pres_ruicosta': '29',
  // Governadores SP
  'gov_sp_tarcisio': '10',
  'gov_sp_haddad': '13',
  'gov_sp_machado': '21',
  'gov_sp_izadora': '29',
  'gov_sp_edjane': '36',
  'gov_sp_franca': '40',
  'gov_sp_veralucia': '16',
  'gov_sp_vivian': '80',
  // Governador RJ
  'gov_rj_paes': '55',
  'gov_rj_siri': '50',
  'gov_rj_neves': '12',
  'gov_rj_juliete': '80',
  'gov_rj_cyro': '16',
  'gov_rj_eduardoserra': '21',
  // Governadores outros estados
  'gov_pe_luciana': '65',
  'gov_ba_jeronimo': '13',
  'gov_ce_elmano': '13',
  'gov_ma_brandao': '40',
  'gov_pb_azevedo': '40',
  'gov_pe_cabral': '40',
  'gov_pi_rafael': '13',
  'gov_rn_fatima': '13',
  'gov_se_rogerio': '13',
  'gov_se_mitidieri': '55',
  'gov_df_grass': '43',
  'gov_go_wolmir': '13',
  'gov_mt_natasha': '40',
  'gov_ms_giselle': '13',
  'gov_es_casagrande': '40',
  'gov_mg_silveira': '55',
  'gov_mg_rogerio': '13',
  'gov_pr_requiao': '13',
  'gov_rs_pretto': '13',
  'gov_sc_decio': '13',
  'gov_ac_jorge': '13',
  'gov_ap_clecio': '77',
  'gov_am_marcelo': '13',
  'gov_pa_beto': '13',
  'gov_ro_daniel': '77',
  'gov_rr_evangelista': '13',
  'gov_to_mourao': '13',
  // Senadores RJ (13 Candidatos Oficiais no Pleito 2026)
  'sen_rj_portinho': '222',
  'sen_rj_benedita': '130',
  '190002548141': '130',
  'sen_rj_jordy': '220',
  'sen_rj_heliosecco': '888',
  'sen_rj_lucianomattos': '280',
  'sen_rj_luizeugenio': '290',
  '190002552521': '290',
  'sen_rj_crivella': '100',
  'sen_rj_marcosdias': '200',
  'sen_rj_michelly': '800',
  '190002548589': '800',
  'sen_rj_monica': '500',
  '190002536164': '500',
  'sen_rj_paulafalcao': '160',
  '190002539827': '160',
  'sen_rj_pedropaulo': '555',
  'sen_rj_waguinho': '101',
  'sen_rj_ivan': '210',
  'sen_rj_mauroiasi': '211',
  'dep_122974': '5555',
  '122974': '5555',
  // Senadores outros estados
  'sen_rs_manuela': '650',
  'sen_sp_colombo': '210',
  'sen_pe_jones': '210',
  'sen_sp_franca': '400',
  'sen_sp_juliana': '131',
  'sen_mg_reginaldo': '130',
  'sen_mg_duda': '120',
  'sen_df_erika': '130',
  'sen_ba_lidice': '400',
  'sen_ce_luizianne': '130',
  'sen_pe_marilia': '770',
  'sen_pr_carol': '131',
  'sen_sc_decio': '130',
  // Deputados Estaduais RJ & Nacional
  'dep_est_rj_dani': '50123',
  'dep_est_rj_minc': '40123',
  'dep_est_rj_serafini': '50456',
  'dep_est_rj_renata': '50789',
  'dep_est_rj_elika': '13123',
  'dep_est_rj_marina': '13713',
  'dep_est_rj_yuri': '50000',
  'dep_est_rj_veronica': '13456',
  'dep_est_rj_josemar': '50100',
  'dep_est_rj_luizpaulo': '55123',
  'dep_est_rj_martha': '12123',
  'ale_ba_olivia': '65000',
  'ale_ac_edvaldo': '65123',
  'ale_ma_rodrigolago': '65123',
  'ale_sp_leci': '65065',
  'ale_pe_cidapedrosa': '65123',
  'ale_sp_antonioalves': '21000',
  'ale_pe_jones': '21000',
  'ale_rj_ivan': '21000',
  // Deputados Federais RJ & Nacional
  'dep_220606': '1333', // Reimont
  'dep_74848': '6565', // Jandira Feghali (PCdoB)
  'dep_152605': '5050', // Glauber Braga
  'dep_74171': '5015', // Chico Alencar
  'dep_204464': '5000', // Talíria Petrone
  'dep_220597': '5010', // Henrique Vieira
  'dep_74858': '1313', // Lindbergh Farias
  'dep_rj_lindbergh': '1313',
  'dep_220598_rj': '5000', // Tarcísio Motta
  'dep_rj_tarcisio': '5000',
  'dep_160511': '4000', // Alessandro Molon
  'dep_rj_molon': '4000',
  'dep_74057': '6565', // Alice Portugal (PCdoB)
  'dep_74060': '6555', // Daniel Almeida (PCdoB)
  'dep_141533': '6565', // Orlando Silva (PCdoB)
  'dep_220545': '6565', // Daiana Santos (PCdoB)
  'dep_204489': '6565', // Márcio Jerry (PCdoB)
  'dep_73808': '6565', // Renildo Calheiros (PCdoB)
  'dep_160538': '6565', // Professora Marcivânia (PCdoB)
  'dep_74079': '6565', // Vanessa Grazziotin (PCdoB)
  'dep_74075': '6565', // Perpétua Almeida (PCdoB)
  'dep_mg_anakaren': '2121', // Ana Karen (PCB)
  'dep_sp_colombo': '2121', // Gabriel Colombo (PCB)
  'dep_pe_jones': '2121', // Jones Manoel (PCB)
  'dep_rj_ivan': '2121', // Ivan Pinheiro (PCB)
  'dep_rj_mauroiasi': '2121', // Mauro Iasi (PCB)
  'dep_sp_raul': '2100', // Raul Silvestre (PCB)
  'dep_rj_heitor': '2121', // Heitor Cesar (PCB)
};

export function getNumeroUrna(candidate: {
  cargo: Cargo | string;
  partyNumber?: number;
  party?: string;
  tseId?: string;
  id?: string;
  name?: string;
  numeroUrna?: string | number;
}): string {
  if (candidate.numeroUrna) {
    return String(candidate.numeroUrna);
  }
  const tseId = candidate.tseId || candidate.id || '';
  if (tseId && KNOWN_URNA_NUMBERS[tseId]) {
    return KNOWN_URNA_NUMBERS[tseId];
  }

  const pNum = candidate.partyNumber || 13;
  const pStr = String(pNum).padStart(2, '0');
  const targetDigits = getCargoDigitsCount(candidate.cargo);

  if (targetDigits === 2) {
    return pStr;
  }

  const seedStr = tseId || candidate.name || '0';
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }

  if (targetDigits === 3) {
    const suffix = (hash % 10).toString();
    return `${pStr}${suffix}`;
  }

  if (targetDigits === 4) {
    const candSuffix = ((hash % 90) + 10).toString().padStart(2, '0');
    return `${pStr}${candSuffix}`;
  }

  if (targetDigits === 5) {
    const candSuffix = ((hash % 900) + 100).toString().padStart(3, '0');
    return `${pStr}${candSuffix}`;
  }

  return pStr;
}

export const CARGOS_BY_LEVEL: Record<ElectionLevel, Cargo[]> = {
  MUNICIPAL: ['VEREADOR', 'PREFEITO'],
  ESTADUAL: ['DEPUTADO_ESTADUAL', 'GOVERNADOR', 'SENADOR'],
  FEDERAL: ['DEPUTADO_FEDERAL', 'SENADOR', 'PRESIDENTE'],
};

export type ElectionYear = 2022 | 2024 | 2026;
export const CURRENT_ELECTION_YEAR: ElectionYear = 2026;

export const UPCOMING_ELECTION = {
  year: 2026 as ElectionYear,
  type: 'GERAIS' as const,
  label: 'Eleições Gerais 2026',
  sourceNotice: 'Candidaturas Ativas TSE/TRE',
  cargos: [
    'DEPUTADO_ESTADUAL',
    'DEPUTADO_FEDERAL',
    'SENADOR',
    'GOVERNADOR',
    'PRESIDENTE',
  ] as Cargo[],
};

export const EXCLUDED_CONSERVATIVE_PARTIES = [
  'PL',
  'REPUBLICANOS',
  'REPUBLICANO',
  'PP',
  'UNIÃO',
  'UNIAO',
  'UNIÃO BRASIL',
  'UNIAO BRASIL',
  'UNIÃƒO',
  'UNIÃƒO BRASIL',
  'PATRIOTA',
  'PATRIOTAS',
  'AVANTE',
  'PRD',
  'PODE',
  'PODEMOS',
  'NOVO',
  'PSDB',
  'PSD',
  'MDB',
  'PMDB',
  'MISSÃO',
  'MISSAO',
  'MISSÃƒO',
  'DEM',
  'DEMOCRATA',
  'DEMOCRATAS',
  'PRTB',
  'DC',
  'DEMOCRACIA CRISTÃ',
  'DEMOCRACIA CRISTA',
] as const;

export function normalizePartyName(party: string): string {
  if (!party) return '';
  return party
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

export const PROGRESSIVE_COALITION_CORE_PARTIES = [
  'PT',
  'PSOL',
  'PCdoB',
  'PCDOB',
  'PV',
  'REDE',
  'PDT',
  'PSB',
  'UP',
  'PCB',
  'PCO',
  'PSTU',
  'FE BRASIL',
  'FEDERAÇÃO BRASIL DA ESPERANÇA',
  'FEDERACAO BRASIL DA ESPERANCA',
  'FEDERAÇÃO PSOL REDE',
  'FEDERACAO PSOL REDE',
  'PSOL-REDE',
] as const;

export const PROGRESSIVE_COALITION_KEYWORDS = [
  ...PROGRESSIVE_COALITION_CORE_PARTIES,
  'FRENTE PROGRESSISTA',
  'FRENTE POPULAR',
  'FRENTE DEMOCRATICA',
  'FRENTE DEMOCRÁTICA',
  'FRENTE AMPLA',
  'COLIGAÇÃO PROGRESSISTA',
  'COLIGACAO PROGRESSISTA',
  'ALIANÇA PROGRESSISTA',
  'ALIANCA PROGRESSISTA',
  'PROGRESSISTAS',
] as const;

export function isCandidateAllowedInProgressiveRoll(candidate: {
  cargo?: Cargo | string;
  party: string;
  isProgressiveSupported?: boolean;
  supportedBy?: string | null;
  coalition?: string | null;
}): boolean {
  if (candidate.isProgressiveSupported) return true;
  if (candidate.supportedBy && candidate.supportedBy.trim().length > 0) return true;

  const cargoUpper = String(candidate.cargo || '').toUpperCase();
  const isSenado = cargoUpper === 'SENADOR' || cargoUpper.includes('SENAD');

  // Check if candidate is part of a progressive alliance/coalition
  if (candidate.coalition) {
    const coalUpper = candidate.coalition.toUpperCase();
    const normalizedCoal = normalizePartyName(candidate.coalition);
    const hasProgressivePartner = PROGRESSIVE_COALITION_KEYWORDS.some((p) => {
      const pUpper = p.toUpperCase();
      return coalUpper.includes(pUpper) || (pUpper.length >= 3 && normalizedCoal.includes(normalizePartyName(pUpper)));
    });
    if (hasProgressivePartner) return true;
  }

  const partyUpper = (candidate.party || '').trim().toUpperCase();
  const normalizedParty = normalizePartyName(candidate.party);

  const isExcluded =
    (EXCLUDED_CONSERVATIVE_PARTIES as readonly string[]).includes(partyUpper) ||
    (EXCLUDED_CONSERVATIVE_PARTIES as readonly string[]).some(
      (p) => normalizePartyName(p) === normalizedParty
    ) ||
    normalizedParty.includes('UNIAO') ||
    normalizedParty.includes('MISSAO') ||
    normalizedParty.includes('DEMOCRATA');

  // For Senate candidates in broad democratic front or coalition:
  if (isSenado) {
    if (!isExcluded) return true;
    if (candidate.coalition) {
      const coalUpper = candidate.coalition.toUpperCase();
      const normalizedCoal = normalizePartyName(candidate.coalition);
      const hasProgressive = PROGRESSIVE_COALITION_KEYWORDS.some((p) => {
        const pUpper = p.toUpperCase();
        return coalUpper.includes(pUpper) || (pUpper.length >= 3 && normalizedCoal.includes(normalizePartyName(pUpper)));
      });
      if (hasProgressive) return true;
    }
    // Parties in democratic fronts / coalitions with progressive field (e.g. PSD, SOLIDARIEDADE, MDB, CIDADANIA, PSB, PDT, etc.)
    if (['PSD', 'SOLIDARIEDADE', 'CIDADANIA', 'MOBILIZA', 'AGIR', 'PMB', 'MDB', 'PSDB'].includes(partyUpper)) {
      if (candidate.isProgressiveSupported || candidate.supportedBy || candidate.coalition) {
        return true;
      }
    }
    return false;
  }

  if (!isExcluded) return true;

  return false;
}

export const EXCLUDED_PARTIES_EMPIRICAL_FILTER = EXCLUDED_CONSERVATIVE_PARTIES;

export const PROGRESSIVE_GUIDELINE_NOTICE =
  "💡 Diretriz de Alinhamento: Filtro comportamental baseado em evidências empíricas e no ideário iluminista (ciência, laicidade e salvaguardas técnicas).";

export const PROGRESSIVE_FILTER_DISCLAIMER = {
  title: "Critério de Filtro Partidário & Disclaimer Ideológico-Empírico",
  intro:
    "Com base na definição fornecida, que estabelece o progressismo como um movimento fundamentado no avanço científico, tecnológico, econômico e comunitário, integrado ao ideário iluminista (razão, secularismo, direitos universais) e no fortalecimento do conhecimento empírico como motor da civilização, podemos aplicar esse conceito como um filtro rigoroso para analisar o espectro partidário brasileiro.\n\nPara que um partido político seja atingido por este filtro, sua doutrina central ou sua ala hegemônica deve contradizer ativamente esses pilares, seja por meio da rejeição do conhecimento empírico, da subordinação das políticas públicas a dogmas não racionais ou da adoção de retóricas anti-iluministas e negacionistas, comportamento real de votação em plenário e comissões (votações nominais, orientação de bancada e o padrão agregado de seus membros), a análise torna-se mais rigorosa e baseada em evidências empíricas da ação parlamentar.\n\nNesse cenário, o critério de exclusão passa a ser: votação sistemática da bancada (ou de sua maioria esmagadora) contra consensos científicos, em favor da desregulamentação que ignora dados empíricos de impacto, ou contra princípios iluministas de laicidade e racionalidade na educação e saúde pública.",
  caveat:
    "Ressalvas Analíticas Importantes: O filtro aplicado aqui é estritamente doutrinário, baseado na definição filosófica de Progressismo constante no aplicativo.\n\nCom base no histórico de votações nominais na Câmara dos Deputados e no Senado (como as relacionadas a agrotóxicos, licenciamento ambiental, mineração em terras indígenas e pautas de laicidade), os seguintes partidos se enquadram na seleção por este filtro:",
  systematicParties: [
    {
      party: "PL (Partido Liberal)",
      sigla: "PL",
      rationale:
        'Apresenta um dos registros mais consistentes de votação contrária a pautas baseadas em evidências empíricas. Sua bancada votou massivamente a favor do chamado "PL do Veneno" (facilitação de agrotóxicos contra pareceres da ANVISA/IBAMA), do "PL da Devastação" (PL 2159/2021, que enfraquece o licenciamento ambiental e dispensa estudos de impacto), do "PL da Grilagem" (regularização fundiária sem vistoria técnica do Incra) e do "Marco Temporal" (ignorando dados antropológicos e históricos sobre ocupação indígena). Esse padrão demonstra uma subordinação da política pública a dogmas ideológicos ou interesses econômicos imediatos, em detrimento do "conhecimento empírico" e do "progresso comunitário" mencionados na definição.',
    },
    {
      party: "Republicanos",
      sigla: "REPUBLICANOS",
      rationale:
        'Além de votar sistematicamente a favor da desregulamentação ambiental e sanitária que ignora critérios técnicos, é o partido que mais frequentemente lidera ou apoia votações em comissões que buscam inserir dogmas religiosos em políticas públicas de educação e saúde, ferindo diretamente o "ideário iluminista" de secularismo e racionalidade.',
    },
    {
      party: "PP (Progressistas)",
      sigla: "PP",
      rationale:
        'Apesar do nome, seu comportamento agregado em votações nominais é historicamente alinhado ao enfraquecimento de agências reguladoras baseadas em ciência. Votou a favor do "PL do Veneno", do "PL da Devastação" e de medidas que flexibilizam a proteção de áreas de preservação permanente (APPs) sem base em dados ecológicos.',
    },
    {
      party: "União Brasil, Patriotas e Avante",
      sigla: "UNIÃO / AVANTE / PRD",
      rationale:
        'Seguem um padrão de alinhamento recorrente em votações que dispensam estudos de impacto empírico. O Avante e o Patriotas (incorporado ao PRD), por exemplo, votaram a favor da urgência e do mérito de projetos como a mineração em terras indígenas (PL 191/2020), ignorando evidências científicas e antropológicas sobre o impacto comunitário e ambiental.',
    },
  ],
  contradictoryParties: [
    {
      party: "MDB e Podemos",
      sigla: "MDB / PODE",
      rationale:
        'Embora abriguem parlamentares técnicos, suas orientações de bancada em votações cruciais (como o "PL da Devastação" e o "Marco Temporal") frequentemente oscilam ou aprovam medidas que enfraquecem a regulação baseada em evidências, priorizando a governabilidade ou interesses regionais em detrimento do rigor científico.',
    },
    {
      party: "PSD (Partido Social Democrático)",
      sigla: "PSD",
      rationale:
        'Embora abrigue quadros e lideranças de perfil institucionalista com atuação destacada em defesa da ciência e da vacinação (como na CPI da Pandemia), o comportamento agregado e hegemônico de suas bancadas na Câmara e no Senado em votações estruturantes — como o Marco Temporal, o PL do Licenciamento Ambiental e o PL dos Agrotóxicos — alinha-se reiteradamente à supressão de salvaguardas técnicas de órgãos reguladores (ANVISA, IBAMA). Seu modelo pragmático e fisiológico de governabilidade colide com a primazia contínua do método empírico.',
    },
    {
      party: "NOVO",
      sigla: "NOVO",
      rationale:
        'Defende o "progresso econômico e tecnológico", mas votou a favor da desregulamentação ambiental e sanitária (como o "PL do Veneno"), ignorando que o verdadeiro progresso tecnológico, sob a ótica iluminista, não pode se dar pela supressão do conhecimento empírico sobre danos à condição humana e ao meio ambiente.',
    },
  ],
  nonExcludedParties: {
    parties: ["PT", "PSOL", "PCdoB", "PV", "Rede", "PDT", "PSB"],
    rationale:
      "Para validar o filtro, é útil observar quais partidos mantêm um padrão de votação agregado alinhado à defesa do conhecimento empírico e do ideário iluminista. Em votações nominais sobre os mesmos projetos citados acima, as bancadas do PT, PSOL, PCdoB, PV, Rede e, na maioria das vezes, PDT e PSB, votaram sistematicamente contra a flexibilização de critérios científicos, defendendo a manutenção de agências reguladoras (ANVISA, IBAMA, Incra) e a laicidade do Estado.",
  },
  summaryPoints: [
    "Exclui-se qualquer partido cuja maioria de seus membros vote repetidamente para substituir laudos técnicos e dados empíricos por autodeclarações, dogmas religiosos ou desregulamentação cega.",
    "Exclui-se partidos que usam a máquina legislativa para obstruir o avanço comunitário (ex.: direitos indígenas, proteção climática) quando este avanço é respaldado por consenso científico.",
    "A exclusão não se baseia em 'ser de direita ou esquerda', mas na fidelidade ao método empírico e à razão iluminista como base para a melhoria da condição humana. Partidos que falham consistentemente nesse teste comportamental, independentemente de sua autodeclaração ideológica, são filtrados.",
  ],
};

export interface TrustedDataSource {
  id: string;
  name: string;
  url: string;
  searchUrl?: (query: string) => string;
  description: string;
  isTrusted: boolean;
  institution: string;
}

export const TRUSTED_DATA_SOURCES: TrustedDataSource[] = [
  {
    id: 'tse_dados_abertos',
    name: 'Portal de Dados Abertos do TSE',
    url: 'https://dadosabertos.tse.jus.br/',
    searchUrl: (q: string) => `https://dadosabertos.tse.jus.br/dataset?q=${encodeURIComponent(q)}`,
    description: 'Repositório oficial e confiável de dados públicos, candidaturas, bens e prestações de contas da Justiça Eleitoral.',
    isTrusted: true,
    institution: 'Tribunal Superior Eleitoral (TSE)',
  },
  {
    id: 'tse_divulgacand',
    name: 'TSE — DivulgaCandContas',
    url: 'https://divulgacandcontas.tse.jus.br/',
    searchUrl: (q: string) => `https://divulgacandcontas.tse.jus.br/divulga/#/candidato`,
    description: 'Sistema oficial de divulgação de candidaturas e contas eleitorais do TSE.',
    isTrusted: true,
    institution: 'Tribunal Superior Eleitoral (TSE)',
  },
  {
    id: 'camara_dados_abertos',
    name: 'Câmara dos Deputados — Dados Abertos',
    url: 'https://dadosabertos.camara.leg.br/',
    searchUrl: (q: string) => `https://dadosabertos.camara.leg.br/api/v2/deputados?nome=${encodeURIComponent(q)}`,
    description: 'Serviço oficial de dados abertos da Câmara dos Deputados.',
    isTrusted: true,
    institution: 'Câmara dos Deputados',
  },
  {
    id: 'senado_dados_abertos',
    name: 'Senado Federal — Dados Abertos',
    url: 'https://legis.senado.leg.br/dadosabertos/',
    searchUrl: (q: string) => `https://legis.senado.leg.br/dadosabertos/senador/lista/atual`,
    description: 'Portal oficial de transparência e dados abertos do Senado Federal.',
    isTrusted: true,
    institution: 'Senado Federal',
  },
];

export const KNOWN_PARLIAMENTARY_PHOTOS: Record<string, string> = {
  // Presidente 2026 / 2022
  'c1': '/candidates/pres_lula.jpg',
  '280002542548': '/candidates/pres_lula.jpg',
  '280001600001': '/candidates/pres_lula.jpg',
  'pres_lula': '/candidates/pres_lula.jpg',
  'pres_ciro': '/candidates/pres_ciro.jpg',
  'pres_glauber': '/candidates/pres_glauber.jpg',
  'pres_leonardo': '/candidates/pres_leonardo.jpg',
  'pres_sofia': '/candidates/pres_sofia.jpg',
  'pres_veralucia': '/candidates/pres_veralucia.jpg',
  'pres_ruicosta': '/candidates/pres_ruicosta.jpg',
  '280002551975': '/candidates/pres_sofia.jpg',
  '280002538811': '/candidates/pres_leonardo.jpg',
  '280002541457': '/candidates/pres_veralucia.jpg',
  '280002552487': '/candidates/pres_ruicosta.jpg',

  // Governadores
  '190002540001': '/candidates/gov_rj_paes.jpg',
  'gov_rj_paes': '/candidates/gov_rj_paes.jpg',
  '190002536162': '/candidates/gov_rj_siri.jpg',
  'gov_rj_siri': '/candidates/gov_rj_siri.jpg',
  '190002552513': '/candidates/gov_rj_neves.jpg',
  'gov_rj_neves': '/candidates/gov_rj_neves.jpg',
  '190002540198': '/candidates/gov_rj_cyro.jpg',
  'gov_rj_cyro': '/candidates/gov_rj_cyro.jpg',
  '190002540200': '/candidates/gov_rj_juliete.jpg',
  '190002547272': '/candidates/gov_rj_juliete.jpg',
  'gov_rj_juliete': '/candidates/gov_rj_juliete.jpg',
  'gov_sp_haddad': '/candidates/gov_sp_haddad.jpg',
  '250002549705': '/candidates/gov_sp_haddad.jpg',
  'gov_sp_franca': '/candidates/gov_sp_franca.jpg',
  '250002549704': '/candidates/gov_sp_franca.jpg',
  '250002536915': '/candidates/gov_sp_veralucia.jpg',
  '250002544912': '/candidates/gov_sp_vivian.jpg',

  // Senadores
  '190002548141': '/candidates/sen_rj_benedita.jpg',
  'sen_rj_benedita': '/candidates/sen_rj_benedita.jpg',
  'sen_rj_portinho': '/candidates/sen_rj_portinho.jpg',
  'sen_rj_jordy': '/candidates/sen_rj_jordy.jpg',
  'sen_rj_crivella': '/candidates/sen_rj_crivella.jpg',
  'sen_rj_pedropaulo': '/candidates/sen_rj_pedropaulo.jpg',
  'sen_rj_luizeugenio': '/candidates/sen_rj_luizeugenio.jpg',
  'sen_rj_michelly': '/candidates/sen_rj_michelly.jpg',
  'sen_rj_monica': '/candidates/sen_rj_monica.jpg',
  'sen_rj_paulafalcao': '/candidates/sen_rj_paulafalcao.jpg',
  'sen_rj_waguinho': '/candidates/sen_rj_waguinho.jpg',
  'sen_rj_lucianomattos': '/candidates/sen_rj_lucianomattos.jpg',
  'sen_rj_marcosdias': '/candidates/sen_rj_marcosdias.jpg',
  'sen_rj_heliosecco': '/candidates/sen_rj_heliosecco.jpg',
  'dep_122974': 'https://www.camara.leg.br/internet/deputado/bandep/122974.jpg',
  '122974': 'https://www.camara.leg.br/internet/deputado/bandep/122974.jpg',
  'sen_rj_molon': '/candidates/sen_rj_molon.jpg',
  'dep_160511': 'https://www.camara.leg.br/internet/deputado/bandep/160511.jpg',
  'sen_rj_lindbergh': '/candidates/sen_rj_lindbergh.jpg',
  'dep_74858': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  'sen_rj_tarcisio': '/candidates/sen_rj_tarcisio.jpg',
  'dep_220598': 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  'sen_rs_manuela': '/candidates/pcdob_manueladavila.jpg',
  'gov_pe_luciana': '/candidates/pcdob_lucianasantos.jpg',
  'gov_rj_eduardoserra': '/candidates/pcb_eduardoserra.jpg',
  'sen_pe_jones': '/candidates/pcb_jonesmanoel.jpg',
  'dep_pe_jones': '/candidates/pcb_jonesmanoel.jpg',
  'sen_rj_mauroiasi': '/candidates/pcb_mauroiasi.jpg',
  'dep_rj_mauroiasi': '/candidates/pcb_mauroiasi.jpg',
  'dep_mg_anakaren': '/candidates/pcb_anakaren.jpg',
  'ale_sp_antonioalves': '/candidates/pcb_antonioalves.jpg',
  'ale_pe_jones': '/candidates/pcb_jonesmanoel.jpg',

  // Lideranças Estaduais / Deputados Estaduais
  'ale_rj_renatasouza': '/candidates/280001600026.jpg',
  'ale_rj_carlosminc': '/candidates/280001600027.jpg',
  'ale_sp_suplicy': '/candidates/280001600018.jpg',
  'ale_rs_lucianagenro': '/candidates/ale_rs_lucianagenro.jpg',
  'ale_rj_danimonteiro': '/candidates/ale_rj_danimonteiro.jpg',
  'ale_rj_flavioserafini': '/candidates/ale_rj_flavioserafini.jpg',

  // Outras Lideranças e Deputados Estaduais / Federais
  'dep_ap_acacio': '/candidates/dep_ap_acacio.jpg',
  'ale_mg_andreia': '/candidates/ale_mg_andreia.jpg',
  'ale_mg_beatrizcerqueira': '/candidates/ale_mg_beatrizcerqueira.jpg',
  'ale_go_biadelima': '/candidates/ale_go_biadelima.jpg',
  'sen_es_camila': '/candidates/ale_es_camila.jpg',
  'ale_es_camila': '/candidates/ale_es_camila.jpg',
  'dep_es_camila': '/candidates/ale_es_camila.jpg',
  'sen_ap_camilo': '/candidates/dep_204495.jpg',
  'dep_pi_castro': 'https://www.camara.leg.br/internet/deputado/bandep/220699.jpg',
  'ale_df_chicovigilante': '/candidates/ale_df_chicovigilante.jpg',
  'ale_ma_carloslula': '/candidates/ale_ma_carloslula.jpg',
  'ale_ba_olivia': '/candidates/ale_ba_olivia.jpg',
  'ale_ac_edvaldo': '/candidates/ale_ac_edvaldo.jpg',
  'ale_ma_rodrigolago': '/candidates/ale_ma_rodrigolago.jpg',
  'dep_74848': '/candidates/dep_74848.jpg',
  'dep_74057': '/candidates/dep_74057.jpg',
  'dep_74060': '/candidates/dep_74060.jpg',
  'dep_141533': '/candidates/dep_141533.jpg',
  'dep_220545': '/candidates/dep_220545.jpg',
  'dep_204489': '/candidates/dep_204489.jpg',
  'dep_73808': '/candidates/dep_73808.jpg',
  'dep_160538': '/candidates/dep_160538.jpg',
  'dep_74079': '/candidates/dep_74079.jpg',
  'dep_74075': '/candidates/dep_74075.jpg',
};

export interface PartyColorTheme {
  primary: string;
  secondary: string;
  text: string;
  border: string;
}

export const PARTY_COLORS: Record<string, PartyColorTheme> = {
  PT: { primary: '#CC0000', secondary: '#990000', text: '#FFFFFF', border: '#FF4D4D' },
  PSOL: { primary: '#5B187F', secondary: '#FFCC00', text: '#FFFFFF', border: '#8A2BE2' },
  PSB: { primary: '#E30613', secondary: '#FFCC00', text: '#FFFFFF', border: '#FF4D4D' },
  PCDOB: { primary: '#B30000', secondary: '#FFD700', text: '#FFFFFF', border: '#CC0000' },
  REDE: { primary: '#009E96', secondary: '#F39200', text: '#FFFFFF', border: '#00BFA5' },
  PV: { primary: '#008000', secondary: '#004D00', text: '#FFFFFF', border: '#2E7D32' },
  PDT: { primary: '#0047AB', secondary: '#CC0000', text: '#FFFFFF', border: '#1E88E5' },
  UP: { primary: '#1A1A1A', secondary: '#CC0000', text: '#FFFFFF', border: '#424242' },
  PSTU: { primary: '#B30000', secondary: '#000000', text: '#FFFFFF', border: '#D32F2F' },
  PCB: { primary: '#8B0000', secondary: '#FFD700', text: '#FFFFFF', border: '#B71C1C' },
  PCO: { primary: '#D2143A', secondary: '#FFCC00', text: '#FFFFFF', border: '#E53935' },
  CIDADANIA: { primary: '#E95D0F', secondary: '#1D71B8', text: '#FFFFFF', border: '#FB8C00' },
  SOLIDARIEDADE: { primary: '#005DAA', secondary: '#E30613', text: '#FFFFFF', border: '#1976D2' },
  PSD: { primary: '#006699', secondary: '#FFCC00', text: '#FFFFFF', border: '#0288D1' },
  MOBILIZA: { primary: '#336699', secondary: '#FF9900', text: '#FFFFFF', border: '#4682B4' },
  AGIR: { primary: '#4B0082', secondary: '#FFD700', text: '#FFFFFF', border: '#6A1B9A' },
  PMB: { primary: '#008080', secondary: '#FF69B4', text: '#FFFFFF', border: '#00897B' },
  AVANTE: { primary: '#1E3A8A', secondary: '#F59E0B', text: '#FFFFFF', border: '#3B82F6' },
  PODE: { primary: '#0284C7', secondary: '#0EA5E9', text: '#FFFFFF', border: '#38BDF8' },
  MDB: { primary: '#059669', secondary: '#DC2626', text: '#FFFFFF', border: '#10B981' },
};

export function getPartyColors(party?: string | null): PartyColorTheme {
  const norm = (party || '').toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  return (
    PARTY_COLORS[norm] || {
      primary: '#1E293B',
      secondary: '#475569',
      text: '#FFFFFF',
      border: '#64748B',
    }
  );
}

export function getPartyBadgeUrl(party?: string | null, baseUrl?: string): string {
  const norm = (party || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const base = (baseUrl || 'https://eleicoes-progressistas.onrender.com').replace(/\/+$/, '');
  return `${base}/candidates/party_${norm}.png`;
}

/**
 * Retorna uma cadeia ordenada de URLs de fallback para a foto do candidato.
 * ORDEM OFICIAL: TSE primeiro, outras fontes somente se o TSE não tiver.
 * Permite que o componente de UI tente a próxima fonte caso a primeira falhe (404/400).
 */
export function resolveCandidatePhotoFallbackChain(candidate: {
  photoUrl?: string | null;
  tseId?: string | null;
  cargo?: string | null;
  name?: string | null;
  id?: string | null;
  state?: string | null;
  party?: string | null;
  baseUrl?: string;
}): string[] {
  const urls: string[] = [];
  const photoUrl = candidate.photoUrl?.trim() || '';
  const tseId = candidate.tseId?.trim() || candidate.id?.trim() || '';
  const cleanPhotoKey = photoUrl.replace(/^\/?candidates\//, '').replace(/\.jpg$/i, '');
  const base = (candidate.baseUrl || 'https://eleicoes-progressistas.onrender.com').replace(/\/+$/, '');

  const globalWin: any = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
  const clientOrigin = globalWin?.location?.origin ? String(globalWin.location.origin).replace(/\/+$/, '') : '';
  const isWeb = typeof globalWin !== 'undefined';

  const pushStatic = (p: string) => {
    if (!p) return;
    const v = p.includes('?') ? '&v=2' : '?v=2';
    if (p.startsWith('http')) {
      urls.push(p.replace(/^http:\/\//i, 'https://') + v);
    } else {
      if (isWeb) {
        urls.push(p + v);
        if (clientOrigin) urls.push(`${clientOrigin}${p}${v}`);
      }
      urls.push(`${base}${p}${v}`);
      urls.push(`https://eleicoes-progressistas.pages.dev${p}${v}`);
      urls.push(`https://eleicoes-progressistas.onrender.com${p}${v}`);
    }
  };

  const isTseUrl = (u: string) =>
    /divulgacand(contas)?\.tse\.jus\.br/i.test(u) || /dadosabertos\.tse\.jus\.br/i.test(u);
  const isNumericTseId = /^\d+$/.test(tseId) || /^\d+$/.test(cleanPhotoKey);
  const numericTseId = /^\d+$/.test(tseId) ? tseId : /^\d+$/.test(cleanPhotoKey) ? cleanPhotoKey : '';

  // 1. TSE PRIMEIRO: photoUrl explícita somente se já for do TSE (evita foto errada de outras fontes).
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    if (isTseUrl(photoUrl)) {
      urls.push(photoUrl.replace(/^http:\/\//i, 'https://'));
    }
  } else if (photoUrl.startsWith('/') && (isTseUrl(photoUrl) || photoUrl.startsWith('/candidates/tse_'))) {
    pushStatic(photoUrl);
  }

  // 2. Foto oficial de urna DivulgaCandContas do TSE por sqCandidato numérico (fonte primária).
  if (numericTseId) {
    urls.push(`https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1/candidatura/buscar/foto/2045202026/${numericTseId}`);
  }

  // 3. Cópia local espelhada do TSE (tse_{id}.jpg baixado do DivulgaCand).
  if (numericTseId) {
    pushStatic(`/candidates/tse_${numericTseId}.jpg`);
  }

  // 4. Mapeamento explícito por tseId EXATO (sem fuzzy por nome). Só entra se o id bater exatamente.
  if (tseId && KNOWN_PARLIAMENTARY_PHOTOS[tseId]) {
    pushStatic(KNOWN_PARLIAMENTARY_PHOTOS[tseId]);
  }

  // 5. Cópia estática local por chave exata (ex.: pres_lula) — somente chaves conhecidas, sem adivinhar.
  if (cleanPhotoKey && cleanPhotoKey !== tseId && KNOWN_PARLIAMENTARY_PHOTOS[cleanPhotoKey]) {
    pushStatic(KNOWN_PARLIAMENTARY_PHOTOS[cleanPhotoKey]);
  }

  // 6. Portais institucionais somente para IDs institucionais exatos (dep_/sen_).
  const depMatch = tseId.match(/^dep_(\d+)$/);
  if (depMatch && depMatch[1]) {
    urls.push(`https://www.camara.leg.br/internet/deputado/bandep/${depMatch[1]}.jpg`);
  }
  const senMatch = tseId.match(/^sen_(\d+)$/);
  if (senMatch && senMatch[1]) {
    urls.push(`https://www.senado.leg.br/senadores/img/fotos-oficiais/${senMatch[1]}.jpg`);
  }

  // 7. photoUrl explícita NÃO-TSE (outras fontes): somente após esgotar o TSE.
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    if (!isTseUrl(photoUrl)) {
      urls.push(photoUrl.replace(/^http:\/\//i, 'https://'));
    }
  } else if (photoUrl.startsWith('/')) {
    if (!isTseUrl(photoUrl) && !photoUrl.startsWith('/candidates/tse_')) {
      pushStatic(photoUrl);
    }
  }

  // 8. CDN espelho de santinhos (não-oficial): após TSE.
  if (tseId && /^\d+$/.test(tseId)) {
    const uf = (candidate.state || 'rj').toLowerCase();
    urls.push(`https://www.tribunapr.com.br/hermes-media/eleicoes/2026/candidatos/${uf}/${tseId}.jpg`);
  }

  // 9. Proxy inteligente POR ÚLTIMO (busca fuzzy por nome pode trazer homônimo).
  // Mantido apenas como último recurso; o backend deve exigir nome exato antes de retornar.
  const searchName = candidate.name?.trim() || candidate.tseId || '';
  if (searchName) {
    const qName = encodeURIComponent(searchName);
    const qUf = encodeURIComponent(candidate.state || 'BR');
    const qTseId = encodeURIComponent(tseId);
    urls.push(`${base}/api/candidates/photo-proxy?name=${qName}&state=${qUf}&tseId=${qTseId}&strict=true`);
  }

  // Remove duplicados e strings vazias preservando a ordem de prioridade
  return [...new Set(urls.filter(Boolean))];
}

/**
 * Resolve a melhor URL de foto disponível para um candidato:
 * 1. Foto oficial de urna no portal DivulgaCandContas do TSE (fonte primária)
 * 2. Cópia local espelhada do TSE (tse_{id}.jpg)
 * 3. Mapeamento institucional exato por tseId (Câmara, Senado, etc.)
 * 4. Outras fontes somente se o TSE não tiver (CDN, photo-proxy fuzzy por último)
 */
export function resolveCandidatePhotoUrl(candidate: {
  photoUrl?: string | null;
  tseId?: string | null;
  cargo?: string | null;
  name?: string | null;
  id?: string | null;
}): string {
  const chain = resolveCandidatePhotoFallbackChain(candidate);
  return chain[0] || '';
}

export function getTseDadosAbertosSearchUrl(query: string): string {
  return `https://dadosabertos.tse.jus.br/dataset?q=${encodeURIComponent(query.trim())}`;
}

export * from './polls';
export * from './mandate-proposals';
export * from './pillar-justificativa';
export * from './official-candidates';




