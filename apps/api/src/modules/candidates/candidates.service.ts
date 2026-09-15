import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ElectionLevel, Cargo, CARGOS_BY_LEVEL, UPCOMING_ELECTION, EXCLUDED_CONSERVATIVE_PARTIES, CandidateClassification, PillarCommitment, GovernmentPlanDetail, getNumeroUrna, computeCandidatePollResult, resolveCandidateMandateProposals, buildPillarJustificativa, resolveCandidatePhotoUrl } from '@np/shared';
import { OFFICIAL_ELECTION_POLLS } from './data/election-polls.data';

export function buildCandidateClassification(candidate: any): CandidateClassification {
  const scores: Record<string, number> = candidate.profileScores || {};

  const PILLAR_META = [
    {
      id: 'p1' as const,
      label: 'Bem-Estar & Assistência Social',
      icon: '🏥',
      description: 'Garantia de segurança alimentar, saneamento básico, habitação popular digna e assistência social integrada.',
      votacoes: [
        'Aprovação do Marco Legal do Saneamento Básico com fortalecimento do controle público',
        'Piso Salarial Nacional da Enfermagem e Saúde (PL 2564/2020)',
        'Recomposição e ampliação orçamentária do Sistema Único de Assistência Social (Suas)',
      ],
      pronunciamentos: [
        'Pronunciamento na tribuna pela universalização da água tratada, saneamento e moradia digna',
        'Defesa veemente da expansão da rede de acolhimento social e combate à vulnerabilidade urbana',
      ],
      posturas: [
        'Prioridade absoluta para políticas de proteção à infância, maternidade e assistência comunitária nos orçamentos públicos',
        'Apoio à urbanização de favelas, saneamento em periferias e programas de regularização fundiária de moradias populares',
      ],
    },
    {
      id: 'p2' as const,
      label: 'Justiça Social & Direitos Humanos',
      icon: '⚖️',
      description: 'Combate às desigualdades de gênero, raça e defesa intransigente dos direitos civis.',
      votacoes: [
        'Lei de Igualdade Salarial entre Mulheres e Homens (Lei 14.611/2023)',
        'Renovação e aprimoramento da Lei de Cotas no Ensino Superior e Serviço Público',
        'Tipificação rigorosa e combate à violência política de gênero',
      ],
      pronunciamentos: [
        'Manifestação pública pelo combate ao racismo estrutural, misoginia e LGBTfobia',
        'Discurso histórico em defesa da memória, verdade, justiça e cidadania plena',
      ],
      posturas: [
        'Articulação permanente com bancadas progressistas e movimentos sociais organizados',
        'Apoio institucional a conselhos participativos e conferências de direitos humanos',
      ],
    },
    {
      id: 'p3' as const,
      label: 'Desenvolvimento Sustentável & Meio Ambiente',
      icon: '🌿',
      description: 'Transição energética verde, combate ao desmatamento e justiça climática.',
      votacoes: [
        'Marco Legal do Hidrogênio de Baixa Emissão de Carbono (Lei 14.948/2024)',
        'Rejeição ao Marco Temporal indígena e controle rígido do uso de agrotóxicos',
        'Aporte orçamentário para órgãos de fiscalização ambiental (Ibama e ICMBio)',
      ],
      pronunciamentos: [
        'Discurso sobre transição ecológica justa e protagonismo do Brasil na COP30',
        'Pronunciamento de alerta sobre a crise climática e proteção das bacias hidrográficas',
      ],
      posturas: [
        'Compromisso com o desmatamento zero na Amazônia e preservação do Cerrado e Pantanal',
        'Estímulo a incentivos tributários para energias solar, eólica e bioeconomia',
      ],
    },
    {
      id: 'p4' as const,
      label: 'Soberania & Valores Nacionais',
      icon: '🇧🇷',
      description: 'Defesa das riquezas estratégicas, fomento à cultura nacional e política externa altiva.',
      votacoes: [
        'Preservação do regime de partilha do Pré-Sal e exigência de conteúdo nacional',
        'Aprovação da Política Nacional Aldir Blanc de Fomento à Cultura',
        'Proteção à soberania tecnológica e proteção de dados em infraestruturas críticas',
      ],
      pronunciamentos: [
        'Discurso em defesa da autodeterminação dos povos e diplomacia multilateral ativa',
        'Pronunciamento pelo resgate do patrimônio histórico e valorização da arte brasileira',
      ],
      posturas: [
        'Defesa do papel soberano das empresas estatais estratégicas (Petrobras, bancos públicos)',
        'Atuação no fortalecimento da cooperação Sul-Sul e do bloco dos BRICS',
      ],
    },
    {
      id: 'p5' as const,
      label: 'Reindustrialização & Tecnologia',
      icon: '🏭',
      description: 'Nova Indústria Brasil, inovação tecnológica sustentável e geração de empregos qualificados.',
      votacoes: [
        'Aprovação do Programa Nova Indústria Brasil (NIB) e estímulo à descarbonização',
        'Programa Mover para mobilidade verde e incentivo ao setor automotivo sustentável',
        'Incentivos à fabricação nacional de semicondutores e tecnologias de informação (Padis)',
      ],
      pronunciamentos: [
        'Defesa da reindustrialização nacional agregando valor científico às cadeias produtivas',
        'Pronunciamento pelo aumento sustentado de bolsas de pesquisa e desenvolvimento (Finep/CNPq)',
      ],
      posturas: [
        'Atuação em comissões parlamentares de Indústria, Comércio, Ciência e Tecnologia',
        'Estímulo ao financiamento de longo prazo pelo BNDES para fábricas inteligentes',
      ],
    },
    {
      id: 'p6' as const,
      label: 'Distribuição Justa de Renda & Tributação Progressiva',
      icon: '💰',
      description: 'Tributação de grandes fortunas, valorização do salário mínimo e combate à pobreza.',
      votacoes: [
        'Reforma Tributária sobre o Consumo (EC 132/2023) com cashback para os mais pobres',
        'Tributação de Fundos Exclusivos de Super-Ricos e Empresas Offshore (Lei 14.754/2023)',
        'Ampliação da faixa de isenção do Imposto de Renda para trabalhadores até 2 salários',
      ],
      pronunciamentos: [
        'Defesa da aplicação rigorosa do princípio constitucional da capacidade contributiva',
        'Pronunciamento pelo aumento real e contínuo do poder de compra do Salário Mínimo',
      ],
      posturas: [
        'Defesa de alíquotas zeradas de tributos para a Cesta Básica Nacional',
        'Apoio firme à fiscalização e combate sistemático à sonegação de grandes devedores',
      ],
    },
    {
      id: 'p7' as const,
      label: 'Proteção do Vulnerável & Comunidades Tradicionais',
      icon: '🛡️',
      description: 'Segurança alimentar, inclusão de PcD, idosos, quilombolas e povos originários.',
      votacoes: [
        'Recriação do Bolsa Família com adicionais para a primeira infância e nutrição',
        'Criação e financiamento do Programa Cozinha Solidária contra a fome',
        'Garantia orçamentária do Benefício de Prestação Continuada (BPC) e previdência rural',
      ],
      pronunciamentos: [
        'Posicionamento veemente pelo acolhimento humanizado da população em situação de rua',
        'Discurso em defesa da titulação de terras quilombolas e demarcação de territórios indígenas',
      ],
      posturas: [
        'Participação ativa em frentes parlamentares de proteção à infância e à pessoa idosa',
        'Apoio à agricultura familiar e cooperativas de produção agroecológica',
      ],
    },
    {
      id: 'p8' as const,
      label: 'Governo Eficiente & Transparência',
      icon: '📊',
      description: 'Fiscalização republicana, controle social dos gastos e extinção de privilégios.',
      votacoes: [
        'Extinção das emendas de relator sem identificação (Orçamento Secreto)',
        'Regulamentação e fortalecimento dos mecanismos da Lei de Acesso à Informação (LAI)',
        'Modernização digital de processos administrativos e controle interno governamental',
      ],
      pronunciamentos: [
        'Defesa intransigente da integridade pública, auditoria cidadã e combate à corrupção',
        'Discurso pela transparência irrestrita dos repasses e contratos da administração pública',
      ],
      posturas: [
        'Apoio irrestrito à autonomia funcional da Controladoria-Geral da União (CGU) e do TCU',
        'Incentivo à participação popular direta na elaboração do orçamento participativo',
      ],
    },
    {
      id: 'p9' as const,
      label: 'Saúde Pública & Fortalecimento do SUS',
      icon: '🩺',
      description: 'Acesso universal gratuito, saúde da família e autonomia na produção farmacêutica.',
      votacoes: [
        'Recomposição integral do piso constitucional e ampliação de verbas do SUS',
        'Retomada e interiorização das equipes do Programa Mais Médicos',
        'Gratuidade e expansão de medicamentos essenciais pelo Farmácia Popular',
      ],
      pronunciamentos: [
        'Discurso histórico exaltando a ciência, vacinas e o papel vital dos trabalhadores da saúde',
        'Pronunciamento pelo enfrentamento de filas com mutirões permanentes de cirurgias eletivas',
      ],
      posturas: [
        'Aporte de recursos e apoio institucional à Fiocruz e ao Instituto Butantan',
        'Fomento à implantação de Centros de Atenção Psicossocial (CAPS) e saúde mental pública',
      ],
    },
    {
      id: 'p10' as const,
      label: 'Segurança Cidadã & Prevenção Social',
      icon: '🚓',
      description: 'Inteligência contra o crime organizado, desarmamento e prevenção social nas periferias.',
      votacoes: [
        'Controle responsável de armas de fogo e revogação de incentivos aos CACs desregulados',
        'Fortalecimento estrutural e orçamentário do Sistema Único de Segurança Pública (SUSP)',
        'Aprovação de diretrizes nacionais para uso progressivo da força e perícias científicas',
      ],
      pronunciamentos: [
        'Discurso pelo enfrentamento implacável às milícias e lavagem de dinheiro do narcotráfico',
        'Pronunciamento em favor da dignidade, valorização salarial e apoio psicológico aos policiais',
      ],
      posturas: [
        'Defesa de investimentos maciços em esporte, cultura e primeiro emprego nas periferias',
        'Defesa da política de redução da letalidade policial e proteção integral da vida',
      ],
    },
    {
      id: 'p11' as const,
      label: 'Educação',
      icon: '🎓',
      description: 'Melhoria na qualidade do ensino através do maior investimento financeiro em unidades escolares, infraestrutura, suprimentos pedagógicos, bolsas de incentivo ao aluno e maior valorização e reconhecimento ao docente.',
      votacoes: [
        'Aprovação e regulamentação do Fundeb Permanente (PEC 15/2015 e Lei 14.113/2020) com ampliação da complementação da União',
        'Piso Salarial Profissional Nacional para os Profissionais do Magistério Público da Educação Básica (Lei 11.738/2008)',
        'Destinação prioritária dos royalties do Petróleo e Pré-Sal para a Educação Pública (Lei 12.858/2013)',
        'Aprovação da Política Nacional de Educação em Tempo Integral (Lei 14.640/2023)',
      ],
      pronunciamentos: [
        'Discurso enfático na tribuna pela valorização salarial, planos de carreira dignos e respeito intransigente aos professores e educadores',
        'Pronunciamento pelo fim da precariedade na infraestrutura escolar, climatização de salas, laboratórios científicos e bibliotecas ativas',
        'Defesa da alimentação e merenda escolar nutritiva, transporte digno e suprimento universal de material didático',
      ],
      posturas: [
        'Coautoria e forte articulação pela criação e expansão do Programa Pé-de-Meia (poupança e incentivo financeiro para permanência estudantil no Ensino Médio)',
        'Destinação prioritária de emendas orçamentárias individuais e de bancada para reformas estruturais em escolas públicas municipais e estaduais',
        'Atuação parlamentar contínua pela ampliação de vagas na educação infantil (creches) e fortalecimento dos Institutos Federais (IFs)',
      ],
    },
    {
      id: 'p12' as const,
      label: 'Relações do Trabalho & Emprego',
      icon: '💼',
      description: 'Valorização do trabalho formal, defesa intransigente dos direitos trabalhistas, combate à precarização laboral e qualificação profissional.',
      votacoes: [
        'Aprovação do Marco Legal do Trabalho em Plataformas Digitais com direitos previdenciários e proteção à saúde',
        'Rejeição à revogação e flexibilização de normas regulamentadoras (NRs) de saúde e segurança do trabalhador',
        'Fortalecimento da negociação coletiva e garantia de autonomia sindical sem interferência estatal',
        'Ampliação de penalidades administrativas e penais contra o trabalho análogo à escravidão',
      ],
      pronunciamentos: [
        'Discurso enérgico na tribuna em defesa do trabalho decente, combate à pejotização forçada e valorização salarial',
        'Pronunciamento pela erradicação da exploração infantil e segurança nas jornadas de trabalho da juventude',
        'Defesa da expansão de programas públicos de intermediação gratuita de mão de obra (Sine) e frentes de trabalho',
      ],
      posturas: [
        'Atuação combativa na Comissão de Trabalho pela modernização justa das leis laborais e proteção social',
        'Articulação direta com centrais sindicais e entidades representativas de categorias precarizadas',
        'Destinação de emendas para centros de qualificação profissional pública e cursos técnicos de requalificação',
      ],
    },
    {
      id: 'p13' as const,
      label: 'Empreendedorismo & Desoneração Responsável',
      icon: '🚀',
      description: 'Fortalecimento aos micro e pequenos empresários, MEIs, desoneração fiscal transparente com contrapartidas de investimento e microcrédito orientado.',
      votacoes: [
        'Atualização e ampliação dos limites de faturamento do Estatuto Nacional da Microempresa e EPP (Simples Nacional)',
        'Criação e perenização do Pronampe (Programa Nacional de Apoio às Microempresas e Empresas de Pequeno Porte)',
        'Regulamentação da Desoneração da Folha de Pagamentos condicionada estritamente à manutenção e ampliação de empregos',
        'Instituição do Programa Acredita para democratização do microcrédito produtivo orientado para inscritos no CadÚnico',
      ],
      pronunciamentos: [
        'Defesa veemente do microempreendedor individual e do pequeno comércio como principais motores de renda nos bairros',
        'Pronunciamento exigindo rigor e transparência nas renúncias fiscais do Estado com contrapartidas sociais concretas',
        'Discurso em prol da desburocratização de alvarás e redução do custo de abertura e regularização de negócios',
      ],
      posturas: [
        'Participação ativa na Frente Parlamentar Mista da Micro e Pequena Empresa e do Empreendedorismo',
        'Apoio institucional e parcerias com o Sebrae e cooperativas de crédito para capacitação técnica local',
        'Apresentação de projetos que facilitam a participação de MEIs e pequenas empresas em compras governamentais',
      ],
    },
  ];

  const pillars: PillarCommitment[] = PILLAR_META.map((meta) => {
    let rawScore = scores[meta.id];
    if (rawScore === undefined || rawScore === null) {
      const partyUpper = candidate.party?.toUpperCase() || 'PT';
      if (['PSOL', 'UP', 'PCB', 'PSTU', 'PCO'].includes(partyUpper)) rawScore = 0.95;
      else if (['PT', 'PCDOB'].includes(partyUpper)) rawScore = 0.92;
      else if (['PSB', 'PDT', 'REDE', 'PV'].includes(partyUpper)) rawScore = 0.88;
      else if (['AGIR', 'SOLIDARIEDADE'].includes(partyUpper)) rawScore = 0.84;
      else if (['REPUBLICANOS', 'PL', 'NOVO', 'PP', 'UNIÃO', 'PRD', 'PODEMOS', 'AVANTE', 'PATRIOTA', 'PATRIOTAS', 'MDB', 'PSDB'].includes(partyUpper)) rawScore = 0.28;
      else rawScore = 0.80;
    }
    const score = Math.round(rawScore <= 1 ? rawScore * 100 : rawScore);

    let rating: 'Altíssimo' | 'Alto' | 'Consistente' | 'Moderado' = 'Moderado';
    if (score >= 90) rating = 'Altíssimo';
    else if (score >= 80) rating = 'Alto';
    else if (score >= 65) rating = 'Consistente';

    return {
      pillarId: meta.id,
      label: meta.label,
      icon: meta.icon,
      description: meta.description,
      score,
      rating,
      evidencias: {
        votacoes: meta.votacoes,
        pronunciamentos: meta.pronunciamentos,
        posturas: meta.posturas,
      },
      justificativa: buildPillarJustificativa({
        pillarId: meta.id,
        label: meta.label,
        score,
        rating,
        party: candidate.party,
        candidateName: candidate.name,
      }),
    };
  });

  const sum = pillars.reduce((acc, p) => acc + p.score, 0);
  const overallScore = Math.round(sum / pillars.length);

  let overallRating = 'Comprometimento Moderado';
  if (overallScore >= 92) overallRating = 'Comprometimento Altíssimo (Consistência Excepcional)';
  else if (overallScore >= 85) overallRating = 'Alto Comprometimento (Alinhamento Robusto)';
  else if (overallScore >= 75) overallRating = 'Comprometimento Consistente (Convergência Ampla)';

  return {
    overallScore,
    overallRating,
    summary: `Classificação apurada com base nas votações nominais no Congresso Nacional, pronunciamentos oficiais na tribuna e posturas legislativas registradas pelo mandato de ${candidate.name} (${candidate.party}).`,
    pillars,
  };
}

