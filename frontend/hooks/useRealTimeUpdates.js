import { useEffect, useRef, useCallback } from 'react';
import { requestsAPI } from '../lib/api';

export const useRealTimeUpdates = (onDataUpdate, interval = 30000) => {
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);
  const onDataUpdateRef = useRef(onDataUpdate);

  // Keep the callback ref up to date
  useEffect(() => {
    onDataUpdateRef.current = onDataUpdate;
  }, [onDataUpdate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isActiveRef.current) return;
      
      try {
        const response = await requestsAPI.getAll();
        onDataUpdateRef.current(response.data.requests || []);
      } catch (error) {
        console.error('Real-time update failed:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for real-time updates
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval]);

  // Manual refresh function
  const refresh = async () => {
    try {
      const response = await requestsAPI.getAll();
      onDataUpdate(response.data.requests || []);
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  return { refresh };
};

export default useRealTimeUpdates;
