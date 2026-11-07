import {
  Conversation,
  GeneratedImage,
  VideoProject,
  AudioItem,
  CanvasCard,
  CanvasConnection,
  CodeProject,
  MemoryItem,
  LibraryItem,
  UserProject,
} from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'nova_conversations',
  CURRENT_CONV_ID: 'nova_current_conv_id',
  IMAGES: 'nova_images',
  VIDEOS: 'nova_videos',
  AUDIO_ITEMS: 'nova_audio_items',
  CANVAS_CARDS: 'nova_canvas_cards',
  CANVAS_CONNECTIONS: 'nova_canvas_connections',
  CODE_PROJECTS: 'nova_code_projects',
  MEMORIES: 'nova_memories',
  MEMORY_ENABLED: 'nova_memory_enabled',
  LIBRARY_ITEMS: 'nova_library_items',
  PROJECTS: 'nova_projects',
  SETTINGS: 'nova_settings',
};

// Safe JSON parser
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving storage key ${key}:`, e);
  }
}

// Initial Sample Conversations
const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_welcome',
    title: 'مرحباً بك في NOVA AI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model: 'gemini-3.8-flash',
    pinned: true,
    messages: [
      {
        id: 'msg_welcome_ai',
        role: 'assistant',
        content: `أهلاً بك في **NOVA AI**! 🚀
أنا مساعدك الذكي المتكامل ومتعدد الوسائط.

ما الذي يمكنني مساعدتك به اليوم؟
- 💬 **محادثة ذكية فائقة**: كتابة، تحليل، استنتاج وبرمجة.
- 🎨 **NOVA IMAGINE**: توليد وتعديل الصور بأعلى دقة ونسب أبعاد مختلفة.
- 🎬 **NOVA MOTION**: ابتكار سيناريوهات ومسارات حركة الفيديو واستوديو الإخراج.
- 🎙️ **NOVA VOICE**: تفريغ صوتي فوري وتوليد أصوات طبيعية ناطقة بالعربية.
- 🔍 **البحث والبحث العميق**: استقصاء الويب بمصادر حقيقية وموثوقة.
- 🧑‍💻 **NOVA STUDIO**: برمجة وتصميم تطبيقات الويب مع معاينة حية فورية!
- 🧩 **NOVA TEAM**: فريق من 6 وكلاء ذكاء اصطناعي يتعاونون لإنجاز أهدافك المعقدة.

