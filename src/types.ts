/**
 * Represents a shelter dog.
 */
export interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

/**
 * Represents a location (optional, for future use).
 */
export interface Location {
  zip_code: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

/**
 * Parameters for searching dogs.
 */
export interface SearchOptions {
  breeds?: string[];
  size?: number;
  from?: number;
  sort?: 'breed:asc' | 'breed:desc';
  ageMin?: number;
  ageMax?: number;
}

/**
 * Response shape for dog search.
 */
export interface SearchResponse {
  resultIds: string[];
  total: number;
  next?: string;
  prev?: string;
}

/**
 * Response shape for match endpoint.
 */
export interface MatchResponse {
  match: string;
}
