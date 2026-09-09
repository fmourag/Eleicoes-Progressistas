import { PILLAR_DISPLAY_LIST } from './quiz-core';

export interface MandateProposalDetail {
  pillar: string;
  pillarInfo: { label: string; icon: string };
  title: string;
  description: string;
  // Função e Atribuição do Mandato
  mandatoScope: string;
  competenciaMandato: string;
  // Diagnóstico e Diretriz
  diagnostico: string;
  diretrizes: string;
  // Metas e Ações Práticas
  metasAcoes: string[];
  // Público e Abrangência
  beneficiarios: string;
  abrangencia: string;
  // Impacto e Resultados Esperados
  impacto: string;
  indicadoresSucesso?: string;
  // Viabilidade e Articulação
  viabilidadeOrcamentaria: string;
  // Tradução Cidadã
  translatedText: string;
}

const PILLAR_LOOKUP_MAP: Record<string, { label: string; icon: string }> = PILLAR_DISPLAY_LIST.reduce(
  (acc, p) => {
    acc[p.id.toLowerCase()] = { label: p.label, icon: p.icon };
    return acc;
  },
  {} as Record<string, { label: string; icon: string }>
);

function formatCargoLabel(cargo?: string): string {
  if (!cargo) return 'Mandato Público';
  switch (cargo.toUpperCase()) {
    case 'GOVERNADOR':
      return 'Governador(a) de Estado';
    case 'SENADOR':
      return 'Senador(a) da República';
    case 'DEPUTADO_FEDERAL':
      return 'Deputado(a) Federal';
    case 'DEPUTADO_ESTADUAL':
      return 'Deputado(a) Estadual';
    case 'PRESIDENTE':
      return 'Presidente da República';
    case 'PREFEITO':
      return 'Prefeito(a) Municipal';
    case 'VEREADOR':
      return 'Vereador(a) Municipal';
    default:
      return cargo.replace(/_/g, ' ');
  }
}

function getMandateScope(candidate: any): { scope: string; competencia: string } {
  const cargo = (candidate?.cargo || '').toUpperCase();
  const state = candidate?.state || 'RJ';
  const cargoLabel = formatCargoLabel(cargo);

  if (cargo === 'GOVERNADOR') {
    return {
      scope: `Executivo Estadual • ${cargoLabel} (${state})`,
      competencia: `Competência constitucional para gestão administrativa e orçamentária do Estado de ${state}, chefia das forças de segurança estaduais, coordenação da rede estadual de ensino e hospitais de alta/média complexidade.`,
    };
  }
  if (cargo === 'PRESIDENTE') {
    return {
      scope: `Executivo Federal • ${cargoLabel} do Brasil`,
      competencia: `Competência constitucional de chefia de Estado e de Governo, execução orçamentária da União, liderança de políticas nacionais, programas sociais e política externa soberana.`,
    };
  }
  if (cargo === 'SENADOR') {
    return {
      scope: `Legislativo Federal • ${cargoLabel} — Bancada de ${state}`,
      competencia: `Representação paritária do Estado de ${state} no Congresso Nacional, aprovação de autoridades, julgamento de crimes de responsabilidade e proposição de Leis e Emendas Constitucionais estruturantes.`,
    };
  }
  if (cargo === 'DEPUTADO_FEDERAL') {
    return {
      scope: `Legislativo Federal • ${cargoLabel} — Representante do Povo por ${state}`,
      competencia: `Votação do Orçamento Geral da União (LOA/PPA), destinação de Emendas Parlamentares para os municípios de ${state}, proposição legislativa e fiscalização rigorosa dos atos do Executivo Federal.`,
    };
  }
  if (cargo === 'DEPUTADO_ESTADUAL') {
    return {
      scope: `Legislativo Estadual • ${cargoLabel} — Assembleia Legislativa (${state})`,
      competencia: `Votação do orçamento estadual, criação de leis estaduais, destinação de emendas impositivas regionais e fiscalização direta das secretarias e órgãos do governo estadual.`,
    };
  }
  if (cargo === 'PREFEITO') {
    return {
      scope: `Executivo Municipal • ${cargoLabel} de ${candidate?.municipality || 'Município'}`,
      competencia: `Gestão direta dos serviços públicos municipais: atenção básica de saúde (postos e UPAs), educação infantil e fundamental, transporte coletivo municipal e zeladoria urbana.`,
    };
  }

  return {
    scope: `Mandato Representativo • ${cargoLabel}`,
    competencia: 'Atuação programática e republicana na defesa dos interesses coletivos e da ordem constitucional.',
  };
}