كيف نبدأ رحلتنا اليوم؟`,
        timestamp: new Date().toISOString(),
      },
    ],
  },
];

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_1',
    category: 'preference',
    content: 'يفضل الشرح المنظم مع نقاط رئيسية وأمثلة عملية واضحة.',
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'mem_2',
    category: 'style',
    content: 'التواصل باللغة العربية الفصحى الراقية مع استخدام المصطلحات التقنية بدقة.',
    createdAt: new Date().toISOString(),
    active: true,
  },
];

const DEFAULT_CANVAS_CARDS: CanvasCard[] = [
  {
    id: 'c1',
    type: 'note',
    title: 'خارطة طريق NOVA AI',
    content: 'بناء المنصة الشاملة: Brain + Imagine + Motion + Voice + Search + Studio.',
    x: 60,
    y: 80,
    width: 280,
    color: '#FAF9FF',
  },
  {
    id: 'c2',
    type: 'task',
    title: 'أولويات الإطلاق',
    content: '✅ محرك البحث الموثوق\n✅ توليد الصور الحقيقي\n✅ مساحة العمل التعاونية',
    x: 400,
    y: 90,
    width: 260,
    color: '#EEE8FF',
  },
  {
    id: 'c3',
    type: 'ai_response',
    title: 'فكرة تطبيق الأسبوع',
    content: 'مساعد إدارة العقود الذكية بالاعتماد على التحليل متعدد الوسائط والـ OCR.',
    x: 200,
    y: 320,
    width: 320,
    color: '#FFFFFF',
  },
];

const DEFAULT_CANVAS_CONNECTIONS: CanvasConnection[] = [
  { id: 'conn_1', fromId: 'c1', toId: 'c2', label: 'تنفيذ المهام' },
  { id: 'conn_2', fromId: 'c1', toId: 'c3', label: 'ابتكار الحلول' },
];

export const storage = {
  // Conversations
  getConversations: (): Conversation[] => safeGet(STORAGE_KEYS.CONVERSATIONS, DEFAULT_CONVERSATIONS),
  saveConversations: (convs: Conversation[]) => safeSet(STORAGE_KEYS.CONVERSATIONS, convs),
  getCurrentConvId: (): string => safeGet(STORAGE_KEYS.CURRENT_CONV_ID, 'conv_welcome'),
  setCurrentConvId: (id: string) => safeSet(STORAGE_KEYS.CURRENT_CONV_ID, id),

  // Images
  getImages: (): GeneratedImage[] => safeGet(STORAGE_KEYS.IMAGES, []),
  saveImages: (images: GeneratedImage[]) => safeSet(STORAGE_KEYS.IMAGES, images),
  addImage: (img: GeneratedImage) => {
    const existing = safeGet<GeneratedImage[]>(STORAGE_KEYS.IMAGES, []);
    safeSet(STORAGE_KEYS.IMAGES, [img, ...existing]);
  },

  // Videos
  getVideos: (): VideoProject[] => safeGet(STORAGE_KEYS.VIDEOS, []),
  saveVideos: (videos: VideoProject[]) => safeSet(STORAGE_KEYS.VIDEOS, videos),
  addVideo: (video: VideoProject) => {
    const existing = safeGet<VideoProject[]>(STORAGE_KEYS.VIDEOS, []);
    safeSet(STORAGE_KEYS.VIDEOS, [video, ...existing]);
  },

  // Audio Items
  getAudioItems: (): AudioItem[] => safeGet(STORAGE_KEYS.AUDIO_ITEMS, []),
  saveAudioItems: (items: AudioItem[]) => safeSet(STORAGE_KEYS.AUDIO_ITEMS, items),
  addAudioItem: (item: AudioItem) => {
    const existing = safeGet<AudioItem[]>(STORAGE_KEYS.AUDIO_ITEMS, []);
    safeSet(STORAGE_KEYS.AUDIO_ITEMS, [item, ...existing]);
  },

  // Canvas
  getCanvasCards: (): CanvasCard[] => safeGet(STORAGE_KEYS.CANVAS_CARDS, DEFAULT_CANVAS_CARDS),
  saveCanvasCards: (cards: CanvasCard[]) => safeSet(STORAGE_KEYS.CANVAS_CARDS, cards),
  getCanvasConnections: (): CanvasConnection[] => safeGet(STORAGE_KEYS.CANVAS_CONNECTIONS, DEFAULT_CANVAS_CONNECTIONS),
  saveCanvasConnections: (conns: CanvasConnection[]) => safeSet(STORAGE_KEYS.CANVAS_CONNECTIONS, conns),

  // Studio Code Projects
  getCodeProjects: (): CodeProject[] => safeGet(STORAGE_KEYS.CODE_PROJECTS, []),
  saveCodeProjects: (projects: CodeProject[]) => safeSet(STORAGE_KEYS.CODE_PROJECTS, projects),

  // Memories
  getMemories: (): MemoryItem[] => safeGet(STORAGE_KEYS.MEMORIES, DEFAULT_MEMORIES),
  saveMemories: (memories: MemoryItem[]) => safeSet(STORAGE_KEYS.MEMORIES, memories),
  isMemoryEnabled: (): boolean => safeGet(STORAGE_KEYS.MEMORY_ENABLED, true),
  setMemoryEnabled: (enabled: boolean) => safeSet(STORAGE_KEYS.MEMORY_ENABLED, enabled),

  // Library
  getLibraryItems: (): LibraryItem[] => safeGet(STORAGE_KEYS.LIBRARY_ITEMS, []),
  saveLibraryItems: (items: LibraryItem[]) => safeSet(STORAGE_KEYS.LIBRARY_ITEMS, items),
  addToLibrary: (item: LibraryItem) => {
    const existing = safeGet<LibraryItem[]>(STORAGE_KEYS.LIBRARY_ITEMS, []);
    safeSet(STORAGE_KEYS.LIBRARY_ITEMS, [item, ...existing]);
  },

  // Projects
  getProjects: (): UserProject[] => safeGet(STORAGE_KEYS.PROJECTS, [
    {
      id: 'proj_1',
      title: 'إطلاق هوية NOVA AI',
      description: 'تصميم وبناء الأصول البصرية ومحتوى الحملة التسويقية.',
      category: 'تسويق وهوية',
      tags: ['تصميم', 'فيديو', 'محتوى'],
      createdAt: new Date().toISOString(),
      status: 'active',
    },
    {
      id: 'proj_2',
      title: 'بحث السوق وتحليل المنافسين',
      description: 'استقصاء شامل للحلول السحابية وتقنيات الوكلاء المتعددين.',
      category: 'بحث وتحليل',
      tags: ['بحث عميق', 'تقرير'],
      createdAt: new Date().toISOString(),
      status: 'active',
    },
  ]),
  saveProjects: (projects: UserProject[]) => safeSet(STORAGE_KEYS.PROJECTS, projects),
};
