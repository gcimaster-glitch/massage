
import { Role, Booking, BookingStatus, BookingType, User } from '../types';
import { MOCK_BOOKINGS, MOCK_THERAPISTS } from '../constants';

// システム全体の永続化キー
const STORAGE_KEY = 'SOOTHE_SYSTEM_DATABASE';

interface SystemDatabase {
  users: User[];
  bookings: Booking[];
  kycRequests: any[];
}

const getDB = (): SystemDatabase => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  
  // 初期データ
  const initialDB: SystemDatabase = {
    users: [],
    bookings: MOCK_BOOKINGS,
    kycRequests: []
  };
  saveDB(initialDB);
  return initialDB;
};

const saveDB = (db: SystemDatabase) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const systemStore = {
  // 予約作成
  createBooking: (bookingData: Partial<Booking>) => {
    const db = getDB();
    const newBooking: Booking = {
      id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: 'u1',
      therapistId: bookingData.therapistId || 'auto',
      therapistName: bookingData.therapistId === 'auto' ? 'AI自動マッチング中' : (MOCK_THERAPISTS.find(t => t.id === bookingData.therapistId)?.name || '未指定'),
      status: BookingStatus.PENDING_PAYMENT,
      type: bookingData.type || BookingType.ONSITE,
      serviceName: bookingData.serviceName || '標準ケア 60分',
      duration: bookingData.duration || 60,
      scheduledStart: bookingData.scheduledStart || new Date().toISOString(),
      price: bookingData.price || 8000,
      location: bookingData.location || '指定なし',
      addressVisibility: 'HIDDEN'
    };
    db.bookings.unshift(newBooking);
    saveDB(db);
    return newBooking;
  },

  // KYC申請
  submitKYC: (userId: string, data: any) => {
    const db = getDB();
    const request = {
      id: `KYC-${Date.now()}`,
      userId,
      ...data,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };
    db.kycRequests.push(request);
    saveDB(db);
    return request;
  },

  // 予約一覧取得
  getBookings: () => getDB().bookings,
  
  // ステータス更新
  updateBookingStatus: (id: string, status: BookingStatus) => {
    const db = getDB();
    db.bookings = db.bookings.map(b => b.id === id ? { ...b, status } : b);
    saveDB(db);
  }
};
