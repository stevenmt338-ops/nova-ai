import React from 'react';
import { ShieldCheck, Lock, FileCheck, Scale, AlertOctagon, HeartHandshake } from 'lucide-react';

export const TermsView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-[#FAF9FF]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
          <h2 className="font-black text-xl text-[#201B2B]">الشروط وسياسة الاستخدام الأخلاقي</h2>
        </div>
        <p className="text-xs text-[#777181]">
          المبادئ التوجيهية، معايير الخصوصية، والشفافية التقنية لمنصة NOVA AI.
        </p>
      </div>

      <div className="space-y-4">
        {/* Transparency Section */}
        <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#7652D6]" />
            <span>1. ميثاق الشفافية التقنية</span>
          </h3>
          <p className="text-xs text-[#777181] leading-relaxed">
            تعمل منصة NOVA AI كطبقة ذكاء اصطناعي موحدة وذكية (AI Router) ترتبط بنماذج معتمدة رسمياً مثل Google Gemini. لا ندّعي امتلاك نموذج تأسيسي خاص، بل نوفر طبقة تكامل وأدوات متقدمة لتسخير أحدث إمكانيات النماذج العالمية في بيئة عربية متكاملة وسلسة.
          </p>
        </div>

        {/* Ethical Boundaries */}
        <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-500" />
            <span>2. ضوابط الاستخدام والحدود الأخلاقية</span>
          </h3>
          <div className="text-xs text-[#777181] leading-relaxed space-y-1.5">
            <p>يُحظر تماماً استخدام المنصة في:</p>
            <ul className="list-disc mr-5 space-y-1">
              <li>توليد أو محاولة تزييف صور أو وسائط حميمية أو غير رضائية أو استهداف خصوصية الأفراد.</li>
              <li>محاولات الاحتيال، الهندسة الاجتماعية، أو نشر برمجيات خبيثة وفيروسات.</li>
              <li>انتهاك حقوق الملكية الفكرية أو التحايل على أنظمة الفوترة وحصص المزودين.</li>
              <li>انتحال صفة هيئات حكومية أو تقديم استشارات طبية وقانونية حاسمة كبديل للمتخصصين.</li>
            </ul>
          </div>
        </div>

        {/* Privacy & Secrets */}
        <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#7652D6]" />
            <span>3. خصوصية البيانات وعزل المفاتيح</span>
          </h3>
          <p className="text-xs text-[#777181] leading-relaxed">
            يتم تخزين مفاتيح API وبيانات الاعتماد في الخادم الخلفي بشكل معزول تماماً، ولا يتم تمريرها أو كشفها لمتصفح العميل أو لسجلات الواجهة الأمامية. لا يتم تدريب النماذج العامة على مدخلاتك الخاصة، ولك الحق الكامل في تصدير أو مسح بياناتك في أي وقت من لوحة الإعدادات.
          </p>
        </div>

        {/* Quotas & Guarantees */}
        <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-[#201B2B] flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#7652D6]" />
            <span>4. الحصص والتوافر</span>
          </h3>
          <p className="text-xs text-[#777181] leading-relaxed">
            نسعى لتقديم تجربة مجانية وسلسة قدر الإمكان بالاعتماد على الحصص الرسمية المجانية للمزودين. النماذج المكثفة كالفيديو ورسم الدقة العالية قد تتطلب مفاتيح فوترة، ويتم توضيح حالة كل خدمة بشفافية في صفحة حالة الخدمات.
          </p>
        </div>
      </div>
    </div>
  );
};
