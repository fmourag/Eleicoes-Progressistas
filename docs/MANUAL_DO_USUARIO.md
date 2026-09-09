---
title: "Manual do Usuário"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Manual do Usuário

> **Resumo:** Guia prático de utilização do aplicativo, descrevendo a jornada do usuário, funcionalidade de Consulta por Prioridades, Raio-X dos candidatos, Cola Eleitoral e o Observatório de Mandatos pós-eleição.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Prioridades (Stateless), Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Observatório de Mandatos, Anúncios Éticos (Ads), Sustentabilidade PIX (Finance), API Pública Tiered (Public-API), Relatórios B2B (Reports)

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Conteúdo específico

### 1. O que é o Eleições Progressistas?
O **Eleições Progressistas** é uma plataforma cívica gratuita, auditável e anônima desenvolvida sob o lema **"Cheque o passado. Escolha o futuro."**, criada para conectar o cidadão às candidaturas das Eleições Gerais 2026 que defendem os 13 pilares estruturantes do campo progressista.

#### 1.1 O que é o Progressismo?
> "O progressismo é um movimento político que se refere a um conjunto de doutrinas filosóficas, sociais e econômicas baseado na ideia de que o progresso, entendido como avanço científico, tecnológico, econômico e comunitário, é vital para o aperfeiçoamento da condição humana. Essa ideia de progresso integra o ideário iluminista e tem, como corolário, a crença de que as sociedades podem passar da barbárie à civilização, mediante o fortalecimento das bases do conhecimento empírico." — *Wikipédia*

#### 1.2 Critério de Filtro Partidário & Disclaimer Ideológico-Empírico
Com base na definição fornecida, que estabelece o progressismo como um movimento fundamentado no avanço científico, tecnológico, econômico e comunitário, integrado ao ideário iluminista (razão, secularismo, direitos universais) e no fortalecimento do conhecimento empírico como motor da civilização, podemos aplicar esse conceito como um filtro rigoroso para analisar o espectro partidário brasileiro.

Para que um partido político seja atingido por este filtro, sua doutrina central ou sua ala hegemônica deve contradizer ativamente esses pilares, seja por meio da rejeição do conhecimento empírico, da subordinação das políticas públicas a dogmas não racionais ou da adoção de retóricas anti-iluministas e negacionistas, comportamento real de votação em plenário e comissões (votações nominais, orientação de bancada e o padrão agregado de seus membros), a análise torna-se mais rigorosa e baseada em evidências empíricas da ação parlamentar.

Nesse cenário, o critério de exclusão passa a ser: **votação sistemática da bancada (ou de sua maioria esmagadora) contra consensos científicos, em favor da desregulamentação que ignora dados empíricos de impacto, ou contra princípios iluministas de laicidade e racionalidade na educação e saúde pública.**

##### Ressalvas Analíticas Importantes
O filtro aplicado aqui é estritamente doutrinário, baseado na definição filosófica de Progressismo constante no aplicativo.

Com base no histórico de votações nominais na Câmara dos Deputados e no Senado (como as relacionadas a agrotóxicos, licenciamento ambiental, mineração em terras indígenas e pautas de laicidade), os seguintes partidos se enquadram na seleção por este filtro:

