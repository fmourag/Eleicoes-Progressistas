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

    <h2>10. Feedback Voluntário e Programa Beta</h2>
    <p>Durante a fase de testes e homologação, os usuários e auditores cívicos podem enviar relatórios técnicos voluntários através do formulário de feedback (<code>/feedback</code>). Os dados coletados limitam-se a:</p>
    <ul>
        <li><strong>Identificador de Teste (Código do Tester):</strong> Código obrigatório (ex.: EP-001) para atribuição técnica da rodada de testes.</li>
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
        <span class="badge">BETA FECHADO v2.2.2</span>
        <h1>Eleições Progressistas 2026</h1>
        <p class="subtitle">Instalação direta para testadores e auditores cívicos</p>
    </div>

    <div class="qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fexpo.dev%2Fartifacts%2Feas%2FzSlf3TyP6zzq1JIrp6kVTG1sLQotTr8HNDYZgi60Lug.apk" alt="QR Code Download APK">
        <p style="margin-bottom: 16px; color: #555;">Escaneie com a câmera do celular ou clique abaixo:</p>
        <a href="https://expo.dev/artifacts/eas/zSlf3TyP6zzq1JIrp6kVTG1sLQotTr8HNDYZgi60Lug.apk" class="btn">⬇️ Baixar APK v2.2.2 (61,44 MB)</a>
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
        9b8f1a71f1d786eefc711c646785c9ed87338c3957a3bf6926db889bd757d6c7
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
        .code-input { font-family: monospace; font-weight: bold; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; }
        .nps-container { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .nps-btn {
            flex: 1 0 calc(9% - 6px); min-width: 36px; height: 42px; border: 1px solid #ccc; background: #fff; border-radius: 6px;
            font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justifyContent: center;
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
        .protocol-badge { display: inline-block; background: #1B5E20; color: #fff; font-family: monospace; font-size: 18px; padding: 6px 16px; border-radius: 6px; margin: 14px 0; }
        .error-msg { color: #d32f2f; font-size: 13px; margin-top: 4px; display: none; }
        footer { text-align: center; font-size: 13px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
        a { color: #1B5E20; }
    </style>
</head>
<body>
    <div class="header">
        <span class="badge">BETA TESTER FEEDBACK</span>
        <h1>Eleições Progressistas</h1>
        <p class="subtitle">Avaliação individualizada de homologação e desempenho (v2.2.2)</p>
    </div>

    <div class="card" id="formCard">
        <form id="feedbackForm">
            <input type="hidden" id="appVersion" name="appVersion" value="2.2.2">
            <input type="hidden" id="nps" name="nps" value="10">

            <div class="form-group">
                <label for="testerCode">Código do Tester *</label>
                <input type="text" id="testerCode" name="testerCode" class="code-input" placeholder="EP-001" required maxlength="6" pattern="^EP-\d{3}$">
                <div class="label-desc">Seu código individual de homologação (ex.: EP-001 até EP-050).</div>
                <div class="error-msg" id="codeError">Por favor, informe um código válido no formato EP-001.</div>
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
                <label for="nome">Seu Nome (Opcional)</label>
                <input type="text" id="nome" name="nome" placeholder="Opcional para auditoria cívica">
            </div>

            <div class="form-group">
                <label for="email">Seu E-mail (Opcional)</label>
                <input type="email" id="email" name="email" placeholder="Opcional">
            </div>

            <button type="submit" class="btn-submit" id="submitBtn">🚀 Enviar Feedback de Teste</button>
            <div class="error-msg" id="submitError" style="margin-top: 10px; text-align: center;"></div>
        </form>
    </div>

    <div class="success-box" id="successBox">
        <h2 style="color: #1B5E20; margin-top: 0;">🎉 Feedback Registrado com Sucesso!</h2>
        <p>Seu reporte foi auditado e integrado à base de controle de qualidade da versão 2.2.2.</p>
        <div>Protocolo de Homologação:</div>
        <div class="protocol-badge" id="protocolBadge">FB-000</div>
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

            // Pré-preenchimento via query param ?code=EP-XXX
            var params = new URLSearchParams(window.location.search);
            if (params.has("code")) {
                var c = params.get("code").trim().toUpperCase();
                document.getElementById("testerCode").value = c;
            }
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
            var codeError = document.getElementById("codeError");
            submitError.style.display = "none";
            codeError.style.display = "none";

            var code = document.getElementById("testerCode").value.trim().toUpperCase();
            if (!/^EP-\d{3}$/.test(code)) {
                codeError.style.display = "block";
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerText = "⏳ Enviando dados de teste...";

            var payload = {
                testerCode: code,
                nome: document.getElementById("nome").value || undefined,
                email: document.getElementById("email").value || undefined,
                device: document.getElementById("device").value,
                androidVersion: document.getElementById("androidVersion").value || undefined,
                appVersion: document.getElementById("appVersion").value,
                nps: parseInt(document.getElementById("nps").value, 10),
                problema: document.getElementById("problema").value,
                descricao: document.getElementById("descricao").value || undefined,
                screenshotDesc: document.getElementById("screenshotDesc").value || undefined
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

