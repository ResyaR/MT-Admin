import { API_BASE_URL } from './config';

// Admin authentication key
const ADMIN_KEY = 'resya123@';
const ADMIN_TOKEN_KEY = 'admin_authenticated';

// Admin API Service
export class AdminAPI {
  // Check if admin is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ADMIN_TOKEN_KEY) === 'true';
  }

  // Login admin with key - verify with backend
  static async login(key: string): Promise<boolean> {
    try {
      // Verify admin key with backend
      const response = await fetch(`${API_BASE_URL}/users/admin/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminToken: key
        })
      });

      if (response.ok) {
        // Admin key valid - simpan di localStorage
        localStorage.setItem(ADMIN_TOKEN_KEY, 'true');
        localStorage.setItem('admin_key', key); // Simpan key untuk API calls
        return true;
      } else {
        // Admin key invalid
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  }

  // Logout admin
  static logout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('admin_key');
  }

  // Get all users
  static async getAllUsers() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/users/admin/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminToken: adminKey
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(userId: number, userData: { fullName?: string; phone?: string; avatar?: string }) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
        method: 'PUT',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(userId: number) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
        method: 'DELETE',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get all deliveries
  static async getAllDeliveries() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/delivery/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  }

  // Get all drivers
  static async getAllDrivers() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/drivers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }

  // Assign driver to delivery
  static async assignDriver(deliveryId: number, driverId: number) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/delivery/${deliveryId}/assign-driver`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId })
      });

      if (!response.ok) {
        throw new Error('Failed to assign driver');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }

  // Update delivery status
  static async updateDeliveryStatus(deliveryId: number, status: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/delivery/${deliveryId}/update-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  // Delete all users (admin only)
  static async deleteAllUsers() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'DELETE',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting users:', error);
      throw error;
    }
  }

  // Update driver status
  static async updateDriverStatus(driverId: number, status: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/drivers/${driverId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update driver status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  // ============== ONGKIR MANAGEMENT ==============
  
  // Get pricing rules
  static async getPricingRules() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/pricing-rules`, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch pricing rules');
        return [];
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      return [];
    }
  }

  // Get delivery zones
  static async getDeliveryZones() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/zones`, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch delivery zones');
        return [];
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching zones:', error);
      return [];
    }
  }

  // Get services
  static async getServices() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/services`, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch services');
        return [];
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  // Calculate shipping cost
  static async calculateShippingCost(distance: number, zoneId?: number) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/calculate`, {
        method: 'POST',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ distance, zoneId })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate shipping cost');
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      throw error;
    }
  }

  // Calculate ongkir by zone tariff
  static async calculateOngkirByZone(params: {
    originCityId: number;
    destCityId: number;
    serviceId: number;
    weight: number;
  }) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/calculate-zone`, {
        method: 'POST',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to calculate shipping cost');
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error calculating shipping cost by zone:', error);
      throw error;
    }
  }

  // Get all zone tariffs
  static async getZoneTariffs() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/zone-tariffs`, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch zone tariffs');
        return [];
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching zone tariffs:', error);
      return [];
    }
  }

  // Create pricing rule
  static async createPricingRule(rule: any) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/pricing-rules`, {
        method: 'POST',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule)
      });

      if (!response.ok) {
        throw new Error('Failed to create pricing rule');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating pricing rule:', error);
      throw error;
    }
  }

  // Create delivery zone
  static async createDeliveryZone(zone: any) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/zones`, {
        method: 'POST',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zone)
      });

      if (!response.ok) {
        throw new Error('Failed to create zone');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  // Create service
  static async createService(service: any) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/services`, {
        method: 'POST',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service)
      });

      if (!response.ok) {
        throw new Error('Failed to create service');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  // Update city
  static async updateCity(id: number, data: any) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/cities/${id}`, {
        method: 'PUT',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update city');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating city:', error);
      throw error;
    }
  }

  // Delete city
  static async deleteCity(id: number) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/cities/${id}`, {
        method: 'DELETE',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete city');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting city:', error);
      throw error;
    }
  }

  // Create city
  static async createCity(data: any) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/cities`, {
        method: 'POST',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create city');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating city:', error);
      throw error;
    }
  }

  // Update service
  static async updateService(id: number, data: any) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/services/${id}`, {
        method: 'PUT',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  // Delete service
  static async deleteService(id: number) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/services/${id}`, {
        method: 'DELETE',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Update pricing rule
  static async updatePricingRule(id: number, data: any) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/pricing-rules/${id}`, {
        method: 'PUT',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update pricing rule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating pricing rule:', error);
      throw error;
    }
  }

  // Delete pricing rule
  static async deletePricingRule(id: number) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/pricing-rules/${id}`, {
        method: 'DELETE',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete pricing rule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
      throw error;
    }
  }

  // Get cities/provinces for dropdown
  static async getCities() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/cities`, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch cities');
        return [];
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  }

  static async getProvinces() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/ongkir/provinces`, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch provinces');
        return [];
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }

  // ==================== DELIVERY SERVICES (ADMIN) ====================
  
  // Get all delivery services
  static async getAllDeliveryServices(filters?: { type?: string; status?: string }) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      
      const url = `${API_BASE_URL}/admin/deliveries${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch delivery services');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching delivery services:', error);
      throw error;
    }
  }

  // Get single delivery service detail
  static async getDeliveryServiceDetail(id: number) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/admin/deliveries/${id}`, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch delivery service detail');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching delivery service detail:', error);
      throw error;
    }
  }

  // Update delivery status (Admin - for delivery services)
  static async updateDeliveryServiceStatus(id: number, status: string) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/admin/deliveries/${id}/status`, {
        method: 'PUT',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update delivery status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  }

  // Assign driver to delivery (Admin - for delivery services)
  static async assignDriverToDeliveryService(id: number, driverId: number) {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/admin/deliveries/${id}/assign-driver`, {
        method: 'PUT',
        headers: {
          'admin-key': adminKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to assign driver');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }

  // Get delivery statistics
  static async getDeliveryStats() {
    try {
      const adminKey = localStorage.getItem('admin_key') || ADMIN_KEY;
      const response = await fetch(`${API_BASE_URL}/admin/deliveries/stats`, {
        method: 'GET',
        headers: {
          'admin-key': adminKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch delivery stats');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
      throw error;
    }
  }
}

export default AdminAPI;

