import React, { useState } from 'react';
import { FolderKanban, Plus, CheckCircle, Clock, Trash2, Tag, ArrowLeft } from 'lucide-react';
import { UserProject, ViewMode } from '../types';

interface ProjectsViewProps {
  projects: UserProject[];
  onAddProject: (proj: UserProject) => void;
  onDeleteProject: (id: string) => void;
  onNavigateToView: (view: ViewMode) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onAddProject,
  onDeleteProject,
  onNavigateToView,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('تطوير المنتجات');
  const [tagInput, setTagInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newProject: UserProject = {
      id: `proj_${Date.now()}`,
      title,
      description,
      category,
      tags: tags.length > 0 ? tags : ['عام'],
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    onAddProject(newProject);
    setTitle('');
    setDescription('');
    setTagInput('');
    setShowModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 bg-[#FAF9FF]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
            <h2 className="font-black text-xl text-[#201B2B]">المشاريع ومساحات العمل</h2>
          </div>
          <p className="text-xs text-[#777181]">
            تنظيم مهامك، ملفاتك، مخرجات الوكلاء، وأفكارك تحت مظلة مشاريع متكاملة.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-xs shadow-xs hover:brightness-105 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>مشروع جديد</span>
        </button>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-3xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEE8FF] text-[#5635B5]">
                  {proj.category}
                </span>
                <button
                  onClick={() => onDeleteProject(proj.id)}
                  className="p-1 rounded hover:bg-red-50 text-[#777181] hover:text-red-500"
                  title="حذف المشروع"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-extrabold text-sm text-[#201B2B]">{proj.title}</h3>
              <p className="text-xs text-[#777181] leading-relaxed line-clamp-3">
                {proj.description || 'لا يوجد وصف مضاف لهذا المشروع.'}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#E9E6F0]/60">
              <div className="flex flex-wrap gap-1">
                {proj.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF9FF] border border-[#E9E6F0] text-[#777181]"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigateToView('chat')}
                  className="text-[#7652D6] font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>فتح بالمحادثة</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <span className="text-[10px] text-[#777181]">
                  {new Date(proj.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E9E6F0] shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#201B2B]">إنشاء مشروع جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#777181]">عنوان المشروع</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تطبيق الهواتف الذكية"
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#E9E6F0] text-xs focus:outline-none focus:border-[#7652D6]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#777181]">وصف المشروع وأهدافه</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ما هي أهداف هذا المشروع؟"
                  rows={3}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#E9E6F0] text-xs focus:outline-none focus:border-[#7652D6] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#777181]">التصنيف</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#E9E6F0] text-xs focus:outline-none focus:border-[#7652D6]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#777181]">الوسوم (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="تصميم, تسويق, برمجيات"
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#E9E6F0] text-xs focus:outline-none focus:border-[#7652D6]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#7652D6] text-white text-xs font-bold"
                >
                  إنشاء المشروع
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
