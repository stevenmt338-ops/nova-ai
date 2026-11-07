import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Mic,
  Search,
  Code2,
  Users,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Compass,
} from 'lucide-react';
import { ViewMode, ChatModel } from '../types';
import { NovaLogo } from '../components/NovaLogo';

interface HomeViewProps {
  onSelectView: (view: ViewMode) => void;
  onQuickPrompt: (prompt: string, targetView?: ViewMode) => void;
  selectedModel: ChatModel;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectView,
  onQuickPrompt,
  selectedModel,
}) => {
  const [inputVal, setInputVal] = useState('');

  const quickShortcuts = [
    {
      id: 'chat',
      title: 'اسأل NOVA',
      desc: 'محادثة ذكية وتحليل عميق',
      icon: MessageSquare,
      color: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-[#7652D6]',
      view: 'chat' as ViewMode,
    },
    {
      id: 'imagine',
      title: 'أنشئ صورة',
      desc: 'استوديو الصور التوليدي الفائق',
      icon: ImageIcon,
      color: 'from-fuchsia-500/10 to-pink-500/10 border-fuchsia-200 text-fuchsia-600',
      view: 'imagine' as ViewMode,
    },
    {
      id: 'motion',
      title: 'أخرج فيديو',
      desc: 'إخراج سيناريو ومسارات الحركة',
      icon: Video,
      color: 'from-violet-500/10 to-purple-500/10 border-violet-200 text-violet-600',
      view: 'motion' as ViewMode,
    },
    {
      id: 'voice',
      title: 'أدوات الصوت',
      desc: 'تفريغ وتلخيص ونطق احترافي',
      icon: Mic,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-600',
      view: 'voice' as ViewMode,
    },
    {
      id: 'search',
      title: 'بحث عميق',
      desc: 'استقصاء الويب بمصادر حقيقية',
      icon: Search,
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 text-blue-600',
      view: 'search' as ViewMode,
    },
    {
      id: 'studio',
      title: 'ابنِ تطبيقاً',
      desc: 'كتابة الأكواد ومعاينة فورية',
      icon: Code2,
      color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-600',
      view: 'studio' as ViewMode,
    },
    {
      id: 'team',
      title: 'فريق الوكلاء',
      desc: '6 وكلاء يتعاونون لإنجاز مهامك',
      icon: Users,
      color: 'from-rose-500/10 to-pink-500/10 border-rose-200 text-rose-600',
      view: 'team' as ViewMode,
    },
    {
      id: 'canvas',
      title: 'مساحة العمل',
      desc: 'لوحة تفاعلية لربط الأفكار',
      icon: Sparkles,
      color: 'from-indigo-500/10 to-purple-500/10 border-indigo-200 text-indigo-600',
      view: 'canvas' as ViewMode,
    },
  ];

  const suggestedPrompts = [
    'حلّل لي أحدث اتجاهات الذكاء الاصطناعي في 2026 مع مصادر موثوقة',
    'أنشئ واجهة لوحة تحكم عصرية باللون البنفسجي وتعمل بالكامل',
    'صمم سيناريو فيديو سينمائي لإطلاق منتج تقني مبتكر في دقيقة',
    'قم بتوليد صورة لمدينة مستقبلية عائمة في الفضاء بتقنية ثلاثية الأبعاد',
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onQuickPrompt(inputVal, 'chat');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEE8FF] text-[#5635B5] text-xs font-bold border border-[#7652D6]/20 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#7652D6]" />
          <span>الجيل الجديد من الذكاء الاصطناعي المتكامل</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#201B2B] tracking-tight">
          أهلاً بك في <span className="text-[#7652D6]">NOVA AI</span>
        </h1>
        <p className="text-base sm:text-lg text-[#777181] font-medium max-w-2xl mx-auto">
          ذكاء واحد. إمكانيات بلا حدود. منصة موحدة تجمع التفكير الذكي، استوديوهات الوسائط، والبرمجة الحية.
        </p>
      </div>

      {/* Main Unified Input Box */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#E9E6F0] transition-all focus-within:border-[#7652D6] focus-within:ring-4 focus-within:ring-[#7652D6]/10">
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit(e);
              }
            }}
            placeholder="ما الذي تريد أن تنجزه اليوم؟ اكتب سؤالاً، فكرة، أو طلباً برمجياً..."
            rows={3}
            className="w-full resize-none border-0 bg-transparent text-[#201B2B] placeholder:text-[#777181]/80 text-sm sm:text-base focus:outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E9E6F0]/60">
            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 text-xs text-[#777181]">
              <span className="hidden sm:inline font-medium">النموذج النشط:</span>
              <span className="font-bold text-[#5635B5] bg-[#EEE8FF] px-2 py-0.5 rounded-lg border border-[#7652D6]/15">
                {selectedModel}
              </span>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-sm shadow-[0_4px_14px_rgba(118,82,214,0.35)] hover:shadow-[0_6px_20px_rgba(118,82,214,0.45)] hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <span>بدء الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Prompts Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#777181] block">اقتراحات سريعة للبدء:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onQuickPrompt(p, 'chat')}
              className="text-right p-3 rounded-2xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] hover:bg-[#FAF9FF] text-xs font-medium text-[#201B2B] transition-all flex items-center justify-between group shadow-2xs"
            >
              <span className="truncate">{p}</span>
              <ArrowLeft className="w-3.5 h-3.5 text-[#777181] group-hover:text-[#7652D6] group-hover:-translate-x-1 transition-transform shrink-0 mr-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Capability Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#201B2B] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#7652D6]" />
            <span>استكشف وحدات واستوديوهات NOVA</span>
          </h2>
          <span className="text-xs text-[#777181]">8 استوديوهات مدمجة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {quickShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.view)}
                className="text-right p-4 rounded-2xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#201B2B] group-hover:text-[#7652D6] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#777181] mt-1 leading-snug line-clamp-2">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Highlights Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#EEE8FF] via-[#FAF9FF] to-white p-5 border border-[#7652D6]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#7652D6] text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#201B2B]">أمان وخصوصية بمستويات مؤسسية</h4>
            <p className="text-xs text-[#777181] mt-0.5">
              بياناتك وأسرارك معزولة في الخادم، ومفاتيح API لا تنكشف للمتصفح إطلاقاً.
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectView('status')}
          className="shrink-0 px-4 py-2 rounded-xl bg-white border border-[#E9E6F0] text-xs font-bold text-[#5635B5] hover:bg-[#FAF9FF] shadow-xs"
        >
          فحص حالة المزودين
        </button>
      </div>
    </div>
  );
};
