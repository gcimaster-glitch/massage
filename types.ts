
export enum Role {
  USER = 'USER',
  THERAPIST = 'THERAPIST',
  HOST = 'HOST',
  ADMIN = 'ADMIN',
  SUB_ADMIN = 'SUB_ADMIN',
  AUDITOR = 'AUDITOR',
  AFFILIATE = 'AFFILIATE',
  THERAPIST_OFFICE = 'THERAPIST_OFFICE'
}

export interface User {
  id: string;
  role: Role;
  displayName: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  kycStatus: 'VERIFIED' | 'PENDING' | 'NOT_STARTED';
  createdAt: string;
  avatarUrl?: string;
}

export enum BookingType {
  ONSITE = 'ONSITE',
  MOBILE = 'MOBILE'
}

export enum BookingStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  WAITING_FOR_USER = 'WAITING_FOR_USER',
  CHECKED_IN = 'CHECKED_IN',
  IN_SERVICE = 'IN_SERVICE',
  CLEANING_REQUIRED = 'CLEANING_REQUIRED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  therapistId: string;
  therapistName: string;
  officeId?: string | null;
  type: BookingType;
  status: BookingStatus;
  serviceName: string;
  duration: number;
  scheduledStart: string;
  price: number;
  location: string;
  addressVisibility: string;
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Incident {
  id: string;
  bookingId: string;
  severity: IncidentSeverity;
  type: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
}

export interface RevenueConfig {
  targetMonth: string;
  therapistPercentage: number;
  hostPercentage: number;
  affiliatePercentage: number;
  platformPercentage: number;
}

export enum PayoutStatus {
  DRAFT = 'DRAFT',
  APPROVED_BY_PARTNER = 'APPROVED_BY_PARTNER',
  FIXED = 'FIXED',
  PAID = 'PAID'
}

export interface MonthlyStatement {
  id: string;
  userId: string;
  userRole: Role;
  userName: string;
  targetMonth: string;
  totalSales: number;
  payoutAmount: number;
  status: PayoutStatus;
  generatedAt: string;
  details: {
    bookingId: string;
    date: string;
    amount: number;
    description: string;
  }[];
}

export interface TherapistOffice {
  id: string;
  name: string;
  area: string;
  managerName: string;
  contactEmail: string;
  commissionRate: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  therapistCount: number;
}

export interface TimeBlock {
  start: string;
  end: string;
}

export interface DayConfig {
  isOpen: boolean;
  timeBlocks: TimeBlock[];
}

export interface BusinessHours {
  monday: DayConfig;
  tuesday: DayConfig;
  wednesday: DayConfig;
  thursday: DayConfig;
  friday: DayConfig;
  saturday: DayConfig;
  sunday: DayConfig;
}

export enum SupportCategory {
  BOOKING_ISSUE = 'BOOKING_ISSUE',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM',
  PARTNER_INQUIRY = 'PARTNER_INQUIRY'
}

export enum Modality {
  AUDIO = 'AUDIO',
  TEXT = 'TEXT'
}
