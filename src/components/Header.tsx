import React from 'react';
import {
  Menu,
  Activity,
  Zap,
  Globe,
  SlidersHorizontal,
  Plus,
  HelpCircle,
  Shield,
  Cpu,
} from 'lucide-react';
import { ViewMode, ChatModel } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onOpenMobileMenu: () => void;
  selectedModel: ChatModel;
  onSelectModel: (m: ChatModel) => void;
  onNewChat: () => void;
  serverOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenMobileMenu,
  selectedModel,
  onSelectModel,
  onNewChat,
  serverOnline,
}) => {
  const viewTitles: Record<ViewMode, { title: string; subtitle: string }> = {
    home: { title: 'الرئيسية', subtitle: 'نظرة عامة على الإمكانيات والخدمات' },
    chat: { title: 'NOVA BRAIN', subtitle: 'محادثة متقدمة متعددة الوسائط' },
    imagine: { title: 'NOVA IMAGINE', subtitle: 'توليد وتعديل الصور الاحترافية' },
    motion: { title: 'NOVA MOTION', subtitle: 'استوديو السيناريو ومسار الفيديو' },
    voice: { title: 'NOVA VOICE', subtitle: 'التفريغ الصوتي وتوليد الأصوات' },
    search: { title: 'NOVA SEARCH', subtitle: 'بحث الويب الموثوق والبحث العميق' },
    team: { title: 'NOVA TEAM', subtitle: 'فريق الوكلاء الذكي المتكامل' },
    canvas: { title: 'NOVA CANVAS', subtitle: 'مساحة العمل اللانهائية والخرائط' },
    studio: { title: 'NOVA STUDIO', subtitle: 'إنشاء وتعديل الأكواد مع المعاينة' },
    library: { title: 'المكتبة والملفات', subtitle: 'إدارة الوسائط والمستندات' },
    projects: { title: 'المشاريع', subtitle: 'مساحات العمل والمبادرات' },
    memory: { title: 'الذاكرة الشخصية', subtitle: 'تخصيص التفضيلات والخصوصية' },
    status: { title: 'حالة الخدمات', subtitle: 'التوفر والاتصال وحصص المزود' },
    admin: { title: 'لوحة الإدارة', subtitle: 'المراقبة وإدارة النماذج والسياسات' },
    settings: { title: 'الإعدادات والخصوصية', subtitle: 'تخصيص التجربة والبيانات' },
    terms: { title: 'الشروط والسياسات', subtitle: 'الاستخدام الأخلاقي وحماية الخصوصية' },
  };

  const { title, subtitle } = viewTitles[currentView] || { title: 'NOVA AI', subtitle: '' };

  return (
    <header className="h-16 border-b border-[#E9E6F0] bg-white/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 z-10 select-none">
      {/* Right Side (RTL Start): Mobile Hamburger + View Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-[#201B2B] hover:bg-[#FAF9FF] border border-[#E9E6F0]"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-black text-[#201B2B]">{title}</h1>
            {currentView === 'chat' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEE8FF] text-[#5635B5]">
                <Cpu className="w-3 h-3" />
                {selectedModel}
              </span>
            )}
          </div>
          <p className="hidden md:block text-[11px] text-[#777181] font-medium leading-none mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Left Side (RTL End): Controls & Indicators */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model Selector Pill (When in chat or studio) */}
        {(currentView === 'chat' || currentView === 'home') && (
          <div className="hidden sm:flex items-center bg-[#FAF9FF] border border-[#E9E6F0] rounded-xl p-1 text-xs">
            <button
              onClick={() => onSelectModel('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-white text-[#5635B5] shadow-xs font-bold border border-[#E9E6F0]'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
              title="فائق السرعة وأقل استهلاكاً للحصة (الافتراضي للمحادثة السريعة)"
            >
              ⚡ سريع (Lite)
            </button>
            <button
              onClick={() => onSelectModel('gemini-3.8-flash')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-white text-[#5635B5] shadow-xs font-bold border border-[#E9E6F0]'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
              title="متوازن ومناسب للمهام العامة"
            >
              متوازن (3.8)
            </button>
            <button
              onClick={() => onSelectModel('gemini-4-argon')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedModel === 'gemini-4-argon'
                  ? 'bg-white text-[#5635B5] shadow-xs font-bold border border-[#E9E6F0]'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
              title="تفكير عميق وبرمجة متقدمة"
            >
              تفكير (Argon)
            </button>
          </div>
        )}

        {/* Server Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            serverOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={serverOnline ? 'خادم NOVA AI متصل ويعمل بصورة ممتازة' : 'فحص الاتصال بالخادم...'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              serverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-medium hidden sm:inline">
            {serverOnline ? 'الخادم نشط' : 'جاري الاتصال'}
          </span>
        </div>

        {/* User / Workspace Avatar */}
        <div className="flex items-center gap-2 pl-1 border-r border-[#E9E6F0] pr-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7652D6] to-[#5635B5] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            N
          </div>
        </div>
      </div>
    </header>
  );
};
