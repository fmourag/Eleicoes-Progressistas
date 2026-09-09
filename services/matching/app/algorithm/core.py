from typing import Dict, List, Optional, Tuple, Any

PILLARS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12", "p13"]
FICHA_LIMPA_BONUS = 5.0
PRIORITY_WEIGHT = 3.0
DEFAULT_WEIGHT = 1.0


def rank_by_pillars(
    candidate: Optional[Dict[str, float]] = None,
    priority_pillars: Optional[List[str]] = None,
    ficha_limpa: bool = False,
) -> Tuple[float, str, bool, List[str]]:
    """
    Classifica candidato pelo alinhamento nos 13 pilares com base em prioridades temáticas.
    Matching stateless e privacy-first: sem coleta ou persistência de opiniões de eleitores.

    - score = (Σ p in prioridades: focus[p]*3.0 + Σ p demais: focus[p]*1.0) / Σ pesos * 100
    - +5 de bônus para ficha_limpa (cap 100)
    - focus ausente → 0.5 + is_estimated=True
    """
    priority_set = set(priority_pillars or [])
    is_estimated = False
    candidate_scores = candidate if candidate is not None else {}

    if not candidate_scores:
        is_estimated = True

    total_weighted_focus = 0.0
    total_weight = 0.0
    priority_aligned = []

    for p in PILLARS:
        if p in candidate_scores and candidate_scores[p] is not None:
            c_val = float(candidate_scores[p])
            focus = c_val / 100.0 if c_val > 1.0 else c_val
            if not (0.0 <= focus <= 1.0):
                raise ValueError(f"Pillar {p} candidate score out of range: {c_val}")
        else:
            focus = 0.5
            is_estimated = True

        weight = PRIORITY_WEIGHT if p in priority_set else DEFAULT_WEIGHT
        total_weighted_focus += focus * weight
        total_weight += weight

        if p in priority_set and focus >= 0.7:
            priority_aligned.append(p)

    score = (total_weighted_focus / total_weight) * 100.0

    if ficha_limpa:
        score = min(score + FICHA_LIMPA_BONUS, 100.0)

    score = round(score, 2)

    if priority_aligned:
        reason = f"Foco destacado em {len(priority_aligned)} tema(s) prioritário(s)"
    elif score >= 70.0:
        reason = "Alto alinhamento geral nos 13 pilares"
    else:
        reason = "Alinhamento moderado"

    return score, reason, is_estimated, priority_aligned


def compute_rank(
    candidate: Optional[Dict[str, float]] = None,
    priority_pillars: Optional[List[str]] = None,
    ficha_limpa: bool = False,
) -> float:
    """Wrapper retornando apenas a pontuação float."""
    score, _, _, _ = rank_by_pillars(
        candidate=candidate,
        priority_pillars=priority_pillars,
        ficha_limpa=ficha_limpa,
    )
    return score
