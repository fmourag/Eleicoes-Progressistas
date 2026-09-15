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
  // Senadores RJ
  'sen_rj_lindbergh': '131',
  'sen_rj_benedita': '133',
  'sen_rj_tarcisio': '500',
  'sen_rj_molon': '400',
  // Deputados Estaduais RJ
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
  // Deputados Federais RJ
  'dep_220606': '1333', // Reimont
  'dep_74848': '6565', // Jandira Feghali
  'dep_152605': '5050', // Glauber Braga
  'dep_74171': '5015', // Chico Alencar
  'dep_204464': '5000', // Talíria Petrone
  'dep_220597': '5010', // Henrique Vieira
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
] as const;

export function isCandidateAllowedInProgressiveRoll(candidate: {
  party: string;
  isProgressiveSupported?: boolean;
  supportedBy?: string | null;
  coalition?: string | null;
}): boolean {
  if (candidate.isProgressiveSupported) return true;
  if (candidate.supportedBy && candidate.supportedBy.trim().length > 0) return true;

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

  if (!isExcluded) return true;

  // If candidate is from an excluded party, allow if they are part of a progressive alliance/coalition
  if (candidate.coalition) {
    const coalUpper = candidate.coalition.toUpperCase();
    const hasProgressivePartner = PROGRESSIVE_COALITION_CORE_PARTIES.some((p) =>
      coalUpper.includes(p)
    );
    if (hasProgressivePartner) return true;
  }

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
  // Presidente
  '280001600001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/500px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg',
  
  // Governadores
  'gov_rj_paes': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Eduardo_Paes%2C_October_2024.jpg/500px-Eduardo_Paes%2C_October_2024.jpg',
  'gov_rj_cyro': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg/500px-2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  'gov_sp_haddad': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Fernando_Haddad_posse_min._da_Fazenda.jpg/500px-Fernando_Haddad_posse_min._da_Fazenda.jpg',
  'gov_sp_franca': 'https://www.camara.leg.br/internet/deputado/bandep/160535.jpg',
  'gov_ba_jeronimo': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/18_01_2023_-_Visita_de_Cortesia_Jer%C3%B4nimo_Rodrigues_%28Governador_do_Estado_da_Bahia-BA%29_%2852635213362%29_%28cropped%29.jpg/500px-18_01_2023_-_Visita_de_Cortesia_Jer%C3%B4nimo_Rodrigues_%28Governador_do_Estado_da_Bahia-BA%29_%2852635213362%29_%28cropped%29.jpg',
  'gov_ce_elmano': 'https://www.camara.leg.br/internet/deputado/bandep/204554.jpg',
  'gov_pi_rafael': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Rafael_Fonteles_%28Foto_Oficial%29.jpg/500px-Rafael_Fonteles_%28Foto_Oficial%29.jpg',
  'gov_rn_fatima': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/F%C3%A1tima_Bezerra%2C_2023.jpg/500px-F%C3%A1tima_Bezerra%2C_2023.jpg',
  'gov_pb_azevedo': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Jo%C3%A3o_Azev%C3%AAdo%2C_May_2023_%28cropped%29.jpg/500px-Jo%C3%A3o_Azev%C3%AAdo%2C_May_2023_%28cropped%29.jpg',
  'gov_ma_brandao': 'https://www.camara.leg.br/internet/deputado/bandep/141408.jpg',
  'gov_es_casagrande': 'https://www.senado.leg.br/senadores/img/fotos-oficiais/4525.jpg',
  'gov_ap_clecio': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Cl%C3%A9cio_Lu%C3%ADs_em_2023.jpg/500px-Cl%C3%A9cio_Lu%C3%ADs_em_2023.jpg',
  'gov_ac_jorge': 'https://www.senado.leg.br/senadores/img/fotos-oficiais/4981.jpg',
  'gov_am_marcelo': 'https://www.camara.leg.br/internet/deputado/bandep/204552.jpg',
  'gov_pa_beto': 'https://www.senado.leg.br/senadores/img/fotos-oficiais/141335.jpg',
  'gov_mg_silveira': 'https://www.senado.leg.br/senadores/img/fotos-oficiais/5386.jpg',
  'gov_mg_rogerio': 'https://www.camara.leg.br/internet/deputado/bandep/204481.jpg',
  'gov_rj_neves': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Rodrigo_Neves_em_2018.jpg/500px-Rodrigo_Neves_em_2018.jpg',
  'gov_pr_requiao': 'https://www.senado.leg.br/senadores/img/fotos-oficiais/24.jpg',
  'gov_rs_pretto': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Edegar_Pretto_em_2022.jpg/500px-Edegar_Pretto_em_2022.jpg',
  'gov_sc_decio': 'https://www.camara.leg.br/internet/deputado/bandep/141413.jpg',
  'gov_df_grass': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Leandro_Grass_em_2022.jpg/500px-Leandro_Grass_em_2022.jpg',
  'gov_pe_cabral': 'https://www.camara.leg.br/internet/deputado/bandep/160528.jpg',
  'gov_se_mitidieri': 'https://www.camara.leg.br/internet/deputado/bandep/178969.jpg',
  'gov_se_rogerio': 'https://www.senado.leg.br/senadores/img/fotos-oficiais/5979.jpg',
  'gov_to_mourao': 'https://www.camara.leg.br/internet/deputado/bandep/74044.jpg',

  // Senadores
  'sen_rj_molon': 'https://www.camara.leg.br/internet/deputado/bandep/160511.jpg',
  'sen_rj_lindbergh': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  'sen_rj_benedita': 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  'sen_rj_tarcisio': 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',

  // Lideranças Estaduais / Deputados Estaduais
  'ale_rj_renatasouza': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Renata_Souza_em_2022.jpg/500px-Renata_Souza_em_2022.jpg',
  'ale_rj_carlosminc': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Carlos_Minc_2022.jpg/500px-Carlos_Minc_2022.jpg',
  'ale_sp_suplicy': 'https://www.senado.leg.br/senadores/img/fotos-oficiais/38.jpg',
  'ale_rs_lucianagenro': 'https://www.camara.leg.br/internet/deputado/bandep/74844.jpg',
  // Rio de Janeiro
  'gov_rj_juliete': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg/500px-Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  'gov_rj_siri': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Eduardo_Paes_em_2021.jpg/500px-Eduardo_Paes_em_2021.jpg',
  'ale_rj_danimonteiro': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Renata_Souza_em_2022.jpg/500px-Renata_Souza_em_2022.jpg',

  // Outras Lideranças e Deputados Estaduais / Federais
  'dep_ap_acacio': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Acacio_Favacho.jpg/500px-Acacio_Favacho.jpg',
  'sen_pr_carol': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/2023-07-03_Ses%C3%A3o_Solene_-_Dia_Mundial_do_Refugiado_06_%28cropped%29.jpg/500px-2023-07-03_Ses%C3%A3o_Solene_-_Dia_Mundial_do_Refugiado_06_%28cropped%29.jpg',
  'ale_mg_andreia': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Andr%C3%A9ia_de_Jesus.jpg/500px-Andr%C3%A9ia_de_Jesus.jpg',
  'ale_mg_beatrizcerqueira': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Deputada_Beatriz_Cerqueira_2023.jpg/500px-Deputada_Beatriz_Cerqueira_2023.jpg',
  'ale_go_biadelima': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Bia_de_Lima_em_2022.jpg/500px-Bia_de_Lima_em_2022.jpg',
  'sen_es_camila': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/2023-02-01_Deputada_Camila_Valad%C3%A3o.jpg/500px-2023-02-01_Deputada_Camila_Valad%C3%A3o.jpg',
  'ale_es_camila': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/2023-02-01_Deputada_Camila_Valad%C3%A3o.jpg/500px-2023-02-01_Deputada_Camila_Valad%C3%A3o.jpg',
  'dep_es_camila': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/2023-02-01_Deputada_Camila_Valad%C3%A3o.jpg/500px-2023-02-01_Deputada_Camila_Valad%C3%A3o.jpg',
  'sen_ap_camilo': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Camilo_Capiberibe_em_novembro_de_2011_%28cropped%29.jpg/500px-Camilo_Capiberibe_em_novembro_de_2011_%28cropped%29.jpg',
  'dep_pi_castro': 'https://www.camara.leg.br/internet/deputado/bandep/220699.jpg',
  'ale_df_chicovigilante': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Chico_Vigilante_%28cropped%29.jpg/500px-Chico_Vigilante_%28cropped%29.jpg',
  'ale_ma_carloslula': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Carlos_Minc_2022.jpg/500px-Carlos_Minc_2022.jpg',
};

