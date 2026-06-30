import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign, Loader2 } from 'lucide-react';
import SimpleLayout from '../../../components/SimpleLayout';

interface Course {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

const PricingSettings: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/therapists/menu', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.courses) {
          setCourses(data.courses);
        }
      } catch (err) {
        console.error('コース取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handlePriceChange = (id: string, newPrice: number) => {
    setCourses(courses.map(c => c.id === id ? { ...c, price: newPrice } : c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/therapists/menu/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ courses }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('料金設定を保存しました');
      } else {
        setMessage(`エラー: ${data.error || '保存に失敗しました'}`);
      }
    } catch (err) {
      setMessage('通信エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SimpleLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <button onClick={() => navigate('/t/settings')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={20} />
            <span>個人設定に戻る</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-teal-600" />
            コース料金設定
          </h1>
          <p className="text-sm text-gray-600 mt-1">各コースの料金を設定してください</p>
        </div>
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('エラー') || message.includes('通信') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {courses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">コースが登録されていません。メニュー設定から追加してください。</p>
          ) : (
            courses.map((course) => (
              <div key={course.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {course.name}（{course.duration}分）
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    type="number"
                    value={course.price}
                    onChange={(e) => handlePriceChange(course.id, parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                    min={0}
                    step={100}
                  />
                </div>
              </div>
            ))
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">料金設定の目安</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 施設内施術: ¥6,000〜¥12,000/60分</li>
              <li>• 出張施術: 施設内+¥2,000〜¥3,000</li>
              <li>• 延長料金: 通常料金の50%程度</li>
            </ul>
          </div>
          <button
            type="submit"
            disabled={saving || courses.length === 0}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </SimpleLayout>
  );
};

export default PricingSettings;