export function resolveMandateProposalDetails(rawProposal: any, candidateInfo: any): MandateProposalDetail {
  const p = rawProposal || {};
  let pillarKey = (p.pillar || 'p1').toLowerCase();

  const titleLower = (p.title || p.name || '').toLowerCase();
  if (titleLower.includes('empreendedor') || titleLower.includes('mei') || titleLower.includes('desonera') || titleLower.includes('simples nacional') || titleLower.includes('microcrédito')) {
    pillarKey = 'p13';
  } else if (titleLower.includes('trabalho') || titleLower.includes('emprego') || titleLower.includes('clt') || titleLower.includes('trabalhador') || titleLower.includes('sindic')) {
    pillarKey = 'p12';
  } else if (titleLower.includes('educa') || titleLower.includes('escola') || titleLower.includes('estudant')) {
    pillarKey = 'p11';
  } else if (titleLower.includes('saúde') || titleLower.includes('hospital') || titleLower.includes('policlínica')) {
    pillarKey = 'p9';
  } else if (titleLower.includes('segurança') || titleLower.includes('polícia') || titleLower.includes('milícia')) {
    pillarKey = 'p10';
  } else if (titleLower.includes('transporte') || titleLower.includes('mobilidade') || titleLower.includes('indústria') || titleLower.includes('tecnologia')) {
    pillarKey = 'p5';
  } else if (titleLower.includes('saneamento') || titleLower.includes('ambiente') || titleLower.includes('baía') || titleLower.includes('clima')) {
    pillarKey = 'p3';
  } else if (titleLower.includes('habita') || titleLower.includes('moradia') || titleLower.includes('comunidade') || titleLower.includes('fome')) {
    pillarKey = 'p1';
  } else if (titleLower.includes('renda') || titleLower.includes('salário') || titleLower.includes('tribut')) {
    pillarKey = 'p6';
  }

  const pillarInfo = PILLAR_LOOKUP_MAP[pillarKey] || {
    label: (p.pillar || 'Geral').toUpperCase(),
    icon: '📌',
  };

  const title = p.title || p.name || p.text || `Proposta Estratégica sobre ${pillarInfo.label}`;
  const baseDesc = p.description || p.text || p.details || 'Esta proposta compõe o programa prioritário de mandato do candidato registrado na Justiça Eleitoral.';
  const state = candidateInfo?.state || 'RJ';
  const candName = candidateInfo?.name || candidateInfo?.socialName || 'O(A) candidato(a)';
  const cargo = (candidateInfo?.cargo || '').toUpperCase();
  const { scope, competencia } = getMandateScope(candidateInfo);

  // Se já possui campos detalhados customizados no objeto de proposta
  if (p.metasAcoes && Array.isArray(p.metasAcoes) && p.metasAcoes.length > 0 && p.diagnostico) {
    return {
      pillar: pillarKey,
      pillarInfo: p.pillarInfo || pillarInfo,
      title,
      description: baseDesc,
      mandatoScope: p.mandatoScope || scope,
      competenciaMandato: p.competenciaMandato || competencia,
      diagnostico: p.diagnostico,
      diretrizes: p.diretrizes || baseDesc,
      metasAcoes: p.metasAcoes,
      beneficiarios: p.beneficiarios || 'População em geral e comunidades atendidas.',
      abrangencia: p.abrangencia || `Âmbito de atuação do mandato em ${state}.`,
      impacto: p.impacto || 'Melhoria na prestação dos serviços públicos e cidadania.',
      indicadoresSucesso: p.indicadoresSucesso,
      viabilidadeOrcamentaria: p.viabilidadeOrcamentaria || 'Dotação orçamentária própria do mandato.',
      translatedText: p.translatedText || baseDesc,
    };
  }

  // 1. EDUCAÇÃO (P11)
  if (pillarKey === 'p11' || titleLower.includes('educa') || titleLower.includes('escola')) {
    if (cargo === 'GOVERNADOR') {
      return {
        pillar: 'p11',
        pillarInfo: { label: 'Educação', icon: '🎓' },
        title,
        description: baseDesc,
        mandatoScope: scope,
        competenciaMandato: competencia,
        diagnostico: `A rede pública estadual de ${state} possui unidades com carência de manutenção predial, ausência de climatização adequada e desigualdade no acesso a tecnologias digitais, impactando a frequência e o rendimento escolar dos estudantes no Ensino Médio.`,
        diretrizes: `Garantir padrão integrado de dignidade predial, climatização em 100% das unidades escolares e inclusão digital irrestrita como pilar estruturante de retenção escolar e atratividade pedagógica para os jovens.`,
        metasAcoes: [
          `Reforma física, hidráulica e elétrica com instalação de climatização completa nas salas de aula de toda a rede estadual ao longo do quadriênio.`,
          `Conexão via banda larga de alta velocidade e modernização dos laboratórios de informática e robótica em todas as escolas estaduais.`,
          `Descentralização de recursos de manutenção direta para a gestão escolar ('Autonomia na Escola') para reparos emergenciais ágeis.`,
          `Articulação de programas de ensino técnico e profissionalizante articulados ao Ensino Médio integrado e ampliação de bolsas de permanência.`,
        ],
        beneficiarios: `Mais de 650 mil estudantes do Ensino Médio e Fundamental II, professores, equipes pedagógicas e comunidades escolares de todos os 92 municípios de ${state}.`,
        abrangencia: `Território integral do Estado de ${state}, com prioridade inicial para áreas de maior vulnerabilidade social da Baixada Fluminense, Região Metropolitana e Interior.`,
        impacto: `Elevação consistente do IDEB estadual, erradicação do abandono escolar juvenil, melhoria nas condições de trabalho docente e formação prática para o mercado de trabalho.`,
        indicadoresSucesso: `Taxa de escolas climatizadas, velocidade média de conectividade escolar e redução percentual da taxa de evasão escolar no Ensino Médio.`,
        viabilidadeOrcamentaria: `Aplicação do percentual constitucional vinculante de 25% da receita líquida estadual em Educação, complementação do FUNDEB e captação de recursos via convênios federais (MEC/FNDE).`,
        translatedText: `O que muda para você e sua família: Escolas estaduais com ar-condicionado em todas as salas, computadores com internet rápida funcionando e prédios reformados. Seus filhos terão estrutura moderna e acolhedora para estudar com dignidade e segurança.`,
      };
    }
  }

  // 2. SAÚDE PÚBLICA (P9)
  if (pillarKey === 'p9' || titleLower.includes('saúde') || titleLower.includes('hospital') || titleLower.includes('policlínica')) {
    if (cargo === 'GOVERNADOR') {
      return {
        pillar: 'p9',
        pillarInfo: { label: 'Saúde Pública', icon: '🩺' },
        title,
        description: baseDesc,
        mandatoScope: scope,
        competenciaMandato: competencia,
        diagnostico: `A excessiva centralização dos serviços de saúde de média e alta complexidade na capital força milhares de moradores da Baixada, Região Serrana e Interior a viagens exaustivas, sobrecarregando hospitais centrais e gerando longas filas na regulação (SISREG).`,
        diretrizes: `Descentralizar o atendimento médico especializado através da implantação de Policlínicas e Centros Integrados de Diagnóstico nas regiões estratégicas do Estado de ${state}, integradas com telemedicina e regulação unificada.`,
        metasAcoes: [
          `Construção e operacionalização de uma rede de Policlínicas Regionais em consórcio com os municípios do Interior e Baixada Fluminense.`,
          `Programa estadual para zerar a fila de cirurgias eletivas (ortopedia, catarata, hérnia e vesícula) mediante mutirões e ampliação de turnos hospitalares.`,
          `Implantação do prontuário eletrônico unificado e sistema inteligente de regulação de vagas para acabar com a burocracia do SISREG estadual.`,
          `Garantia do abastecimento ininterrupto de medicamentos essenciais e de alto custo nas farmácias estaduais.`,
        ],
        beneficiarios: `Usuários do Sistema Único de Saúde (SUS), especialmente cidadãos que necessitam de consultas especializadas, exames diagnósticos e cirurgias de média/alta complexidade.`,
        abrangencia: `Todos os 92 municípios do Estado de ${state}, com foco descentralizado no Interior, Baixada Fluminense, Norte, Noroeste e Sul do Estado.`,
        impacto: `Redução drástica do tempo de espera para consultas com especialistas e exames complexos; atendimento digno perto da casa do paciente, sem necessidade de deslocamento à capital.`,
        indicadoresSucesso: `Tempo médio de espera na regulação para cirurgias eletivas e taxa de resolutividade dos centros médicos regionais.`,
        viabilidadeOrcamentaria: `Fundo Estadual de Saúde de ${state}, aplicação mínima de 12% da receita corrente do Estado em Saúde, transferências federais do SUS e consórcios intermunicipais.`,
        translatedText: `O que muda para você: Você não precisará mais acordar de madrugada nem pegar van para fazer exame ou consulta com especialista na capital. Haverá policlínicas modernas perto da sua região para fazer consultas, exames e cirurgias com rapidez e respeito.`,
      };
    }
  }

  // 3. SEGURANÇA PÚBLICA (P10)
  if (pillarKey === 'p10' || titleLower.includes('segurança') || titleLower.includes('polícia') || titleLower.includes('milícia')) {
    return {
      pillar: 'p10',
      pillarInfo: { label: 'Segurança Pública', icon: '🚓' },
      title,
      description: baseDesc,
      mandatoScope: scope,
      competenciaMandato: competencia,
      diagnostico: `A expansão das facções criminosas e milícias afeta diretamente a tranquilidade das famílias, o comércio local e a livre circulação de pessoas em comunidades e centros urbanos de ${state}.`,
      diretrizes: `Modernização da segurança pública pautada em inteligência financeira, integração de dados entre as forças policiais, valorização dos agentes da lei e ações de presença comunitária com serviços públicos.`,
      metasAcoes: [
        `Criação de Força-Tarefa Especial de Inteligência e asfixia patrimonial contra a lavagem de dinheiro de milícias e narcotráfico.`,
        `Modernização dos centros de perícia técnica científica e compra de equipamentos balísticos e de proteção individual de última geração.`,
        `Realização de concursos públicos periódicos e plano de valorização remuneratória das carreiras policiais e penais.`,
        `Implantação de programas integrados de urbanização, iluminação LED de alta potência e câmeras inteligentes nas áreas de maior índice de criminalidade.`,
      ],
      beneficiarios: `Cidadãos, trabalhadores, comerciantes, pedestres e profissionais das forças de segurança pública de ${state}.`,
      abrangencia: `Centros urbanos, rodovias estaduais, regiões metropolitanas e municípios do interior de ${state}.`,
      impacto: `Queda nos índices de letalidade violenta e roubos de rua/carga, recuperação de territórios dominados pelo crime e restabelecimento da paz social.`,
      indicadoresSucesso: `Redução nas taxas de homicídio doloso e roubo de rua por 100 mil habitantes registradas pelo ISP/órgãos oficiais.`,
      viabilidadeOrcamentaria: `Fundo Estadual de Segurança Pública de ${state}, transferências do Fundo Nacional de Segurança Pública (Ministério da Justiça) e dotações do Tesouro.`,
      translatedText: `O que muda para o cidadão: Mais policiais nas ruas bem equipados e valorizados, inteligência para prender os chefes das milícias e do tráfico, e bairros iluminados e vigiados para você ir e voltar do trabalho com tranquilidade.`,
    };
  }

  // 4. INFRAESTRUTURA & MOBILIDADE / REINDUSTRIALIZAÇÃO (P5)
  if (pillarKey === 'p5' || titleLower.includes('transporte') || titleLower.includes('mobilidade') || titleLower.includes('indústria') || titleLower.includes('infraestrutura')) {
    return {
      pillar: 'p5',
      pillarInfo: { label: 'Reindustrialização & Mobilidade', icon: '🚇' },
      title,
      description: baseDesc,
      mandatoScope: scope,
      competenciaMandato: competencia,
      diagnostico: `A precariedade crônica do sistema de trens metropolitanos (SuperVia), barcas e metrô penaliza diariamente milhões de trabalhadores com atrasos, superlotação e tarifas elevadas, além de limitar a atração de novas fábricas e empreendimentos.`,
      diretrizes: `Reestruturação profunda do transporte sobre trilhos e aquaviário, integração tarifária metropolitana (Bilhete Único com custo acessível) e reindustrialização focada em cadeias de transição energética e inovação.`,
      metasAcoes: [
        `Retomada da gestão ou reformulação total do contrato de concessão da SuperVia e Barcas com investimentos obrigatórios em novos trens refrigerados e estações acessíveis.`,
        `Expansão da malha metroviária com prioridade para a Linha 3 (Niterói - São Gonçalo - Itaboraí) e extensão da Linha 2.`,
        `Criação de Polos de Desenvolvimento Industrial no Interior e na Baixada Fluminense com incentivos tributários para indústrias farmacêuticas, químicas e de logística.`,
        `Garantia do Bilhete Único Intermunicipal integrado com vans legalizadas, ônibus, barcas, metrô e trem.`,
      ],
      beneficiarios: `Milhões de passageiros diários da Região Metropolitana, Baixada Fluminense, Leste Fluminense e trabalhadores das indústrias estaduais.`,
      abrangencia: `Região Metropolitana do Rio de Janeiro e principais eixos rodoviários e ferroviários do Estado.`,
      impacto: `Redução do tempo diário de deslocamento do trabalhador em até 40%, transporte com ar-condicionado e atração de novos investimentos produtivos para o Estado.`,
      indicadoresSucesso: `Intervalo médio entre viagens nos trens metropolitanos e número de novos postos formais de trabalho industrial gerados.`,
      viabilidadeOrcamentaria: `Dotações do Tesouro Estadual, Fundo Estadual de Transportes, operações de crédito junto ao BNDES e repasses do Novo PAC Federal.`,
      translatedText: `O que muda para você: Trens e barcas com ar-condicionado funcionando, sem atrasos constantes, integração mais barata com o metrô e ônibus para você chegar mais rápido ao trabalho e voltar mais cedo para a sua família.`,
    };
  }

  // 5. MEIO AMBIENTE & SANEAMENTO (P3)
  if (pillarKey === 'p3' || titleLower.includes('saneamento') || titleLower.includes('ambiente') || titleLower.includes('baía') || titleLower.includes('água')) {
    return {
      pillar: 'p3',
      pillarInfo: { label: 'Desenvolvimento Sustentável', icon: '🌿' },
      title,
      description: baseDesc,
      mandatoScope: scope,
      competenciaMandato: competencia,
      diagnostico: `Milhões de moradores da Baixada Fluminense, São Gonçalo e periferias ainda convivem com esgoto a céu aberto, falta de água tratada regular e poluição histórica da Baía de Guanabara e do Rio Paraíba do Sul.`,
      diretrizes: `Fiscalização rigorosa e aceleração do cumprimento das metas contratuais de universalização do saneamento básico (água e esgoto) até 2030, associadas à transição ecológica e segurança hídrica.`,
      metasAcoes: [
        `Fiscalização contínua pela agência reguladora estadual (Agenersa) para cumprimento das metas de 99% de água tratada e 90% de esgoto coletado/tratado.`,
        `Implementação do Cinturão de Coleta e Efluentes para despoluição definitiva das bacias que deságuam na Baía de Guanabara e Sistema Lagunar.`,
        `Programa estadual de contenção de encostas e drenagem urbana em áreas de alto risco geológico para prevenir tragédias climáticas em Petrópolis, Teresópolis e favelas.`,
        `Incentivo à geração de energia solar fotovoltaica em prédios públicos e cooperativas comunitárias.`,
      ],
      beneficiarios: `População de todos os municípios fluminenses, pescadores artesanais, comunidades ribeirinhas e moradores de encostas e áreas vulneráveis.`,
      abrangencia: `Bacia da Baía de Guanabara, Região Serrana, Baixada Fluminense e litoral do Estado.`,
      impacto: `Eliminação do esgoto a céu aberto, redução de doenças de veiculação hídrica, recuperação da vida marinha e proteção de vidas contra enchentes e deslizamentos.`,
      indicadoresSucesso: `Índice de cobertura de coleta e tratamento de esgoto e volume de resíduos sólidos recolhidos nas águas da Baía.`,
      viabilidadeOrcamentaria: `Investimentos vinculados aos contratos de concessão dos serviços de saneamento, Fundo Estadual de Conservação Ambiental (Fecam) e recursos federais.`,
      translatedText: `O que muda para você: Esgoto canalizado e tratado na sua rua, fim do mau cheiro nos córregos perto de casa, água limpa na torneira e obras nas encostas para você dormir em paz nas noites de chuva forte.`,
    };
  }

  // 6. BEM-ESTAR & ASSISTÊNCIA SOCIAL / HABITAÇÃO (P1)
  if (pillarKey === 'p1' || titleLower.includes('habita') || titleLower.includes('moradia') || titleLower.includes('comunidade') || titleLower.includes('fome')) {
    return {
      pillar: 'p1',
      pillarInfo: { label: 'Bem-Estar & Habitação', icon: '🥖' },
      title,
      description: baseDesc,
      mandatoScope: scope,
      competenciaMandato: competencia,
      diagnostico: `O déficit habitacional e a precariedade urbanística afetam mais de 1,5 milhão de pessoas no Estado, perpetuando bolsões de pobreza extrema sem acesso a serviços urbanos essenciais e regularização de seus lares.`,
      diretrizes: `Reurbanização participativa de favelas e comunidades, regularização fundiária de moradias com entrega de escrituras definitivas e combate frontal à insegurança alimentar.`,
      metasAcoes: [
        `Implantação do Programa Estadual de Urbanização de Favelas ('Bairro Integrado') com asfalto, saneamento, praças, quadras e iluminação LED.`,
        `Entrega de 100 mil títulos de regularização fundiária e títulos de propriedade gratuita para famílias de baixa renda.`,
        `Construção e reabertura de Restaurantes Populares estaduais servindo café da manhã a R$ 0,50 e almoço a R$ 1,00 nas cidades mais populosas.`,
        `Fortalecimento da rede de CRAS/CREAS em apoio aos municípios para atendimento de famílias em extrema vulnerabilidade.`,
      ],
      beneficiarios: `Famílias residentes em comunidades, assentamentos informais, periferias urbanas e cidadãos em situação de vulnerabilidade socioeconômica.`,
      abrangencia: `Comunidades e bairros populares da Região Metropolitana, Baixada e periferias de cidades-polo do Estado.`,
      impacto: `Segurança jurídica da posse do imóvel familiar, valorização do patrimônio das comunidades, nutrição básica garantida e inclusão na cidadania plena.`,
      indicadoresSucesso: `Número de títulos de propriedade lavrados e entregues e refeições balanceadas distribuídas nos Restaurantes Populares.`,
      viabilidadeOrcamentaria: `Fundo Estadual de Habitação de Interesse Social (FEHIS), Fundo de Combate à Pobreza (FCP) e parcerias com o Minha Casa, Minha Vida.`,
      translatedText: `O que muda para você: O título de propriedade definitivo da sua casa registrado em cartório sem custo, asfalto, luz e saneamento na sua comunidade, e restaurante popular com refeição barata e de qualidade no seu bairro.`,
    };
  }

  // 7. TRABALHO, RENDA & EMPREENDEDORISMO (P6 / P2)
  if (pillarKey === 'p6' || pillarKey === 'p2' || titleLower.includes('renda') || titleLower.includes('trabalho') || titleLower.includes('emprego') || titleLower.includes('microcrédito')) {
    return {
      pillar: 'p6',
      pillarInfo: { label: 'Distribuição de Renda & Emprego', icon: '💰' },
      title,
      description: baseDesc,
      mandatoScope: scope,
      competenciaMandato: competencia,
      diagnostico: `A elevada taxa de desemprego e subocupação entre os jovens fluminenses exige políticas arrojadas de atração de investimentos, formação prática para novas tecnologias e incentivo direto aos microempreendedores de bairro.`,
      diretrizes: `Estímulo à criação de vagas de trabalho formal, expansão do microcrédito orientado a juros zero para negócios de periferia e qualificação técnica articulada às demandas do mercado.`,
      metasAcoes: [
        `Criação do Programa 'Primeiro Passo RJ': subsídio estadual para empresas que contratarem jovens de 18 a 29 anos egressos da rede pública estadual.`,
        `Linhas de microcrédito produtivo orientado (AgeRio) com carência e taxa subsidiada para autônomos, ambulantes, artesãos e MEIs.`,
        `Capacitação profissional gratuita em tecnologia, inteligência artificial, programação e comércio eletrônico nos centros vocacionais estaduais (FAETEC).`,
        `Desburocratização da abertura de empresas com alvará digital estadual em até 24 horas para atividades de baixo risco.`,
      ],
      beneficiarios: `Jovens em busca do primeiro emprego, trabalhadores informais, mulheres empreendedoras, micro e pequenos empresários fluminenses.`,
      abrangencia: `Todos os municípios do Estado de ${state}.`,
      impacto: `Inserção de mais de 80 mil jovens no mercado de trabalho formal, fortalecimento do comércio comunitário e aumento da renda média das famílias.`,
      indicadoresSucesso: `Taxa de emprego com carteira assinada gerada pelo Caged no Estado e volume de microcrédito concedido pela AgeRio.`,
      viabilidadeOrcamentaria: `Agência Estadual de Fomento (AgeRio), Fundo Estadual de Trabalho e Renda e parcerias com o Sistema S (Senai/Sebrae/Senac).`,
      translatedText: `O que muda para você: Crédito rápido e com juros baixos para você comprar material e fazer seu negócio crescer, cursos gratuitos de profissões modernas na Faetec e incentivo para as empresas darem a primeira oportunidade de emprego com carteira assinada para os jovens.`,
    };
  }

  // Fallback estruturado inteligente
  return {
    pillar: pillarKey,
    pillarInfo,
    title,
    description: baseDesc,
    mandatoScope: scope,
    competenciaMandato: competencia,
    diagnostico: `A área correspondente a '${pillarInfo.label}' exige soluções modernas, eficiência administrativa e compromisso com o interesse público para superar defasagens históricas em ${state}.`,
    diretrizes: `Desenvolver iniciativas coordenadas com planejamento estratégico, transparência ativa e participação social para que a política pública atinja quem mais precisa.`,
    metasAcoes: [
      `Elaboração e execução de plano de metas com cronograma público de acompanhamento durante o mandato de ${candName}.`,
      `Modernização de processos operacionais com redução de entraves burocráticos para os cidadãos.`,
      `Articulação institucional para destinação de recursos orçamentários prioritários à execução da proposta.`,
      `Monitoramento contínuo dos resultados com canais abertos de ouvidoria e controle social.`,
    ],
    beneficiarios: `População do Estado de ${state}, com ênfase nos usuários dos serviços públicos e segmentos sociais diretamente impactados.`,
    abrangencia: `Território de ${state}, com foco nas demandas regionais prioritárias.`,
    impacto: `Melhoria quantitativa e qualitativa na entrega de serviços públicos, transparência e valorização da cidadania.`,
    indicadoresSucesso: `Cumprimento do cronograma de entregas estabelecido no plano de mandato registrado.`,
    viabilidadeOrcamentaria: `Previsão nas diretrizes orçamentárias (LDO/LOA), dotações ordinárias e captação de recursos intergovernamentais.`,
    translatedText: `O que muda para o cidadão: Uma proposta séria com metas claras que o candidato se compromete a fiscalizar e executar no mandato, melhorando a vida da população com transparência e responsabilidade com o dinheiro público.`,
  };
}