1. **Partidos com padrão sistemático de votação contra salvaguardas científicas e empíricas**
   Estes partidos orientaram suas bancadas, ou tiveram a maioria esmagadora de seus membros votando, a favor de projetos que enfraquecem a avaliação técnica e empírica de impactos, substituindo-a por autodeclarações ou interesses setoriais sem base científica:
   - **PL (Partido Liberal):** Apresenta um dos registros mais consistentes de votação contrária a pautas baseadas em evidências empíricas. Sua bancada votou massivamente a favor do chamado "PL do Veneno" (facilitação de agrotóxicos contra pareceres da ANVISA/IBAMA), do "PL da Devastação" (PL 2159/2021, que enfraquece o licenciamento ambiental e dispensa estudos de impacto), do "PL da Grilagem" (regularização fundiária sem vistoria técnica do Incra) e do "Marco Temporal" (ignorando dados antropológicos e históricos sobre ocupação indígena). Esse padrão demonstra uma subordinação da política pública a dogmas ideológicos ou interesses econômicos imediatos, em detrimento do "conhecimento empírico" e do "progresso comunitário" mencionados na definição.
   - **Republicanos:** Além de votar sistematicamente a favor da desregulamentação ambiental e sanitária que ignora critérios técnicos, é o partido que mais frequentemente lidera ou apoia votações em comissões que buscam inserir dogmas religiosos em políticas públicas de educação e saúde, ferindo diretamente o "ideário iluminista" de secularismo e racionalidade.
   - **PP (Progressistas):** Apesar do nome, seu comportamento agregado em votações nominais é historicamente alinhado ao enfraquecimento de agências reguladoras baseadas em ciência. Votou a favor do "PL do Veneno", do "PL da Devastação" e de medidas que flexibilizam a proteção de áreas de preservação permanente (APPs) sem base em dados ecológicos.
   - **União Brasil, Patriotas e Avante:** Seguem um padrão de alinhamento recorrente em votações que dispensam estudos de impacto empírico. O Avante e o Patriotas, por exemplo, votaram a favor da urgência e do mérito de projetos como a mineração em terras indígenas (PL 191/2020), ignorando evidências científicas e antropológicas sobre o impacto comunitário e ambiental.

2. **Partidos com contradições internas severas (Zona de Alerta)**
   Alguns partidos possuem uma retórica de "progresso", mas suas votações revelam uma contradição entre o discurso de modernidade e a prática antiempírica:
   - **MDB e Podemos:** Embora abriguem parlamentares técnicos, suas orientações de bancada em votações cruciais (como o "PL da Devastação" e o "Marco Temporal") frequentemente oscilam ou aprovam medidas que enfraquecem a regulação baseada em evidências, priorizando a governabilidade ou interesses regionais em detrimento do rigor científico.
   - **PSD (Partido Social Democrático):** Embora abrigue lideranças de perfil institucionalista com atuação destacada em defesa da ciência e da vacinação (como na CPI da Pandemia), o comportamento agregado e hegemônico de suas bancadas na Câmara e no Senado em votações estruturantes — como o Marco Temporal, o PL do Licenciamento Ambiental e o PL dos Agrotóxicos — alinha-se reiteradamente à supressão de salvaguardas técnicas de órgãos reguladores (ANVISA, IBAMA). Seu modelo pragmático e fisiológico de governabilidade colide com a primazia contínua do método empírico.
   - **NOVO:** Defende o "progresso econômico e tecnológico", mas votou a favor da desregulamentação ambiental e sanitária (como o "PL do Veneno"), ignorando que o verdadeiro progresso tecnológico, sob a ótica iluminista, não pode se dar pela supressão do conhecimento empírico sobre danos à condição humana e ao meio ambiente.

##### Partidos que NÃO são atingidos por este filtro (Contraste)
Para validar o filtro, é útil observar quais partidos mantêm um padrão de votação agregado alinhado à defesa do conhecimento empírico e do ideário iluminista. Em votações nominais sobre os mesmos projetos citados acima, as bancadas do **PT, PSOL, PCdoB, PV, Rede** e, na maioria das vezes, **PDT e PSB**, votaram sistematicamente contra a flexibilização de critérios científicos, defendendo a manutenção de agências reguladoras (ANVISA, IBAMA, Incra) e a laicidade do Estado.

##### Resumo da Aplicação do Filtro Comportamental
Ao aplicar a lente do progressismo iluminista e empírico às ações legislativas reais:
1. Exclui-se qualquer partido cuja maioria de seus membros vote repetidamente para substituir laudos técnicos e dados empíricos por autodeclarações, dogmas religiosos ou desregulamentação cega.
2. Exclui-se partidos que usam a máquina legislativa para obstruir o avanço comunitário (ex.: direitos indígenas, proteção climática) quando este avanço é respaldado por consenso científico.
3. A exclusão não se baseia em "ser de direita ou esquerda", mas na fidelidade ao método empírico e à razão iluminista como base para a melhoria da condição humana. Partidos que falham consistentemente nesse teste comportamental, independentemente de sua autodeclaração ideológica, são filtrados.

