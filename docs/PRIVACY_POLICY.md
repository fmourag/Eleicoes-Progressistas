---
title: "Política de Privacidade"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Política de Privacidade — Eleições Progressistas

**Mantenedora:** [NOME_DA_ENTIDADE_MANTENEDORA]  
**Vigência:** [DATA_DE_VIGÊNCIA]  
**Encarregado (DPO):** [EMAIL_DPO]  

> **Resumo:** Documento oficial sobre como os dados não-identificáveis são manipulados em conformidade com a LGPD e regras das App Stores, garantindo proteção por anonimização (Device Hash).

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Prioridades (Stateless), Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Watchdog (Observatório de Mandatos), Ads (Anúncios Éticos), Finance (Sustentabilidade PIX), Public-API (Tiered API), Reports (Relatórios B2B)

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Conteúdo específico

### 1. Visão Geral e Compromisso
O **Eleições Progressistas** é uma plataforma cívica independente operada sob o princípio de **Privacy by Design** (art. 46, LGPD — Lei nº 13.709/2018). Coletamos o mínimo estritamente necessário para ordenar candidatos de acordo com até 3 prioridades temáticas, sem qualquer formulário de posicionamento político e sem identificar a pessoa natural.

Esta política atende à **Apple App Store Guideline 5.1.1** e à **Google Play Data Safety Section**.

### 2. Dados que NÃO Coletamos
O app **não coleta, não solicita e não armazena**:
- Nome civil, nome social, CPF, RG ou qualquer documento
- E-mail, telefone ou identificador de conta
- Localização precisa (GPS), endereço, CEP ou IMEI
- Foto, biometria, contatos ou arquivos do dispositivo
- Respostas ou posicionamentos ideológicos (ver item 4)

### 3. Dados Coletados — Minimização
Para exibir candidatos da sua região, coletamos apenas:

| Dado | Finalidade | Base Legal (LGPD) |
|------|------------|-------------------|
| **UF** (ex: SP) | Filtrar candidatos por estado | Legítimo interesse (art. 7º, IX) |
| **Código IBGE do município** (7 dígitos, ex: 3550308) | Filtrar por município | Legítimo interesse (art. 7º, IX) |

Não há coleta de CEP. O IBGE/UF pode ser derivado localmente no dispositivo a partir de seleção do usuário, sem envio de endereço.

### 4. Destino dos Dados — Consulta por Prioridades e Processamento em Memória
O aplicativo opera no modelo **Consulta por Prioridades**, sem questionário ideológico ou formulários de opinião. O usuário pode, a seu critério, selecionar até 3 temas prioritários (`priority_pillars`).

- A seleção de prioridades existe **exclusivamente na memória da sessão do dispositivo (useState)**.
- Ao solicitar a listagem ordenada de candidatos, o app envia pontualmente `priority_pillars` (até 3 códigos) e `location` (`uf` + `ibge_code`) via `POST /api/matching/rank`.
- **Zero armazenamento de posicionamento ou respostas**: O backend calcula o ranking de candidatos em memória e retorna o resultado instantaneamente de forma stateless. Nenhuma tabela de resposta ideológica ou histórico de matching (`match_results`) é gravada ou associada ao usuário.

### 5. Mecanismo de Anonimização — Device Hash
- Ao primeiro acesso, o app gera um `device_id` aleatório (UUID v4) armazenado apenas no dispositivo.
- O matching opera de forma 100% anônima e desvinculada de cadastro.
- O `device_hash` **não** é derivado de CPF, e-mail, IMEI, IDFA/GAID ou qualquer identificador persistente do sistema operacional. É irreversível e não permite reidentificação sem acesso físico ao dispositivo.

### 6. Como Usamos os Dados
- Calcular a ordem de afinidade programática dos candidatos com base nos pilares selecionados via microsserviço de matching isolado (`PRIORITY_MULTIPLIER 3.0` para pilares prioritários).
- Retornar ranking de candidatos do seu município/estado.
- Nenhum uso para publicidade direcionada, profiling comercial, crédito ou emprego.

### 7. Compartilhamento e Venda
- **Não vendemos, alugamos ou compartilhamos** dados pessoais com terceiros.
- O microsserviço de matching processa a requisição em memória, sem log persistente de perfil do eleitor e sem repasse a terceiros.
- Dados de candidatos (nome, partido, propostas, ficha limpa) são de **domínio público** (TSE, Brasil.io, Câmara/Senado, TCU, CNJ, CEIS/CNEP, IBGE, ViaCEP) e não contêm dados pessoais do usuário.
- Operadores (ex: hospedagem Supabase/PostgreSQL, Railway/Vercel) atuam como **operadores** (art. 39, LGPD) sob contrato e sem finalidade própria.

