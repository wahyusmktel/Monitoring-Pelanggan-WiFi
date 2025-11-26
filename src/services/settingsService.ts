import apiClient from './api';

export interface GeneralSettings {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  website?: string;
  timezone?: string;
}

export interface NotificationSettings {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  paymentReminders?: boolean;
  maintenanceAlerts?: boolean;
  newCustomerAlerts?: boolean;
  lowBalanceAlerts?: boolean;
}

export interface SecuritySettings {
  twoFactorAuth?: boolean;
  sessionTimeout?: number;
  passwordExpiry?: number;
  loginAttempts?: number;
  ipWhitelist?: string;
  autoLogout?: boolean;
}

export interface AppearanceSettings {
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  sidebarColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  language?: 'id' | 'en';
}

export interface SystemSettingsResponse {
  id: number;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  website?: string;
  timezone?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  payment_reminders?: boolean;
  maintenance_alerts?: boolean;
  new_customer_alerts?: boolean;
  low_balance_alerts?: boolean;
  two_factor_auth?: boolean;
  session_timeout?: number;
  password_expiry?: number;
  login_attempts?: number;
  ip_whitelist?: string;
  auto_logout?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  primary_color?: string;
  sidebar_color?: string;
  font_size?: 'small' | 'medium' | 'large';
  language?: 'id' | 'en';
}

const settingsService = {
  getSettings: async (): Promise<SystemSettingsResponse> => {
    const res = await apiClient.get('/settings/');
    return res.data;
  },

  updateSettings: async (payload: Partial<SystemSettingsResponse>): Promise<SystemSettingsResponse> => {
    const res = await apiClient.put('/settings/', payload);
    return res.data;
  },

  testNotification: async (): Promise<{ message: string }> => {
    const res = await apiClient.post('/settings/notifications/test');
    return res.data;
  },

  exportSettings: async (): Promise<any> => {
    const res = await apiClient.get('/settings/export');
    return res.data;
  },

  importSettings: async (data: any): Promise<{ message: string; id: number }> => {
    const res = await apiClient.post('/settings/import', data);
    return res.data;
  }
};

export default settingsService;
