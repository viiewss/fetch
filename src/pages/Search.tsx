// src/components/Search.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Dog } from '../types';
import { getBreeds, searchDogs, getDogs, getMatch } from '../api/dogs';
import DogCard from '../components/DogCard';
import type { SearchOptions, SearchResponse } from '../types';

const Search: React.FC = () => {
  const [breeds, setBreeds] = useState<string[]>([]);
  // Form state for filters
  const [formBreeds, setFormBreeds] = useState<string[]>([]);
  const [formAgeMin, setFormAgeMin] = useState<string>('');
  const [formAgeMax, setFormAgeMax] = useState<string>('');
  // Applied filter state
  const [appliedBreeds, setAppliedBreeds] = useState<string[]>([]);
  const [appliedAgeMin, setAppliedAgeMin] = useState<number | undefined>(undefined);
  const [appliedAgeMax, setAppliedAgeMax] = useState<number | undefined>(undefined);

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [sort, setSort] = useState<'breed:asc' | 'breed:desc'>('breed:asc');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const size = 25;
  const navigate = useNavigate();

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Redirect if already authenticated
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/dogs/breeds', { method: 'GET', credentials: 'include' });
        if (res.ok) navigate('/search', { replace: true });
      } catch {
        // ignore
      }
    })();
  }, [navigate]);

  // Fetch breeds on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getBreeds();
        setBreeds(data);
      } catch {
        navigate('/', { replace: true });
      }
    })();
  }, [navigate]);

  // Apply filters
  const applyFilters = () => {
    setAppliedBreeds(formBreeds);
    setAppliedAgeMin(formAgeMin ? Number(formAgeMin) : undefined);
    setAppliedAgeMax(formAgeMax ? Number(formAgeMax) : undefined);
    setPage(0);
  };

  // Clear filters
  const clearFilters = () => {
    setFormBreeds([]);
    setFormAgeMin('');
    setFormAgeMax('');
    setAppliedBreeds([]);
    setAppliedAgeMin(undefined);
    setAppliedAgeMax(undefined);
    setPage(0);
  };

  // Fetch dogs when filters change
  useEffect(() => {
    const fetchDogs = async () => {
      setLoading(true);
      setError('');
      const options: SearchOptions = {
        breeds: appliedBreeds,
        size,
        from: page * size,
        sort,
        ageMin: appliedAgeMin,
        ageMax: appliedAgeMax,
      };
      try {
        const { resultIds, total: tot } = await searchDogs(options);
        const fetched = await getDogs(resultIds);
        const ordered = resultIds.map(id => fetched.find(d => d.id === id)!) ;
        setDogs(ordered);
        setTotal(tot);
      } catch {
        setError('Failed to load dogs.');
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, [appliedBreeds, appliedAgeMin, appliedAgeMax, page, sort]);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };

  // Generate match
  const handleGenerateMatch = async () => {
    if (!favorites.length) return;
    try {
      const { match } = await getMatch(favorites);
      const [dog] = await getDogs([match]);
      setMatchedDog(dog);
    } catch {
      setError('Match generation failed.');
    }
  };

  // Sorted breed options
  const sortedBreeds = [...breeds].sort((a, b) => sort === 'breed:asc' ? a.localeCompare(b) : b.localeCompare(a));

  const onBreedChange = (e: ChangeEvent<HTMLSelectElement>) => setFormBreeds(
    Array.from(e.target.selectedOptions).map(o => o.value)
  );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Search Dogs</h2>
      <button
        onClick={async () => { await fetch('/auth/logout', { method: 'POST', credentials: 'include' }); navigate('/', { replace: true }); }}
        className="mb-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >Logout</button>

      {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Breed(s)</label>
            <select
              multiple
              value={formBreeds}
              onChange={onBreedChange}
              className="w-full p-2 border rounded h-32"
            >{sortedBreeds.map(b => <option key={b} value={b}>{b}</option>)}</select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Age Min</label>
            <input
              type="number"
              value={formAgeMin}
              onChange={e => setFormAgeMin(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Age Max</label>
            <input
              type="number"
              value={formAgeMax}
              onChange={e => setFormAgeMax(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="20"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button onClick={applyFilters} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Apply Filters</button>
          <button onClick={clearFilters} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Clear Filters</button>
        </div>
      </div>

      {/* Sort & Match */}
      <div className="flex flex-wrap items-center justify-between mb-6 space-y-2 md:space-y-0">
        <button
          onClick={() => { setSort(s => s === 'breed:asc' ? 'breed:desc' : 'breed:asc'); setPage(0); }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >Sort Breeds: {sort === 'breed:asc' ? 'A→Z' : 'Z→A'}</button>

        <button
          onClick={handleGenerateMatch}
          disabled={!favorites.length}
          className={`px-4 py-2 rounded ${favorites.length ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
        >Generate Match ({favorites.length})</button>

        {matchedDog && (
          <div className="mt-4 inline-block border p-4 rounded shadow">
            <h3 className="font-semibold mb-2">🎉 Your Match:</h3>
            <img src={matchedDog.img} alt={matchedDog.name} className="w-32 h-32 object-contain rounded mb-2" />
            <div>Name: {matchedDog.name}</div>
            <div>Breed: {matchedDog.breed}</div>
            <div>Age: {matchedDog.age}</div>
            <div>Zip: {matchedDog.zip_code}</div>
          </div>
        )}
      </div>

      {/* Results */}
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
        <p className="text-center text-gray-500 mb-6">No dogs found matching your filters.</p>
      )}

      {/* Pagination */}
      <div className="flex justify-between">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="bg-gray-300 p-2 rounded disabled:opacity-50">Previous</button>
        <span>Page {page + 1} of {Math.ceil(total / size)}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * size >= total} className="bg-gray-300 p-2 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default Search;
