import api from './api';

export interface ODP {
  id: number;
  name: string;
  location: string;
  odc_id: number;
  odc_name: string;
  capacity: number;
  used_capacity: number;
  status: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface ODPCreate {
  name: string;
  location: string;
  odc_id: number;
  capacity: number;
  used_capacity?: number;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ODPUpdate {
  name?: string;
  location?: string;
  odc_id?: number;
  capacity?: number;
  used_capacity?: number;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ODPResponse {
  data: ODP[];
  total: number;
  page: number;
  size: number;
}

export const odpService = {
  getAll: async (page: number = 1, size: number = 10, search?: string, status?: string, odc_id?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (odc_id) params.append('odc_id', odc_id.toString());
    
    const response = await api.get<ODPResponse>(`/infrastructure/odps?${params}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ODP>(`/infrastructure/odps/${id}`);
    return response.data;
  },

  create: async (odp: ODPCreate) => {
    const response = await api.post<ODP>('/infrastructure/odps', odp);
    return response.data;
  },

  update: async (id: number, odp: ODPUpdate) => {
    const response = await api.put<ODP>(`/infrastructure/odps/${id}`, odp);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/infrastructure/odps/${id}`);
  },

  getByODC: async (odcId: number) => {
    const response = await api.get<ODP[]>(`/infrastructure/odcs/${odcId}/odps`);
    return response.data;
  },

  getAvailableODP: async () => {
    const response = await api.get<ODP[]>(`/odps/available`);
    return response.data;
  },
};