import { AdminAuthResponse, AdminUser, Order, SiteConfig } from '../types';

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

export const adminApi = {
  login: (payload: { username: string; password: string }) =>
    requestJson<AdminAuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSession: (token: string) => requestJson<AdminUser>('/api/session', undefined, token),
  logout: (token: string) =>
    requestJson<{ success: boolean }>('/api/logout', { method: 'POST' }, token),
  getOrders: (token: string) => requestJson<Order[]>('/api/customer/orders', undefined, token),
  upsertOrder: (token: string, order: Order) =>
    requestJson<Order>('/api/customer/orders', { method: 'POST', body: JSON.stringify(order) }, token),
  updateOrder: (token: string, order: Order) =>
    requestJson<Order>(`/api/customer/orders/${encodeURIComponent(order.id)}`, { method: 'PUT', body: JSON.stringify(order) }, token),
  updateOrderStatus: (token: string, id: string, status: string) =>
    requestJson<Order>(`/api/customer/orders/${encodeURIComponent(id)}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, token),
  getSiteConfig: (token: string) => requestJson<SiteConfig | null>('/api/customer/site-config', undefined, token),
  updateSiteConfig: (token: string, config: SiteConfig) =>
    requestJson<SiteConfig>('/api/customer/site-config', { method: 'PUT', body: JSON.stringify(config) }, token),
};
