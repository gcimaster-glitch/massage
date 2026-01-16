import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, User, Calendar, Check, ChevronRight, ChevronLeft,
  Clock, Star, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';

interface Site {
  id: string;
  name: string;
  area: string;
  address: string;
  type: string;
}

interface Therapist {
  id: string;
  user_id: string;
  name: string;
  rating: number;
  review_count: number;
  specialties: string;
  experience_years: number;
}

interface Course {
  id: string;
  name: string;
  duration: number;
  base_price: number;
  description: string;
}

interface Option {
  id: string;
  name: string;
  duration: number;
  base_price: number;
  description: string;
}

const BookingNewFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1:施設 2:セラピスト 3:日時・コース 4:確認

  // ステップ1: 施設選択
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // ステップ2: セラピスト選択
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  // ステップ3: 日時・コース選択
  const [courses, setCourses] = useState<Course[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // ステップ4: 予約処理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 施設一覧の取得
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites?status=APPROVED');
      if (!res.ok) throw new Error('Failed to fetch sites');
      const data = await res.json();
      setSites(data.sites || []);
    } catch (e) {
      console.error('Failed to fetch sites:', e);
      setError('施設一覧の取得に失敗しました');
    }
  };

  // セラピスト一覧の取得（施設選択後）
  const fetchTherapistsForSite = async (siteId: string) => {
    try {
      const res = await fetch(`/api/sites/${siteId}/therapists`);
      if (!res.ok) throw new Error('Failed to fetch therapists');
      const data = await res.json();
      setTherapists(data.therapists || []);
    } catch (e) {
      console.error('Failed to fetch therapists:', e);
      setError('セラピスト一覧の取得に失敗しました');
    }
  };

  // コース・オプション一覧の取得（セラピスト選択後）
  const fetchMenuForTherapist = async (therapistId: string) => {
    try {
      const res = await fetch(`/api/therapists/${therapistId}/menu`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      setCourses(data.courses || []);
      setOptions(data.options || []);
    } catch (e) {
      console.error('Failed to fetch menu:', e);
      setError('メニューの取得に失敗しました');
    }
  };

  // ステップ1→2: 施設を選択
  const handleSelectSite = (site: Site) => {
    setSelectedSite(site);
    fetchTherapistsForSite(site.id);
    setStep(2);
  };

  // ステップ2→3: セラピストを選択
  const handleSelectTherapist = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    fetchMenuForTherapist(therapist.id);
    setStep(3);
  };

  // ステップ3→4: 日時・コースを選択
  const handleSelectDateTime = () => {
    if (!selectedCourse) {
      alert('コースを選択してください');
      return;
    }
    if (!selectedDate || !selectedTime) {
      alert('日時を選択してください');
      return;
    }
    setStep(4);
  };

  // ステップ4: 予約確定
  const handleConfirmBooking = async () => {
    if (!selectedSite || !selectedTherapist || !selectedCourse) {
      alert('必須項目が選択されていません');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('ログインしてください');
        navigate('/auth/login/user');
        return;
      }

      const scheduledAt = `${selectedDate}T${selectedTime}:00`;
      const totalPrice = selectedCourse.base_price + selectedOptions.reduce((sum, optId) => {
        const opt = options.find(o => o.id === optId);
        return sum + (opt?.base_price || 0);
      }, 0);

      const payload = {
        therapist_id: selectedTherapist.id,
        site_id: selectedSite.id,
        type: 'ONSITE',
        service_name: selectedCourse.name,
        duration: selectedCourse.duration,
        price: totalPrice,
        location: selectedSite.address,
        scheduled_at: scheduledAt,
        items: [
          {
            item_type: 'COURSE',
            item_id: selectedCourse.id,
            item_name: selectedCourse.name,
            price: selectedCourse.base_price
          },
          ...selectedOptions.map(optId => {
            const opt = options.find(o => o.id === optId)!;
            return {
              item_type: 'OPTION',
              item_id: opt.id,
              item_name: opt.name,
              price: opt.base_price
            };
          })
        ]
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '予約作成に失敗しました');
      }

      const data = await res.json();
      navigate(`/app/booking/${data.booking.id}?success=1`);
    } catch (e: any) {
      console.error('Booking failed:', e);
      setError(e.message || '予約の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 合計金額の計算
  const totalPrice = selectedCourse ? 
    selectedCourse.base_price + selectedOptions.reduce((sum, optId) => {
      const opt = options.find(o => o.id === optId);
      return sum + (opt?.base_price || 0);
    }, 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step > s ? <Check size={20} /> : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>施設選択</span>
            <span>セラピスト</span>
            <span>日時・コース</span>
            <span>確認</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* ステップ1: 施設選択 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="text-blue-600" />
              施設を選択
            </h2>
            <p className="text-gray-600 mb-6">施術を受ける施設を選択してください</p>
            
            {sites.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Loader2 className="animate-spin mx-auto mb-3" size={32} />
                施設一覧を読み込んでいます...
              </div>
            ) : (
              <div className="space-y-3">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    onClick={() => handleSelectSite(site)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{site.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{site.area} / {site.type}</p>
                        <p className="text-sm text-gray-500 mt-1">{site.address}</p>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ステップ2: セラピスト選択 */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="text-blue-600" />
                セラピストを選択
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                施設を変更
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
              <strong>選択中の施設:</strong> {selectedSite?.name}
            </div>

            {therapists.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Loader2 className="animate-spin mx-auto mb-3" size={32} />
                セラピスト一覧を読み込んでいます...
              </div>
            ) : (
              <div className="space-y-3">
                {therapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    onClick={() => handleSelectTherapist(therapist)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{therapist.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <Star className="text-yellow-500 fill-current" size={16} />
                            <span className="ml-1 text-sm font-bold">{therapist.rating.toFixed(1)}</span>
                            <span className="ml-1 text-sm text-gray-500">({therapist.review_count}件)</span>
                          </div>
                          <span className="text-xs text-gray-500">経験{therapist.experience_years}年</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{therapist.specialties}</p>
                      </div>
                      <ChevronRight className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ステップ3: 日時・コース選択 */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="text-blue-600" />
                日時・コースを選択
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                セラピストを変更
              </button>
            </div>

            <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <div><strong>施設:</strong> {selectedSite?.name}</div>
              <div><strong>セラピスト:</strong> {selectedTherapist?.name}</div>
            </div>

            {/* 日時選択 */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">日時を選択</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">日付</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">時刻</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {Array.from({ length: 12 }, (_, i) => i + 9).map(h => (
                      <React.Fragment key={h}>
                        <option value={`${h}:00`}>{h}:00</option>
                        <option value={`${h}:30`}>{h}:30</option>
                      </React.Fragment>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* コース選択 */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">コースを選択</h3>
              <div className="space-y-2">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCourse?.id === course.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="course"
                      value={course.id}
                      checked={selectedCourse?.id === course.id}
                      onChange={() => setSelectedCourse(course)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold">{course.name}</div>
                        <div className="text-lg font-bold text-blue-600">¥{course.base_price.toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {course.duration}分
                        </span>
                        <span>{course.description}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* オプション選択 */}
            {options.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3">オプション（複数選択可）</h3>
                <div className="space-y-2">
                  {options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedOptions.includes(option.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={option.id}
                        checked={selectedOptions.includes(option.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOptions([...selectedOptions, option.id]);
                          } else {
                            setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold">{option.name}</div>
                          <div className="font-bold text-blue-600">+¥{option.base_price.toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {option.duration > 0 && `+${option.duration}分 / `}
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSelectDateTime}
              disabled={!selectedCourse || !selectedDate || !selectedTime}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              確認画面へ
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ステップ4: 確認 */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="text-blue-600" />
                予約内容の確認
              </h2>
              <button
                onClick={() => setStep(3)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                修正する
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">施設</h3>
                <p>{selectedSite?.name}</p>
                <p className="text-sm text-gray-600">{selectedSite?.address}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">セラピスト</h3>
                <p>{selectedTherapist?.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="text-yellow-500 fill-current" size={14} />
                  {selectedTherapist?.rating.toFixed(1)} ({selectedTherapist?.review_count}件)
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">日時</h3>
                <p>{selectedDate} {selectedTime}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">コース</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{selectedCourse?.name}</p>
                    <p className="text-sm text-gray-600">{selectedCourse?.duration}分</p>
                  </div>
                  <p className="font-bold text-blue-600">¥{selectedCourse?.base_price.toLocaleString()}</p>
                </div>
              </div>

              {selectedOptions.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-2">オプション</h3>
                  {selectedOptions.map(optId => {
                    const opt = options.find(o => o.id === optId)!;
                    return (
                      <div key={opt.id} className="flex justify-between items-center mb-1">
                        <p>{opt.name}</p>
                        <p className="font-bold text-blue-600">+¥{opt.base_price.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">合計金額</h3>
                  <p className="text-2xl font-bold text-blue-600">¥{totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  予約処理中...
                </>
              ) : (
                <>
                  <Check size={20} />
                  この内容で予約を確定する
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              予約確定後、セラピストに通知が送信されます
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingNewFlow;
