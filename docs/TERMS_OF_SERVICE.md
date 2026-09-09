---
title: "Termos de Uso"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Termos de Uso — Eleições Progressistas

**Mantenedora:** [NOME_DA_ENTIDADE_MANTENEDORA]  
**Vigência:** [DATA_DE_VIGÊNCIA]  
**Contato:** [EMAIL_DPO]  

> **Resumo:** Condições legais de utilização da aplicação, isenção de responsabilidade sobre recomendação eleitoral, e regras de propriedade intelectual.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Priorities Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Watchdog (Observatório de Mandatos), Ads (Anúncios Éticos), Finance (Sustentabilidade PIX), Public-API (Tiered API), Reports (Relatórios B2B)

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Conteúdo específico

### 1. Aceitação
Ao instalar, acessar ou usar o Eleições Progressistas (app, site e APIs), você concorda com estes Termos e com a [Política de Privacidade](./PRIVACY_POLICY.md). Se não concordar, não utilize o serviço.

### 2. Natureza da Ferramenta — Isenção de Responsabilidade Eleitoral
2.1. O Eleições Progressistas é **plataforma cívica educativa de transparência e consulta** que calcula afinidade entre as prioridades do eleitor (`priority_pillars`) e os dados públicos de candidatos nos 13 pilares progressistas, sem questionários de perfilamento e sem intervenção humana na ordenação.

2.2. O app **não faz recomendação de voto, não realiza propaganda eleitoral, não pede voto e não endossa candidatos, partidos ou coligações**, em estrita conformidade com a **Resolução TSE nº 23.610/2019** e a Lei nº 9.504/1997. A decisão de voto é exclusiva do eleitor.

2.3. O app não é mantido, financiado ou autorizado pela Justiça Eleitoral, partidos ou candidatos.

2.4. A funcionalidade "Gerar Cola" (Minha Cola Eleitoral 2026) e os documentos PDF ou resumos gerados têm caráter estritamente pessoal, informativo e mnemônico. A Justiça Eleitoral autoriza e recomenda o uso de "cola" em papel na cabine de votação (Resolução TSE nº 23.736/2024), sendo expressamente proibido portar celulares ou aparelhos transmissores junto à urna. O usuário é o único responsável por conferir o número e dados dos candidatos escolhidos antes de efetivar seu voto.

### 3. Precisão e Atualidade dos Dados
3.1. Dados de candidatos (identificação, partido/cargo, fotos oficiais da urna e institucionais, propostas, financiadores, histórico de votações e **ficha limpa**) provêm de **fontes públicas oficiais e abertas**: Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), TSE (DivulgaCandContas), CEPESP, Câmara dos Deputados, Senado Federal, Brasil.io, TCU, CNJ, CEIS/CNEP, IBGE e ViaCEP.

3.2. O projeto **não garante completude, atualidade ou ausência de erros** nas fontes originais. Desatualizações, retificações do TSE ou decisões judiciais supervenientes podem não refletir imediatamente no app.

3.3. Divergências devem ser reportadas a **[EMAIL_DPO]**. Correções são aplicadas conforme atualização das fontes, sem prazo garantido.

### 4. Elegibilidade e Conta
4.1. Uso livre, sem exigência de cadastro com dados pessoais. Quando houver autenticação opcional (Supabase Auth), o usuário é responsável por manter a confidencialidade de suas credenciais.

4.2. É vedado criar contas ou `device_hash` automatizados em massa.

### 5. Conduta do Usuário — Uso Aceitável
É proibido:
a) Raspar (`scraping`), extrair em massa, reproduzir sistematicamente ou revender dados do app/servidores;  
b) Realizar engenharia reversa, sobrecarga, ataque de negação de serviço, injeção ou tentativa de acesso não autorizado;  
c) Burlar `rate limiting` (100 req/min), autenticação ou `Row Level Security`;  
d) Inserir conteúdo ilícito, difamatório ou que viole direitos de terceiros;  
e) Utilizar o app para desinformação, assédio ou finalidade ilícita.

O descumprimento autoriza bloqueio de `device_hash`/IP e, se necessário, comunicação às autoridades.

### 6. Propriedade Intelectual
6.1. **Código-fonte, metodologia de matching** (ponderação `3.0` para pilares prioritários, similaridade `1 - |voter - candidate|`, bônus `ficha_limpa`), interface, marcas e textos do projeto são de titularidade de **[NOME_DA_ENTIDADE_MANTENEDORA]**, licenciados ao usuário apenas para uso pessoal e não comercial.

6.2. **Dados brutos de candidatos** são de **domínio público** ou licenciados pelas fontes originais e permanecem sob as licenças respectivas. Nada nestes Termos transfere titularidade sobre dados públicos.

6.3. O usuário não adquire direito de copiar, modificar ou distribuir o app sem autorização escrita.

### 7. Disponibilidade e Suporte
O serviço é prestado "como está" (`as is`), sem garantia de disponibilidade contínua. Podemos suspender, limitar ou descontinuar funcionalidades para manutenção, segurança ou cumprimento legal, com aviso prévio quando possível.

### 8. Limitação de Responsabilidade
Na extensão permitida por lei, a mantenedora não responde por danos indiretos, lucros cessantes ou decisões tomadas com base nos resultados de compatibilidade. A responsabilidade total limita-se, quando cabível, ao valor efetivamente pago pelo usuário (app gratuito: limitação ao mínimo legal).

### 9. Privacidade
O tratamento de dados rege-se exclusivamente pela [Política de Privacidade](./PRIVACY_POLICY.md), que integra estes Termos. Em caso de conflito, prevalece a Política para temas de dados pessoais.

### 10. Modificações dos Termos
Podemos alterar estes Termos a qualquer tempo, com notificação prévia de **7 dias** no app/site e atualização da data de vigência no topo. O uso continuado após a vigência implica aceitação. Alterações relevantes exigirão novo aceite no app.

### 11. Rescisão
O usuário pode cessar o uso a qualquer momento desinstalando o app ou usando **Perfil > Privacidade > Limpar Meus Dados**. Podemos encerrar o acesso em caso de violação destes Termos ou exigência legal/regulatória.

### 12. Lei Aplicável e Foro
Aplica-se a legislação brasileira, incluindo **LGPD (Lei nº 13.709/2018)**, Marco Civil da Internet (Lei nº 12.965/2014) e Resolução TSE nº 23.610/2019. Fica eleito o foro da comarca de **[CIDADE/UF]**, com renúncia a qualquer outro, por mais privilegiado que seja, ressalvadas relações de consumo.

### 13. Contato
Dúvidas, notificações ou solicitações legais: **[EMAIL_DPO]**  
Mantenedora: **[NOME_DA_ENTIDADE_MANTENEDORA]** — **[ENDEREÇO/CNPJ]**
