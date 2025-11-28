import apiClient from "./api";

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
  status: "active" | "inactive" | "suspended" | "expired";
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
  status: "pending" | "paid" | "overdue" | "cancelled";
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
  status?: "active" | "inactive" | "suspended" | "expired";
  notes?: string | null;
  is_active?: boolean;
}

export interface PaymentCreate {
  customer_id: number;
  subscription_id: number;
  amount: number;
  payment_date: string;
  due_date: string;
  status?: "pending" | "paid" | "overdue" | "cancelled";
  payment_method?: string | null;
  reference_number?: string | null;
  notes?: string | null;
}

// Tambahkan Interface untuk Payment (sesuai backend)
export interface Payment {
  id: number;
  customer_id: number;
  customer?: { name: string; customer_number: string }; // Relation
  amount: number;
  payment_date?: string;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  payment_method?: string;
  token?: string;
  token_status?: string;
  billing_month: number;
  billing_year: number;
  description?: string;
  subscription?: { package?: { name: string } }; // Nested relation buat nama paket
}

// Interface untuk Setting Auto Billing
export interface BillingSettings {
  id?: number;
  is_active: boolean;
  generate_day: number; // Tanggal eksekusi (1-28)
  generate_time: string; // Jam eksekusi (Format HH:mm)
  is_recurring: boolean; // True = Tiap bulan, False = Sekali saja
  next_run_date?: string; // Tanggal jalan berikutnya (dari backend)
}

// Tambahkan Interface Response Monitoring
export interface PaymentMonitoringData {
  summary: {
    totalRevenue: number;
    totalPayments: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
    averagePayment: number;
  };
  monthly: Array<{
    month: number;
    year: number;
    totalRevenue: number;
    totalPayments: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
  }>;
  methods: Array<{
    payment_method: string; // Perhatikan snake_case dari query Laravel
    count: number;
    value: number;
  }>;
  customers: Array<{
    customerName: string;
    customerId: string;
    totalPayments: number;
    totalAmount: number;
    lastPayment: string;
  }>;
}

export const servicesService = {
  // Dashboard Data
  getDashboardData: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  // Package Services
  getPackages: async (): Promise<Package[]> => {
    try {
      const response = await apiClient.get("/services/packages");
      return response.data;
    } catch (error) {
      console.error("Error fetching packages:", error);
      throw error;
    }
  },

  getPackageById: async (id: number): Promise<Package> => {
    try {
      const response = await apiClient.get(`/services/packages/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching package ${id}:`, error);
      throw error;
    }
  },

  // Monitoring
  getPaymentMonitoring: async (): Promise<PaymentMonitoringData> => {
    const response = await apiClient.get("/services/payments/monitoring");
    return response.data;
  },

  // --- BILLING SETTINGS ---
  getBillingSettings: async (): Promise<BillingSettings> => {
    try {
      const response = await apiClient.get('/services/billing-settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching billing settings:', error);
      // Return default value jika belum ada setting di DB
      return {
        is_active: false,
        generate_day: 1,
        generate_time: '09:00',
        is_recurring: true
      };
    }
  },

  updateBillingSettings: async (settings: BillingSettings): Promise<BillingSettings> => {
    try {
      const response = await apiClient.post('/services/billing-settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating billing settings:', error);
      throw error;
    }
  },

  createPackage: async (pkg: PackageCreate): Promise<Package> => {
    try {
      const response = await apiClient.post("/services/packages", pkg);
      return response.data;
    } catch (error) {
      console.error("Error creating package:", error);
      throw error;
    }
  },

  updatePackage: async (
    id: number,
    pkg: Partial<PackageCreate>
  ): Promise<Package> => {
    try {
      const response = await apiClient.put(`/services/packages/${id}`, pkg);
      return response.data;
    } catch (error) {
      console.error(`Error updating package ${id}:`, error);
      throw error;
    }
  },

  deletePackage: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/services/packages/${id}`);
    } catch (error) {
      console.error(`Error deleting package ${id}:`, error);
      throw error;
    }
  },

  // Subscription Services
  getSubscriptions: async (filters?: {
    customer_id?: number;
    package_id?: number;
    status?: string;
  }): Promise<Subscription[]> => {
    try {
      const response = await apiClient.get("/services/subscriptions", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  },

  getSubscriptionById: async (id: number): Promise<Subscription> => {
    try {
      const response = await apiClient.get(`/services/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      throw error;
    }
  },

  createSubscription: async (
    subscription: SubscriptionCreate
  ): Promise<Subscription> => {
    try {
      const response = await apiClient.post(
        "/services/subscriptions",
        subscription
      );
      return response.data;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  },

  updateSubscription: async (
    id: number,
    subscription: Partial<SubscriptionCreate>
  ): Promise<Subscription> => {
    try {
      const response = await apiClient.put(
        `/services/subscriptions/${id}`,
        subscription
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      throw error;
    }
  },

  deleteSubscription: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/services/subscriptions/${id}`);
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      throw error;
    }
  },

  // Payment Services
  getPayments: async (filters?: any): Promise<Payment[]> => {
    const response = await apiClient.get("/services/payments", {
      params: filters,
    });
    return response.data;
  },

  generateBilling: async (month: number, year: number) => {
    const response = await apiClient.post("/services/payments/generate", {
      month,
      year,
    });
    return response.data;
  },

  processPayment: async (id: number) => {
    const response = await apiClient.post(`/services/payments/${id}/pay`);
    return response.data;
  },

  getPaymentById: async (id: number): Promise<Payment> => {
    try {
      const response = await apiClient.get(`/services/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  },

  createPayment: async (payment: PaymentCreate): Promise<Payment> => {
    try {
      const response = await apiClient.post("/services/payments", payment);
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  updatePayment: async (
    id: number,
    payment: Partial<PaymentCreate>
  ): Promise<Payment> => {
    try {
      const response = await apiClient.put(`/services/payments/${id}`, payment);
      return response.data;
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error);
      throw error;
    }
  },

  deletePayment: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/services/payments/${id}`);
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error);
      throw error;
    }
  },
};
