/**
 * AutoAssignBooking: お任せ自動割り当て予約ページ
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, User, ChevronRight, Zap } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

const AutoAssignBooking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'ONSITE';

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 60,
    area: 'SHIBUYA',
    budget: 10000,
  });

  const [searching, setSearching] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const areas = [
    { value: 'SHIBUYA', label: '渋谷区' },
    { value: 'SHINJUKU', label: '新宿区' },
    { value: 'MINATO', label: '港区' },
    { value: 'CHIYODA', label: '千代田区' },
    { value: 'CHUO', label: '中央区' },
  ];

  const handleSearch = async () => {
    setSearching(true);

    // TODO: API呼び出し
    setTimeout(() => {
      // モック候補データ
      const mockRecommendations = [
        {
          id: 1,
          therapistName: '山田 太郎',
          siteName: 'CARE CUBE 渋谷店',
          rating: 4.9,
          reviews: 120,
          price: 8000,
          distance: 0.5,
          availability: '即対応可能',
        },
        {
          id: 2,
          therapistName: '佐藤 花子',
          siteName: 'リラクゼーション渋谷',
          rating: 4.8,
          reviews: 95,
          price: 8500,
          distance: 0.8,
          availability: '本日14:00〜',
        },
        {
          id: 3,
          therapistName: '鈴木 次郎',
          siteName: 'ウェルネス渋谷',
          rating: 4.7,
          reviews: 80,
          price: 7500,
          distance: 1.2,
          availability: '本日15:00〜',
        },
      ];

      setRecommendations(mockRecommendations);
      setSearching(false);
    }, 1500);
  };

  const handleSelectRecommendation = (rec: any) => {
    // 選択した候補で予約フローへ
    navigate(`/app/booking/direct/${rec.id}?type=${type}`);
  };

  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">お任せ自動割り当て</h1>
          <p className="text-gray-600">
            ご希望の条件を入力すると、最適なセラピスト・施設を自動でご提案します
          </p>
        </div>

        {/* 条件入力フォーム */}
        {recommendations.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="space-y-6">
              {/* 日時選択 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-teal-600" />
                    希望日
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-teal-600" />
                    希望時間
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* エリア選択 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-teal-600" />
                  希望エリア
                </label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {areas.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 施術時間 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">施術時間</label>
                <div className="grid grid-cols-3 gap-3">
                  {[60, 90, 120].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: min })}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        formData.duration === min
                          ? 'bg-teal-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {min}分
                    </button>
                  ))}
                </div>
              </div>

              {/* 予算 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ご予算（目安）</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    step="1000"
                  />
                </div>
              </div>

              {/* 検索ボタン */}
              <button
                onClick={handleSearch}
                disabled={searching}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {searching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    最適なセラピストを検索中...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    最適なセラピストを探す
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 候補一覧 */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">おすすめの候補</h2>
              <button
                onClick={() => setRecommendations([])}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                条件を変更
              </button>
            </div>

            {recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-teal-500"
                onClick={() => handleSelectRecommendation(rec)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {index === 0 && (
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          最もおすすめ
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-500">{rec.availability}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <User size={20} className="text-teal-600" />
                      {rec.therapistName}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{rec.siteName} (徒歩 {rec.distance}km)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          ⭐ <span className="font-semibold">{rec.rating}</span>
                        </span>
                        <span className="text-gray-400">({rec.reviews}件のレビュー)</span>
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-teal-600">
                      ¥{rec.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500 ml-2">/ {formData.duration}分</span>
                    </div>
                  </div>

                  <button className="ml-4 bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-teal-700 transition-all">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SimpleLayout>
  );
};

export default AutoAssignBooking;
