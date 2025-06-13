// remove API_BASE_URL entirely—just hit /dogs/* relative paths

export const getBreeds = async () => {
  console.log('Fetching breeds');
  const res = await fetch('/dogs/breeds', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
};

export const searchDogs = async ({
  breeds = [],
  size = 25,
  from = 0,
  sort = 'breed:asc',
}) => {
  const params = new URLSearchParams({ size, from, sort });
  if (breeds.length) params.append('breeds', breeds.join(','));
  console.log('Searching dogs with', params.toString());
  const res = await fetch(`/dogs/search?${params}`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
};

export const getDogs = async (ids) => {
  const res = await fetch('/dogs', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
};

export const getMatch = async (ids) => {
  const res = await fetch('/dogs/match', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
};
