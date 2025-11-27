import api from './api';

export interface Customer {
  id?: number;
  customer_number?: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  odp_id?: number | null;
  package_id?: number | null;
  status: string;
  installation_date?: string;
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Optional relations for display
  odp?: { id: number; name: string; location: string };
  package?: { id: number; name: string; speed: string; price: number };
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  odp_id: number;      // Wajib di backend
  package_id: number;  // Wajib di backend
  status?: string;
  installation_date?: string;
  notes?: string | null;
  is_active?: boolean;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  odp_id?: number;
  package_id?: number;
  status?: string;
  installation_date?: string;
  notes?: string | null;
  is_active?: boolean;
}

export interface CustomerFilters {
  search?: string;
  status?: string;
  odp_id?: number;
  package_id?: number;
}

export const customerService = {
  // Get all customers with filters
  getCustomers: async (filters?: CustomerFilters): Promise<Customer[]> => {
    try {
      // Backend Laravel kita mengembalikan array langsung untuk index
      const response = await api.get<Customer[]>('/customers', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (id: number): Promise<Customer> => {
    try {
      const response = await api.get<Customer>(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (customer: CustomerCreate): Promise<Customer> => {
    try {
      const response = await api.post<Customer>('/customers', customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    try {
      const response = await api.put<Customer>(`/customers/${id}`, customer);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id: number): Promise<void> => {
    try {
      await api.delete(`/customers/${id}`);
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  },

  // Get customer statistics
  getCustomerStats: async () => {
    try {
      const response = await api.get('/customers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  },
};