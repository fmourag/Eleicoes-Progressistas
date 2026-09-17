# Modelo de Sustentabilidade e Apoio Cívico (PIX Oficial)

Documentação oficial do Eleições Progressistas v2.2.4.

---

## 1. Parâmetros Oficiais da Chave PIX

- **Tipo:** CELULAR
- **Chave no Payload EMVCo:** +5521971943298 (formato E.164)
- **Chave na UI:** (21) 97194-3298 (formato humano)
- **Favorecido Oficial:** Fernando Goncalves
- **Cidade:** Rio de Janeiro
- **Valor Sugerido Padrão:** R$ 3,00
- **TXID:** ***

---

## 2. Estrutura do Payload EMVCo (BR Code)

Payload oficial gerado (R$ 3,00):
```text
00020126360014br.gov.bcb.pix0114+552197194329852040000530398654043.005802BR5918Fernando Goncalves6014Rio de Janeiro62070503***63043F9F
```

---

## 3. Preservação de Dados de Contato e DPO (Regra de Ouro 2)

- O e-mail `fmourag@gmail.com` **NÃO É MAIS CHAVE PIX**, mas é preservado integralmente como canal de suporte ao usuário, DPO (LGPD) e User-Agent da integração TSE.

---

## 4. Migração Transparente no Storage

- O módulo `apps/mobile/src/storage/civic-support-storage.ts` migra chaves anteriores para `+5521971943298` de forma transparente na leitura, preservando `hasContributed` e `contributionDate`.
