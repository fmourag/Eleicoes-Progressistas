export const PRIVACY_HTML = `<!DOCTYPE html>
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
    <div class="meta"><strong>Vigência:</strong> 11 de setembro de 2026 • <strong>Versão:</strong> 2.2.2</div>

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

    <h2>10. Feedback Voluntário e Auditoria Cívica</h2>
    <p>Durante a fase de testes e homologação, os cidadãos e auditores cívicos podem enviar relatórios técnicos voluntários através do formulário de feedback (<code>/feedback</code>). Os dados coletados limitam-se a:</p>
    <ul>
        <li><strong>Protocolo de Atendimento:</strong> Código único gerado automaticamente no envio (ex.: <code>FB-1710000000-abcd</code>) para rastreamento técnico do relatório.</li>
        <li><strong>Informações do Dispositivo:</strong> Modelo e versão do sistema operacional (Android/iOS/Web) para reprodução de eventuais falhas.</li>
        <li><strong>Avaliação e Relato:</strong> Nota NPS (0-10), tipo de problema reportado e descrição textual voluntária.</li>
        <li><strong>Dados de Contato Opcionais:</strong> Nome e endereço de e-mail informados voluntariamente para esclarecimentos técnicos.</li>
    </ul>
    <p>A base legal para este tratamento é o <strong>Legítimo Interesse técnico e aprimoramento da ferramenta (Art. 7º, IX da LGPD)</strong>. Os dados não são compartilhados com terceiros e qualquer participante pode solicitar a exclusão de seu registro de feedback pelo canal <a href="mailto:fmourag@gmail.com">fmourag@gmail.com</a>.</p>

    <footer>
        <p>© 2026 Eleições Progressistas • Plataforma cívica sem fins lucrativos • Contato: <a href="mailto:fmourag@gmail.com">fmourag@gmail.com</a></p>
    </footer>
</body>
</html>`;