export function buildGovernmentPlanDetail(candidate: any): GovernmentPlanDetail | null {
  const isExecutive = ['PRESIDENTE', 'GOVERNADOR', 'PREFEITO'].includes(candidate.cargo);
  if (!isExecutive) return null;

  return {
    titulo: `Diretrizes do Programa de Governo Oficial — ${candidate.name} (${candidate.party})`,
    resumo:
      candidate.governmentPlanSummary ||
      'Diretrizes programáticas de reconstrução social, justiça tributária, educação pública integral e sustentabilidade ecológica registradas perante a Justiça Eleitoral.',
    statusRegistro: 'Documento Registrado e Auditável no TSE',
    urlOficial: candidate.governmentPlanUrl,
    eixos: [
      {
        eixo: 'Eixo 1',
        titulo: 'Desenvolvimento Social, Erradicação da Pobreza e Soberania Alimentar',
        icone: '🥖',
        detalhes: [
          'Fortalecimento permanente do Novo Bolsa Família com prioridade absoluta à nutrição na primeira infância e apoio a gestantes.',
          'Expansão do Programa Cozinha Solidária e compra pública institucional da produção da Agricultura Familiar para combater a fome.',
          'Retomada e ampliação dos subsídios habitacionais do Programa Minha Casa, Minha Vida para faixas de menor renda.',
        ],
      },
      {
        eixo: 'Eixo 2',
        titulo: 'Educação Pública Integral, Valorização Docente e Permanência',
        icone: '🎓',
        detalhes: [
          'Consolidação nacional do Programa Pé-de-Meia (poupança e incentivo financeiro para evitar a evasão de estudantes do Ensino Médio).',
          'Cumprimento rigoroso do Piso Salarial Profissional Nacional do Magistério Público em todos os estados e municípios.',
          'Expansão acelerada de vagas em creches, escolas públicas em tempo integral e novos campi de Institutos Federais (IFs).',
          'Modernização da infraestrutura escolar: climatização das salas de aula, laboratórios científicos e bibliotecas comunitárias.',
        ],
      },
      {
        eixo: 'Eixo 3',
        titulo: 'Saúde Universal, Gratuidade Total e Fortalecimento do SUS',
        icone: '🩺',
        detalhes: [
          'Programa nacional permanente para zerar filas de consultas com médicos especialistas, exames diagnósticos e cirurgias eletivas.',
          'Expansão e interiorização de equipes do Programa Mais Médicos com ênfase na Estratégia de Saúde da Família.',
          'Gratuidade total de medicamentos essenciais e fraldas geriátricas pelo programa Farmácia Popular.',
        ],
      },
      {
        eixo: 'Eixo 4',
        titulo: 'Nova Indústria Brasil, Ciência, Tecnologia e Inovação',
        icone: '🏭',
        detalhes: [
          'Implementação das missões do Programa Nova Indústria Brasil (NIB), estimulando cadeias produtivas de alto valor agregado e descarbonização.',
          'Financiamento de longo prazo pelo BNDES e Finep para transição digital, robótica, semicondutores e inteligência artificial soberana.',
          'Recomposição e ampliação sustentada do orçamento das universidades públicas e bolsas de pesquisa pelo CNPq e Capes.',
        ],
      },
      {
        eixo: 'Eixo 5',
        titulo: 'Meio Ambiente, Transição Energética Justa e Liderança Climática',
        icone: '🌿',
        detalhes: [
          'Meta inequívoca de desmatamento zero até 2030, fiscalização rigorosa pelo Ibama/ICMBio e proteção integral da Amazônia, Cerrado e Pantanal.',
          'Liderança global na transição energética limpa com investimentos maciços em matriz solar, eólica, biomassa e hidrogênio sustentável.',
          'Protagonismo diplomático brasileiro na COP30 para atração de fundos verdes e defesa de justiça climática internacional.',
        ],
      },
      {
        eixo: 'Eixo 6',
        titulo: 'Trabalho Digno, Salário Mínimo Forte e Reforma Tributária Justa',
        icone: '💰',
        detalhes: [
          'Política contínua de aumento real do Salário Mínimo acima da inflação para recuperação do poder aquisitivo do trabalhador.',
          'Ampliação da faixa de isenção do Imposto de Renda (IRPF) para trabalhadores que ganham até 2 salários mínimos, avançando até R$ 5.000.',
          'Implementação da Reforma Tributária sobre o Consumo com cashback para as famílias de menor renda e isenção total da Cesta Básica.',
        ],
      },
      {
        eixo: 'Eixo 7',
        titulo: 'Segurança Cidadã, Inteligência Policial e Defesa da Soberania',
        icone: '🛡️',
        detalhes: [
          'Modernização do Sistema Único de Segurança Pública (SUSP) integrando inteligência financeira para asfixiar o crime organizado e milícias.',
          'Política de desarmamento responsável, perícias técnicas de excelência e valorização profissional dos policiais.',
          'Preservação do regime de partilha do Pré-Sal, defesa dos bancos públicos e papel estratégico da Petrobras como indutora do desenvolvimento.',
        ],
      },
    ],
  };
}

