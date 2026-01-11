
import React from 'react';
import { BookingStatus } from '../types';

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  // 色彩心理学に基づき、ビジネス判断を助ける色分けに再定義
  const styles = {
    [BookingStatus.DRAFT]: 'bg-slate-100 text-slate-600 border-slate-200',
    [BookingStatus.PENDING_PAYMENT]: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
    [BookingStatus.BOOKED]: 'bg-blue-50 text-blue-700 border-blue-200',
    [BookingStatus.CONFIRMED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [BookingStatus.WAITING_FOR_USER]: 'bg-indigo-600 text-white shadow-md',
    [BookingStatus.CHECKED_IN]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    [BookingStatus.IN_SERVICE]: 'bg-rose-600 text-white shadow-lg ring-4 ring-rose-100',
    [BookingStatus.CLEANING_REQUIRED]: 'bg-orange-50 text-orange-700 border-orange-200',
    [BookingStatus.COMPLETED]: 'bg-slate-800 text-white font-bold',
    [BookingStatus.CANCELLED]: 'bg-gray-100 text-gray-400 border-gray-200 line-through',
    [BookingStatus.DISPUTED]: 'bg-red-700 text-white font-black ring-4 ring-red-200 animate-bounce',
  };

  const labels = {
    [BookingStatus.DRAFT]: '下書き',
    [BookingStatus.PENDING_PAYMENT]: '決済待ち',
    [BookingStatus.BOOKED]: 'リクエスト中',
    [BookingStatus.CONFIRMED]: '予約確定',
    [BookingStatus.WAITING_FOR_USER]: '到着済・待機中',
    [BookingStatus.CHECKED_IN]: '入室/合流',
    [BookingStatus.IN_SERVICE]: '施術実施中',
    [BookingStatus.CLEANING_REQUIRED]: '要清掃/確認',
    [BookingStatus.COMPLETED]: '完了',
    [BookingStatus.CANCELLED]: 'キャンセル済',
    [BookingStatus.DISPUTED]: '緊急・トラブル',
  };

  return (
    <span className={`px-3 py-1 rounded-md text-[11px] font-black border flex items-center justify-center whitespace-nowrap tracking-tighter ${styles[status] || 'bg-gray-100 text-gray-900'}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === BookingStatus.IN_SERVICE ? 'bg-white' : 'hidden'}`}></div>
      {labels[status]}
    </span>
  );
};

export default StatusBadge;
