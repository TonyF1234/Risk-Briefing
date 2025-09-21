import { useState, useEffect, useCallback } from 'react';
import type { Risk } from '../types';
import { fetchCybersecurityIncidents } from '../services/geminiService';

export interface CybersecurityIncidentsState {
  risks: Risk[];
  loading: boolean;
  error: string | null;
  refreshRisks: () => void;
  searchStatus: 'idle' | 'found' | 'not_found';
}

interface CybersecurityIncidentsProps {
  enabled: boolean;
}

const getCurrentYearString = () => {
  return new Date().getFullYear().toString();
};

export const useCybersecurityIncidents = ({ enabled }: CybersecurityIncidentsProps): CybersecurityIncidentsState => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found' | 'not_found'>('idle');

  const storageKey = `cybersecurityIncidentsCache_${getCurrentYearString()}`;

  const refreshRisks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isInitialFetch = risks.length === 0;
      const existingTitles = isInitialFetch ? [] : risks.map(r => r.title);
      
      const newRisks = await fetchCybersecurityIncidents(existingTitles);
      
      const currentTitles = new Set(risks.map(r => r.title));
      const uniqueNewRisks = newRisks.filter(risk => !currentTitles.has(risk.title));

      if (uniqueNewRisks.length > 0) {
        const newlyFoundRisksWithFlag = uniqueNewRisks.map(r => ({ ...r, isNew: true }));
        const existingRisksWithoutFlag = risks.map(r => ({ ...r, isNew: false }));

        const updatedRisksForState = [...newlyFoundRisksWithFlag, ...existingRisksWithoutFlag];
        setRisks(updatedRisksForState);
        
        // Save to storage without the transient 'isNew' flag
        const updatedRisksForStorage = [...uniqueNewRisks, ...risks];
        localStorage.setItem(storageKey, JSON.stringify(updatedRisksForStorage));

        setSearchStatus('found');
      } else {
        if (!isInitialFetch) {
          setSearchStatus('not_found');
        }
         // Clear any existing 'new' flags if no new items are found
        if (risks.some(r => r.isNew)) {
          setRisks(risks.map(r => ({ ...r, isNew: false })));
        }
      }

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [risks, storageKey]);

  // Effect to initialize data from cache or network, once per session.
  useEffect(() => {
    if (enabled && !isInitialized) {
      setIsInitialized(true);
      const loadInitialData = () => {
        try {
          const cachedData = localStorage.getItem(storageKey);
          // Check if cache has content
          if (cachedData && JSON.parse(cachedData).length > 0) {
            setRisks(JSON.parse(cachedData));
          } else {
            // No valid cache, fetch from network. refreshRisks handles this.
            refreshRisks();
          }
        } catch (e) {
          console.error("Failed to load or parse cybersecurity incidents from cache", e);
          localStorage.removeItem(storageKey);
          // Still try to fetch from network after a cache error.
          refreshRisks();
        }
      };
      loadInitialData();
    }
  }, [enabled, isInitialized, refreshRisks, storageKey]);

  // Effect to auto-clear search status message
  useEffect(() => {
    if (searchStatus !== 'idle') {
      const timer = setTimeout(() => setSearchStatus('idle'), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchStatus]);

  return { risks, loading, error, refreshRisks, searchStatus };
};
