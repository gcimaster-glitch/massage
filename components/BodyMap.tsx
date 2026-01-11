
import React from 'react';

interface BodyPart {
  id: string;
  name: string;
  cx: number;
  cy: number;
  r: number;
}

const PARTS: BodyPart[] = [
  { id: 'head', name: '頭', cx: 100, cy: 30, r: 15 },
  { id: 'neck', name: '首', cx: 100, cy: 55, r: 8 },
  { id: 'shoulder_l', name: '左肩', cx: 75, cy: 70, r: 10 },
  { id: 'shoulder_r', name: '右肩', cx: 125, cy: 70, r: 10 },
  { id: 'back_upper', name: '背中上部', cx: 100, cy: 90, r: 15 },
  { id: 'back_lower', name: '腰', cx: 100, cy: 130, r: 15 },
  { id: 'arm_l', name: '左腕', cx: 55, cy: 100, r: 8 },
  { id: 'arm_r', name: '右腕', cx: 145, cy: 100, r: 8 },
  { id: 'hip', name: 'お尻', cx: 100, cy: 160, r: 15 },
  { id: 'leg_l', name: '左脚', cx: 80, cy: 220, r: 15 },
  { id: 'leg_r', name: '右脚', cx: 120, cy: 220, r: 15 },
];

interface BodyMapProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  readonly?: boolean;
}

const BodyMap: React.FC<BodyMapProps> = ({ selectedIds, onToggle, readonly = false }) => {
  return (
    <div className="relative w-full max-w-[240px] mx-auto bg-white rounded-3xl p-6 border border-gray-100 shadow-inner">
      <svg viewBox="0 0 200 320" className="w-full h-full drop-shadow-sm">
        {/* Silhouette background */}
        <path 
          d="M100 15 C120 15 130 30 130 45 C130 60 120 65 115 70 L145 75 C160 80 165 100 160 140 L150 140 L155 160 L140 300 L110 300 L105 180 L95 180 L90 300 L60 300 L45 160 L50 140 L40 140 C35 100 40 80 55 75 L85 70 C80 65 70 60 70 45 C70 30 80 15 100 15 Z" 
          fill="#f1f5f9"
        />
        
        {PARTS.map(part => {
          const isSelected = selectedIds.includes(part.id);
          return (
            <g 
              key={part.id} 
              className={`${readonly ? '' : 'cursor-pointer'} transition-all`}
              onClick={() => !readonly && onToggle(part.id)}
            >
              <circle 
                cx={part.cx} 
                cy={part.cy} 
                r={part.r} 
                className={`transition-all duration-500 ${isSelected ? 'fill-teal-500 shadow-lg' : 'fill-gray-200 hover:fill-gray-300'}`}
                fillOpacity={isSelected ? 0.8 : 0.4}
              />
              {isSelected && (
                <circle 
                  cx={part.cx} 
                  cy={part.cy} 
                  r={part.r + 4} 
                  className="fill-teal-500 animate-ping opacity-20"
                />
              )}
            </g>
          );
        })}
      </svg>
      
      {!readonly && (
        <div className="mt-4 text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Tap to Mark Tension Points</p>
        </div>
      )}
    </div>
  );
};

export default BodyMap;
