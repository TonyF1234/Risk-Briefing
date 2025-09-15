import { useState, useEffect, useCallback } from 'react';
import type { Risk, DailyBriefData } from '../types';
import { fetchTrendingRisks } from '../services/geminiService';

interface DailyRisksState {
  risks: DailyBriefData;
  loading: boolean;
  error: string | null;
  refreshRisks: () => void;
}

interface DailyRisksProps {
  enabled: boolean;
}

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const storageKey = 'dailyBriefCache';

export const useDailyRisks = ({ enabled }: DailyRisksProps): DailyRisksState => {
  const [risks, setRisks] = useState<DailyBriefData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetRisks = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    const todayStr = getTodayDateString();

    try {
      let cachedData: DailyBriefData = {};
      const cachedItem = localStorage.getItem(storageKey);
      if (cachedItem) {
        cachedData = JSON.parse(cachedItem);
      }
      
      // Prune old data from cache before using it.
      const today = new Date();
      const datesToKeep: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        datesToKeep.push(`${year}-${month}-${day}`);
      }

      Object.keys(cachedData).forEach(dateStr => {
        if (!datesToKeep.includes(dateStr)) {
          delete cachedData[dateStr];
        }
      });


      if (!forceRefresh && cachedData[todayStr]) {
        setRisks(cachedData);
        setLoading(false);
        localStorage.setItem(storageKey, JSON.stringify(cachedData)); // Save pruned data
        return;
      }

      const newRisks = await fetchTrendingRisks();
      const updatedCache = { ...cachedData, [todayStr]: newRisks };
      setRisks(updatedCache);
      localStorage.setItem(storageKey, JSON.stringify(updatedCache));

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRisks = useCallback(() => {
    fetchAndSetRisks(true);
  }, [fetchAndSetRisks]);
  
  useEffect(() => {
    // Only fetch if this hook is enabled and we don't have data yet.
    if (enabled && Object.keys(risks).length === 0 && !error) {
      fetchAndSetRisks(false);
    }
  }, [enabled, risks, error, fetchAndSetRisks]);

  return { risks, loading, error, refreshRisks };
};