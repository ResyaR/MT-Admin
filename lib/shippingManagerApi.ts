import { API_BASE_URL } from './config';

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'resya123@';

export interface ShippingManager {
  id: number;
  name: string;
  email: string;
  phone: string;
  zone: number;
  token: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingManagerDto {
  name: string;
  email: string;
  phone: string;
  zone: number;
}

export interface CreateShippingManagerWithUserDto {
  name: string;
  email: string;
  phone: string;
  zone: number;
  password: string;
}

export interface UpdateShippingManagerDto {
  name?: string;
  email?: string;
  phone?: string;
  zone?: number;
  isActive?: boolean;
}

class ShippingManagerAPI {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'admin-key': ADMIN_TOKEN,
    };
  }

  async getAll(): Promise<ShippingManager[]> {
    const response = await fetch(`${API_BASE_URL}/shipping-managers`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shipping managers');
    }

    const data = await response.json();
    return data.data || data;
  }

  async getByZone(zone: number): Promise<ShippingManager[]> {
    const response = await fetch(`${API_BASE_URL}/shipping-managers/zone/${zone}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shipping managers by zone');
    }

    const data = await response.json();
    return data.data || data;
  }

  async getById(id: number): Promise<ShippingManager> {
    const response = await fetch(`${API_BASE_URL}/shipping-managers/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shipping manager');
    }

    const data = await response.json();
    return data.data || data;
  }

  async create(createDto: CreateShippingManagerDto): Promise<ShippingManager> {
    const response = await fetch(`${API_BASE_URL}/shipping-managers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(createDto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create shipping manager');
    }

    const data = await response.json();
    return data.data || data;
  }

  async update(id: number, updateDto: UpdateShippingManagerDto): Promise<ShippingManager> {
    const response = await fetch(`${API_BASE_URL}/shipping-managers/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updateDto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update shipping manager');
    }

    const data = await response.json();
    return data.data || data;
  }

  async regenerateToken(id: number): Promise<ShippingManager> {
    const response = await fetch(`${API_BASE_URL}/shipping-managers/${id}/regenerate-token`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to regenerate token');
    }

    const data = await response.json();
    return data.data || data;
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/shipping-managers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete shipping manager');
    }
  }

  async createWithUser(createDto: CreateShippingManagerWithUserDto): Promise<ShippingManager> {
    const response = await fetch(`${API_BASE_URL}/shipping-managers/with-user`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(createDto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create shipping manager with user account');
    }

    const data = await response.json();
    return data.data || data;
  }
}

export default new ShippingManagerAPI();

