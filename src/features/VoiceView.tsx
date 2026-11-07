import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileAudio,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Info,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AudioItem } from '../types';

interface VoiceViewProps {
  audioItems: AudioItem[];
  onAddAudioItem: (item: AudioItem) => void;
}

export const VoiceView: React.FC<VoiceViewProps> = ({ audioItems, onAddAudioItem }) => {
  const [activeTab, setActiveTab] = useState<'transcribe' | 'tts'>('transcribe');

  // STT State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);

  // TTS State
  const [ttsInput, setTtsInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [voiceStyle, setVoiceStyle] = useState('Clear, natural, professional Arabic speaker');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      setSttError(null);
      setTranscriptionResult('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendAudioForTranscription(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setSttError(
        'تعذر الوصول إلى الميكروفون. يرجى التأكد من منح الإذن للمتصفح لتسجيل الصوت.'
      );
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Send audio Blob to server STT endpoint
  const handleSendAudioForTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    setSttError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const res = await fetch('/api/audio/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Data,
            mimeType: 'audio/webm',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'فشل تفريغ الصوت.');
        }

        const result = data.transcription || 'لم يتم استخراج نص من التسجيل.';
        setTranscriptionResult(result);

        onAddAudioItem({
          id: `stt_${Date.now()}`,
          type: 'stt',
          text: result,
          timestamp: new Date().toISOString(),
          duration: formatTime(recordingDuration),
        });
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      setSttError(err.message || 'حدث خطأ أثناء الاتصال بنموذج التفريغ الصوتي.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Generate TTS Audio
  const handleGenerateTTS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttsInput.trim() || isGeneratingTts) return;

    setIsGeneratingTts(true);
    setTtsError(null);
    setTtsAudioUrl(null);

    try {
      const res = await fetch('/api/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsInput,
          voiceName: selectedVoice,
          style: voiceStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل توليد الصوت.');
      }

      setTtsAudioUrl(data.audioUrl);

      onAddAudioItem({
        id: `tts_${Date.now()}`,
        type: 'tts',
        text: ttsInput,
        audioUrl: data.audioUrl,
        voiceName: selectedVoice,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('TTS error:', err);
      setTtsError(err.message || 'حدث خطأ أثناء تحويل النص إلى كلام.');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Play / Pause generated TTS audio
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const copyTranscription = () => {
    navigator.clipboard.writeText(transcriptionResult);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const voices = [
    { id: 'Kore', name: 'كوري (Kore)', desc: 'صوت هادئ، واضح، ووقور' },
    { id: 'Puck', name: 'بوك (Puck)', desc: 'صوت مفعم بالحيوية والدفء' },
    { id: 'Charon', name: 'تشارون (Charon)', desc: 'صوت عميق ورسمي ومستقر' },
    { id: 'Fenrir', name: 'فنرير (Fenrir)', desc: 'نبرة قوية وحاسمة' },
    { id: 'Zephyr', name: 'زفير (Zephyr)', desc: 'صوت خفيف وسريع' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-[#FAF9FF]">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#7652D6]" />
          <h2 className="font-black text-xl text-[#201B2B]">NOVA VOICE — استوديو الصوت الذكي</h2>
        </div>
        <p className="text-xs text-[#777181]">
          تفريغ التسجيلات الصوتية بدقة عالية (Speech-to-Text)، وتوليد أصوات بشرية ناطقة فائقة النقاء (Text-to-Speech).
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex p-1 rounded-2xl bg-white border border-[#E9E6F0] w-full max-w-md">
        <button
          onClick={() => setActiveTab('transcribe')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'transcribe'
              ? 'bg-[#EEE8FF] text-[#5635B5] shadow-xs'
              : 'text-[#777181] hover:text-[#201B2B]'
          }`}
        >
          تفريغ وتلخيص الصوت (STT)
        </button>
        <button
          onClick={() => setActiveTab('tts')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'tts'
              ? 'bg-[#EEE8FF] text-[#5635B5] shadow-xs'
              : 'text-[#777181] hover:text-[#201B2B]'
          }`}
        >
          تحويل النص إلى كلام (TTS)
        </button>
      </div>

      {/* Tab 1: Transcribe (STT) */}
      {activeTab === 'transcribe' && (
        <div className="space-y-5">
          {/* Recorder Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E6F0] shadow-sm text-center space-y-6">
            <div className="space-y-2">
              <h3 className="font-extrabold text-base text-[#201B2B]">
                {isRecording ? 'جاري التسجيل الآن...' : 'تسجيل صوتي للتفريغ والتحليل'}
              </h3>
              <p className="text-xs text-[#777181] max-w-md mx-auto">
                تحدث بحرية باللغة العربية أو الإنجليزية. سيقوم نموذج gemini-3.5-transcribe بتفريغ الكلام وكتابة ملخص تنفيذي.
              </p>
            </div>

            {/* Timer & Wave Animation */}
            {isRecording ? (
              <div className="space-y-3">
                <div className="text-3xl font-black font-mono text-[#7652D6] animate-pulse">
                  {formatTime(recordingDuration)}
                </div>
                {/* Visualizer Wave */}
                <div className="flex items-center justify-center gap-1.5 h-10">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-full bg-[#7652D6] animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FAF9FF] border border-[#E9E6F0] flex items-center justify-center text-[#7652D6]">
                <Mic className="w-10 h-10" />
              </div>
            )}

            {/* Record / Stop Button */}
            <div>
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/25 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>إيقاف وإرسال للتفريغ</span>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-sm shadow-[0_4px_16px_rgba(118,82,214,0.35)] hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>بدء التسجيل بالميكروفون</span>
                </button>
              )}
            </div>

            {isTranscribing && (
              <div className="flex items-center justify-center gap-2 text-xs text-[#7652D6] font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري تفريغ الصوت وتحليله عبر النموذج...</span>
              </div>
            )}

            {sttError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 text-right">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{sttError}</span>
              </div>
            )}
          </div>

          {/* Transcription Output Card */}
          {transcriptionResult && (
            <div className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7652D6]" />
                  <h4 className="font-extrabold text-sm text-[#201B2B]">نتيجة التفريغ والتحليل</h4>
                </div>
                <button
                  onClick={copyTranscription}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF9FF] border border-[#E9E6F0] hover:border-[#7652D6] text-xs font-semibold text-[#201B2B]"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] text-xs leading-relaxed text-[#201B2B] whitespace-pre-wrap">
                {transcriptionResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Text-to-Speech (TTS) */}
      {activeTab === 'tts' && (
        <div className="space-y-5">
          <form
            onSubmit={handleGenerateTTS}
            className="bg-white rounded-3xl p-6 border border-[#E9E6F0] shadow-sm space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#201B2B]">النص المراد نطقه (TTS)</label>
              <textarea
                value={ttsInput}
                onChange={(e) => setTtsInput(e.target.value)}
                placeholder="اكتب أو الصق النص الذي تود سماعه بأصوات الذكاء الاصطناعي الطبيعية..."
                rows={4}
                className="w-full p-3 text-xs rounded-2xl bg-[#FAF9FF] border border-[#E9E6F0] text-[#201B2B] placeholder:text-[#777181] focus:outline-none focus:border-[#7652D6] resize-none"
              />
            </div>

            {/* Voice Persona Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#201B2B]">شخصية الصوت</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVoice(v.id)}
                    className={`p-3 text-right rounded-2xl border text-xs transition-all ${
                      selectedVoice === v.id
                        ? 'bg-[#EEE8FF] text-[#5635B5] border-[#7652D6] font-bold shadow-2xs'
                        : 'bg-[#FAF9FF] text-[#777181] border-[#E9E6F0] hover:text-[#201B2B]'
                    }`}
                  >
                    <p className="font-bold">{v.name}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {ttsError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
                {ttsError}
              </div>
            )}

            <button
              type="submit"
              disabled={!ttsInput.trim() || isGeneratingTts}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7652D6] to-[#5635B5] text-white font-bold text-sm shadow-[0_4px_14px_rgba(118,82,214,0.35)] hover:brightness-105 active:scale-98 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {isGeneratingTts ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تركيب ونطق الصوت عبر gemini-3.8-flash-lite-tts...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>توليد وتشغيل الصوت</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Audio Player */}
          {ttsAudioUrl && (
            <div className="bg-white rounded-3xl p-5 border border-[#E9E6F0] shadow-sm flex items-center justify-between gap-4">
              <audio
                ref={audioPlayerRef}
                src={ttsAudioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayAudio}
                  className="w-12 h-12 rounded-2xl bg-[#7652D6] text-white flex items-center justify-center shadow-md hover:bg-[#5635B5] transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <h4 className="font-bold text-xs text-[#201B2B]">تسجيل صوتي جاهز</h4>
                  <p className="text-[11px] text-[#777181]">
                    الصوت: {selectedVoice} (WAV 24kHz Unary)
                  </p>
                </div>
              </div>

              <a
                href={ttsAudioUrl}
                download={`nova-speech-${Date.now()}.wav`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF9FF] border border-[#E9E6F0] hover:border-[#7652D6] text-xs font-bold text-[#201B2B]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل WAV</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
