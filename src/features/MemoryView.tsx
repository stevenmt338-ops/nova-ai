import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { MemoryItem } from '../types';

interface MemoryViewProps {
  memories: MemoryItem[];
  memoryEnabled: boolean;
  onToggleMemory: (enabled: boolean) => void;
  onAddMemory: (item: MemoryItem) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memories,
  memoryEnabled,
  onToggleMemory,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'style' | 'project'>('preference');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    onAddMemory({
      id: `mem_${Date.now()}`,
      category: newCategory,
      content: newContent,
      createdAt: new Date().toISOString(),
      active: true,
    });

    setNewContent('');
    setShowAdd(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-[#FAF9FF]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
          <h2 className="font-black text-xl text-[#201B2B]">الذاكرة الشخصية الاختيارية</h2>
        </div>
        <p className="text-xs text-[#777181]">
          تساعد NOVA AI على تذكر تفضيلاتك وأسلوبك المفضل في الحوار دون الحاجة لتكرار التعليمات.
        </p>
      </div>

      {/* Main Switch Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E9E6F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EEE8FF] text-[#5635B5] flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#201B2B]">
              تفعيل الذاكرة الشخصية في المحادثات
            </h3>
            <p className="text-xs text-[#777181] mt-0.5">
              {memoryEnabled
                ? 'الذاكرة نشطة ومتاحة لتخصيص الردود تلقائياً.'
                : 'الذاكرة متوقفة حالياً. ستتعامل النماذج مع كل محادثة بشكل مستقل.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleMemory(!memoryEnabled)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            memoryEnabled
              ? 'bg-[#7652D6] text-white shadow-md'
              : 'bg-[#FAF9FF] text-[#777181] border border-[#E9E6F0]'
          }`}
        >
          {memoryEnabled ? (
            <>
              <ToggleRight className="w-5 h-5" />
              <span>مفعلة</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5" />
              <span>معطلة</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 space-y-1">
          <h4 className="font-bold">حماية الخصوصية الصارمة للذاكرة</h4>
          <p className="leading-relaxed opacity-90 text-[11px]">
            - لا يتم حفظ كلمات مرور أو بطاقات ائتمانية أو مفاتيح API أبداً.
            <br />
            - الذاكرة مشفرة وخاصة بحسابك ولا تستخدم لتدريب نماذج عمومية.
            <br />- يمكنك تعديل أو حذف أي معلومة في أي لحظة.
          </p>
        </div>
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-[#201B2B]">
            المعلومات المحفوظة بالذاكرة ({memories.length})
          </h3>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] text-xs font-bold text-[#5635B5] shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة تفضيل جديد</span>
          </button>
        </div>

        {memories.length === 0 ? (
          <p className="text-xs text-[#777181]">لا توجد تفضيلات مخزنة حالياً.</p>
        ) : (
          <div className="space-y-2">
            {memories.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white border border-[#E9E6F0] flex items-center justify-between gap-3 shadow-2xs hover:border-[#7652D6] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
                  <div>
                    <p className="text-xs text-[#201B2B] font-medium leading-relaxed">{m.content}</p>
                    <span className="text-[10px] text-[#777181] capitalize mt-0.5 block">
                      التصنيف: {m.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMemory(m.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-[#777181] hover:text-red-500 transition-colors"
                  title="حذف هذا التفضيل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E9E6F0] shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#201B2B]">إضافة تفضيل للذاكرة</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#777181]">ما الذي تود أن تتذكره NOVA؟</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="مثال: أفضل دائماً تلخيص الإجابة في بداية كل رد..."
                  rows={3}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#E9E6F0] text-xs focus:outline-none focus:border-[#7652D6] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#777181]">التصنيف</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl border border-[#E9E6F0] text-xs"
                >
                  <option value="preference">تفضيل عام</option>
                  <option value="style">أسلوب الكتابة</option>
                  <option value="project">سياق العمل</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#7652D6] text-white text-xs font-bold"
                >
                  حفظ في الذاكرة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-xl border border-[#E9E6F0] text-xs font-semibold text-[#777181]"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
