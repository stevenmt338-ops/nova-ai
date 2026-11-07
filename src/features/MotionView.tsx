import React, { useState } from 'react';
import {
  Video,
  Clapperboard,
  Sparkles,
  Sliders,
  Layers,
  Camera,
  Play,
  Film,
  Download,
  Info,
  Clock,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { VideoProject, StoryboardScene } from '../types';

interface MotionViewProps {
  videos: VideoProject[];
  onAddVideo: (proj: VideoProject) => void;
}

export const MotionView: React.FC<MotionViewProps> = ({ videos, onAddVideo }) => {
  const [idea, setIdea] = useState('');
  const [duration, setDuration] = useState('5s');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [motionType, setMotionType] = useState('cinematic_pan');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'director' | 'scenes' | 'render'>('director');

  const motions = [
    { id: 'cinematic_pan', label: 'بان سينمائي (Pan)', desc: 'حركة أفقية بطيئة تعطي عمقاً واسعاً' },
    { id: 'smooth_zoom_in', label: 'تقريب ناعم (Zoom In)', desc: 'تركيز تدريجي على العنصر الأساسي' },
    { id: 'orbit_360', label: 'دوران مداري (Orbit)', desc: 'حركة دائرية حول المشهد بزاوية 360' },
    { id: 'drone_flythrough', label: 'طيران طائرة درون', desc: 'حركة جوية ديناميكية وسريعة' },
    { id: 'static_focus', label: 'ثابت مع عمق ميدان', desc: 'كاميرا ثابتة مع حركة داخل المشهد' },
  ];

  const handleCreateStoryboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/video/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          duration,
          ratio: aspectRatio,
          motion: motionType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر توليد السيناريو.');
      }

      const newProj: VideoProject = {
        id: `vid_${Date.now()}`,
        idea,
        aspectRatio,
        duration,
        cameraMotion: motionType,
        storyboard: data.storyboard,
        status: 'ready',
        createdAt: new Date().toISOString(),
      };

      onAddVideo(newProj);
      setCurrentProject(newProj);
      setActiveTab('scenes');
    } catch (err: any) {
      console.error('Motion error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء معالجة السيناريو.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#FAF9FF]">
      {/* Configuration & Input Panel */}
      <div className="w-full md:w-96 bg-white border-l border-[#E9E6F0] p-5 overflow-y-auto shrink-0 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
            <h2 className="font-extrabold text-base text-[#201B2B]">استوديو الإخراج السينمائي</h2>
          </div>
          <p className="text-xs text-[#777181]">
            ابتكار مسارات الحركة، السيناريو التوليدي (Storyboard)، وتجهيز لقطات محركات الفيديو.
          </p>
        </div>

        <form onSubmit={handleCreateStoryboard} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201B2B]">فكرة الفيديو أو الإعلان</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="مثال: إعلان تجاري لسيارة كهربائية تسير في شوارع مستقبلية تحت المطر ليلاً مع انعكاسات نيون وأضواء بنفسجية..."
              rows={4}
              className="w-full p-3 text-xs rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] text-[#201B2B] placeholder:text-[#777181] focus:outline-none focus:border-[#7652D6] focus:ring-2 focus:ring-[#7652D6]/10 resize-none"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201B2B]">المدة الزمنية</label>
            <div className="grid grid-cols-3 gap-2">
              {['3s', '5s', '10s'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    duration === d
                      ? 'bg-[#EEE8FF] text-[#5635B5] border-[#7652D6]'
                      : 'bg-[#FAF9FF] text-[#777181] border-[#E9E6F0]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201B2B]">نسبة الأبعاد</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '16:9', label: '16:9 عريض (يوتيوب)' },
                { id: '9:16', label: '9:16 طولي (تيك توك/ريلز)' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAspectRatio(r.id)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                    aspectRatio === r.id
                      ? 'bg-[#EEE8FF] text-[#5635B5] border-[#7652D6]'
                      : 'bg-[#FAF9FF] text-[#777181] border-[#E9E6F0]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Motion Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201B2B]">حركة الكاميرا والإخراج</label>
            <div className="space-y-1.5">
              {motions.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMotionType(m.id)}
                  className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all ${
                    motionType === m.id
                      ? 'bg-[#EEE8FF] text-[#5635B5] border-[#7652D6] font-bold shadow-2xs'
                      : 'bg-[#FAF9FF] text-[#777181] border-[#E9E6F0] hover:text-[#201B2B]'
                  }`}
                >
                  <p className="font-bold">{m.label}</p>
                  <p className="text-[10px] opacity-75">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!idea.trim() || isGenerating}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-sm shadow-[0_4px_14px_rgba(118,82,214,0.35)] hover:brightness-105 active:scale-98 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري إخراج السيناريو والمشاهد...</span>
              </>
            ) : (
              <>
                <Clapperboard className="w-4 h-4" />
                <span>إنشاء وتجهيز المشاهد</span>
              </>
            )}
          </button>
        </form>

        {/* Integration Transparency Disclaimer */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Info className="w-4 h-4 shrink-0" />
            <span>سياسة الشفافية لتوليد الفيديو</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800/90">
            توليد الفيديو الفعلي عبر Veo أو Gemini Omni Flash يتطلب اشتراك فوترة مخصص وحصص GPU سحابية مكثفة. يقدم NOVA AI هنا المخرج التوليدي الكامل وسيناريو اللقطات الجاهز للتصدير.
          </p>
        </div>
      </div>

      {/* Main Studio Viewport Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {currentProject ? (
          <div className="space-y-4">
            {/* Project Header */}
            <div className="bg-white rounded-3xl p-5 border border-[#E9E6F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#5635B5] bg-[#EEE8FF] px-2.5 py-0.5 rounded-full">
                  مشروع جاهز
                </span>
                <h3 className="font-extrabold text-base text-[#201B2B] mt-1">{currentProject.idea}</h3>
                <div className="flex items-center gap-3 text-xs text-[#777181] mt-1">
                  <span>المدة: {currentProject.duration}</span>
                  <span>الأبعاد: {currentProject.aspectRatio}</span>
                  <span>الحركة: {currentProject.cameraMotion}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([currentProject.storyboard], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `nova-storyboard-${currentProject.id}.md`;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] text-xs font-bold text-[#201B2B]"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير السيناريو</span>
                </button>
              </div>
            </div>

            {/* Video Interactive Canvas / Viewport */}
            <div className="bg-[#151221] rounded-3xl p-6 text-white aspect-video max-h-[420px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl border border-white/10">
              <div className="absolute inset-0 bg-radial from-[#7652D6]/20 via-transparent to-transparent opacity-50" />
              <Film className="w-16 h-16 text-purple-400/40 mb-3" />
              <h4 className="font-bold text-lg text-white">معاينة تسلسل المشاهد</h4>
              <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
                تم تحليل الفكرة وتوليد لقطات المشاهد الثلاثة مع وصف الكاميرا والمؤثرات الصوتية.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-400/30">
                  {currentProject.aspectRatio} • {currentProject.duration}
                </span>
              </div>
            </div>

            {/* Storyboard Markdown Content */}
            <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-[#7652D6]" />
                <span>السيناريو التفصيلي المشهد بمشهد (Director's Storyboard)</span>
              </h4>
              <div className="prose-sm text-xs leading-relaxed whitespace-pre-wrap text-[#201B2B] bg-[#FAF9FF] p-4 rounded-2xl border border-[#E9E6F0]">
                {currentProject.storyboard}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-72 rounded-3xl border-2 border-dashed border-[#E9E6F0] flex flex-col items-center justify-center text-center p-6 text-[#777181] bg-white/50">
            <Video className="w-12 h-12 text-[#7652D6]/40 mb-2" />
            <h3 className="font-bold text-sm text-[#201B2B]">استوديو الفيديو بانتظار فكرتك</h3>
            <p className="text-xs max-w-sm mt-1">
              صف الإعلان أو الفيديو الذي تتخيله في اللوحة الجانبية، وسيقوم NOVA Motion بتفكيكه إلى لقطات ومسارات حركة متقنة.
            </p>
          </div>
        )}

        {/* Previous Video Projects */}
        {videos.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-[#201B2B]">المشاريع المحفوظة ({videos.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setCurrentProject(vid)}
                  className="p-3.5 rounded-2xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] cursor-pointer transition-all shadow-2xs"
                >
                  <p className="font-bold text-xs text-[#201B2B] truncate">{vid.idea}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#777181] mt-1">
                    <span>{vid.duration}</span>
                    <span>•</span>
                    <span>{vid.aspectRatio}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
