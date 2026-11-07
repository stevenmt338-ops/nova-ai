export type ViewMode =
  | 'home'
  | 'chat'
  | 'imagine'
  | 'motion'
  | 'voice'
  | 'search'
  | 'team'
  | 'canvas'
  | 'studio'
  | 'library'
  | 'projects'
  | 'memory'
  | 'status'
  | 'admin'
  | 'settings'
  | 'terms';

export type ChatModel = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';

export type ThinkingLevelOption = 'BALANCED' | 'HIGH' | 'LOW';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: string; // Base64 data URL
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  sources?: GroundingSource[];
  attachments?: AttachmentItem[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: ChatModel;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  model: string;
  style: string;
  createdAt: string;
}

export interface StoryboardScene {
  number: number;
  duration: string;
  visualPrompt: string;
  cameraMovement: string;
  audioPrompt: string;
}

export interface VideoProject {
  id: string;
  idea: string;
  aspectRatio: string;
  duration: string;
  cameraMotion: string;
  storyboard: string;
  status: 'draft' | 'ready' | 'rendering';
  createdAt: string;
}

export interface AudioItem {
  id: string;
  type: 'stt' | 'tts';
  text: string;
  audioUrl?: string;
  voiceName?: string;
  timestamp: string;
  duration?: string;
}

export interface CanvasCard {
  id: string;
  type: 'note' | 'ai_response' | 'image' | 'code' | 'task';
  title: string;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  mediaUrl?: string;
}

export interface CanvasConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

export interface CodeProject {
  id: string;
  title: string;
  prompt: string;
  htmlCode: string;
  updatedAt: string;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'project' | 'profile' | 'style';
  content: string;
  createdAt: string;
  active: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  category: 'chat' | 'image' | 'video' | 'audio' | 'document' | 'code';
  url?: string;
  text?: string;
  createdAt: string;
  size?: string;
}

export interface UserProject {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  status: 'active' | 'completed' | 'archived';
}
