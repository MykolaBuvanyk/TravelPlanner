# Nominatim place search

The Search screen sends a request only after the user explicitly submits a query. It is not an autocomplete service. Requests are serialized with at least one second between them and TanStack Query keeps matching results in memory for five minutes.

The public Nominatim service is configured in `src/api/client.ts` and the API adapter is isolated in `src/api/places.ts`, so a proxy or another geocoding provider can replace it later. Results are displayed with OpenStreetMap attribution and invalid remote records are excluded before rendering.

The public service has an absolute limit of one request per second, requires an identifying User-Agent or Referer, and prohibits client-side autocomplete. See https://operations.osmfoundation.org/policies/nominatim/.
