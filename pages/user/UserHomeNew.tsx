import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Award, Calendar, Shield, Search, ChevronRight,
  Clock, Star, TrendingUp, Heart, User
} from 'lucide-react';

interface UserHomeNewProps {
  currentUser?: {
    name: string;
    role: string;
    kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_STARTED';
  } | null;
}

const UserHomeNew: React.FC<UserHomeNewProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loadingTherapists, setLoadingTherapists] = useState(true);

  useEffect(() => {
    fetchTopTherapists();
  }, []);

  const fetchTopTherapists = async () => {
    try {
      const response = await fetch('/api/therapists?limit=6');
      const data = await response.json();
      // APIレスポンスは {therapists: [...], total: ...} の構造
      setTherapists(data.therapists || []);
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
    } finally {
      setLoadingTherapists(false);
    }
  };

  const handleDispatchBooking = () => {
    if (!currentUser) {
      // 非会員の場合はログイン画面へ
      navigate('/auth/login/user?redirect=/app&action=dispatch');
      return;
    }

    // KYCステータス確認
    if (currentUser.kycStatus !== 'VERIFIED') {
      // KYC未済の場合はKYC登録へ誘導
      navigate('/app/account/kyc?redirect=/app&action=dispatch');
      return;
    }

    // KYC済みの場合はセラピスト選択へ
    navigate('/therapists?mode=dispatch');
  };

  const handleCubSearch = () => {
    // CARE CUBE検索（ログイン不要）
    navigate('/app/map');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - 動画背景付き2択ボタン */}
      <div className="relative bg-black text-white overflow-hidden">
        {/* 背景動画 */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
          {/* グラデーションオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
          {/* 新しいキャッチコピー */}
          <div className="text-center mb-12">
            <p className="text-lg md:text-xl font-medium text-white/80 mb-4 tracking-wider">
              どこでも、いつでも
            </p>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              心と身体を、<br />
              <span className="text-teal-400">ととのえる。</span>
            </h1>
            {currentUser && (
              <p className="text-lg md:text-xl font-medium text-white/90 mt-4">
                おかえりなさい、{currentUser.name}さん
              </p>
            )}
          </div>

          {/* 2択の大きなボタン */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* ①出張で呼ぶ */}
            <button
              onClick={handleDispatchBooking}
              className="group relative bg-white/15 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-8 md:p-10 hover:bg-white/25 hover:border-white/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
            >
              <div className="absolute top-6 right-6 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full shadow-lg">
                KYC必須
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin size={40} className="text-white" />
                </div>
                
                <h3 className="text-3xl font-black mb-3">出張で呼ぶ</h3>
                <p className="text-white/80 font-medium mb-6 text-lg">
                  ご自宅・ホテルへセラピストが訪問
                </p>
                
                <div className="space-y-2 text-left w-full">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield size={16} />
                    <span className="font-bold">本人確認済み会員様限定</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} />
                    <span className="font-bold">最短2時間で訪問可能</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star size={16} />
                    <span className="font-bold">プロのセラピストを指名</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-white font-black">
                  セラピストを選ぶ
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* ②CARE CUBEを探す */}
            <button
              onClick={handleCubSearch}
              className="group relative bg-white/15 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-8 md:p-10 hover:bg-white/25 hover:border-white/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
            >
              <div className="absolute top-6 right-6 bg-green-400 text-green-900 text-xs font-black px-3 py-1 rounded-full shadow-lg">
                おすすめ
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Search size={40} className="text-white" />
                </div>
                
                <h3 className="text-3xl font-black mb-3">CARE CUBEを探す</h3>
                <p className="text-white/80 font-medium mb-6 text-lg">
                  全国の施設から検索して予約
                </p>
                
                <div className="space-y-2 text-left w-full">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} />
                    <span className="font-bold">全国54拠点のCARE CUBE</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} />
                    <span className="font-bold">24時間いつでも予約可能</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp size={16} />
                    <span className="font-bold">セラピスト自動割当</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-white font-black">
                  地図から探す
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>

          {/* KYC未済の場合の注意書き */}
          {currentUser && currentUser.kycStatus !== 'VERIFIED' && (
            <div className="mt-8 max-w-2xl mx-auto bg-amber-500/25 backdrop-blur-md border border-amber-400/50 rounded-2xl p-5 text-center shadow-xl">
              <div className="flex items-center justify-center gap-2 text-white">
                <Shield size={20} />
                <span className="font-bold">
                  出張予約をご利用いただくには、本人確認（KYC）が必要です
                </span>
              </div>
            </div>
          )}

          {/* 非会員の場合の注意書き */}
          {!currentUser && (
            <div className="mt-8 max-w-2xl mx-auto bg-white/15 backdrop-blur-md border border-white/40 rounded-2xl p-5 text-center shadow-xl">
              <div className="flex items-center justify-center gap-2 text-white">
                <User size={20} />
                <span className="font-bold">
                  予約にはログインまたは会員登録が必要です
                </span>
              </div>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/auth/login/user')}
                  className="px-6 py-2.5 bg-white text-teal-600 font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                >
                  ログイン
                </button>
                <button
                  onClick={() => navigate('/auth/signup/user')}
                  className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg"
                >
                  新規登録
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 地図からの検索セクション */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-3">地図から探す</h2>
          <p className="text-gray-600 font-medium">
            お近くのCARE CUBEを地図で検索できます
          </p>
        </div>

        <div 
          onClick={handleCubSearch}
          className="relative h-96 bg-gray-200 rounded-3xl overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl transition-all"
        >
          {/* 地図プレビュー画像（実際にはGoogle Mapsを埋め込み） */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={64} className="text-teal-600 mx-auto mb-4" />
              <p className="text-2xl font-black text-gray-900">地図を開く</p>
              <p className="text-gray-600 font-medium mt-2">全国54拠点のCARE CUBEを表示</p>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
        </div>
      </div>

      {/* セラピスト一部表示セクション */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-3">おすすめセラピスト</h2>
            <p className="text-gray-600 font-medium">
              経験豊富なプロのセラピストをご紹介
            </p>
          </div>

          {loadingTherapists ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapists.map((therapist) => (
                <div
                  key={therapist.id}
                  onClick={() => navigate(`/app/therapist/${therapist.id}`)}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={therapist.avatar_url || '/default-avatar.png'}
                      alt={therapist.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 mb-1">{therapist.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        <span className="font-bold text-gray-900">{therapist.rating}</span>
                        <span className="text-gray-500">({therapist.review_count}件)</span>
                      </div>
                    </div>
                  </div>

                  {therapist.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {therapist.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award size={16} />
                      <span className="font-medium">経験{therapist.experience_years || 5}年</span>
                    </div>
                    <button className="flex items-center gap-1 text-teal-600 font-bold text-sm group-hover:gap-2 transition-all">
                      詳細を見る
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* もっと見るボタン */}
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/therapists')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all hover:scale-105"
            >
              全セラピストを見る
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            まずは無料会員登録から
          </h2>
          <p className="text-xl text-white/90 mb-8 font-medium">
            CARE CUBE予約も出張予約も、会員登録で全機能をご利用いただけます
          </p>
          {!currentUser && (
            <button
              onClick={() => navigate('/auth/signup/user')}
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-teal-600 font-black text-lg rounded-2xl hover:bg-white/90 transition-all hover:scale-105 shadow-2xl"
            >
              <Heart size={24} />
              今すぐ無料登録
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHomeNew;
