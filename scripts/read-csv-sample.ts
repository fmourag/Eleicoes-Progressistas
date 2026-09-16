import * as fs from 'fs';
import * as readline from 'readline';

async function readCsvSample() {
  const fileStream = fs.createReadStream('tmp/extracted/consulta_cand_2026_RJ.csv', { encoding: 'latin1' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let count = 0;
  for await (const line of rl) {
    if (count === 0) {
      const headers = line.split(';').map(h => h.replace(/"/g, ''));
      console.log('Headers:', headers);
    } else {
      const values = line.split(';').map(v => v.replace(/"/g, ''));
      console.log(`Row ${count}:`, {
        cargo: values[14],
        sqCandidato: values[15],
        nrCandidato: values[16],
        nmCandidato: values[17],
        nmUrna: values[18],
        sgPartido: values[27],
      });
    }
    count++;
    if (count > 5) break;
  }
}
readCsvSample();
