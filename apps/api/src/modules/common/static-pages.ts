export const PRIVACY_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidade — Eleições Progressistas</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 24px; background: #fff; }
        h1, h2, h3 { color: #1B5E20; }
        h1 { border-bottom: 2px solid #1B5E20; padding-bottom: 8px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
        .card { background: #E8F5E9; border-left: 4px solid #1B5E20; padding: 12px 16px; margin: 16px 0; border-radius: 4px; }
        footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
        a { color: #1B5E20; text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Política de Privacidade — Eleições Progressistas</h1>
    <div class="meta"><strong>Vigência:</strong> 11 de setembro de 2026 • <strong>Versão:</strong> 2.2.3</div>

    <div class="card">
        <strong>Compromisso Central:</strong> O <em>Eleições Progressistas</em> opera sob o <strong>Princípio da Coleta Zero</strong> de dados políticos e pessoais. A plataforma foi desenhada para garantir o exercício do voto consciente com sigilo e transparência absolutos.
    </div>

    <h2>1. Princípio da Coleta Zero e Matching Stateless</h2>
    <p>Nenhum dado pessoal, ideológico, partidário ou de preferência de voto é coletado, transmitido para servidores ou comercializado. A funcionalidade de <strong>Matching Cívico</strong> opera de forma <em>stateless</em> exclusivamente na memória volátil da sessão do usuário (React Native / Local Storage) e é descartada automaticamente ao fechar ou recarregar o aplicativo.</p>

    <h2>2. Telemetria Técnica e Diagnóstico</h2>
    <p>Para assegurar a estabilidade do aplicativo, podemos coletar relatórios técnicos anônimos de falhas e erros operacionais (ex.: crashes de renderização, tempo de resposta de API). Tais relatórios não contêm identificadores do usuário, endereços IP persistidos ou dados de cunho político, atendendo à base legal do <strong>Art. 7º, IX da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong> por legítimo interesse estritamente técnico.</p>

    <h2>3. Ausência de Rastreamento e Blackout de Publicidade</h2>
    <p>O aplicativo não utiliza cookies de rastreamento comportamental, SDKs invasivos ou redes de publicidade direcionada. Durante todo o período eleitoral (até 05/10/2026), vigora a política de <strong>Blackout Eleitoral</strong> com zero veiculação de anúncios patrocinados.</p>

    <h2>4. Compartilhamento de Dados</h2>
    <p>Não há compartilhamento, venda, cessão ou aluguel de dados com partidos políticos, coligações, órgãos governamentais ou empresas de marketing. Não há transferência internacional de dados pessoais de usuários.</p>

    <h2>5. Direitos do Titular (LGPD Art. 18)</h2>
    <p>Como a aplicação não mantém banco de dados cadastrais de eleitores, não há perfis a serem retificados ou excluídos. Quaisquer dúvidas ou solicitações referentes à privacidade podem ser encaminhadas ao Encarregado pelo e-mail: <a href="mailto:fmourag@gmail.com">fmourag@gmail.com</a>.</p>

    <h2>6. Segurança da Informação</h2>
    <p>Todas as comunicações com a API de dados públicos do TSE utilizam criptografia de ponta a ponta (HTTPS/TLS com HSTS). As chaves de acesso a infraestrutura e credenciais são isoladas e mantidas fora do repositório público de código.</p>

    <h2>7. Classificação Etária</h2>
    <p>O aplicativo destina-se a eleitores e cidadãos em idade de voto (a partir de 16 anos). Não coletamos intencionalmente qualquer informação de menores de 13 anos.</p>

    <h2>8. Atualizações desta Política</h2>
    <p>Eventuais revisões desta política serão publicadas nesta página e comunicadas mediante nota de versão no aplicativo e no repositório de código.</p>

    <h2>9. Transparência Radical e Código Aberto</h2>
    <p>O código-fonte integral da plataforma é auditável publicamente no GitHub: <a href="https://github.com/fmourag/Eleicoes-Progressistas" target="_blank">github.com/fmourag/Eleicoes-Progressistas</a>.</p>

    <h2>10. Feedback Voluntário, Inscrição de Testadores (Google Play) e Auditoria Cívica</h2>
    <p>Os cidadãos e auditores cívicos podem enviar relatórios técnicos voluntários e/ou se inscrever no programa de testes fechados através do formulário de feedback (<code>/feedback</code>). Os dados coletados limitam-se a:</p>
    <ul>
        <li><strong>E-mail para Teste Fechado (Obrigatório para Testadores):</strong> Coletado <em>exclusivamente</em>, mediante <strong>Consentimento Explícito (Art. 7º, I da LGPD)</strong>, para cadastro na lista de testes fechados do Google Play Console. O e-mail não é usado para marketing, newsletters ou qualquer outra finalidade.</li>
        <li><strong>Protocolo de Atendimento:</strong> Código único gerado automaticamente no envio (ex.: <code>FB-1710000000-abcd</code>) para rastreamento técnico do relatório.</li>
        <li><strong>Informações do Dispositivo:</strong> Modelo e versão do sistema operacional para reprodução de falhas (Legítimo Interesse técnico, Art. 7º, IX da LGPD).</li>
        <li><strong>Avaliação e Relato:</strong> Nota NPS (0-10), tipo de problema reportado e descrição textual.</li>
        <li><strong>Nome de Contato:</strong> Informado voluntariamente.</li>
    </ul>
    <p>Os dados não são compartilhados com terceiros. A qualquer momento, você pode revogar seu consentimento e solicitar a exclusão do seu e-mail da lista de testadores através do e-mail de suporte <a href="mailto:fmourag@gmail.com">fmourag@gmail.com</a>, nos termos do Art. 18 da LGPD.</p>

    <footer>
        <p>© 2026 Eleições Progressistas • Plataforma cívica sem fins lucrativos • Contato: <a href="mailto:fmourag@gmail.com">fmourag@gmail.com</a></p>
    </footer>
</body>
</html>

`;

export const BETA_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acesso e Download — Eleições Progressistas 2026</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #222; max-width: 680px; margin: 0 auto; padding: 24px; background: #f9fbf9; }
        .header { text-align: center; margin-bottom: 24px; }
        h1 { color: #1B5E20; margin-bottom: 4px; }
        .subtitle { color: #555; font-size: 16px; }
        .badge { display: inline-block; background: #E8F5E9; color: #1B5E20; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: bold; }
        .seal { display: inline-block; background: #E3F2FD; color: #0D47A1; border: 1px solid #BBDEFB; padding: 8px 16px; border-radius: 24px; font-size: 14px; font-weight: 600; margin: 12px 0 20px 0; }
        .access-card { background: #fff; border: 2px solid #C8E6C9; padding: 24px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; }
        .btn-group { display: flex; flex-direction: row; gap: 16px; justify-content: center; align-items: stretch; margin: 16px 0; }
        @media (max-width: 600px) {
            .btn-group { flex-direction: column; }
        }
        .btn { display: flex; align-items: center; justify-content: center; padding: 14px 20px; border-radius: 8px; font-weight: bold; font-size: 16px; text-decoration: none; transition: all 0.2s; flex: 1; text-align: center; }
        .btn-web { background: #1565C0; color: #fff; box-shadow: 0 2px 4px rgba(21,101,192,0.3); }
        .btn-web:hover { background: #0D47A1; }
        .btn-apk { background: #1B5E20; color: #fff; box-shadow: 0 2px 4px rgba(27,94,32,0.3); }
        .btn-apk:hover { background: #2E7D32; }
        .qr-box { background: #fff; border: 1px solid #e0e0e0; padding: 16px; text-align: center; border-radius: 8px; margin: 20px auto; max-width: 260px; }
        .qr-box img { width: 200px; height: 200px; display: block; margin: 0 auto 8px auto; }
        .steps { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
        .steps ol { padding-left: 20px; margin: 0; }
        .steps li { margin-bottom: 10px; }
        .hash-box { background: #ECEFF1; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; word-break: break-all; margin: 16px 0; border: 1px solid #CFD8DC; text-align: center; }
        footer { text-align: center; font-size: 13px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
        a { color: #1B5E20; }
    </style>
</head>
<body>
    <div class="header">
        <span class="badge">HOMOLOGAÇÃO v2.2.15</span>
        <h1>Eleições Progressistas 2026</h1>
        <p class="subtitle">Acesso direto para cidadãos, testadores e auditores cívicos</p>
    </div>

    <div class="access-card">
        <div class="seal">Funciona no navegador do celular e do computador — sem instalação</div>

        <div class="btn-group">
            <a href="https://eleicoes-progressistas.onrender.com/web/" target="_blank" class="btn btn-web">🌐 ABRIR VERSÃO WEB</a>
            <a href="https://eleicoes-progressistas.onrender.com/download/apk" class="btn btn-apk">📱 BAIXAR APK ANDROID</a>
        </div>

        <div class="hash-box">
            <strong>🔐 Integridade do APK Android (SHA-256):</strong><br>
            8c631b9af8843446b166da8bf5d7034b9089e2e112c0fcffa75d785de56df15e
        </div>

        <div class="qr-box">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Feleicoes-progressistas.onrender.com%2Fdownload%2Fapk" alt="QR Code Download APK">
            <small style="color: #666;">Aponte a câmera para baixar o APK no celular</small>
        </div>
    </div>

    <div class="steps">
        <h3 style="margin-top:0; color:#1B5E20;">📱 Como instalar o APK no Android:</h3>
        <ol>
            <li>Toque em <strong>"📱 BAIXAR APK ANDROID"</strong> ou escaneie o QR Code acima.</li>
            <li>Abra o arquivo baixado. Se o Android solicitar, selecione <strong>"Permitir desta fonte"</strong>.</li>
            <li>Conclua a instalação e abra o aplicativo para iniciar seus testes.</li>
        </ol>
    </div>

    <p style="font-size: 13px; color: #666; text-align: center;">
        ℹ️ <em>Canal oficial de distribuição enquanto o app conclui os ciclos de homologação na Google Play Store.</em>
    </p>

    <footer>
        <p>
            <a href="/web/">Versão Web</a> • 
            <a href="/privacidade">Política de Privacidade</a> • 
            <a href="/feedback">Canal de Feedback</a> • 
            Feedback: <a href="mailto:fmourag@gmail.com">fmourag@gmail.com</a>
        </p>
    </footer>
</body>
</html>`;

export const FEEDBACK_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscrição de Testadores & Homologação — Eleições Progressistas 2026</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #222; max-width: 680px; margin: 0 auto; padding: 20px; background: #f9fbf9; }
        .header { text-align: center; margin-bottom: 24px; }
        h1 { color: #1B5E20; margin-bottom: 6px; font-size: 25px; font-weight: 800; }
        .subtitle { color: #555; font-size: 15px; margin: 0; }
        .badge { display: inline-block; background: #E8F5E9; color: #1B5E20; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 10px; border: 1px solid #c8e6c9; }
        .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border: 1px solid #e0e0e0; margin-bottom: 20px; }
        .security-card { background: #E8F5E9; border-left: 5px solid #1B5E20; padding: 18px; border-radius: 8px; margin-bottom: 22px; }
        .security-title { font-weight: 700; color: #1B5E20; display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 8px; }
        .security-text { font-size: 13px; color: #1e4620; margin: 0 0 8px 0; line-height: 1.5; }
        .security-text:last-child { margin-bottom: 0; }
        .form-group { margin-bottom: 18px; }
        label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; color: #333; }
        .label-desc { font-weight: normal; font-size: 12px; color: #666; margin-top: 3px; }
        input[type="text"], input[type="email"], select, textarea {
            width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 15px; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;
        }
        input[type="text"]:focus, input[type="email"]:focus, select:focus, textarea:focus {
            border-color: #1B5E20; outline: none; box-shadow: 0 0 0 2px rgba(27,94,32,0.15);
        }
        .nps-container { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .nps-btn {
            flex: 1 0 calc(9% - 6px); min-width: 36px; height: 42px; border: 1px solid #ccc; background: #fff; border-radius: 6px;
            font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center;
        }
        .nps-btn:hover { background: #f0f7f0; border-color: #1B5E20; }
        .nps-btn.selected { background: #1B5E20; color: #fff; border-color: #1B5E20; }
        .nps-labels { display: flex; justify-content: space-between; font-size: 12px; color: #777; margin-top: 4px; }
        .consent-box { background: #f4fbf5; border: 1px solid #c8e6c9; border-radius: 8px; padding: 14px; margin-top: 14px; }
        .consent-label { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-weight: normal; font-size: 13px; color: #333; margin: 0; }
        .consent-label input { margin-top: 2px; width: 18px; height: 18px; accent-color: #1B5E20; }
        .btn-submit {
            display: block; width: 100%; background: #1B5E20; color: #fff; border: none; padding: 16px; border-radius: 8px;
            font-weight: bold; font-size: 17px; cursor: pointer; transition: background 0.2s; margin-top: 16px;
        }
        .btn-submit:hover { background: #2E7D32; }
        .btn-submit:disabled { background: #a5d6a7; cursor: not-allowed; }
        .success-box { display: none; background: #E8F5E9; border-left: 5px solid #1B5E20; padding: 24px; border-radius: 8px; text-align: center; }
        .protocol-badge { display: inline-block; background: #1B5E20; color: #fff; font-family: monospace; font-size: 18px; padding: 6px 16px; border-radius: 6px; margin: 14px 0; word-break: break-all; }
        .error-msg { color: #d32f2f; font-size: 13px; margin-top: 4px; display: none; }
        .segment-group { display: flex; background: #eef2eb; border-radius: 8px; padding: 4px; margin-bottom: 24px; }
        .segment-btn { flex: 1; text-align: center; padding: 12px 8px; font-size: 14px; font-weight: 600; color: #555; cursor: pointer; border-radius: 6px; transition: all 0.2s; border: none; background: transparent; }
        .segment-btn.active { background: #fff; color: #1B5E20; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .hidden-section { display: none !important; }
        footer { text-align: center; font-size: 13px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
        a { color: #1B5E20; }
    </style>
</head>
<body>
    <div class="header">
        <span class="badge">PROGRAMA DE TESTADORES OFICIAIS & AUDITORIA CÍVICA</span>
        <h1>Eleições Progressistas</h1>
        <p class="subtitle">Inscrição de Testadores Google Play & Homologação da versão 2.2.9</p>
    </div>

    <div class="card" id="formCard">
        <!-- Caixa de Justificativa, Transparência e Segurança LGPD -->
        <form id="feedbackForm">
            <input type="hidden" id="appVersion" name="appVersion" value="2.2.15">
            <input type="hidden" id="nps" name="nps" value="10">
            <input type="hidden" id="feedbackType" name="type" value="APP_REVIEW">

            <div class="segment-group" id="typeSelector">
                <button type="button" class="segment-btn active" data-type="APP_REVIEW">📝 Avaliar o app</button>
                <button type="button" class="segment-btn" data-type="PLAY_TESTER">🧪 Teste fechado Play</button>
                <button type="button" class="segment-btn" data-type="BOTH">Ambos</button>
            </div>

            <!-- Seção do Testador (Oculta por Padrão) -->
            <div id="testerFields" class="hidden-section">
                <div class="security-card">
                    <div class="security-title">
                        🛡️ Uso Específico do E-mail e Garantia de Privacidade (LGPD)
                    </div>
                    <p class="security-text">
                        <strong>• Finalidade Específica:</strong> O seu e-mail do Google (Gmail ou Google Workspace) é coletado <em>exclusivamente</em> para inclusão na lista autorizada de testadores do <strong>Google Play Console (Teste Interno / Teste Fechado)</strong>.
                    </p>
                    <p class="security-text">
                        <strong>• Princípio da Coleta Zero & Sem Compartilhamento:</strong> Seus dados pessoais ou preferências políticas jamais serão comercializados ou compartilhados com terceiros.
                    </p>
                </div>

                <div class="form-group">
                    <label for="email">Seu E-mail Google / Gmail (Para Acesso na Play Store) *</label>
                    <input type="email" id="email" name="email" placeholder="exemplo@gmail.com">
                </div>

                <div class="consent-box" style="margin-bottom: 18px;">
                    <label class="consent-label">
                        <input type="checkbox" id="consentTester" name="consentTester">
                        <span>Concordo em fornecer meu e-mail exclusivamente para a gestão do teste fechado na Google Play Store (Base Legal: LGPD, Art. 7º, I). Estou ciente do direito de exclusão a qualquer momento pelo e-mail fmourag@gmail.com.</span>
                    </label>
                </div>
            </div>

            <!-- Comum a Ambos -->
            <div class="form-group">
                <label for="testerName">Seu Nome ou Identificação Cívica (Opcional)</label>
                <input type="text" id="testerName" name="testerName" placeholder="Ex.: Maria Silva ou Auditor Cívico SP">
            </div>

            <!-- Seção de Review -->
            <div id="reviewFields">
                <div class="form-group">
                    <label for="npsSelect">Qual a probabilidade de recomendar este app para sua rede? (0 a 10) *</label>
                    <div class="nps-container" id="npsContainer">
                        <button type="button" class="nps-btn" data-val="0">0</button>
                        <button type="button" class="nps-btn" data-val="1">1</button>
                        <button type="button" class="nps-btn" data-val="2">2</button>
                        <button type="button" class="nps-btn" data-val="3">3</button>
                        <button type="button" class="nps-btn" data-val="4">4</button>
                        <button type="button" class="nps-btn" data-val="5">5</button>
                        <button type="button" class="nps-btn" data-val="6">6</button>
                        <button type="button" class="nps-btn" data-val="7">7</button>
                        <button type="button" class="nps-btn" data-val="8">8</button>
                        <button type="button" class="nps-btn" data-val="9">9</button>
                        <button type="button" class="nps-btn selected" data-val="10">10</button>
                    </div>
                    <div class="nps-labels">
                        <span>0 = Pouco provável</span>
                        <span>10 = Altamente provável</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="problema">Status da Avaliação / Tipo de Apontamento *</label>
                    <select id="problema" name="problema">
                        <option value="nenhum">✅ Nenhum problema — Testei e tudo funcionou perfeitamente</option>
                        <option value="fotos">📸 Dúvida ou falha no carregamento de fotos</option>
                        <option value="layout">📱 Problema visual / texto cortado em tela pequena</option>
                        <option value="lentidao">⏳ Lentidão na listagem de candidatos</option>
                        <option value="crash">💥 Fechamento inesperado do app</option>
                        <option value="outro">📝 Sugestão de melhoria ou outro apontamento</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="descricao">Observações, Sugestões ou Relato de Teste (Opcional)</label>
                    <textarea id="descricao" name="descricao" rows="3" placeholder="Ex.: Testei deputados do meu estado, matching rápido e intuitivo..."></textarea>
                </div>

                <div class="form-group">
                    <label for="screenshotDesc">Descrição de Captura de Tela ou Evidência (Opcional)</label>
                    <input type="text" id="screenshotDesc" name="screenshotDesc" placeholder="Ex.: Verifiquei aba de candidatos sem erros">
                </div>
            </div>

            <!-- Dados do Dispositivo -->
            <div class="form-group">
                <label for="device">Dispositivo / Modelo *</label>
                <input type="text" id="device" name="device" required>
                <div class="label-desc">Detectado automaticamente pelo seu navegador para mapeamento de compatibilidade.</div>
            </div>

            <div class="form-group">
                <label for="androidVersion">Sistema Operacional</label>
                <input type="text" id="androidVersion" name="androidVersion">
            </div>

            <button type="submit" class="btn-submit" id="submitBtn">🚀 Enviar Feedback</button>
            <div class="error-msg" id="submitError" style="margin-top: 10px; text-align: center;"></div>
        </form>
    </div>

    <div class="success-box" id="successBox">
        <h2 style="color: #1B5E20; margin-top: 0;">🎉 Inscrição & Relatório Registrados com Sucesso!</h2>
        <p>Seu e-mail e apontamentos foram integrados à base de homologação da versão 2.2.9.</p>
        <div>Seu protocolo único de atendimento técnico:</div>
        <div class="protocol-badge" id="protocolBadge">FB-...</div>

        <div class="next-steps-card" id="nextStepsCard" style="margin-top: 20px; padding: 18px; background: #ffffff; border: 1px solid #c8e6c9; border-radius: 8px; text-align: left;">
            <h3 style="color: #1B5E20; margin-top: 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                📋 Como Instalar o App no Google Play
            </h3>
            
            <div style="margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid #e0e0e0;">
                <strong style="color: #333; display: block; margin-bottom: 6px;">1️⃣ Aceitar o Convite de Teste no Google Play</strong>
                <p style="font-size: 13px; color: #555; margin: 0 0 10px 0;">
                    Toque no link abaixo para aceitar o convite de testador com a mesma conta Google informada:
                </p>
                <a href="https://play.google.com/apps/testing/eleicoes.progressistas" id="testingTrackLink" target="_blank" style="background: #1B5E20; font-size: 14px; padding: 10px 18px; text-decoration: none; color: #fff; border-radius: 6px; font-weight: bold; display: inline-block;">
                    📲 Acessar Trilha de Testes Google Play
                </a>
            </div>

            <div style="margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid #e0e0e0;">
                <strong style="color: #333; display: block; margin-bottom: 6px;">2️⃣ Página Oficial na Loja</strong>
                <p style="font-size: 13px; color: #555; margin: 0 0 10px 0;">
                    Após aceitar o convite, acesse a página oficial do app na Play Store:
                </p>
                <a href="https://play.google.com/store/apps/details?id=eleicoes.progressistas" id="playStoreLink" target="_blank" style="color: #1B5E20; font-weight: bold; font-size: 13px;">
                    ⭐ Ver na Google Play Store
                </a>
            </div>

            <div>
                <strong style="color: #333; display: block; margin-bottom: 4px;">🛠️ Contato Direto com o Desenvolvedor</strong>
                <p style="font-size: 13px; color: #555; margin: 0 0 6px 0;">
                    Dúvidas sobre o teste ou envio de prints complementares:
                </p>
                <a href="mailto:fmourag@gmail.com" id="supportMailLink" style="color: #1B5E20; font-weight: bold; font-size: 13px;">
                    ✉️ fmourag@gmail.com
                </a>
            </div>
        </div>

        <p style="font-size: 14px; color: #555; margin-top: 18px;">Muito obrigado por contribuir com a democracia e a transparência eleitoral! 🇧🇷</p>
        <p><a href="/beta" style="font-weight: bold; text-decoration: none;">← Voltar para a página de instalação Beta (APK Direto)</a></p>
    </div>

    <footer>
        <p>
            <a href="/privacidade">Política de Privacidade</a> • 
            <a href="https://github.com/fmourag/Eleicoes-Progressistas" target="_blank">Código Aberto no GitHub</a> • 
            Contato: <a href="mailto:fmourag@gmail.com">fmourag@gmail.com</a>
        </p>
    </footer>

    <script>
        // Auto-detectar dispositivo e OS
        (function initDevice() {
            var ua = navigator.userAgent;
            var dev = "Navegador Web";
            var os = "";

            if (/android/i.test(ua)) {
                var match = ua.match(/Android\\s([0-9\\.]*)/i);
                os = match ? "Android " + match[1] : "Android";
                var devMatch = ua.match(/\\((.*?)\\)/);
                dev = devMatch ? devMatch[1] : "Dispositivo Android";
            } else if (/iPhone|iPad/i.test(ua)) {
                dev = "Apple iOS Device";
                os = "iOS";
            } else if (/Windows/i.test(ua)) {
                dev = "PC Windows";
                os = "Windows";
            } else if (/Macintosh/i.test(ua)) {
                dev = "Apple Mac";
                os = "macOS";
            }

            document.getElementById("device").value = dev;
            document.getElementById("androidVersion").value = os;
        })();

        // Manipulação da escala NPS
        var npsBtns = document.querySelectorAll(".nps-btn");
        npsBtns.forEach(function(btn) {
            btn.addEventListener("click", function() {
                npsBtns.forEach(function(b) { b.classList.remove("selected"); });
                btn.classList.add("selected");
                document.getElementById("nps").value = btn.getAttribute("data-val");
            });
        });

        // Alternância de abas (Segmented Control)
        var segmentBtns = document.querySelectorAll(".segment-btn");
        var testerFields = document.getElementById("testerFields");
        var reviewFields = document.getElementById("reviewFields");
        var feedbackTypeInput = document.getElementById("feedbackType");
        var submitBtn = document.getElementById("submitBtn");
        var emailInput = document.getElementById("email");
        var consentTester = document.getElementById("consentTester");

        function updateFormState(type) {
            feedbackTypeInput.value = type;
            if (type === "APP_REVIEW") {
                testerFields.classList.add("hidden-section");
                reviewFields.classList.remove("hidden-section");
                emailInput.required = false;
                consentTester.required = false;
                submitBtn.innerText = "🚀 Enviar Avaliação";
            } else if (type === "PLAY_TESTER") {
                testerFields.classList.remove("hidden-section");
                reviewFields.classList.add("hidden-section");
                emailInput.required = true;
                consentTester.required = true;
                submitBtn.innerText = "✉️ Inscrever no Teste Fechado";
            } else if (type === "BOTH") {
                testerFields.classList.remove("hidden-section");
                reviewFields.classList.remove("hidden-section");
                emailInput.required = true;
                consentTester.required = true;
                submitBtn.innerText = "🚀 Enviar Avaliação & Inscrição";
            }
        }

        segmentBtns.forEach(function(btn) {
            btn.addEventListener("click", function() {
                segmentBtns.forEach(function(b) { b.classList.remove("active"); });
                btn.classList.add("active");
                updateFormState(btn.getAttribute("data-type"));
            });
        });

        // Estado inicial
        updateFormState("APP_REVIEW");

        // Envio do formulário
        document.getElementById("feedbackForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            var submitBtn = document.getElementById("submitBtn");
            var submitError = document.getElementById("submitError");
            submitError.style.display = "none";

            submitBtn.disabled = true;
            submitBtn.innerText = "⏳ Registrando testador...";

            var testerNameVal = document.getElementById("testerName").value.trim();
            var feedbackType = document.getElementById("feedbackType").value;

            var payload = {
                type: feedbackType,
                testerName: testerNameVal || undefined,
                nome: testerNameVal || undefined,
                email: undefined, // Email is now just for tester via playTesterEmail
                playTesterEmail: (feedbackType === "PLAY_TESTER" || feedbackType === "BOTH") ? document.getElementById("email").value.trim() : undefined,
                playTesterConsent: (feedbackType === "PLAY_TESTER" || feedbackType === "BOTH") ? document.getElementById("consentTester").checked : undefined,
                device: document.getElementById("device").value,
                androidVersion: document.getElementById("androidVersion").value || undefined,
                appVersion: document.getElementById("appVersion").value,
                nps: parseInt(document.getElementById("nps").value, 10),
                problema: document.getElementById("problema").value,
                descricao: document.getElementById("descricao").value.trim() || undefined,
                screenshotDesc: document.getElementById("screenshotDesc").value.trim() || undefined
            };

            try {
                // Tenta /feedback diretamente e /api/feedback com fallback transparente
                var response = await fetch("/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok && response.status === 404) {
                    response = await fetch("/api/feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok) {
                    var errData = await response.json().catch(function() { return {}; });
                    throw new Error(errData.message || ("Erro " + response.status + " ao registrar testador"));
                }

                var data = await response.json();
                var protocolStr = data.protocol || ("FB-" + data.id);
                document.getElementById("protocolBadge").innerText = protocolStr;

                // Suporte vinculado ao protocolo
                var mailLink = document.getElementById("supportMailLink");
                if (mailLink) {
                    mailLink.href = "mailto:fmourag@gmail.com?subject=" + encodeURIComponent("Suporte Testador " + protocolStr);
                }

                // Sincroniza links do Google Play retornados pelo backend se for PLAY_TESTER ou BOTH
                var nextStepsCard = document.getElementById("nextStepsCard");
                if (feedbackType === "PLAY_TESTER" || feedbackType === "BOTH") {
                    if (data.reviewCta) {
                        var playLink = document.getElementById("playStoreLink");
                        if (playLink && data.reviewCta.playStoreUrl) {
                            playLink.href = data.reviewCta.playStoreUrl;
                        }
                        var testLink = document.getElementById("testingTrackLink");
                        if (testLink && data.reviewCta.testingTrackUrl) {
                            testLink.href = data.reviewCta.testingTrackUrl;
                        }
                    }
                    if (nextStepsCard) nextStepsCard.style.display = "block";
                } else {
                    if (nextStepsCard) nextStepsCard.style.display = "none";
                }

                document.getElementById("formCard").style.display = "none";
                document.getElementById("successBox").style.display = "block";
                window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (err) {
                submitError.innerText = "❌ " + err.message;
                submitError.style.display = "block";
                submitBtn.disabled = false;
                submitBtn.innerText = "🚀 Enviar Inscrição de Testador & Relatório";
            }
        });
    </script>
</body>
</html>
`;

export const DASHBOARD_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard de Feedbacks — Eleições Progressistas</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-heading: #f0f6fc;
      --accent: #238636;
      --accent-hover: #2ea043;
      --danger: #da3633;
      --warning: #d29922;
      --info: #58a6ff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 24px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    .logo-title h1 {
      color: var(--text-heading);
      font-size: 24px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-title p {
      color: #8b949e;
      font-size: 14px;
      margin-top: 4px;
    }
    .auth-bar {
      display: flex;
      gap: 10px;
      align-items: center;
      background: var(--card-bg);
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    input, select {
      background: #0d1117;
      border: 1px solid var(--border);
      color: var(--text-heading);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
    }
    input:focus, select:focus {
      border-color: var(--info);
    }
    .btn {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn:hover { background: var(--accent-hover); }
    .btn-secondary {
      background: #21262d;
      color: var(--text-heading);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { background: #30363d; }
    
    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
    }
    .card-label {
      font-size: 13px;
      font-weight: 600;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-value {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-heading);
      margin: 8px 0 4px;
    }
    .card-sub {
      font-size: 13px;
      color: #8b949e;
    }
    .nps-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
    }
    .nps-good { background: rgba(35, 134, 54, 0.2); color: #3fb950; }
    .nps-mid { background: rgba(210, 153, 34, 0.2); color: #d29922; }
    .nps-bad { background: rgba(218, 54, 51, 0.2); color: #f85149; }

    /* Chart & Breakdown */
    .breakdown-section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-heading);
      margin-bottom: 12px;
    }
    .bar-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      gap: 12px;
    }
    .bar-label {
      width: 180px;
      font-size: 14px;
      color: var(--text-heading);
    }
    .bar-track {
      flex: 1;
      height: 12px;
      background: #21262d;
      border-radius: 6px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: var(--info);
      border-radius: 6px;
      transition: width 0.5s ease-out;
    }
    .bar-count {
      width: 40px;
      text-align: right;
      font-weight: 700;
      font-size: 14px;
      color: var(--text-heading);
    }

    /* Table */
    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }
    .table-wrap {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }
    th {
      background: #1c2128;
      padding: 12px 14px;
      color: #8b949e;
      font-weight: 600;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }
    .protocol-tag {
      font-family: monospace;
      background: #21262d;
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--info);
      font-size: 13px;
    }
    .problem-tag {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .problem-nenhum { background: rgba(35, 134, 54, 0.2); color: #3fb950; }
    .problem-bug { background: rgba(218, 54, 51, 0.2); color: #f85149; }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      color: #8b949e;
      font-size: 16px;
    }
    .error-box {
      background: rgba(218, 54, 51, 0.15);
      border: 1px solid var(--danger);
      color: #ff7b72;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-title">
        <h1>📊 Monitor de Feedbacks & Beta</h1>
        <p>Eleições Progressistas — Painel Administrativo em Tempo Real</p>
      </div>
        <input type="password" id="adminToken" placeholder="Token Admin (ex: dev-secret)" value="dev-secret">
        <button class="btn" onclick="carregarDados()">Carregar</button>
        <button class="btn btn-secondary" onclick="exportarCsv()">📥 CSV</button>
        <button class="btn" style="background: #1B5E20; color: #fff;" onclick="exportarTestadores()">👥 Testadores Play Store</button>
      </div>
    </header>

    <div id="errorBox" class="error-box"></div>

    <div id="loading" class="loading-spinner">Carregando dados de feedback...</div>

    <div id="content" style="display: none;">
      <!-- Métricas -->
      <div class="metrics-grid">
        <div class="card">
          <div class="card-label">Total de Reportes</div>
          <div class="card-value" id="totalCount">0</div>
          <div class="card-sub">Feedbacks registrados no banco</div>
        </div>
        <div class="card">
          <div class="card-label">Média NPS / Avaliação</div>
          <div class="card-value"><span id="avgNps">0.0</span> <span style="font-size: 18px; color: #8b949e;">/ 10</span></div>
          <div class="card-sub" id="npsStatus">Calculando...</div>
        </div>
        <div class="card">
          <div class="card-label">🧪 Testers Play Store</div>
          <div class="card-value" id="playTestersCount">0</div>
          <div class="card-sub">Aceitaram convite (LGPD consentido)</div>
        </div>
        <div class="card">
          <div class="card-label">Status Operacional</div>
          <div class="card-value" style="color: #3fb950;">100% ONLINE</div>
          <div class="card-sub">Render + Supabase + Cloudflare</div>
        </div>
      </div>

      <!-- Distribuição de Problemas -->
      <div class="card breakdown-section">
        <div class="section-title">Distribuição por Categoria de Problema</div>
        <div id="problemasList"></div>
      </div>

      <!-- Tabela de Últimos Feedbacks -->
      <div class="card">
        <div class="table-controls">
          <div class="section-title" style="margin: 0;">Últimos Feedbacks Recebidos</div>
          <input type="text" id="filterInput" placeholder="🔍 Filtrar por nome, problema ou texto..." onkeyup="filtrarTabela()" style="width: 320px;">
        </div>
        <div class="table-wrap">
          <table id="feedbackTable">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Data / Hora</th>
                <th>Usuário / Tester</th>
                <th>NPS</th>
                <th>Problema</th>
                <th>Dispositivo / OS</th>
                <th>Descrição / Comentário</th>
              </tr>
            </thead>
            <tbody id="feedbackBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    let rawFeedbacks = [];

    // Carregar token salvo ou via URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenUrl = urlParams.get('token') || urlParams.get('key');
    if (tokenUrl) {
      document.getElementById('adminToken').value = tokenUrl;
    } else if (localStorage.getItem('ep_admin_token')) {
      document.getElementById('adminToken').value = localStorage.getItem('ep_admin_token');
    }

    async function carregarDados() {
      const token = document.getElementById('adminToken').value.trim();
      localStorage.setItem('ep_admin_token', token);

      const errorBox = document.getElementById('errorBox');
      const loading = document.getElementById('loading');
      const content = document.getElementById('content');

      errorBox.style.display = 'none';
      loading.style.display = 'flex';
      content.style.display = 'none';

      try {
        const res = await fetch('/api/feedback/dashboard?token=' + encodeURIComponent(token), {
          headers: { 'x-admin-token': token }
        });

        if (!res.ok) {
          throw new Error('Não autorizado ou token inválido. Verifique o Token Admin.');
        }

        const data = await res.json();
        renderDashboard(data);
        loading.style.display = 'none';
        content.style.display = 'block';
      } catch (err) {
        loading.style.display = 'none';
        errorBox.textContent = '❌ ' + err.message;
        errorBox.style.display = 'block';
      }
    }

    function renderDashboard(data) {
      document.getElementById('totalCount').textContent = data.total;
      document.getElementById('playTestersCount').textContent = data.playTestersCount || 0;
      document.getElementById('avgNps').textContent = Number(data.avgNps).toFixed(1);

      const npsStatus = document.getElementById('npsStatus');
      if (data.avgNps >= 8.5) {
        npsStatus.innerHTML = '<span class="nps-badge nps-good">Excelente (Zona de Encantamento)</span>';
      } else if (data.avgNps >= 7.0) {
        npsStatus.innerHTML = '<span class="nps-badge nps-mid">Bom (Zona Neutra / Aprimorável)</span>';
      } else {
        npsStatus.innerHTML = '<span class="nps-badge nps-bad">Atenção (Zona de Crítica)</span>';
      }

      // Renderizar barras de problemas
      const problemasDiv = document.getElementById('problemasList');
      problemasDiv.innerHTML = '';
      const total = data.total || 1;
      const probs = Object.entries(data.porProblema || {});

      if (probs.length === 0) {
        problemasDiv.innerHTML = '<p style="color: #8b949e; padding: 10px 0;">Nenhum feedback com problema registrado até o momento.</p>';
      } else {
        probs.sort((a, b) => b[1] - a[1]).forEach(([nome, count]) => {
          const pct = Math.round((count / total) * 100);
          const row = document.createElement('div');
          row.className = 'bar-row';
          row.innerHTML = \\\`
            <div class="bar-label">\\\${formatarProblema(nome)}</div>
            <div class="bar-track"><div class="bar-fill" style="width: \\\${pct}%"></div></div>
            <div class="bar-count">\\\${count} <span style="font-size: 11px; color: #8b949e;">(\\\${pct}%)</span></div>
          \\\`;
          problemasDiv.appendChild(row);
        });
      }

      // Renderizar tabela
      rawFeedbacks = data.ultimos || [];
      renderTabela(rawFeedbacks);
    }

    function renderTabela(lista) {
      const tbody = document.getElementById('feedbackBody');
      tbody.innerHTML = '';

      if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #8b949e; padding: 24px;">Nenhum registro encontrado.</td></tr>';
        return;
      }

      lista.forEach(f => {
        const tr = document.createElement('tr');
        const dt = new Date(f.createdAt).toLocaleString('pt-BR');
        const isBug = f.problema && f.problema !== 'nenhum';
        const probClass = isBug ? 'problem-bug' : 'problem-nenhum';

        tr.innerHTML = \\\`
          <td><span class="protocol-tag">\\\${f.protocol || '-'}</span></td>
          <td>\\\${dt}</td>
          <td><strong>\\\${escapeHtml(f.testerName || 'Anônimo')}</strong><br><small style="color: #8b949e;">\\\${escapeHtml(f.email || '-')}</small></td>
          <td><span style="font-weight: 800; font-size: 15px; color: \\\${f.nps >= 8 ? '#3fb950' : f.nps >= 6 ? '#d29922' : '#f85149'}">\\\${f.nps}</span></td>
          <td><span class="problem-tag \\\${probClass}">\\\${formatarProblema(f.problema)}</span></td>
          <td><small>\\\${escapeHtml(f.device || '-')} (v\\\${escapeHtml(f.appVersion || '-')})</small></td>
          <td style="max-width: 340px; word-break: break-word;">\\\${escapeHtml(f.descricao || '-')}</td>
        \\\`;
        tbody.appendChild(tr);
      });
    }

    function filtrarTabela() {
      const q = document.getElementById('filterInput').value.toLowerCase();
      const filtrados = rawFeedbacks.filter(f => {
        const str = \\\`\\\${f.protocol} \\\${f.testerName} \\\${f.email} \\\${f.problema} \\\${f.device} \\\${f.descricao}\\\`.toLowerCase();
        return str.includes(q);
      });
      renderTabela(filtrados);
    }

    function formatarProblema(p) {
      const map = {
        'nenhum': '✅ Nenhum problema',
        'tela_travando': '⚠️ Travamento / Congelamento',
        'candidato_incorreto': '👤 Candidato / Foto Incorreta',
        'lento': '🐢 Lentidão / Desempenho',
        'visual_quebrado': '🎨 Layout / Visual quebrado',
        'outro': '❓ Outro'
      };
      return map[p] || p || 'Geral';
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function exportarCsv() {
      const token = document.getElementById('adminToken').value.trim();
      window.location.href = '/api/feedback/export.csv?token=' + encodeURIComponent(token);
    }

    function exportarTestadores() {
      const token = document.getElementById('adminToken').value.trim();
      window.location.href = '/api/feedback/play-testers/export?token=' + encodeURIComponent(token);
    }

    // Inicialização automática
    carregarDados();
  </script>
</body>
</html>
`;

export { ACCESS_DASHBOARD_HTML } from './access-dashboard.html';

