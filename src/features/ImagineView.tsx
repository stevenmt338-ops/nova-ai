import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Sliders,
  Layers,
  Wand2,
  Trash2,
  Maximize2,
  RefreshCw,
  Info,
  Clock,
  Check,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';
import { GeneratedImage, LibraryItem } from '../types';

interface ImagineViewProps {
  images: GeneratedImage[];
  onAddImage: (img: GeneratedImage) => void;
  onSaveToLibrary: (item: LibraryItem) => void;
}

export const ImagineView: React.FC<ImagineViewProps> = ({
  images,
  onAddImage,
  onSaveToLibrary,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('cinematic');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const stylePresets = [
    { id: 'cinematic', label: 'سينمائي', desc: 'إضاءة درامية وأبعاد واقعية' },
    { id: 'photorealistic', label: 'واقعي فائق', desc: 'تفاصيل استوديو احترافية' },
    { id: 'scifi', label: 'خيال علمي', desc: 'نيون ومستقبل إلكتروني' },
    { id: 'artistic', label: 'لوحة فنية', desc: 'ألوان زيتية رقمية نابضة' },
    { id: 'anime', label: 'أنيمي حديث', desc: 'رسوم كرتونية يابانية نقية' },
    { id: '3d', label: 'ثلاثي الأبعاد', desc: 'مجسمات ثلاثية الأبعاد لطيفة' },
    { id: 'none', label: 'طبيعي بدون فلتر', desc: 'الوصف كما كتبته تماماً' },
  ];

  const aspectRatios = [
    { id: '1:1', label: 'مربع (1:1)', icon: 'w-6 h-6' },
    { id: '16:9', label: 'عريض (16:9)', icon: 'w-8 h-4.5' },
    { id: '9:16', label: 'قصص (9:16)', icon: 'w-4.5 h-8' },
    { id: '4:3', label: 'شاشة (4:3)', icon: 'w-7 h-5' },
    { id: '3:4', label: 'بورتريه (3:4)', icon: 'w-5 h-7' },
  ];

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          style,
          quality,
          referenceImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'تعذر توليد الصورة.');
      }

      if (!data.imageUrl) {
        throw new Error('لم يرجع الخادم رابط صورة صحيح.');
      }

      const newImage: GeneratedImage = {
        id: `img_${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt,
        aspectRatio: data.aspectRatio || aspectRatio,
        model: data.model || 'gemini-3.1-flash-lite-image',
        style,
        createdAt: new Date().toISOString(),
      };

      onAddImage(newImage);
      setPreviewImage(newImage);
    } catch (err: any) {
      console.error('Image gen error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بالنموذج.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.download = `nova-image-${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveLibrary = (img: GeneratedImage) => {
    onSaveToLibrary({
      id: `lib_${img.id}`,
      title: img.prompt.slice(0, 30),
      category: 'image',
      url: img.url,
      createdAt: img.createdAt,
    });
    setSavedSuccessId(img.id);
    setTimeout(() => setSavedSuccessId(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#FAF9FF]">
      {/* Left (or Right in RTL): Settings & Form Panel */}
      <div className="w-full md:w-96 bg-white border-l border-[#E9E6F0] p-5 overflow-y-auto shrink-0 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
            <h2 className="font-extrabold text-base text-[#201B2B]">استوديو الصور التوليدي</h2>
          </div>
          <p className="text-xs text-[#777181]">
            توليد صور فائقة الجودة وتعديل الصور المرفوعة باستخدام نماذج الذكاء الاصطناعي البصرية.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201B2B] flex items-center justify-between">
              <span>وصف الصورة (Prompt)</span>
              <span className="text-[10px] text-[#7652D6] font-normal">بالعربية أو الإنجليزية</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="صف المشهد بدقة: مثل 'رائد فضاء عربي يكتشف واحة كريستالية على كوكب المريخ بأسلوب سينمائي'..."
              rows={4}
              className="w-full p-3 text-xs rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] text-[#201B2B] placeholder:text-[#777181] focus:outline-none focus:border-[#7652D6] focus:ring-2 focus:ring-[#7652D6]/10 resize-none"
            />
          </div>

          {/* Reference Image (Image-to-Image) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201B2B] flex items-center justify-between">
              <span>صورة مرجعية (اختياري)</span>
              {referenceImage && (
                <button
                  type="button"
                  onClick={() => setReferenceImage(null)}
                  className="text-[10px] text-red-500 hover:underline"
                >
                  إزالة
                </button>
              )}
            </label>

            {referenceImage ? (
              <div className="relative rounded-xl overflow-hidden border border-[#7652D6]/30 h-24">
                <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                  تم إرفاق الصورة
                </span>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#E9E6F0] hover:border-[#7652D6] rounded-2xl cursor-pointer bg-[#FAF9FF] text-center transition-colors">
                <UploadCloud className="w-5 h-5 text-[#7652D6] mb-1" />
                <span className="text-[11px] font-semibold text-[#201B2B]">
                  انقر لرفع صورة للتعديل
                </span>
                <span className="text-[9px] text-[#777181]">Image-to-Image أو إعادة التشكيل</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleRefImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201B2B]">نسبة الأبعاد</label>
            <div className="grid grid-cols-3 gap-1.5">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                    aspectRatio === ratio.id
                      ? 'bg-[#EEE8FF] text-[#5635B5] border-[#7652D6] shadow-2xs'
                      : 'bg-[#FAF9FF] text-[#777181] border-[#E9E6F0] hover:text-[#201B2B]'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#201B2B]">الأسلوب البصري</label>
            <div className="grid grid-cols-2 gap-1.5">
              {stylePresets.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStyle(st.id)}
                  className={`p-2 text-right rounded-xl border text-xs transition-all ${
                    style === st.id
                      ? 'bg-[#EEE8FF] text-[#5635B5] border-[#7652D6] font-bold shadow-2xs'
                      : 'bg-[#FAF9FF] text-[#777181] border-[#E9E6F0] hover:text-[#201B2B]'
                  }`}
                >
                  <p className="font-semibold">{st.label}</p>
                  <p className="text-[10px] opacity-75 truncate">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold">فشل التوليد: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-sm shadow-[0_4px_14px_rgba(118,82,214,0.35)] hover:brightness-105 active:scale-98 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري معالجة وتوليد الصورة...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>توليد الصورة الآن</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main Content & Gallery Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Active / Current Preview */}
        {previewImage ? (
          <div className="bg-white rounded-3xl p-4 border border-[#E9E6F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5635B5] bg-[#EEE8FF] px-2.5 py-1 rounded-full">
                النتيجة الأخيرة
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewImage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E9E6F0] hover:border-[#7652D6] text-xs font-semibold text-[#201B2B] shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل</span>
                </button>
                <button
                  onClick={() => handleSaveLibrary(previewImage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7652D6] text-white text-xs font-semibold shadow-xs"
                >
                  {savedSuccessId === previewImage.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم الحفظ</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>حفظ للمكتبة</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative max-h-[500px] overflow-hidden rounded-2xl bg-[#151221] flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.prompt}
                className="max-h-[500px] w-auto object-contain mx-auto rounded-xl"
              />
            </div>

            <div className="text-xs text-[#777181] space-y-1">
              <p className="font-bold text-[#201B2B]">{previewImage.prompt}</p>
              <div className="flex items-center gap-3 text-[11px]">
                <span>النموذج: {previewImage.model}</span>
                <span>الأبعاد: {previewImage.aspectRatio}</span>
                <span>الأسلوب: {previewImage.style}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 rounded-3xl border-2 border-dashed border-[#E9E6F0] flex flex-col items-center justify-center text-center p-6 text-[#777181] bg-white/50">
            <ImageIcon className="w-12 h-12 text-[#7652D6]/40 mb-2" />
            <h3 className="font-bold text-sm text-[#201B2B]">استوديو الصور جاهز للإبداع</h3>
            <p className="text-xs max-w-sm mt-1">
              اكتب وصفاً في اللوحة الجانبية واضغط على توليد لرؤية النتيجة هنا مباشرة.
            </p>
          </div>
        )}

        {/* Gallery History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#201B2B]">سجل الصور المنشأة ({images.length})</h3>
            <span className="text-xs text-[#777181]">محفوظة تلقائياً في جلستك</span>
          </div>

          {images.length === 0 ? (
            <p className="text-xs text-[#777181]">لم يتم إنشاء صور بعد في هذا المتصفح.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setPreviewImage(img)}
                  className="group relative rounded-2xl overflow-hidden border border-[#E9E6F0] bg-white cursor-pointer shadow-2xs hover:shadow-md hover:border-[#7652D6] transition-all aspect-square"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white text-[11px]">
                    <p className="font-medium truncate">{img.prompt}</p>
                    <span className="text-[9px] opacity-75">{img.aspectRatio}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
