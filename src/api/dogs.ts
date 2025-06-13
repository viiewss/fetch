// src/api/dogs.ts
import type { Dog, SearchOptions, SearchResponse, MatchResponse } from '../types';

/**
 * Fetches all breeds.
 * @returns {Promise<string[]>}
 */
export async function getBreeds(): Promise<string[]> {
  const res = await fetch('/dogs/breeds', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`getBreeds failed: ${res.status}`);
  return res.json();
}

/**
 * Searches dogs with optional filters and pagination.
 * @param options Search filters and pagination settings.
 * @returns {Promise<SearchResponse>}
 */
export async function searchDogs(
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const {
    breeds = [],
    size = 25,
    from = 0,
    sort = 'breed:asc',
    ageMin,
    ageMax,
  } = options;

  const params = new URLSearchParams();
  params.set('size', String(size));
  params.set('from', String(from));
  params.set('sort', sort);

  breeds.forEach((b) => params.append('breeds', b));
  if (ageMin != null) params.set('ageMin', String(ageMin));
  if (ageMax != null) params.set('ageMax', String(ageMax));

  const query = params.toString();
  console.log('Searching dogs with query:', query);

  const res = await fetch(`/dogs/search?${query}`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`searchDogs failed: ${res.status}`);
  return res.json();
}

/**
 * Fetches full dog objects by IDs.
 * @param ids Array of dog IDs.
 * @returns {Promise<Dog[]>}
 */
export async function getDogs(ids: string[] = []): Promise<Dog[]> {
  const res = await fetch('/dogs', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error(`getDogs failed: ${res.status}`);
  return res.json();
}

/**
 * Generates a match from a list of favorite dog IDs.
 * @param ids Array of dog IDs.
 * @returns {Promise<MatchResponse>}
 */
export async function getMatch(
  ids: string[] = []
): Promise<MatchResponse> {
  const res = await fetch('/dogs/match', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error(`getMatch failed: ${res.status}`);
  return res.json();
}