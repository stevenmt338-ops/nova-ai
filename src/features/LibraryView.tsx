import React, { useState } from 'react';
import {
  Library,
  Image as ImageIcon,
  FileText,
  Video,
  Mic,
  Code2,
  Download,
  Trash2,
  Search,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { LibraryItem } from '../types';

interface LibraryViewProps {
  items: LibraryItem[];
  onDeleteItem: (id: string) => void;
  onAddItem: (item: LibraryItem) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ items, onDeleteItem, onAddItem }) => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-fuchsia-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-violet-600" />;
      case 'audio':
        return <Mic className="w-4 h-4 text-emerald-600" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-[#7652D6]" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 bg-[#FAF9FF]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
          <h2 className="font-black text-xl text-[#201B2B]">المكتبة وإدارة الملفات</h2>
        </div>
        <p className="text-xs text-[#777181]">
          الأصول الرقمية، المستندات، الصور المولدة، التسجيلات الصوتية، والأكواد المحفوظة.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E9E6F0] shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'image', label: 'صور' },
            { id: 'video', label: 'فيديو' },
            { id: 'audio', label: 'صوت' },
            { id: 'code', label: 'أكواد' },
            { id: 'document', label: 'مستندات' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                filter === cat.id
                  ? 'bg-[#EEE8FF] text-[#5635B5] font-bold'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#777181] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المكتبة..."
            className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-[#FAF9FF] border border-[#E9E6F0] text-xs text-[#201B2B] focus:outline-none focus:border-[#7652D6]"
          />
        </div>
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <div className="h-64 rounded-3xl border-2 border-dashed border-[#E9E6F0] flex flex-col items-center justify-center text-center p-6 text-[#777181] bg-white/50">
          <Library className="w-10 h-10 text-[#7652D6]/40 mb-2" />
          <h3 className="font-bold text-sm text-[#201B2B]">لا توجد عناصر في هذا التصنيف</h3>
          <p className="text-xs max-w-xs mt-1">
            عند إنشاء صور أو تسجيل أصوات أو كتابة أكواد، يمكنك حفظها للمكتبة للوصول السريع إليها لاحقاً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF9FF] border border-[#E9E6F0] flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className="text-[11px] font-bold text-[#777181] capitalize">
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 rounded hover:bg-red-50 text-[#777181] hover:text-red-500"
                  title="حذف من المكتبة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#201B2B] line-clamp-1">{item.title}</h4>
                <p className="text-[10px] text-[#777181] mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>

              {item.url && item.category === 'image' && (
                <div className="h-28 rounded-xl overflow-hidden bg-slate-50 border border-[#E9E6F0]">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}

              {item.url && (
                <a
                  href={item.url}
                  download
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-[#FAF9FF] border border-[#E9E6F0] hover:border-[#7652D6] text-xs font-semibold text-[#201B2B] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الملف</span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