function detectPillarFromProposal(p: any): string {
  const titleLower = (p.title || p.name || p.text || '').toLowerCase();
  if (titleLower.includes('empreendedor') || titleLower.includes('mei') || titleLower.includes('desonera') || titleLower.includes('simples nacional') || titleLower.includes('microcrédito')) return 'p13';
  if (titleLower.includes('trabalho') || titleLower.includes('emprego') || titleLower.includes('clt') || titleLower.includes('trabalhador') || titleLower.includes('sindic')) return 'p12';
  if (titleLower.includes('educa') || titleLower.includes('escola') || titleLower.includes('estudant')) return 'p11';
  if (titleLower.includes('saúde') || titleLower.includes('saude') || titleLower.includes('hospital') || titleLower.includes('policlínica') || titleLower.includes('policlinica') || titleLower.includes('sus')) return 'p9';
  if (titleLower.includes('segurança') || titleLower.includes('seguranca') || titleLower.includes('polícia') || titleLower.includes('policia') || titleLower.includes('milícia') || titleLower.includes('milicia')) return 'p10';
  if (titleLower.includes('transporte') || titleLower.includes('mobilidade') || titleLower.includes('indústria') || titleLower.includes('industria') || titleLower.includes('supervia') || titleLower.includes('metrô') || titleLower.includes('metro') || titleLower.includes('trem') || titleLower.includes('barca')) return 'p5';
  if (titleLower.includes('saneamento') || titleLower.includes('ambiente') || titleLower.includes('baía') || titleLower.includes('baia') || titleLower.includes('clima') || titleLower.includes('água') || titleLower.includes('agua') || titleLower.includes('esgoto')) return 'p3';
  if (titleLower.includes('habita') || titleLower.includes('moradia') || titleLower.includes('comunidade') || titleLower.includes('fome') || titleLower.includes('restaurante')) return 'p1';
  if (titleLower.includes('renda') || titleLower.includes('salário') || titleLower.includes('salario') || titleLower.includes('tribut')) return 'p6';
  return (p.pillar || '').toLowerCase();
}

