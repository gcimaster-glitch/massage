/**
 * ============================================
 * HOGUSY Platform Constants
 * ============================================
 * All mock data has been moved to database
 * Use API endpoints to fetch data dynamically
 */

/**
 * Brand Configuration
 * Update these values when rebranding
 */
export const BRAND = {
  NAME: 'HOGUSY',
  SUB_NAME: 'ほぐす、を、もっと身近に。',
  FULL_NAME: 'HOGUSY（ホグシー）',
  SLOGAN: 'ほぐす、を、もっと身近に。',
  SUPPORT_EMAIL: 'support@hogusy.com',
  INVOICE_PREFIX: 'T1234567890123',
  
  // API Endpoints
  API: {
    BASE_URL: import.meta.env.PROD 
      ? 'https://hogusy.com/api'
      : 'http://localhost:3000/api'
  }
};

/**
 * API Endpoints
 * All data is now fetched from database via these endpoints
 */
export const API_ENDPOINTS = {
  // User & Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    OAUTH: '/api/auth/oauth',
    LOGOUT: '/api/auth/logout',
  },
  
  // Master Data
  MASTER: {
    COURSES: '/api/master/courses',
    OPTIONS: '/api/master/options',
    AREAS: '/api/master/areas',
  },
  
  // Therapists
  THERAPISTS: {
    LIST: '/api/therapists',
    DETAIL: (id: string) => `/api/therapists/${id}`,
    MENU: (id: string) => `/api/therapists/${id}/menu`,
  },
  
  // Offices
  OFFICES: {
    LIST: '/api/offices',
    DETAIL: (id: string) => `/api/offices/${id}`,
  },
  
  // Sites & Rooms
  SITES: {
    LIST: '/api/sites',
    DETAIL: (id: string) => `/api/sites/${id}`,
    ROOMS: (id: string) => `/api/sites/${id}/rooms`,
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/api/bookings',
    DETAIL: (id: string) => `/api/bookings/${id}`,
    CREATE: '/api/bookings',
  },
  
  // Admin
  ADMIN: {
    STATS: '/api/admin/stats',
    DELETE_MOCK_DATA: '/api/admin/mock-data',
    SEED_MOCK_DATA: '/api/admin/mock-data/seed',
  },
};

/**
 * DEPRECATED: Legacy mock data exports
 * These will be removed once all pages are migrated to API calls
 * DO NOT USE in new code
 */
export const MOCK_THERAPISTS: any[] = [];
export const MOCK_BOOKINGS: any[] = [];
export const MOCK_SITES: any[] = [];
export const MOCK_AREAS: any[] = [];
export const MOCK_OFFICES: any[] = [];
export const MOCK_STATEMENTS: any[] = [];
export const MOCK_INCIDENTS: any[] = [];
export const MOCK_REVENUE_CONFIG: any = {};
export const MASTER_COURSES: any[] = [];
export const MASTER_OPTIONS: any[] = [];
