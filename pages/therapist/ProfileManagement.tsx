import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Award, Camera, Upload, Save, 
  CheckCircle, AlertCircle, Calendar, Clock, DollarSign, 
  FileText, Star, Settings, Edit, Trash2, Plus, X
} from 'lucide-react';

interface TherapistProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  bio: string;
  specialties: string[];
  experience_years: number;
  certifications: string[];
  rating: number;
  review_count: number;
  approved_areas: string[];
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  commission_rate: number; // セラピスト取り分（%）
}

interface Course {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

interface Option {
  id: string;
  name: string;
  price: number;
  description: string;
}

const TherapistProfileManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'options' | 'schedule' | 'certifications'>('profile');
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // プロフィール情報の取得
  useEffect(() => {
    fetchProfile();
    fetchMenu();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/therapists/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
    }
  };

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/therapists/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setOptions(data.options || []);
      }
    } catch (err) {
      console.error('メニュー取得エラー:', err);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/therapists/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage('プロフィールを保存しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('保存に失敗しました');
      }
    } catch (err) {
      setError('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = () => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: '',
      duration: 60,
      price: 7000,
      description: '',
    };
    setCourses([...courses, newCourse]);
  };

  const handleUpdateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleSaveCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/therapists/menu/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ courses }),
      });

      if (response.ok) {
        setMessage('コース情報を保存しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('保存に失敗しました');
      }
    } catch (err) {
      setError('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    const newOption: Option = {
      id: `option-${Date.now()}`,
      name: '',
      price: 1000,
      description: '',
    };
    setOptions([...options, newOption]);
  };

  const handleUpdateOption = (id: string, field: keyof Option, value: any) => {
    setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleDeleteOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
  };

  const handleSaveOptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/therapists/menu/options', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ options }),
      });

      if (response.ok) {
        setMessage('オプション情報を保存しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('保存に失敗しました');
      }
    } catch (err) {
      setError('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
          プロフィール管理
        </h1>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
          Therapist Profile Management
        </p>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3">
          <CheckCircle className="text-teal-600" size={20} />
          <p className="text-teal-600 font-bold">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* タブナビゲーション */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: 'profile', label: '基本情報', icon: User },
            { id: 'courses', label: 'コース設定', icon: Clock },
            { id: 'options', label: 'オプション設定', icon: Plus },
            { id: 'certifications', label: '資格・証明書', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* コンテンツエリア */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        {/* 基本情報タブ */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 名前 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  氏名 *
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* メール */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  メールアドレス *
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  電話番号 *
                </label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* 経験年数 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  経験年数
                </label>
                <input
                  type="number"
                  value={profile.experience_years}
                  onChange={(e) => setProfile({ ...profile, experience_years: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                自己紹介
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                placeholder="お客様に向けた自己紹介を記入してください..."
              />
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save size={20} />
                  保存する
                </>
              )}
            </button>
          </div>
        )}

        {/* コース設定タブ */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">コース一覧</h2>
              <button
                onClick={handleAddCourse}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                コースを追加
              </button>
            </div>

            {courses.map((course) => (
              <div key={course.id} className="p-6 border border-gray-200 rounded-2xl">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">コース名</label>
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => handleUpdateCourse(course.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                      placeholder="例: 全身リラクゼーション"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">時間（分）</label>
                    <input
                      type="number"
                      value={course.duration}
                      onChange={(e) => handleUpdateCourse(course.id, 'duration', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">料金（円）</label>
                    <input
                      type="number"
                      value={course.price}
                      onChange={(e) => handleUpdateCourse(course.id, 'price', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      削除
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">説明</label>
                  <textarea
                    value={course.description}
                    onChange={(e) => handleUpdateCourse(course.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                    placeholder="コースの詳細説明..."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSaveCourses}
              disabled={loading}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save size={20} />
                  保存する
                </>
              )}
            </button>
          </div>
        )}

        {/* オプション設定タブ */}
        {activeTab === 'options' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">オプション一覧</h2>
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                オプションを追加
              </button>
            </div>

            {options.map((option) => (
              <div key={option.id} className="p-6 border border-gray-200 rounded-2xl">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">オプション名</label>
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => handleUpdateOption(option.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                      placeholder="例: オイルトリートメント"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">追加料金（円）</label>
                    <input
                      type="number"
                      value={option.price}
                      onChange={(e) => handleUpdateOption(option.id, 'price', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      削除
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">説明</label>
                  <textarea
                    value={option.description}
                    onChange={(e) => handleUpdateOption(option.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                    placeholder="オプションの詳細説明..."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSaveOptions}
              disabled={loading}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save size={20} />
                  保存する
                </>
              )}
            </button>
          </div>
        )}

        {/* 資格・証明書タブ */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">資格・証明書</h2>
            <p className="text-gray-600">資格証明書のアップロード機能は実装中です。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistProfileManagement;
