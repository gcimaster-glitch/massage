import React, { useState } from 'react';
import { MapPin, Car, Bike, Footprints, Clock, Home, Building2, Save, AlertCircle } from 'lucide-react';

interface TravelSettings {
  outcall_available: boolean;
  base_location: string;
  base_lat: number;
  base_lng: number;
  travel_methods: {
    walk: { enabled: boolean; max_distance: number };
    bicycle: { enabled: boolean; max_distance: number };
    car: { enabled: boolean; max_distance: number };
  };
  outcall_hours: { start: string; end: string };
  incall_hours: { start: string; end: string };
  incall_available: boolean;
}

const TherapistTravelSettings: React.FC = () => {
  const [settings, setSettings] = useState<TravelSettings>({
    outcall_available: true,
    base_location: '東京都渋谷区道玄坂1-2-3',
    base_lat: 35.6581,
    base_lng: 139.6976,
    travel_methods: {
      walk: { enabled: true, max_distance: 2 },
      bicycle: { enabled: true, max_distance: 5 },
      car: { enabled: false, max_distance: 10 }
    },
    outcall_hours: { start: '09:00', end: '21:00' },
    incall_hours: { start: '10:00', end: '20:00' },
    incall_available: false
  });

  const [message, setMessage] = useState('');

  const handleSave = () => {
    setMessage('出張設定を保存しました');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">出張設定</h1>
        <p className="text-gray-600">出張範囲と対応時間を設定します</p>
      </div>

      {/* メッセージ */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-green-600" />
          <span className="text-green-800 font-bold">{message}</span>
        </div>
      )}

      {/* 出張可否 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">出張対応</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.outcall_available}
              onChange={(e) => setSettings({ ...settings, outcall_available: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded"
            />
            <span className="font-bold text-gray-900">出張対応を受け付ける</span>
          </label>
        </div>
      </div>

      {settings.outcall_available && (
        <>
          {/* 起点となる場所 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-teal-600" />
              出張の起点となる場所
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">住所</label>
                <input
                  type="text"
                  value={settings.base_location}
                  onChange={(e) => setSettings({ ...settings, base_location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="東京都渋谷区道玄坂1-2-3"
                />
                <p className="text-xs text-gray-500 mt-2">※正確な住所は非公開です。出張範囲の計算にのみ使用されます。</p>
              </div>
            </div>
          </div>

          {/* 移動方法 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">移動方法と対応範囲</h2>
            <div className="space-y-6">
              {/* 徒歩 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.travel_methods.walk.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        travel_methods: {
                          ...settings.travel_methods,
                          walk: { ...settings.travel_methods.walk, enabled: e.target.checked }
                        }
                      })}
                      className="w-5 h-5 text-teal-600 rounded"
                    />
                    <Footprints size={20} className="text-gray-600" />
                    <span className="font-bold text-gray-900">徒歩</span>
                  </div>
                </label>
                {settings.travel_methods.walk.enabled && (
                  <div className="ml-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2">対応範囲</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.travel_methods.walk.max_distance}
                        onChange={(e) => setSettings({
                          ...settings,
                          travel_methods: {
                            ...settings.travel_methods,
                            walk: { ...settings.travel_methods.walk, max_distance: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                        min="0.5"
                        max="5"
                        step="0.5"
                      />
                      <span className="text-sm text-gray-600">km以内</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 自転車 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.travel_methods.bicycle.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        travel_methods: {
                          ...settings.travel_methods,
                          bicycle: { ...settings.travel_methods.bicycle, enabled: e.target.checked }
                        }
                      })}
                      className="w-5 h-5 text-teal-600 rounded"
                    />
                    <Bike size={20} className="text-gray-600" />
                    <span className="font-bold text-gray-900">自転車</span>
                  </div>
                </label>
                {settings.travel_methods.bicycle.enabled && (
                  <div className="ml-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2">対応範囲</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.travel_methods.bicycle.max_distance}
                        onChange={(e) => setSettings({
                          ...settings,
                          travel_methods: {
                            ...settings.travel_methods,
                            bicycle: { ...settings.travel_methods.bicycle, max_distance: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                        min="1"
                        max="10"
                        step="1"
                      />
                      <span className="text-sm text-gray-600">km以内</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 自動車 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.travel_methods.car.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        travel_methods: {
                          ...settings.travel_methods,
                          car: { ...settings.travel_methods.car, enabled: e.target.checked }
                        }
                      })}
                      className="w-5 h-5 text-teal-600 rounded"
                    />
                    <Car size={20} className="text-gray-600" />
                    <span className="font-bold text-gray-900">自動車</span>
                  </div>
                </label>
                {settings.travel_methods.car.enabled && (
                  <div className="ml-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2">対応範囲</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.travel_methods.car.max_distance}
                        onChange={(e) => setSettings({
                          ...settings,
                          travel_methods: {
                            ...settings.travel_methods,
                            car: { ...settings.travel_methods.car, max_distance: parseFloat(e.target.value) }
                          }
                        })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                        min="5"
                        max="30"
                        step="5"
                      />
                      <span className="text-sm text-gray-600">km以内</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 対応可能時間（出張） */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-teal-600" />
              対応可能時間（出張）
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">開始時刻</label>
                <input
                  type="time"
                  value={settings.outcall_hours.start}
                  onChange={(e) => setSettings({
                    ...settings,
                    outcall_hours: { ...settings.outcall_hours, start: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">終了時刻</label>
                <input
                  type="time"
                  value={settings.outcall_hours.end}
                  onChange={(e) => setSettings({
                    ...settings,
                    outcall_hours: { ...settings.outcall_hours, end: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 店舗対応 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-teal-600" />
          店舗対応
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.incall_available}
              onChange={(e) => setSettings({ ...settings, incall_available: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded"
            />
            <span className="font-bold text-gray-900">店舗での施術も対応する</span>
          </label>

          {settings.incall_available && (
            <div className="mt-4 ml-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">開始時刻</label>
                  <input
                    type="time"
                    value={settings.incall_hours.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      incall_hours: { ...settings.incall_hours, start: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">終了時刻</label>
                  <input
                    type="time"
                    value={settings.incall_hours.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      incall_hours: { ...settings.incall_hours, end: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2"
        >
          <Save size={20} />
          設定を保存
        </button>
      </div>
    </div>
  );
};

export default TherapistTravelSettings;
