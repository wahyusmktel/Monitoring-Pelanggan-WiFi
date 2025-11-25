import apiClient from './api';

export interface Customer {
  id?: number;
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
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  odp_id?: number | null;
  package_id?: number | null;
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
  odp_id?: number | null;
  package_id?: number | null;
  status?: string;
  installation_date?: string;
  notes?: string | null;
  is_active?: boolean;
}

export interface CustomerFilters {
  search?: string;
  status?: string;
  is_active?: boolean;
  odp_id?: number;
  package_id?: number;
  skip?: number;
  limit?: number;
}

export const customerService = {
  // Get all customers with filters
  getCustomers: async (filters?: CustomerFilters): Promise<Customer[]> => {
    try {
      const response = await apiClient.get('/customers', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (id: number): Promise<Customer> => {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (customer: CustomerCreate): Promise<Customer> => {
    try {
      const response = await apiClient.post('/customers', customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    try {
      const response = await apiClient.put(`/customers/${id}`, customer);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/customers/${id}`);
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  },

  // Get customer statistics
  getCustomerStats: async () => {
    try {
      const response = await apiClient.get('/customers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  },
};