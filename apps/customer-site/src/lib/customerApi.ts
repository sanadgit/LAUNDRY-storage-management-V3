import {
  CustomerAuthResponse,
  CustomerOtpSendResponse,
  CustomerOtpVerifyResponse,
  CustomerUser,
  Order,
  OrderStatus,
  PublicTrackVerificationResponse,
  PublicTrackVerifyResponse,
  SiteConfig,
  SyncHealthResponse,
  SyncRetryResponse,
} from '../types';

let authToken: string | null = null;

const withAuthHeaders = (headers: HeadersInit = {}) => {
  if (!authToken) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${authToken}`,
  };
};

const requestJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...withAuthHeaders(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let message = '';

    if (contentType.includes('application/json')) {
      const body = await response.json().catch(() => null as any);
      if (body && typeof body === 'object') {
        message = String(body.error ?? body.message ?? '').trim();
        // Some backends return a JSON string inside "error".
        if (message.startsWith('{') && message.endsWith('}')) {
          try {
            const nested = JSON.parse(message);
            message = String(nested?.error ?? nested?.message ?? message).trim();
          } catch {
            // Keep original text.
          }
        }
      }
    } else {
      message = (await response.text().catch(() => '')).trim();
    }

    throw new Error(message ? `HTTP ${response.status} · ${message}` : `HTTP ${response.status}`);
  }

  return response.json();
};

export const customerApi = {
  setAuthToken: (token: string | null) => {
    authToken = token;
  },
  register: (payload: {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    verificationToken?: string;
    type?: string;
    area?: string;
    prefService?: number;
    notifType?: string;
  }) =>
    requestJson<CustomerAuthResponse>('/api/customer/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { identifier: string; password: string }) =>
    requestJson<CustomerAuthResponse>('/api/customer/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  sendOtp: (payload: { phone: string; purpose: 'register' | 'login'; channel: 'sms' | 'whatsapp' }) =>
    requestJson<CustomerOtpSendResponse>('/api/customer/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyOtp: (payload: { challengeId: string; code: string }) =>
    requestJson<CustomerOtpVerifyResponse>('/api/customer/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  loginWithOtp: (payload: { phone: string; verificationToken: string }) =>
    requestJson<CustomerAuthResponse>('/api/customer/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSession: () => requestJson<CustomerUser>('/api/customer/auth/session'),
  logout: () =>
    requestJson<{ success: boolean }>('/api/customer/auth/logout', {
      method: 'POST',
    }),
  getOrders: () => requestJson<Order[]>('/api/customer/orders'),
  getOrder: (id: string) => requestJson<Order>(`/api/customer/orders/${encodeURIComponent(id)}`),
  createOrder: (order: Order) =>
    requestJson<Order>('/api/customer/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  createPublicPickupOrder: (order: Order) =>
    requestJson<Order>('/api/customer/orders/public-pickup', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateOrder: (order: Order) =>
    requestJson<Order>(`/api/customer/orders/${encodeURIComponent(order.id)}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    }),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    requestJson<Order>(`/api/customer/orders/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  requestPublicTrackVerification: (payload: { orderId: string }) =>
    requestJson<PublicTrackVerificationResponse>('/api/customer/orders/public-track/request-verification', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyPublicTrackOrder: (payload: { orderId: string; challengeId: string; code: string }) =>
    requestJson<PublicTrackVerifyResponse>('/api/customer/orders/public-track/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  syncOrderWithPos: (id: string) =>
    requestJson<Order>(`/api/customer/orders/${encodeURIComponent(id)}/sync-pos`, {
      method: 'POST',
    }),
  getSyncHealth: () => requestJson<SyncHealthResponse>('/api/sync/health'),
  retrySyncQueue: () =>
    requestJson<SyncRetryResponse>('/api/sync/retry', {
      method: 'POST',
    }),
  getSiteConfig: () => requestJson<SiteConfig | null>('/api/customer/site-config'),
  updateSiteConfig: (config: SiteConfig) =>
    requestJson<SiteConfig>('/api/customer/site-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
};
