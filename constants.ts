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

// 11名のセラピストモックデータ（ローカル写真使用）
export const MOCK_THERAPISTS = [
  {
    id: 'therapist-1',
    name: '田中 美咲',
    email: 'misaki.tanaka@hogusy.com',
    phone: '090-1234-5678',
    photo: '/therapists/therapist-1.jpg',
    bio: '看護師資格を持つベテランセラピスト。医療知識を活かした丁寧な施術で、お客様一人ひとりの体調に合わせたケアを提供します。',
    specialties: ['メディカルマッサージ', 'リラクゼーション', 'アロマセラピー'],
    experience: 10,
    rating: 4.9,
    reviewCount: 342,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-2',
    name: '佐藤 武志',
    email: 'takeshi.sato@hogusy.com',
    phone: '090-2345-6789',
    photo: '/therapists/therapist-2.jpg',
    bio: 'スポーツトレーナー出身の男性セラピスト。筋膜リリースとスポーツマッサージで、アスリートから一般の方まで幅広く対応。',
    specialties: ['スポーツマッサージ', '筋膜リリース', 'ストレッチ'],
    experience: 8,
    rating: 4.8,
    reviewCount: 298,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-3',
    name: '山田 健二',
    email: 'kenji.yamada@hogusy.com',
    phone: '090-3456-7890',
    photo: '/therapists/therapist-3.jpg',
    bio: '整体院での経験を活かした施術が得意。深層筋へのアプローチで根本から体を改善します。',
    specialties: ['整体', '深層筋マッサージ', '姿勢改善'],
    experience: 12,
    rating: 4.7,
    reviewCount: 134,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-4',
    name: '小林 結衣',
    email: 'yui.kobayashi@hogusy.com',
    phone: '090-4567-8901',
    photo: 'https://www.genspark.ai/api/files/s/kMBUm4hm',
    bio: '看護師としての経験を活かし、丁寧で安心感のある施術を心がけています。女性のお客様に人気です。',
    specialties: ['リラクゼーション', 'リンパドレナージュ', 'メディカルケア'],
    experience: 6,
    rating: 4.7,
    reviewCount: 234,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-5',
    name: '渡辺 あゆみ',
    email: 'ayumi.watanabe@hogusy.com',
    phone: '090-5678-9012',
    photo: 'https://www.genspark.ai/api/files/s/0RIiDbmp',
    bio: '受付スタッフとしても活躍。お客様とのコミュニケーションを大切にし、心身ともにリラックスできる施術を提供。',
    specialties: ['リラクゼーション', 'ボディケア', 'ヘッドスパ'],
    experience: 4,
    rating: 4.6,
    reviewCount: 187,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-6',
    name: '加藤 浩樹',
    email: 'hiroki.kato@hogusy.com',
    phone: '090-6789-0123',
    photo: 'https://www.genspark.ai/api/files/s/iLvjbJLH',
    bio: 'エステティシャン出身の男性セラピスト。美容と健康の両面からアプローチする施術が特徴です。',
    specialties: ['美容整体', 'リンパドレナージュ', 'デトックス'],
    experience: 7,
    rating: 4.7,
    reviewCount: 265,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-7',
    name: '中村 さくら',
    email: 'sakura.nakamura@hogusy.com',
    phone: '090-7890-1234',
    photo: 'https://www.genspark.ai/api/files/s/rmby81Es',
    bio: '明るく親しみやすい雰囲気が魅力。初めての方でもリラックスして施術を受けていただけます。',
    specialties: ['リラクゼーション', 'アロマセラピー', 'ストレッチ'],
    experience: 5,
    rating: 4.8,
    reviewCount: 213,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-8',
    name: '山本 梨奈',
    email: 'rina.yamamoto@hogusy.com',
    phone: '090-8901-2345',
    photo: 'https://www.genspark.ai/api/files/s/iqRVJzGE',
    bio: '笑顔が素敵なセラピスト。お客様の悩みに寄り添った丁寧なカウンセリングと施術を提供。',
    specialties: ['リラクゼーション', 'ボディケア', 'フットケア'],
    experience: 6,
    rating: 4.7,
    reviewCount: 198,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-9',
    name: '伊藤 優香',
    email: 'yuka.ito@hogusy.com',
    phone: '090-9012-3456',
    photo: 'https://www.genspark.ai/api/files/s/jl395HcH',
    bio: '国家資格保有のあん摩マッサージ指圧師。確かな技術で根本から体の不調を改善します。',
    specialties: ['あん摩', '指圧', 'マッサージ'],
    experience: 9,
    rating: 4.9,
    reviewCount: 378,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-10',
    name: '鈴木 美香',
    email: 'mika.suzuki@hogusy.com',
    phone: '090-0123-4567',
    photo: 'https://www.genspark.ai/api/files/s/hg4hZj91',
    bio: 'ヨガインストラクターとしても活動。呼吸と体のバランスを整える施術が特徴です。',
    specialties: ['ヨガセラピー', 'ストレッチ', 'バランス調整'],
    experience: 7,
    rating: 4.8,
    reviewCount: 289,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  },
  {
    id: 'therapist-11',
    name: '高橋 大地',
    email: 'daichi.takahashi@hogusy.com',
    phone: '090-1234-6789',
    photo: 'https://www.genspark.ai/api/files/s/dlavRDmC',
    bio: '鍼灸師・柔道整復師の資格保有。スポーツ障害や慢性痛の改善を得意としています。',
    specialties: ['鍼灸', '柔道整復', 'スポーツ障害'],
    experience: 11,
    rating: 4.9,
    reviewCount: 423,
    areas: ['渋谷区', '新宿区', '港区'],
    status: 'APPROVED'
  }
];

