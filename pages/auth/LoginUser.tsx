import React from 'react';
import { Role } from '../../types';
import UnifiedLogin from '../../src/components/UnifiedLogin';
import { Heart, MapPin, Calendar } from 'lucide-react';

interface LoginUserProps {
  onLogin: (role: Role, name?: string) => void;
}

const LoginUser: React.FC<LoginUserProps> = ({ onLogin }) => {
  return (
    <UnifiedLogin
      role={Role.USER}
      title="ユーザーログイン"
      subtitle="あなたの「ほぐしたい」を叶える"
      icon={<Heart size={40} className="text-white" />}
      onLogin={onLogin}
      redirectPath="/app"
      features={[
        { icon: <MapPin size={20} className="text-teal-600" />, label: '近くの施設を検索' },
        { icon: <Calendar size={20} className="text-teal-600" />, label: 'かんたん予約' },
        { icon: <Heart size={20} className="text-teal-600" />, label: '健康管理' },
      ]}
    />
  );
};

export default LoginUser;
