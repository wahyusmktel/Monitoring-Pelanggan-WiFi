import apiClient from "./api";

export interface OLT {
  id: number;
  name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  brand?: string | null;
  model?: string | null;
  total_ports: number;
  used_ports: number;
  ip_address?: string | null;
  status: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ODC {
  id: number;
  name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  olt_id: number;
  total_ports: number;
  used_ports: number;
  type?: string | null;
  status: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  olt?: OLT;
}

export interface ODP {
  id: number;
  name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  odc_id: number;
  total_ports: number;
  used_ports: number;
  type?: string | null;
  status: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  odc?: ODC;
}

export interface InfrastructureFilters {
  search?: string;
  status?: string;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  type: "customer" | "olt" | "odc" | "odp";
  status?: "active" | "inactive" | "maintenance" | "pending" | "suspended";
  details?: Record<string, any>;
}

export interface CustomerMonitorData {
  id: number;
  name: string;
  customer_number: string;
  package: string;
  pppoe_user: string;
  status: "online" | "offline";
  ip_address: string;
  uptime: string;
  caller_id: string;
  last_seen?: string;
}

export interface MonitorResponse {
  stats: {
    total: number;
    online: number;
    offline: number;
  };
  data: CustomerMonitorData[];
}

export const infrastructureService = {
  // OLT Services
  getOLTs: async (filters?: InfrastructureFilters): Promise<OLT[]> => {
    try {
      const response = await apiClient.get("/olts", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching OLTs:", error);
      throw error;
    }
  },

  getOLTById: async (id: number): Promise<OLT> => {
    try {
      const response = await apiClient.get(`/olts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching OLT ${id}:`, error);
      throw error;
    }
  },

  createOLT: async (
    olt: Omit<OLT, "id" | "created_at" | "updated_at">
  ): Promise<OLT> => {
    try {
      const response = await apiClient.post("/olts", olt);
      return response.data;
    } catch (error) {
      console.error("Error creating OLT:", error);
      throw error;
    }
  },

  updateOLT: async (
    id: number,
    olt: Partial<Omit<OLT, "id" | "created_at" | "updated_at">>
  ): Promise<OLT> => {
    try {
      const response = await apiClient.put(`/olts/${id}`, olt);
      return response.data;
    } catch (error) {
      console.error(`Error updating OLT ${id}:`, error);
      throw error;
    }
  },

  deleteOLT: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/olts/${id}`);
    } catch (error) {
      console.error(`Error deleting OLT ${id}:`, error);
      throw error;
    }
  },

  // ODC Services
  getODCs: async (
    filters?: InfrastructureFilters & { olt_id?: number }
  ): Promise<ODC[]> => {
    try {
      const response = await apiClient.get("/odcs", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching ODCs:", error);
      throw error;
    }
  },

  getODCById: async (id: number): Promise<ODC> => {
    try {
      const response = await apiClient.get(`/odcs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ODC ${id}:`, error);
      throw error;
    }
  },

  // Get data dari DB Lokal
  getMikrotikSecrets: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get("/infrastructure/mikrotik/secrets");
      return response.data;
    } catch (error) {
      console.error("Error fetching local pppoe accounts:", error);
      throw error;
    }
  },

  // Trigger Sync dari MikroTik ke DB
  syncMikrotikData: async (): Promise<any> => {
    try {
      const response = await apiClient.post("/infrastructure/mikrotik/sync");
      return response.data;
    } catch (error) {
      console.error("Error syncing mikrotik:", error);
      throw error;
    }
  },

  // Import satu user dari Mikrotik ke Database
  importMikrotikUser: async (mikrotikData: any): Promise<any> => {
    try {
      // Kita kirim data mikrotik ke endpoint create customer
      // Backend harus menyesuaikan mapping-nya, atau kita mapping di sini
      const payload = {
        name: mikrotikData.name, // Pakai username sebagai nama sementara
        email: `${mikrotikData.name}@change.me`, // Email dummy
        phone: "-",
        address: "Imported from MikroTik",
        odp_id: 1, // Default ODP (harus ada ID 1 di DB)
        package_id: 1, // Default Paket (harus ada ID 1 di DB)
        status: mikrotikData.disabled ? "inactive" : "active",
        // Kirim username mikrotik sebagai customer_number agar sinkron
        // Note: Anda mungkin perlu modifikasi CustomerController@store agar menerima customer_number manual
        // Untuk sekarang kita biarkan auto-generate dulu, nanti diedit manual
      };

      // Panggil API create customer yang sudah ada
      const response = await apiClient.post("/customers", payload);
      return response.data;
    } catch (error) {
      console.error("Error importing user:", error);
      throw error;
    }
  },

  // Mapping User Mikrotik ke Existing Customer
  mapMikrotikUser: async (
    customerId: number,
    secretData: any
  ): Promise<any> => {
    try {
      const response = await apiClient.post("/infrastructure/mikrotik/map", {
        customer_id: customerId,
        mikrotik_name: secretData.name,
        // Kirim data detail
        password: secretData.password,
        profile: secretData.profile,
        local_address: secretData.local_address,
        remote_address: secretData.remote_address,
        caller_id: secretData.caller_id,
      });
      return response.data;
    } catch (error) {
      console.error("Error mapping user:", error);
      throw error;
    }
  },

  // Ambil list profile PPPoE
  getMikrotikProfiles: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get("/infrastructure/mikrotik/profiles");
      return response.data;
    } catch (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
  },

  createODC: async (
    odc: Omit<ODC, "id" | "created_at" | "updated_at" | "olt">
  ): Promise<ODC> => {
    try {
      const response = await apiClient.post("/odcs", odc);
      return response.data;
    } catch (error) {
      console.error("Error creating ODC:", error);
      throw error;
    }
  },

  updateODC: async (
    id: number,
    odc: Partial<Omit<ODC, "id" | "created_at" | "updated_at" | "olt">>
  ): Promise<ODC> => {
    try {
      const response = await apiClient.put(`/odcs/${id}`, odc);
      return response.data;
    } catch (error) {
      console.error(`Error updating ODC ${id}:`, error);
      throw error;
    }
  },

  deleteODC: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/odcs/${id}`);
    } catch (error) {
      console.error(`Error deleting ODC ${id}:`, error);
      throw error;
    }
  },

  // ODP Services
  getODPs: async (
    filters?: InfrastructureFilters & { odc_id?: number }
  ): Promise<ODP[]> => {
    try {
      const response = await apiClient.get("/odps", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching ODPs:", error);
      throw error;
    }
  },

  getODPById: async (id: number): Promise<ODP> => {
    try {
      const response = await apiClient.get(`/odps/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ODP ${id}:`, error);
      throw error;
    }
  },

  createODP: async (
    odp: Omit<ODP, "id" | "created_at" | "updated_at" | "odc">
  ): Promise<ODP> => {
    try {
      const response = await apiClient.post("/odps", odp);
      return response.data;
    } catch (error) {
      console.error("Error creating ODP:", error);
      throw error;
    }
  },

  updateODP: async (
    id: number,
    odp: Partial<Omit<ODP, "id" | "created_at" | "updated_at" | "odc">>
  ): Promise<ODP> => {
    try {
      const response = await apiClient.put(`/odps/${id}`, odp);
      return response.data;
    } catch (error) {
      console.error(`Error updating ODP ${id}:`, error);
      throw error;
    }
  },

  deleteODP: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/odps/${id}`);
    } catch (error) {
      console.error(`Error deleting ODP ${id}:`, error);
      throw error;
    }
  },
  // Port Monitoring Service
  getPortMonitoring: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get("/infrastructure/monitoring/ports");
      return response.data;
    } catch (error) {
      console.error("Error fetching port monitoring data:", error);
      throw error;
    }
  },
  // Network Map Service
  getNetworkMapLocations: async (): Promise<MapLocation[]> => {
    try {
      const response = await apiClient.get("/infrastructure/map/locations");
      return response.data;
    } catch (error) {
      console.error("Error fetching map locations:", error);
      throw error;
    }
  },

  // Monitoring Realtime
  getFormattedMonitoring: async (): Promise<MonitorResponse> => {
    try {
      const response = await apiClient.get("/infrastructure/mikrotik/monitor");
      return response.data;
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
      throw error;
    }
  },

  // Trigger Sync Status Active
  syncActiveConnections: async (): Promise<any> => {
    try {
      const response = await apiClient.post(
        "/infrastructure/mikrotik/sync-active"
      );
      return response.data;
    } catch (error) {
      console.error("Error syncing active connections:", error);
      throw error;
    }
  },
};
