import { useState, useEffect, useCallback } from 'react';
import { fetchConnections } from '../api/transport';
import type { TransportConnection } from '../api/transport';

interface UseConnectionsResult {
    connections: TransportConnection[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
    lastUpdated: Date | null;
}

const GET_REFRESH_INTERVAL = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Midnight (00:00) is 0, 05:30 is 5 * 60 + 30 = 330
    if (totalMinutes < 330) {
        return 30000; // 30 seconds at night
    }
    return 15000; // 15 seconds during the day
};

export function useConnections(from: string, to: string): UseConnectionsResult {
    const [connections, setConnections] = useState<TransportConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchConnections(from, to, 40);
            setConnections(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [from, to]);

    useEffect(() => {
        fetchData();

        const setupInterval = () => {
            const interval = GET_REFRESH_INTERVAL();
            return setInterval(fetchData, interval);
        };

        let intervalId = setupInterval();

        // Refresh the interval logic every minute to catch the transition times
        const keeperId = setInterval(() => {
            clearInterval(intervalId);
            intervalId = setupInterval();
        }, 60000);

        return () => {
            clearInterval(intervalId);
            clearInterval(keeperId);
        };
    }, [fetchData]);

    return { connections, loading, error, refresh: fetchData, lastUpdated };
}
