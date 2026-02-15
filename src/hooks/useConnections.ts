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

const REFRESH_INTERVAL = 5000; // 5 seconds

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

        const intervalId = setInterval(fetchData, REFRESH_INTERVAL);

        return () => clearInterval(intervalId);
    }, [fetchData]);

    return { connections, loading, error, refresh: fetchData, lastUpdated };
}
