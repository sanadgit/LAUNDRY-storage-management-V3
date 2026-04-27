import { DriverAuthResponse, DriverAuthUser, Order, OrderStatus } from '../types';

const requestJson = async <T>(url: string, options?: RequestInit, token?: string): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
};

export const driverApi = {
  login: (payload: { driverId: string; phone: string }) =>
    requestJson<DriverAuthResponse>('/api/customer/driver/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSession: (token: string) => requestJson<DriverAuthUser>('/api/customer/driver/auth/session', undefined, token),
  logout: (token: string) =>
    requestJson<{ success: boolean }>('/api/customer/driver/auth/logout', { method: 'POST' }, token),
  getOrders: (token: string) => requestJson<Order[]>('/api/customer/driver/orders', undefined, token),
  updateOrderStatus: (token: string, orderId: string, status: OrderStatus) =>
    requestJson<Order>(`/api/customer/driver/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, token),
};
