// src/pages/Search.tsx
import React, { useState, useEffect, ChangeEvent, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Dog, SearchOptions, SearchResponse, MatchResponse } from '../types';
import { getBreeds, searchDogs, getDogs, getMatch } from '../api/dogs';
import DogCard from '../components/DogCard';
import useDebounce from '../hooks/useDebounce';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const size = 25;

  // Filters state
  const [breeds, setBreeds] = useState<string[]>([]);
  const [filterBreeds, setFilterBreeds] = useState<string[]>([]);
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(0);

  // Debounced filters
  const debouncedBreeds = useDebounce(filterBreeds, 500);
  const debouncedMinAge = useDebounce(
    minAge !== '' ? Number(minAge) : undefined,
    500
  );
  const debouncedMaxAge = useDebounce(
    maxAge !== '' ? Number(maxAge) : undefined,
    500
  );

  // Results state
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [sort, setSort] = useState<'breed:asc' | 'breed:desc'>('breed:asc');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Favorites and match state
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Auth guard & load breeds
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/dogs/breeds', { credentials: 'include' });
        if (!res.ok) return navigate('/', { replace: true });
        setBreeds(await res.json());
      } catch {
        navigate('/', { replace: true });
      }
    })();
  }, [navigate]);

  // Fetch dogs when filters/page/sort change
  useEffect(() => {
    const loadDogs = async () => {
      setLoading(true);
      setError('');
      const opts: SearchOptions = {
        breeds: debouncedBreeds,
        size,
        from: page * size,
        sort,
        ageMin: debouncedMinAge,
        ageMax: debouncedMaxAge,
      };
      try {
        const { resultIds, total: tot }: SearchResponse = await searchDogs(opts);
        const fetched = await getDogs(resultIds);
        setDogs(resultIds.map(id => fetched.find(d => d.id === id)!));
        setTotal(tot);
      } catch {
        setError('Failed to load dogs.');
      } finally {
        setLoading(false);
      }
    };
    loadDogs();
  }, [debouncedBreeds, debouncedMinAge, debouncedMaxAge, page, sort]);

  // Sorted breeds for dropdown
  const sortedBreeds = useMemo(
    () => [...breeds].sort((a, b) => (sort === 'breed:asc' ? a.localeCompare(b) : b.localeCompare(a))),
    [breeds, sort]
  );

  // Handlers
  const handleBreedChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilterBreeds(Array.from(e.target.selectedOptions).map(o => o.value));
    setPage(0);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(f => (f.includes(id) ? f.filter(x => x !== id) : [...f, id]));
  }, []);

  const generateMatch = useCallback(async () => {
    if (!favorites.length) return;
    try {
      const { match }: MatchResponse = await getMatch(favorites);
      const [dog] = await getDogs([match]);
      setMatchedDog(dog);
    } catch {
      setError('Match generation failed.');
    }
  }, [favorites]);

  // Clear match and favorites
  const clearMatch = useCallback(() => {
    setMatchedDog(null);
    setFavorites([]);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/', { replace: true });
  }, [navigate]);

  const toggleSort = useCallback(() => {
    setSort(s => (s === 'breed:asc' ? 'breed:desc' : 'breed:asc'));
    setPage(0);
  }, []);

  const prevPage = useCallback(() => setPage(p => Math.max(p - 1, 0)), []);
  const nextPage = useCallback(() => setPage(p => (p + 1) * size < total ? p + 1 : p), [total]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Search Dogs</h2>

      {/* Controls */}
      <div className="flex justify-between mb-6">
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</button>
        <button onClick={generateMatch} disabled={!favorites.length}
          className={`px-4 py-2 rounded ${favorites.length ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >Generate Match ({favorites.length})</button>
      </div>

      {/* Matched dog display */}
      {matchedDog && (
        <div className="mb-6 p-4 border rounded bg-green-50 relative">
          <button
            onClick={clearMatch}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            aria-label="Clear match"
          >
            ✕
          </button>
          <h3 className="font-semibold mb-2">Your Match:</h3>
          <img src={matchedDog.img} alt={matchedDog.name} className="w-32 h-32 object-contain rounded mb-2" />
          <p>Name: {matchedDog.name}</p>
          <p>Breed: {matchedDog.breed}</p>
          <p>Age: {matchedDog.age}</p>
          <p>Zip Code: {matchedDog.zip_code}</p>
        </div>
      )}

      {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Breed(s)</label>
            <select multiple value={filterBreeds} onChange={handleBreedChange} className="w-full p-2 border rounded h-32">
              {sortedBreeds.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Min Age</label>
            <input type="number" value={minAge} onChange={e => setMinAge(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Max Age</label>
            <input type="number" value={maxAge} onChange={e => setMaxAge(e.target.value)} className="w-full p-2 border rounded" />
          </div>
        </div>
      </div>

      {/* Sort Toggle */}
      <div className="mb-6">
        <button onClick={toggleSort} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Sort: {sort === 'breed:asc' ? 'A→Z' : 'Z→A'}
        </button>
      </div>

      {/* Dog Cards, Loading & Empty */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Array.from({ length: size / 2 }).map((_, i) => (
            <div key={i} className="animate-pulse border p-4 rounded h-64 bg-gray-200" />
          ))}
        </div>
      ) : dogs.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {dogs.map(d => (
            <DogCard key={d.id} dog={d} isFavorite={favorites.includes(d.id)} onToggle={toggleFavorite} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mb-6">No dogs match your filters.</p>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between">
        <button onClick={prevPage} disabled={page === 0} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
        <span>Page {page + 1} of {Math.ceil(total / size)}</span>
        <button onClick={nextPage} disabled={(page + 1) * size >= total} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default Search;


