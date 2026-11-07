import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  X,
  FileText,
  Image as ImageIcon,
  Mic,
  SlidersHorizontal,
  ChevronDown,
  Info,
  CornerDownLeft,
} from 'lucide-react';
import {
  Conversation,
  ChatMessage,
  ChatModel,
  AttachmentItem,
  ThinkingLevelOption,
} from '../types';
import { MarkdownView } from '../components/MarkdownView';

interface ChatViewProps {
  conversation: Conversation;
  onUpdateConversation: (conv: Conversation) => void;
  onClearConversation: (id: string) => void;
  selectedModel: ChatModel;
  onSelectModel: (m: ChatModel) => void;
  onAddCanvasCard?: (title: string, content: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  onUpdateConversation,
  onClearConversation,
  selectedModel,
  onSelectModel,
  onAddCanvasCard,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [enableSearch, setEnableSearch] = useState(false);
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevelOption>('BALANCED');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isGenerating]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Play Assistant response via TTS
  const handlePlayVoice = async (text: string, id: string) => {
    if (playingAudioId === id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        setPlayingAudioId(null);
      }
      return;
    }

    try {
      setAudioError(null);
      setPlayingAudioId(id);

      const res = await fetch('/api/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 800), // Clean slice for TTS
          voiceName: 'Kore',
        }),
      });

      if (!res.ok) {
        throw new Error('فشل توليد الصوت من الخادم.');
      }

      const data = await res.json();
      if (!data.audioUrl) {
        throw new Error('بيانات الصوت غير صالحة.');
      }

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      const audio = new Audio(data.audioUrl);
      currentAudioRef.current = audio;
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => {
        setPlayingAudioId(null);
        setAudioError('تعذر تشغيل الصوت.');
      };
      await audio.play();
    } catch (err: any) {
      console.error('Audio playback error:', err);
      setPlayingAudioId(null);
      setAudioError(err.message || 'تعذر تشغيل الصوت');
    }
  };

  // Handle file uploads (images, docs, txt, audio)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Check file size (limit to 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        alert(`الملف ${file.name} يتجاوز الحد المسموح (10MB).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            data: result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if ((!content && attachments.length === 0) || isGenerating) return;

    const userMessageId = `msg_user_${Date.now()}`;
    const assistantMessageId = `msg_ai_${Date.now() + 1}`;

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      model: selectedModel,
      isStreaming: true,
    };

    // Update conversation state with user message and pending assistant message
    const updatedMessages = [...conversation.messages, userMessage, initialAssistantMessage];
    const newTitle =
      conversation.messages.length <= 1 && content
        ? content.slice(0, 32) + (content.length > 32 ? '...' : '')
        : conversation.title;

    onUpdateConversation({
      ...conversation,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    });

    setInputText('');
    setAttachments([]);
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build messages history payload
      const historyPayload = conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          messages: historyPayload,
          model: selectedModel,
          enableSearch,
          thinkingLevel: selectedModel === 'gemini-3.8-flash' ? thinkingLevel : undefined,
          attachments: userMessage.attachments,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `خطأ في الخادم (${res.status})`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let accumulatedText = '';
      let collectedSources: any[] = [];

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.text) {
                  accumulatedText += parsed.text;
                }
                if (parsed.sources && parsed.sources.length > 0) {
                  collectedSources = parsed.sources;
                }

                // Update assistant message state
                onUpdateConversation({
                  ...conversation,
                  title: newTitle,
                  updatedAt: new Date().toISOString(),
                  messages: [
                    ...conversation.messages,
                    userMessage,
                    {
                      id: assistantMessageId,
                      role: 'assistant',
                      content: accumulatedText,
                      timestamp: new Date().toISOString(),
                      model: selectedModel,
                      sources: collectedSources.length > 0 ? collectedSources : undefined,
                      isStreaming: true,
                    },
                  ],
                });
              } catch (e) {
                // Ignore parse errors on partial frames
              }
            }
          }
        }
      }

      // Finalize message
      onUpdateConversation({
        ...conversation,
        title: newTitle,
        updatedAt: new Date().toISOString(),
        messages: [
          ...conversation.messages,
          userMessage,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: accumulatedText || 'تم استلام الإجابة.',
            timestamp: new Date().toISOString(),
            model: selectedModel,
            sources: collectedSources.length > 0 ? collectedSources : undefined,
            isStreaming: false,
          },
        ],
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted by user.');
      } else {
        console.error('Chat error:', err);
        onUpdateConversation({
          ...conversation,
          messages: [
            ...conversation.messages,
            userMessage,
            {
              id: assistantMessageId,
              role: 'assistant',
              content: `⚠️ تعذر إكمال الإجابة: ${err.message || 'حدث خطأ غير متوقع'}.`,
              timestamp: new Date().toISOString(),
              model: selectedModel,
              isStreaming: false,
            },
          ],
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9FF] relative">
      {/* Floating Control Toolbar */}
      <div className="px-4 py-2 border-b border-[#E9E6F0] bg-white/70 backdrop-blur-sm flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {/* Web Search Toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all ${
              enableSearch
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                : 'bg-white text-[#777181] border-[#E9E6F0] hover:text-[#201B2B]'
            }`}
            title="تفعيل البحث المباشر في الويب عبر Google Search Grounding"
          >
            <Search className={`w-3.5 h-3.5 ${enableSearch ? 'text-blue-600' : ''}`} />
            <span>بحث الويب الحقيقي</span>
            {enableSearch && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
          </button>

          {/* Thinking Level (Flash / Argon) */}
          <div className="flex items-center gap-1 bg-white border border-[#E9E6F0] rounded-xl px-2 py-1">
            <span className="text-[11px] text-[#777181] font-semibold">مستوى التفكير:</span>
            <button
              onClick={() => setThinkingLevel('BALANCED')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                thinkingLevel === 'BALANCED'
                  ? 'bg-[#EEE8FF] text-[#5635B5] font-bold'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
            >
              متوازن
            </button>
            <button
              onClick={() => setThinkingLevel('HIGH')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                thinkingLevel === 'HIGH'
                  ? 'bg-[#EEE8FF] text-[#5635B5] font-bold'
                  : 'text-[#777181] hover:text-[#201B2B]'
              }`}
              title="أعلى درجات الاستدلال والتفكير المعقد"
            >
              عميق
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onClearConversation(conversation.id)}
            className="flex items-center gap-1 text-[#777181] hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            title="مسح سجل المحادثة"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مسح المحادثة</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#777181] space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-white border border-[#E9E6F0] flex items-center justify-center text-[#7652D6] shadow-md">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#201B2B]">المحادثة فارغة</h3>
            <p className="text-xs max-w-sm leading-relaxed">
              ابدأ بسؤال NOVA AI أو ارفع ملفاً، صورة، أو صوتاً للتحليل الفوري.
            </p>
          </div>
        ) : (
          conversation.messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-4xl mx-auto ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center shadow-xs font-bold text-xs ${
                    isUser
                      ? 'bg-[#201B2B] text-white'
                      : 'bg-gradient-to-tr from-[#7652D6] to-[#5635B5] text-white shadow-[0_2px_8px_rgba(118,82,214,0.3)]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
                  {/* Attachments if any */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      {message.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white border border-[#E9E6F0] text-xs shadow-2xs"
                        >
                          {att.mimeType.startsWith('image/') ? (
                            <img
                              src={att.data}
                              alt={att.name}
                              className="w-10 h-10 object-cover rounded-lg border border-[#E9E6F0]"
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-[#7652D6]" />
                          )}
                          <div className="truncate max-w-[120px]">
                            <p className="font-semibold text-[#201B2B] truncate">{att.name}</p>
                            <p className="text-[10px] text-[#777181]">
                              {(att.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-3xl text-sm ${
                      isUser
                        ? 'bg-[#7652D6] text-white rounded-tr-xs shadow-md shadow-[#7652D6]/10'
                        : 'bg-white text-[#201B2B] border border-[#E9E6F0] rounded-tl-xs shadow-[0_2px_12px_rgb(0,0,0,0.03)]'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    ) : (
                      <>
                        <MarkdownView content={message.content} />
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-[#7652D6] animate-pulse align-middle" />
                        )}
                      </>
                    )}
                  </div>

                  {/* Sources / Grounding Links */}
                  {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="bg-white/80 border border-[#E9E6F0] rounded-2xl p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5635B5]">
                        <Search className="w-3.5 h-3.5" />
                        <span>المصادر المعتمدة في هذا الرد ({message.sources.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF9FF] border border-[#E9E6F0] hover:border-[#7652D6] text-[11px] font-medium text-[#201B2B] hover:text-[#7652D6] transition-colors truncate max-w-xs"
                          >
                            <span className="truncate">{s.title || s.uri}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Action Bar */}
                  {!isUser && !message.isStreaming && message.content && (
                    <div className="flex items-center gap-1 text-xs text-[#777181] pt-0.5">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#201B2B] transition-colors"
                        title="نسخ الإجابة"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* TTS Speak */}
                      <button
                        onClick={() => handlePlayVoice(message.content, message.id)}
                        className={`p-1.5 rounded-lg hover:bg-white transition-colors ${
                          playingAudioId === message.id
                            ? 'text-[#7652D6] bg-purple-50 animate-pulse'
                            : 'hover:text-[#201B2B]'
                        }`}
                        title="الاستماع للإجابة صوتياً"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Add to Canvas */}
                      {onAddCanvasCard && (
                        <button
                          onClick={() =>
                            onAddCanvasCard(
                              `رد NOVA (${new Date().toLocaleTimeString('ar-EG')})`,
                              message.content
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-white hover:text-[#7652D6] transition-colors"
                          title="تصدير إلى مساحة العمل (Canvas)"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className="text-[10px] text-[#777181]/80 mr-2">
                        {message.model || selectedModel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E9E6F0] shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#FAF9FF] border border-[#7652D6]/20 text-xs text-[#201B2B]"
                >
                  {att.mimeType.startsWith('image/') ? (
                    <ImageIcon className="w-3.5 h-3.5 text-[#7652D6]" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-[#7652D6]" />
                  )}
                  <span className="truncate max-w-[150px] font-medium">{att.name}</span>
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

          {/* Form */}
          <div className="flex items-end gap-2 bg-[#FAF9FF] rounded-2xl p-1.5 border border-[#E9E6F0] focus-within:border-[#7652D6] focus-within:ring-2 focus-within:ring-[#7652D6]/10 transition-all">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,application/pdf,text/*,audio/*"
              className="hidden"
            />

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-[#777181] hover:text-[#7652D6] hover:bg-white transition-colors"
              title="إرفاق صورة أو مستند أو صوت"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Textarea */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="اكتب رسالتك لـ NOVA... (Enter للإرسال، Shift+Enter لسطر جديد)"
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none max-h-32 p-2 text-sm text-[#201B2B] placeholder:text-[#777181] focus:outline-none"
            />

            {/* Send or Stop Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-xs"
                title="إيقاف التوليد"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && attachments.length === 0}
                className="p-2.5 rounded-xl bg-gradient-to-tr from-[#7652D6] to-[#5635B5] text-white hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-[0_2px_8px_rgba(118,82,214,0.3)]"
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