O aplicativo opera sob a chancela **PRIVACIDADE POR DESIGN • Zero Cadastro**:
- **Zero Questionários / Zero Coleta:** Não há testes ideológicos nem coleta de posicionamentos do eleitor.
- **Consulta por Prioridades:** Seleção em sessão de até 3 prioridades temáticas em memória volátil, sem persistência.
- **Identidade Cívica Oficial:** Emblema cívico com a urna estelar e checkmark Ficha Limpa, badges `ELEIÇÕES 2026` e `FICHA LIMPA`.
- **Modo Claro Nativo:** Inicialização direta em tema claro, com alternância de tema no cabeçalho.
- **Chapas Majoritárias Completas:** Apresentação clara do titular e do(a) Vice nas eleições para Governador(a) e Presidente da República.
- **Observatório Pós-Eleição:** Acompanhamento contínuo dos eleitos com base nos dados abertos do Congresso Nacional.

### 2. Fluxo de Uso
**Jornada do Usuário:** `Entrada → Localização → Prioridades opcionais → Matching → Raio-X → Cola → Observatório pós-eleição`

#### Passo 1 — Localização e Acesso Nacional
```
1. Abra o app
2. Defina sua localização:
   • Toque em "📍 [Estado/Cidade]" para abrir o modal e escolher qualquer um dos 27 estados e municípios
   • Ou toque em "🇧🇷 Brasil" para alternar para a visualização nacional integrada
   • Ou autorize a geolocalização via GPS
3. A circunscrição oficial é respeitada: Presidente tem abrangência nacional, e Governador, Senador, Deputado Federal e Estadual são apresentados por UF.
```

#### Passo 2 — Consulta por Prioridades (13 Pilares — Opcional e em Sessão)
```
1. Visualize os 13 pilares estruturantes do campo progressista:
   • Bem-Estar & Assistência Social
   • Justiça Social & Direitos
   • Desenvolvimento Sustentável & Transição Ecológica
   • Soberania & Valores Nacionais
   • Reindustrialização & Tecnologia
   • Distribuição Justa de Renda
   • Proteção do Vulnerável
   • Governo Eficiente & Transparência
   • Saúde Pública Universal (SUS)
   • Segurança Pública Cidadã
   • Educação Pública & Emancipatória
   • Relações do Trabalho e Emprego
   • Empreendedorismo e Desoneração Responsável
2. Selecione até 3 pilares prioritários para sua consulta (ou consulte sem selecionar nenhum pilar).
3. A seleção reside exclusivamente na memória volátil da sessão do usuário (useState). Nenhuma opinião ou resposta política é coletada ou gravada em banco.
```
**Badge de Privacidade:** `🔒 Consulta sem cadastro e sem coleta de opiniões. Suas preferências não são salvas em nenhum servidor.`

#### Passo 3 — Matching e Afinidade com Candidatos
```
1. Toque em "Buscar Candidatos" ou "Ver Matching"
2. Os pilares selecionados recebem peso 3.0x no ranking de afinidade; os demais pilares recebem peso 1.0x.
3. Se nenhuma prioridade for marcada, o ranking adota média equilibrada de todos os 13 pilares.
4. Bônus de Ficha Limpa (+5 pontos, teto 100).
```
Candidatos de partidos excluídos pelo filtro comportamental empírico e iluminista (como PL, Republicanos, PP, União Brasil, Avante, Patriotas, PRD, MDB, PSD, Podemos, NOVO, PSDB e Missão) são automaticamente excluídos das recomendações de afinidade progressista devido a padrões reiterados de votação contrários a salvaguardas científicas, sanitárias e ambientais ou por contradições antiempíricas severas.

