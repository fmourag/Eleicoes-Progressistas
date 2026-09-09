const http = require('http');

async function doFetch(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    console.log("--- E2E START ---");
    
    const authRes = await doFetch('/auth/dev-login', 'POST', { email: 'test@test.com' });
    console.log("1. auth/dev-login:", authRes.status, !!authRes.body.access_token ? "JWT Válido" : "Falhou");
    
    const matchRes = await doFetch('/matching/compute', 'POST', {
      priority_pillars: ['p1', 'p2', 'p3'],
      location: { uf: 'SP', ibge_code: '3550308' }
    });
    console.log("2. matching/compute:", matchRes.status, "Results:", matchRes.body.results?.length);
    if (matchRes.body.results?.length > 0) {
      console.log("   First match:", matchRes.body.results[0].matchReason);
    }
    
    const candRes = await doFetch('/candidates?state=SP', 'GET');
    console.log("3. candidates GET:", candRes.status, "Length:", candRes.body?.length);
    if (candRes.body?.length > 0) {
      const all2026 = candRes.body.every(c => c.electionYear === 2026);
      const hasBadges = candRes.body.every(c => c.candidaturaStatus);
      const hasCommitmentScores = candRes.body.every(c => typeof c.overallCommitmentScore === 'number');
      console.log("   All 2026?", all2026);
      console.log("   Has badges?", hasBadges);
      console.log("   Has commitment scores?", hasCommitmentScores, `(Ex: ${candRes.body[0].overallCommitmentScore}%)`);
      
      const testCandId = candRes.body[0].id;

      // 4. TSE Source Info
      const tseInfoRes = await doFetch('/candidates/tse/source-info', 'GET');
      console.log("4. TSE Source Info:", tseInfoRes.status, tseInfoRes.body?.provider, tseInfoRes.body?.status);

      // 5. TSE Candidate Detail
      const tseDetailRes = await doFetch(`/candidates/${testCandId}/tse-detail`, 'GET');
      console.log("5. TSE Detail GET:", tseDetailRes.status, "Total Bens:", tseDetailRes.body?.totalBens > 0 ? "Declarados" : "N/A");

      // 6. Campaign Finances
      const finRes = await doFetch(`/candidates/${testCandId}/finances`, 'GET');
      console.log("6. TSE Finances GET:", finRes.status, "Total Recebido: R$", finRes.body?.totalRecebido?.toLocaleString('pt-BR'));

      // 7. Sync TSE on demand
      const syncRes = await doFetch('/candidates/sync-tse', 'POST', { candidateId: testCandId });
      console.log("7. TSE Sync POST:", syncRes.status, syncRes.body?.success ? "Sincronizado" : "Erro", syncRes.body?.message);

      // 8. Raio-X GET & 13 Pillars Classification
      const raioXRes = await doFetch(`/candidates/${testCandId}/raio-x`, 'GET');
      const cls = raioXRes.body?.classification;
      const educacaoPillar = cls?.pillars?.find(p => p.pillarId === 'p11');
      const trabalhoPillar = cls?.pillars?.find(p => p.pillarId === 'p12');
      const empreendedorismoPillar = cls?.pillars?.find(p => p.pillarId === 'p13');
      const validPillars = cls && cls.pillars?.length === 13 && cls.pillars.every(p => 
        p.score >= 0 && 
        p.evidencias?.votacoes?.length > 0 && 
        p.evidencias?.pronunciamentos?.length > 0 && 
        p.evidencias?.posturas?.length > 0
      );
      console.log("8. Raio-X & 13 Pilares GET:", raioXRes.status, 
        "OverallScore:", `${cls?.overallScore}%`, 
        "Rating:", cls?.overallRating,
        "13 Pilares Auditáveis?", validPillars ? "SIM (13/13 com Votações, Pronunciamentos e Posturas)" : "NÃO",
        "Pilar Trabalho?", trabalhoPillar ? `SIM (${trabalhoPillar.score}% - ${trabalhoPillar.label})` : "NÃO",
        "Pilar Empreendedorismo?", empreendedorismoPillar ? `SIM (${empreendedorismoPillar.score}% - ${empreendedorismoPillar.label})` : "NÃO"
      );

      // 9. Pesquisa Eleitoral Homologada & Auditoria de Independência
      const allCandsRes = await doFetch('/candidates', 'GET');
      const allCands = allCandsRes.body || [];
      const lulaCand = allCands.find(c => c.name.includes('Lula'));
      const molonCand = allCands.find(c => c.name.includes('Molon'));
      if (lulaCand) {
        const lulaRaioX = await doFetch(`/candidates/${lulaCand.id}/raio-x`, 'GET');
        const pollResult = lulaRaioX.body?.pollResult;
        console.log("9. Pesquisa Eleitoral Homologada (Lula - Presidente):",
          "Homologada TSE?", pollResult?.audit?.homologadoTse ? `SIM (${pollResult?.poll?.tseRegistro})` : "NÃO",
          "Percentual no Cargo:", `${pollResult?.candidatePercentual}%`,
          "Diferença / Status:", pollResult?.diferenca?.texto,
          "Auditoria Ética (≤ 10 dias e sem conflito de interesse):", pollResult?.audit?.seloConformidade ? "APROVADA" : "REJEITADA"
        );
      }
      if (molonCand) {
        const molonRaioX = await doFetch(`/candidates/${molonCand.id}/raio-x`, 'GET');
        const pollResult = molonRaioX.body?.pollResult;
        console.log("   Pesquisa Eleitoral Homologada (Molon - Senador RJ):",
          "Percentual no Cargo:", `${pollResult?.candidatePercentual}%`,
          "Diferença para o Líder:", pollResult?.diferenca?.texto
        );
      }
    }
    
    console.log("--- E2E END ---");
  } catch (err) {
    console.error("E2E ERROR", err);
  }
}
run();