/**
 * Retorna a lista completa de propostas estruturadas do mandato do candidato,
 * garantindo que todos os eixos programáticos essenciais do plano de governo estejam cobertos.
 */
export function resolveCandidateMandateProposals(rawProposals: any[], candidateInfo: any): MandateProposalDetail[] {
  const proposals = Array.isArray(rawProposals) ? [...rawProposals] : [];
  const cargo = (candidateInfo?.cargo || '').toUpperCase();

  // Eixos essenciais de mandato para Governadores
  if (cargo === 'GOVERNADOR') {
    const GOVERNOR_CORE_MANDATE_PROPOSALS = [
      {
        pillar: 'p11',
        title: 'Educação em Tempo Integral, Infraestrutura e Climatização Escolar',
        description: 'Reforma e modernização de 100% das escolas estaduais com ar-condicionado e conectividade.',
      },
      {
        pillar: 'p9',
        title: 'Regionalização da Saúde e Rede de Policlínicas Integradas',
        description: 'Construção e ampliação de policlínicas e hospitais regionais para zerar as filas do SISREG.',
      },
      {
        pillar: 'p10',
        title: 'Segurança Cidadã, Inteligência Policial e Asfixia das Milícias',
        description: 'Modernização das polícias, perícia técnica científica e inteligência financeira contra o crime organizado.',
      },
      {
        pillar: 'p5',
        title: 'Integração Metropolitana dos Transportes e Reindustrialização',
        description: 'Modernização da SuperVia, barcas e metrô com tarifa integrada e polos industriais no interior.',
      },
      {
        pillar: 'p3',
        title: 'Saneamento Básico Universal e Despoluição da Baía de Guanabara',
        description: 'Universalização da água tratada e esgoto na Baixada e despoluição sustentável dos recursos hídricos.',
      },
      {
        pillar: 'p1',
        title: 'Urbanização de Comunidades, Habitação Popular e Restaurantes Populares',
        description: 'Regularização fundiária de moradias, infraestrutura comunitária e expansão de restaurantes populares.',
      },
      {
        pillar: 'p6',
        title: 'Emprego Jovem, Microcrédito Produtivo e Inovação Tecnológica',
        description: 'Programa Primeiro Passo para inserção juvenil no mercado e microcrédito orientado a pequenos negócios.',
      },
    ];

    // Se as propostas existentes tiverem menos que o portfolio completo, complementa com os eixos ausentes
    for (const core of GOVERNOR_CORE_MANDATE_PROPOSALS) {
      const alreadyHas = proposals.some((p) => detectPillarFromProposal(p) === core.pillar.toLowerCase());
      if (!alreadyHas) {
        proposals.push(core);
      }
    }
  } else if (cargo === 'PRESIDENTE') {
    const PRESIDENT_CORE_PROPOSALS = [
      {
        pillar: 'p6',
        title: 'Erradicação da Fome, Redução da Pobreza e Segurança Alimentar',
        description: 'Fortalecimento do Bolsa Família com foco na nutrição infantil e ampliação de Cozinhas Solidárias.',
      },
      {
        pillar: 'p11',
        title: 'Educação Básica Integral e Poupança Estudantil (Pé-de-Meia)',
        description: 'Universalização do programa Pé-de-Meia no Ensino Médio e expansão dos Institutos Federais.',
      },
      {
        pillar: 'p9',
        title: 'Saúde Universal, Gratuidade e Fortalecimento Integral do SUS',
        description: 'Retomada e interiorização do Mais Médicos, Farmácia Popular gratuita e mutirões de cirurgias eletivas.',
      },
      {
        pillar: 'p3',
        title: 'Transição Energética Justa, Preservação Florestal e Justiça Climática',
        description: 'Meta de desmatamento zero, fomento à energia solar e liderança internacional na COP30.',
      },
      {
        pillar: 'p5',
        title: 'Nova Indústria Brasil, Ciência, Tecnologia e Inovação Soberana',
        description: 'Crédito produtivo de longo prazo pelo BNDES para descarbonização e inteligência artificial soberana.',
      },
      {
        pillar: 'p2',
        title: 'Valorização Real do Salário Mínimo e Reforma Tributária Progressiva',
        description: 'Aumento real contínuo do salário mínimo e isenção do Imposto de Renda para rendas até 2 salários.',
      },
      {
        pillar: 'p10',
        title: 'Segurança Cidadã, Inteligência no SUSP e Desarmamento Responsável',
        description: 'Modernização do Sistema Único de Segurança Pública integrando inteligência contra o crime organizado.',
      },
    ];

    for (const core of PRESIDENT_CORE_PROPOSALS) {
      const alreadyHas = proposals.some((p) => p.pillar && p.pillar.toLowerCase() === core.pillar.toLowerCase());
      if (!alreadyHas) {
        proposals.push(core);
      }
    }
  } else if (cargo === 'SENADOR') {
    const SENATOR_CORE_PROPOSALS = [
      {
        pillar: 'p10',
        title: 'Defesa do Estado Democrático de Direito e Segurança Jurídica',
        description: 'Fortalecimento das instituições republicanas, combate a tentativas antidemocráticas e garantia das liberdades.',
      },
      {
        pillar: 'p6',
        title: 'Reforma Tributária Progressiva e Repartição Federativa Justa',
        description: 'Desoneração da folha e do consumo popular, tributação de grandes patrimônios e mais verbas a estados/municípios.',
      },
      {
        pillar: 'p11',
        title: 'Financiamento Constitucional da Educação Básica e Superior',
        description: 'Blindagem orçamentária do Fundeb, expansão das universidades federais e assistência estudantil permanente.',
      },
      {
        pillar: 'p9',
        title: 'Acesso Universal à Saúde e Fortalecimento Estrutural do SUS',
        description: 'Garantia de recursos estáveis da União para o SUS, hospitais universitários e mutirões de procedimentos especializados.',
      },
      {
        pillar: 'p3',
        title: 'Marco Regulatório da Transição Energética e Clima',
        description: 'Incentivos fiscais a energias limpas (solar e eólica), proteção rigorosa dos biomas e combate a crimes ambientais.',
      },
      {
        pillar: 'p5',
        title: 'Ciência, Tecnologia Nacional e Soberania Digital',
        description: 'Fomento a parques tecnológicos, semicondutores e inteligência artificial aberta e pública para o desenvolvimento do país.',
      },
      {
        pillar: 'p2',
        title: 'Direitos Humanos, Igualdade de Gênero e Defesa da Cidadania',
        description: 'Combate à violência doméstica, igualdade de remuneração entre homens e mulheres e proteção a minorias sociais.',
      },
    ];

    for (const core of SENATOR_CORE_PROPOSALS) {
      const alreadyHas = proposals.some((p) => p.pillar && p.pillar.toLowerCase() === core.pillar.toLowerCase());
      if (!alreadyHas) {
        proposals.push(core);
      }
    }
  } else if (cargo === 'DEPUTADO_FEDERAL') {
    const DEP_FED_CORE_PROPOSALS = [
      {
        pillar: 'p11',
        title: 'Emendas para Educação Pública, Institutos Federais e Pé-de-Meia',
        description: 'Destinação de emendas parlamentares para infraestrutura escolar e valorização do ensino técnico profissionalizante.',
      },
      {
        pillar: 'p6',
        title: 'Valorização do Salário Mínimo e Proteção ao Trabalho Decente',
        description: 'Defesa dos direitos previdenciários e trabalhistas, regulação justa de plataformas e fim da pejotização precarizada.',
      },
      {
        pillar: 'p9',
        title: 'Fortalecimento do SUS Municipal, UPAs e Cirurgias Eletivas',
        description: 'Recursos diretos para postos de saúde, aquisição de ambulâncias e mutirões de exames de média complexidade.',
      },
      {
        pillar: 'p10',
        title: 'Segurança Cidadã, Combate a Facções e Asfixia de Milícias',
        description: 'Aprimoramento do arcabouço penal de combate à lavagem de dinheiro do crime e inteligência na segurança pública.',
      },
      {
        pillar: 'p5',
        title: 'Reindustrialização Verde, Logística e Infraestrutura Local',
        description: 'Apoio orçamentário para obras de infraestrutura regional e atração de indústrias sustentáveis nos municípios.',
      },
      {
        pillar: 'p1',
        title: 'Habitação Popular, Minha Casa Minha Vida e Cozinhas Solidárias',
        description: 'Aporte de recursos federais para moradia digna aos mais vulneráveis e erradicação da fome nos bairros populares.',
      },
      {
        pillar: 'p2',
        title: 'Igualdade Racial, Defesa da Mulher e Direitos Sociais',
        description: 'Fortalecimento da rede de proteção a mulheres vítimas de violência e promoção da igualdade racial de oportunidades.',
      },
    ];

    for (const core of DEP_FED_CORE_PROPOSALS) {
      const alreadyHas = proposals.some((p) => p.pillar && p.pillar.toLowerCase() === core.pillar.toLowerCase());
      if (!alreadyHas) {
        proposals.push(core);
      }
    }
  } else if (cargo === 'DEPUTADO_ESTADUAL') {
    const DEP_EST_CORE_PROPOSALS = [
      {
        pillar: 'p11',
        title: 'Climatização e Reforma Geral das Escolas da Rede Estadual',
        description: 'Fiscalização e alocação de emendas para ar-condicionado em todas as salas e cumprimento do piso salarial docente.',
      },
      {
        pillar: 'p9',
        title: 'Fiscalização das UPAs Estaduais e Transparência no SISREG',
        description: 'Vistoria regular nos hospitais estaduais, denúncia de desabastecimento de remédios e fim das filas da regulação.',
      },
      {
        pillar: 'p10',
        title: 'Valorização Policial, Equipamentos e Preservação de Vidas',
        description: 'Condições dignas de trabalho aos agentes de segurança e tecnologia com câmeras para proteger cidadãos e policiais.',
      },
      {
        pillar: 'p5',
        title: 'Fiscalização Rígida de Trens, Barcas e Concessionárias de Transporte',
        description: 'Abertura de CPIs e aplicação de multas severas por falhas no transporte público metropolitano e intermunicipal.',
      },
      {
        pillar: 'p3',
        title: 'Saneamento nas Periferias e Proteção das Encostas e Rios',
        description: 'Cobrança do cumprimento do cronograma de obras de esgotamento sanitário e verbas para contenção de encostas.',
      },
      {
        pillar: 'p1',
        title: 'Expansão de Restaurantes Populares e Habitação Comunitária',
        description: 'Leis estaduais para subsidiar refeições a preço popular e regularização imobiliária em comunidades periféricas.',
      },
      {
        pillar: 'p6',
        title: 'Cursos Vocacionais Gratuitos na Faetec e Apoio ao Emprego Jovem',
        description: 'Abertura de novas turmas de capacitação técnica profissionalizante e incentivo a estágios no primeiro emprego.',
      },
    ];

    for (const core of DEP_EST_CORE_PROPOSALS) {
      const alreadyHas = proposals.some((p) => p.pillar && p.pillar.toLowerCase() === core.pillar.toLowerCase());
      if (!alreadyHas) {
        proposals.push(core);
      }
    }
  }

  return proposals.map((p) => resolveMandateProposalDetails(p, candidateInfo));
}
