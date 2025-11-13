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
    return {
      'Content-Type': 'application/json',
      'shipping-manager-token': token || '',
    };
  }

  async getOrdersByZone(zone: number, status?: string): Promise<Order[]> {
    const url = new URL(`${API_BASE_URL}/orders/shipping-manager/zone/${zone}`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch orders');
    }

    const data = await response.json();
    return data.data || data;
  }

  async getMyOrders(status?: string): Promise<Order[]> {
    const url = new URL(`${API_BASE_URL}/orders/shipping-manager/my-orders`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch orders');
    }

    const data = await response.json();
    return data.data || data;
  }
}

export default new ShippingManagerOrderAPI();