export const BETA_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beta Fechado — Eleições Progressistas 2026</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #222; max-width: 680px; margin: 0 auto; padding: 24px; background: #f9fbf9; }
        .header { text-align: center; margin-bottom: 24px; }
        h1 { color: #1B5E20; margin-bottom: 4px; }
        .subtitle { color: #555; font-size: 16px; }
        .qr-box { background: #fff; border: 2px dashed #1B5E20; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .qr-box img { width: 220px; height: 220px; display: block; margin: 0 auto 12px auto; }
        .btn { display: inline-block; background: #1B5E20; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 18px; transition: background 0.2s; }
        .btn:hover { background: #2E7D32; }
        .steps { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
        .steps ol { padding-left: 20px; margin: 0; }
        .steps li { margin-bottom: 10px; }
        .hash-box { background: #ECEFF1; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; word-break: break-all; margin: 16px 0; border: 1px solid #CFD8DC; }
        .badge { display: inline-block; background: #E8F5E9; color: #1B5E20; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: bold; }
        footer { text-align: center; font-size: 13px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
        a { color: #1B5E20; }
    </style>
</head>
<body>
    <div class="header">
        <span class="badge">BETA FECHADO v2.2.4</span>
        <h1>Eleições Progressistas 2026</h1>
        <p class="subtitle">Instalação direta para testadores e auditores cívicos</p>
    </div>

    <div class="qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fgithub.com%2Ffmourag%2FEleicoes-Progressistas%2Freleases%2Fdownload%2Fv2.2.4%2Feleicoes-progressistas-v2.2.4-beta.apk" alt="QR Code Download APK">
        <p style="margin-bottom: 16px; color: #555;">Escaneie com a câmera do celular ou clique abaixo:</p>
        <a href="https://github.com/fmourag/Eleicoes-Progressistas/releases/download/v2.2.4/eleicoes-progressistas-v2.2.4-beta.apk" class="btn">⬇️ Baixar APK v2.2.4</a>
    </div>

    <div class="steps">
        <h3 style="margin-top:0; color:#1B5E20;">📱 Como instalar em 3 passos:</h3>
        <ol>
            <li><strong>Baixe o APK</strong> através do botão acima ou escaneando o QR Code.</li>
            <li>Abra o arquivo baixado. Se o Android solicitar, selecione <strong>"Permitir desta fonte"</strong> nas configurações de segurança.</li>
            <li>Conclua a instalação e abra o aplicativo para iniciar seus testes.</li>
        </ol>
    </div>

    <div class="hash-box">
        <strong>🔐 Verificação de Integridade (SHA-256):</strong><br>
        05da0c763f4404929a61777c0be90fae795c17565565ac9fcd94228f713272bc
    </div>

    <p style="font-size: 13px; color: #666; text-align: center;">
        ℹ️ <em>Este é o canal oficial de distribuição do Beta Fechado até a homologação final na Google Play Store.</em>
    </p>

    <footer>
        <p>
            <a href="/privacidade">Política de Privacidade</a> • 
            <a href="https://github.com/fmourag/Eleicoes-Progressistas" target="_blank">Código no GitHub</a> • 
            Feedback: <a href="mailto:fmourag@gmail.com">fmourag@gmail.com</a>
        </p>
    </footer>
</body>
</html>`;

export const FEEDBACK_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback de Testes — Eleições Progressistas 2026</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #222; max-width: 640px; margin: 0 auto; padding: 20px; background: #f9fbf9; }
        .header { text-align: center; margin-bottom: 24px; }
        h1 { color: #1B5E20; margin-bottom: 4px; font-size: 24px; }
        .subtitle { color: #555; font-size: 15px; }
        .badge { display: inline-block; background: #E8F5E9; color: #1B5E20; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 8px; }
        .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e0e0e0; margin-bottom: 20px; }
        .form-group { margin-bottom: 18px; }
        label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; color: #333; }
        .label-desc { font-weight: normal; font-size: 12px; color: #666; margin-top: 2px; }
        input[type="text"], input[type="email"], select, textarea {
            width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 15px; box-sizing: border-box; transition: border-color 0.2s;
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
        .btn-submit {
            display: block; width: 100%; background: #1B5E20; color: #fff; border: none; padding: 16px; border-radius: 8px;
            font-weight: bold; font-size: 17px; cursor: pointer; transition: background 0.2s; margin-top: 10px;
        }
        .btn-submit:hover { background: #2E7D32; }
        .btn-submit:disabled { background: #a5d6a7; cursor: not-allowed; }
        .success-box { display: none; background: #E8F5E9; border-left: 5px solid #1B5E20; padding: 24px; border-radius: 8px; text-align: center; }
        .protocol-badge { display: inline-block; background: #1B5E20; color: #fff; font-family: monospace; font-size: 18px; padding: 6px 16px; border-radius: 6px; margin: 14px 0; word-break: break-all; }
        .error-msg { color: #d32f2f; font-size: 13px; margin-top: 4px; display: none; }
        footer { text-align: center; font-size: 13px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
        a { color: #1B5E20; }
    </style>
</head>
<body>
    <div class="header">
        <span class="badge">AUDITORIA CÍVICA ABERTA</span>
        <h1>Eleições Progressistas</h1>
        <p class="subtitle">Avaliação e feedback de homologação da versão 2.2.2</p>
    </div>

    <div class="card" id="formCard">
        <form id="feedbackForm">
            <input type="hidden" id="appVersion" name="appVersion" value="2.2.2">
            <input type="hidden" id="nps" name="nps" value="10">

            <div class="form-group">
                <label for="testerName">Seu Nome (para identificação voluntária — Opcional)</label>
                <input type="text" id="testerName" name="testerName" placeholder="Ex.: Maria Silva ou Auditor Cívico">
                <div class="label-desc">Opcional: qualquer cidadão pode enviar feedback aberto sem necessidade de cadastro.</div>
            </div>

            <div class="form-group">
                <label for="npsSelect">Qual a probabilidade de recomendar este app? (0 a 10) *</label>
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
                <label for="problema">Status do Teste / Problema Encontrado *</label>
                <select id="problema" name="problema" required>
                    <option value="nenhum">✅ Nenhum problema — Tudo funcionou com sucesso</option>
                    <option value="fotos">📸 Falha no carregamento de fotos</option>
                    <option value="layout">📱 Problema visual / texto cortado</option>
                    <option value="lentidao">⏳ Lentidão no carregamento de candidatos</option>
                    <option value="crash">💥 Fechamento inesperado do app</option>
                    <option value="outro">📝 Outro apontamento</option>
                </select>
            </div>

            <div class="form-group">
                <label for="descricao">Descrição dos Testes e Observações (Opcional)</label>
                <textarea id="descricao" name="descricao" rows="3" placeholder="Ex.: Testei deputados de SP e RJ, fotos carregaram em menos de 1s..."></textarea>
            </div>

            <div class="form-group">
                <label for="screenshotDesc">Descrição de Captura de Tela / Evidência (Opcional)</label>
                <input type="text" id="screenshotDesc" name="screenshotDesc" placeholder="Ex.: Print da aba Candidatos sem truncamento">
            </div>

            <div class="form-group">
                <label for="device">Dispositivo / Modelo *</label>
                <input type="text" id="device" name="device" required>
                <div class="label-desc">Preenchido automaticamente pelo navegador do seu aparelho.</div>
            </div>

            <div class="form-group">
                <label for="androidVersion">Versão do Sistema Operacional</label>
                <input type="text" id="androidVersion" name="androidVersion">
            </div>

            <div class="form-group">
                <label for="email">Seu E-mail (Opcional)</label>
                <input type="email" id="email" name="email" placeholder="Opcional para contato">
            </div>

            <button type="submit" class="btn-submit" id="submitBtn">🚀 Enviar Feedback de Teste</button>
            <div class="error-msg" id="submitError" style="margin-top: 10px; text-align: center;"></div>
        </form>
    </div>

    <div class="success-box" id="successBox">
        <h2 style="color: #1B5E20; margin-top: 0;">🎉 Feedback Registrado com Sucesso!</h2>
        <p>Seu reporte foi registrado e integrado à base de auditoria cívica da versão 2.2.2.</p>
        <div>Seu protocolo de feedback é:</div>
        <div class="protocol-badge" id="protocolBadge">FB-...</div>
        <p style="font-size: 14px; color: #555;">Muito obrigado por contribuir com a democracia e a transparência eleitoral! 🇧🇷</p>
        <p><a href="/beta" style="font-weight: bold; text-decoration: none;">← Voltar para a página de instalação Beta</a></p>
    </div>

    <footer>
        <p>
            <a href="/privacidade">Política de Privacidade</a> • 
            <a href="https://github.com/fmourag/Eleicoes-Progressistas" target="_blank">Código no GitHub</a> • 
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
                var match = ua.match(/Android\s([0-9\.]*)/i);
                os = match ? "Android " + match[1] : "Android";
                var devMatch = ua.match(/\((.*?)\)/);
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

        // Envio do formulário
        document.getElementById("feedbackForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            var submitBtn = document.getElementById("submitBtn");
            var submitError = document.getElementById("submitError");
            submitError.style.display = "none";

            submitBtn.disabled = true;
            submitBtn.innerText = "⏳ Enviando dados de teste...";

            var testerNameVal = document.getElementById("testerName").value.trim();

            var payload = {
                testerName: testerNameVal || undefined,
                nome: testerNameVal || undefined,
                email: document.getElementById("email").value.trim() || undefined,
                device: document.getElementById("device").value,
                androidVersion: document.getElementById("androidVersion").value || undefined,
                appVersion: document.getElementById("appVersion").value,
                nps: parseInt(document.getElementById("nps").value, 10),
                problema: document.getElementById("problema").value,
                descricao: document.getElementById("descricao").value.trim() || undefined,
                screenshotDesc: document.getElementById("screenshotDesc").value.trim() || undefined
            };

            try {
                var response = await fetch("/api/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    var errData = await response.json().catch(function() { return {}; });
                    throw new Error(errData.message || ("Erro " + response.status + " ao registrar feedback"));
                }

                var data = await response.json();
                document.getElementById("protocolBadge").innerText = data.protocol || ("FB-" + data.id);
                document.getElementById("formCard").style.display = "none";
                document.getElementById("successBox").style.display = "block";
                window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (err) {
                submitError.innerText = "❌ " + err.message;
                submitError.style.display = "block";
                submitBtn.disabled = false;
                submitBtn.innerText = "🚀 Enviar Feedback de Teste";
            }
        });
    </script>
</body>
</html>
`;

export const DASHBOARD_HTML = `<!DOCTYPE html>
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
      <div class="auth-bar">
        <input type="password" id="adminToken" placeholder="Token Admin (ex: dev-secret)" value="dev-secret">
        <button class="btn" onclick="carregarDados()">Carregar</button>
        <button class="btn btn-secondary" onclick="exportarCsv()">📥 CSV</button>
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
          row.innerHTML = '<div class="bar-label">' + formatarProblema(nome) + '</div>' +
            '<div class="bar-track"><div class="bar-fill" style="width: ' + pct + '%"></div></div>' +
            '<div class="bar-count">' + count + ' <span style="font-size: 11px; color: #8b949e;">(' + pct + '%)</span></div>';
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

        tr.innerHTML = '<td><span class="protocol-tag">' + (f.protocol || '-') + '</span></td>' +
          '<td>' + dt + '</td>' +
          '<td><strong>' + escapeHtml(f.testerName || 'Anônimo') + '</strong><br><small style="color: #8b949e;">' + escapeHtml(f.email || '-') + '</small></td>' +
          '<td><span style="font-weight: 800; font-size: 15px; color: ' + (f.nps >= 8 ? '#3fb950' : f.nps >= 6 ? '#d29922' : '#f85149') + '">' + f.nps + '</span></td>' +
          '<td><span class="problem-tag ' + probClass + '">' + formatarProblema(f.problema) + '</span></td>' +
          '<td><small>' + escapeHtml(f.device || '-') + ' (v' + escapeHtml(f.appVersion || '-') + ')</small></td>' +
          '<td style="max-width: 340px; word-break: break-word;">' + escapeHtml(f.descricao || '-') + '</td>';
        tbody.appendChild(tr);
      });
    }

    function filtrarTabela() {
      const q = document.getElementById('filterInput').value.toLowerCase();
      const filtrados = rawFeedbacks.filter(f => {
        const str = (f.protocol + ' ' + f.testerName + ' ' + f.email + ' ' + f.problema + ' ' + f.device + ' ' + f.descricao).toLowerCase();
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

    // Inicialização automática
    carregarDados();
  </script>
</body>
</html>
`;