/**
 * Retorna uma cadeia ordenada de URLs de fallback para a foto do candidato.
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

  // 1. URL explícita válida externa (HTTPS)
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    urls.push(photoUrl.replace(/^http:\/\//i, 'https://'));
  }

  // 2. Mapeamento explícito de fotos parlamentares e lideranças nacionais
  if (tseId && KNOWN_PARLIAMENTARY_PHOTOS[tseId]) {
    urls.push(KNOWN_PARLIAMENTARY_PHOTOS[tseId]);
  }
  if (cleanPhotoKey && KNOWN_PARLIAMENTARY_PHOTOS[cleanPhotoKey]) {
    urls.push(KNOWN_PARLIAMENTARY_PHOTOS[cleanPhotoKey]);
  }

  // 3. Imagem estática hospedada no backend da aplicação
  if (photoUrl && photoUrl.startsWith('/')) {
    urls.push(`${base}${photoUrl}`);
  }
  if (tseId) {
    urls.push(`${base}/candidates/${tseId}.jpg`);
  }
  if (cleanPhotoKey && cleanPhotoKey !== tseId) {
    urls.push(`${base}/candidates/${cleanPhotoKey}.jpg`);
  }

  // 4. Portal da Câmara dos Deputados (para deputados federais)
  const depMatch = tseId.match(/^dep_(\d+)$/) || photoUrl.match(/dep_(\d+)/);
  if (depMatch && depMatch[1]) {
    urls.push(`https://www.camara.leg.br/internet/deputado/bandep/${depMatch[1]}.jpg`);
  }

  // 5. Portal do Senado Federal (para senadores)
  const senMatch = tseId.match(/^sen_(\d+)$/) || photoUrl.match(/sen_(\d+)/);
  if (senMatch && senMatch[1]) {
    urls.push(`https://www.senado.leg.br/senadores/img/fotos-oficiais/${senMatch[1]}.jpg`);
  }

  // 6. Proxy Inteligente de Fotos do Backend (busca dinâmica na Wikipédia e Dados Abertos)
  const searchName = candidate.name?.trim() || candidate.tseId || '';
  if (searchName) {
    const qName = encodeURIComponent(searchName);
    const qUf = encodeURIComponent(candidate.state || 'BR');
    const qTseId = encodeURIComponent(tseId);
    urls.push(`${base}/api/candidates/photo-proxy?name=${qName}&state=${qUf}&tseId=${qTseId}`);
  }

  // 7. Fallback oficial DivulgaCandContas do TSE
  const isNumericTseId = /^\d+$/.test(tseId) || /^\d+$/.test(cleanPhotoKey);
  if (isNumericTseId) {
    const numId = /^\d+$/.test(tseId) ? tseId : cleanPhotoKey;
    urls.push(`https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1/candidatura/buscar/foto/2045202026/${numId}`);
  }

  // Remove duplicados e strings vazias preservando a ordem de prioridade
  return [...new Set(urls.filter(Boolean))];
}

/**
 * Resolve a melhor URL de foto disponível para um candidato:
 * 1. URL direta válida e acessível (HTTPS/HTTP)
 * 2. Mapeamento parlamentar oficial conhecido (Câmara, Senado, etc.)
 * 3. Foto isolada da Câmara dos Deputados (para IDs dep_{id})
 * 4. Foto isolada do Senado Federal (para IDs sen_{id})
 * 5. Foto oficial de urna/campanha no portal DivulgaCandContas do TSE
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



