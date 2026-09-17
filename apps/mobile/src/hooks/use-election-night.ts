import { useState, useEffect, useCallback, useRef } from 'react';
import { useColaStore } from '../../stores/cola.store';
import { useLocationStore } from '../../stores/location.store';
import { getCivicSupportState } from '../storage/civic-support-storage';
import { electionNightStorage } from '../storage/election-night-storage';
import { tseResultsService } from '../services/tse-results.service';
import { electionNotificationsService } from '../services/election-notifications.service';
import { ELECTION_CONFIG } from '../constants/election-night';
import { ElectionResult, NationalStats, PollingPreferences } from '../types/election-night';

export function isElectionPeriodActive(now: Date = new Date(), forceSimulation = false): boolean {
  if (forceSimulation) return true;
  const time = now.getTime();
  for (const period of ELECTION_CONFIG.activePeriods) {
    const start = new Date(period.start).getTime();
    const end = new Date(period.end).getTime();
    if (time >= start && time <= end) {
      return true;
    }
  }
  return false;
}

export function useElectionNight(forceSimulation = false) {
  const { getSelectedList } = useColaStore();
  const { location } = useLocationStore();
  const userUf = location?.uf || 'BR';

  const [hasContributed, setHasContributed] = useState<boolean>(() => {
    return getCivicSupportState().hasContributed;
  });

  const [results, setResults] = useState<Map<string, ElectionResult>>(() => {
    return electionNightStorage.getResults();
  });

  const [nationalStats, setNationalStats] = useState<NationalStats | null>(() => {
    return electionNightStorage.getNationalStats();
  });

  const [pollingPrefs, setPollingPrefsState] = useState<PollingPreferences>(() => {
    return electionNightStorage.getPollingPrefs();
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkCivicAccess = useCallback(() => {
    const state = getCivicSupportState();
    setHasContributed(state.hasContributed);
    return state.hasContributed;
  }, []);

  const refreshResults = useCallback(async () => {
    if (!checkCivicAccess()) {
      return;
    }

    setLoading(true);
    try {
      const candidates = getSelectedList();
      const previousResults = electionNightStorage.getResults();

      // 1. Busca resultados específicos dos candidatos da cola (zero dados ao servidor)
      const newResults = await tseResultsService.getResultsForCola(candidates);

      // 2. Dispara notificações locais para candidatos cuja situação mudou
      if (pollingPrefs.notifications) {
        for (const [id, res] of newResults.entries()) {
          const old = previousResults.get(id);
          if (old && old.status !== res.status && res.status !== 'APURANDO') {
            await electionNotificationsService.notifyCandidateStatusChange(
              res.candidateName || 'Candidato',
              res.cargo || 'Cargo',
              res.status
            );
          }
        }
      }

      // 3. Salva no storage local
      electionNightStorage.saveResults(newResults);
      setResults(newResults);

      // 4. Busca estatísticas nacionais
      const stats = await tseResultsService.fetchNationalStats(userUf);
      if (stats) {
        electionNightStorage.saveNationalStats(stats);
        setNationalStats(stats);
      }

      setLastRefreshed(Date.now());
    } finally {
      setLoading(false);
    }
  }, [checkCivicAccess, getSelectedList, pollingPrefs.notifications, userUf]);

  const updatePollingPrefs = useCallback((newPrefs: Partial<PollingPreferences>) => {
    setPollingPrefsState((curr) => {
      const updated = { ...curr, ...newPrefs };
      electionNightStorage.setPollingPrefs(updated);
      return updated;
    });
  }, []);

  // Polling em Foreground (30 segundos) — somente no período eleitoral
  useEffect(() => {
    if (!hasContributed || !pollingPrefs.enabled) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    const isActive = isElectionPeriodActive(new Date(), forceSimulation);
    if (!isActive) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    // Executa a primeira busca
    refreshResults();

    pollingTimerRef.current = setInterval(() => {
      refreshResults();
    }, ELECTION_CONFIG.pollingIntervals.foregroundMs);

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [hasContributed, pollingPrefs.enabled, forceSimulation, refreshResults]);

  return {
    hasContributed,
    checkCivicAccess,
    results,
    nationalStats,
    pollingPrefs,
    updatePollingPrefs,
    loading,
    lastRefreshed,
    refreshResults,
    isPeriodActive: isElectionPeriodActive(new Date(), forceSimulation),
  };
}
