
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_BOOKINGS } from '../../constants';
import { Star, ThumbsUp, AlertTriangle, CheckCircle, ArrowRight, Share2, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { analyzeReviewAndGenerateResponse } from '../../services/aiService';

const BookingReview: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
  
  // State for Review Form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSafe, setIsSafe] = useState<boolean | null>(null);

  // State for Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);

  // Pre-fill for 'b-101' as requested for testing/demonstration
  useEffect(() => {
    if (bookingId === 'b-101') {
      setRating(5);
      setComment('Excellent service!');
      setIsSafe(true);
      setTags(['とてもリラックスできた', '技術が高い']);
    }
  }, [bookingId]);

  if (!booking) return <div className="p-20 text-center font-black">予約が見つかりません</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSafe === false) {
      alert("安全上の懸念が報告されました。サポートチームが内容を確認します。");
      navigate('/app/bookings');
      return;
    }

    setIsSubmitting(true);
    try {
      // Analyze review and get a therapist response using Gemini
      const result = await analyzeReviewAndGenerateResponse(booking.therapistName, rating, comment);
      setAiReply(result.reply);
      setIsSuccess(true);
    } catch (error) {
      console.error("Review Analysis Error:", error);
      alert("送信中にエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-12 pb-32 pt-10 animate-fade-in">
        <div className="bg-white p-12 rounded-[64px] shadow-2xl border border-gray-100 text-center space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
           
           <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner ring-8 ring-teal-50/30 animate-[scale-in_0.5s_ease-out]">
              <CheckCircle size={56} />
           </div>

           <div className="space-y-4">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">レビューの送信が完了しました</h1>
              <p className="text-gray-500 font-bold">ご協力ありがとうございました。{booking.therapistName}さんにフィードバックを共有しました。</p>
           </div>

           {aiReply && (
             <div className="bg-gray-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden text-left animate-fade-in-up">
                <div className="absolute top-0 right-0 p-6 opacity-10"><Sparkles size={100} /></div>
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {booking.therapistName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm">{booking.therapistName} さんからの返信</p>
                        <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">AI Concierge Auto-Draft</p>
                      </div>
                   </div>
                   <p className="text-sm font-bold leading-relaxed italic opacity-90">"{aiReply}"</p>
                </div>
             </div>
           )}

           <div className="flex flex-col md:flex-row gap-4 pt-6">
              <button 
                onClick={() => navigate('/app/bookings')}
                className="flex-1 bg-gray-900 text-white py-5 rounded-[28px] font-black text-sm hover:bg-teal-600 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
              >
                予約一覧へ戻る <ArrowRight size={18} />
              </button>
              <button className="flex-1 bg-gray-50 text-gray-500 py-5 rounded-[28px] font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-200">
                <Share2 size={18} /> コミュニティに共有
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32 animate-fade-in">
      <div className="text-center space-y-4 pt-6">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">施術はいかがでしたか？</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          Reviewing: {booking.serviceName} by {booking.therapistName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Safety Check Card */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center"><AlertTriangle size={24} /></div>
            <h3 className="text-xl font-black text-gray-900">安全性の確認</h3>
          </div>
          <p className="text-sm font-bold text-gray-500 leading-relaxed">
            施術中に不安な点や、規約違反（直接取引の勧誘、連絡先の交換要求など）はありませんでしたか？
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIsSafe(true)}
              className={`py-5 rounded-3xl border-2 font-black transition-all flex items-center justify-center gap-2 ${
                isSafe === true ? 'bg-teal-600 border-teal-600 text-white shadow-xl scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-teal-500'
              }`}
            >
              {isSafe === true && <CheckCircle size={18} />} 問題なし
            </button>
            <button
              type="button"
              onClick={() => setIsSafe(false)}
              className={`py-5 rounded-3xl border-2 font-black transition-all flex items-center justify-center gap-2 ${
                isSafe === false ? 'bg-red-600 border-red-600 text-white shadow-xl scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-red-500'
              }`}
            >
              {isSafe === false && <AlertTriangle size={18} />} 問題があった
            </button>
          </div>
        </div>

        {isSafe === false && (
           <div className="bg-red-50 p-8 rounded-[40px] border-2 border-red-100 animate-fade-in-up">
              <p className="font-black text-red-900 mb-4 flex items-center gap-2"><ShieldAlert size={18} /> 状況の詳細をご記入ください</p>
              <textarea 
                className="w-full p-6 rounded-[28px] border border-red-200 bg-white text-gray-900 font-bold text-sm focus:outline-none focus:border-red-500 shadow-inner h-32"
                placeholder="運営スタッフのみが閲覧し、適切に対応いたします。"
              ></textarea>
           </div>
        )}

        {/* Rating and Tags Card */}
        <div className="bg-white p-12 rounded-[56px] shadow-sm border border-gray-100 text-center space-y-10">
          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Satisfaction Rating</h3>
             <div className="flex justify-center gap-4">
               {[1, 2, 3, 4, 5].map((star) => (
                 <button
                   key={star}
                   type="button"
                   onClick={() => setRating(star)}
                   className={`transition-all hover:scale-125 transform active:scale-90 ${rating >= star ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-100'}`}
                 >
                   <Star size={56} fill="currentColor" />
                 </button>
               ))}
             </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['とてもリラックスできた', '技術が高い', '丁寧な接客', '清潔感がある', '時間通り'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-6 py-3 rounded-2xl text-xs font-black border-2 transition-all ${
                  tags.includes(tag) ? 'bg-teal-500 text-white border-teal-500 shadow-lg' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="space-y-2 text-left">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2"><MessageSquare size={12} /> Feedback Comment</label>
             <textarea
               className="w-full p-8 bg-gray-50 rounded-[36px] border border-transparent focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-gray-900 font-bold placeholder:text-gray-300 placeholder:font-normal h-48 outline-none shadow-inner"
               placeholder="セラピストへの感謝の気持ちや感想をご記入ください..."
               value={comment}
               onChange={(e) => setComment(e.target.value)}
             ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={rating === 0 || isSafe === null || isSubmitting}
          className="w-full bg-gray-900 text-white py-7 rounded-[32px] font-black text-xl shadow-2xl hover:bg-teal-600 disabled:bg-gray-100 disabled:text-gray-300 transition-all flex items-center justify-center gap-4 active:scale-95 group relative overflow-hidden"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={28} /> : <ThumbsUp size={28} className="group-hover:scale-110 transition-transform" />}
          {isSubmitting ? 'AIが解析中...' : 'レビューを送信して完了'}
          {isSubmitting && <div className="absolute bottom-0 left-0 h-1 bg-teal-400 animate-[shimmer_1.5s_linear_infinite]" style={{width: '100%'}}></div>}
        </button>
      </form>
    </div>
  );
};

// Fix: Make className optional to resolve type error when the component is called without it (e.g., at line 81)
const ShieldAlert = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

export default BookingReview;
