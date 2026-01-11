
import { Booking, BookingStatus, BookingType, IncidentSeverity, Role, RevenueConfig, MonthlyStatement, PayoutStatus, TherapistOffice, Incident } from './types';

/**
 * サービス名称管理 (将来の名称変更時はここを修正)
 */
export const BRAND = {
  NAME: 'Soothe Japan',
  SUB_NAME: 'x CARE CUBE',
  FULL_NAME: 'Soothe x CARE CUBE Japan',
  SLOGAN: '癒やしを、インフラに。',
  SUPPORT_EMAIL: 'support@soothe.jp',
  INVOICE_PREFIX: 'T1234567890123'
};

export const MOCK_OFFICES: TherapistOffice[] = [
  { id: 'off1', name: '新宿ウェルネス・エージェンシー', area: 'SHINJUKU', managerName: '佐藤 健', contactEmail: 'sato@shinjuku-w.jp', commissionRate: 15, status: 'ACTIVE', therapistCount: 3 },
  { id: 'off2', name: 'TOKYO癒やしギルド', area: 'TOKYO', managerName: '鈴木 恵子', contactEmail: 'info@healing-g.jp', commissionRate: 12, status: 'ACTIVE', therapistCount: 2 },
];

export const MASTER_COURSES = [
  { id: 'mc_1', name: '深層筋ボディケア', duration: 60, category: 'GENERAL' },
  { id: 'mc_2', name: '極上アロマオイル', duration: 90, category: 'RELAXATION' },
  { id: 'mc_3', name: 'ドライヘッドスパ', duration: 60, category: 'HEAD' },
  { id: 'mc_10', name: '筋膜リリース・リカバリー', duration: 90, category: 'RECOVERY' },
];

export const MASTER_OPTIONS = [
  { id: 'mo_1', name: '延長15分', duration: 15 },
  { id: 'mo_2', name: '指名予約', duration: 0 },
  { id: 'mo_24', name: 'プレミアムCBDバーム', duration: 0 },
];

export const MOCK_SITES = [
  { id: 'site1', name: 'ホテルグランド東京', address: '新宿区西新宿 1-1-1', area: 'SHINJUKU' },
  { id: 'site2', name: 'CARE CUBE 渋谷', address: '渋谷区渋谷 2-2-2', area: 'SHIBUYA' },
];

export const MOCK_AREAS = [
  { id: 'SHINJUKU', name: '新宿エリア' },
  { id: 'SHIBUYA', name: '渋谷エリア' },
];

export const MOCK_THERAPISTS = [
  { 
    id: 't1', 
    name: '田中 有紀', 
    rating: 4.9, 
    reviewCount: 120, 
    categories: ['LICENSED', 'RELAXATION'], 
    areas: ['SHINJUKU', 'SHIBUYA'], 
    imageUrl: 'https://images.unsplash.com/photo-1622902046580-2b47f47f0871?auto=format&fit=crop&q=80&w=800&h=800',
    officeId: 'off1',
    approvedMenu: {
      courses: [{ masterId: 'mc_1', price: 7480 }],
      options: [{ masterId: 'mo_1', price: 2000 }]
    }
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b-101',
    userId: 'u1',
    therapistId: 't1',
    therapistName: '田中 有紀',
    officeId: 'off1',
    type: BookingType.ONSITE,
    status: BookingStatus.CONFIRMED,
    serviceName: '深層筋ボディケア (60分)',
    duration: 60,
    scheduledStart: new Date(Date.now() + 3600000).toISOString(),
    price: 8000,
    location: 'ホテルグランド東京 3F, CUBE-001',
    addressVisibility: 'FULL'
  }
];

export const MOCK_REVENUE_CONFIG: RevenueConfig = {
  targetMonth: '2025-05',
  therapistPercentage: 65,
  hostPercentage: 20,
  affiliatePercentage: 5,
  platformPercentage: 10
};

export const MOCK_STATEMENTS: MonthlyStatement[] = [
  {
    id: 'stmt-off1-202505',
    userId: 'off1',
    userRole: Role.THERAPIST_OFFICE,
    userName: '新宿ウェルネス・エージェンシー',
    targetMonth: '2025-05',
    totalSales: 1200000,
    payoutAmount: 1020000, 
    status: PayoutStatus.DRAFT,
    generatedAt: '2025-05-20T12:00:00',
    details: [{ bookingId: 'b-101', date: '2025-05-20', amount: 8000, description: '田中 有紀 施術分' }]
  }
];

// Fix: Added missing MOCK_INCIDENTS export
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    bookingId: 'b-101',
    severity: IncidentSeverity.MEDIUM,
    type: '不審な接触',
    status: 'RESOLVED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'inc-2',
    bookingId: 'b-101',
    severity: IncidentSeverity.CRITICAL,
    type: 'SOS発報',
    status: 'OPEN',
    createdAt: new Date().toISOString()
  }
];
