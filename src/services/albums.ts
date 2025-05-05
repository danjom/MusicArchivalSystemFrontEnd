import { BaseService } from './base';
import type { Album, PaginatedResponse } from '../models/types';
import { ApiError } from '../models/types';
import { authStore } from '../stores/auth';

export class AlbumsService extends BaseService {
  async getAll(): Promise<Album[]> {
    try {
      return await this.get<Album[]>('/api/v1/albums/');
    } catch (error) {
      if (error instanceof ApiError && error.status === 500) {
        // If we get a 500 error, try to fetch the raw response
        const accessToken = authStore.accessToken;
        if (!accessToken) {
          throw new Error('Authentication required');
        }

        const response = await fetch(`${this.baseUrl}/api/v1/albums/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw error;
        }

        const data = await response.json();
        // Process the raw data to ensure it matches our Album type
        return data.map((album: any) => ({
          id: album.id,
          name: album.name || album.title || '',
          artist_id: album.artist_id || 0,
          artist: album.artist,
          created_at: album.created_at,
          updated_at: album.updated_at,
        }));
      }
      throw error;
    }
  }

  async getById(id: number): Promise<Album> {
    return this.get<Album>(`/api/v1/albums/${id}`);
  }

  async create(data: Omit<Album, 'id' | 'created_at' | 'updated_at'>): Promise<Album> {
    return this.post<Album>('/api/v1/albums/', data);
  }

  protected override delete<T>(endpoint: string): Promise<T> {
    return super.delete(endpoint);
  }

  async deleteAlbum(id: number): Promise<Album> {
    return this.delete<Album>(`/api/v1/albums/${id}`);
  }

  async getByArtist(artistId: number, page = 1, size = 10): Promise<PaginatedResponse<Album>> {
    return this.get<PaginatedResponse<Album>>(`/api/v1/artists/${artistId}/albums`, {
      page: page.toString(),
      size: size.toString(),
    });
  }
}

export const albumsService = new AlbumsService();