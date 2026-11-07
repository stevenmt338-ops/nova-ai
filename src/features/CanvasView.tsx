import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Move,
  Link,
  Layers,
  FileText,
  CheckSquare,
  Code,
  Download,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { CanvasCard, CanvasConnection } from '../types';

interface CanvasViewProps {
  cards: CanvasCard[];
  connections: CanvasConnection[];
  onUpdateCards: (cards: CanvasCard[]) => void;
  onUpdateConnections: (conns: CanvasConnection[]) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  cards,
  connections,
  onUpdateCards,
  onUpdateConnections,
}) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'note' | 'task' | 'ai_response'>('note');
  const [showAddModal, setShowAddModal] = useState(false);

  // Dragging state
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setDragCardId(id);
    setDragOffset({
      x: e.clientX - card.x,
      y: e.clientY - card.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragCardId) return;
    const updated = cards.map((c) => {
      if (c.id === dragCardId) {
        return {
          ...c,
          x: Math.max(10, e.clientX - dragOffset.x),
          y: Math.max(10, e.clientY - dragOffset.y),
        };
      }
      return c;
    });
    onUpdateCards(updated);
  };

  const handleMouseUp = () => {
    setDragCardId(null);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCard: CanvasCard = {
      id: `card_${Date.now()}`,
      type: newType,
      title: newTitle,
      content: newContent || 'محتوى البطاقة...',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 150,
      width: 280,
      color: newType === 'task' ? '#EEE8FF' : '#FFFFFF',
    };

    onUpdateCards([...cards, newCard]);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleDeleteCard = (id: string) => {
    onUpdateCards(cards.filter((c) => c.id !== id));
    onUpdateConnections(connections.filter((cn) => cn.fromId !== id && cn.toId !== id));
  };

  // AI Organize Cards in Clean Grid
  const handleAiAutoOrganize = () => {
    setIsOrganizing(true);
    setTimeout(() => {
      const organized = cards.map((card, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        return {
          ...card,
          x: 40 + col * 320,
          y: 40 + row * 240,
        };
      });
      onUpdateCards(organized);
      setIsOrganizing(false);
    }, 400);
  };

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9FF] relative select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Canvas Header Control Bar */}
      <div className="px-4 py-2.5 bg-white/90 backdrop-blur-md border-b border-[#E9E6F0] flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#7652D6]" />
          <h2 className="font-extrabold text-sm text-[#201B2B]">
            NOVA CANVAS — مساحة العمل التفاعلية
          </h2>
          <span className="text-xs text-[#777181] hidden sm:inline">
            ({cards.length} بطاقات نشطة)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAiAutoOrganize}
            disabled={isOrganizing || cards.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#7652D6] hover:bg-purple-100 text-xs font-bold transition-all"
          >
            {isOrganizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
            <span>تنظيم ذكي للبطاقات</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white text-xs font-bold shadow-xs hover:brightness-105 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة بطاقة</span>
          </button>
        </div>
      </div>

      {/* Grid Pattern Background & Board */}
      <div
        className="flex-1 w-full h-full relative overflow-auto"
        style={{
          backgroundImage: 'radial-gradient(#E0DAF5 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Render Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map((conn) => {
            const fromCard = cards.find((c) => c.id === conn.fromId);
            const toCard = cards.find((c) => c.id === conn.toId);
            if (!fromCard || !toCard) return null;

            const x1 = fromCard.x + (fromCard.width || 280) / 2;
            const y1 = fromCard.y + 60;
            const x2 = toCard.x + (toCard.width || 280) / 2;
            const y2 = toCard.y + 60;

            return (
              <g key={conn.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#7652D6"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
              </g>
            );
          })}
        </svg>

        {/* Render Cards */}
        {cards.map((card) => {
          const isActive = activeCardId === card.id;
          return (
            <div
              key={card.id}
              style={{
                transform: `translate(${card.x}px, ${card.y}px)`,
                width: `${card.width || 280}px`,
                backgroundColor: card.color || '#FFFFFF',
              }}
              onClick={() => setActiveCardId(card.id)}
              className={`absolute top-0 right-0 rounded-2xl border transition-shadow cursor-grab active:cursor-grabbing p-4 shadow-sm z-10 ${
                isActive
                  ? 'ring-2 ring-[#7652D6] shadow-lg border-[#7652D6]'
                  : 'border-[#E9E6F0] hover:shadow-md'
              }`}
            >
              {/* Card Header & Drag Handle */}
              <div
                className="flex items-center justify-between pb-2 mb-2 border-b border-[#E9E6F0]/80"
                onMouseDown={(e) => handleMouseDown(e, card.id)}
              >
                <div className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-[#777181]" />
                  <h4 className="font-extrabold text-xs text-[#201B2B] truncate">{card.title}</h4>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                  className="p-1 rounded hover:bg-red-50 text-[#777181] hover:text-red-500"
                  title="حذف البطاقة"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Card Content */}
              <div className="text-xs text-[#201B2B] leading-relaxed whitespace-pre-wrap">
                {card.content}
              </div>

              <div className="mt-3 pt-2 border-t border-[#E9E6F0]/60 flex items-center justify-between text-[10px] text-[#777181]">
                <span className="capitalize">{card.type}</span>
                <span>NOVA Canvas</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Add New Card */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E9E6F0] shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#201B2B]">إضافة بطاقة جديدة إلى اللوحة</h3>
            <form onSubmit={handleAddCard} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#777181]">عنوان البطاقة</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: فكرة التسويق، ملاحظة تقنية..."
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#E9E6F0] text-xs focus:outline-none focus:border-[#7652D6]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#777181]">محتوى البطاقة</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="اكتب التفاصيل هنا..."
                  rows={3}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#E9E6F0] text-xs focus:outline-none focus:border-[#7652D6] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#777181]">نوع البطاقة</label>
                <div className="flex gap-2 mt-1">
                  {(['note', 'task', 'ai_response'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        newType === t
                          ? 'bg-[#EEE8FF] text-[#5635B5] border-[#7652D6]'
                          : 'border-[#E9E6F0] text-[#777181]'
                      }`}
                    >
                      {t === 'note' ? 'ملاحظة' : t === 'task' ? 'مهمة' : 'ذكاء اصطناعي'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#7652D6] text-white text-xs font-bold"
                >
                  حفظ البطاقة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
