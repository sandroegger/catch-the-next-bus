
import { useState, useEffect } from 'react';
import styles from './Clock.module.css';

export function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.clock}>
            {time.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
        </div>
    );
}
