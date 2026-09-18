export const ACCESS_DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monitor de Acessos e Downloads — Eleições Progressistas</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-heading: #f0f6fc;
      --accent: #238636;
      --accent-hover: #2ea043;
      --primary-blue: #1f6feb;
      --purple: #8957e5;
      --amber: #d29922;
      --cyan: #39c5cf;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px 16px;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .logo-title h1 {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-heading);
      letter-spacing: -0.5px;
    }
    .logo-title p {
      font-size: 14px;
      color: #8b949e;
      margin-top: 2px;
    }
    .top-nav {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
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
    select {
      background: #0d1117;
      border: 1px solid var(--border);
      color: var(--text-heading);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
    }

    /* Privacy Banner */
    .privacy-banner {
      background: rgba(35, 134, 54, 0.1);
      border: 1px solid rgba(35, 134, 54, 0.3);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: #7ee787;
    }

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
      font-size: 12px;
      font-weight: 700;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .card-value {
      font-size: 34px;
      font-weight: 800;
      color: var(--text-heading);
      margin: 10px 0 6px;
    }
    .card-sub {
      font-size: 13px;
      color: #8b949e;
    }
    .badge-today {
      display: inline-block;
      background: rgba(57, 197, 207, 0.15);
      color: var(--cyan);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
    }

    /* Charts & Visuals */
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-heading);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chart-container {
      margin-bottom: 24px;
    }
    .chart-svg-wrap {
      width: 100%;
      height: 240px;
      position: relative;
    }
    .legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #8b949e;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    /* Breakdown section */
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .bar-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 12px;
    }
    .bar-label {
      width: 110px;
      font-size: 13px;
      color: var(--text-heading);
    }
    .bar-track {
      flex: 1;
      height: 10px;
      background: #21262d;
      border-radius: 5px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 5px;
      transition: width 0.5s ease;
    }
    .bar-count {
      width: 60px;
      text-align: right;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-heading);
    }

    /* Table */
    .table-wrap {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
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

    .spinner {
      text-align: center;
      padding: 40px;
      color: #8b949e;
    }
    footer {
      text-align: center;
      padding-top: 30px;
      margin-top: 30px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: #6e7681;
    }
    footer a { color: var(--text); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-title">
        <h1>📊 Monitor de Acessos e Downloads</h1>
        <p>Eleições Progressistas 2026 — Telemetria Cívica em Tempo Real</p>
      </div>
      <div class="top-nav">
        <select id="periodSelect" onchange="carregarDados()">
          <option value="7">Últimos 7 dias</option>
          <option value="14">Últimos 14 dias</option>
          <option value="30" selected>Últimos 30 dias</option>
        </select>
        <button class="btn btn-secondary" onclick="carregarDados()">🔄 Atualizar</button>
        <button class="btn btn-secondary" onclick="exportarCsv()">📥 CSV</button>
        <a href="/web/" target="_blank" class="btn">🌐 Abrir Web App</a>
      </div>
    </header>

    <div class="privacy-banner">
      <span style="font-size: 18px;">🔒</span>
      <span><strong>Privacidade Radical por Design (LGPD Art. 7º):</strong> Este painel opera sob o Princípio da Coleta Zero. Não são armazenados endereços IP, localização de usuários ou dados de navegação individual. Apenas contadores agregados de acessos e downloads.</span>
    </div>

    <div id="loading" class="spinner">Carregando métricas de acesso...</div>

    <div id="content" style="display: none;">
      <!-- Métricas Principais -->
      <div class="metrics-grid">
        <div class="card">
          <div class="card-label">🌐 Acessos Versão Web</div>
          <div class="card-value" id="webTotal" style="color: var(--cyan);">0</div>
          <div class="card-sub">
            Hoje: <span class="badge-today" id="webToday">+0</span> • 7d: <strong id="webWeek">0</strong>
          </div>
        </div>

        <div class="card">
          <div class="card-label">📱 Downloads do APK Android</div>
          <div class="card-value" id="apkTotal" style="color: #3fb950;">0</div>
          <div class="card-sub">
            Hoje: <span class="badge-today" id="apkToday">+0</span> • 7d: <strong id="apkWeek">0</strong>
          </div>
        </div>

        <div class="card">
          <div class="card-label">📢 Recomendações / Shares</div>
          <div class="card-value" id="shareTotal" style="color: var(--purple);">0</div>
          <div class="card-sub">
            Hoje: <span class="badge-today" id="shareToday">+0</span> • WhatsApp / E-mail
          </div>
        </div>

        <div class="card">
          <div class="card-label">🎯 Conversão Web ➔ APK</div>
          <div class="card-value" id="convRate" style="color: var(--amber);">0.0%</div>
          <div class="card-sub">Taxa de migração para uso 100% offline</div>
        </div>
      </div>

      <!-- Gráfico de Barras Diário -->
      <div class="card chart-container">
        <div class="section-title">
          <span>Evolução Diária de Acessos & Downloads</span>
          <div class="legend">
            <div class="legend-item"><div class="legend-color" style="background: var(--cyan);"></div> Acessos Web</div>
            <div class="legend-item"><div class="legend-color" style="background: #3fb950;"></div> Downloads APK</div>
            <div class="legend-item"><div class="legend-color" style="background: var(--purple);"></div> Compartilhamentos</div>
          </div>
        </div>
        <div class="chart-svg-wrap" id="chartSvg"></div>
      </div>

      <!-- Breakdown de Dispositivos e Compartilhamento -->
      <div class="breakdown-grid">
        <div class="card">
          <div class="section-title">Distribuição por Dispositivo</div>
          <div id="deviceBreakdown"></div>
        </div>

        <div class="card">
          <div class="section-title">Canais de Compartilhamento</div>
          <div id="shareBreakdown"></div>
        </div>
      </div>

      <!-- Tabela Diária -->
      <div class="card">
        <div class="section-title">Histórico Diário Detalhado</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>🌐 Acessos Web</th>
                <th>📱 Downloads APK</th>
                <th>📢 Compartilhamentos</th>
                <th>Total Interações</th>
              </tr>
            </thead>
            <tbody id="historyTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <footer>
      <p>
        <a href="/web/">Eleições Progressistas Web</a> • 
        <a href="/download/apk">Download APK Android</a> • 
        <a href="/privacidade">Política de Privacidade</a> • 
        <a href="https://github.com/fmourag/Eleicoes-Progressistas" target="_blank">Código Aberto no GitHub</a>
      </p>
    </footer>
  </div>

  <script>
    async function carregarDados() {
      const days = document.getElementById('periodSelect').value;
      document.getElementById('loading').style.display = 'block';
      document.getElementById('content').style.display = 'none';

      try {
        const res = await fetch('/api/telemetry/dashboard?days=' + days);
        if (!res.ok) throw new Error('Falha ao carregar telemetria');
        const data = await res.json();
        renderizar(data);
      } catch (err) {
        document.getElementById('loading').innerHTML = '⚠️ Erro ao carregar dados de telemetria. Tente novamente.';
      }
    }

    function renderizar(data) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('content').style.display = 'block';

      const s = data.summary;
      document.getElementById('webTotal').innerText = Number(s.totalWebVisits).toLocaleString('pt-BR');
      document.getElementById('webToday').innerText = '+' + Number(s.todayWebVisits).toLocaleString('pt-BR');
      document.getElementById('webWeek').innerText = Number(s.weekWebVisits).toLocaleString('pt-BR');

      document.getElementById('apkTotal').innerText = Number(s.totalApkDownloads).toLocaleString('pt-BR');
      document.getElementById('apkToday').innerText = '+' + Number(s.todayApkDownloads).toLocaleString('pt-BR');
      document.getElementById('apkWeek').innerText = Number(s.weekApkDownloads).toLocaleString('pt-BR');

      document.getElementById('shareTotal').innerText = Number(s.totalShares).toLocaleString('pt-BR');
      document.getElementById('shareToday').innerText = '+' + Number(s.todayShares).toLocaleString('pt-BR');

      document.getElementById('convRate').innerText = s.conversionRate;

      renderChart(data.dailyHistory);
      renderDevices(data.deviceBreakdown);
      renderShares(data.shareBreakdown);
      renderTable(data.dailyHistory);
    }

    function renderChart(history) {
      const container = document.getElementById('chartSvg');
      if (!history || history.length === 0) {
        container.innerHTML = '<p style=\"color: #8b949e; text-align: center; padding-top: 80px;\">Nenhum dado registrado para o período.</p>';
        return;
      }

      const maxVal = Math.max(1, ...history.map(h => Math.max(h.webVisits, h.apkDownloads, h.shares)));
      const width = container.clientWidth || 800;
      const height = 220;
      const barGroupWidth = width / history.length;
      const barWidth = Math.max(2, Math.min(10, (barGroupWidth - 6) / 3));

      let svg = '<svg width=\"100%\" height=\"' + height + '\" viewBox=\"0 0 ' + width + ' ' + height + '\">';
      
      // Grid lines
      for (let i = 0; i <= 4; i++) {
        const y = height - 25 - (i * (height - 40) / 4);
        svg += '<line x1=\"0\" y1=\"' + y + '\" x2=\"' + width + '\" y2=\"' + y + '\" stroke=\"#21262d\" stroke-dasharray=\"3\" />';
      }

      history.forEach((h, idx) => {
        const xCenter = idx * barGroupWidth + barGroupWidth / 2;
        const hWeb = (h.webVisits / maxVal) * (height - 45);
        const hApk = (h.apkDownloads / maxVal) * (height - 45);
        const hShare = (h.shares / maxVal) * (height - 45);

        const yWeb = height - 25 - hWeb;
        const yApk = height - 25 - hApk;
        const yShare = height - 25 - hShare;

        // Bars
        svg += '<rect x=\"' + (xCenter - barWidth * 1.5) + '\" y=\"' + yWeb + '\" width=\"' + barWidth + '\" height=\"' + hWeb + '\" fill=\"#39c5cf\" rx=\"2\"><title>' + h.date + ': ' + h.webVisits + ' acessos web</title></rect>';
        svg += '<rect x=\"' + (xCenter - barWidth * 0.5) + '\" y=\"' + yApk + '\" width=\"' + barWidth + '\" height=\"' + hApk + '\" fill=\"#3fb950\" rx=\"2\"><title>' + h.date + ': ' + h.apkDownloads + ' downloads APK</title></rect>';
        svg += '<rect x=\"' + (xCenter + barWidth * 0.5) + '\" y=\"' + yShare + '\" width=\"' + barWidth + '\" height=\"' + hShare + '\" fill=\"#8957e5\" rx=\"2\"><title>' + h.date + ': ' + h.shares + ' compartilhamentos</title></rect>';

        // Date label (every N bars)
        const step = Math.ceil(history.length / 8);
        if (idx % step === 0 || idx === history.length - 1) {
          const parts = h.date.split('-');
          const label = parts[2] + '/' + parts[1];
          svg += '<text x=\"' + xCenter + '\" y=\"' + (height - 6) + '\" fill=\"#8b949e\" font-size=\"10\" text-anchor=\"middle\">' + label + '</text>';
        }
      });

      svg += '</svg>';
      container.innerHTML = svg;
    }

    function renderDevices(devices) {
      const container = document.getElementById('deviceBreakdown');
      if (!devices || devices.length === 0) {
        container.innerHTML = '<p style=\"color:#8b949e;\">Nenhum dispositivo registrado.</p>';
        return;
      }
      const labels = { desktop: '💻 Computador / Desktop', mobile: '📱 Celular / Smartphone', tablet: '📟 Tablet', unknown: '❓ Outros' };
      const colors = { desktop: '#1f6feb', mobile: '#3fb950', tablet: '#8957e5', unknown: '#8b949e' };

      let html = '';
      devices.forEach(d => {
        const name = labels[d.device] || d.device;
        const color = colors[d.device] || '#39c5cf';
        html += '<div class=\"bar-row\">' +
          '<div class=\"bar-label\">' + name + '</div>' +
          '<div class=\"bar-track\"><div class=\"bar-fill\" style=\"width: ' + d.percentage + '; background: ' + color + ';\"></div></div>' +
          '<div class=\"bar-count\">' + d.count + ' <span style=\"font-size:11px;color:#8b949e;\">(' + d.percentage + ')</span></div>' +
          '</div>';
      });
      container.innerHTML = html;
    }

    function renderShares(shares) {
      const container = document.getElementById('shareBreakdown');
      const labels = { whatsapp: '💬 WhatsApp', email: '✉️ E-mail', copy: '📋 Copiar Mensagem', other: '📤 Outros / Nativo' };
      const colors = { whatsapp: '#25D366', email: '#1f6feb', copy: '#d29922', other: '#8957e5' };

      const total = shares.reduce((acc, cur) => acc + cur.count, 0) || 1;
      let html = '';
      shares.forEach(s => {
        const name = labels[s.channel] || s.channel;
        const color = colors[s.channel] || '#8957e5';
        const pct = ((s.count / total) * 100).toFixed(1) + '%';
        html += '<div class=\"bar-row\">' +
          '<div class=\"bar-label\">' + name + '</div>' +
          '<div class=\"bar-track\"><div class=\"bar-fill\" style=\"width: ' + pct + '; background: ' + color + ';\"></div></div>' +
          '<div class=\"bar-count\">' + s.count + '</div>' +
          '</div>';
      });
      container.innerHTML = html;
    }

    function renderTable(history) {
      const tbody = document.getElementById('historyTableBody');
      const reversed = [...history].reverse();
      let html = '';
      reversed.forEach(h => {
        const total = h.webVisits + h.apkDownloads + h.shares;
        html += '<tr>' +
          '<td><strong>' + h.date + '</strong></td>' +
          '<td style=\"color: var(--cyan);\">' + h.webVisits + '</td>' +
          '<td style=\"color: #3fb950;\">' + h.apkDownloads + '</td>' +
          '<td style=\"color: var(--purple);\">' + h.shares + '</td>' +
          '<td><strong>' + total + '</strong></td>' +
          '</tr>';
      });
      tbody.innerHTML = html;
    }

    function exportarCsv() {
      window.location.href = '/api/telemetry/csv';
    }

    carregarDados();
    setInterval(carregarDados, 30000);
  </script>
</body>
</html>
`;
