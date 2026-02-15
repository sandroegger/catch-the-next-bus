import styles from './ConnectionCard.module.css';
import { formatRelativeTime } from '../utils/format';
import type { TransportConnection } from '../api/transport';

interface Props {
    connection: TransportConnection;
    isNext: boolean;
}

export function ConnectionCard({ connection, isNext }: Props) {
    const relativeTime = formatRelativeTime(connection.departure);
    let to = connection.to;

    // Remove everything after the comma
    if (to.includes(',')) {
        to = to.split(',')[0];
    }

    const lineDisplay = connection.line;
    const delay = connection.delay;

    return (
        <div className={`${styles.card} ${isNext ? styles.highlight : ''}`}>
            <div className={styles.left}>
                <div className={styles.lineBadge}>
                    <span className={styles.lineNumber}>{lineDisplay}</span>
                </div>
                <div className={styles.destination}>{to}</div>
            </div>

            <div className={styles.right}>
                <div className={styles.departure}>{relativeTime}</div>
                <div className={styles.delayContainer}>
                    {/* Ensure we strictly check for positive delay to avoid rendering '0' */}
                    {(delay || 0) > 0 && (
                        <span className={styles.delay}>+{delay}'</span>
                    )}
                </div>
            </div>
        </div>
    );
}
