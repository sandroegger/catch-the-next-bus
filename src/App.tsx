import styles from './App.module.css';
import { useConnections } from './hooks/useConnections';
import { ConnectionCard } from './components/ConnectionCard';


import { CONFIG } from './config';

function App() {
  const { connections, loading, error, refresh, lastUpdated } = useConnections(
    CONFIG.STATION_FROM,
    CONFIG.STATION_TO
  );

  // Filter connections that are effectively "now" or in the past (less than 1 min away)
  const now = new Date();
  const validConnections = connections.filter(conn => {
    const departure = new Date(conn.departure);
    // If there is a delay, the real departure is later.
    // We should filter based on the REAL departure time.
    let realDepartureTime = departure.getTime();
    if (conn.delay) {
      realDepartureTime += conn.delay * 60000;
    }

    const diffMs = realDepartureTime - now.getTime();
    return diffMs >= CONFIG.WALK_THRESHOLD_MINUTES * 60 * 1000;
  });

  // Unique Line Logic: Only show the NEXT bus/tram for each line.
  // Group by line number/category and pick the first one.
  const uniqueConnections: typeof connections = [];
  const seenLines = new Set<string>();

  for (const conn of validConnections) {
    const lineKey = conn.line; // e.g., "B12" or "9"

    if (!seenLines.has(lineKey)) {
      uniqueConnections.push(conn);
      seenLines.add(lineKey);
    }
  }

  // Limit to 5 displayed entries as requested
  const displayConnections = uniqueConnections.slice(0, 5);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.connectionList}>
          {displayConnections.length > 0 ? (
            displayConnections.map((conn, index) => (
              <ConnectionCard
                key={conn.uniqueId}
                connection={conn}
                isNext={index === 0}
              />
            ))
          ) : (
            !loading && <div className={styles.noData}>No upcoming connections (&gt; 1 min).</div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>Updated: {lastUpdated.toLocaleTimeString('de-CH')}</span>
          )}
          <button onClick={refresh} className={styles.refreshButton} disabled={loading}>
            {loading ? '...' : '↻'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
