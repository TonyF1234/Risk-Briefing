import { useState, useEffect, useCallback } from 'react';
import type { Risk } from '../types';
import { fetchMonthlyRisks } from '../services/geminiService';

interface MonthlyRisksState {
  risks: Risk[];
  loading: boolean;
  error: string | null;
  refreshRisks: () => void;
}

interface MonthlyRisksProps {
  enabled: boolean;
}

const getMonthIdString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const useMonthlyRisks = ({ enabled }: MonthlyRisksProps): MonthlyRisksState => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetRisks = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    const monthId = getMonthIdString();
    const storageKey = `executiveRisks_monthly_${monthId}`;

    try {
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
          setRisks(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      const newRisks = await fetchMonthlyRisks();
      setRisks(newRisks);
      localStorage.setItem(storageKey, JSON.stringify(newRisks));
      
      // Clean up old monthly storage keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('executiveRisks_monthly_') && key !== storageKey) {
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
    if (enabled && risks.length === 0 && !error) {
      fetchAndSetRisks(false);
    }
  }, [enabled, risks.length, error, fetchAndSetRisks]);

  return { risks, loading, error, refreshRisks };
};