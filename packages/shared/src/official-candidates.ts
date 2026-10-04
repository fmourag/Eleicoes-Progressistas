import { Cargo, ElectionLevel, CandidaturaStatus } from './index';

export interface OfficialCandidateItem {
  id: string;
  tseId: string;
  electionYear: number;
  name: string;
  socialName?: string;
  viceName?: string;
  party: string;
  partyNumber: number;
  numeroUrna: string;
  cargo: Cargo;
  level: ElectionLevel;
  candidaturaStatus: CandidaturaStatus;
  municipality: string;
  state: string;
  cpfHash: string;
  fichaLimpa: boolean;
  photoUrl: string;
  coalition?: string;
  isProgressiveSupported?: boolean;
  supportedBy?: string;
  governmentPlanUrl?: string;
  governmentPlanSummary?: string;
  profileScores?: Record<string, number>;
  proposals?: Array<{ pillar: string; title: string; description: string }>;
  visible?: boolean;
}

export const OFFICIAL_PROGRESSIVE_PRESIDENTS: OfficialCandidateItem[] = [
  {
    id: 'pres_lula',
    tseId: 'pres_lula',
    electionYear: 2026,
    name: 'Luiz Inácio Lula da Silva',
    socialName: 'Lula',
    viceName: 'Geraldo José Rodrigues Alckmin Filho',
    party: 'PT',
    partyNumber: 13,
    numeroUrna: '13',
    cargo: 'PRESIDENTE',
    level: 'FEDERAL',
    candidaturaStatus: 'DEFERIDO',
    municipality: 'São Paulo',
    state: 'SP',
    cpfHash: 'hash_tse_lula_2026',
    fichaLimpa: true,
    photoUrl: '/candidates/pres_lula.jpg',
    coalition: 'Brasil da Esperança (PT, PCdoB, PV, PSB, PSOL, Rede, Solidariedade, Avante, PDT)',
    isProgressiveSupported: true,
    supportedBy: 'Frente Ampla Democrática e Progressista',
    governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
    governmentPlanSummary: 'Diretrizes do Plano de Governo: Reconstrução social, reindustrialização verde, fortalecimento do SUS, Pé-de-Meia e transição ecológica justa.',
    profileScores: { p1: 0.96, p2: 0.95, p3: 0.90, p4: 0.85, p5: 0.85, p6: 0.98, p7: 0.95, p8: 0.88, p9: 0.96, p10: 0.88, p11: 0.96, p12: 0.98, p13: 0.92 },
    proposals: [
      { pillar: 'p6', title: 'Erradicação da Fome e Redução das Desigualdades', description: 'Garantia de segurança alimentar e combate à pobreza extrema.' },
      { pillar: 'p11', title: 'Educação em Tempo Integral e Poupança Estudantil', description: 'Expansão nacional do programa Pé-de-Meia para erradicar a evasão escolar.' },
      { pillar: 'p3', title: 'Transição Energética Justa e Preservação Florestal', description: 'Meta de desmatamento zero e bioeconomia sustentável.' },
    ],
    visible: true,
  },
  {
    id: '280002538811',
    tseId: '280002538811',
    electionYear: 2026,
    name: 'Samara Martins da Silva Feitosa',
    socialName: 'Samara Martins',
    viceName: 'Raquel Brício',
    party: 'UP',
    partyNumber: 80,
    numeroUrna: '80',
    cargo: 'PRESIDENTE',
    level: 'FEDERAL',
    candidaturaStatus: 'DEFERIDO',
    municipality: 'Brasil',
    state: 'BR',
    cpfHash: 'hash_tse_280002538811_2026',
    fichaLimpa: true,
    photoUrl: '',
    coalition: 'Unidade Popular pelo Socialismo (UP)',
    isProgressiveSupported: true,
    supportedBy: 'Movimento de Luta nos Bairros, Vilas e Favelas (MLB)',
    governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
    governmentPlanSummary: 'Diretrizes do Plano de Governo: Poder popular, reforma agrária e urbana imediatas, suspensão do pagamento da dívida pública aos banqueiros e garantia de moradia e alimentação para todo o povo.',
    profileScores: { p1: 0.98, p2: 0.99, p3: 0.94, p4: 0.98, p5: 0.90, p6: 0.99, p7: 0.99, p8: 0.92, p9: 0.98, p10: 0.90, p11: 0.98, p12: 0.99, p13: 0.82 },
    proposals: [
      { pillar: 'p1', title: 'Reforma Urbana Radical e Moradia Digna para Todos', description: 'Desapropriação de imóveis abandonados para zerar o déficit habitacional no Brasil.' },
      { pillar: 'p6', title: 'Fim da Fome e Desapropriação do Latifúndio', description: 'Reforma agrária popular e subsídio direto à produção de alimentos saudáveis pela agricultura familiar.' },
      { pillar: 'p2', title: 'Emprego Pleno com Estatização do Sistema Financeiro', description: 'Crédito produtivo a juros zero para trabalhadores e investimentos massivos em obras sociais.' },
    ],
    visible: true,
  },
  {
    id: '280002551975',
    tseId: '280002551975',
    electionYear: 2026,
    name: 'Edmilson Silva Costa',
    socialName: 'Edmilson Costa',
    viceName: 'Cleusa Santos',
    party: 'PCB',
    partyNumber: 21,
    numeroUrna: '21',
    cargo: 'PRESIDENTE',
    level: 'FEDERAL',
    candidaturaStatus: 'DEFERIDO',
    municipality: 'Brasil',
    state: 'BR',
    cpfHash: 'hash_tse_280002551975_2026',
    fichaLimpa: true,
    photoUrl: '',
    coalition: 'Poder Popular (PCB)',
    isProgressiveSupported: true,
    supportedBy: 'Partido Comunista Brasileiro',
    governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
    governmentPlanSummary: 'Diretrizes do Plano de Governo: Economista e professora, defesa da jornada de 30 horas semanais, revogação de todas as contrarreformas trabalhistas e previdenciárias e planejamento socialista da economia.',
    profileScores: { p1: 0.98, p2: 0.99, p3: 0.92, p4: 0.98, p5: 0.90, p6: 0.99, p7: 0.99, p8: 0.90, p9: 0.99, p10: 0.90, p11: 0.99, p12: 0.99, p13: 0.80 },
    proposals: [
      { pillar: 'p2', title: 'Redução da Jornada para 30h Semanais sem Redução Salarial', description: 'Criação imediata de postos de trabalho dignos e combate à precarização.' },
      { pillar: 'p9', title: 'Estatização Total da Saúde e Fim dos Planos Privados', description: 'SUS 100% estatal, com investimento de 10% do PIB e produção nacional de medicamentos.' },
      { pillar: 'p11', title: 'Educação Pública, Gratuita, Laica e Socialmente Referenciada', description: 'Fim dos subsídios e renúncias fiscais para o ensino privado e expansão das universidades federais.' },
    ],
    visible: true,
  },
  {
    id: '280002541457',
    tseId: '280002541457',
    electionYear: 2026,
    name: 'Hertz da Conceição Dias',
    socialName: 'Hertz Dias',
    viceName: 'Vanessa Portugal',
    party: 'PSTU',
    partyNumber: 16,
    numeroUrna: '16',
    cargo: 'PRESIDENTE',
    level: 'FEDERAL',
    candidaturaStatus: 'DEFERIDO',
    municipality: 'Brasil',
    state: 'BR',
    cpfHash: 'hash_tse_280002541457_2026',
    fichaLimpa: true,
    photoUrl: '',
    coalition: 'Polo Socialista e Revolucionário (PSTU)',
    isProgressiveSupported: true,
    supportedBy: 'Partido Socialista dos Trabalhadores Unificado',
    governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
    governmentPlanSummary: 'Diretrizes do Plano de Governo: Operária sapateira e socióloga, defesa de um governo socialista dos trabalhadores, estatização sob controle operário e expropriação dos bilionários.',
    profileScores: { p1: 0.97, p2: 0.99, p3: 0.90, p4: 0.98, p5: 0.88, p6: 0.99, p7: 0.99, p8: 0.90, p9: 0.98, p10: 0.90, p11: 0.98, p12: 0.99, p13: 0.80 },
    proposals: [
      { pillar: 'p2', title: 'Estatização das 100 Maiores Empresas do País', description: 'Controle operário das empresas estratégicas para garantir pleno emprego e salário digno.' },
      { pillar: 'p6', title: 'Expropriação do Agronegócio e Soberania Alimentar', description: 'Reforma agrária radical sob controle dos trabalhadores do campo.' },
      { pillar: 'p4', title: 'Ruptura com o FMI e Não Pagamento da Dívida aos Banqueiros', description: 'Destinação de 100% do orçamento federal para saúde, habitação e saneamento.' },
    ],
    visible: true,
  },
  {
    id: 'pres_ruicosta',
    tseId: 'pres_ruicosta',
    electionYear: 2026,
    name: 'Rui Costa Pimenta',
    socialName: 'Rui Costa Pimenta',
    viceName: 'Antônio Carlos',
    party: 'PCO',
    partyNumber: 29,
    numeroUrna: '29',
    cargo: 'PRESIDENTE',
    level: 'FEDERAL',
    candidaturaStatus: 'DEFERIDO',
    municipality: 'São Paulo',
    state: 'SP',
    cpfHash: 'hash_tse_ruicosta_2026',
    fichaLimpa: true,
    photoUrl: '/candidates/pres_ruicosta.jpg',
    coalition: 'Partido da Causa Operária (PCO)',
    isProgressiveSupported: true,
    supportedBy: 'Causa Operária',
    governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
    governmentPlanSummary: 'Diretrizes do Plano de Governo: Defesa incondicional dos direitos trabalhistas, dissolução do aparato de repressão e defesa da soberania popular contra o imperialismo.',
    profileScores: { p1: 0.96, p2: 0.98, p3: 0.88, p4: 0.98, p5: 0.86, p6: 0.98, p7: 0.95, p8: 0.88, p9: 0.96, p10: 0.88, p11: 0.96, p12: 0.96, p13: 0.80 },
    proposals: [
      { pillar: 'p2', title: 'Salário Mínimo Vital e Reajuste Automático pela Inflação', description: 'Salário mínimo baseado nos cálculos reais do DIEESE com reposição mensal.' },
      { pillar: 'p4', title: 'Defesa da Soberania Nacional e Expulsão do Capital Especulativo', description: 'Controle de capitais e estatização do comércio exterior.' },
      { pillar: 'p8', title: 'Liberdade Irrestrita de Expressão e Organização Popular', description: 'Garantia plena de manifestação e organização sindical e partidária.' },
    ],
    visible: true,
  },
  ];
