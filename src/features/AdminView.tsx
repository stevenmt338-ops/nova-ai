import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Cpu,
  BarChart2,
  Sliders,
  AlertTriangle,
  Lock,
  RefreshCw,
  Activity,
  CheckCircle2,
  Eye,
  EyeOff,
  Bell,
  Clock,
} from 'lucide-react';
import { ChatModel } from '../types';

interface AdminViewProps {
  selectedModel: ChatModel;
  onSelectModel: (m: ChatModel) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ selectedModel, onSelectModel }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(60);
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'logs'>('overview');

  const auditLogs = [
    { id: '1', action: 'System Boot', user: 'System (Server)', time: 'قبل 10 دقائق', status: 'Success' },
    { id: '2', action: 'API Health Check', user: 'Admin Monitor', time: 'قبل 4 دقائق', status: 'Healthy (200 OK)' },
    { id: '3', action: 'Model Routing Switched', user: 'Router Engine', time: 'قبل دقيقة', status: 'gemini-3.8-flash' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 bg-[#FAF9FF]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
          <h2 className="font-black text-xl text-[#201B2B]">لوحة الإدارة والمراقبة الآمنة</h2>
        </div>
        <p className="text-xs text-[#777181]">
          إدارة النماذج الافتراضية، ضبط الحصص، مراقبة الطلبات والأخطاء، وسجلات التدقيق (Audit Logs).
        </p>
      </div>

      {/* Admin KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E9E6F0] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#777181]">إجمالي الطلبات اليوم</span>
          <p className="text-2xl font-black text-[#201B2B]">142</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+12% عن الأمس</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E9E6F0] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#777181]">متوسط زمن الاستجابة</span>
          <p className="text-2xl font-black text-[#7652D6]">480ms</p>
          <span className="text-[10px] text-emerald-600 font-semibold">ممتاز</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E9E6F0] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#777181]">نسبة النجاح (Uptime)</span>
          <p className="text-2xl font-black text-emerald-600">99.9%</p>
          <span className="text-[10px] text-[#777181]">بدون انقطاع</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E9E6F0] shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-[#777181]">حالة المفاتيح والأسرار</span>
          <p className="text-sm font-black text-[#5635B5] mt-1 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>محمية بالخادم</span>
          </p>
          <span className="text-[10px] text-[#777181]">لا وصول للعميل</span>
        </div>
      </div>

      {/* Model & Providers Controls */}
      <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-5">
        <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#7652D6]" />
          <span>تحديد النموذج الافتراضي للمنصة</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'gemini-3.8-flash',
              title: 'gemini-3.8-flash',
              desc: 'النموذج المتوازن الافتراضي لمعظم المهام والسرعة العالية',
            },
            {
              id: 'gemini-3.1-flash-lite',
              title: 'gemini-3.1-flash-lite',
              desc: 'النموذج الاقتصادي الأسرع وأقل استهلاكاً للحصة',
            },
            {
              id: 'gemini-4-argon',
              title: 'gemini-4-argon',
              desc: 'النموذج الأقوى للاستدلال والبرمجة المعقدة',
            },
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectModel(m.id as ChatModel)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedModel === m.id
                  ? 'bg-[#EEE8FF] border-[#7652D6] ring-2 ring-[#7652D6]'
                  : 'border-[#E9E6F0] hover:border-[#7652D6] bg-[#FAF9FF]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#201B2B]">{m.title}</span>
                {selectedModel === m.id && (
                  <CheckCircle2 className="w-4 h-4 text-[#7652D6]" />
                )}
              </div>
              <p className="text-[11px] text-[#777181] leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limits & Security */}
      <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7652D6]" />
          <span>إعدادات الحماية ومعدل الطلبات (Rate Limiting)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] space-y-2">
            <label className="text-xs font-bold text-[#201B2B] block">
              الحد الأقصى للطلبات في الدقيقة لكل مستخدم (RPM)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="120"
                value={rateLimitPerMinute}
                onChange={(e) => setRateLimitPerMinute(parseInt(e.target.value, 10))}
                className="flex-1 accent-[#7652D6]"
              />
              <span className="font-bold text-xs text-[#5635B5] px-2.5 py-1 bg-white rounded-lg border border-[#E9E6F0]">
                {rateLimitPerMinute} RPM
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-[#201B2B]">وضع الصيانة (Maintenance Mode)</span>
              <p className="text-[11px] text-[#777181] mt-0.5">
                تعليق استقبال طلبات التوليد الجديدة مؤقتاً
              </p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                maintenanceMode ? 'bg-red-500 text-white' : 'bg-white border border-[#E9E6F0] text-[#777181]'
              }`}
            >
              {maintenanceMode ? 'مفعل' : 'معطل'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#7652D6]" />
          <span>سجل التدقيق والمراقبة (Audit Log)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#E9E6F0] text-[#777181]">
                <th className="py-2.5 px-3">الإجراء</th>
                <th className="py-2.5 px-3">المصدر</th>
                <th className="py-2.5 px-3">الوقت</th>
                <th className="py-2.5 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-[#E9E6F0]/60 hover:bg-[#FAF9FF]">
                  <td className="py-2.5 px-3 font-semibold text-[#201B2B]">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#777181]">{log.user}</td>
                  <td className="py-2.5 px-3 text-[#777181]">{log.time}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