#### Passo 4 — Mecanismo de Busca e Lista de Candidatos
```
1. Utilize o cabeçalho fixo no topo da tela de Candidatos:
   • Digite no campo "🔍 Buscar por nome, número, partido ou cargo..." para filtragem instantânea
   • Navegação Lateral de Cargos: A barra de filtros ("Todos", "Presidente", "Governador", "Senador", "Dep. Federal", "Dep. Estadual") possui rolagem lateral horizontal suave:
     - Botões de navegação lateral (setas "‹" e "›") flutuantes para deslizar rapidamente
     - Suporte nativo à roda do mouse (scroll horizontal via wheel) no desktop
     - Gesto de arrastar/deslizar com o dedo (touch swipe) no mobile
     - Garante que "Deputado Estadual" e todos os cargos fiquem 100% visíveis e acessíveis em qualquer resolução
   • Circunscrição Nacional: Candidatos à Presidência possuem abrangência nacional e são exibidos em qualquer estado selecionado (ex: RJ, SP, BA) e na visualização nacional integrada
   • Utilize o atalho "🏛️ Buscar no Portal de Dados Abertos do TSE (Fonte Confiável) ↗" para auditoria direta na base oficial
2. Fotos Padronizadas: Todos os candidatos exibem estritamente sua foto oficial de campanha (TSE) ou o retrato institucional oficial do parlamento (Câmara e Senado) sozinho(a), sem fotos em comícios ou multidões.
```

#### Passo 5 — Raio-X do Candidato e Card Expandido
| Informação | Descrição |
|-----------|-----------|
| Ficha Limpa | Status verificado no TSE e tribunais superiores |
| Chapa e Vice Vinculado | Identificação explícita do(a) Vice vinculado(a) para candidaturas ao Governo do Estado e à Presidência |
| Retrato Oficial Sozinho(a) | Foto oficial de campanha na urna ou retrato oficial institucional neutro |
| Plano Oficial de Governo | Documento registrado no TSE para cargos executivos com link para o PDF |
| Tradução de Propostas | Propostas de governo traduzidas e simplificadas por inteligência artificial (LLM Batch Noturno) |
| Justificativa de Comprometimento | No Card Expandido de cada pilar, detalhamento da memória de cálculo auditável: `(Votações: 40%) + (Discursos: 30%) + (Posturas: 30%)` |
| Gap Analysis (Afastamento de 100%) | Explicação detalhada do porquê o candidato não atingiu nota máxima no pilar e quais votos/posições causaram o distanciamento |
| Pergunte à Proposta de Mandato | Busca semântica inteligente client-side (100% in-memory) para pesquisar qualquer tema (ex: saneamento, creches, tarifa zero, impostos), com ranqueamento por relevância, seleção automática e realce em amarelo de trechos nas diretrizes e metas (Prejuízo Zero e Coleta Zero) |
| Interesse Nacional | Votos contrários a desonerações fiscais bilionárias para multinacionais sem contrapartidas trabalhistas rígidas são reconhecidos como atitude de compromisso patriótico e não penalizam a nota |
| Auditoria TSE | Botão direto para consultar o candidato no Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`) |

#### Passo 6 — Gerar Cola Eleitoral (PDF, Impressão e Compartilhamento)
```
1. Escolha seus candidatos:
   • Nos cards de candidatos, clique no botão "📝 Adicionar à Cola" (ou remova com "✓ Na Cola")
   • Ou acerte sua seleção cargo a cargo: Deputado Federal, Deputado Estadual, Senador (1º e 2º votos), Governador e Presidente
2. Acesse a barra inferior ou a aba "📝 Minha Cola":
   • Veja os cargos ordenados rigorosamente na sequência da urna eletrônica do TSE (Resolução TSE nº 23.736/2024)
   • Visualize fotos dos candidatos, partidos e os números em caixas grandes de dígitos idênticas à urna
3. Exporte e leve no dia da eleição:
   • 📄 Visualizar / Baixar PDF: gera documento PDF de alta definição formatado para impressão em meia folha A4
   • 🖨️ Imprimir: dispara a impressão do navegador ou do smartphone
   • 📲 WhatsApp: compartilha o resumo com um clique no aplicativo de mensagens
   • ✉️ E-mail: envia a colinha formatada para o endereço desejado
