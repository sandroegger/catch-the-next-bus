export const CONFIG = {
    // Minimum time in minutes to walk to the station.
    // Connections departing sooner than this are hidden.
    WALK_THRESHOLD_MINUTES: 5,

    // Minimum delay in minutes to display the delay indicator.
    // Delays smaller than this are hidden (displayed as on time).
    DELAY_DISPLAY_THRESHOLD_MINUTES: 3,

    // Refresh interval for the data in milliseconds.
    REFRESH_INTERVAL_MS: 5000,

    // Number of connections to fetch from the API.
    API_FETCH_LIMIT: 40,

    // Station names
    STATION_FROM: 'Bern, Zytglogge',
    STATION_TO: 'Bern, Hauptbahnhof',
};
