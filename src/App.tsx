/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ViewMode,
  ChatModel,
  Conversation,
  GeneratedImage,
  VideoProject,
  AudioItem,
  CanvasCard,
  CanvasConnection,
  UserProject,
  MemoryItem,
  LibraryItem,
} from './types';
import { storage } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';

import { HomeView } from './features/HomeView';
import { ChatView } from './features/ChatView';
import { ImagineView } from './features/ImagineView';
import { MotionView } from './features/MotionView';
import { VoiceView } from './features/VoiceView';
import { SearchView } from './features/SearchView';
import { TeamView } from './features/TeamView';
import { CanvasView } from './features/CanvasView';
import { StudioView } from './features/StudioView';
import { LibraryView } from './features/LibraryView';
import { ProjectsView } from './features/ProjectsView';
import { MemoryView } from './features/MemoryView';
import { StatusView } from './features/StatusView';
import { AdminView } from './features/AdminView';
import { SettingsView } from './features/SettingsView';
import { TermsView } from './features/TermsView';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Model & Server Health State
  const [selectedModel, setSelectedModel] = useState<ChatModel>('gemini-3.1-flash-lite');
  const [serverOnline, setServerOnline] = useState(true);

  // Persistence State
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    storage.getConversations()
  );
  const [currentConvId, setCurrentConvId] = useState<string>(() =>
    storage.getCurrentConvId()
  );
  const [images, setImages] = useState<GeneratedImage[]>(() => storage.getImages());
  const [videos, setVideos] = useState<VideoProject[]>(() => storage.getVideos());
  const [audioItems, setAudioItems] = useState<AudioItem[]>(() => storage.getAudioItems());
  const [canvasCards, setCanvasCards] = useState<CanvasCard[]>(() => storage.getCanvasCards());
  const [canvasConnections, setCanvasConnections] = useState<CanvasConnection[]>(() =>
    storage.getCanvasConnections()
  );
  const [projects, setProjects] = useState<UserProject[]>(() => storage.getProjects());
  const [memories, setMemories] = useState<MemoryItem[]>(() => storage.getMemories());
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(() => storage.isMemoryEnabled());
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() =>
    storage.getLibraryItems()
  );

  // Ping Server Health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setServerOnline(true);
        } else {
          setServerOnline(false);
        }
      } catch (e) {
        setServerOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Save changes to storage
  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    storage.setCurrentConvId(currentConvId);
  }, [currentConvId]);

  useEffect(() => {
    storage.saveImages(images);
  }, [images]);

  useEffect(() => {
    storage.saveVideos(videos);
  }, [videos]);

  useEffect(() => {
    storage.saveAudioItems(audioItems);
  }, [audioItems]);

  useEffect(() => {
    storage.saveCanvasCards(canvasCards);
  }, [canvasCards]);

  useEffect(() => {
    storage.saveCanvasConnections(canvasConnections);
  }, [canvasConnections]);

  useEffect(() => {
    storage.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    storage.saveMemories(memories);
  }, [memories]);

  useEffect(() => {
    storage.setMemoryEnabled(memoryEnabled);
  }, [memoryEnabled]);

  useEffect(() => {
    storage.saveLibraryItems(libraryItems);
  }, [libraryItems]);

  // Current Active Conversation
  const activeConversation =
    conversations.find((c) => c.id === currentConvId) ||
    conversations[0] || {
      id: 'conv_fallback',
      title: 'محادثة جديدة',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: selectedModel,
      messages: [],
    };

  // Conversation Handlers
  const handleNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'محادثة جديدة',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: selectedModel,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConvId(newId);
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleDeleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (currentConvId === id) {
      if (filtered.length > 0) {
        setCurrentConvId(filtered[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  const handleClearConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, messages: [] } : c))
    );
  };

  const [quickPromptToRun, setQuickPromptToRun] = useState<string | null>(null);

  // Quick Prompt from Home
  const handleQuickPrompt = (promptText: string, targetView: ViewMode = 'chat') => {
    handleNewConversation();
    setQuickPromptToRun(promptText);
    setCurrentView(targetView);
  };

  // Add Card to Canvas from other features
  const handleAddCanvasCard = (title: string, content: string) => {
    const newCard: CanvasCard = {
      id: `card_${Date.now()}`,
      type: 'ai_response',
      title,
      content,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 300,
      color: '#FFFFFF',
    };
    setCanvasCards((prev) => [...prev, newCard]);
    setCurrentView('canvas');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9FF] text-[#201B2B]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        conversations={conversations}
        currentConvId={currentConvId}
        onSelectConversation={(id) => setCurrentConvId(id)}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header
          currentView={currentView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          selectedModel={selectedModel}
          onSelectModel={(m) => setSelectedModel(m)}
          onNewChat={handleNewConversation}
          serverOnline={serverOnline}
        />

        {/* View Routing with ErrorBoundary */}
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative">
          <ErrorBoundary>
          {currentView === 'home' && (
            <HomeView
              onSelectView={(v) => setCurrentView(v)}
              onQuickPrompt={handleQuickPrompt}
              selectedModel={selectedModel}
            />
          )}

          {currentView === 'chat' && (
            <ChatView
              key={activeConversation.id}
              conversation={activeConversation}
              onUpdateConversation={handleUpdateConversation}
              onClearConversation={handleClearConversation}
              selectedModel={selectedModel}
              onSelectModel={(m) => setSelectedModel(m)}
              onAddCanvasCard={handleAddCanvasCard}
              initialPrompt={quickPromptToRun}
              onClearInitialPrompt={() => setQuickPromptToRun(null)}
            />
          )}

          {currentView === 'imagine' && (
            <ImagineView
              images={images}
              onAddImage={(img) => setImages((prev) => [img, ...prev])}
              onSaveToLibrary={(item) => setLibraryItems((prev) => [item, ...prev])}
            />
          )}

          {currentView === 'motion' && (
            <MotionView
              videos={videos}
              onAddVideo={(vid) => setVideos((prev) => [vid, ...prev])}
            />
          )}

          {currentView === 'voice' && (
            <VoiceView
              audioItems={audioItems}
              onAddAudioItem={(item) => setAudioItems((prev) => [item, ...prev])}
            />
          )}

          {currentView === 'search' && <SearchView />}

          {currentView === 'team' && <TeamView />}

          {currentView === 'canvas' && (
            <CanvasView
              cards={canvasCards}
              connections={canvasConnections}
              onUpdateCards={setCanvasCards}
              onUpdateConnections={setCanvasConnections}
            />
          )}

          {currentView === 'studio' && (
            <StudioView
              onSaveToLibrary={(item) => setLibraryItems((prev) => [item, ...prev])}
            />
          )}

          {currentView === 'library' && (
            <LibraryView
              items={libraryItems}
              onDeleteItem={(id) =>
                setLibraryItems((prev) => prev.filter((i) => i.id !== id))
              }
              onAddItem={(item) => setLibraryItems((prev) => [item, ...prev])}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              onAddProject={(p) => setProjects((prev) => [p, ...prev])}
              onDeleteProject={(id) =>
                setProjects((prev) => prev.filter((p) => p.id !== id))
              }
              onNavigateToView={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'memory' && (
            <MemoryView
              memories={memories}
              memoryEnabled={memoryEnabled}
              onToggleMemory={setMemoryEnabled}
              onAddMemory={(m) => setMemories((prev) => [m, ...prev])}
              onDeleteMemory={(id) =>
                setMemories((prev) => prev.filter((m) => m.id !== id))
              }
            />
          )}

          {currentView === 'status' && <StatusView />}

          {currentView === 'admin' && (
            <AdminView
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          )}

          {currentView === 'terms' && <TermsView />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
