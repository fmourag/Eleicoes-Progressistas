---
title: "Nota de Transparência — Evolução para Coleta Zero"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Nota de Transparência — Evolução para Coleta Zero

> **Compromisso Fundamental:** "Cheque o passado. Escolha o futuro." — Preservação absoluta do anonimato do eleitor, sem questionários e com auditoria cívica direta na Justiça Eleitoral.

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

---

## 1. Contexto e Motivação da Transição

Nas versões preliminares de concepção da plataforma, avaliou-se o uso de questionários ideológicos com perguntas temáticas para aferição de posicionamento político. No entanto, em observância estrita aos princípios da **Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018, Art. 6º e Art. 11)** e ao compromisso de **Privacy by Design**, a equipe de engenharia e governança deliberou pela **extinção integral e irreversível de qualquer mecanismo de teste, questionário ou formulário de opinião ideológica**.

A partir da versão **2.2.0**, a aplicação opera sob a arquitetura de **Coleta Zero e Consulta por Prioridades**.

---

## 2. Como Funciona a Consulta por Prioridades (100% Stateless)

1. **Zero Coleta de Opinião:** O eleitor nunca é questionado sobre o que pensa, em quem vota ou qual sua orientação político-partidária.
2. **Seleção Volátil em Memória de Sessão:** O cidadão pode selecionar opcionalmente até 3 temas de seu interesse prioritário dentre os 13 pilares programáticos progressistas. Essa seleção reside exclusivamente na memória volátil (`useState`) do dispositivo e é descartada no fechamento da sessão.
3. **Cálculo de Afinidade Efêmero:** O backend processa o ranqueamento em tempo de execução via `POST /api/matching/rank` e devolve a lista ordenada sem gravar qualquer histórico de perfilamento, voto ou resultado em banco de dados.
4. **Anonimato Irreversível:** Não há cadastro obrigatório, login de eleitor, captura de biometria, identificador de publicidade ou vínculo com CPF.

---

## 3. O que Permanece e se Fortalece

A eliminação dos questionários não enfraqueceu a ferramenta; pelo contrário, fortaleceu a objetividade e a auditoria cívica:

* **Raio-X Auditável do Candidato:** Análise profunda e aberta baseada em dados públicos oficiais do Congresso Nacional e da Justiça Eleitoral, com memória de cálculo transparente `(Votações: 40%) + (Discursos: 30%) + (Posturas: 30%)` e diagnóstico detalhado do afastamento de 100% (*Gap Analysis*).
* **Auditoria Direta no Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`):** Atalhos diretos em todos os cards para verificação imediata dos registros de bens, processos e certidões na fonte primária oficial.
* **Cola Eleitoral 2026 (PDF & Impressão):** Seleção de candidatos salva 100% no dispositivo (`localStorage`/`AsyncStorage`), com ordenação rigorosa na sequência da urna do TSE (Resolução nº 23.736/2024), caixas de dígitos de urna, download de PDF otimizado para impressão e compartilhamento via WhatsApp e E-mail.
* **Tradutor LLM de Propostas de Governo:** Processamento batch noturno das propostas oficiais protocoladas no TSE, traduzindo jargões jurídicos e tecnocráticos para linguagem simples e acessível a qualquer cidadão.
* **Alinhamento Soberano ao Interesse Nacional:** Votos contrários a desonerações tributárias indiscriminadas para multinacionais sem garantias de emprego são computados positivamente como defesa do interesse público.

---

## 4. Auditoria Externa e Código Aberto

Todo o código-fonte, algoritmos de cálculo, esquemas de dados e rotinas de ingestão são públicos e auditáveis. Qualquer cidadão ou instituição de pesquisa pode auditar ou executar a plataforma localmente.

* **Canal do Encarregado de Dados (DPO):** `contato-dpo@norteprogressista.com.br`
* **Privacidade:** `privacidade@norteprogressista.com.br`
