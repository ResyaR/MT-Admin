import { API_BASE_URL } from './config';
import { ShippingManagerAuth } from './shippingManagerAuth';

export interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryProvince: string;
  deliveryPostalCode: string;
  deliveryZone: number;
  deliveryType: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduleTimeSlot?: string;
  shippingManagerId?: number;
  status: string;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  restaurant?: any;
  user?: any;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

class ShippingManagerOrderAPI {
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

  async getOrdersByZone(zone: number, status?: string): Promise<Order[]> {
    try {
      const url = new URL(`${API_BASE_URL}/orders/shipping-manager/zone/${zone}`);
      if (status) {
        url.searchParams.append('status', status);
      }

      console.log(`[ShippingManagerOrderAPI] Fetching orders from: ${url.toString()}`);
      console.log(`[ShippingManagerOrderAPI] Headers:`, this.getHeaders());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log(`[ShippingManagerOrderAPI] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[ShippingManagerOrderAPI] Error response:`, errorData);
        const errorMessage = errorData.message || `Failed to fetch orders: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`[ShippingManagerOrderAPI] Response data:`, data);
      console.log(`[ShippingManagerOrderAPI] Orders count: ${data.data?.length || 0}`);
      
      return data.data || [];
    } catch (error) {
      console.error(`[ShippingManagerOrderAPI] Error:`, error);
      if (error?.message) {
        throw error;
      }
      throw new Error(`Network error: ${error?.message || 'Failed to fetch orders'}`);
    }
  }

  async getMyOrders(status?: string): Promise<Order[]> {
    try {
      const url = new URL(`${API_BASE_URL}/orders/shipping-manager/my-orders`);
      if (status) {
        url.searchParams.append('status', status);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch orders: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      if (error?.message) {
        throw error;
      }
      throw new Error(`Network error: ${error?.message || 'Failed to fetch orders'}`);
    }
  }

  async updateStatus(orderId: number, status: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/shipping-manager/${orderId}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update order status: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      if (error?.message) {
        throw error;
      }
      throw new Error(`Network error: ${error?.message || 'Failed to update order status'}`);
    }
  }
}

export default new ShippingManagerOrderAPI();

