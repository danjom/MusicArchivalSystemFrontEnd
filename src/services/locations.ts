import { BaseService } from './base';

export interface LocationCreate {
  name: string;
  description?: string | null;
}

export interface LocationData extends LocationCreate {
  id: number;
  created_at: string;
  updated_at: string | null;
}

export class LocationsService extends BaseService {
  async getAll(): Promise<LocationData[]> {
    return this.get<LocationData[]>('/api/v1/locations');
  }

  async getById(id: number): Promise<LocationData> {
    return this.get<LocationData>(`/api/v1/locations/${id}`);
  }

  async create(location: LocationCreate): Promise<LocationData> {
    return this.post<LocationData>('/api/v1/locations', location);
  }

  async deleteLocation(id: number): Promise<void> {
    return this.delete(`/api/v1/locations/${id}`);
  }
}

export const locationsService = new LocationsService();