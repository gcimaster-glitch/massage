import React, { useState } from 'react';
import { MapPin, Car, Bike, Footprints, Clock, Home, Building2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

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
    <SimpleLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-teal-600" />
            出張設定
          </h1>
          <p className="text-sm text-gray-600 mt-1">出張範囲と対応時間を設定します</p>
        </div>

        {/* メッセージ */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 mb-6">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-800 font-medium">{message}</span>
          </div>
        )}

        {/* 2段組レイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：設定フォーム（2/3幅） */}
          <div className="lg:col-span-2 space-y-6">
            {/* 出張可否 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">出張対応</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.outcall_available}
                  onChange={(e) => setSettings({ ...settings, outcall_available: e.target.checked })}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
                <span className="font-medium text-gray-900">出張対応を受け付ける</span>
              </label>
            </div>

            {settings.outcall_available && (
              <>
                {/* 起点となる場所 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Home size={20} className="text-teal-600" />
                    出張の起点となる場所
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                    <input
                      type="text"
                      value={settings.base_location}
                      onChange={(e) => setSettings({ ...settings, base_location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="東京都渋谷区道玄坂1-2-3"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      ※正確な住所は非公開です。出張範囲の計算にのみ使用されます。
                    </p>
                  </div>
                </div>

                {/* 移動方法 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">移動方法と対応範囲</h2>
                  <div className="space-y-4">
                    {/* 徒歩 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
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
                        <span className="font-medium text-gray-900">徒歩</span>
                      </label>
                      {settings.travel_methods.walk.enabled && (
                        <div className="mt-3 ml-8">
                          <label className="block text-sm font-medium text-gray-700 mb-2">対応範囲</label>
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
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                      <label className="flex items-center gap-3 cursor-pointer">
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
                        <span className="font-medium text-gray-900">自転車</span>
                      </label>
                      {settings.travel_methods.bicycle.enabled && (
                        <div className="mt-3 ml-8">
                          <label className="block text-sm font-medium text-gray-700 mb-2">対応範囲</label>
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
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                      <label className="flex items-center gap-3 cursor-pointer">
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
                        <span className="font-medium text-gray-900">自動車</span>
                      </label>
                      {settings.travel_methods.car.enabled && (
                        <div className="mt-3 ml-8">
                          <label className="block text-sm font-medium text-gray-700 mb-2">対応範囲</label>
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
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-teal-600" />
                    対応可能時間（出張）
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">開始時刻</label>
                      <input
                        type="time"
                        value={settings.outcall_hours.start}
                        onChange={(e) => setSettings({
                          ...settings,
                          outcall_hours: { ...settings.outcall_hours, start: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">終了時刻</label>
                      <input
                        type="time"
                        value={settings.outcall_hours.end}
                        onChange={(e) => setSettings({
                          ...settings,
                          outcall_hours: { ...settings.outcall_hours, end: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 店舗対応 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-teal-600" />
                店舗対応
              </h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.incall_available}
                  onChange={(e) => setSettings({ ...settings, incall_available: e.target.checked })}
                  className="w-5 h-5 text-teal-600 rounded"
                />
                <span className="font-medium text-gray-900">店舗での施術も対応する</span>
              </label>

              {settings.incall_available && (
                <div className="mt-4 ml-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">開始時刻</label>
                      <input
                        type="time"
                        value={settings.incall_hours.start}
                        onChange={(e) => setSettings({
                          ...settings,
                          incall_hours: { ...settings.incall_hours, start: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">終了時刻</label>
                      <input
                        type="time"
                        value={settings.incall_hours.end}
                        onChange={(e) => setSettings({
                          ...settings,
                          incall_hours: { ...settings.incall_hours, end: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 保存ボタン */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Save size={20} />
                設定を保存
              </button>
            </div>
          </div>

          {/* 右側：設定サマリー（1/3幅） */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">現在の設定</h3>
              
              {/* 出張対応 */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">出張対応</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">
                  {settings.outcall_available ? (
                    <span className="text-green-600 font-medium">対応可能</span>
                  ) : (
                    <span className="text-gray-500">対応不可</span>
                  )}
                </p>
              </div>

              {settings.outcall_available && (
                <>
                  {/* 起点住所 */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Home size={16} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-700">起点</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-6 break-words">
                      {settings.base_location}
                    </p>
                  </div>

                  {/* 移動方法 */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Car size={16} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-700">移動方法</span>
                    </div>
                    <div className="ml-6 space-y-2">
                      {settings.travel_methods.walk.enabled && (
                        <div className="flex items-center gap-2 text-xs text-gray-900">
                          <Footprints size={14} />
                          <span>徒歩: {settings.travel_methods.walk.max_distance}km</span>
                        </div>
                      )}
                      {settings.travel_methods.bicycle.enabled && (
                        <div className="flex items-center gap-2 text-xs text-gray-900">
                          <Bike size={14} />
                          <span>自転車: {settings.travel_methods.bicycle.max_distance}km</span>
                        </div>
                      )}
                      {settings.travel_methods.car.enabled && (
                        <div className="flex items-center gap-2 text-xs text-gray-900">
                          <Car size={14} />
                          <span>自動車: {settings.travel_methods.car.max_distance}km</span>
                        </div>
                      )}
                      {!settings.travel_methods.walk.enabled && 
                       !settings.travel_methods.bicycle.enabled && 
                       !settings.travel_methods.car.enabled && (
                        <p className="text-xs text-gray-500">未設定</p>
                      )}
                    </div>
                  </div>

                  {/* 出張時間 */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-700">出張時間</span>
                    </div>
                    <p className="text-xs text-gray-900 ml-6">
                      {settings.outcall_hours.start} 〜 {settings.outcall_hours.end}
                    </p>
                  </div>
                </>
              )}

              {/* 店舗対応 */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">店舗対応</span>
                </div>
                {settings.incall_available ? (
                  <div className="ml-6">
                    <p className="text-xs text-green-600 font-medium mb-1">対応可能</p>
                    <p className="text-xs text-gray-900">
                      {settings.incall_hours.start} 〜 {settings.incall_hours.end}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 ml-6">対応不可</p>
                )}
              </div>

              {/* 注意事項 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    設定内容は即時反映されますが、既存の予約には影響しません。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default TherapistTravelSettings;
