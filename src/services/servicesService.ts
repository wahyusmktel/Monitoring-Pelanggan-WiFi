import apiClient from './api';

export interface Package {
  id: number;
  name: string;
  description?: string | null;
  speed: string;
  price: number;
  features?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id?: number;
  customer_id: number;
  package_id: number;
  start_date: string;
  end_date?: string | null;
  monthly_fee: number;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  customer?: any;
  package?: Package;
}

export interface Payment {
  id?: number;
  customer_id: number;
  subscription_id: number;
  amount: number;
  payment_date: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string | null;
  reference_number?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  customer?: any;
  subscription?: Subscription;
}

export interface PackageCreate {
  name: string;
  description?: string | null;
  speed: string;
  price: number;
  features?: string | null;
  is_active?: boolean;
}

export interface SubscriptionCreate {
  customer_id: number;
  package_id: number;
  start_date: string;
  end_date?: string | null;
  monthly_fee: number;
  status?: 'active' | 'inactive' | 'suspended' | 'expired';
  notes?: string | null;
  is_active?: boolean;
}

export interface PaymentCreate {
  customer_id: number;
  subscription_id: number;
  amount: number;
  payment_date: string;
  due_date: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string | null;
  reference_number?: string | null;
  notes?: string | null;
}

export const servicesService = {
  // Package Services
  getPackages: async (): Promise<Package[]> => {
    try {
      const response = await apiClient.get('/packages');
      return response.data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  },

  getPackageById: async (id: number): Promise<Package> => {
    try {
      const response = await apiClient.get(`/packages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching package ${id}:`, error);
      throw error;
    }
  },

  createPackage: async (pkg: PackageCreate): Promise<Package> => {
    try {
      const response = await apiClient.post('/packages', pkg);
      return response.data;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  },

  updatePackage: async (id: number, pkg: Partial<PackageCreate>): Promise<Package> => {
    try {
      const response = await apiClient.put(`/packages/${id}`, pkg);
      return response.data;
    } catch (error) {
      console.error(`Error updating package ${id}:`, error);
      throw error;
    }
  },

  deletePackage: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/packages/${id}`);
    } catch (error) {
      console.error(`Error deleting package ${id}:`, error);
      throw error;
    }
  },

  // Subscription Services
  getSubscriptions: async (filters?: { customer_id?: number; package_id?: number; status?: string }): Promise<Subscription[]> => {
    try {
      const response = await apiClient.get('/subscriptions', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  getSubscriptionById: async (id: number): Promise<Subscription> => {
    try {
      const response = await apiClient.get(`/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      throw error;
    }
  },

  createSubscription: async (subscription: SubscriptionCreate): Promise<Subscription> => {
    try {
      const response = await apiClient.post('/subscriptions', subscription);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  updateSubscription: async (id: number, subscription: Partial<SubscriptionCreate>): Promise<Subscription> => {
    try {
      const response = await apiClient.put(`/subscriptions/${id}`, subscription);
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      throw error;
    }
  },

  deleteSubscription: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/subscriptions/${id}`);
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      throw error;
    }
  },

  // Payment Services
  getPayments: async (filters?: { customer_id?: number; subscription_id?: number; status?: string }): Promise<Payment[]> => {
    try {
      const response = await apiClient.get('/payments', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  getPaymentById: async (id: number): Promise<Payment> => {
    try {
      const response = await apiClient.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  },

  createPayment: async (payment: PaymentCreate): Promise<Payment> => {
    try {
      const response = await apiClient.post('/payments', payment);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  updatePayment: async (id: number, payment: Partial<PaymentCreate>): Promise<Payment> => {
    try {
      const response = await apiClient.put(`/payments/${id}`, payment);
      return response.data;
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error);
      throw error;
    }
  },

  deletePayment: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/payments/${id}`);
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error);
      throw error;
    }
  },
};