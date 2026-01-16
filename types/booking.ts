/**
 * 予約フロー型定義
 */

// 予約タイプ
export type BookingType = 'ONSITE' | 'DISPATCH';

// 予約パターン
export type BookingPattern = 'FROM_MAP' | 'FROM_THERAPIST' | 'DIRECT' | 'AI_RECOMMEND';

// 予約ステータス
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// セラピスト情報
export interface Therapist {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  specialties?: string | string[];
  experience_years?: number;
  rating?: number;
  review_count?: number;
  approved_areas?: string | string[];
  office_name?: string;
}

// 施設情報
export interface Site {
  id: string;
  name: string;
  type: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  room_count: number;
  amenities?: string | string[];
  status?: string;
  host_name?: string;
  available_rooms?: number;
}

// コース情報
export interface Course {
  id: string;
  name: string;
  duration: number;
  description?: string;
  base_price: number;
  is_available?: boolean;
}

// オプション情報
export interface Option {
  id: string;
  name: string;
  duration?: number;
  description?: string;
  base_price: number;
  is_available?: boolean;
}

// 予約アイテム
export interface BookingItem {
  item_type: 'COURSE' | 'OPTION';
  item_id: string;
  item_name: string;
  price: number;
}

// 予約データ
export interface BookingData {
  // パターン情報
  pattern: BookingPattern;
  type: BookingType;
  
  // 選択情報
  therapist?: Therapist;
  site?: Site;
  courses: Course[];
  options: Option[];
  
  // 日時情報
  scheduled_date?: string; // YYYY-MM-DD
  scheduled_time?: string; // HH:MM
  scheduled_at?: string; // ISO 8601
  
  // 出張先情報（DISPATCH時のみ）
  dispatch_address?: string;
  dispatch_lat?: number;
  dispatch_lng?: number;
  
  // 料金情報
  total_duration: number;
  total_price: number;
  
  // 備考
  notes?: string;
}

// 予約確認データ
export interface BookingConfirmation extends BookingData {
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

// KYC情報
export interface KYCData {
  full_name: string;
  furigana: string;
  birth_date: string;
  phone: string;
  postal_code: string;
  address: string;
  identity_document_type: 'DRIVERS_LICENSE' | 'MY_NUMBER_CARD' | 'PASSPORT';
  identity_document_front: string; // Base64 or URL
  identity_document_back?: string; // Base64 or URL
  selfie_photo: string; // Base64 or URL
}

// ユーザー登録情報
export interface UserRegistration {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// 決済情報
export interface PaymentInfo {
  card_number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
  card_holder_name: string;
}

// 予約作成リクエスト
export interface CreateBookingRequest {
  therapist_id: string;
  office_id?: string;
  site_id?: string;
  room_id?: string;
  type: BookingType;
  service_name?: string;
  duration: number;
  price: number;
  location?: string;
  scheduled_at: string;
  items: BookingItem[];
  
  // 出張時の追加情報
  dispatch_address?: string;
  dispatch_lat?: number;
  dispatch_lng?: number;
  
  // 備考
  notes?: string;
}
