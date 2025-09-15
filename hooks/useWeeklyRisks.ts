import { useState, useEffect, useCallback } from 'react';
import type { Risk } from '../types';
import { fetchWeeklyRisks } from '../services/geminiService';

interface WeeklyRisksState {
  risks: Risk[];
  loading: boolean;
  error: string | null;
  refreshRisks: () => void;
}

interface WeeklyRisksProps {
  enabled: boolean;
}

const getWeekIdString = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  // Adjust to make Monday the first day of the week
  const dayOfWeek = startOfYear.getDay() === 0 ? 6 : startOfYear.getDay() - 1;
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + dayOfWeek + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};


export const useWeeklyRisks = ({ enabled }: WeeklyRisksProps): WeeklyRisksState => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetRisks = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    const weekId = getWeekIdString();
    const storageKey = `executiveRisks_weekly_${weekId}`;

    try {
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
          setRisks(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      const newRisks = await fetchWeeklyRisks();
      setRisks(newRisks);
      localStorage.setItem(storageKey, JSON.stringify(newRisks));
      
      // Clean up old weekly storage keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('executiveRisks_weekly_') && key !== storageKey) {
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