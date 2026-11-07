import React, { useState } from 'react';
import {
  Users,
  Compass,
  Search,
  BarChart3,
  Palette,
  CheckCheck,
  Zap,
  ArrowDown,
  RefreshCw,
  FileText,
  Download,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { MarkdownView } from '../components/MarkdownView';

export const TeamView: React.FC = () => {
  const [mission, setMission] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [teamOutput, setTeamOutput] = useState<string | null>(null);
  const [agentsStatus, setAgentsStatus] = useState<Record<string, 'idle' | 'working' | 'done'>>({
    planner: 'idle',
    researcher: 'idle',
    analyst: 'idle',
    creator: 'idle',
    reviewer: 'idle',
    coordinator: 'idle',
  });
  const [copied, setCopied] = useState(false);

  const agents = [
    {
      id: 'planner',
      name: 'المخطط',
      role: 'Planner',
      icon: Compass,
      desc: 'تقسيم المهمة وتحديد الأهداف ومؤشرات النجاح',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      id: 'researcher',
      name: 'الباحث',
      role: 'Researcher',
      icon: Search,
      desc: 'جمع الحقائق والأدلة والبيانات والحلول السابقة',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      id: 'analyst',
      name: 'المحلل',
      role: 'Analyst',
      icon: BarChart3,
      desc: 'تحليل المخاطر والجدوى والمفاضلة بين الخيارات',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      id: 'creator',
      name: 'المنشئ',
      role: 'Creator',
      icon: Palette,
      desc: 'صياغة المسودة وإنتاج المحتوى أو الكود الأساسي',
      color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
    },
    {
      id: 'reviewer',
      name: 'المراجع',
      role: 'Reviewer',
      icon: CheckCheck,
      desc: 'تدقيق الجودة، كشف الثغرات، واقتراح التحسينات',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    {
      id: 'coordinator',
      name: 'المنسق',
      role: 'Coordinator',
      icon: Zap,
      desc: 'دمج النتائج وإخراج المنتج النهائي المكتمل',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
    },
  ];

  const handleRunTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission.trim() || isRunning) return;

    setIsRunning(true);
    setTeamOutput(null);

    // Simulate animated step transitions
    setAgentsStatus({
      planner: 'working',
      researcher: 'idle',
      analyst: 'idle',
      creator: 'idle',
      reviewer: 'idle',
      coordinator: 'idle',
    });

    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر تشغيل فريق الوكلاء.');
      }

      setAgentsStatus({
        planner: 'done',
        researcher: 'done',
        analyst: 'done',
        creator: 'done',
        reviewer: 'done',
        coordinator: 'done',
      });

      setTeamOutput(data.workflowOutput);
    } catch (err: any) {
      console.error('Agent error:', err);
      alert(err.message || 'حدث خطأ أثناء تشغيل فريق الوكلاء.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    if (!teamOutput) return;
    navigator.clipboard.writeText(teamOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 bg-[#FAF9FF]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
          <h2 className="font-black text-xl text-[#201B2B]">
            NOVA TEAM — فريق الوكلاء الذكي (Multi-Agent)
          </h2>
        </div>
        <p className="text-xs text-[#777181]">
          نظام متقدم يتعاون فيه 6 وكلاء متخصصون على نفس المهمة تسلسلياً للخروج بأفضل جودة ممكنة.
        </p>
      </div>

      {/* Agents Pipeline Flow Visualizer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {agents.map((ag) => {
          const Icon = ag.icon;
          const status = agentsStatus[ag.id];
          return (
            <div
              key={ag.id}
              className={`p-3 rounded-2xl border text-center transition-all ${ag.color} ${
                status === 'working' ? 'ring-2 ring-[#7652D6] animate-pulse' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white shadow-2xs mx-auto flex items-center justify-center mb-1.5">
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-xs">{ag.name}</h4>
              <p className="text-[10px] opacity-75 mt-0.5 leading-tight">{ag.role}</p>

              <div className="mt-2 text-[9px] font-bold">
                {status === 'done' ? (
                  <span className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
                    اكتمل
                  </span>
                ) : status === 'working' ? (
                  <span className="text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded-full animate-bounce">
                    يعمل...
                  </span>
                ) : (
                  <span className="opacity-50">بانتظار المهمة</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mission Input Form */}
      <form
        onSubmit={handleRunTeam}
        className="bg-white rounded-3xl p-5 border border-[#E9E6F0] shadow-sm space-y-3"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#201B2B]">
            حدد المهمة الموكلة لفريق الوكلاء
          </label>
          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="مثال: نريد إعداد خطة شاملة لإطلاق تطبيق إدارة المهام مع دراسة السوق، المخاطر، المعمارية البرمجية، وخطة التسويق في 30 يوماً..."
            rows={3}
            className="w-full p-3 text-xs rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] text-[#201B2B] placeholder:text-[#777181] focus:outline-none focus:border-[#7652D6] resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#777181]">
            سيقوم الفريق بالعمل المتتابع وضبط الجودة حتى المخرج النهائي.
          </span>

          <button
            type="submit"
            disabled={!mission.trim() || isRunning}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-xs shadow-[0_4px_14px_rgba(118,82,214,0.35)] hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>الوكلاء ينفذون المهمة بالتتابع...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>إطلاق فريق الوكلاء</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Team Deliverable Result */}
      {teamOutput && (
        <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9E6F0] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7652D6]" />
              <h3 className="font-extrabold text-sm text-[#201B2B]">
                المخرج النهائي لفريق الوكلاء المتكامل
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9E6F0] text-xs font-semibold text-[#201B2B] hover:bg-[#FAF9FF]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ التقرير</span>
              </button>
            </div>
          </div>

          <MarkdownView content={teamOutput} />
        </div>
      )}
    </div>
  );
};
