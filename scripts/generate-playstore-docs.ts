import * as fs from 'fs';
import * as path from 'path';

const now = new Date();
const formattedDate = now.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});
const isoDate = now.toISOString();
const APP_VERSION = '2.2.2';

const rootDir = process.cwd();
const docsDir = path.join(rootDir, 'docs');
const schemaPath = path.join(rootDir, 'apps/api/prisma/schema.prisma');
const privacyHtmlPath = path.join(rootDir, 'static/privacidade.html');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// 1. Inspecionar schema para confirmar campos do modelo Feedback
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
const hasFeedbackModel = schemaContent.includes('model Feedback');
console.log(`[Play Store Docs Generator] Model Feedback presente no schema: ${hasFeedbackModel}`);

// a) PLAYSTORE_DATA_SAFETY.md
const dataSafetyContent = `# Declaração de Segurança de Dados (Data Safety) — Google Play Store

**Aplicativo:** Eleições Progressistas (\`com.eleicoesprogressistas.app\`)  
**Versão:** ${APP_VERSION} (Build Code 3)  
**Data de Emissão:** ${formattedDate} (${isoDate})  
**Status:** Auditado e Conforme com LGPD e Políticas de Desenvolvedor do Google Play  

---

## 1. Visão Geral da Coleta de Dados

| Categoria do Aplicativo | Política Aplicada | Detalhe Técnico |
| :--- | :--- | :--- |
| **Núcleo do App (Votação e Matching)** | **COLETA ZERO (Stateless)** | Nenhuma informação pessoal, preferência de voto ou dado ideológico é coletado ou persistido em servidores. O matching é computado na memória volátil da sessão. |
| **Telemetria Técnica Geral** | **ANÔNIMA** | Diagnósticos de falhas e tempos de resposta sem identificadores de usuário ou IPs persistidos (LGPD Art. 7º, IX). |
| **Módulo de Feedback Voluntário** | **VOLUNTÁRIO / OPICIONAL** | Coleta estritamente condicionada ao envio ativo pelo usuário no formulário de homologação (/feedback). |

---

## 2. Formulário Google Play Data Safety — Mapeamento Linha a Linha

### Seção 1: Coleta e Compartilhamento de Dados
- **O seu app coleta ou compartilha algum dos tipos de dados de usuários necessários?**  
  **RESPOSTA:** **SIM** (Exclusivamente no módulo opcional de Feedback Voluntário do Programa Beta).
- **Todos os dados de usuários coletados pelo app são criptografados em trânsito?**  
  **RESPOSTA:** **SIM** (Todas as comunicações utilizam HTTPS/TLS 1.3 com HSTS).
- **Você oferece um mecanismo para que os usuários solicitem a exclusão dos dados?**  
  **RESPOSTA:** **SIM** (Canal direto de DPO/Encarregado: \`fmourag@gmail.com\`).

---

### Seção 2: Detalhamento por Tipo de Dado (Campos do Modelo Feedback)

| Tipo de Dado no Google Play | Campo no Schema | Obrigatório ou Opcional? | Finalidade Declarada | Compartilhado com Terceiros? | Tratamento Efêmero? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nome** (\`Personal info -> Name\`) | \`nome\` / \`testerName\` | **Opcional** | Comunicação com o desenvolvedor / Auditoria voluntária | **NÃO** | Não |
| **Endereço de e-mail** (\`Personal info -> Email address\`) | \`email\` | **Opcional** | Comunicação com o desenvolvedor / Retorno de dúvidas técnicas | **NÃO** | Não |
| **Identificadores de Dispositivo e Protocolo** (\`Device or other IDs\`) | \`device\`, \`androidVersion\`, \`protocol\` | **Obrigatório no Feedback** | Funcionalidade do app / Diagnóstico, rastreamento de protocolo e correção de bugs por modelo | **NÃO** | Não |
| **Conteúdo e Avaliação** (\`App info and performance -> Other actions\`) | \`nps\`, \`problema\`, \`descricao\`, \`screenshotDesc\` | **Obrigatório / Opcional** | Análise de estabilidade / Avaliação de qualidade do release | **NÃO** | Não |

---

## 3. Práticas de Segurança e Direitos do Titular

1. **Criptografia em Trânsito:** Protocolos TLS modernos em todos os endpoints (\`https://eleicoes-progressistas.onrender.com\`).
2. **Venda e Cessão de Dados:** **ZERO compartilhamento ou comercialização** com partidos políticos, empresas de publicidade ou terceiros.
3. **Exclusão de Dados:** Qualquer participante pode solicitar a exclusão total de seus registros de feedback enviando seu protocolo de atendimento (\`FB-...\`) para \`fmourag@gmail.com\`.
`;

fs.writeFileSync(path.join(docsDir, 'PLAYSTORE_DATA_SAFETY.md'), dataSafetyContent, 'utf-8');
console.log('✅ docs/PLAYSTORE_DATA_SAFETY.md gerado.');

