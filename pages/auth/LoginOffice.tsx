import React from 'react';
import { Role } from '../../types';
import UnifiedLogin from '../../src/components/UnifiedLogin';
import { Building, Users, JapaneseYen } from 'lucide-react';

interface LoginOfficeProps {
  onLogin: (role: Role, name?: string) => void;
}

const LoginOffice: React.FC<LoginOfficeProps> = ({ onLogin }) => {
  return (
    <UnifiedLogin
      role={Role.THERAPIST_OFFICE}
      title="セラピストオフィスログイン"
      subtitle="事務所運営を効率化"
      icon={<Building size={40} className="text-white" />}
      onLogin={onLogin}
      redirectPath="/o"
      features={[
        { icon: <Users size={20} className="text-teal-600" />, label: 'セラピスト管理' },
        { icon: <JapaneseYen size={20} className="text-teal-600" />, label: '収益管理' },
        { icon: <Building size={20} className="text-teal-600" />, label: '事務所設定' },
      ]}
    />
  );
};

export default LoginOffice;
