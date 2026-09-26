# Play Store Closed Testing Runbook

Este documento define as regras operacionais para a gestão do Teste Fechado (Closed Testing) da Play Store para o aplicativo *Eleições Progressistas*, garantindo a conformidade total com as políticas do Google Play e a LGPD.

## 1. Convite Universal e Anti-Review Gating (A Política Mais Crítica)
O Google proíbe estritamente condicionar a participação em testes fechados (ou a submissão de avaliações) ao nível de satisfação do usuário. 

**Regras Aplicadas:**
* O convite para o Teste Fechado é oferecido a **100% dos usuários**, em uma aba neutra no formulário de feedback (Segmented Control).
* A oferta não está escondida atrás de uma nota de NPS ou avaliação positiva.
* Não há triagem: o usuário escolhe voluntariamente entre "Avaliar o app", "Teste fechado Play" ou "Ambos".
* Não há recompensas financeiras ou bônus no app associados à inscrição ou à avaliação.

## 2. Conformidade LGPD no Recolhimento de E-mail
Para que o Google Play libere a instalação, é necessário fornecer o e-mail da Conta Google (Google Workspace ou Gmail).

**Regras Aplicadas:**
* **Formulário Dinâmico:** O campo de e-mail só se torna obrigatório se o usuário explicitamente escolher "Teste fechado Play" ou "Ambos". Se escolher apenas "Avaliar o app", o e-mail é completamente ignorado/omitido, respeitando o princípio da minimização.
* **Consentimento Explícito (Checkbox):** O e-mail nunca é coletado sem um checkbox ativo e desmarcado por padrão (ou exigido pelo form validation) que diz: *"Concordo em fornecer meu e-mail exclusivamente para a gestão do teste fechado na Google Play Store (Base Legal: LGPD, Art. 7º, I). Estou ciente do direito de exclusão a qualquer momento pelo e-mail fmourag@gmail.com."*
* **Uso Restrito:** O e-mail exportado é usado estritamente para o "Mailing List" da Play Console. É proibido importá-lo em sistemas de Marketing ou Newsletters.

## 3. Fluxo de Exportação e Ingestão (Play Console)
Para gerenciar a lista de testadores:

1. Acesse o **Painel Administrativo** do Eleições Progressistas.
2. Na seção *Gestão*, acesse o card **Testers Play Store**.
3. Clique em **⬇️ Exportar Lista de Testadores**. O sistema irá baixar o arquivo `play_testers_export.csv`.
4. Abra o [Google Play Console](https://play.google.com/console).
5. Selecione o app **Eleições Progressistas**.
6. Vá para **Testes > Teste fechado**.
7. Selecione a trilha ativa (ex.: Alpha) ou crie uma nova.
8. Na aba **Testadores**, escolha **Lista de e-mails** e selecione a lista existente ou crie uma nova.
9. Faça o upload do arquivo CSV baixado (ou copie e cole os e-mails separados por vírgula se a lista for pequena, removendo o cabeçalho).
10. Salve as alterações.
11. O usuário que se inscreveu através do formulário já recebeu o link da trilha de testes na tela de sucesso (`https://play.google.com/apps/testing/eleicoes.progressistas`). Ele só precisa aguardar alguns minutos para que a lista seja sincronizada pelo Google e clicar no link.

## 4. Direito ao Esquecimento (Art. 18 LGPD)
Quando um usuário solicita a remoção via `fmourag@gmail.com`:
1. Excluir o registro no banco de dados (`DELETE FROM Feedback WHERE email = ?`).
2. Acessar a Play Console > Testes > Teste fechado > Testadores.
3. Remover o e-mail manualmente da lista.
4. Responder ao usuário com a confirmação de exclusão em até 48 horas úteis.

## 5. Gabarito dos Questionários Pendentes (Play Console)

- **Classificação IARC:** Violência NÃO, Sexo/Nudez NÃO, Linguagem forte NÃO, Drogas NÃO, Apostas NÃO, Ódio NÃO → **Classificação: Livre (Everyone / L)**.
- **Segurança dos Dados (Data Safety):**
  - Coleta: SIM (Opcionais mediante consentimento explícito).
  - Categorias: Informações pessoais (Nome, E-mail) + Atividade no app (Feedback: NPS, comentário textual, modelo do dispositivo).
  - Finalidades: Funcionalidade do app + Comunicações do desenvolvedor (gestão do teste fechado).
  - Criptografia em trânsito: SIM (HTTPS/TLS).
  - Exclusão sob pedido: SIM (mecanismo previsto e documentado via e-mail).
  - Telemetria / Rastreamento anônimo: Não declarada / inexistente.
- **Apps de Saúde:** NÃO.
- **Anúncios:** NÃO exibe.
- **Notícias / Revistas (Declaração de Entidade):**
  - Pessoa jurídica: SIM (conta pessoal/desenvolvedor responsável).
  - URL de Privacidade: `https://eleicoes-progressistas.onrender.com/privacidade`.
  - Conteúdo: Curadoria editorial própria + dados públicos oficiais abertos do TSE (Tribunal Superior Eleitoral).
  - Credencial de imprensa: Sem credencial de imprensa governamental (iniciativa independente de dados abertos).

