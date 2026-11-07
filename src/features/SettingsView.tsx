import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Sliders,
  Shield,
  Trash2,
  Download,
  Check,
  Volume2,
  Cpu,
  Moon,
  Sun,
} from 'lucide-react';
import { ChatModel } from '../types';

interface SettingsViewProps {
  selectedModel: ChatModel;
  onSelectModel: (m: ChatModel) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ selectedModel, onSelectModel }) => {
  const [streamChat, setStreamChat] = useState(true);
  const [preferredVoice, setPreferredVoice] = useState('Kore');
  const [exported, setExported] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleExportData = () => {
    const data = {
      conversations: localStorage.getItem('nova_conversations'),
      images: localStorage.getItem('nova_images'),
      memories: localStorage.getItem('nova_memories'),
      projects: localStorage.getItem('nova_projects'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-backup-${Date.now()}.json`;
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleClearData = () => {
    if (confirm('هل أنت متأكد من مسح جميع بيانات الجلسة والمحادثات المخزنة محلياً؟')) {
      localStorage.clear();
      setCleared(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-[#FAF9FF]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
          <h2 className="font-black text-xl text-[#201B2B]">الإعدادات والخصوصية</h2>
        </div>
        <p className="text-xs text-[#777181]">
          تخصيص تجربة الاستخدام، النماذج، وسائط الصوت، وتصدير أو مسح البيانات المحلية.
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#7652D6]" />
          <span>تفضيلات المحادثة والنماذج</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0]">
            <div>
              <span className="font-bold text-xs text-[#201B2B]">
                تفعيل الرد التفاعلي المتدفق (SSE Streaming)
              </span>
              <p className="text-[11px] text-[#777181] mt-0.5">
                عرض الكلمات فور توليدها من النموذج بدلاً من الانتظار
              </p>
            </div>
            <input
              type="checkbox"
              checked={streamChat}
              onChange={(e) => setStreamChat(e.target.checked)}
              className="w-4 h-4 accent-[#7652D6]"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0]">
            <div>
              <span className="font-bold text-xs text-[#201B2B]">الصوت الافتراضي لنطق الإجابات</span>
              <p className="text-[11px] text-[#777181] mt-0.5">
                الشخصية الصوتية المستخدمة في Text-to-Speech
              </p>
            </div>
            <select
              value={preferredVoice}
              onChange={(e) => setPreferredVoice(e.target.value)}
              className="p-1.5 rounded-xl border border-[#E9E6F0] text-xs text-[#201B2B] font-semibold bg-white"
            >
              <option value="Kore">كوري (Kore) - هادئ ورصين</option>
              <option value="Puck">بوك (Puck) - حيوي ودافئ</option>
              <option value="Charon">تشارون (Charon) - رسمي وعميق</option>
              <option value="Fenrir">فنرير (Fenrir) - حازم وقوي</option>
              <option value="Zephyr">زفير (Zephyr) - خفيف وسريع</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language & UI */}
      <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#7652D6]" />
          <span>اللغة والمظهر</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0]">
            <div>
              <span className="font-bold text-xs text-[#201B2B]">لغة الواجهة الأساسية</span>
              <p className="text-[11px] text-[#777181] mt-0.5">
                يدعم التطبيق الاتجاه من اليمين إلى اليسار (RTL) بالكامل
              </p>
            </div>
            <span className="text-xs font-bold text-[#5635B5] px-3 py-1 bg-white rounded-xl border border-[#E9E6F0]">
              العربية (RTL)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0]">
            <div>
              <span className="font-bold text-xs text-[#201B2B]">لوحة الألوان المعتمدة</span>
              <p className="text-[11px] text-[#777181] mt-0.5">
                أبيض ناصع + بنفسجي ملكي SaaS #7652D6
              </p>
            </div>
            <span className="text-xs font-bold text-[#5635B5] px-3 py-1 bg-white rounded-xl border border-[#E9E6F0]">
              NOVA Purple & White
            </span>
          </div>
        </div>
      </div>

      {/* Data Management & Privacy */}
      <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#7652D6]" />
          <span>إدارة البيانات المحلية والنسخ الاحتياطي</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleExportData}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] hover:border-[#7652D6] text-xs font-bold text-[#201B2B] transition-colors"
          >
            {exported ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <button
            onClick={handleClearData}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{cleared ? 'جاري إعادة الضبط...' : 'مسح التخزين المؤقت المحلي'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
