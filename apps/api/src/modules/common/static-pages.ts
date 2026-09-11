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
    <div class="meta"><strong>Vigência:</strong> 10 de setembro de 2026 • <strong>Versão:</strong> 2.2.0</div>

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
    <p>Como a aplicação não mantém banco de dados cadastrais de eleitores, não há perfis a serem retificados ou excluídos. Quaisquer dúvidas ou solicitações referentes à privacidade podem ser encaminhadas ao Encarregado pelo e-mail: <a href="mailto:contato@eleicoesprogressistas.org.br">contato@eleicoesprogressistas.org.br</a>.</p>

    <h2>6. Segurança da Informação</h2>
    <p>Todas as comunicações com a API de dados públicos do TSE utilizam criptografia de ponta a ponta (HTTPS/TLS com HSTS). As chaves de acesso a infraestrutura e credenciais são isoladas e mantidas fora do repositório público de código.</p>

    <h2>7. Classificação Etária</h2>
    <p>O aplicativo destina-se a eleitores e cidadãos em idade de voto (a partir de 16 anos). Não coletamos intencionalmente qualquer informação de menores de 13 anos.</p>

    <h2>8. Atualizações desta Política</h2>
    <p>Eventuais revisões desta política serão publicadas nesta página e comunicadas mediante nota de versão no aplicativo e no repositório de código.</p>

    <h2>9. Transparência Radical e Código Aberto</h2>
    <p>O código-fonte integral da plataforma é auditável publicamente no GitHub: <a href="https://github.com/fmourag/Eleicoes-Progressistas" target="_blank">github.com/fmourag/Eleicoes-Progressistas</a>.</p>

    <footer>
        <p>© 2026 Eleições Progressistas • Plataforma cívica sem fins lucrativos • Contato: <a href="mailto:contato@eleicoesprogressistas.org.br">contato@eleicoesprogressistas.org.br</a></p>
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
        <span class="badge">BETA FECHADO v2.2.0</span>
        <h1>Eleições Progressistas 2026</h1>
        <p class="subtitle">Instalação direta para testadores e auditores cívicos</p>
    </div>

    <div class="qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fexpo.dev%2Fartifacts%2Feas%2Fi98yWifkjiVUziUocuoeHY5yJ1wMsqgUv346HfCOi40.apk" alt="QR Code Download APK">
        <p style="margin-bottom: 16px; color: #555;">Escaneie com a câmera do celular ou clique abaixo:</p>
        <a href="https://expo.dev/artifacts/eas/i98yWifkjiVUziUocuoeHY5yJ1wMsqgUv346HfCOi40.apk" class="btn">⬇️ Baixar APK (61,44 MB)</a>
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
        7686A9EEDBE6C0EC2463AD59557583612A6CBBEB49BB0963285DF28F04553351
    </div>

    <p style="font-size: 13px; color: #666; text-align: center;">
        ℹ️ <em>Este é o canal oficial de distribuição do Beta Fechado até a homologação final na Google Play Store.</em>
    </p>

    <footer>
        <p>
            <a href="/privacidade">Política de Privacidade</a> • 
            <a href="https://github.com/fmourag/Eleicoes-Progressistas" target="_blank">Código no GitHub</a> • 
            Feedback: <a href="mailto:contato@eleicoesprogressistas.org.br">contato@eleicoesprogressistas.org.br</a>
        </p>
    </footer>
</body>
</html>`;