### 8. Retenção e Eliminação
| Dado | Armazenamento | Retenção |
|------|---------------|----------|
| `priority_pillars` (seleção opcional) | Memória do app (useState) | Efêmero (descartado ao fechar) |
| Ranking de candidatos | Em trânsito (stateless) | Zero retenção no servidor |
| Seleção de candidatos na Cola | Memória local (AsyncStorage) | Até limpeza de dados pelo usuário |

Como o sistema é stateless, não há banco de dados de posicionamento ideológico mantido no servidor.

### 8.1. Cola Eleitoral e Sigilo do Voto (Resolução TSE nº 23.736/2024)
- **Armazenamento Estritamente Local:** A lista de candidatos adicionados à "Minha Cola" é salva exclusivamente no armazenamento do próprio dispositivo do usuário (`localStorage` no navegador ou `AsyncStorage` no app móvel). O servidor não recebe, não monitora e não armazena a seleção de candidatos do eleitor.
- **Geração de PDF Stateless:** Ao requisitar a geração da colinha em formato PDF (`/api/cola/pdf`), o backend atua de forma estritamente transiente (sem estado), compilando o documento em memória e retornando o arquivo diretamente para visualização ou download (`cola-eleitoral-2026.pdf`). Nenhum log ou persistência da combinação de candidatos é mantido.
- **Sigilo na Cabine Eleitoral:** O aplicativo incentiva a impressão física em papel ou o envio prévio por e-mail/WhatsApp para impressão, em rigorosa conformidade com as diretrizes da Justiça Eleitoral que proíbem a entrada com aparelhos celulares na cabine de votação.

### 9. Direitos do Titular (LGPD, arts. 18 e 19)
Como não coletamos nem tratamos dados cadastrais nem mantemos perfil de opiniões políticas do eleitor, a privacidade é integralmente garantida por desenho (*Privacy by Design*). O usuário pode, a qualquer momento:
- **Limpar dados locais** diretamente no app em **Perfil > Privacidade > Limpar Dados Locais** (remove `device_id` e candidatos salvos na cola local);
- **Revogar consentimento** desinstalando o app (efeito imediato);
- **Peticionar à ANPD** caso entenda haver violação.

Para exercer direitos fora do app: envie e-mail para **[EMAIL_DPO]** informando o `device_hash` exibido em **Perfil > Privacidade** (opcional) ou solicite exclusão ampla do dispositivo atual. Responderemos em até 15 dias.

### 10. Segurança
- TLS 1.2+ obrigatório (HSTS), criptografia em repouso no PostgreSQL/Supabase.
- `cpfHash` de candidatos com SHA-256 + `salt` rotativo; CPF nunca exposto.
- `DEVICE_HASH_SALT` e `MATCHING_API_KEY` em variáveis de ambiente, rotação periódica.
- `Row Level Security` (RLS): `candidates` leitura pública, escrita apenas `role=admin`; `match_results` sem `user_id`, acesso por `device_hash` anonimizado.

### 11. Crianças e Adolescentes
O app é de livre acesso e não direciona conteúdo a menores. Não coletamos dados de crianças/adolescentes (art. 14, LGPD).

### 12. Transferência Internacional
Hospedagem pode ocorrer fora do Brasil (ex: Supabase/AWS). Garantimos padrão de proteção compatível com a LGPD (art. 33) via cláusulas contratuais.

### 13. Google Play Data Safety — Resumo Declarado
- **Coleta de dados:** Não coleta dados pessoais do usuário.
- **Compartilhamento:** Não compartilha dados com terceiros.
- **Criptografia em trânsito:** Sim. **Exclusão solicitável:** Sim (Limpar Meus Dados).

### 14. Alterações desta Política
Alterações serão comunicadas no app com 7 dias de antecedência. A continuidade do uso após a vigência implica concordância.

### 15. Contato
Dúvidas ou solicitações: **[EMAIL_DPO]**  
Mantenedora: **[NOME_DA_ENTIDADE_MANTENEDORA]** — **[ENDEREÇO/CNPJ, se aplicável]**
