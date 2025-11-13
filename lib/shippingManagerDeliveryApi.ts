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
    const url = new URL(`${API_BASE_URL}/delivery/shipping-manager/zone/${zone}`);
    if (status) {
      url.searchParams.append('status', status);
    }
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch deliveries by zone');
    }

    const data = await response.json();
    return data.data || data;
  }

  async getMyDeliveries(status?: string): Promise<Delivery[]> {
    const url = new URL(`${API_BASE_URL}/delivery/shipping-manager/my-deliveries`);
    if (status) {
      url.searchParams.append('status', status);
    }
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch my deliveries');
    }

    const data = await response.json();
    return data.data || data;
  }
}

export default new ShippingManagerDeliveryAPI();

