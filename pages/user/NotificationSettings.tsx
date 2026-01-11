import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, MessageSquare, ShieldAlert, Save, Smartphone } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    pushBooking: true,
    pushChat: true,
    pushPromo: false,
    emailBooking: true,
    emailPromo: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // API call would go here
    alert('通知設定を保存しました');
    navigate('/app/account');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">通知設定</h1>
      </div>

      <div className="space-y-6">
        {/* Push Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="text-teal-600" size={20} /> プッシュ通知
          </h3>
          <div className="space-y-4 divide-y divide-gray-100">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium text-gray-900">予約・ステータス</p>
                <p className="text-xs text-gray-500">予約確定、リマインダー、施術開始通知など</p>
              </div>
              <Switch checked={settings.pushBooking} onChange={() => toggle('pushBooking')} />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium text-gray-900">メッセージ</p>
                <p className="text-xs text-gray-500">セラピストや運営からのチャット通知</p>
              </div>
              <Switch checked={settings.pushChat} onChange={() => toggle('pushChat')} />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium text-gray-900">キャンペーン・お知らせ</p>
                <p className="text-xs text-gray-500">割引クーポンや新着ニュース</p>
              </div>
              <Switch checked={settings.pushPromo} onChange={() => toggle('pushPromo')} />
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="text-teal-600" size={20} /> メール通知
          </h3>
          <div className="space-y-4 divide-y divide-gray-100">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium text-gray-900">予約確認メール</p>
                <p className="text-xs text-gray-500">領収書や予約詳細の控え</p>
              </div>
              <Switch checked={settings.emailBooking} onChange={() => toggle('emailBooking')} />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium text-gray-900">ニュースレター</p>
                <p className="text-xs text-gray-500">おすすめ情報や定期通信</p>
              </div>
              <Switch checked={settings.emailPromo} onChange={() => toggle('emailPromo')} />
            </div>
          </div>
        </div>

        {/* Safety Alerts (Immutable) */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 opacity-80">
          <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <ShieldAlert size={20} /> 緊急・安全通知
          </h3>
          <p className="text-sm text-red-800 mb-3">
            重要なお知らせ、緊急時の安全確認、アカウントセキュリティに関する通知は、設定に関わらず送信されます。
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500">常にON</span>
            <div className="w-11 h-6 bg-red-200 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
               <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
        >
          <Save size={20} />
          設定を保存
        </button>
      </div>
    </div>
  );
};

// Simple Switch Component
const Switch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
  </label>
);

export default NotificationSettings;