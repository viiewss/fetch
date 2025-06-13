import axios from 'axios';

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const getBreeds = async () => {
  const response = await api.get('/dogs/breeds');
  return response.data;
};

export const searchDogs = async ({
  breeds = [],
  size = 25,
  from = 0,
  sort = 'breed:asc',
}) => {
  const params = { size, from, sort };
  if (breeds.length) params.breeds = breeds;
  const response = await api.get('/dogs/search', { params });
  return response.data;
};

export const getDogs = async (ids) => {
  const response = await api.post('/dogs', ids);
  return response.data;
};

export const getMatch = async (ids) => {
  const response = await api.post('/dogs/match', ids);
  return response.data;
};
