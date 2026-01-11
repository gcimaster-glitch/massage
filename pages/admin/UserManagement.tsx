
import React, { useState } from 'react';
// Added Heart and ShieldCheck to the import list to fix missing component errors
import { Search, UserPlus, Filter, Shield, Building, UserCheck, MoreVertical, Check, X, ShieldAlert, Award, Edit2, Heart, ShieldCheck } from 'lucide-react';
import { Role, User } from '../../types';

const AdminUserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Role | 'PENDING'>(Role.THERAPIST);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Mock Users
  const [users, setUsers] = useState<User[]>([
    { id: 'u1', role: Role.USER, displayName: '山田 花子', email: 'user1@example.jp', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: '2025-01-01' },
    { id: 't1', role: Role.THERAPIST, displayName: '田中 有紀', email: 't1@example.jp', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: '2025-01-02' },
    { id: 'h1', role: Role.HOST, displayName: 'ホテルグランド支配人', email: 'h1@example.jp', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: '2025-01-05' },
    { id: 's1', role: Role.SUB_ADMIN, displayName: '佐藤 サポート', email: 's1@example.jp', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: '2025-02-10' },
    { id: 'a1', role: Role.AFFILIATE, displayName: 'ウェルネスメディア', email: 'aff@media.jp', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: '2025-03-01' },
    { id: 'req1', role: Role.THERAPIST, displayName: '新井 ケン', email: 'req1@example.jp', status: 'PENDING', kycStatus: 'PENDING', createdAt: '2025-05-20' },
  ]);

  const filteredUsers = users.filter(u => {
    if (activeTab === 'PENDING') return u.status === 'PENDING';
    return u.role === activeTab && u.status === 'ACTIVE';
  });

  const handleChangeRole = (userId: string, newRole: Role) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setEditingUserId(null);
    alert(`${userId} の権限を ${newRole} に変更しました。`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
           <span className="inline-block bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4 border border-indigo-100 shadow-sm">権限・アイデンティティ管理</span>
           <h1 className="text-4xl font-black tracking-tighter">ユーザー & 権限ガバナンス</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-1 text-[10px]">RBAC (Role Based Access Control) Console</p>
        </div>
        <button className="bg-gray-900 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-teal-600 transition-all">
          <UserPlus size={18} /> パートナー手動追加
        </button>
      </div>

      <div className="flex bg-white rounded-3xl shadow-sm border border-gray-100 p-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'PENDING', label: '承認待ち', icon: ShieldAlert, color: 'text-red-600' },
          { id: Role.THERAPIST, label: 'セラピスト', icon: Award, color: 'text-teal-600' },
          { id: Role.HOST, label: 'ホスト', icon: Building, color: 'text-orange-600' },
          { id: Role.AFFILIATE, label: '紹介者', icon: Heart, color: 'text-purple-600' },
          { id: Role.SUB_ADMIN, label: 'サブ管理者', icon: Shield, color: 'text-indigo-600' },
          { id: Role.USER, label: '一般顧客', icon: UserCheck, color: 'text-slate-600' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-gray-900 text-white shadow-xl scale-105' : 'text-gray-400 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex gap-6">
           <div className="relative flex-1">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
             <input type="text" placeholder="氏名、メールアドレス、IDで検索..." className="w-full pl-16 pr-6 py-4 bg-white border border-gray-200 rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-teal-500/10" />
           </div>
           <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-teal-600 transition-all shadow-sm"><Filter size={20} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
               <tr>
                 <th className="p-8">アイデンティティ</th>
                 <th className="p-8">現在のロール</th>
                 <th className="p-8">KYC</th>
                 <th className="p-8">登録日</th>
                 <th className="p-8 text-center">操作</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {filteredUsers.map(u => (
                 <tr key={u.id} className="hover:bg-gray-50/50 transition-all">
                   <td className="p-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400 shadow-inner">
                          {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover rounded-2xl" /> : u.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-base">{u.displayName}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{u.email}</p>
                        </div>
                     </div>
                   </td>
                   <td className="p-8">
                      {editingUserId === u.id ? (
                        <select 
                          className="bg-white border-2 border-teal-500 rounded-xl px-4 py-2 font-black text-xs outline-none"
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}
                          autoFocus
                          onBlur={() => setEditingUserId(null)}
                        >
                          {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <button 
                          onClick={() => setEditingUserId(u.id)}
                          className="flex items-center gap-2 group"
                        >
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 bg-white group-hover:bg-teal-50 group-hover:border-teal-200 group-hover:text-teal-700 transition-all`}>
                             {u.role}
                          </span>
                          <Edit2 size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                   </td>
                   <td className="p-8">
                      <span className={`flex items-center gap-1 text-[10px] font-black ${u.kycStatus === 'VERIFIED' ? 'text-teal-600' : 'text-orange-500'}`}>
                         {u.kycStatus === 'VERIFIED' ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                         {u.kycStatus === 'VERIFIED' ? '認証済み' : '未完了'}
                      </span>
                   </td>
                   <td className="p-8 text-gray-400 font-mono text-xs">{u.createdAt}</td>
                   <td className="p-8 text-center">
                      <button className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md transition-all flex items-center justify-center text-gray-300 hover:text-gray-900 mx-auto">
                        <MoreVertical size={18} />
                      </button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
