import unittest
from app.algorithm.core import rank_by_pillars, compute_rank, PILLARS


class TestRankByPillarsAlgorithm(unittest.TestCase):
    def test_sem_prioridades_media_simples(self):
        # Sem prioridades: todos os 13 pilares têm peso 1.0
        candidate = {p: 80.0 for p in PILLARS}
        score, reason, is_estimated, aligned = rank_by_pillars(candidate, priority_pillars=[])
        self.assertEqual(score, 80.0)
        self.assertFalse(is_estimated)
        self.assertEqual(len(aligned), 0)

    def test_prioridade_3x_weight(self):
        # 13 pilares total: p1 com foco 100% e p2..p13 com foco 0%
        candidate = {p: 0.0 for p in PILLARS}
        candidate["p1"] = 100.0

        # Sem prioridade: (1 * 1.0) / 13.0 * 100 = 7.69%
        score_no_priority = compute_rank(candidate, priority_pillars=[])
        self.assertEqual(score_no_priority, 7.69)

        # Com prioridade em p1 (peso 3.0): (1.0 * 3.0) / (3.0 + 12 * 1.0) * 100 = 3/15 * 100 = 20.0%
        score_with_priority, _, _, aligned = rank_by_pillars(candidate, priority_pillars=["p1"])
        self.assertEqual(score_with_priority, 20.0)
        self.assertIn("p1", aligned)

    def test_tres_prioridades_ponderadas(self):
        # 3 prioridades com foco 100%, outras 10 com 0%
        priorities = ["p1", "p2", "p3"]
        candidate = {p: 0.0 for p in PILLARS}
        for p in priorities:
            candidate[p] = 100.0

        # Pesos: 3 * 3.0 + 10 * 1.0 = 19.0. Score: 9.0 / 19.0 * 100 = 47.37%
        score, reason, is_estimated, aligned = rank_by_pillars(candidate, priority_pillars=priorities)
        self.assertEqual(score, 47.37)
        self.assertEqual(len(aligned), 3)
        self.assertIn("3 tema(s) prioritário(s)", reason)

    def test_ficha_limpa_bonus(self):
        candidate = {p: 70.0 for p in PILLARS}
        without = compute_rank(candidate, ficha_limpa=False)
        with_bonus = compute_rank(candidate, ficha_limpa=True)
        self.assertEqual(without, 70.0)
        self.assertEqual(with_bonus, 75.0)

    def test_ficha_limpa_cap_at_100(self):
        candidate = {p: 98.0 for p in PILLARS}
        score = compute_rank(candidate, ficha_limpa=True)
        self.assertEqual(score, 100.0)

    def test_focus_ausente_is_estimated(self):
        # Candidato sem dados de perfil: fallback para 0.5 (50%) com is_estimated = True
        score, reason, is_estimated, aligned = rank_by_pillars(None, priority_pillars=["p1"])
        self.assertTrue(is_estimated)
        self.assertEqual(score, 50.0)
        self.assertEqual(len(aligned), 0)

    def test_partial_focus_is_estimated(self):
        # Candidato com apenas alguns pilares preenchidos
        partial = {"p1": 90.0, "p2": 80.0}
        score, reason, is_estimated, aligned = rank_by_pillars(partial, priority_pillars=["p1"])
        self.assertTrue(is_estimated)
        self.assertIsInstance(score, float)
        self.assertIn("p1", aligned)


if __name__ == "__main__":
    unittest.main()
