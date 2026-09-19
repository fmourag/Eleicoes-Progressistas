import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Header,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import * as crypto from 'crypto';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

function isValidAdmin(provided?: string): boolean {
  if (!provided || typeof provided !== 'string') return false;
  const clean = provided.trim();
  const isProduction = process.env.NODE_ENV === 'production';
  const allowed: string[] = [
    process.env.ADMIN_SECRET,
    process.env.ADMIN_FEEDBACK_TOKEN,
  ].filter(Boolean) as string[];

  // Segredos de teste permitidos estritamente fora de produção
  if (!isProduction) {
    allowed.push('dev-secret', 'admin123');
  }

  if (allowed.length === 0) return false;

  for (const secret of allowed) {
    try {
      const providedBuf = Buffer.from(clean);
      const secretBuf = Buffer.from(secret);
      if (providedBuf.length === secretBuf.length && crypto.timingSafeEqual(providedBuf, secretBuf)) {
        return true;
      }
    } catch {}
  }
  return false;
}

const DASHBOARD_HTML = `<!DOCTYPE html>
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
          row.innerHTML = \`
            <div class="bar-label">\${formatarProblema(nome)}</div>
            <div class="bar-track"><div class="bar-fill" style="width: \${pct}%"></div></div>
            <div class="bar-count">\${count} <span style="font-size: 11px; color: #8b949e;">(\${pct}%)</span></div>
          \`;
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

        tr.innerHTML = \`
          <td><span class="protocol-tag">\${f.protocol || '-'}</span></td>
          <td>\${dt}</td>
          <td><strong>\${escapeHtml(f.testerName || 'Anônimo')}</strong><br><small style="color: #8b949e;">\${escapeHtml(f.email || '-')}</small></td>
          <td><span style="font-weight: 800; font-size: 15px; color: \${f.nps >= 8 ? '#3fb950' : f.nps >= 6 ? '#d29922' : '#f85149'}">\${f.nps}</span></td>
          <td><span class="problem-tag \${probClass}">\${formatarProblema(f.problema)}</span></td>
          <td><small>\${escapeHtml(f.device || '-')} (v\${escapeHtml(f.appVersion || '-')})</small></td>
          <td style="max-width: 340px; word-break: break-word;">\${escapeHtml(f.descricao || '-')}</td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function filtrarTabela() {
      const q = document.getElementById('filterInput').value.toLowerCase();
      const filtrados = rawFeedbacks.filter(f => {
        const str = \`\${f.protocol} \${f.testerName} \${f.email} \${f.problema} \${f.device} \${f.descricao}\`.toLowerCase();
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
      window.location.href = '/api/feedback/testers.csv?token=' + encodeURIComponent(token);
    }

    // Inicialização automática
    carregarDados();
  </script>
</body>
</html>`;

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Get('painel')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getPainel() {
    return DASHBOARD_HTML;
  }

  @Get('dashboard-view')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getDashboardView() {
    return DASHBOARD_HTML;
  }

  @Get('dashboard')
  async getDashboard(
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('token') queryToken?: string,
    @Query('key') queryKey?: string,
  ) {
    const token = adminToken || adminKey || queryToken || queryKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }
    return this.feedbackService.getDashboard();
  }

  @Get('export.csv')
  async exportCsv(
    @Res() res: Response,
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('token') queryToken?: string,
    @Query('key') queryKey?: string,
  ) {
    const token = adminToken || adminKey || queryToken || queryKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }

    const csvData = await this.feedbackService.getExportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="feedback-export-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvData);
  }

  @Get('testers.csv')
  async exportTestersCsv(
    @Res() res: Response,
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('token') queryToken?: string,
    @Query('key') queryKey?: string,
  ) {
    const token = adminToken || adminKey || queryToken || queryKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }

    const testersData = await this.feedbackService.getPlayStoreTestersCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="google-play-testers-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(testersData);
  }
}
