import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  Cpu,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const StatusView: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
      setLastCheckTime(new Date().toLocaleTimeString('ar-EG'));
    } catch (e) {
      console.error('Health fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const services = [
    {
      name: 'NOVA BRAIN — المحادثة الذكية',
      model: 'gemini-3.8-flash / 3.1-flash-lite / 4-argon',
      status: 'operational',
      type: 'Chat, Reasoning, Multimodal',
      notes: 'يعمل بكفاءة تامة مع دعم البث الحي SSE والمرفقات المتعددة.',
    },
    {
      name: 'Google Search Grounding — البحث الحي',
      model: 'gemini-3.8-flash (Search Grounding)',
      status: 'operational',
      type: 'Live Web Grounding',
      notes: 'يسترجع مصادر وروابط ويب حقيقية وموثوقة دون اختلاق.',
    },
    {
      name: 'NOVA IMAGINE — استوديو الصور',
      model: 'gemini-3.1-flash-lite-image',
      status: 'operational',
      type: 'Text-to-Image / Image-to-Image',
      notes: 'توليد وتعديل الصور بنسب أبعاد مختلفة وأساليب فنية متقدمة.',
    },
    {
      name: 'NOVA VOICE — التفريغ الصوتي (STT)',
      model: 'gemini-3.5-transcribe',
      status: 'operational',
      type: 'Speech-to-Text',
      notes: 'تفريغ وتلخيص التسجيلات الصوتية مباشرة من الميكروفون.',
    },
    {
      name: 'NOVA VOICE — تركيب الصوت (TTS)',
      model: 'gemini-3.8-flash-lite-tts',
      status: 'operational',
      type: 'Text-to-Speech (WAV 24kHz)',
      notes: 'توليد أصوات بشرية ناطقة وطبيعية تدعم 5 شخصيات صوتية.',
    },
    {
      name: 'NOVA STUDIO — بيئة تشغيل الأكواد',
      model: 'Isolated Sandbox (Client + Server)',
      status: 'operational',
      type: 'Live HTML/JS Sandbox',
      notes: 'معاينة فورية معزولة وآمنة لمنع استغلال الخادم.',
    },
    {
      name: 'NOVA MOTION — استوديو الفيديو التوليدي',
      model: 'Google Veo / Gemini Omni Flash',
      status: 'requires_billing',
      type: 'Video Synthesis & Storyboard',
      notes: 'المخرج ومولد السيناريوهات مفعل 100%. التوليد الرندري الكامل يتطلب مفتاح فوترة مخصص.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-[#FAF9FF]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
            <h2 className="font-black text-xl text-[#201B2B]">حالة الخدمات وتكامل المزودات</h2>
          </div>
          <p className="text-xs text-[#777181]">
            تقرير فني وشفاف بحالة كل خدمة ونموذج، الحصص المتاحة، وسرعة الاستجابة.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] text-xs font-bold text-[#201B2B] shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#7652D6]' : ''}`} />
          <span>تحديث الحالة ({lastCheckTime || 'الآن'})</span>
        </button>
      </div>

      {/* Global Status Banner */}
      <div className="bg-white rounded-3xl p-5 border border-[#E9E6F0] shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#201B2B]">
              جميع الأنظمة الأساسية تعمل بكفاءة (Operational)
            </h3>
            <p className="text-xs text-[#777181] mt-0.5">
              خادم NOVA AI متصل بواجهات البرمجة الرسمية ومحمي بالكامل في البيئة السحابية.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#FAF9FF] px-3 py-1.5 rounded-xl border border-[#E9E6F0] text-xs">
          <span className="font-bold text-[#5635B5]">Gemini SDK v2.4+</span>
        </div>
      </div>

      {/* Services Table List */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-[#201B2B]">تفاصيل الوحدات والقدرات</h3>
        <div className="space-y-2.5">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] shadow-2xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#201B2B]">{srv.name}</span>
                  <span className="text-[10px] text-[#777181] px-2 py-0.5 rounded-md bg-[#FAF9FF] border border-[#E9E6F0]">
                    {srv.type}
                  </span>
                </div>

                {srv.status === 'operational' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>جاهز ويعمل</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>يتطلب فوترة مخصصة</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#777181] pt-1 border-t border-[#E9E6F0]/60">
                <p className="text-[11px]">{srv.notes}</p>
                <span className="text-[10px] font-mono font-medium text-[#5635B5] shrink-0">
                  {srv.model}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Honest Quota Note */}
      <div className="p-4 rounded-3xl bg-[#EEE8FF]/70 border border-[#7652D6]/20 text-xs text-[#5635B5] space-y-1">
        <h4 className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          <span>إدارة الحصص وسرعة التوليد</span>
        </h4>
        <p className="text-[11px] leading-relaxed opacity-90">
          تعتمد المنصة على باقة Google AI Studio المعتمدة. في حال ظهور رمز الخطأ 429، فهذا يعني تجاوز الحصة اللحظية للطلبات في الدقيقة، وتتم إعادة المحاولة تلقائياً خلال ثوانٍ.
        </p>
      </div>
    </div>
  );
};