```
> **Dica Legal:** Segundo as normas do TSE, o uso de aparelhos celulares na cabine de votação é proibido. Levar a **cola eleitoral impressa em papel** é expressamente permitido e recomendado pela Justiça Eleitoral para agilizar a votação!

#### Passo 7 — Observatório de Mandatos & Promessômetro (Pós-Eleição)
```
1. Acesse o menu "🔭 Observatório" (na tela inicial ou no perfil).
2. O aplicativo lê os candidatos eleitos da sua cola eleitoral salva localmente.
3. Seção 1 — Alertas de Divergência:
   • O app consulta em tempo real (100% stateless) as votações nominais do Congresso Nacional.
   • Se um parlamentar eleito da sua cola votar contra uma das causas prioritárias (ex: votar NÃO em projetos pró-SUS, direitos trabalhistas ou meio ambiente), um Alerta de Divergência é emitido com link para a ata oficial da votação na Câmara ou Senado.
4. Seção 2 — Promessômetro:
   • Acompanhe o cumprimento das promessas de campanha registradas no TSE com badges de status (PROPOSTA, EM ANDAMENTO, CUMPRIDA, QUEBRADA) e links para evidências oficiais.
5. Seção 3 — Painel Geral do Congresso:
   • Indicadores agregados de fidelidade partidária e votações mais divergentes do parlamento.
```

### 3. Privacidade
| Pergunta | Resposta |
|----------|----------|
| Há coleta de opinião ou respostas políticas? | Não. O app não possui questionários nem formulários de perfilamento ideológico. As prioridades selecionadas ficam apenas na memória volátil da sessão. |
| Minha cola eleitoral é enviada para o servidor? | Não. Seus candidatos escolhidos ficam salvos exclusivamente no armazenamento local do seu dispositivo (localStorage / AsyncStorage). O servidor apenas gera o documento PDF stateless sob demanda. |
| Como o Observatório sabe quais candidatos monitorar sem me espionar? | O app mobile apenas envia os IDs públicos dos candidatos da sua cola na query de busca de alertas (`candidateIds=...`). Nenhum identificador pessoal ou histórico do eleitor é registrado no servidor. |
| Vocês sabem quem eu sou? | Não. Usamos um hash anônimo do dispositivo e o matching é 100% stateless sem login obrigatório. |
| Meus dados são vendidos? | Nunca. Somos open-source e sem fins lucrativos. |
| Posso excluir meus dados? | Sim. Como nada é persistido no servidor sobre seu perfil, basta limpar os dados locais do app. |

### 4. Perguntas Frequentes
| Pergunta | Resposta |
|----------|----------|
| O app indica em quem votar? | Não. Mostra compatibilidade com base em dados concretos. A decisão é sempre sua. |
| Funciona em todo o Brasil? | Sim. Cobre todos os 27 estados da federação nas Eleições Gerais 2026. |
| O que acontece com o app depois do dia da eleição? | O app se transforma no Observatório de Mandatos, permitindo que você fiscalize o mandato e as promessas dos candidatos eleitos durante toda a legislatura. |
| Por que partidos como PL, Republicanos, PP, União Brasil, Avante, MDB, PSD, Podemos e NOVO não aparecem no match? | Por deliberação metodológica baseada no filtro empírico e iluminista. Partidos cujas bancadas votam sistematicamente contra consensos científicos e salvaguardas técnicas (ex.: liberação irrestrita de agrotóxicos sem ANVISA/IBAMA, enfraquecimento do licenciamento ambiental e marco temporal) ou que inserem dogmas religiosos em políticas públicas são excluídos das recomendações progressistas. |
| De onde vêm as fotos dos candidatos? | Diretamente do repositório de fotos da urna do TSE (DivulgaCandContas) e dos retratos oficiais institucionais da Câmara e Senado. |
| Como auditar os dados? | Através do Portal de Dados Abertos do TSE (`https://dadosabertos.tse.jus.br/`) e dos portais de Dados Abertos da Câmara e do Senado. |

### 5. Suporte
| Canal | Contato |
|-------|---------|
| Email | suporte@norteprogressista.com.br |
| DPO | contato-dpo@norteprogressista.com.br |
| Privacidade | privacidade@norteprogressista.com.br |
| Bug Report | github.com/norte-progressista/issues |
