import { getDatabase } from '../../../shared/database/database';

type CachedSearchRow = {
  cached_at: string;
  results_json: string;
};

export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

export async function readCachedSearch(query: string) {
  const result = await getDatabase().executeAsync<CachedSearchRow>(
    `SELECT cached_at, results_json
     FROM place_search_cache
     WHERE query = ?
     LIMIT 1`,
    [normalizeSearchQuery(query)],
  );

  return result.rows.item(0);
}

export async function writeCachedSearch(
  query: string,
  cachedAt: string,
  resultsJson: string,
) {
  await getDatabase().executeAsync(
    `INSERT INTO place_search_cache (query, cached_at, results_json)
     VALUES (?, ?, ?)
     ON CONFLICT(query) DO UPDATE SET
       cached_at = excluded.cached_at,
       results_json = excluded.results_json`,
    [normalizeSearchQuery(query), cachedAt, resultsJson],
  );
}

export async function removeCachedSearch(query: string) {
  await getDatabase().executeAsync(
    'DELETE FROM place_search_cache WHERE query = ?',
    [normalizeSearchQuery(query)],
  );
}

export async function removeExpiredSearches(expiredBefore: string) {
  await getDatabase().executeAsync(
    'DELETE FROM place_search_cache WHERE cached_at < ?',
    [expiredBefore],
  );
}
