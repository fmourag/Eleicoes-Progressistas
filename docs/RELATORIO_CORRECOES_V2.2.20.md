# Relatório Técnico de Atualizações e Melhorias — v2.2.20

**Data:** 26 de Setembro de 2026  
**Versão:** 2.2.20  
**Status:** Produção & Teste Fechado Play Store Validado  
**Ambientes:** Web (Render / Cloudflare Pages) & Android App (AAB Release / APK Sideload)

---

## 1. Resumo Executivo

A versão **v2.2.20** consolida importantes aprimoramentos na jornada cívica, engajamento e experiência de usuário no ecossistema **Eleições Progressistas**, com foco na coleta transparente de avaliações dos testadores e cidadãos, mantendo 100% de conformidade com as diretrizes do Google Play (proibição de *Review Gating*) e privacidade LGPD (Coleta Zero).

---

## 2. Principais Funcionalidades e Ajustes Entregues

### 2.1. Identificação Permanente do Botão Flutuante de Feedback (`FeedbackFab.tsx`)
- **Problema Anterior:** O botão flutuante de feedback recolhia automaticamente o texto após a primeira visualização/clique, exibindo apenas um círculo verde com o emoji `💬`, dificultando a identificação clara de sua finalidade em telas desktop e mobile.
- **Solução Implementada:**
  - Removido o recolhimento automático (`COACH_MARK_KEY`).
  - O componente agora mantém permanentemente o formato de pílula (*pill*) estilizada com a cor verde cívica (`#1B5E20`), borda branca de destaque, ícone `💬` e o texto em negrito **Feedback** visível continuamente.
  - Posicionamento responsivo desacoplado do container central de 720px, posicionado diretamente a `32px` da margem direita e inferior no desktop, sem sobrepor barras ou tabs de navegação.

### 2.2. Card Popup de Feedback ao Retornar à Página Inicial (`FeedbackReturnModal.tsx`)
- **Funcionalidade:** Exibição contextual e amigável de um card modal ao retornar à página inicial (`/` ou `HomeScreen`) após explorar outras seções do aplicativo (Candidatos, Prioridades, Minha Cola, Observatório, Manual, etc.).
- **Identidade Visual Conforme Design System:**
  - Badge cívico no topo: `💬 SUA OPINIÃO IMPORTA` + botão de fechar `✕`.
  - Ícone temático: Círculo em verde suave com emoji `🗳️`.
  - Título em destaque: **"Ajude-nos com o seu Feedback"**.
  - Texto explicativo: *"Sua avaliação, sugestões e críticas ajudam a manter a plataforma rápida, transparente e útil para todos os eleitores."*
  - Botão Primário: **"💬 Feedback"** (Verde `#1B5E20`), que redireciona imediatamente para a tela `/feedback` e fecha o popup.
  - Botão Secundário: **"Mais Tarde"**, permitindo dispensa rápida e não intrusiva.
- **Ciclo de Vida & Performance:**
  - Implementado via hook `useFocusEffect` do Expo Router com controle de ciclo de vida (`hasLeftHomeRef` e `sessionStorage`).
  - Na primeira abertura da aplicação, o modal não bloqueia o primeiro acesso do eleitor. Ele surge de forma orgânica apenas quando o usuário retorna à tela inicial após navegar pelo app.

### 2.3. Apelo Institucional para o Grupo de Teste Fechado da Google Play (`feedback.tsx`)
- A tela de feedback recebeu reforço na chamada para participação no teste fechado da Play Store:
  - Destaca o compromisso com a melhoria contínua da apuração ao vivo e ferramentas cívicas.
  - Facilita o envio de feedbacks técnicos e sugestões diretamente aos desenvolvedores da plataforma.

### 2.4. Sincronização e Pipeline de Build Automático
- Sincronização rigorosa dos bundles web estáticos exportados (`npm run prepare:lite && npm run render:copy-assets`) para `apps/api/static` e `apps/api/static/web`.
- Garantia de integridade do artefato sideload (`eleicoes-progressistas-v2.2.19-beta.apk`) com verificação contínua de hash SHA-256 no script de deploy.

---

## 3. Matriz de Arquivos Modificados

| Arquivo | Descrição da Alteração |
|---|---|
| `apps/mobile/components/FeedbackFab.tsx` | Fixação permanente do rótulo "Feedback" no interior do botão flutuante. |
| `apps/mobile/components/FeedbackReturnModal.tsx` | Criação do componente modal popup de feedback para retorno à home. |
| `apps/mobile/app/index.tsx` | Integração do `useFocusEffect` e renderização do `FeedbackReturnModal`. |
| `apps/mobile/app/feedback.tsx` | Atualização dos textos de apelo para teste fechado na Play Store. |
| `apps/api/static/` | Atualização do bundle web estático compilado pelo Expo. |
| `docs/MARKDOWN.md` | Atualização do índice mestre de documentação para v2.2.20. |
| `README.md` | Atualização do badge de versão e resumo das funcionalidades. |

---

## 4. Conformidade e Segurança

- **Zero Coleta / LGPD:** A tela e o modal de feedback não exigem identificação obrigatória nem vinculação de dados partidários/eleitorais.
- **Google Play Anti-Gating:** Todos os fluxos de feedback mantêm canal aberto direto e neutro, em estrita conformidade com a política de avaliações da Google Play Store.
