const SHIPPING_MANAGER_KEY = 'shipping_manager_token';
const SHIPPING_MANAGER_DATA_KEY = 'shipping_manager_data';

export const ShippingManagerAuth = {
  login(token: string, managerData: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHIPPING_MANAGER_KEY, token);
      localStorage.setItem(SHIPPING_MANAGER_DATA_KEY, JSON.stringify(managerData));
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SHIPPING_MANAGER_KEY);
      localStorage.removeItem(SHIPPING_MANAGER_DATA_KEY);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SHIPPING_MANAGER_KEY);
    }
    return null;
  },

  getManagerData(): any | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(SHIPPING_MANAGER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};