// CARE CUBE施設モックデータ (54施設 - データベースと完全同期)
export const MOCK_SITES = [
  {"id":"cube-setagaya-003","name":"CARE CUBE 二子玉川","type":"HOTEL","address":"東京都世田谷区玉川2-21-1","area":"世田谷区","lat":35.6122,"lng":139.6288,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク"],"status":"APPROVED","cubeSerial":"CUBE-FTK-001"},
  {"id":"cube-setagaya-005","name":"CARE CUBE 経堂","type":"HOTEL","address":"東京都世田谷区宮坂3-1-45","area":"世田谷区","lat":35.6502,"lng":139.6389,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KYD-001"},
  {"id":"cube-setagaya-004","name":"CARE CUBE 成城学園前","type":"HOTEL","address":"東京都世田谷区成城6-5-34","area":"世田谷区","lat":35.6413,"lng":139.6019,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJG-001"},
  {"id":"cube-setagaya-002","name":"CARE CUBE 下北沢","type":"HOTEL","address":"東京都世田谷区北沢2-11-15","area":"世田谷区","lat":35.6616,"lng":139.668,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SMK-001"},
  {"id":"cube-setagaya-006","name":"CARE CUBE 用賀","type":"HOTEL","address":"東京都世田谷区用賀4-10-1","area":"世田谷区","lat":35.6262,"lng":139.6356,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-STG-006"},
  {"id":"cube-chuo-006","name":"CARE CUBE 人形町","type":"HOTEL","address":"東京都中央区日本橋人形町2-14-5","area":"中央区","lat":35.6853,"lng":139.7826,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-CHO-006"},
  {"id":"cube-chuo-004","name":"CARE CUBE 八丁堀","type":"HOTEL","address":"東京都中央区八丁堀2-20-8","area":"中央区","lat":35.6734,"lng":139.7792,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-HCB-001"},
  {"id":"cube-chuo-005","name":"CARE CUBE 茅場町","type":"HOTEL","address":"東京都中央区日本橋茅場町1-5-8","area":"中央区","lat":35.6809,"lng":139.7778,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KYB-001"},
  {"id":"cube-chuo-002","name":"CARE CUBE 日本橋","type":"HOTEL","address":"東京都中央区日本橋2-7-1","area":"中央区","lat":35.6826,"lng":139.7739,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-NHB-001"},
  {"id":"cube-chuo-003","name":"CARE CUBE 築地","type":"HOTEL","address":"東京都中央区築地4-10-10","area":"中央区","lat":35.6659,"lng":139.7702,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-TKJ-001"},
  {"id":"cube-chiyoda-002","name":"CARE CUBE 秋葉原","type":"HOTEL","address":"東京都千代田区外神田1-15-9","area":"千代田区","lat":35.6983,"lng":139.7731,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-AKB-001"},
  {"id":"cube-chiyoda-006","name":"CARE CUBE 飯田橋","type":"HOTEL","address":"東京都千代田区飯田橋4-4-15","area":"千代田区","lat":35.7021,"lng":139.7465,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-IDB-001"},
  {"id":"cube-chiyoda-003","name":"CARE CUBE 神田","type":"HOTEL","address":"東京都千代田区内神田2-10-5","area":"千代田区","lat":35.6911,"lng":139.7701,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KND-001"},
  {"id":"cube-chiyoda-004","name":"CARE CUBE 大手町","type":"HOTEL","address":"東京都千代田区大手町1-6-1","area":"千代田区","lat":35.6861,"lng":139.7638,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-OTC-001"},
  {"id":"cube-chiyoda-005","name":"CARE CUBE 有楽町","type":"HOTEL","address":"東京都千代田区有楽町2-7-1","area":"千代田区","lat":35.6751,"lng":139.7633,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-YRC-001"},
  {"id":"cube-shinagawa-001","name":"CARE CUBE 五反田","type":"HOTEL","address":"東京都品川区西五反田1-26-2","area":"品川区","lat":35.6258,"lng":139.7235,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-GTD-001"},
  {"id":"cube-shinagawa-003","name":"CARE CUBE 目黒","type":"HOTEL","address":"東京都品川区上大崎2-16-9","area":"品川区","lat":35.6337,"lng":139.7158,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-MGR-001"},
  {"id":"cube-shinagawa-004","name":"CARE CUBE 武蔵小山","type":"HOTEL","address":"東京都品川区小山3-23-3","area":"品川区","lat":35.6131,"lng":139.7085,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-MSK-001"},
  {"id":"cube-shinagawa-002","name":"CARE CUBE 大崎","type":"HOTEL","address":"東京都品川区大崎1-6-1","area":"品川区","lat":35.6197,"lng":139.7286,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-OSK-001"},
  {"id":"cube-shinagawa-006","name":"CARE CUBE 不動前","type":"HOTEL","address":"東京都品川区西五反田5-24-7","area":"品川区","lat":35.6231,"lng":139.7167,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SGW-006"},
  {"id":"cube-shinagawa-005","name":"CARE CUBE 戸越","type":"HOTEL","address":"東京都品川区戸越2-6-3","area":"品川区","lat":35.6097,"lng":139.7151,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-TGS-001"},
  {"id":"cube-shinjuku-002","name":"CARE CUBE 新宿三丁目","type":"HOTEL","address":"東京都新宿区新宿3-35-6","area":"新宿区","lat":35.6911,"lng":139.7056,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-002"},
  {"id":"cube-shinjuku-003","name":"CARE CUBE 新宿御苑","type":"HOTEL","address":"東京都新宿区新宿2-1-2","area":"新宿区","lat":35.6873,"lng":139.7108,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-003"},
  {"id":"cube-shinjuku-004","name":"CARE CUBE 高田馬場","type":"HOTEL","address":"東京都新宿区高田馬場2-14-5","area":"新宿区","lat":35.7127,"lng":139.704,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-004"},
  {"id":"cube-shinjuku-005","name":"CARE CUBE 四谷","type":"HOTEL","address":"東京都新宿区四谷1-6-1","area":"新宿区","lat":35.6868,"lng":139.7301,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-005"},
  {"id":"cube-shinjuku-006","name":"CARE CUBE 神楽坂","type":"HOTEL","address":"東京都新宿区神楽坂3-5","area":"新宿区","lat":35.7022,"lng":139.7401,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-006"},
  {"id":"cube-shinjuku-007","name":"CARE CUBE 早稲田","type":"HOTEL","address":"東京都新宿区早稲田町77","area":"新宿区","lat":35.7072,"lng":139.7187,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-007"},
  {"id":"cube-shinjuku-008","name":"CARE CUBE 西新宿","type":"HOTEL","address":"東京都新宿区西新宿7-10-1","area":"新宿区","lat":35.6938,"lng":139.6936,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-008"},
  {"id":"cube-shinjuku-009","name":"CARE CUBE 新大久保","type":"HOTEL","address":"東京都新宿区百人町1-10-10","area":"新宿区","lat":35.7011,"lng":139.7005,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-009"},
  {"id":"cube-shinjuku-010","name":"CARE CUBE 信濃町","type":"HOTEL","address":"東京都新宿区信濃町34","area":"新宿区","lat":35.6805,"lng":139.7211,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SJK-010"},
  {"id":"site-shibuya-1","name":"HOGUSY 渋谷スタジオ","type":"HOTEL","address":"東京都渋谷区道玄坂2-10-7 新大宗ビル1号館","area":"渋谷区","lat":35.658,"lng":139.6983,"roomCount":3,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク"],"status":"APPROVED","cubeSerial":"CUBE-SBY-001"},
  {"id":"cube-shibuya-002","name":"CARE CUBE 表参道","type":"HOTEL","address":"東京都渋谷区神宮前5-1-5","area":"渋谷区","lat":35.6654,"lng":139.7102,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBY-002"},
  {"id":"cube-shibuya-003","name":"CARE CUBE 代々木","type":"HOTEL","address":"東京都渋谷区代々木1-30-1","area":"渋谷区","lat":35.6832,"lng":139.7021,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBY-003"},
  {"id":"cube-shibuya-004","name":"CARE CUBE 恵比寿","type":"HOTEL","address":"東京都渋谷区恵比寿南1-5-5","area":"渋谷区","lat":35.6467,"lng":139.7107,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク"],"status":"APPROVED","cubeSerial":"CUBE-SBY-004"},
  {"id":"cube-shibuya-005","name":"CARE CUBE 原宿","type":"HOTEL","address":"東京都渋谷区神宮前1-14-5","area":"渋谷区","lat":35.6703,"lng":139.7026,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBY-005"},
  {"id":"cube-shibuya-006","name":"CARE CUBE 代官山","type":"HOTEL","address":"東京都渋谷区代官山町20-20","area":"渋谷区","lat":35.6503,"lng":139.7026,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBY-006"},
  {"id":"cube-shibuya-007","name":"CARE CUBE 笹塚","type":"HOTEL","address":"東京都渋谷区笹塚1-50-1","area":"渋谷区","lat":35.674,"lng":139.674,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBY-007"},
  {"id":"cube-shibuya-008","name":"CARE CUBE 幡ヶ谷","type":"HOTEL","address":"東京都渋谷区幡ヶ谷2-10-10","area":"渋谷区","lat":35.6772,"lng":139.6785,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBY-008"},
  {"id":"cube-shibuya-009","name":"CARE CUBE 初台","type":"HOTEL","address":"東京都渋谷区初台1-40-5","area":"渋谷区","lat":35.6805,"lng":139.6868,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBY-009"},
  {"id":"cube-shibuya-010","name":"CARE CUBE 神泉","type":"HOTEL","address":"東京都渋谷区神泉町10-10","area":"渋谷区","lat":35.6542,"lng":139.6925,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBY-010"},
  {"id":"site-roppongi-1","name":"HOGUSY 六本木ヒルズ","type":"HOTEL","address":"東京都港区六本木6-10-1 六本木ヒルズ森タワー","area":"港区","lat":35.6604,"lng":139.7292,"roomCount":3,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク","VIPラウンジ"],"status":"APPROVED","cubeSerial":"CUBE-RPG-001"},
  {"id":"cube-minato-002","name":"CARE CUBE 赤坂","type":"HOTEL","address":"東京都港区赤坂5-3-1","area":"港区","lat":35.6733,"lng":139.7368,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-AKS-001"},
  {"id":"cube-minato-003","name":"CARE CUBE 麻布十番","type":"HOTEL","address":"東京都港区麻布十番2-3-5","area":"港区","lat":35.6551,"lng":139.7366,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク"],"status":"APPROVED","cubeSerial":"CUBE-AZB-001"},
  {"id":"cube-minato-007","name":"CARE CUBE 浜松町","type":"HOTEL","address":"東京都港区浜松町2-5-5","area":"港区","lat":35.6551,"lng":139.7571,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-HMM-001"},
  {"id":"cube-minato-010","name":"CARE CUBE 表参道駅","type":"HOTEL","address":"東京都港区北青山3-6-12","area":"港区","lat":35.6654,"lng":139.7119,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-MIN-010"},
  {"id":"cube-minato-008","name":"CARE CUBE 新橋","type":"HOTEL","address":"東京都港区新橋2-16-1","area":"港区","lat":35.6664,"lng":139.7582,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SBH-001"},
  {"id":"cube-minato-004","name":"CARE CUBE 品川","type":"HOTEL","address":"東京都港区港南2-3-13","area":"港区","lat":35.6284,"lng":139.7387,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SGW-001"},
  {"id":"cube-minato-005","name":"CARE CUBE 白金高輪","type":"HOTEL","address":"東京都港区白金1-17-2","area":"港区","lat":35.6401,"lng":139.7358,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SRK-001"},
  {"id":"cube-minato-006","name":"CARE CUBE 田町","type":"HOTEL","address":"東京都港区芝5-29-20","area":"港区","lat":35.6456,"lng":139.7476,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-TMC-001"},
  {"id":"cube-minato-009","name":"CARE CUBE 虎ノ門","type":"HOTEL","address":"東京都港区虎ノ門1-17-1","area":"港区","lat":35.6684,"lng":139.7505,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-TRN-001"},
  {"id":"site-shinjuku-1","name":"HOGUSY 新宿プレミアム","type":"HOTEL","address":"東京都新宿区西新宿1-1-7 MSビルディング","area":"新宿区","lat":35.6896,"lng":139.6917,"roomCount":3,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク","マッサージチェア"],"status":"APPROVED","cubeSerial":"CUBE-SJK-001"},
  {"id":"cube-toshima-001","name":"CARE CUBE 池袋東口","type":"HOTEL","address":"東京都豊島区南池袋1-28-1","area":"豊島区","lat":35.7296,"lng":139.7109,"roomCount":3,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク"],"status":"APPROVED","cubeSerial":"CUBE-IKB-001"},
  {"id":"cube-toshima-002","name":"CARE CUBE 池袋西口","type":"HOTEL","address":"東京都豊島区西池袋1-17-10","area":"豊島区","lat":35.7304,"lng":139.7072,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-IKB-002"},
  {"id":"cube-toshima-005","name":"CARE CUBE 駒込","type":"HOTEL","address":"東京都豊島区駒込1-43-9","area":"豊島区","lat":35.7364,"lng":139.747,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KMG-001"},
  {"id":"cube-toshima-003","name":"CARE CUBE 大塚","type":"HOTEL","address":"東京都豊島区南大塚3-33-1","area":"豊島区","lat":35.7311,"lng":139.7285,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-OTK-001"},
  {"id":"cube-toshima-004","name":"CARE CUBE 巣鴨","type":"HOTEL","address":"東京都豊島区巣鴨3-34-2","area":"豊島区","lat":35.7334,"lng":139.7392,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-SGM-001"},
  {"id":"cube-toshima-006","name":"CARE CUBE 東池袋","type":"HOTEL","address":"東京都豊島区東池袋1-13-16","area":"豊島区","lat":35.7313,"lng":139.7177,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-TSM-006"}
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
