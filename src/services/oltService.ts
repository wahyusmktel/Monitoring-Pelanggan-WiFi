import api from './api';

export interface OLT {
  id: number;
  name: string;
  location: string;
  ip_address: string;
  brand: string;
  model: string;
  total_ports: number;
  used_ports: number;
  status: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface OLTCreate {
  name: string;
  location: string;
  ip_address: string;
  brand: string;
  model: string;
  total_ports: number;
  used_ports?: number;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OLTUpdate {
  name?: string;
  location?: string;
  ip_address?: string;
  brand?: string;
  model?: string;
  total_ports?: number;
  used_ports?: number;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OLTResponse {
  data: OLT[];
  total: number;
  page: number;
  size: number;
}

export const oltService = {
  getAll: async (page: number = 1, size: number = 10, search?: string, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const response = await api.get<OLTResponse>(`/infrastructure/olts?${params}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<OLT>(`/infrastructure/olts/${id}`);
    return response.data;
  },

  create: async (olt: OLTCreate) => {
    const response = await api.post<OLT>('/infrastructure/olts', olt);
    return response.data;
  },

  update: async (id: number, olt: OLTUpdate) => {
    const response = await api.put<OLT>(`/infrastructure/olts/${id}`, olt);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/infrastructure/olts/${id}`);
    return response.data;
  },getAvailablePorts: async (id: number) => {
    const response = await api.get<{available_ports: number}>(`/infrastructure/olts/${id}/available-ports`);
    return response.data;
  },
};