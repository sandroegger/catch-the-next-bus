
export function formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(isoString: string): string {
    const now = new Date();
    const departure = new Date(isoString);
    const diffMs = departure.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins <= 0) return '0\''; // Show 0' if it's very close/now
    return `${diffMins}'`;
}

export function formatDuration(duration: string): string {
    // Duration comes as "00d00:15:00" or similar depending on the API.
    // However, the opendata.ch API often returns "00:15:00" or "1d00:15:00" in some contexts, but usually just a string.
    // Let's parse it safely.
    // Example: 00:06:00
    if (!duration) return '';

    // remove potential days prefix if present (simple regex)
    const timePart = duration.replace(/^[0-9]+d/, '');
    const [hours, minutes] = timePart.split(':');

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (h > 0) {
        return `${h}h ${m}min`;
    }
    return `${m}min`;
}
