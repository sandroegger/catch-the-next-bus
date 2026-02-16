
export interface TransportConnection {
    uniqueId: string; // Composite key for deduplication
    line: string;     // Display line (e.g. "B12", "9")
    to: string;       // Destination
    departure: string;// ISO string
    platform?: string;
    delay?: number | null; // Delay in minutes
}

const STATIONBOARD_URL = 'https://transport.opendata.ch/v1/stationboard';

import { CONFIG } from '../config';

export async function fetchConnections(from: string, _to: string, limit = CONFIG.API_FETCH_LIMIT): Promise<TransportConnection[]> {
    const params = new URLSearchParams({
        station: from,
        limit: limit.toString(),
    });

    const response = await fetch(`${STATIONBOARD_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch stationboard: ${response.statusText}`);
    }

    const data = await response.json();

    // The stationboard returns ALL departures.
    // We filter for those going generally West/South from Zytglogge (towards HB/Wabern/Bümpliz/etc).
    // We do this by EXCLUDING known Eastward destinations.
    const validDepartures = data.stationboard.filter((entry: any) => {
        if (!entry.stop || !entry.stop.departure) return false;

        // Filter out walks
        if (!entry.category && !entry.number) return false;

        const destination = entry.to;
        // Known destinations in the "wrong" direction from Zytglogge
        const badDestinations = [
            'Saali',
            'Worb Dorf',
            'Ostring',
            'Guisanplatz',
            'Zentrum Paul Klee',
            'Muri bei Bern',
            'Bern, Brunnadernstrasse',
            'Bern, Elfenau'
        ];

        const isBad = badDestinations.some(d => destination.includes(d));
        if (isBad) return false;

        return true;
    });

    return validDepartures.map((entry: any) => {
        const category = entry.category; // 'B', 'T', 'BUS', 'TRAM', 'NFB'
        const number = entry.number;
        let lineDisplay = number;

        // Formatting Logic
        if (category) {
            const cat = category.toUpperCase();
            if (cat === 'B' || cat === 'BUS' || cat === 'NFB') {
                lineDisplay = number; // Just number for buses (B12 -> 12)
            } else if (cat === 'T' || cat === 'TRAM') {
                lineDisplay = number; // Just number for trams
            }
        }

        // Hardcoded Destination Mapping
        // 6: Fischermätteli, 7: Bümpliz, 8: Brünnen Westside, 9: Wabern, 
        // 10: Schliern, 12: Holligen, 19: Spiegel Blinzern
        const destinationMap: Record<string, string> = {
            '6': 'Fischermätteli',
            '7': 'Bümpliz',
            '8': 'Brünnen Westside',
            '9': 'Wabern',
            '10': 'Schliern',
            '12': 'Holligen',
            '19': 'Spiegel Blinzern'
        };

        const finalDestination = destinationMap[number] || entry.to;

        // Calculate Delay from Prognosis vs Scheduled
        let calculatedDelay: number | null = null;
        if (entry.stop.prognosis && entry.stop.prognosis.departure) {
            const scheduledTime = new Date(entry.stop.departure).getTime();
            const realTime = new Date(entry.stop.prognosis.departure).getTime();
            const diffMins = Math.floor((realTime - scheduledTime) / 60000);

            if (diffMins > 0) {
                calculatedDelay = diffMins;
            }
        }

        return {
            uniqueId: `${lineDisplay}-${entry.stop.departure}`,
            line: lineDisplay,
            to: finalDestination,
            departure: entry.stop.departure, // BACK TO SCHEDULED
            platform: entry.stop.platform,
            delay: calculatedDelay,
        };
    });
}
