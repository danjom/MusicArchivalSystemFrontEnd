import { BaseService } from './base';
import type { PaginatedResponse } from '../models/types';

export interface CompactDiscCreate {
  name: string;
  description?: string | null;
  notes?: string | null;
  is_favorite?: boolean;
  artist_ids: number[];
  album_id?: number | null;
  genre_id?: number | null;
  location_id?: number | null;
}

export interface CompactDiscData extends CompactDiscCreate {
  id: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
  album?: AlbumData | null;
  genre?: GenreData | null;
  artists: ArtistData[];
  location?: LocationData | null;
}

export interface AlbumData {
  id: number;
  name: string;
  description?: string | null;
  is_favorite: boolean;
  artist_id: number;
  created_at: string;
  updated_at?: string | null;
  artist?: ArtistData | null;
}

export interface GenreData {
  id: number;
  name: string;
  description?: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface ArtistData {
  id: number;
  name: string;
  description?: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface LocationData {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface SearchResult {
  name: string;
  entity_type: 'album' | 'artist' | 'compact_disc' | 'genre' | 'location';
  entity_id: number;
  tags: TagInfo[];
}

export interface TagInfo {
  name: string;
  id: string;
  entity_type: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export class CompactDiscsService extends BaseService {
  async getAll(page = 1, size = 10): Promise<PaginatedResponse<CompactDiscData>> {
    return this.get<PaginatedResponse<CompactDiscData>>('/api/v1/compact-discs/', {
      page: page.toString(),
      size: size.toString(),
    });
  }

  async search(query: string): Promise<SearchResponse> {
    return this.get<SearchResponse>('/api/v1/search/', {
      term: query
    });
  }

  async getById(id: number): Promise<CompactDiscData> {
    return this.get<CompactDiscData>(`/api/v1/compact-discs/${id}`);
  }

  async create(data: CompactDiscCreate): Promise<CompactDiscData> {
    return this.post<CompactDiscData>('/api/v1/compact-discs/', data);
  }

  protected override delete<T>(endpoint: string): Promise<T> {
    return super.delete(endpoint);
  }

  async deleteCompactDisc(id: number): Promise<CompactDiscData> {
    return this.delete<CompactDiscData>(`/api/v1/compact-discs/${id}`);
  }

  async getByArtist(artistId: number, page = 1, size = 10): Promise<PaginatedResponse<CompactDiscData>> {
    return this.get<PaginatedResponse<CompactDiscData>>(`/api/v1/artists/${artistId}/compact-discs`, {
      page: page.toString(),
      size: size.toString(),
    });
  }

  async getByGenre(genreId: number, page = 1, size = 10): Promise<PaginatedResponse<CompactDiscData>> {
    return this.get<PaginatedResponse<CompactDiscData>>(`/api/v1/genres/${genreId}/compact-discs`, {
      page: page.toString(),
      size: size.toString(),
    });
  }

  async getByLocation(locationId: number, page = 1, size = 10): Promise<PaginatedResponse<CompactDiscData>> {
    return this.get<PaginatedResponse<CompactDiscData>>(`/api/v1/locations/${locationId}/compact-discs`, {
      page: page.toString(),
      size: size.toString(),
    });
  }

  async getByEntity(entityType: string, entityId: number): Promise<CompactDiscData[]> {
    return this.get<CompactDiscData[]>(`/api/v1/compact-discs/by-entity/${entityType}/${entityId}`);
  }
}

export const compactDiscsService = new CompactDiscsService();