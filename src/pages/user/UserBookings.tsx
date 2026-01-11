import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_BOOKINGS } from '../../constants';
import StatusBadge from '../../components/StatusBadge';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { Booking, BookingType } from '../../types';

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/app/booking/${booking.id}`)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-teal-400 transition-colors cursor-pointer mb-4"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-xs font-bold px-2 py-1 rounded mr-2 ${booking.type === BookingType.ONSITE ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
            {booking.type === BookingType.ONSITE ? 'CUBE' : '出張'}
          </span>
          <span className="text-sm font-bold text-gray-500">#{booking.id.slice(-4)}</span>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      
      <h3 className="font-bold text-lg mb-1">{booking.serviceName}</h3>
      <p className="text-sm text-gray-600 mb-3">担当: {booking.therapistName}</p>
      
      <div className="space-y-1 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Clock size={14} />
          {new Date(booking.scheduledStart).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span className="truncate">{booking.location}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-sm">
        <span className="font-bold text-gray-900">¥{booking.price.toLocaleString()}</span>
        <div className="flex items-center text-teal-600 font-medium">
          詳細を見る <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};

const UserBookings: React.FC = () => {
  // Mock filter for current user
  const bookings = MOCK_BOOKINGS.filter(b => b.userId === 'u1');

  const upcomingBookings = bookings.filter(b => new Date(b.scheduledStart) > new Date());
  const pastBookings = bookings.filter(b => new Date(b.scheduledStart) <= new Date());

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">予約一覧</h1>
      
      <div>
        <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">これからの予約</h2>
        {upcomingBookings.length > 0 ? (
          upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)
        ) : (
          <p className="text-gray-400 text-sm p-4 bg-gray-50 rounded-lg text-center">予定されている予約はありません</p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">過去の履歴</h2>
        {pastBookings.length > 0 ? (
          pastBookings.map(b => <BookingCard key={b.id} booking={b} />)
        ) : (
           <p className="text-gray-400 text-sm p-4 bg-gray-50 rounded-lg text-center">履歴はありません</p>
        )}
      </div>
    </div>
  );
};

export default UserBookings;