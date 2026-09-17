# Política de Conformidade com Avaliações do Google Play — Eleições Progressistas

**Aplicativo:** Eleições Progressistas (`com.eleicoesprogressistas.app`)  
**Versão:** 2.2.5 (Build Code 6)  
**Data:** 17 de setembro de 2026  
**Status:** 100% Conforme — Proibição Rigorosa de *Review Gating* e Adoção da *In-App Review API* Oficial  

---

## 1. Fundamentação e Diretrizes Oficiais do Google Play

O **Eleições Progressistas v2.2.5** adota formalmente e sem restrições as diretrizes internacionais do ecossistema Android estabelecidas pela Google:

### 1.1 Google Play In-App Review API Guidelines
* **Ausência de Indução ou Influência:** Proibição explícita de perguntas prévias de filtragem de sentimento ("Você está gostando do app?", "Avalie com 5 estrelas").
* **Acionamento por Marcos Neutros:** O fluxo de avaliação nativo só pode ser invocado em momentos neutros e naturais da jornada do usuário (ex.: conclusão de sessão ativa ou geração de documento cívico/PDF da cola eleitoral), nunca durante fluxos de envio de suporte ou relato de problemas.
* **Respeito às Cotas do Sistema Operacional:** O aplicativo nunca assume que a caixa de diálogo foi ou será exibida, respeita a cota restrita de exibição gerenciada pelo Google Play Core e impõe um intervalo mínimo local de **30 dias** entre invocações.
* **Proibição de Chamadas Recursivas:** O app nunca executa loops ou tentativas insistentes caso o diálogo não seja renderizado.

### 1.2 Google Play Ratings, Reviews, and Installs Policy
* **Proibição Estrita de *Review Gating*:** É expressamente vedado qualquer mecanismo que intercepte usuários insatisfeitos (ou com avaliações baixas/problemas) e os direcione apenas para canais internos privados, enquanto usuários satisfeitos são direcionados para a Google Play Store.
* **Proibição de Incentivos:** Nenhuma vantagem, desbloqueio de funcionalidade ou benefício cívico é condicionado ao ato de avaliar o aplicativo na loja.

---

## 2. Arquitetura de Conformidade do Eleições Progressistas v2.2.5

Para cumprir 100% das políticas de transparência e integridade do Google Play, a plataforma opera sob o seguinte modelo:

### A. CTA Duplo Neutro e Universal no Envio de Feedback
Ao submeter o formulário de feedback (seja no aplicativo ou na web em `/feedback`), **100% dos usuários** recebem exatamente a mesma tela de conclusão e resposta da API:
1. **Canal de Suporte e Diagnóstico Interno:** Protocolo técnico (`FB-...`) e endereço direto para suporte da equipe de engenharia (`fmourag@gmail.com`).
2. **Convite Opcional e Neutro para o Google Play:** Link oficial para avaliar na Play Store ou participar da trilha de testes abertos, com texto rigorosamente idêntico para todos os usuários, sem distinção de nota (NPS 0 a 10) ou presença de erros técnicos reportados.

### B. In-App Review API Nativa via Marcos Neutros de Engajamento
No ambiente mobile Android nativo:
* Disparo executado via biblioteca oficial `expo-store-review` (`StoreReview.requestReview()`).
* **Critérios Neutros de Elegibilidade:**
  - Pelo menos 3 sessões ativas no aplicativo; **OU**
  - Conclusão da geração/download do PDF da cola eleitoral.
* **Intervalo Mínimo de Cota:** 30 dias de intervalo persistido localmente via armazenamento criptografado no dispositivo, garantindo zero saturação do usuário.
* **Zero Coleta de Dados:** O estado do review é persistido exclusivamente no dispositivo (zero contato com banco de dados externo ou backend).

### C. Triagem Técnica Estritamente Interna no Backend
* Os indicadores de satisfação cívica (NPS) e tipo de ocorrência reportada (`crash`, `lentidao`, `bloqueio`, `nenhum`) são armazenados de forma confidencial no banco de dados da API.
* Essas informações servem **exclusivamente** para:
  - Ordenação e priorização de chamados técnicos no Painel Administrativo de Engenharia;
  - Exportação sanitizada em CSV para correção ágil de bugs pelos mantenedores do projeto de código aberto.
* Nenhuma lógica de sentimento do usuário afeta ou interfere na experiência do usuário ou nos links de avaliação apresentados.

---

## 3. Matriz de Auditoria e Conformidade Técnica

| Cenário de Teste / Perfil do Usuário | NPS | Problema Reportado | Comportamento no Formulário / API | Comportamento no In-App Review | Status de Conformidade |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **Usuário com Falha Grave** | 0 | `crash` | Exibe Protocolo + Suporte E-mail + **Link Oficial Google Play** | Neutro (aguarda marco neutro posterior) | ✅ **100% Conforme** |
| **Usuário com Dúvida / Lentidão** | 5 | `lentidao` | Exibe Protocolo + Suporte E-mail + **Link Oficial Google Play** | Neutro (aguarda marco neutro posterior) | ✅ **100% Conforme** |
| **Usuário Satisfeito / Neutro** | 8 | `nenhum` | Exibe Protocolo + Suporte E-mail + **Link Oficial Google Play** | Neutro (aguarda marco neutro posterior) | ✅ **100% Conforme** |
| **Usuário Promotor Cívico** | 10 | `nenhum` | Exibe Protocolo + Suporte E-mail + **Link Oficial Google Play** | Neutro (aguarda marco neutro posterior) | ✅ **100% Conforme** |
| **Geração de PDF da Cola Eleitoral** | N/A | N/A | N/A | Aciona `StoreReview.requestReview()` (se >= 30 dias do último) | ✅ **100% Conforme** |
| **Uso Frequente (3+ Sessões)** | N/A | N/A | N/A | Aciona `StoreReview.requestReview()` (se >= 30 dias do último) | ✅ **100% Conforme** |

---

## 4. Contato do Desenvolvedor Responsável
* **Engenheiro Líder / DPO:** Francisco Moura Garcia
* **E-mail Oficial:** `fmourag@gmail.com`
* **Repositório Público de Transparência:** `https://github.com/fmourag/Eleicoes-Progressistas`
