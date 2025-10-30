import { API_BASE_URL } from './config';

export class RestaurantAPI {
  private static getAdminKey(): string {
    if (typeof window === 'undefined') return 'resya123@';
    return localStorage.getItem('admin_key') || 'resya123@';
  }

  // Restaurant APIs
  static async getAllRestaurants(status?: string) {
    try {
      const url = new URL(`${API_BASE_URL}/restaurants`);
      if (status) url.searchParams.append('status', status);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch restaurants');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  static async getRestaurant(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
      if (!response.ok) throw new Error('Failed to fetch restaurant');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  }

  static async createRestaurant(restaurantData: {
    name: string;
    description?: string;
    image?: string;
    category: string;
    address?: string;
    phone?: string;
    openingTime?: string;
    closingTime?: string;
    status?: string;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-key': this.getAdminKey(),
        },
        body: JSON.stringify(restaurantData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create restaurant');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  }

  static async updateRestaurant(id: number, restaurantData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'admin-key': this.getAdminKey(),
        },
        body: JSON.stringify(restaurantData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update restaurant');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  }

  static async deleteRestaurant(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
        method: 'DELETE',
        headers: {
          'admin-key': this.getAdminKey(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete restaurant');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  }

  // Menu APIs
  static async getAllMenus(restaurantId?: number) {
    try {
      const url = new URL(`${API_BASE_URL}/menus`);
      if (restaurantId) url.searchParams.append('restaurantId', restaurantId.toString());

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch menus');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  }

  static async getMenusByRestaurant(restaurantId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/restaurant/${restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch menus');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  }

  static async createMenu(menuData: {
    restaurantId: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    category: string;
    availability?: boolean;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-key': this.getAdminKey(),
        },
        body: JSON.stringify(menuData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create menu');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  }

  static async updateMenu(id: number, menuData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'admin-key': this.getAdminKey(),
        },
        body: JSON.stringify(menuData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update menu');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  }

  static async deleteMenu(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
        method: 'DELETE',
        headers: {
          'admin-key': this.getAdminKey(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete menu');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error;
    }
  }

  static async updateMenuAvailability(id: number, availability: boolean) {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'admin-key': this.getAdminKey(),
        },
        body: JSON.stringify({ availability }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update menu availability');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating menu availability:', error);
      throw error;
    }
  }

  // Order APIs (Food Orders)
  static async getAllOrders(userId?: number, status?: string) {
    try {
      const url = new URL(`${API_BASE_URL}/orders`);
      if (userId) url.searchParams.append('userId', userId.toString());
      if (status) url.searchParams.append('status', status);

      const response = await fetch(url.toString(), {
        headers: {
          'admin-key': this.getAdminKey(),
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async getRestaurantOrders(restaurantId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/restaurant/${restaurantId}`, {
        headers: {
          'admin-key': this.getAdminKey(),
        },
      });

      if (!response.ok) throw new Error('Failed to fetch restaurant orders');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId: number, status: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'admin-key': this.getAdminKey(),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update order status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

export default RestaurantAPI;

