import { BaseService } from './base';
import type { Artist } from '../models/types';

export class ArtistsService extends BaseService {
  async getAll(): Promise<Artist[]> {
    return this.get<Artist[]>('/api/v1/artists/');
  }

  async getById(id: number): Promise<Artist> {
    return this.get<Artist>(`/api/v1/artists/${id}`);
  }

  async create(data: Omit<Artist, 'id' | 'created_at' | 'updated_at'>): Promise<Artist> {
    return this.post<Artist>('/api/v1/artists/', data);
  }

  protected override delete<T>(endpoint: string): Promise<T> {
    return super.delete(endpoint);
  }

  async deleteArtist(id: number): Promise<Artist> {
    return this.delete<Artist>(`/api/v1/artists/${id}`);
  }
}

export const artistsService = new ArtistsService();