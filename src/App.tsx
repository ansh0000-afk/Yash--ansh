import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AgentPersona, ChatMessage, ChatSession, Task, KnowledgeNote, 
  AgentSettings, UserProfile, DocumentAttachment, AppLockSettings, CalendarEvent 
} from './types';
import { DEFAULT_PERSONAS } from './data/defaultPersonas';
import { memoryManager } from './lib/memoryManager';
import { apiFetch } from './lib/apiClient';
import { auth, onAuthStateChanged, signInWithPopup, signInWithRedirect, googleProvider } from './lib/firebase';

import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CommerceStudyHubView from './components/CommerceStudyHubView';
import AIWorkspaceToolsView from './components/AIWorkspaceToolsView';
import ChatView from './components/ChatView';
import TaskBoardView from './components/TaskBoardView';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import SettingsModal from './components/SettingsModal';
import BottomNavigation from './components/BottomNavigation';
import AppLockModal from './components/AppLockModal';
import AuthModal from './components/AuthModal';
import VoiceConversationModal from './components/VoiceConversationModal';
import SmartPromptLibraryModal from './components/SmartPromptLibraryModal';
import OnboardingTutorialModal from './components/OnboardingTutorialModal';
import FloatingAssistantWidget from './components/FloatingAssistantWidget';

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Class 12 Accountancy: Partnership Fundamentals',
    description: 'Solve textbook numericals for Profit & Loss Appropriation and Partners Capital Accounts.',
    priority: 'high',
    status: 'in_progress',
    dueDate: 'Today',
    createdAt: new Date().toISOString()
  },
  {
    id: 't-2',
    title: 'Business Studies: Principles of Management Case Studies',
    description: 'Revise Henri Fayol 14 Principles and Taylor Scientific Management techniques.',
    priority: 'medium',
    status: 'todo',
    dueDate: 'Tomorrow',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_NOTES: KnowledgeNote[] = [
  {
    id: 'n-1',
    title: 'Class 12 Commerce Board Exam Master Guide',
    content: `### High-Impact Revision Strategy for Class 12 Commerce
    * **Accountancy**: Daily 3 numericals on partnership fundamentals, reconstitution, and pro-rata share forfeiture[span_0](start_span)[span_0](end_span).
    * **Business Studies**: Practice case studies on Principles of Management and Financial Management[span_1](start_span)[span_1](end_span).
    * **Economics**: Focus on National Income aggregates and demand elasticity diagrams[span_2](start_span)[span_2](end_span).
    * **OCM**: Memorize principles of management with proper headings[span_3](start_span)[span_3](end_span).`,
    category: 'Studies',
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !localStorage.getItem('alpha_onboarding_completed'));
  
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'cal-1',
      title: 'Class 12 Accountancy Partnership Practice',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      category: 'study'
    },
    {
      id: 'cal-2',
      title: 'Macroeconomics National Income Numericals',
      date: new Date().toISOString().split('T')[0],
      time: '17:30',
      category: 'study'
    }
  ]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => memoryManager.getProfile());
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('alpha_splash_shown'));
  
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [screenshotToast, setScreenshotToast] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  
  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    mode: 'unlock-app' | 'unlock-chat' | 'setup-pin' | 'change-pin' | 'test-biometric';
    targetChatId?: string;
    targetChatTitle?: string;
  }>({ isOpen: false, mode: 'unlock-app' });

  const [unlockedSessionIds, setUnlockedSessionIds] = useState<string[]>([]);

  const [personas] = useState<AgentPersona[]>(DEFAULT_PERSONAS);
  const [activePersona, setActivePersona] = useState<AgentPersona>(() => {
    const saved = localStorage.getItem('agent_active_persona_id');
    return DEFAULT_PERSONAS.find(p => p.id === saved) || DEFAULT_PERSONAS[0];
  });

  const [settings, setSettings] = useState<AgentSettings>(() => {
    const saved = localStorage.getItem('agent_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      activePersonaId: activePersona.id,
      enableSearch: true,
      enableVoiceResponse: true,
      preferredLanguage: 'Hinglish',
      voiceSettings: { voiceId: '', rate: 1.0, pitch: 1.0, autoSpeak: false },
      userCustomInstructions: 'Always reply in simple Hinglish step by step for Class 12 Commerce.'
    };
  });

  const DEFAULT_SESSION: ChatSession = {
    id: `session-${Date.now()}`,
    title: 'Welcome to Class 12 Commerce AI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('alpha_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [DEFAULT_SESSION];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('alpha_active_session_id');
    return saved || DEFAULT_SESSION.id;
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || DEFAULT_SESSION;
  const messages = activeSession.messages || [];

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('agent_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  const [notes, setNotes] = useState<KnowledgeNote[]>(() => {
    const saved = localStorage.getItem('agent_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUserProfile(prev => ({
          ...prev,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || prev.name,
          email: firebaseUser.email || prev.email,
          avatar: firebaseUser.photoURL || prev.avatar,
          provider: 'firebase',
          isLoggedIn: true,
          emailVerified: firebaseUser.emailVerified
        }));
      } else {
        setUserProfile(prev => ({ ...prev, isLoggedIn: false }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDirectGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr: any) {
        setAuthError(redirectErr.message || 'Google Sign-In failed.');
      }
    }
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const updateSessionMessages = (newMessages: ChatMessage[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        let newTitle = s.title;
        if (s.title === 'Welcome to Class 12 Commerce AI' || s.title === 'New Conversation') {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? '...' : '');
          }
        }
        return { ...s, title: newTitle, updatedAt: new Date().toISOString(), messages: newMessages };
      }
      return s;
    }));
  };

  const handleSendMessage = async (content: string, attachedImage?: string, attachedDoc?: DocumentAttachment) => {
    let finalContent = content;
    if (attachedDoc && attachedDoc.textContent) {
      finalContent = `${content}\n\n[Attached Document: ${attachedDoc.name} (${attachedDoc.type}, ${attachedDoc.pageCount || 1} pages)]\n\n${attachedDoc.textContent.slice(0, 10000)}`;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      attachedImage,
      attachedDoc,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    updateSessionMessages(updatedMessages);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const apiMessages = updatedMessages.map(m => {
        if (m.id === userMsg.id && attachedDoc) {
          return { ...m, content: finalContent };
        }
        return m;
      });

      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: apiMessages,
          persona: activePersona,
          settings,
          tasks,
          notes,
          userProfile,
          userMemory: memoryManager.getMemories(),
          attachedImage
        })
      });

      if (!res.ok) throw new Error(res.error || 'Agent call failed');

      const data = res.data;
      if (data.toolExecutions && Array.isArray(data.toolExecutions)) {
        for (const tool of data.toolExecutions) {
          if (tool.name === 'create_task') {
            const newTask: Task = {
              id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              title: tool.args.title,
              description: tool.args.description,
              priority: tool.args.priority || 'medium',
              status: 'todo',
              dueDate: tool.args.dueDate,
              createdAt: new Date().toISOString()
            };
            setTasks(prev => [newTask, ...prev]);
          } else if (tool.name === 'save_note') {
            const newNote: KnowledgeNote = {
              id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              title: tool.args.title,
              content: tool.args.content,
              category: 'Studies',
              createdAt: new Date().toISOString()
            };
            setNotes(prev => [newNote, ...prev]);
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Jaldi hi iska jawab mil jayega!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      updateSessionMessages([...updatedMessages, assistantMsg]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Maaf kijiye, request process karte samay error aaya. Kripya dobara try karein.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        updateSessionMessages([...updatedMessages, errorMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = () => {
    setTasks([]);
    setNotes([]);
    setSessions([DEFAULT_SESSION]);
    setActiveSessionId(DEFAULT_SESSION.id);
    localStorage.clear();
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased">
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => { sessionStorage.setItem('alpha_splash_shown', 'true'); setShowSplash(false); }} />}
        </AnimatePresence>

        {isMobileSidebarOpen && (
          <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 bg-slate-950/60 z-40 md:hidden" />
        )}

        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          activePersona={activePersona}
          personas={personas}
          onSelectPersona={setActivePersona}
          taskCount={tasks.filter(t => t.status !== 'completed').length}
          noteCount={notes.length}
          enableSearch={settings.enableSearch}
          setEnableSearch={(enabled) => setSettings(s => ({ ...s, enableSearch: enabled }))}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewSession={handleNewSession}
          onSelectSession={(id) => setActiveSessionId(id)}
          onDeleteSession={(id) => {
            const filtered = sessions.filter(s => s.id !== id);
            if (filtered.length === 0) {
              const fresh = { id: `session-${Date.now()}`, title: 'New Conversation', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] };
              setSessions([fresh]);
              setActiveSessionId(fresh.id);
            } else {
              setSessions(filtered);
              if (id === activeSessionId) setActiveSessionId(filtered[0].id);
            }
          }}
          onPinSession={() => {}}
          onFavoriteSession={() => {}}
          onArchiveSession={() => {}}
          onDuplicateSession={() => {}}
          onToggleLockSession={() => {}}
          onRenameSession={() => {}}
          userProfile={userProfile}
          onOpenAuth={() => setIsMobileSidebarOpen(true)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
          {currentView === 'dashboard' && (
            <DashboardView
              userProfile={userProfile}
              sessions={sessions}
              tasks={tasks}
              notes={notes}
              calendarEvents={calendarEvents}
              onNavigateView={(view) => setCurrentView(view)}
              onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
              onQuickStartChat={(promptText) => { setCurrentView('chat'); handleSendMessage(promptText); }}
              onAddTask={(task) => setTasks(prev => [task, ...prev])}
              onGoogleSignIn={handleDirectGoogleSignIn}
              onAddCalendarEvent={(evt) => setCalendarEvents(prev => [...prev, { ...evt, id: `cal-${Date.now()}`, createdAt: new Date().toISOString() }])}
            />
          )}

          {currentView === 'commerce' && (
            <CommerceStudyHubView
              onAskAgentAboutTopic={(topic) => { setCurrentView('chat'); handleSendMessage(`Explain this Class 12 Commerce concept in detail with examples: ${topic}`); }}
            />
          )}

          {currentView === 'tools' && (
            <AIWorkspaceToolsView onSendMessageToChat={(promptText) => { setCurrentView('chat'); handleSendMessage(promptText); }} />
          )}

          {currentView === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              activePersona={activePersona}
              personas={DEFAULT_PERSONAS}
              onSelectPersona={setActivePersona}
              activeSession={activeSession}
              enableSearch={settings.enableSearch}
              setEnableSearch={(enabled) => setSettings(s => ({ ...s, enableSearch: enabled }))}
              onClearChat={() => updateSessionMessages([])}
              isLoading={isLoading}
              onStopGenerating={() => abortControllerRef.current?.abort()}
              tasks={tasks}
              notes={notes}
              settings={settings}
              onUpdateSettings={(updates) => setSettings(s => ({ ...s, ...updates }))}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
              onRenameSession={() => {}}
              onDeleteSession={() => {}}
              onDuplicateSession={() => {}}
              onPinSession={() => {}}
              onFavoriteSession={() => {}}
              onArchiveSession={() => {}}
            />
          )}

          {currentView === 'tasks' && (
            <TaskBoardView
              tasks={tasks}
              onAddTask={(t) => setTasks(prev => [t, ...prev])}
              onUpdateTaskStatus={(id, status) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))}
              onDeleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
              onAskAgentAboutTask={(title) => { setCurrentView('chat'); handleSendMessage(`Help me execute this task: "${title}"`); }}
            />
          )}

          {currentView === 'notes' && (
            <KnowledgeBaseView
              notes={notes}
              onAddNote={(n) => setNotes(prev => [n, ...prev])}
              onDeleteNote={(id) => setNotes(prev => prev.filter(n => n.id !== id))}
              onAskAgentAboutNote={(title) => { setCurrentView('chat'); handleSendMessage(`Provide revision notes for: "${title}"`); }}
            />
          )}

          {currentView === 'settings' && (
            <SettingsModal
              settings={settings}
              userProfile={userProfile}
              sessions={sessions}
              onSaveSettings={(newSettings) => setSettings(s => ({ ...s, ...newSettings }))}
              onUpdateProfile={(updated) => { memoryManager.saveProfile(updated); setUserProfile(updated); }}
              onResetData={handleResetData}
              onOpenPinModal={(mode) => setPinModalState({ isOpen: true, mode })}
              onOpenLegalPage={(type) => setCurrentView(type)}
              onToggleLockSession={() => {}}
            />
          )}
        </main>

        <BottomNavigation
          activeView={currentView === 'notes' ? 'tasks' : currentView}
          onSelectView={(view) => setCurrentView(view === 'security' ? 'settings' : view)}
          activeSessionTitle={activeSession.title}
          isAppLockEnabled={settings.appLock?.isEnabled}
          taskCount={tasks.filter(t => t.status !== 'completed').length}
        />

         {pinModalState.isOpen && (
          <AppLockModal
            mode={pinModalState.mode}
            targetChatTitle={pinModalState.targetChatTitle}
            appLockSettings={settings.appLock}
            onSuccess={() => setPinModalState(prev => ({ ...prev, isOpen: false }))}
            onCancel={() => setPinModalState(prev => ({ ...prev, isOpen: false }))}
            onResetAppLock={() => {}}
          />
        )}

        <AuthModal isOpen={authError !== null} userProfile={userProfile} onUpdateProfile={(updated) => { memoryManager.saveProfile(updated); setUserProfile(updated); }} onClose={() => setAuthError(null)} />
        <VoiceConversationModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} activePersona={activePersona} settings={settings} onSendMessageToChat={handleSendMessage} />
        <SmartPromptLibraryModal isOpen={isPromptLibraryOpen} onClose={() => setIsPromptLibraryOpen(false)} onSelectPrompt={(promptText) => { setCurrentView('chat'); handleSendMessage(promptText); }} />
        <OnboardingTutorialModal isOpen={isOnboardingOpen} onClose={() => { localStorage.setItem('alpha_onboarding_completed', 'true'); setIsOnboardingOpen(false); }} />
        <FloatingAssistantWidget onOpenVoiceModal={() => setIsVoiceModalOpen(true)} onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)} onSendToMainChat={(promptText) => { setCurrentView('chat'); handleSendMessage(promptText); }} />
      </div>
    </ErrorBoundary>
  );
}
