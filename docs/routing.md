# Driving routes

The Map screen sends one explicit request when the user selects **Show driving route** for a trip with at least two places. The request follows the itinerary order and returns a GeoJSON route that is shown as a map polyline.

The implementation uses the public OSRM demo service at `router.project-osrm.org`. Requests are serialized at one per second, results are cached by TanStack Query for five minutes, and the screen displays OpenStreetMap and OSRM attribution.

The demo service is suitable for this educational project only. A production app should use a self-hosted OSRM instance or a commercial routing provider behind a server-side API.
