import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Briefcase, Settings as SettingsIcon, DollarSign, Award, ChevronRight } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

const TherapistPersonalSettings: React.FC = () => {
  const navigate = useNavigate();

  const settingsMenu = [
    {
      id: 'profile',
      title: 'プロフィール',
      description: '氏名、自己紹介、プロフィール画像などの基本情報',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: '/t/profile'
    },
    {
      id: 'bank',
      title: '振込先設定',
      description: '報酬振込先の銀行口座情報',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      path: '/t/settings/bank'
    },
    {
      id: 'services',
      title: '対応可能メニュー',
      description: '提供できる施術メニューの設定',
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      path: '/t/settings/services'
    },
    {
      id: 'options',
      title: '対応可能オプション',
      description: '追加オプションサービスの設定',
      icon: SettingsIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      path: '/t/settings/options'
    },
    {
      id: 'pricing',
      title: '60分単価',
      description: '基本料金の設定',
      icon: DollarSign,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      path: '/t/settings/pricing'
    },
    {
      id: 'qualifications',
      title: '資格、スキル登録',
      description: '保有資格、スキル、専門分野の登録',
      icon: Award,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      path: '/t/settings/qualifications'
    }
  ];

  return (
    <SimpleLayout>
      <div className="max-w-5xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-teal-600" />
            個人設定
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            プロフィール、振込先、サービス内容、料金、資格などの設定
          </p>
        </div>

        {/* 設定メニューグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${item.bgColor} p-3 rounded-lg`}>
                    <Icon className={item.color} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {item.title}
                      </h3>
                      <ChevronRight className="text-gray-400 group-hover:text-teal-600 transition-colors" size={20} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">設定変更時の注意</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• プロフィール情報の変更は、審査が必要な場合があります</li>
            <li>• 振込先の変更は、翌月の支払いから適用されます</li>
            <li>• 料金変更は即時反映されますが、既存の予約には影響しません</li>
            <li>• 資格情報の変更は、証明書の提出が必要な場合があります</li>
          </ul>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default TherapistPersonalSettings;