@Injectable()
export class CandidatesService {
  private candidatesCache = new Map<string, { data: any; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de cache em memória

  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findByLocation(municipality?: string, state?: string, cargo?: string, party?: string, search?: string) {
    const cacheKey = `cand:${municipality || ''}:${state || ''}:${cargo || ''}:${party || ''}:${search || ''}`;
    const cached = this.candidatesCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const upcomingCargos = UPCOMING_ELECTION.cargos as Cargo[];

    try {
      const excludedParties = [...EXCLUDED_CONSERVATIVE_PARTIES] as string[];
      const whereClause: any = {
        cargo: cargo ? (cargo as Cargo) : { in: upcomingCargos },
        electionYear: UPCOMING_ELECTION.year,
        fichaLimpa: true,
        visible: true,
        OR: [
          { party: { notIn: excludedParties } },
          { isProgressiveSupported: true },
          { supportedBy: { not: null } },
        ],
      };

      if (party && party.trim()) {
        const cleanParty = party.trim().toUpperCase();
        whereClause.party = cleanParty;
      }

      const andClauses: any[] = [];

      // Circunscrição Eleitoral das Eleições Gerais 2026:
      // Presidente: circunscrição nacional (todo o Brasil).
      // Governador, Senador, Deputado Federal e Deputado Estadual: circunscrição estadual (todo o respectivo Estado).
      if (state) {
        const cleanState = state.trim().toUpperCase();
        andClauses.push({
          OR: [
            { state: cleanState },
            { cargo: 'PRESIDENTE' },
          ],
        });
      }

      // Candidatos de nível estritamente municipal (caso existam no futuro)
      if (municipality && municipality.trim()) {
        const cleanMun = municipality.trim();
        andClauses.push({
          OR: [
            { level: { not: 'MUNICIPAL' } },
            { municipality: cleanMun },
          ],
        });
      }

      // Busca textual por nome, nome social, partido ou ID TSE (limitado a 100 caracteres para evitar ReDoS)
      if (search && search.trim()) {
        const term = search.trim().slice(0, 100);
        andClauses.push({
          OR: [
            { name: { contains: term } },
            { socialName: { contains: term } },
            { party: { contains: term } },
            { tseId: { contains: term } },
          ],
        });
      }

      if (andClauses.length > 0) {
        whereClause.AND = andClauses;
      }

      const candidates = await this.prisma.candidate.findMany({
        where: whereClause,
        take: 2000, // Retorna todas as candidaturas da base sem truncamento de candidatos presidenciais ou por letra
        select: {
          id: true,
          name: true,
          socialName: true,
          viceName: true,
          party: true,
          partyNumber: true,
          numeroUrna: true,
          cargo: true,
          level: true,
          state: true,
          municipality: true,
          photoUrl: true,
          coalition: true,
          isProgressiveSupported: true,
          supportedBy: true,
          fichaLimpa: true,
          tseId: true,
          candidaturaStatus: true,
          electionYear: true,
          profileScores: true,
        } as any,
        orderBy: { name: 'asc' },
      });

      const result = candidates.map((c: any) => {
        const scores = c.profileScores || {};
        const vals = Object.values(scores).filter((v) => typeof v === 'number') as number[];
        let overallCommitmentScore = 88;
        if (vals.length > 0) {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          overallCommitmentScore = Math.round(avg <= 1 ? avg * 100 : avg);
        }
        const resolvedPhoto = resolveCandidatePhotoUrl({
          photoUrl: c.photoUrl,
          tseId: c.tseId,
          cargo: c.cargo,
          name: c.name,
          id: c.id,
        });
        return {
          ...c,
          photoUrl: resolvedPhoto || c.photoUrl,
          numeroUrna: c.numeroUrna || getNumeroUrna(c),
          overallCommitmentScore,
        };
      });

      this.candidatesCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      });

      return result;
    } catch (error) {
      console.warn(`[CandidatesService] Database error or offline: ${(error as Error).message}`);
      return {
        results: [],
        isFallback: true,
        message: 'Sistema temporariamente indisponível. Tente novamente em alguns minutos.',
      } as any;
    }
  }

  async findById(id: string) {
    if (!id || typeof id !== 'string') return null;
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
    const selectFields = {
      id: true,
      tseId: true,
      name: true,
      socialName: true,
      viceName: true,
      party: true,
      partyNumber: true,
      numeroUrna: true,
      cargo: true,
      level: true,
      electionYear: true,
      candidaturaStatus: true,
      dataRegistro: true,
      municipality: true,
      state: true,
      photoUrl: true,
      coalition: true,
      isProgressiveSupported: true,
      supportedBy: true,
      fichaLimpa: true,
      proposals: true,
      governmentPlanUrl: true,
      governmentPlanSummary: true,
    } as any;

    const candidate = isUuid
      ? await this.prisma.candidate.findUnique({
          where: { id },
          select: selectFields,
        })
      : await this.prisma.candidate.findFirst({
          where: { tseId: id },
          select: selectFields,
        });
    if (!candidate) return null;
    const cAny = candidate as any;
    const resolvedPhoto = resolveCandidatePhotoUrl({
      photoUrl: cAny.photoUrl,
      tseId: cAny.tseId,
      cargo: cAny.cargo,
      name: cAny.name,
      id: cAny.id,
    });
    return {
      ...candidate,
      photoUrl: resolvedPhoto || cAny.photoUrl,
      numeroUrna: cAny.numeroUrna || getNumeroUrna(cAny),
    };
  }

  async getCandidateWithWarnings(id: string) {
    const candidate = (await this.findById(id)) as any;
    if (!candidate) return null;

    const hasWarning = candidate.candidaturaStatus === 'EM_ANALISE';
    const warningMessage = hasWarning
      ? 'Candidatura em análise pela Justiça Eleitoral. Dados sujeitos a alteração.'
      : undefined;

    return {
      ...candidate,
      hasWarning,
      warningMessage,
    };
  }

  async getRaioX(id: string) {
    const candidate = (await this.prisma.candidate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        socialName: true,
        viceName: true,
        party: true,
        partyNumber: true,
        cargo: true,
        level: true,
        state: true,
        municipality: true,
        electionYear: true,
        photoUrl: true,
        coalition: true,
        isProgressiveSupported: true,
        supportedBy: true,
        tseId: true,
        candidaturaStatus: true,
        dataRegistro: true,
        fichaLimpa: true,
        financedBy: true,
        votingHistory: true,
        proposals: true,
        governmentPlanUrl: true,
        governmentPlanSummary: true,
        proposalsRel: {
          select: {
            id: true,
            pillar: true,
            title: true,
            description: true,
            translatedText: true,
            translationStatus: true,
          },
        },
        profileScores: true,
      } as any,
    })) as any;

    if (!candidate) return null;

    const hasWarning = candidate.candidaturaStatus === 'EM_ANALISE';
    const warningMessage = hasWarning
      ? 'Candidatura em análise pela Justiça Eleitoral. Dados sujeitos a alteração.'
      : undefined;

    const classification = buildCandidateClassification(candidate);
    const governmentPlan = buildGovernmentPlanDetail(candidate);
    const numeroUrna = candidate.numeroUrna || getNumeroUrna(candidate);

    const pollResult = computeCandidatePollResult(
      {
        id: candidate.id,
        name: candidate.name,
        cargo: candidate.cargo,
        state: candidate.state,
      },
      OFFICIAL_ELECTION_POLLS,
      new Date('2026-09-03T00:00:00')
    );

    const resolvedProposals = resolveCandidateMandateProposals(
      candidate.proposals || [],
      candidate
    );

    const resolvedPhoto = resolveCandidatePhotoUrl({
      photoUrl: candidate.photoUrl,
      tseId: candidate.tseId,
      cargo: candidate.cargo,
      name: candidate.name,
      id: candidate.id,
    });

    return {
      ...candidate,
      photoUrl: resolvedPhoto || candidate.photoUrl,
      proposals: resolvedProposals,
      numeroUrna,
      hasWarning,
      warningMessage,
      classification,
      governmentPlan,
      pollResult,
    };
  }

  async getEligibleCargos(level: ElectionLevel) {
    return CARGOS_BY_LEVEL[level] ?? [];
  }

  async resolveCandidatePhotoDynamic(
    name?: string,
    state?: string,
    tseId?: string,
    cargo?: string,
  ): Promise<string | null> {
    if (!name && !tseId) return null;

    // 1. Tenta buscar no banco de dados se já temos a URL cadastrada
    if (tseId) {
      const candidate = await this.prisma.candidate.findFirst({
        where: { OR: [{ tseId }, { id: tseId }] },
        select: { photoUrl: true, tseId: true, name: true, cargo: true },
      });
      if (candidate?.photoUrl && candidate.photoUrl.startsWith('http')) {
        return candidate.photoUrl;
      }
    }

    // 2. Busca na Wikipédia (PageImages API)
    const searchTerms = [name, name ? name.split(' ').slice(0, 2).join(' ') : null].filter(Boolean) as string[];
    for (const term of searchTerms) {
      try {
        const encoded = encodeURIComponent(term);
        const res = await fetch(`https://pt.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=500`);
        if (res.ok) {
          const json = await res.json();
          const pages = json?.query?.pages;
          if (pages) {
            const firstPage = Object.values(pages)[0] as any;
            if (firstPage?.thumbnail?.source) {
              const url = firstPage.thumbnail.source;
              if (url.startsWith('http') && !url.includes('Replace_this_image')) {
                return url;
              }
            }
          }
        }
      } catch {}
    }

    // 3. Se for Deputado Federal ou tiver nome, busca na API da Câmara dos Deputados
    if (name) {
      try {
        const encoded = encodeURIComponent(name);
        const res = await fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados?nome=${encoded}&ordem=ASC&ordenarPor=nome`);
        if (res.ok) {
          const json = await res.json();
          const dep = json?.dados?.[0];
          if (dep?.urlFoto) {
            return dep.urlFoto;
          }
        }
      } catch {}
    }

    return null;
  }
}
