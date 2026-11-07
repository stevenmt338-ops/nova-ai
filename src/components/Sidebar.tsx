import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  Video,
  Mic,
  Search,
  Code2,
  Users,
  LayoutDashboard,
  FolderKanban,
  Library,
  Brain,
  ShieldCheck,
  Settings,
  HelpCircle,
  Plus,
  Trash2,
  Pin,
  ChevronLeft,
  ChevronRight,
  Activity,
  X,
  Sliders,
} from 'lucide-react';
import { ViewMode, Conversation } from '../types';
import { NovaLogo } from './NovaLogo';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  conversations: Conversation[];
  currentConvId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  conversations,
  currentConvId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isMobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}) => {
  const [searchConv, setSearchConv] = useState('');

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'chat', label: 'المحادثة الذكية', icon: MessageSquare, badge: 'Brain' },
    { id: 'imagine', label: 'استوديو الصور', icon: ImageIcon, badge: 'Imagine' },
    { id: 'motion', label: 'استوديو الفيديو', icon: Video, badge: 'Motion' },
    { id: 'voice', label: 'استوديو الصوت', icon: Mic, badge: 'Voice' },
    { id: 'search', label: 'البحث والبحث العميق', icon: Search },
    { id: 'studio', label: 'استوديو البرمجة', icon: Code2, badge: 'Studio' },
    { id: 'team', label: 'فريق الوكلاء', icon: Users, badge: 'Agents' },
    { id: 'canvas', label: 'مساحة العمل', icon: Sparkles, badge: 'Canvas' },
    { id: 'library', label: 'المكتبة والملفات', icon: Library },
    { id: 'projects', label: 'المشاريع', icon: FolderKanban },
    { id: 'memory', label: 'الذاكرة الشخصية', icon: Brain },
  ];

  const bottomItems = [
    { id: 'status', label: 'حالة الخدمات', icon: Activity },
    { id: 'admin', label: 'لوحة الإدارة', icon: ShieldCheck },
    { id: 'settings', label: 'الإعدادات والخصوصية', icon: Settings },
  ];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchConv.toLowerCase())
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-l border-[#E9E6F0] text-[#201B2B] select-none">
      {/* Header & Logo */}
      <div className="flex items-center justify-between p-4 border-b border-[#E9E6F0]/80">
        <NovaLogo size={collapsed ? 'sm' : 'md'} showText={!collapsed} />
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-[#777181] hover:bg-[#FAF9FF] hover:text-[#201B2B]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewConversation();
            onSelectView('chat');
            onCloseMobile();
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-semibold text-sm shadow-[0_2px_8px_rgba(118,82,214,0.3)] hover:shadow-[0_4px_14px_rgba(118,82,214,0.4)] hover:brightness-105 active:scale-[0.99] transition-all ${
            collapsed ? 'px-0' : ''
          }`}
          title="محادثة جديدة"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>محادثة جديدة</span>}
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id as ViewMode);
                onCloseMobile();
              }}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#EEE8FF] text-[#5635B5] font-bold shadow-xs'
                  : 'text-[#201B2B] hover:bg-[#FAF9FF] hover:text-[#7652D6]'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#7652D6]' : 'text-[#777181]'}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-right">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-[#FAF9FF] text-[#7652D6] border border-[#E9E6F0]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Recent Conversations Accordion (Only when not collapsed) */}
        {!collapsed && (
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-[#777181]">
              <span>المحادثات الأخيرة</span>
              <span className="text-[10px] bg-[#EEE8FF] text-[#5635B5] px-1.5 py-0.2 rounded-full">
                {conversations.length}
              </span>
            </div>

            {/* Conversation search */}
            <div className="px-2 mb-2">
              <input
                type="text"
                placeholder="بحث في المحادثات..."
                value={searchConv}
                onChange={(e) => setSearchConv(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[#FAF9FF] border border-[#E9E6F0] focus:outline-none focus:border-[#7652D6] text-[#201B2B] placeholder:text-[#777181]"
              />
            </div>

            <div className="space-y-0.5 max-h-48 overflow-y-auto px-1">
              {filteredConversations.map((conv) => {
                const isSelected = currentConvId === conv.id && currentView === 'chat';
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#FAF9FF] text-[#5635B5] font-semibold border-r-2 border-[#7652D6]'
                        : 'text-[#201B2B] hover:bg-[#FAF9FF]'
                    }`}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onSelectView('chat');
                      onCloseMobile();
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-[#777181] shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {conv.pinned && <Pin className="w-3 h-3 text-[#7652D6] fill-[#7652D6]" />}
                      {conversations.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-1 rounded hover:bg-red-50 text-[#777181] hover:text-red-500"
                          title="حذف المحادثة"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-2 border-t border-[#E9E6F0] space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id as ViewMode);
                onCloseMobile();
              }}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#EEE8FF] text-[#5635B5] font-bold'
                  : 'text-[#777181] hover:bg-[#FAF9FF] hover:text-[#201B2B]'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Collapse toggle (Desktop only) */}
        <div className="hidden md:flex justify-end pt-1">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[#777181] hover:bg-[#FAF9FF] hover:text-[#201B2B] transition-colors"
            title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 z-20 ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 right-0 w-72 bg-white z-50 transform transition-transform duration-300 shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
