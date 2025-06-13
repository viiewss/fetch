import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBreeds, searchDogs, getDogs, getMatch } from '../api/dogs';
import DogCard from '../components/DogCard';

export default function Search() {
  const [breeds, setBreeds]               = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [dogs, setDogs]                   = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(0);
  const [sort, setSort]                   = useState('breed:asc');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [favorites, setFavorites]         = useState([]);
  const [matchedDog, setMatchedDog]       = useState(null);
  const size = 25;
  const navigate = useNavigate();

  // Logout and redirect to login
  const handleLogout = async () => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/', { replace: true });
  };

  // Fetch all breeds on mount
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

  // Fetch paginated, filtered dogs
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { resultIds, total: tot } = await searchDogs({
          breeds: selectedBreeds,
          size,
          from: page * size,
          sort,
        });
        const dogData = await getDogs(resultIds);
        setDogs(dogData);
        setTotal(tot);
      } catch {
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedBreeds, page, sort, navigate]);

  // Add or remove a dog ID from favorites
  const toggleFavorite = (id) =>
    setFavorites(favs =>
      favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]
    );

  // Call /dogs/match and then fetch the matched dog
  const handleGenerateMatch = async () => {
    if (!favorites.length) return;
    const { match } = await getMatch(favorites);
    const [dog]     = await getDogs([match]);
    setMatchedDog(dog);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Search Dogs</h2>

      <button
        onClick={handleLogout}
        className="mb-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Filters & Sort */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Filter by Breed</h3>
          <select
            multiple
            value={selectedBreeds}
            onChange={e => {
              setSelectedBreeds(
                Array.from(e.target.selectedOptions).map(o => o.value)
              );
              setPage(0);
            }}
            className="w-full p-2 border rounded"
          >
            {breeds.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setSort(s => (s === 'breed:asc' ? 'breed:desc' : 'breed:asc'));
              setPage(0);
            }}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sort: {sort === 'breed:asc' ? 'A→Z' : 'Z→A'}
          </button>
        </div>
      </div>

      {/* Generate Match */}
      <div className="mb-6">
        <button
          onClick={handleGenerateMatch}
          disabled={!favorites.length}
          className={`mr-2 p-2 rounded ${
            favorites.length
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          Generate Match ({favorites.length})
        </button>

        {matchedDog && (
          <div className="inline-block align-top border p-4 rounded shadow">
            <h3 className="font-semibold mb-2">🎉 Your Match:</h3>
            <img
              src={matchedDog.img}
              alt={matchedDog.name}
              className="w-32 h-32 object-cover rounded mb-2"
            />
            <div>Name: {matchedDog.name}</div>
            <div>Breed: {matchedDog.breed}</div>
            <div>Age: {matchedDog.age}</div>
            <div>Zip: {matchedDog.zip_code}</div>
          </div>
        )}
      </div>

      {/* Dog Cards */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {dogs.map(dog => (
            <DogCard
              key={dog.id}
              dog={dog}
              isFavorite={favorites.includes(dog.id)}
              onToggle={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 0}
          className="bg-gray-300 p-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page + 1} of {Math.ceil(total / size)}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={(page + 1) * size >= total}
          className="bg-gray-300 p-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
