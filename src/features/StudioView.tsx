import React, { useState, useRef } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  Maximize2,
  Layers,
  Wrench,
  Terminal,
  RefreshCw,
  Eye,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface StudioViewProps {
  onSaveToLibrary?: (item: any) => void;
}

const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOVA App Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
  <style>body { font-family: 'Tajawal', sans-serif; }</style>
</head>
<body class="bg-[#FAF9FF] min-h-screen flex items-center justify-center p-6 text-[#201B2B]">
  <div class="bg-white p-8 rounded-3xl shadow-xl border border-[#E9E6F0] max-w-md w-full text-center space-y-4">
    <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#7652D6] to-[#5635B5] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/30">
      ⚡
    </div>
    <h2 class="text-2xl font-black text-[#201B2B]">تطبيقك الحي جاهز!</h2>
    <p class="text-sm text-[#777181]">
      هذا تطبيق تم توليده وتشغيله مباشرة داخل بيئة المعاينة الحية لـ NOVA STUDIO.
    </p>
    
    <div class="p-4 rounded-2xl bg-[#EEE8FF] text-[#5635B5] font-bold text-lg" id="counter">
      العداد التفاعلي: 0
    </div>

    <div class="flex gap-2">
      <button onclick="change(1)" class="flex-1 py-3 bg-[#7652D6] hover:bg-[#5635B5] text-white rounded-xl font-bold transition shadow-md">
        زيادة (+)
      </button>
      <button onclick="change(-1)" class="flex-1 py-3 bg-[#E9E6F0] hover:bg-slate-200 text-[#201B2B] rounded-xl font-bold transition">
        نقصان (-)
      </button>
    </div>
  </div>

  <script>
    let count = 0;
    function change(delta) {
      count += delta;
      document.getElementById('counter').innerText = 'العداد التفاعلي: ' + count;
    }
  </script>
</body>
</html>`;

export const StudioView: React.FC<StudioViewProps> = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'split'>('split');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          existingCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر توليد الكود.');
      }

      if (data.code) {
        setCode(data.code);
        setPrompt('');
      }
    } catch (err: any) {
      console.error('Studio error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بنموذج البرمجة.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFixCode = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'افحص هذا الكود بالكامل، أصلح أي أخطاء برمجية أو في التنسيق وتأكد من أنه يعمل بشكل متكامل بنسبة 100%.',
          existingCode: code,
        }),
      });

      const data = await res.json();
      if (data.code) {
        setCode(data.code);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'تعذر فحص وإصلاح الكود.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-app-${Date.now()}.html`;
    a.click();
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = code;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9FF]">
      {/* Studio Toolbar */}
      <div className="px-4 py-2.5 bg-white border-b border-[#E9E6F0] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-black text-sm text-[#201B2B]">
            <Code2 className="w-4 h-4 text-[#7652D6]" />
            <span>NOVA STUDIO</span>
          </div>
          <span className="text-[11px] text-[#777181] hidden sm:inline">
            | محرر الأكواد ومعاينة الساندبوكس الحية
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#FAF9FF] p-1 rounded-xl border border-[#E9E6F0] text-xs">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'split' ? 'bg-white text-[#5635B5] shadow-xs' : 'text-[#777181]'
            }`}
          >
            منقسم (كود + معاينة)
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'preview' ? 'bg-white text-[#5635B5] shadow-xs' : 'text-[#777181]'
            }`}
          >
            معاينة فقط
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'code' ? 'bg-white text-[#5635B5] shadow-xs' : 'text-[#777181]'
            }`}
          >
            الكود فقط
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFixCode}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#7652D6] hover:bg-purple-100 text-xs font-bold transition-colors"
            title="فحص وإصلاح الأخطاء تلقائياً"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إصلاح الأخطاء</span>
          </button>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl border border-[#E9E6F0] hover:bg-[#FAF9FF] text-xs text-[#201B2B]"
            title="نسخ الكود"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownloadCode}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#7652D6] hover:bg-[#5635B5] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل HTML</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Code + Sandbox Preview) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Code Editor Pane */}
        {(activeTab === 'code' || activeTab === 'split') && (
          <div
            className={`h-full flex flex-col border-l border-[#E9E6F0] bg-[#1E1B2E] text-slate-100 ${
              activeTab === 'split' ? 'w-full md:w-1/2' : 'w-full'
            }`}
          >
            <div className="px-4 py-2 bg-[#151221] border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-purple-300 font-mono text-[11px]">
                <Terminal className="w-3.5 h-3.5" />
                index.html
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {code.split('\n').length} أسطر
              </span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-xs leading-relaxed bg-transparent border-0 resize-none text-slate-200 focus:outline-none focus:ring-0 select-text overflow-y-auto"
              dir="ltr"
              spellCheck={false}
            />
          </div>
        )}

        {/* Live Sandbox Preview Pane */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div
            className={`h-full flex flex-col bg-white ${
              activeTab === 'split' ? 'w-full md:w-1/2' : 'w-full'
            }`}
          >
            <div className="px-4 py-2 border-b border-[#E9E6F0] bg-[#FAF9FF] flex items-center justify-between text-xs text-[#777181]">
              <span className="flex items-center gap-1.5 font-bold text-[#5635B5]">
                <Eye className="w-3.5 h-3.5" />
                معاينة حية (Sandbox Iframe)
              </span>
              <button
                onClick={refreshPreview}
                className="p-1 rounded-lg hover:bg-white text-[#777181] hover:text-[#201B2B]"
                title="إعادة تحميل المعاينة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 w-full h-full relative bg-slate-50">
              <iframe
                ref={iframeRef}
                srcDoc={code}
                title="NOVA Live Sandbox"
                sandbox="allow-scripts allow-forms allow-modals"
                className="w-full h-full border-0 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Prompt AI Bar */}
      <div className="p-3 bg-white border-t border-[#E9E6F0] shrink-0">
        <form onSubmit={handleGenerate} className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="صف التطبيق أو التعديل: مثل 'أضف مؤقت زمني ونظام لحفظ السجل في التخزين المحلي'..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] text-xs sm:text-sm text-[#201B2B] placeholder:text-[#777181] focus:outline-none focus:border-[#7652D6]"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-xs shadow-md hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جاري البناء...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحديث الكود</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
