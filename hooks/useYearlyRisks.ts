import { useState, useEffect, useCallback } from 'react';
import type { Risk } from '../types';
import { fetchYearlyRisks } from '../services/geminiService';

interface YearlyRisksState {
  risks: Risk[];
  loading: boolean;
  error: string | null;
  refreshRisks: () => void;
}

interface YearlyRisksProps {
  enabled: boolean;
}

const getCurrentYearString = () => {
  return new Date().getFullYear().toString();
};

export const useYearlyRisks = ({ enabled }: YearlyRisksProps): YearlyRisksState => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetRisks = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    const yearStr = getCurrentYearString();
    const storageKey = `executiveRisks_yearly_${yearStr}`;

    try {
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
          setRisks(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      const newRisks = await fetchYearlyRisks();
      setRisks(newRisks);
      localStorage.setItem(storageKey, JSON.stringify(newRisks));
      
      // Clean up old yearly storage keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('executiveRisks_yearly_') && key !== storageKey) {
          localStorage.removeItem(key);
        }
      });

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
    if (enabled && risks.length === 0 && !error) {
      fetchAndSetRisks(false);
    }
  }, [enabled, risks.length, error, fetchAndSetRisks]);

  return { risks, loading, error, refreshRisks };
};