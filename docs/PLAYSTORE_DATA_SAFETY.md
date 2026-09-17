# Declaração de Segurança de Dados (Data Safety) — Google Play Store

**Aplicativo:** Eleições Progressistas (`com.eleicoesprogressistas.app`)  
**Versão:** 2.2.5 (Build Code 6)  
**Data de Emissão:** 17 de setembro de 2026  
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
  **RESPOSTA:** **SIM** (Canal direto de DPO/Encarregado: `fmourag@gmail.com`).

---

### Seção 2: Detalhamento por Tipo de Dado (Campos do Modelo Feedback)

| Tipo de Dado no Google Play | Campo no Schema | Obrigatório ou Opcional? | Finalidade Declarada | Compartilhado com Terceiros? | Tratamento Efêmero? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nome** (`Personal info -> Name`) | `nome` / `testerName` | **Opcional** | Comunicação com o desenvolvedor / Auditoria voluntária | **NÃO** | Não |
| **Endereço de e-mail** (`Personal info -> Email address`) | `email` | **Opcional** | Comunicação com o desenvolvedor / Retorno de dúvidas técnicas | **NÃO** | Não |
| **Identificadores de Dispositivo e Protocolo** (`Device or other IDs`) | `device`, `androidVersion`, `protocol` | **Obrigatório no Feedback** | Funcionalidade do app / Diagnóstico, rastreamento de protocolo e correção de bugs por modelo | **NÃO** | Não |
| **Conteúdo e Avaliação** (`App info and performance -> Other actions`) | `nps`, `problema`, `descricao`, `screenshotDesc` | **Obrigatório / Opcional** | Análise de estabilidade / Avaliação de qualidade do release | **NÃO** | Não |

---

## 3. Práticas de Segurança e Direitos do Titular

1. **Criptografia em Trânsito:** Protocolos TLS modernos em todos os endpoints (`https://eleicoes-progressistas.onrender.com`).
2. **Venda e Cessão de Dados:** **ZERO compartilhamento ou comercialização** com partidos políticos, empresas de publicidade ou terceiros.
3. **Exclusão de Dados:** Qualquer participante pode solicitar a exclusão total de seus registros de feedback enviando seu protocolo (`FB-...`) para `fmourag@gmail.com`.

## 4. Fonte de Dados Oficial do TSE
Os dados de candidaturas exibidos no aplicativo são originários dos canais públicos oficiais do Tribunal Superior Eleitoral (TSE — DivulgaCandContas e Dados Abertos). O aplicativo não armazena dados de eleitores e utiliza a base eleitoral pública estritamente para fins de transparência cívica e orientação de voto.


