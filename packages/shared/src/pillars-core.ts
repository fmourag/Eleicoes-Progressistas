// ─── 13 Pilares Programáticos ──────────────────────────

export const PILLARS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13'] as const;
export type PillarId = (typeof PILLARS)[number];

export const PILLAR_LABELS: Record<PillarId, string> = {
  p1: 'Bem-Estar & Assistência Social',
  p2: 'Justiça Social',
  p3: 'Desenvolvimento Sustentável',
  p4: 'Valores Nacionais',
  p5: 'Reindustrialização',
  p6: 'Distribuição Justa de Renda',
  p7: 'Proteção do Vulnerável',
  p8: 'Governo Eficiente',
  p9: 'Saúde Pública (Gratuita e Eficiente)',
  p10: 'Segurança Pública (Abordagem Legal e Social)',
  p11: 'Educação',
  p12: 'Relações do Trabalho e Emprego',
  p13: 'Empreendedorismo e Desoneração Responsável',
};

export interface PillarDisplayItem {
  id: PillarId;
  label: string;
  icon: string;
  description: string;
}

export const PILLAR_DISPLAY_LIST: PillarDisplayItem[] = [
  {
    id: 'p1',
    label: 'Bem-Estar & Assistência Social',
    icon: '🏥',
    description: 'Garantia de segurança alimentar, saneamento básico, habitação popular digna e assistência social integrada.',
  },
  {
    id: 'p2',
    label: 'Justiça Social',
    icon: '⚖️',
    description: 'Combate às desigualdades de gênero, raça e defesa intransigente dos direitos civis.',
  },
  {
    id: 'p3',
    label: 'Desenvolvimento Sustentável',
    icon: '🌿',
    description: 'Transição energética verde, combate ao desmatamento e justiça climática.',
  },
  {
    id: 'p4',
    label: 'Valores Nacionais',
    icon: '🇧🇷',
    description: 'Defesa das riquezas estratégicas, fomento à cultura nacional e soberania.',
  },
  {
    id: 'p5',
    label: 'Reindustrialização',
    icon: '🏭',
    description: 'Nova Indústria Brasil, inovação tecnológica sustentável e geração de empregos qualificados.',
  },
  {
    id: 'p6',
    label: 'Distribuição Justa de Renda',
    icon: '💰',
    description: 'Tributação de grandes fortunas, valorização do salário mínimo e combate à pobreza.',
  },
  {
    id: 'p7',
    label: 'Proteção do Vulnerável',
    icon: '🛡️',
    description: 'Segurança alimentar, inclusão de PcD, idosos, crianças e populações tradicionais.',
  },
  {
    id: 'p8',
    label: 'Governo Eficiente',
    icon: '📊',
    description: 'Fiscalização republicana, controle social dos gastos e extinção de privilégios.',
  },
  {
    id: 'p9',
    label: 'Saúde Pública',
    icon: '🩺',
    description: 'Acesso universal gratuito, saúde da família e fortalecimento integral do SUS.',
  },
  {
    id: 'p10',
    label: 'Segurança Pública',
    icon: '🚓',
    description: 'Inteligência contra o crime organizado, cumprimento da lei e prevenção social nas periferias.',
  },
  {
    id: 'p11',
    label: 'Educação',
    icon: '🎓',
    description: 'Melhoria na qualidade do ensino através de maior investimento financeiro em escolas, infraestrutura, suprimentos pedagógicos, bolsas e valorização docente.',
  },
  {
    id: 'p12',
    label: 'Relações do Trabalho e Emprego',
    icon: '💼',
    description: 'Valorização do trabalho formal, defesa dos direitos trabalhistas, combate à precarização, segurança jurídica nas relações laborais e qualificação profissional.',
  },
  {
    id: 'p13',
    label: 'Empreendedorismo e Desoneração Responsável',
    icon: '🚀',
    description: 'Incentivo aos microempreendedores individuais, desoneração fiscal orientada ao investimento e geração de empregos, desburocratização e microcrédito orientado.',
  },
];

// ─── Prioridades: usuário seleciona até 3 pilares em sessão ────
export interface PriorityTheme {
  pillar: PillarId;
  label: string;
}

export const PRIORITY_THEMES: PriorityTheme[] = PILLARS.map((p) => ({
  pillar: p,
  label: PILLAR_LABELS[p],
}));

export const MAX_PRIORITIES = 3;
