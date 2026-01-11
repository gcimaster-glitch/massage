
import React from 'react';
import { Clock, Check, Ban, Sunrise, Sun, Moon } from 'lucide-react';

interface TimeSlotPickerProps {
  selectedTime: string;
  onSelect: (time: string) => void;
  availableSlots: string[];
  busySlots: string[];
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ selectedTime, onSelect, availableSlots, busySlots }) => {
  const allSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return <Sunrise size={18} className="opacity-50" />;
    if (hour < 18) return <Sun size={18} className="opacity-50" />;
    return <Moon size={18} className="opacity-50" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex overflow-x-auto pb-10 pt-4 gap-6 no-scrollbar -mx-4 px-4 snap-x">
        {allSlots.map(time => {
          const isAvailable = availableSlots.includes(time);
          const isBusy = busySlots.includes(time);
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              type="button"
              disabled={!isAvailable || isBusy}
              onClick={() => onSelect(time)}
              className={`
                min-w-[130px] flex-shrink-0 py-10 px-4 rounded-[48px] transition-all duration-500 snap-center border-4 flex flex-col items-center justify-center gap-4 relative
                ${isSelected 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] scale-110 -translate-y-2' 
                  : isBusy 
                    ? 'bg-gray-50 text-gray-200 border-transparent cursor-not-allowed grayscale'
                    : isAvailable
                      ? 'bg-white text-gray-900 border-gray-100 hover:border-teal-500 hover:shadow-2xl hover:-translate-y-1'
                      : 'bg-gray-50 text-gray-100 border-transparent cursor-not-allowed'
                }
              `}
            >
              <div className={`p-3 rounded-2xl transition-colors ${isSelected ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-50 text-gray-300'}`}>
                {getTimeIcon(time)}
              </div>
              
              <span className="text-2xl font-black tracking-tighter">{time}</span>
              
              <div className="h-6">
                {isSelected ? (
                  <div className="bg-teal-500 text-white rounded-full p-1.5 shadow-lg animate-fade-in"><Check size={14} strokeWidth={4} /></div>
                ) : isBusy ? (
                  <Ban size={16} className="text-gray-200" />
                ) : (
                  <div className={`w-2 h-2 rounded-full transition-all ${isAvailable ? 'bg-teal-500/40 group-hover:bg-teal-500' : 'bg-gray-100'}`}></div>
                )}
              </div>

              {isSelected && (
                <div className="absolute -bottom-2 bg-teal-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest whitespace-nowrap">
                   Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-10 px-8 py-6 bg-gray-50/50 rounded-[40px] border border-gray-100">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-200 shadow-sm"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-900 shadow-md"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Slot</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booked / Restricted</span>
         </div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;
