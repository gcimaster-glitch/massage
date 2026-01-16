/**
 * ============================================
 * HOGUSY Platform Constants
 * ============================================
 */

/**
 * Brand Configuration
 */
export const BRAND = {
  NAME: 'HOGUSY',
  SUB_NAME: 'ほぐす、を、もっと身近に。',
  FULL_NAME: 'HOGUSY（ホグシー）',
  SLOGAN: 'ほぐす、を、もっと身近に。',
  SUPPORT_EMAIL: 'support@hogusy.com',
  INVOICE_PREFIX: 'T1234567890123',
  
  API: {
    BASE_URL: import.meta.env.PROD 
      ? 'https://hogusy.com/api'
      : 'http://localhost:3000/api'
  }
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    OAUTH: '/api/auth/oauth',
    LOGOUT: '/api/auth/logout',
  },
  MASTER: {
    COURSES: '/api/master/courses',
    OPTIONS: '/api/master/options',
    AREAS: '/api/master/areas',
  },
  THERAPISTS: {
    LIST: '/api/therapists',
    DETAIL: (id: string) => `/api/therapists/${id}`,
    MENU: (id: string) => `/api/therapists/${id}/menu`,
  },
  OFFICES: {
    LIST: '/api/offices',
    DETAIL: (id: string) => `/api/offices/${id}`,
  },
  SITES: {
    LIST: '/api/sites',
    DETAIL: (id: string) => `/api/sites/${id}`,
    ROOMS: (id: string) => `/api/sites/${id}/rooms`,
  },
  BOOKINGS: {
    LIST: '/api/bookings',
    DETAIL: (id: string) => `/api/bookings/${id}`,
    CREATE: '/api/bookings',
  },
  ADMIN: {
    STATS: '/api/admin/stats',
    DELETE_MOCK_DATA: '/api/admin/mock-data',
    SEED_MOCK_DATA: '/api/admin/mock-data/seed',
  },
};

/**
 * ============================================
 * MOCK DATA - For Testing & Development
 * ============================================
 */

// 11名のセラピストモックデータ
export const MOCK_THERAPISTS = [
  {
    id: 'therapist-1',
    name: '田中 美咲',
    email: 'miku.tanaka@hogusy.com',
    phone: '090-1234-5678',
    photo: 'https://i.pravatar.cc/150?img=1',
    bio: '国家資格を持つベテランセラピスト。丁寧なカウンセリングと確かな技術で、お客様一人ひとりに合わせた施術を提供します。肩こり・腰痛の改善が得意です。',
    specialties: ['肩こり', '腰痛', '全身疲労', 'ストレッチ'],
    experience: 8,
    rating: 4.8,
    reviewCount: 156,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-2',
    name: '佐藤 健太',
    email: 'kenta.sato@hogusy.com',
    phone: '090-2345-6789',
    photo: 'https://i.pravatar.cc/150?img=12',
    bio: 'スポーツトレーナー経験を活かした施術が特徴。アスリートのケアにも定評があり、深部の筋肉へのアプローチが得意です。',
    specialties: ['スポーツマッサージ', '深層筋', 'ストレッチ', '疲労回復'],
    experience: 6,
    rating: 4.9,
    reviewCount: 203,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-3',
    name: '高橋 愛',
    email: 'ai.takahashi@hogusy.com',
    phone: '090-3456-7890',
    photo: 'https://i.pravatar.cc/150?img=5',
    bio: 'リラクゼーションを重視した優しい施術が人気。アロマオイルを使った癒しの時間を提供します。女性のお客様に特におすすめです。',
    specialties: ['アロマ', 'リラクゼーション', 'リンパ', '美容'],
    experience: 5,
    rating: 4.7,
    reviewCount: 134,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-4',
    name: '山田 大地',
    email: 'daichi.yamada@hogusy.com',
    phone: '090-4567-8901',
    photo: 'https://i.pravatar.cc/150?img=14',
    bio: '整体とマッサージを組み合わせた独自の手技で、根本から体の不調を改善。骨盤矯正や姿勢改善に定評があります。',
    specialties: ['整体', '骨盤矯正', '姿勢改善', '肩こり'],
    experience: 10,
    rating: 4.9,
    reviewCount: 287,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-5',
    name: '鈴木 優希',
    email: 'yuki.suzuki@hogusy.com',
    phone: '090-5678-9012',
    photo: 'https://i.pravatar.cc/150?img=9',
    bio: '若手ながら確かな技術を持つセラピスト。丁寧なコミュニケーションで、初めての方にも安心して施術を受けていただけます。',
    specialties: ['全身マッサージ', '足つぼ', 'ヘッドマッサージ', 'リフレッシュ'],
    experience: 3,
    rating: 4.6,
    reviewCount: 89,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-6',
    name: '山本 梨奈',
    email: 'rina.yamamoto@hogusy.com',
    phone: '090-6789-0123',
    photo: 'https://i.pravatar.cc/150?img=10',
    bio: 'タイ古式マッサージの資格を持つセラピスト。ストレッチを取り入れた施術で柔軟性を高めます。',
    specialties: ['タイ古式', 'ストレッチ', '柔軟性向上', 'リラックス'],
    experience: 7,
    rating: 4.7,
    reviewCount: 145,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-7',
    name: '中村 健二',
    email: 'kenji.nakamura@hogusy.com',
    phone: '090-7890-1234',
    photo: 'https://i.pravatar.cc/150?img=15',
    bio: '鍼灸師・柔道整復師の資格保有。スポーツ障害や慢性痛の改善を得意としています。',
    specialties: ['鍼灸', '柔道整復', 'スポーツ障害', '慢性痛'],
    experience: 12,
    rating: 4.9,
    reviewCount: 321,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-8',
    name: '渡辺 彩花',
    email: 'ayaka.watanabe@hogusy.com',
    phone: '090-8901-2345',
    photo: 'https://i.pravatar.cc/150?img=20',
    bio: 'エステティシャンからセラピストへ転身。美容効果も期待できる施術が女性に人気です。',
    specialties: ['美容整体', '小顔矯正', 'リンパドレナージュ', 'デトックス'],
    experience: 4,
    rating: 4.6,
    reviewCount: 98,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-9',
    name: '伊藤 弘樹',
    email: 'hiroki.ito@hogusy.com',
    phone: '090-9012-3456',
    photo: 'https://i.pravatar.cc/150?img=13',
    bio: '国家資格保有のあん摩マッサージ指圧師。確かな技術で根本から体の不調を改善します。',
    specialties: ['あん摩', '指圧', 'マッサージ', '根本改善'],
    experience: 15,
    rating: 5.0,
    reviewCount: 412,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-10',
    name: '小林 さくら',
    email: 'sakura.kobayashi@hogusy.com',
    phone: '090-0123-4567',
    photo: 'https://i.pravatar.cc/150?img=16',
    bio: 'ヨガインストラクターとしても活動。呼吸と体のバランスを整える施術が特徴です。',
    specialties: ['ヨガ', '呼吸法', 'バランス調整', 'ストレッチ'],
    experience: 6,
    rating: 4.8,
    reviewCount: 178,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-11',
    name: '加藤 武',
    email: 'takeshi.kato@hogusy.com',
    phone: '090-1234-6789',
    photo: 'https://i.pravatar.cc/150?img=18',
    bio: '格闘技経験を活かした力強い施術。深部の筋肉までしっかりほぐします。',
    specialties: ['深層筋', 'トリガーポイント', '筋膜リリース', 'スポーツケア'],
    experience: 9,
    rating: 4.7,
    reviewCount: 234,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  }
];

