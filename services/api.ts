/**
 * Soothe Unified API Client (Production Ready)
 */

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8787/api' 
  : 'https://api.soothe-jp.workers.dev/api';

async function call<T>(path: string, method: string = 'GET', body?: any): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth & KYC
  auth: {
    me: () => call<any>('/auth/me'),
    verifyKYC: (base64: string) => call<any>('/auth/kyc-verify', 'POST', { image: base64 }),
  },
  
  // Bookings & D1
  bookings: {
    list: () => call<any[]>('/bookings'),
    create: (data: any) => call<any>('/bookings', 'POST', data),
    get: (id: string) => call<any>(`/bookings/${id}`),
    updateStatus: (id: string, status: string) => call<any>(`/bookings/${id}/status`, 'PATCH', { status }),
    getMessages: (id: string) => call<any[]>(`/bookings/${id}/messages`),
    updateLocation: (id: string, lat: number, lng: number) => call<any>(`/bookings/${id}/location`, 'PATCH', { lat, lng }),
  },
  
  // Payments & Stripe
  payments: {
    startCheckout: async (bookingId: string, amount: number) => {
      const { checkoutUrl } = await call<{checkoutUrl: string}>('/payments/create-session', 'POST', { bookingId, amount });
      window.location.href = checkoutUrl;
    },
    getOnboardingUrl: () => call<{url: string}>('/payments/connect-onboarding'),
  },
  
  // Notifications & Resend
  notify: {
    sendEmail: (to: string, subject: string, html: string) => 
      call('/notify/email', 'POST', { to, subject, html }),
  },

  // Storage & R2
  storage: {
    getUploadUrl: (fileName: string) => call<{url: string}>(`/storage/upload-url?file=${fileName}`),
    async uploadFile(file: File) {
      const { url } = await this.getUploadUrl(file.name);
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      return url.split('?')[0];
    }
  },

  // Therapists (Office management)
  therapists: {
    list: () => call<any[]>('/therapists'),
    getDetails: (id: string) => call<any>(`/therapists/${id}`),
  }
};
