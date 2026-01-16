import React from 'react';
import { Role } from '../../types';
import UnifiedLogin from '../../src/components/UnifiedLogin';
import { Megaphone, TrendingUp, JapaneseYen } from 'lucide-react';

interface LoginAffiliateProps {
  onLogin: (role: Role, name?: string) => void;
}

const LoginAffiliate: React.FC<LoginAffiliateProps> = ({ onLogin }) => {
  return (
    <UnifiedLogin
      role={Role.AFFILIATE}
      title="アフィリエイトログイン"
      subtitle="成果報酬を確認"
      icon={<Megaphone size={40} className="text-white" />}
      onLogin={onLogin}
      redirectPath="/affiliate"
      features={[
        { icon: <TrendingUp size={20} className="text-teal-600" />, label: '成果レポート' },
        { icon: <JapaneseYen size={20} className="text-teal-600" />, label: '報酬明細' },
        { icon: <Megaphone size={20} className="text-teal-600" />, label: 'キャンペーン管理' },
      ]}
    />
  );
};

export default LoginAffiliate;
