import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  BookOpen,
  Sparkles,
  RefreshCw,
  FileText,
  CheckCircle2,
  ListFilter,
  Download,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { GroundingSource } from '../types';
import { MarkdownView } from '../components/MarkdownView';

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isDeep, setIsDeep] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setErrorMsg(null);
    setSearchResult(null);
    setSources([]);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          isDeep,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر استرجاع نتائج البحث.');
      }

      setSearchResult(data.content);
      setSources(data.sources || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء إجراء البحث المباشر.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = () => {
    if (!searchResult) return;
    navigator.clipboard.writeText(searchResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!searchResult) return;
    const blob = new Blob([searchResult], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-research-${Date.now()}.md`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-[#FAF9FF]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
          <h2 className="font-black text-xl text-[#201B2B]">
            NOVA SEARCH — البحث الموثوق والبحث العميق
          </h2>
        </div>
        <p className="text-xs text-[#777181]">
          استقصاء الويب المباشر عبر Google Search Grounding، مع توثيق المصادر والروابط وفصل الحقائق عن الآراء.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-3xl p-4 border border-[#E9E6F0] shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2 bg-[#FAF9FF] rounded-2xl px-3 py-2 border border-[#E9E6F0] focus-within:border-[#7652D6]">
          <Search className="w-5 h-5 text-[#7652D6] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب استفسارك، أو موضوع البحث الاستقصائي..."
            className="w-full bg-transparent border-0 text-sm text-[#201B2B] placeholder:text-[#777181] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsDeep(false)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                !isDeep
                  ? 'bg-[#EEE8FF] text-[#5635B5] border-[#7652D6]'
                  : 'bg-[#FAF9FF] text-[#777181] border-[#E9E6F0]'
              }`}
            >
              بحث مباشر وسريع
            </button>
            <button
              type="button"
              onClick={() => setIsDeep(true)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 ${
                isDeep
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-[#FAF9FF] text-[#777181] border-[#E9E6F0]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>وضع البحث العميق (Deep Research)</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-xs shadow-[0_4px_14px_rgba(118,82,214,0.35)] hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جاري البحث والتحقق من المصادر...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>تنفيذ البحث</span>
              </>
            )}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sources Bar */}
      {sources.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-[#E9E6F0] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5635B5]">
            <Globe className="w-4 h-4 text-[#7652D6]" />
            <span>المصادر الموثقة المسترجعة من الويب ({sources.length}):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {sources.map((src, idx) => (
              <a
                key={idx}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF9FF] border border-[#E9E6F0] hover:border-[#7652D6] text-xs text-[#201B2B] hover:text-[#7652D6] transition-colors truncate"
              >
                <span className="truncate font-medium">{src.title || src.uri}</span>
                <ExternalLink className="w-3 h-3 text-[#777181] shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Result Display */}
      {searchResult && (
        <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9E6F0] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#7652D6]" />
              <h3 className="font-extrabold text-sm text-[#201B2B]">
                {isDeep ? 'تقرير البحث الاستقصائي المتكامل' : 'نتائج البحث والتلخيص'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-xl border border-[#E9E6F0] hover:bg-[#FAF9FF] text-xs font-semibold text-[#201B2B] flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">نسخ</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-3 py-1.5 rounded-xl bg-[#7652D6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير تقرير Markdown</span>
              </button>
            </div>
          </div>

          <MarkdownView content={searchResult} />
        </div>
      )}
    </div>
  );
};
