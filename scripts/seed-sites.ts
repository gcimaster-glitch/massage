/**
 * 施設データをDBに一括登録するスクリプト
 * Usage: npx tsx scripts/seed-sites.ts
 */

import { MOCK_SITES } from '../constants';

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const DATABASE_ID = process.env.DATABASE_ID || '';

// 追加のモックデータ（80件にするため22件追加）
const ADDITIONAL_SITES = [
  {"id":"cube-meguro-001","name":"CARE CUBE 中目黒","type":"CARE_CUBE","address":"東京都目黒区上目黒1-5-10","area":"目黒区","lat":35.6442,"lng":139.6979,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-NKM-001"},
  {"id":"cube-meguro-002","name":"CARE CUBE 学芸大学","type":"CARE_CUBE","address":"東京都目黒区鷹番3-6-17","area":"目黒区","lat":35.6217,"lng":139.6944,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-GGD-001"},
  {"id":"cube-meguro-003","name":"CARE CUBE 自由が丘","type":"CARE_CUBE","address":"東京都目黒区自由が丘1-9-8","area":"目黒区","lat":35.6078,"lng":139.6682,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-JYG-001"},
  {"id":"cube-ota-001","name":"CARE CUBE 蒲田","type":"CARE_CUBE","address":"東京都大田区蒲田5-15-8","area":"大田区","lat":35.5617,"lng":139.7154,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KMT-001"},
  {"id":"cube-ota-002","name":"CARE CUBE 大森","type":"CARE_CUBE","address":"東京都大田区大森北1-10-14","area":"大田区","lat":35.5882,"lng":139.7283,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-OMR-001"},
  {"id":"cube-suginami-001","name":"CARE CUBE 荻窪","type":"CARE_CUBE","address":"東京都杉並区荻窪5-28-10","area":"杉並区","lat":35.7048,"lng":139.6203,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-OGK-001"},
  {"id":"cube-suginami-002","name":"CARE CUBE 高円寺","type":"CARE_CUBE","address":"東京都杉並区高円寺南4-26-12","area":"杉並区","lat":35.7055,"lng":139.6503,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KNJ-001"},
  {"id":"cube-suginami-003","name":"CARE CUBE 阿佐ヶ谷","type":"CARE_CUBE","address":"東京都杉並区阿佐谷南3-37-2","area":"杉並区","lat":35.7047,"lng":139.6354,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-ASG-001"},
  {"id":"cube-nakano-001","name":"CARE CUBE 中野","type":"CARE_CUBE","address":"東京都中野区中野5-52-15","area":"中野区","lat":35.7066,"lng":139.6655,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-NKN-001"},
  {"id":"cube-nakano-002","name":"CARE CUBE 東中野","type":"CARE_CUBE","address":"東京都中野区東中野1-58-11","area":"中野区","lat":35.7061,"lng":139.6863,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-HNK-001"},
  {"id":"cube-koto-001","name":"CARE CUBE 門前仲町","type":"CARE_CUBE","address":"東京都江東区門前仲町1-13-11","area":"江東区","lat":35.6719,"lng":139.7966,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-MZN-001"},
  {"id":"cube-koto-002","name":"CARE CUBE 木場","type":"CARE_CUBE","address":"東京都江東区木場2-17-14","area":"江東区","lat":35.6703,"lng":139.8063,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KIB-001"},
  {"id":"cube-koto-003","name":"CARE CUBE 豊洲","type":"CARE_CUBE","address":"東京都江東区豊洲3-2-24","area":"江東区","lat":35.6548,"lng":139.7957,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-TYS-001"},
  {"id":"cube-sumida-001","name":"CARE CUBE 錦糸町","type":"CARE_CUBE","address":"東京都墨田区江東橋3-9-10","area":"墨田区","lat":35.6969,"lng":139.8139,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KNS-001"},
  {"id":"cube-taito-001","name":"CARE CUBE 上野","type":"CARE_CUBE","address":"東京都台東区上野6-16-16","area":"台東区","lat":35.7089,"lng":139.7742,"roomCount":2,"amenities":["Wi-Fi","シャワー","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-UEN-001"},
  {"id":"cube-taito-002","name":"CARE CUBE 浅草","type":"CARE_CUBE","address":"東京都台東区浅草1-18-11","area":"台東区","lat":35.7114,"lng":139.7966,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-ASK-001"},
  {"id":"cube-bunkyo-001","name":"CARE CUBE 本郷三丁目","type":"CARE_CUBE","address":"東京都文京区本郷3-38-1","area":"文京区","lat":35.7075,"lng":139.7622,"roomCount":1,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-HNG-001"},
  {"id":"cube-bunkyo-002","name":"CARE CUBE 後楽園","type":"CARE_CUBE","address":"東京都文京区春日1-16-21","area":"文京区","lat":35.7065,"lng":139.752,"roomCount":2,"amenities":["Wi-Fi","アメニティ"],"status":"APPROVED","cubeSerial":"CUBE-KRK-001"},
  {"id":"charge-shibuya-001","name":"CHARGE 渋谷店","type":"CHARGE","address":"東京都渋谷区神南1-20-5","area":"渋谷区","lat":35.6631,"lng":139.6991,"roomCount":4,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク","ラウンジ"],"status":"APPROVED","cubeSerial":"CHG-SBY-001"},
  {"id":"charge-shinjuku-001","name":"CHARGE 新宿店","type":"CHARGE","address":"東京都新宿区新宿3-17-5","area":"新宿区","lat":35.6917,"lng":139.7045,"roomCount":4,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク","ラウンジ"],"status":"APPROVED","cubeSerial":"CHG-SJK-001"},
  {"id":"charge-roppongi-001","name":"CHARGE 六本木店","type":"CHARGE","address":"東京都港区六本木7-14-4","area":"港区","lat":35.6638,"lng":139.7309,"roomCount":5,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク","VIPラウンジ","サウナ"],"status":"APPROVED","cubeSerial":"CHG-RPG-001"},
  {"id":"charge-ginza-001","name":"CHARGE 銀座店","type":"CHARGE","address":"東京都中央区銀座5-9-5","area":"中央区","lat":35.6716,"lng":139.7645,"roomCount":4,"amenities":["Wi-Fi","シャワー","アメニティ","ドリンク","ラウンジ"],"status":"APPROVED","cubeSerial":"CHG-GNZ-001"}
];

const ALL_SITES = [...MOCK_SITES, ...ADDITIONAL_SITES];

async function seedSites() {
  console.log('🌱 Starting site data seeding...');
  console.log(`📊 Total sites to insert: ${ALL_SITES.length}`);

  // 管理者トークンを取得（デモログイン）
  const adminToken = await getAdminToken();
  if (!adminToken) {
    console.error('❌ Failed to get admin token');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const site of ALL_SITES) {
    try {
      const response = await fetch('http://localhost:3000/api/admin/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          id: site.id,
          name: site.name,
          type: site.type || 'CARE_CUBE',
          address: site.address,
          area_code: site.area,
          latitude: site.lat,
          longitude: site.lng,
          room_count: site.roomCount,
          amenities: JSON.stringify(site.amenities),
          status: site.status,
          image_url: `/sites/${site.id}.jpg`,
          description: `${site.name}は${site.area}に位置する施設です。`,
          host_id: 'host-default'
        }),
      });

      if (response.ok) {
        successCount++;
        console.log(`✅ [${successCount}/${ALL_SITES.length}] ${site.name} inserted successfully`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to insert ${site.name}: ${error}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Error inserting ${site.name}:`, error);
      errorCount++;
    }
    
    // APIレート制限対策（100ms待機）
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📦 Total: ${ALL_SITES.length}`);
}

async function getAdminToken(): Promise<string | null> {
  try {
    // デモ管理者トークンを生成（開発環境のみ）
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi1kZW1vIiwiZW1haWwiOiJhZG1pbkBob2d1c3kuY29tIiwicm9sZSI6IkFETUlOIiwidXNlck5hbWUiOiLnt4/nrqHnkIborIUiLCJleHAiOjE3NjkwMDAwMDB9';
    return mockToken;
  } catch (error) {
    console.error('Failed to get admin token:', error);
    return null;
  }
}

// Run the seed function
seedSites()
  .then(() => {
    console.log('\n🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
