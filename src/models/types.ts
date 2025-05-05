export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: number;
  name: string;
  description?: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: number;
  name: string;
  description?: string | null;
  artist_id: number;
  artist?: Artist;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Genre {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CompactDisc {
  id: number;
  title: string;
  artist_id: number;
  album_id: number;
  genre_id: number;
  location_id: number;
  artist?: Artist;
  album?: Album;
  genre?: Genre;
  location?: Location;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor({ message, status, errors }: { message: string; status: number; errors?: Record<string, string[]> }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}