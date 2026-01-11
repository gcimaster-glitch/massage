
import React from 'react';
import { ExternalLink, MapPin, Star, Shield } from 'lucide-react';

interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: { text: string }[];
    }[];
  };
  web?: {
    uri: string;
    title: string;
  };
}

interface GroundingListProps {
  chunks: GroundingChunk[] | undefined;
  title?: string;
}

const GroundingList: React.FC<GroundingListProps> = ({ chunks, title = "AIが提案する安全・周辺情報" }) => {
  if (!chunks || chunks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
         <Shield className="text-teal-600" size={16} />
         <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">{title}</h4>
      </div>
      <div className="grid gap-3">
        {chunks.map((chunk, idx) => {
          const item = chunk.maps || chunk.web;
          if (!item) return null;

          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="bg-teal-50 text-teal-600 p-1.5 rounded-lg">
                        {chunk.maps ? <MapPin size={14} /> : <ExternalLink size={14} />}
                     </span>
                     <h5 className="font-black text-gray-900 truncate text-sm">{item.title}</h5>
                  </div>
                  
                  {chunk.maps?.placeAnswerSources?.[0]?.reviewSnippets?.[0] && (
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic mb-3">
                      "{chunk.maps.placeAnswerSources[0].reviewSnippets[0].text}"
                    </p>
                  )}
                  
                  <a 
                    href={item.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-black text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    Google Mapsで詳細を確認 <ExternalLink size={12} />
                  </a>
                </div>
                {chunk.maps && (
                  <div className="flex items-center gap-0.5 text-yellow-500 font-black text-xs bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star size={10} fill="currentColor" /> 4.5+
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroundingList;
