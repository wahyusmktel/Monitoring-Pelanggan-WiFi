import api from './api';

export interface ODC {
  id: number;
  name: string;
  location: string;
  olt_id: number;
  olt_name: string;
  capacity: number;
  used_capacity: number;
  status: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface ODCCreate {
  name: string;
  location: string;
  olt_id: number;
  capacity: number;
  used_capacity?: number;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ODCUpdate {
  name?: string;
  location?: string;
  olt_id?: number;
  capacity?: number;
  used_capacity?: number;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ODCResponse {
  data: ODC[];
  total: number;
  page: number;
  size: number;
}

export const odcService = {
  getAll: async (page: number = 1, size: number = 10, search?: string, status?: string, olt_id?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (olt_id) params.append('olt_id', olt_id.toString());
    
    const response = await api.get<ODCResponse>(`/infrastructure/odcs?${params}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ODC>(`/infrastructure/odcs/${id}`);
    return response.data;
  },

  create: async (odc: ODCCreate) => {
    const response = await api.post<ODC>('/infrastructure/odcs', odc);
    return response.data;
  },

  update: async (id: number, odc: ODCUpdate) => {
    const response = await api.put<ODC>(`/infrastructure/odcs/${id}`, odc);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/infrastructure/odcs/${id}`);
  },

  getByOLT: async (oltId: number) => {
    const response = await api.get<ODC[]>(`/infrastructure/olts/${oltId}/odcs`);
    return response.data;
  },
};