import { BaseService } from './base';
import type { Genre, PaginatedResponse } from '../models/types';

export interface GenreCreate {
  name: string;
  description?: string | null;
  is_favorite?: boolean;
}

export interface GenreData {
  id: number;
  name: string;
  description?: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at?: string | null;
}

class GenresService extends BaseService {
  protected endpoint = '/api/v1/genres';

  async getAll(): Promise<GenreData[]> {
    return this.get<GenreData[]>(this.endpoint);
  }

  async getById(id: number): Promise<GenreData> {
    return this.get<GenreData>(`${this.endpoint}/${id}`);
  }

  async create(genre: GenreCreate): Promise<GenreData> {
    return this.post<GenreData>(this.endpoint, genre);
  }

  async deleteGenre(id: number): Promise<void> {
    return this.delete(`${this.endpoint}/${id}`);
  }
}

export const genresService = new GenresService();