// CARE CUBE施設モックデータ
export const MOCK_SITES = [
  {
    id: 'site-shibuya-1',
    name: 'HOGUSY 渋谷スタジオ',
    type: 'HOTEL',
    address: '東京都渋谷区道玄坂2-10-7 新大宗ビル1号館',
    area: '渋谷区',
    lat: 35.6580,
    lng: 139.6983,
    roomCount: 3,
    amenities: ['Wi-Fi', 'シャワー', 'アメニティ', 'ドリンク'],
    status: 'APPROVED',
    cubeSerial: 'CUBE-SBY-001'
  },
  {
    id: 'site-shinjuku-1',
    name: 'HOGUSY 新宿プレミアム',
    type: 'HOTEL',
    address: '東京都新宿区西新宿1-1-7 MSビルディング',
    area: '新宿区',
    lat: 35.6896,
    lng: 139.6917,
    roomCount: 3,
    amenities: ['Wi-Fi', 'シャワー', 'アメニティ', 'ドリンク', 'マッサージチェア'],
    status: 'APPROVED',
    cubeSerial: 'CUBE-SJK-001'
  },
  {
    id: 'site-roppongi-1',
    name: 'HOGUSY 六本木ヒルズ',
    type: 'HOTEL',
    address: '東京都港区六本木6-10-1 六本木ヒルズ森タワー',
    area: '港区',
    lat: 35.6604,
    lng: 139.7292,
    roomCount: 3,
    amenities: ['Wi-Fi', 'シャワー', 'アメニティ', 'ドリンク', 'VIPラウンジ'],
    status: 'APPROVED',
    cubeSerial: 'CUBE-RPG-001'
  }
];

// マスターコースデータ
export const MASTER_COURSES = [
  { id: 'mc_1', name: '深層筋ボディケア', duration: 30, basePrice: 3000, description: '短時間で疲れをリフレッシュ' },
  { id: 'mc_2', name: '極上アロマオイル', duration: 60, basePrice: 6000, description: 'じっくりと全身をほぐす' },
  { id: 'mc_3', name: 'ドライヘッドスパ', duration: 90, basePrice: 9000, description: '全身しっかりケア' }
];

// マスターオプションデータ
export const MASTER_OPTIONS = [
  { id: 'option-aroma', name: 'アロマオイル', duration: 0, basePrice: 1000, description: '上質なアロマオイルで癒し効果UP' },
  { id: 'option-head', name: 'ヘッドマッサージ', duration: 15, basePrice: 1500, description: '頭皮のコリをほぐして頭スッキリ' },
  { id: 'option-foot', name: '足つぼマッサージ', duration: 15, basePrice: 1500, description: '足裏の反射区を刺激' },
  { id: 'option-stretch', name: 'ストレッチ', duration: 10, basePrice: 1000, description: 'プロによるストレッチ' }
];

// その他のモックデータ（空配列として定義）
export const MOCK_BOOKINGS: any[] = [];
export const MOCK_AREAS: any[] = [];
export const MOCK_OFFICES: any[] = [];
export const MOCK_STATEMENTS: any[] = [];
export const MOCK_INCIDENTS: any[] = [];
export const MOCK_REVENUE_CONFIG: any = {};
