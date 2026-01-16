import React from 'react';
import { Role } from '../../types';
import UnifiedLogin from '../../src/components/UnifiedLogin';
import { Briefcase, Calendar, JapaneseYen } from 'lucide-react';

interface LoginTherapistProps {
  onLogin: (role: Role, name?: string) => void;
}

const LoginTherapist: React.FC<LoginTherapistProps> = ({ onLogin }) => {
  return (
    <UnifiedLogin
      role={Role.THERAPIST}
      title="セラピストログイン"
      subtitle="プロフェッショナルとして輝く"
      icon={<Briefcase size={40} className="text-white" />}
      onLogin={onLogin}
      redirectPath="/t"
      features={[
        { icon: <Calendar size={20} className="text-teal-600" />, label: 'スケジュール管理' },
        { icon: <JapaneseYen size={20} className="text-teal-600" />, label: '報酬確認' },
        { icon: <Briefcase size={20} className="text-teal-600" />, label: 'プロフィール設定' },
      ]}
    />
  );
};

export default LoginTherapist;
