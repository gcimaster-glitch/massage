/**
 * types.ts
 * HOGUSYシステム共通型定義
 *
 * すべてのAPIルートで使用する共通の型を定義する。
 * any型の使用を排除し、型安全性を確保する。
 */

// ============================================
// Cloudflare Workers Bindings
// ============================================
export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  GOOGLE_MAPS_API_KEY?: string;
  RESEND_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  R2_BUCKET?: R2Bucket;
  ENVIRONMENT?: string;
};

// ============================================
// ユーザーロール
// ============================================
export type UserRole =
  | 'USER'
  | 'THERAPIST'
  | 'OFFICE'
  | 'HOST'
  | 'ADMIN'
  | 'AFFILIATE';

// ============================================
// JWTペイロード
// ============================================
export type JWTPayload = {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
  iat?: number;
  exp?: number;
};

// ============================================
// ユーザー
// ============================================
export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  kyc_status?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  is_active?: number; // SQLite boolean (0/1)
  email_verified?: number;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// セラピストプロフィール
// ============================================
export type TherapistProfile = {
  id: string;
  user_id: string;
  bio?: string | null;
  specialties?: string | null;
  experience_years?: number | null;
  hourly_rate?: number | null;
  is_available?: number;
  rating?: number | null;
  review_count?: number | null;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// 予約
// ============================================
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type Booking = {
  id: string;
  user_id: string;
  therapist_id: string;
  therapist_name?: string | null;
  office_id?: string | null;
  site_id?: string | null;
  type: string;
  status: BookingStatus;
  service_name?: string | null;
  duration: number;
  price: number;
  scheduled_at?: string | null;
  scheduled_start?: string | null;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// サイト（施術場所）
// ============================================
export type Site = {
  id: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// オフィス（事業所）
// ============================================
export type Office = {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// APIレスポンス共通型
// ============================================
export type ApiSuccess<T = Record<string, unknown>> = {
  success: true;
} & T;

export type ApiError = {
  error: string;
  details?: string;
  retryAfter?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================
// 認証結果
// ============================================
export type AuthResult = {
  success: boolean;
  user?: JWTPayload;
  error?: string;
};

// ============================================
// レート制限設定
// ============================================
export type RateLimitConfig = {
  limit: number;
  windowMs: number;
  message: string;
};

// ============================================
// KYCステータス
// ============================================
export type KYCStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';

// ============================================
// 収益・支払い
// ============================================
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type Payout = {
  id: string;
  therapist_id: string;
  amount: number;
  status: PayoutStatus;
  created_at?: string;
  updated_at?: string;
};
