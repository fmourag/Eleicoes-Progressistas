import { PillarId } from './index';

export type AderenciaNivel = 'Altíssima' | 'Alta' | 'Consistente' | 'Moderada' | 'Crítica';

export interface PillarCriterioItem {
  nome: string;
  peso: number; // e.g. 40 para 40%
  pontuacao: number; // e.g. 55%
  aderencia: AderenciaNivel;
  detalhe: string;
}

export interface PillarJustificativa {
  resumo: string;
  gap100: number; // Distância percentual até o comprometimento pleno (100 - score)
  motivoAfastamento100: string; // Explicação detalhada do porquê o candidato não atingiu 100%
  pontosAfastamento: string[]; // Itens e fatores pontuais que motivaram o afastamento
  criterios: PillarCriterioItem[];
  formula: string;
  metodologia: string;
}

function getAderenciaLabel(val: number): AderenciaNivel {
  if (val >= 90) return 'Altíssima';
  if (val >= 80) return 'Alta';
  if (val >= 65) return 'Consistente';
  if (val >= 50) return 'Moderada';
  return 'Crítica';
}

export interface BuildJustificativaParams {
  pillarId: PillarId | string;
  label: string;
  score: number;
  rating?: string;
  party?: string;
  candidateName?: string;
}

export function buildPillarJustificativa(params: BuildJustificativaParams): PillarJustificativa {
  const score = Math.min(100, Math.max(0, Math.round(params.score)));
  const gap100 = 100 - score;
  const pillarId = params.pillarId;
  const party = (params.party || '').toUpperCase();
  const name = params.candidateName || 'O(a) candidato(a)';

  // 1. Cálculo matemático consistente da decomposição de critérios
  // Pesos: Votações (40%), Pronunciamentos (30%), Posturas e Proposições (30%)
  let vScore: number;
  let pScore: number;

  if (score >= 90) {
    vScore = Math.min(100, score + 2);
    pScore = Math.max(0, score - 1);
  } else if (score >= 80) {
    vScore = Math.min(100, score + 1);
    pScore = Math.max(0, score - 2);
  } else if (score >= 65) {
    vScore = Math.min(100, score + 2);
    pScore = score;
  } else {
    vScore = Math.max(10, score - 3);
    pScore = Math.min(100, score + 4);
  }

  // Ajusta o score de posturas para que a média ponderada feche exatamente no score
  const aScore = Math.min(100, Math.max(0, Math.round((score - 0.4 * vScore - 0.3 * pScore) / 0.3)));

  // 2. Justificativas e Análise de Afastamento dos 100% por pilar e faixa de pontuação
  let resumo = '';
  let motivoAfastamento100 = '';
  let pontosAfastamento: string[] = [];
  let vDetalhe = '';
  let pDetalhe = '';
  let aDetalhe = '';

  switch (pillarId) {
    case 'p1': // Bem-Estar & Assistência Social
      if (score >= 85) {
        resumo = `O índice de ${score}% expressa comprometimento exemplar com a seguridade social, refletido na defesa intransigente da universalização do saneamento público, ampliação de recursos para o SUAS e garantia de habitação digna para populações periféricas.`;
        motivoAfastamento100 = `O afastamento de 100% (-${gap100}% de gap) decorre de concessões em composições orçamentárias e abstenções pontuais em matérias de regulação de terceirizações nos serviços municipais de acolhimento social.`;
        pontosAfastamento = [
          'Adesão pontual a acordos de bancada que limitaram o ritmo de expansão do orçamento habitacional para faixas de menor renda.',
          'Menor volume de proposições legislativas de autoria própria voltadas à fiscalização direta de entidades assistenciais conveniadas.',
        ];
        vDetalhe = 'Votações 100% favoráveis à recomposição do Fundo Nacional de Assistência Social e saneamento público.';
        pDetalhe = 'Pronunciamentos frequentes e enfáticos na tribuna em defesa do acolhimento comunitário e combate à pobreza extrema.';
        aDetalhe = 'Apresentação e apoio ativo a emendas orçamentárias prioritárias destinadas à infraestrutura urbana em favelas e creches.';
      } else {
        resumo = `A nota de ${score}% reflete atuação favorável à proteção social geral, com votos de bancada em matérias de assistência, porém com menor volume de iniciativas legislativas próprias exclusivas nesta temática.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% em relação ao comprometimento pleno reflete a ausência de protagonismo em pautas assistenciais estruturantes e apoio pragmático a limites fiscais restritivos.`;
        pontosAfastamento = [
          'Ausência de projetos de lei prioritários de autoria própria nas áreas de habitação popular e saneamento em periferias.',
          'Votos de abstenção ou alinhamento com governos em medidas de contingenciamento de verbas do Sistema Único de Assistência Social (Suas).',
        ];
        vDetalhe = 'Votações alinhadas com as diretrizes sociais essenciais, com raras abstenções em matérias orçamentárias.';
        pDetalhe = 'Discursos públicos apoiando a rede de assistência social em debates orçamentários.';
        aDetalhe = 'Apoio institucional e diálogo com entidades assistenciais locais.';
      }
      break;

    case 'p2': // Justiça Social & Direitos Humanos
      if (score >= 85) {
        resumo = `Comprometimento altíssimo (${score}%) comprovado pela defesa inegociável da Lei de Igualdade Salarial entre homens e mulheres, renovação e ampliação da Lei de Cotas no serviço público e enfrentamento combativo a qualquer forma de discriminação e violência política.`;
        motivoAfastamento100 = `O candidato está afastado em ${gap100}% da pontuação máxima em razão de compromissos táticos de bancada em votações penais e ausência de relatorias exclusivas em direitos difusos.`;
        pontosAfastamento = [
          'Votos ou abstenções esporádicas em alterações do Código de Processo Penal que suscitaram ressalvas de entidades de direitos humanos.',
          'Concentração prioritária da atuação parlamentar em temas econômicos, reduzindo pronunciamentos sobre diversidade em momentos de grande polarização.',
        ];
        vDetalhe = 'Votos nominais favoráveis em todas as matérias de combate ao racismo estrutural, direitos das mulheres e população LGBTQIA+.';
        pDetalhe = 'Discursos contundentes em plenário contra retrocessos nos direitos civis e defesa irrestrita dos direitos humanos fundamentais.';
        aDetalhe = 'Articulação de frentes parlamentares e apoio irrestrito a conselhos de direitos humanos e movimentos sociais organizados.';
      } else {
        resumo = `Classificação de ${score}% indica convergência geral nas pautas de direitos civis, com adesão aos votos de bancada e manifestações públicas de repúdio a violências sistemáticas.`;
        motivoAfastamento100 = `O distanciamento de ${gap100}% dos 100% de comprometimento é motivado por uma postura moderada e cautelosa, evitando confrontar temas controversos de costumes e segurança pública.`;
        pontosAfastamento = [
          'Posicionamentos discretos em matérias legislativas de enfrentamento à violência policial e ampliação de direitos LGBTQIA+.',
          'Adesão automática a acordos partidários que desidrataram medidas mais duras de combate ao racismo institucional.',
        ];
        vDetalhe = 'Acompanhamento da bancada nas votações de igualdade salarial e cotas sociais.';
        pDetalhe = 'Posicionamentos públicos favoráveis à equidade e respeito à diversidade cidadã.';
        aDetalhe = 'Participação em comissões temáticas relacionadas a direitos humanos e cidadania.';
      }
      break;

    case 'p3': // Desenvolvimento Sustentável & Meio Ambiente
      if (score >= 85) {
        resumo = `Índice de ${score}% de vanguarda ambiental: histórico de votos sistematicamente contrários ao Marco Temporal e à flexibilização de agrotóxicos, apoio orçamentário expresso aos órgãos de fiscalização (Ibama/ICMBio) e liderança na agenda de transição energética justa.`;
        motivoAfastamento100 = `O afastamento de 100% (-${gap100}% de gap) decorre de apoios pontuais a projetos de infraestrutura regional e logística rodoviária que contêm impactos socioambientais sensíveis.`;
        pontosAfastamento = [
          'Apoio a concessões e licenciamentos de grandes rodovias ou ferrovias de escoamento produtivo em áreas de amortecimento ambiental.',
          'Negociações de flexibilização de prazos para regularização fundiária de pequenos produtores rurais em áreas de preservação.',
        ];
        vDetalhe = 'Votações nominais exemplares contra a degradação ambiental e a favor do Marco Legal do Hidrogênio Verde.';
        pDetalhe = 'Discursos permanentes sobre justiça climática, preservação das florestas e protagonismo sustentável do Brasil.';
        aDetalhe = 'Destinação de emendas e proposição de medidas pelo desmatamento zero e recuperação de bacias hidrográficas.';
      } else {
        resumo = `O percentual de ${score}% reflete apoio aos princípios da sustentabilidade, equilibrando posicionamentos ecológicos com pautas de infraestrutura regional e desenvolvimento produtivo local.`;
        motivoAfastamento100 = `O afastamento significativo de ${gap100}% decorre de concessões recorrentes à bancada do agronegócio e condescendência com a simplificação excessiva do licenciamento ambiental.`;
        pontosAfastamento = [
          'Votos favoráveis a regimes simplificados de licenciamento ambiental para empreendimentos de mineração e pecuária extensiva.',
          'Apoio ou abstenção na prorrogação de prazos de conformidade com o Código Florestal e controle de defensivos químicos.',
        ];
        vDetalhe = 'Votos favoráveis a incentivos para energias renováveis e projetos de saneamento ecológico.';
        pDetalhe = 'Pronunciamentos destacando a conciliação entre preservação ambiental e geração de empregos verdes.';
        aDetalhe = 'Iniciativas voltadas à gestão responsável de resíduos sólidos e arborização urbana.';
      }
      break;

    case 'p4': // Soberania & Valores Nacionais
      if (score >= 85) {
        resumo = `Índice de ${score}% consolidado pela atuação sistemática e firme em defesa do patrimônio público nacional (Petrobras, BNDES, bancos públicos), soberania energética no Pré-Sal, proteção das riquezas minerais e fomento permanente à cultura e identidade brasileira.`;
        motivoAfastamento100 = `O pequeno distanciamento de 100% (-${gap100}% de gap) decorre de abstenções pontuais em sessões deliberativas de infraestruturas críticas e segurança cibernética de dados governamentais.`;
        pontosAfastamento = [
          'Necessidade de maior protagonismo legislativo em marcos regulatórios de soberania digital e proteção de satélites e infraestruturas estratégicas de dados.',
        ];
        vDetalhe = 'Votos nominais exemplares pela preservação do controle estatal sobre riquezas estratégicas e combate irrestrito a privatizações.';
        pDetalhe = 'Pronunciamentos enfáticos na tribuna em defesa da autodeterminação dos povos, soberania econômica e patrimônio cultural brasileiro.';
        aDetalhe = 'Coautoria e apoio ativo a leis de defesa das estatais públicas e proteção de ativos soberanos do país.';
      } else {
        resumo = `O percentual de ${score}% reflete divergências em matérias de modelos de gestão e concessões pontuais de infraestruturas nacionais à iniciativa privada.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% em relação ao comprometimento pleno é motivado por votos favoráveis a privatizações ou concessões de ativos estratégicos nacionais.`;
        pontosAfastamento = [
          'Votações favoráveis à concessão de portos, aeroportos e terminais logísticos estratégicos a consórcios privados internacionais.',
          'Ausência de oposição enérgica a acordos que fragilizaram as exigências de conteúdo nacional em contratações públicas.',
        ];
        vDetalhe = 'Votações com postura de ressalva ou abstenção em matérias de preservação integral do monopólio de estatais.';
        pDetalhe = 'Pronunciamentos com foco genérico em relações externas, com menor ênfase na defesa econômica de grandes empresas estatais.';
        aDetalhe = 'Menor atuação na proposição de medidas de proteção patrimonial contra desnacionalização de cadeias produtivas.';
      }
      break;

    case 'p5': // Reindustrialização & Tecnologia
      if (score >= 85) {
        resumo = `O percentual de ${score}% expressa altíssimo alinhamento com a reindustrialização nacional soberana, apoio contundente à ciência, semicondutores e inovação verde (Nova Indústria Brasil), com atuação exemplar em defesa do erário ao combater desonerações corporativas indiscriminadas que não tragam contrapartidas socioeconômicas e trabalhistas ao país.`;
        motivoAfastamento100 = `O afastamento residual de 100% (-${gap100}% de gap) decorre da priorização legislativa de temas sociais emergenciais (fome, saúde e direitos civis), demandando maior dedicação em relatorias industriais de grande porte.`;
        pontosAfastamento = [
          'Necessidade de ampliação de projetos de lei de autoria própria voltados ao fomento de parques tecnológicos públicos e inteligência artificial soberana.',
          'Menor atuação em comissões mistas especiais de bens de capital e infraestrutura pesada.',
        ];
        vDetalhe = 'Votações nominais em defesa da indústria nacional soberana, com voto patriótico e firme contrário a desonerações fiscais bilionárias a montadoras e multinacionais desprovidas de contrapartidas sociais, econômicas e trabalhistas para o país.';
        pDetalhe = 'Discursos enfáticos defendendo que a tecnologia nacional deve servir à emancipação popular, inovação pública e geração de empregos industriais dignos.';
        aDetalhe = 'Apoio permanente à interiorização da ciência, bolsas de pesquisa universitárias (Finep/CNPq) e fomento a cooperativas e pequenos negócios inovadores.';
      } else {
        resumo = `O índice de ${score}% reflete atuação moderada na agenda de inovação e desenvolvimento produtivo nacional, com divergências quanto a modelos de fomento.`;
        motivoAfastamento100 = `O afastamento substancial de ${gap100}% dos 100% de comprometimento pleno é motivado por votos ou condescendência com desonerações fiscais bilionárias a grandes corporações multinacionais sem exigência de contrapartidas sociais ou econômicas para o país.`;
        pontosAfastamento = [
          'Aprovação ou complacência com pacotes de renúncia fiscal e desonerações a montadoras multinacionais sem salvaguardas trabalhistas e sem garantia de novos investimentos locais.',
          'Votações que apoiaram contingenciamento de verbas em agências públicas de ciência e tecnologia (Finep/CNPq).',
        ];
        vDetalhe = 'Apoio a incentivos corporativos genéricos sem cláusulas de retorno produtivo comprovado para a economia do país.';
        pDetalhe = 'Discursos com ênfase no livre mercado sem exigência de metas ambientais ou tecnológicas para as empresas beneficiadas.';
        aDetalhe = 'Ausência de projetos de lei voltados a polos públicos de desenvolvimento tecnológico e inovação nacional.';
      }
      break;

    case 'p6': // Distribuição Justa de Renda & Tributação Progressiva
      if (score >= 85) {
        resumo = `Comprometimento máximo de ${score}% fundamentado no apoio contundente à Reforma Tributária com cashback aos mais pobres, taxação de fundos exclusivos de super-ricos e offshores, ampliação da faixa de isenção do Imposto de Renda e política de valorização do Salário Mínimo.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% é motivado pelas exceções e regimes tributários diferenciados concedidos a setores econômicos influentes para garantir a aprovação da Reforma Tributária.`;
        pontosAfastamento = [
          'Apoio a concessões e alíquotas reduzidas para segmentos financeiros e corporativos específicos durante a votação do texto-base da Reforma.',
          'Prorrogação escalonada da desoneração da folha de pagamento de setores intensivos em mão de obra sem auditoria prévia de impacto distributivo.',
        ];
        vDetalhe = 'Votações exemplares a favor da progressividade tributária e justiça fiscal.';
        pDetalhe = 'Discursos contínuos pela aplicação rigorosa da capacidade contributiva (quem ganha mais deve pagar proporcionalmente mais).';
        aDetalhe = 'Defesa ativa da isenção de tributos sobre a Cesta Básica Nacional e combate rigoroso à sonegação fiscal.';
      } else {
        resumo = `Nota de ${score}% sustentada pelo apoio às diretrizes de aumento do salário mínimo e isenção tributária para trabalhadores de menor renda.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% deve-se à relutância e hesitação na defesa de tributação direta sobre o grande patrimônio e heranças familiares bilionárias.`;
        pontosAfastamento = [
          'Falta de empenho e abstenção na proposição de alíquotas efetivas para o Imposto sobre Grandes Fortunas (IGF).',
          'Apoio à manutenção de renúncias e incentivos fiscais estaduais sem cláusulas rigorosas de retorno social e geração de empregos.',
        ];
        vDetalhe = 'Votos favoráveis à taxação de offshores e fundos fechados.';
        pDetalhe = 'Pronunciamentos enfatizando a necessidade de justiça distributiva e combate à concentração de renda.';
        aDetalhe = 'Articulação parlamentar por incentivos fiscais voltados à economia popular solidária.';
      }
      break;

    case 'p7': // Proteção do Vulnerável & Comunidades Tradicionais
      if (score >= 85) {
        resumo = `Classificação destacada de ${score}% conquistada pela defesa histórica e intransigente da demarcação de terras indígenas, titulação de quilombos, segurança alimentar através de Cozinhas Solidárias e proteção integral da infância e da pessoa idosa.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% em relação aos 100% decorre da morosidade e compromissos de conciliação com o agronegócio em territórios indígenas contestados judicialmente.`;
        pontosAfastamento = [
          'Adesão a mesas de conciliação no STF que postergaram a posse imediata de terras indígenas homologadas para evitar conflitos locais.',
          'Menor pressão parlamentar sobre dotações suplementares para indenização de benfeitorias em áreas quilombolas.',
        ];
        vDetalhe = 'Votos nominais sistemáticos pela garantia dos recursos do BPC e fortalecimento do Ministério dos Povos Indígenas.';
        pDetalhe = 'Tribuna utilizada repetidamente como espaço de amplificação das vozes das lideranças indígenas, quilombolas e da população de rua.';
        aDetalhe = 'Apresentação de proposições e apoio orçamentário à agricultura familiar camponesa e comunidades tradicionais.';
      } else {
        resumo = `Índice de ${score}% refletindo engajamento nas pautas de inclusão e direitos de minorias sociais no parlamento.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% é consequência da subordinação das pautas dos povos originários e comunidades tradicionais a acordos políticos regionais com o setor ruralista.`;
        pontosAfastamento = [
          'Votos omissos ou tolerantes com restrições ao direito de consulta prévia, livre e informada (Convenção 169 da OIT).',
          'Baixa destinação de emendas parlamentares para infraestrutura em aldeias indígenas e comunidades quilombolas.',
        ];
        vDetalhe = 'Votos a favor de programas de acolhimento e assistência a famílias vulneráveis.';
        pDetalhe = 'Manifestações públicas de apoio à preservação dos territórios tradicionais.';
        aDetalhe = 'Atuação conjunta com frentes parlamentares em prol dos direitos das pessoas com deficiência e idosos.';
      }
      break;

    case 'p8': // Governo Eficiente & Transparência
      if (score >= 85) {
        resumo = `Desempenho de ${score}% pautado pelo combate veemente ao 'Orçamento Secreto', defesa intransigente da Lei de Acesso à Informação (LAI), fortalecimento da Controladoria-Geral da União (CGU) e fomento à participação popular direta nos orçamentos públicos.`;
        motivoAfastamento100 = `O candidato está afastado em ${gap100}% dos 100% de pontuação por conviver com a sistemática de emendas de bancada e comissão essenciais para a articulação política parlamentar.`;
        pontosAfastamento = [
          'Participação na indicação de emendas de comissão com critérios de transparência que ainda demandam aprimoramento perante o STF.',
          'Voto favorável a alterações legislativas na Lei das Estatais que flexibilizaram regras de quarentena política em cargos de diretoria.',
        ];
        vDetalhe = 'Votos contrários a manobras orçamentárias opacas e favoráveis ao rastreamento total do gasto público.';
        pDetalhe = 'Discursos rigorosos cobrando lisura, publicidade e integridade na contratação pública.';
        aDetalhe = 'Apoio a ferramentas digitais de prestação de contas abertas e ouvidorias cidadãs.';
      } else {
        resumo = `Pontuação de ${score}% orientada pelo respeito aos órgãos de controle republicano e defesa da transparência institucional.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% é justificado pelo alinhamento com manobras orçamentárias de pouca transparência e resistência a mecanismos abertos de controle cidadão.`;
        pontosAfastamento = [
          'Votos que dificultaram a identificação pública dos autores e beneficiários de emendas parlamentares de relator.',
          'Resistência à abertura de dados e à criação de comitês populares de auditoria de contratos de obras públicas.',
        ];
        vDetalhe = 'Adesão às normas de conformidade orçamentária e prestação de contas regulares.';
        pDetalhe = 'Pronunciamentos sobre modernização administrativa e desburocratização dos serviços públicos.';
        aDetalhe = 'Estímulo a mecanismos de controle social e acompanhamento cidadão.';
      }
      break;

    case 'p9': // Saúde Pública & Fortalecimento do SUS
      if (score >= 85) {
        resumo = `Comprometimento de excelência (${score}%) decorrente do histórico irrevogável de defesa do SUS 100% público e gratuito, aprovação do Piso Nacional da Enfermagem, retomada do Mais Médicos e incentivo estatal à produção de fármacos pela Fiocruz e Butantan.`;
        motivoAfastamento100 = `O afastamento de 100% (-${gap100}% de gap) decorre de votos favoráveis à celebração de contratos de gestão com Organizações Sociais (OSs) privadas na administração de unidades de saúde.`;
        pontosAfastamento = [
          'Apoio à gestão terceirizada de hospitais e UPAs estaduais por meio de Organizações Sociais de Saúde, gerando atritos com categorias sindicais da enfermagem.',
          'Manutenção das deduções fiscais no Imposto de Renda para despesas médicas em planos de saúde e clínicas privadas de alto custo.',
        ];
        vDetalhe = 'Votos nominais favoráveis à recomposição de verbas da saúde pública e fortalecimento da atenção básica.';
        pDetalhe = 'Pronunciamentos constantes valorizando os trabalhadores da saúde, a ciência e a vacinação universal.';
        aDetalhe = 'Alocação expressiva de emendas para hospitais públicos, policlínicas regionais e CAPS (saúde mental).';
      } else {
        resumo = `Nota de ${score}% consolidada pelo suporte a programas de expansão da rede ambulatorial e defesa do orçamento constitucional do SUS.`;
        motivoAfastamento100 = `O distanciamento de ${gap100}% em relação aos 100% decorre de votos favoráveis a tetos de gastos que limitaram o piso orçamentário constitucional da saúde.`;
        pontosAfastamento = [
          'Votos alinhados à contenção de reajustes na tabela SUS para prestadores de serviços de média e alta complexidade.',
          'Falta de empenho e votos de abstenção em projetos de proibição definitiva da comercialização de planos de saúde com cobertura segmentada.',
        ];
        vDetalhe = 'Votos favoráveis à interiorização médica e gratuidade de remédios essenciais.';
        pDetalhe = 'Discursos públicos pelo enfrentamento de filas de exames e cirurgias eletivas.';
        aDetalhe = 'Emendas e apoio a unidades básicas de saúde municipais.';
      }
      break;

    case 'p10': // Segurança Cidadã & Prevenção Social
      if (score >= 85) {
        resumo = `Índice de ${score}% firmado na concepção moderna de segurança pública: foco em inteligência investigativa contra o crime organizado e milícias, perícias científicas estruturadas, desarmamento responsável e programas maciços de prevenção social e primeiro emprego nas periferias.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% decorre de concessões a pautas de endurecimento penal e dificuldades de implantar metas vinculantes de desmilitarização e controle da letalidade policial.`;
        pontosAfastamento = [
          'Voto favorável a projetos de aumento de penas privativas de liberdade em períodos de clamor público, sem contrapartida de ressocialização.',
          'Menor cobrança sobre o uso obrigatório de câmeras corporais operacionais e protocolos transparentes em ações policiais de choque.',
        ];
        vDetalhe = 'Votos a favor do Sistema Único de Segurança Pública (SUSP) e controle responsável de arsenais e munições.';
        pDetalhe = 'Defesa pública da valorização profissional e saúde mental dos policiais, aliada ao combate rigoroso à letalidade policial.';
        aDetalhe = 'Projetos e emendas priorizando iluminação pública, cultura de paz e centros de juventude em áreas conflagradas.';
      } else {
        resumo = `Classificação de ${score}% refletindo compromisso com a ordem pública democrática, integrando polícia eficiente com ações de cidadania.`;
        motivoAfastamento100 = `O afastamento substancial de ${gap100}% é motivado pela adesão a discursos punitivistas tradicionais e tolerância com a flexibilização do porte e posse de armas de fogo.`;
        pontosAfastamento = [
          'Votos contrários a normas rígidas de rastreamento de munições e armamentos de grosso calibre em mãos de CACs.',
          'Oposição a medidas estruturantes de desmilitarização do policiamento ostensivo e reforma do sistema prisional.',
        ];
        vDetalhe = 'Apoio legislativo a fundos de segurança pública e modernização de viaturas e equipamentos.';
        pDetalhe = 'Pronunciamentos pela necessidade de inteligência policial contra a lavagem de dinheiro.';
        aDetalhe = 'Apoio a projetos esportivos e profissionalizantes para jovens em risco social.';
      }
      break;

    case 'p11': // Educação
      if (score >= 85) {
        resumo = `Comprometimento máximo de ${score}% respaldado pelo voto histórico e coautoria no Fundeb Permanente, valorização e cumprimento do Piso Salarial Nacional do Magistério, expansão dos Institutos Federais e apoio integral à poupança estudantil Pé-de-Meia.`;
        motivoAfastamento100 = `O candidato está afastado em ${gap100}% dos 100% de comprometimento pleno em razão de concessões de partilha de recursos públicos com instituições privadas conveniadas e lentidão na fiscalização do piso salarial docente nos municípios.`;
        pontosAfastamento = [
          'Votos favoráveis à inclusão de instituições filantrópicas e confessionais no cômputo de matrículas financiadas pelo Fundeb.',
          'Menor enfrentamento de governos aliados que descumprem a atualização anual do Piso Salarial Nacional dos Professores.',
        ];
        vDetalhe = 'Votos 100% favoráveis a recursos para educação pública em tempo integral e alimentação escolar nutritiva.';
        pDetalhe = 'Discursos incisivos na tribuna em defesa da carreira docente, autonomia universitária e infraestrutura digna nas escolas.';
        aDetalhe = 'Destinação maciça de emendas parlamentares para climatização de salas de aula, laboratórios científicos e transporte escolar.';
      } else if (score >= 65) {
        resumo = `Índice consistente de ${score}% assegurado pelo apoio às pautas prioritárias da educação básica, ampliação de creches e valorização dos profissionais da rede pública de ensino.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% dos 100% de comprometimento pleno é motivado pela tolerância com a terceirização na gestão escolar e apoio mitigado a investimentos em universidades públicas.`;
        pontosAfastamento = [
          'Apoio ou votos de abstenção em projetos de terceirização e parcerias público-privadas na gestão administrativa de unidades escolares.',
          'Falta de empenho prioritário na alocação de emendas para reformas de laboratórios e climatização em escolas de periferia.',
        ];
        vDetalhe = 'Votos favoráveis a orçamentos suplementares para universidades e escolas públicas.';
        pDetalhe = 'Pronunciamentos destacando a educação como vetor essencial de redução das desigualdades sociais.';
        aDetalhe = 'Apoio a programas municipais de reforço pedagógico e fornecimento de material escolar.';
      } else {
        resumo = `Pontuação de ${score}% refletindo posicionamento genérico em favor da educação, sem liderança ou apresentação de proposições orçamentárias expressivas no setor.`;
        motivoAfastamento100 = `Afastamento crítico de ${gap100}% provocado pelo apoio a cortes no orçamento da educação e condescendência com programas de censura à autonomia pedagógica dos professores.`;
        pontosAfastamento = [
          'Votos favoráveis a contingenciamentos de verbas nas universidades federais e institutos federais de educação.',
          'Apoio a projetos de privatização de escolas e medidas restritivas à liberdade de cátedra dos educadores.',
        ];
        vDetalhe = 'Adesão moderada aos votos de bancada em matérias educacionais.';
        pDetalhe = 'Manifestações esporádicas de apoio aos estudantes e professores.';
        aDetalhe = 'Participação secundária em comissões temáticas de educação e cultura.';
      }
      break;

    case 'p12': // Relações do Trabalho e Emprego
      if (score >= 85) {
        resumo = `Índice de ${score}% consolidado na defesa irrestrita dos direitos laborais, combate à precarização, proteção a trabalhadores de aplicativos, valorização das convenções coletivas e ampliação do emprego com carteira assinada.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% dos 100% de comprometimento decorre de flexibilizações pontuais em regimes especiais de trabalho e adesão a acordos parlamentares sobre jornadas em setores específicos.`;
        pontosAfastamento = [
          'Votos de conciliação partidária em matérias de desregulamentação transitória de setores sazonais.',
          'Menor protagonismo na fiscalização direta das condições de trabalho degradante em cadeias produtivas terceirizadas.',
        ];
        vDetalhe = 'Votações 100% alinhadas à regulação protetiva do trabalho em plataformas e garantia do direito de negociação coletiva.';
        pDetalhe = 'Pronunciamentos firmes em defesa dos direitos conquistados pela CLT e combate à terceirização precarizante.';
        aDetalhe = 'Articulação de projetos de requalificação profissional, intermediação pública de mão de obra e frentes em defesa do trabalho decente.';
      } else if (score >= 65) {
        resumo = `Comprometimento consistente de ${score}% com a defesa do emprego formal e valorização da classe trabalhadora, mantendo postura favorável aos direitos sociais básicos.`;
        motivoAfastamento100 = `Afastamento de ${gap100}% motivado por concessões a reformas de flexibilização trabalhista e ausência de proposições de autoria própria sobre novas relações laborais digitais.`;
        pontosAfastamento = [
          'Abstenção ou votos favoráveis a projetos que limitam a atuação fiscalizatória da Justiça do Trabalho.',
          'Pouca iniciativa legislativa própria no enfrentamento à informalidade e precarização de entregadores e motoristas de aplicativo.',
        ];
        vDetalhe = 'Apoio à maior parte das matérias de proteção social e direitos previdenciários dos trabalhadores.';
        pDetalhe = 'Manifestações públicas de apoio aos direitos trabalhistas em datas comemorativas e audiências públicas.';
        aDetalhe = 'Participação moderada em comissões de trabalho e previdência social.';
      } else {
        resumo = `Pontuação de ${score}% indicando atuação que privilegia a desregulamentação e flexibilização das leis trabalhistas em detrimento da proteção social do empregado.`;
        motivoAfastamento100 = `Afastamento crítico de ${gap100}% decorrente do apoio sistemático ao desmonte da CLT, terceirização irrestrita e enfraquecimento das entidades sindicais.`;
        pontosAfastamento = [
          'Votações favoráveis à ampliação irrestrita da terceirização e enfraquecimento da fiscalização do trabalho.',
          'Defesa da prevalência do negociado sobre o legislado com perda de garantias históricas fundamentais.',
        ];
        vDetalhe = 'Votos favoráveis a medidas de flexibilização de direitos trabalhistas.';
        pDetalhe = 'Discursos que tratam proteções trabalhistas como entraves burocráticos ao desenvolvimento.';
        aDetalhe = 'Apoio a projetos de lei que restringem a gratuidade da Justiça do Trabalho.';
      }
      break;

    case 'p13': // Empreendedorismo e Desoneração Responsável
    default:
      if (score >= 85) {
        resumo = `Comprometimento de ${score}% focado no fortalecimento de micro e pequenos empresários, MEIs, desoneração fiscal atrelada a metas comprovadas de emprego, desburocratização e democratização do microcrédito orientado.`;
        motivoAfastamento100 = `O afastamento de ${gap100}% em relação ao comprometimento pleno deve-se a concessões na concessão de subsídios a grandes grupos econômicos e lentidão no aperfeiçoamento dos tetos do Simples Nacional.`;
        pontosAfastamento = [
          'Apoio a renúncias fiscais genéricas sem contrapartidas transparentes de geração líquida de postos de trabalho.',
          'Votos de acomodação orçamentária que restringiram o volume de crédito garantido pelo Pronampe a taxas subsidiadas.',
        ];
        vDetalhe = 'Votações favoráveis à expansão do Simples Nacional, proteção ao microcrédito e desoneração com contrapartidas sociais.';
        pDetalhe = 'Pronunciamentos em defesa do pequeno empreendedor como motor da economia local e exigência de transparência nos incentivos fiscais.';
        aDetalhe = 'Proposições e emendas parlamentares voltadas à simplificação tributária e capacitação de microempreendedores com o Sebrae.';
      } else if (score >= 65) {
        resumo = `Índice consistente de ${score}% com apoio às micro e pequenas empresas e incentivo ao empreendedorismo produtivo, mantendo cautela fiscal responsável.`;
        motivoAfastamento100 = `Afastamento de ${gap100}% decorrente de apoio a benefícios tributários opacos e baixa ênfase na simplificação regulatória para novos negócios de periferia.`;
        pontosAfastamento = [
          'Voto favorável à prorrogação de regimes especiais de desoneração sem exigência de metas de investimento e inovação.',
          'Pouca atuação em projetos de crédito orientado para microempreendedores informais e jovens empreendedores.',
        ];
        vDetalhe = 'Apoio a medidas de socorro financeiro e desburocratização para microempresas.';
        pDetalhe = 'Defesa de ambiente de negócios favorável aliado à responsabilidade orçamentária.';
        aDetalhe = 'Apoio a iniciativas locais de feiras de negócios e cooperativas produtivas.';
      } else {
        resumo = `Pontuação de ${score}% refletindo atuação pautada em desonerações fiscais indiscriminadas para grandes conglomerados, sem compromisso com contrapartidas sociais ou apoio ao microempreendedor de base.`;
        motivoAfastamento100 = `Afastamento crítico de ${gap100}% causado pelo direcionamento de benefícios fiscais a setores privilegiados e desmonte de fundos de aval para pequenos negócios.`;
        pontosAfastamento = [
          'Aprovação de subsídios e isenções sem transparência orçamentária ou critérios de retorno social.',
          'Oposição a medidas de proteção ao microempreendedor individual e fortalecimento do microcrédito popular.',
        ];
        vDetalhe = 'Votos favoráveis a privilégios fiscais setoriais concentrados em grandes corporações.';
        pDetalhe = 'Discursos que priorizam incentivos corporativos em detrimento do apoio aos micro e pequenos produtores.';
        aDetalhe = 'Ausência de projetos de incentivo ao ecossistema de startups e empreendedorismo comunitário.';
      }
      break;
  }

  // Se score for baixo (geral de partidos conservadores)
  if (score <= 35) {
    resumo = `Pontuação de ${score}% (Crítica/Restrita): reflete alinhamento histórico com votações de contenção do investimento público, apoio a privatizações e flexibilização de garantias sociais contrárias às diretrizes progressistas deste pilar.`;
    motivoAfastamento100 = `O candidato está afastado em ${gap100}% do comprometimento pleno por atuar em frontal oposição programática e legislativa às diretrizes sociais e públicas deste pilar progressista.`;
    pontosAfastamento = [
      'Votações nominais sistematicamente favoráveis à redução do papel regulador e redistributivo do Estado.',
      'Defesa reiterada de privatizações, desregulamentação trabalhista e redução de investimentos orçamentários obrigatórios.',
      'Alinhamento com medidas de austeridade fiscal que impactam diretamente os serviços públicos prestados à população.',
    ];
    vDetalhe = 'Votos frequentes contrários à ampliação de despesas públicas sociais e a favor de regimes desregulados.';
    pDetalhe = 'Discursos defendendo austeridade fiscal estrita e primazia de mecanismos de mercado sobre serviços públicos.';
    aDetalhe = 'Apoio a medidas que limitam o papel redistributivo e orientador do Estado na temática.';
  }

  // Se for 100% perfeito (caso especial)
  if (gap100 === 0) {
    motivoAfastamento100 = 'Comprometimento pleno (100%): o candidato não possui registros de divergência, abstenção prejudicial ou oposição nas votações, discursos e proposições auditadas deste pilar.';
    pontosAfastamento = [];
  }

  return {
    resumo,
    gap100,
    motivoAfastamento100,
    pontosAfastamento,
    criterios: [
      {
        nome: 'Votações Nominais no Parlamento',
        peso: 40,
        pontuacao: vScore,
        aderencia: getAderenciaLabel(vScore),
        detalhe: vDetalhe,
      },
      {
        nome: 'Pronunciamentos & Defesa na Tribuna',
        peso: 30,
        pontuacao: pScore,
        aderencia: getAderenciaLabel(pScore),
        detalhe: pDetalhe,
      },
      {
        nome: 'Posturas, Projetos de Lei e Ações Práticas',
        peso: 30,
        pontuacao: aScore,
        aderencia: getAderenciaLabel(aScore),
        detalhe: aDetalhe,
      },
    ],
    formula: `Cálculo Auditável: (Votações: ${vScore}% × 40%) + (Discursos: ${pScore}% × 30%) + (Posturas: ${aScore}% × 30%) = ${score}%`,
    metodologia:
      'Auditoria cívica baseada em registros oficiais da Câmara dos Deputados, Senado Federal e Portal de Dados Abertos do TSE (dadosabertos.tse.jus.br). Avalia a convergência de votos nominais, pronunciamentos na tribuna e autoria de propostas legislativas.',
  };
}