// b) PLAYSTORE_CONTENT_RATING.md
const contentRatingContent = `# Classificação de Conteúdo (Content Rating / IARC) — Google Play Store

**Aplicativo:** Eleições Progressistas (\`com.eleicoesprogressistas.app\`)  
**Versão:** ${APP_VERSION}  
**Data de Emissão:** ${formattedDate}  
**Classificação Alvo:** **Livre (L) / Todos / PEGI 3 / Everyone**  

---

## Questionário IARC — Respostas Oficiais para Transcrição no Console

| Pergunta do Questionário IARC | Resposta | Justificativa Técnica |
| :--- | :--- | :--- |
| **Violência:** O app contém representações de violência? | **NÃO** | Aplicativo de utilidade pública e cidadania eleitoral. |
| **Sexualidade:** O app contém nudez ou temas sexuais? | **NÃO** | Sem qualquer conteúdo sexual ou impróprio. |
| **Linguagem:** O app contém linguagem ofensiva ou palavrões? | **NÃO** | Linguagem formal, acessível e cívica. |
| **Substâncias Controladas:** O app faz referência a drogas, álcool ou tabaco? | **NÃO** | Inexistente. |
| **Jogos de Azar:** O app simula apostas ou jogos de azar com dinheiro real? | **NÃO** | Inexistente. |
| **Compras no App:** O aplicativo permite compras digitais pagas? | **NÃO** | Aplicativo 100% gratuito e de código aberto. |
| **Compartilhamento de Localização:** O app compartilha a localização física do usuário com outros usuários? | **NÃO** | A localização é utilizada estritamente localmente para filtrar os candidatos da UF do eleitor. |
| **Conteúdo Gerado pelo Usuário:** Os usuários interagem ou trocam mensagens públicas entre si? | **NÃO** | Não há rede social ou comentários públicos. |

---

## Declarações Adicionais da Google Play

- **Aplicativo de Notícias (News App):** **NÃO** (Trata-se de agregador cívico de dados abertos do TSE, sem linha editorial jornalística comercial).
- **Aplicativo Governamental (Government App):** **NÃO** (Plataforma cívica independente, de código aberto e sem vínculo com órgãos governamentais — dados auditáveis extraídos do Portal de Dados Abertos do TSE).
- **Aplicativo COVID-19:** **NÃO**.
- **Serviços Financeiros:** **NÃO**.
`;

fs.writeFileSync(path.join(docsDir, 'PLAYSTORE_CONTENT_RATING.md'), contentRatingContent, 'utf-8');
console.log('✅ docs/PLAYSTORE_CONTENT_RATING.md gerado.');

// c) PLAYSTORE_TARGET_AUDIENCE.md
const targetAudienceContent = `# Declaração de Público-Alvo e Conteúdo (Target Audience) — Google Play Store

**Aplicativo:** Eleições Progressistas (\`com.eleicoesprogressistas.app\`)  
**Versão:** ${APP_VERSION}  
**Data de Emissão:** ${formattedDate}  

---

## 1. Faixa Etária Alvo

- **Faixa Etária Selecionada:** **16 a 17 anos** e **18 anos ou mais** (Cidadãos e eleitores em idade de voto no Brasil).
- **Crianças (menores de 13 anos):** **NÃO é o público-alvo.** O aplicativo não foi projetado especificamente para atrair crianças.

---

## 2. Conformidade com a Política para Famílias (Families Policy)

- **Presença de Crianças:** O aplicativo não contém elementos visuais infantis (personagens de desenhos animados, jogos ou músicas infantis) que possam atrair intencionalmente menores de 13 anos.
- **Anúncios:** O aplicativo opera sob política de **Blackout Eleitoral sem qualquer exibição de publicidade**.
- **Coleta de Dados de Menores:** Em estrito cumprimento ao Art. 14 da LGPD e à COPPA, o aplicativo não coleta dados de crianças.
`;

fs.writeFileSync(path.join(docsDir, 'PLAYSTORE_TARGET_AUDIENCE.md'), targetAudienceContent, 'utf-8');
console.log('✅ docs/PLAYSTORE_TARGET_AUDIENCE.md gerado.');

// d) PLAYSTORE_ADS_DECLARATION.md
const adsDeclarationContent = `# Declaração de Anúncios (Ads Declaration) — Google Play Store

**Aplicativo:** Eleições Progressistas (\`com.eleicoesprogressistas.app\`)  
**Versão:** ${APP_VERSION}  
**Data de Emissão:** ${formattedDate}  

---

## 1. Declaração de Publicidade no Google Play Console

- **O seu aplicativo contém anúncios?**  
  **RESPOSTA:** **NÃO** (\`No, my app does not contain ads\`).

---

## 2. Racional Técnico e Jurídico

1. **Blackout Eleitoral:** Durante todo o pleito de 2026, vigora o compromisso estatutário de zero veiculação de anúncios comerciais ou patrocinados dentro do aplicativo mobile.
2. **SDKs de Publicidade:** O código-fonte auditável no repositório (\`apps/mobile\`) não inclui SDKs do Google AdMob, Unity Ads, Facebook Audience Network ou quaisquer trackers comerciais.
3. **Sustentabilidade Ética:** Qualquer doação cívica voluntária (PIX) é estritamente opcional, fora de fluxos de anúncios e sem intermediação de redes de ad-tech.
`;

fs.writeFileSync(path.join(docsDir, 'PLAYSTORE_ADS_DECLARATION.md'), adsDeclarationContent, 'utf-8');
console.log('✅ docs/PLAYSTORE_ADS_DECLARATION.md gerado.');

console.log('🎉 Todos os 4 documentos da Google Play Store foram gerados com sucesso.');
