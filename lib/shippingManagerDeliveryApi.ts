import { API_BASE_URL } from './config';
import { ShippingManagerAuth } from './shippingManagerAuth';

export interface Delivery {
  id: number;
  userId: number;
  pickupLocation: string;
  dropoffLocation: string;
  price: number;
  type: string;
  status: string;
  deliveryZone?: number;
  shippingManagerId?: number;
  resiCode?: string;
  scheduledDate?: string;
  scheduleTimeSlot?: string;
  barang?: {
    itemName: string;
    scale: string;
  };
  packageDetails?: {
    weight: number;
    length: number;
    width: number;
    height: number;
    volumeWeight?: number;
    category?: string;
    isFragile?: boolean;
    requiresHelper?: boolean;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

class ShippingManagerDeliveryAPI {
  private getHeaders() {
    const token = ShippingManagerAuth.getToken();
    if (!token) {
      throw new Error('Shipping manager not authenticated');
    }
    return {
      'Content-Type': 'application/json',
      'shipping-manager-token': token,
    };
  }

  async getDeliveriesByZone(zone: number, status?: string): Promise<Delivery[]> {
    try {
      const url = new URL(`${API_BASE_URL}/delivery/shipping-manager/zone/${zone}`);
      if (status) {
        url.searchParams.append('status', status);
      }
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch deliveries: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error(`Network error: ${error.message || 'Failed to fetch deliveries by zone'}`);
    }
  }

  async getMyDeliveries(status?: string): Promise<Delivery[]> {
    try {
      const url = new URL(`${API_BASE_URL}/delivery/shipping-manager/my-deliveries`);
      if (status) {
        url.searchParams.append('status', status);
      }
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch deliveries: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error(`Network error: ${error.message || 'Failed to fetch my deliveries'}`);
    }
  }

  async updateStatus(deliveryId: number, status: string): Promise<Delivery> {
    try {
      const response = await fetch(`${API_BASE_URL}/delivery/shipping-manager/${deliveryId}/update-status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update status: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error(`Network error: ${error.message || 'Failed to update status'}`);
    }
  }
}

export default new ShippingManagerDeliveryAPI();

