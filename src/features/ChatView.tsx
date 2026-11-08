import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Square,
  Paperclip,
  Search,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  Trash2,
  ExternalLink,
  Cpu,
  X,
  FileText,
  Image as ImageIcon,
  Mic,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  Conversation,
  ChatMessage,
  ChatModel,
  AttachmentItem,
  GroundingSource,
} from '../types';
import { MarkdownView } from '../components/MarkdownView';

interface ChatViewProps {
  conversation: Conversation;
  onUpdateConversation: (conv: Conversation) => void;
  onClearConversation: (id: string) => void;
  selectedModel: ChatModel;
  onSelectModel: (m: ChatModel) => void;
  onAddCanvasCard?: (title: string, content: string) => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  onUpdateConversation,
  onClearConversation,
  selectedModel,
  onSelectModel,
  onAddCanvasCard,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingSources, setStreamingSources] = useState<GroundingSource[]>([]);
  const [pendingUserMessage, setPendingUserMessage] = useState<ChatMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [enableSearch, setEnableSearch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isRecordingMic, setIsRecordingMic] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Smooth auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, streamingText, pendingUserMessage, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Play Assistant voice via TTS
  const handlePlayVoice = async (text: string, id: string) => {
    if (playingAudioId === id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        setPlayingAudioId(null);
      }
      return;
    }

    try {
      setPlayingAudioId(id);
      const res = await fetch('/api/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 800),
          voiceName: 'Kore',
        }),
      });

      if (!res.ok) throw new Error('فشل توليد الصوت.');
      const data = await res.json();
      if (!data.audioUrl) throw new Error('رابط الصوت غير صالح.');

      if (currentAudioRef.current) currentAudioRef.current.pause();
      const audio = new Audio(data.audioUrl);
      currentAudioRef.current = audio;
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => setPlayingAudioId(null);
      await audio.play();
    } catch (err) {
      console.error('Audio playback error:', err);
      setPlayingAudioId(null);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`الملف ${file.name} كبير جداً (الحد 10MB).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            data: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Speech to Text Quick Input
  const toggleMicInput = async () => {
    if (isRecordingMic) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingMic(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            const res = await fetch('/api/audio/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: reader.result as string }),
            });
            const data = await res.json();
            if (data.transcription) {
              setInputText((prev) => (prev ? `${prev} ${data.transcription}` : data.transcription));
            }
          } catch (e) {
            console.error('Mic transcription error:', e);
          }
        };
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingMic(true);
    } catch (e) {
      console.error('Mic access error:', e);
      alert('تعذر فتح الميكروفون. يرجى التأكد من صلاحيات المتصفح.');
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Commit whatever text was received so far
    if (pendingUserMessage && streamingText) {
      const assistantMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: streamingText,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        sources: streamingSources.length > 0 ? streamingSources : undefined,
        isStreaming: false,
      };

      onUpdateConversation({
        ...conversation,
        updatedAt: new Date().toISOString(),
        messages: [...conversation.messages, pendingUserMessage, assistantMessage],
      });
    }

    setIsGenerating(false);
    setStreamingText('');
    setStreamingSources([]);
    setPendingUserMessage(null);
  };

  // Send Message with Pure Streaming & Zero UI Freezing
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if ((!textToSend && attachments.length === 0) || isGenerating) return;

    setErrorMessage(null);
    setLastFailedPrompt(null);

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    // Set pending local state immediately (causes ZERO synchronous storage bottleneck)
    setPendingUserMessage(userMessage);
    setStreamingText('');
    setStreamingSources([]);
    setIsGenerating(true);
    setInputText('');
    const currentAttachments = [...attachments];
    setAttachments([]);

    // Auto-focus input box
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Safety 35s timeout
    const timeoutId = setTimeout(() => {
      controller.abort('timeout');
    }, 35000);

    try {
      // Build lightweight conversation history (windowed to last 6 messages max)
      const recentHistory = conversation.messages.slice(-6).map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content.slice(0, 1500) : '',
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          messages: recentHistory,
          model: selectedModel,
          enableSearch,
          attachments: currentAttachments,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `خطأ في استجابة الخادم (${res.status})`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let accumulated = '';
      let sources: GroundingSource[] = [];

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.slice(6).trim();
              if (dataStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setStreamingText(accumulated);
                }
                if (parsed.sources && parsed.sources.length > 0) {
                  sources = parsed.sources;
                  setStreamingSources(sources);
                }
              } catch (parseErr) {
                // Ignore transient partial parse
              }
            }
          }
        }
      }

      // Finalize and commit conversation state once!
      const finalAssistantMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: accumulated || 'تم استلام الإجابة.',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        sources: sources.length > 0 ? sources : undefined,
        isStreaming: false,
      };

      const newTitle =
        conversation.messages.length <= 1 && textToSend
          ? textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '')
          : conversation.title;

      onUpdateConversation({
        ...conversation,
        title: newTitle,
        updatedAt: new Date().toISOString(),
        messages: [...conversation.messages, userMessage, finalAssistantMessage],
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err === 'timeout' || err.name === 'TimeoutError';
      const isAbort = err.name === 'AbortError';

      if (!isAbort) {
        console.error('Chat error:', err);
        const errText = isTimeout
          ? 'استغرق الطلب وقتاً طويلاً وتجاوز مهلة الانتظار. يرجى المحاولة مرة أخرى.'
          : err.message || 'حدث خطأ في الاتصال بالنموذج.';
        setErrorMessage(errText);
        setLastFailedPrompt(textToSend);
      }
    } finally {
      setIsGenerating(false);
      setStreamingText('');
      setStreamingSources([]);
      setPendingUserMessage(null);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && !isGenerating) {
      handleSendMessage(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9FF] relative select-none">
      {/* Sleek Minimalist Top Header */}
      <div className="h-12 px-4 bg-white/80 backdrop-blur-md border-b border-[#E9E6F0] flex items-center justify-between shrink-0 z-10">
        {/* Model Switcher Chips */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#777181] hidden sm:inline ml-1">النموذج:</span>
          <div className="flex items-center bg-[#FAF9FF] border border-[#E9E6F0] rounded-xl p-0.5 text-xs">
            <button
              onClick={() => onSelectModel('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-white text-[#5635B5] shadow-xs'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
              title="فائق السرعة وخفيف (افتراضي للمحادثات السريعة)"
            >
              ⚡ سريع (Lite)
            </button>
            <button
              onClick={() => onSelectModel('gemini-3.8-flash')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-white text-[#5635B5] shadow-xs'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
              title="متوازن ومناسب للمهام العامة"
            >
              متوازن (3.8)
            </button>
            <button
              onClick={() => onSelectModel('gemini-4-argon')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedModel === 'gemini-4-argon'
                  ? 'bg-white text-[#5635B5] shadow-xs'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
              title="تفكير واستدلال برمجي عميق"
            >
              تفكير (Argon)
            </button>
          </div>
        </div>

        {/* Clear Conversation Action */}
        <div className="flex items-center gap-2">
          {conversation.messages.length > 0 && (
            <button
              onClick={() => onClearConversation(conversation.id)}
              className="flex items-center gap-1 text-[11px] text-[#777181] hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              title="مسح سجل المحادثة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مسح</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 select-text">
        {conversation.messages.length === 0 && !pendingUserMessage ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#777181] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#E9E6F0] flex items-center justify-center text-[#7652D6] shadow-xs">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-[#201B2B]">محادثة جديدة مع NOVA AI</h3>
            <p className="text-xs max-w-sm leading-relaxed text-[#777181]">
              اطرح أي سؤال، اطلب كتابة كود، أو أرفق مستنداً للبدء فورياً بأعلى سرعة استجابة.
            </p>
          </div>
        ) : (
          <>
            {/* Committed Messages */}
            {conversation.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 max-w-3xl mx-auto ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
                      isUser
                        ? 'bg-[#201B2B] text-white shadow-xs'
                        : 'bg-gradient-to-tr from-[#7652D6] to-[#5635B5] text-white shadow-sm'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-1.5 max-w-[85%] sm:max-w-[80%]`}>
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        {message.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-[#E9E6F0] text-xs shadow-2xs"
                          >
                            {att.mimeType.startsWith('image/') ? (
                              <img
                                src={att.data}
                                alt={att.name}
                                className="w-8 h-8 object-cover rounded-lg border border-[#E9E6F0]"
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-[#7652D6]" />
                            )}
                            <span className="truncate max-w-[120px] font-medium text-[11px]">
                              {att.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#7652D6] text-white rounded-tr-none shadow-sm'
                          : 'bg-white text-[#201B2B] border border-[#E9E6F0] rounded-tl-none shadow-2xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <MarkdownView content={message.content} />
                      )}
                    </div>

                    {/* Sources */}
                    {!isUser && message.sources && message.sources.length > 0 && (
                      <div className="bg-white/80 border border-[#E9E6F0] rounded-xl p-2 space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-[#5635B5] flex items-center gap-1">
                          <Search className="w-3 h-3" />
                          المصادر المعتمدة:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF9FF] border border-[#E9E6F0] text-[10px] text-[#201B2B] hover:text-[#7652D6] truncate max-w-xs"
                            >
                              <span className="truncate">{s.title || s.uri}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    {!isUser && message.content && (
                      <div className="flex items-center gap-1 text-[#777181] text-xs pt-0.5">
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          className="p-1 rounded-lg hover:bg-white hover:text-[#201B2B] transition-colors"
                          title="نسخ"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handlePlayVoice(message.content, message.id)}
                          className={`p-1 rounded-lg hover:bg-white transition-colors ${
                            playingAudioId === message.id ? 'text-[#7652D6] animate-pulse' : ''
                          }`}
                          title="الاستماع الصوتي"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        {onAddCanvasCard && (
                          <button
                            onClick={() =>
                              onAddCanvasCard(
                                `ملاحظة (${new Date().toLocaleTimeString('ar-EG')})`,
                                message.content
                              )
                            }
                            className="p-1 rounded-lg hover:bg-white hover:text-[#7652D6] transition-colors"
                            title="تصدير إلى مساحة العمل"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-[10px] text-[#777181]/70 mr-1.5 font-mono">
                          {message.model || selectedModel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* In-Flight User Message */}
            {pendingUserMessage && (
              <div className="flex gap-3 max-w-3xl mx-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs bg-[#201B2B] text-white shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 max-w-[85%] sm:max-w-[80%]">
                  {pendingUserMessage.attachments && pendingUserMessage.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {pendingUserMessage.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-[#E9E6F0] text-xs shadow-2xs"
                        >
                          {att.mimeType.startsWith('image/') ? (
                            <img
                              src={att.data}
                              alt={att.name}
                              className="w-8 h-8 object-cover rounded-lg"
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-[#7652D6]" />
                          )}
                          <span className="truncate max-w-[120px] font-medium text-[11px]">
                            {att.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-3.5 rounded-2xl text-sm leading-relaxed bg-[#7652D6] text-white rounded-tr-none shadow-sm">
                    <p className="whitespace-pre-wrap">{pendingUserMessage.content}</p>
                  </div>
                </div>
              </div>
            )}

            {/* In-Flight Assistant Stream & Instant Typing Indicator */}
            {isGenerating && (
              <div className="flex gap-3 max-w-3xl mx-auto flex-row">
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs bg-gradient-to-tr from-[#7652D6] to-[#5635B5] text-white shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="space-y-1.5 max-w-[85%] sm:max-w-[80%]">
                  {streamingText ? (
                    <div className="p-3.5 rounded-2xl text-sm leading-relaxed bg-white text-[#201B2B] border border-[#E9E6F0] rounded-tl-none shadow-2xs">
                      <MarkdownView content={streamingText} />
                      <span className="inline-block w-2 h-4 ml-1 bg-[#7652D6] animate-pulse align-middle" />
                    </div>
                  ) : (
                    /* Instant 3-Dot Typing Indicator */
                    <div className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-2xl bg-white border border-[#E9E6F0] rounded-tl-none shadow-2xs">
                      <span
                        className="w-2 h-2 rounded-full bg-[#7652D6] animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-[#7652D6] animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-[#7652D6] animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                      <span className="text-[11px] text-[#777181] mr-1.5 font-medium">
                        NOVA تكتب الرد...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message & Quick Retry Banner */}
            {errorMessage && (
              <div className="max-w-3xl mx-auto p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
                {lastFailedPrompt && (
                  <button
                    onClick={() => handleSendMessage(lastFailedPrompt)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-red-200 text-red-700 font-bold hover:bg-red-50 shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة المحاولة</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Streamlined Modern Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E9E6F0] shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Pending Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF9FF] border border-[#7652D6]/20 text-xs text-[#201B2B]"
                >
                  {att.mimeType.startsWith('image/') ? (
                    <ImageIcon className="w-3.5 h-3.5 text-[#7652D6]" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-[#7652D6]" />
                  )}
                  <span className="truncate max-w-[130px] font-medium">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded-full hover:bg-red-50 text-[#777181] hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end gap-1.5 bg-[#FAF9FF] rounded-2xl p-1.5 border border-[#E9E6F0] focus-within:border-[#7652D6] focus-within:ring-2 focus-within:ring-[#7652D6]/10 transition-all">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,application/pdf,text/*,audio/*"
              className="hidden"
            />

            {/* Attach */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-[#777181] hover:text-[#7652D6] hover:bg-white transition-colors"
              title="إرفاق ملف أو صورة"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Web Search Toggle */}
            <button
              type="button"
              onClick={() => setEnableSearch(!enableSearch)}
              className={`p-2 rounded-xl transition-all ${
                enableSearch
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-[#777181] hover:text-[#201B2B] hover:bg-white'
              }`}
              title={enableSearch ? 'بحث الويب المباشر مفعّل' : 'تفعيل بحث الويب الحي'}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Voice Dictate */}
            <button
              type="button"
              onClick={toggleMicInput}
              className={`p-2 rounded-xl transition-all ${
                isRecordingMic
                  ? 'bg-red-50 text-red-600 animate-pulse border border-red-200'
                  : 'text-[#777181] hover:text-[#7652D6] hover:bg-white'
              }`}
              title={isRecordingMic ? 'إيقاف التسجيل' : 'إملاء صوتي بالميكروفون'}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="اكتب رسالتك لـ NOVA... (Enter للإرسال)"
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none max-h-32 p-2 text-sm text-[#201B2B] placeholder:text-[#777181] focus:outline-none leading-relaxed"
            />

            {/* Send / Stop */}
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-xs transition-colors shrink-0"
                title="إيقاف التوليد"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && attachments.length === 0}
                className="p-2.5 rounded-xl bg-gradient-to-tr from-[#7652D6] to-[#5635B5] text-white hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs shrink-0"
                title="إرسال"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
