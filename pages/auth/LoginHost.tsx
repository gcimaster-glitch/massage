import React from 'react';
import { Role } from '../../types';
import UnifiedLogin from '../../src/components/UnifiedLogin';
import { Building2, MapPin, JapaneseYen } from 'lucide-react';

interface LoginHostProps {
  onLogin: (role: Role, name?: string) => void;
}

const LoginHost: React.FC<LoginHostProps> = ({ onLogin }) => {
  return (
    <UnifiedLogin
      role={Role.HOST}
      title="施設管理者ログイン"
      subtitle="施設運営をスマートに"
      icon={<Building2 size={40} className="text-white" />}
      onLogin={onLogin}
      redirectPath="/h"
      features={[
        { icon: <MapPin size={20} className="text-teal-600" />, label: '施設管理' },
        { icon: <JapaneseYen size={20} className="text-teal-600" />, label: '収益確認' },
        { icon: <Building2 size={20} className="text-teal-600" />, label: '運営管理' },
      ]}
    />
  );
};

export default LoginHost;
