import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
const ChatView = lazy(() => import('./components/ChatView').then(module => ({ default: module.ChatView })));
const TaskBoardView = lazy(() => import('./components/TaskBoardView').then(module => ({ default: module.TaskBoardView })));
const KnowledgeBaseView = lazy(() => import('./components/KnowledgeBaseView').then(module => ({ default: module.KnowledgeBaseView })));
const PersonaSelectorView = lazy(() => import('./components/PersonaSelectorView').then(module => ({ default: module.PersonaSelectorView })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(module => ({ default: module.SettingsModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(module => ({ default: module.AuthModal })));
const AuthGate = lazy(() => import('./components/AuthGate').then(module => ({ default: module.AuthGate })));
const VoiceConversationModal = lazy(() => import('./components/VoiceConversationModal').then(module => ({ default: module.VoiceConversationModal })));
const AppLockModal = lazy(() => import('./components/AppLockModal').then(module => ({ default: module.AppLockModal })));
const SplashScreen = lazy(() => import('./components/SplashScreen').then(module => ({ default: module.SplashScreen })));
import { BottomNavigation } from './components/BottomNavigation';
import { ErrorBoundary } from './components/ErrorBoundary';
const SmartPromptLibraryModal = lazy(() => import('./components/SmartPromptLibraryModal').then(module => ({ default: module.SmartPromptLibraryModal })));
import { FloatingAssistantWidget } from './components/FloatingAssistantWidget';
const OnboardingTutorialModal = lazy(() => import('./components/OnboardingTutorialModal').then(module => ({ default: module.OnboardingTutorialModal })));
const DashboardView = lazy(() => import('./components/DashboardView').then(module => ({ default: module.DashboardView })));
const AIWorkspaceToolsView = lazy(() => import('./components/AIWorkspaceToolsView').then(module => ({ default: module.AIWorkspaceToolsView })));
const CommerceStudyHubView = lazy(() => import('./components/CommerceStudyHubView').then(module => ({ default: module.CommerceStudyHubView })));
import { AppNotification, NotificationCenter } from './components/NotificationCenter';
const LegalPage = lazy(() => import('./components/LegalPage').then(module => ({ default: module.LegalPage })));
import { DeviceSecurity } from './lib/deviceSecurity';
import { Shield, EyeOff, ShieldAlert } from 'lucide-react';
import { DEFAULT_PERSONAS } from './data/defaultPersonas';
import { AgentPersona, ChatMessage, ChatSession, Task, KnowledgeNote, AgentSettings, UserProfile, DocumentAttachment, AppLockSettings, CalendarEvent } from './types';
import { memoryManager } from './lib/memoryManager';
import { apiFetch } from './lib/apiClient';
import { auth, onAuthStateChanged, signOut } from './lib/firebase';

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Class 12 Accountancy: Reconstitution of Partnership & Goodwill',
    description: 'Solve textbook numericals for Super Profit Method and Capitalisation Method.',
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
    content: `### High-Impact Revision Strategy for Class 12 Commerce:
- **Accountancy**: Daily 3 numericals on Partnership Fundamentals, Reconstitution, and Pro-rata Share Forfeiture.
- **Business Studies**: Practice case studies on Principles of Management and Financial Management (Trading on Equity).
- **Economics**: Master National Income calculation methods and Investment Multiplier formulas.
- **English & Hindi**: Memorize Literature chapter summaries and writing skill formats (Notices, Letters, Bio-data).`,
    category: 'Studies',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_SESSION: ChatSession = {
  id: 'session-default',
  title: 'Welcome to Class 12 Commerce AI',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: []
};

export default function App() {
  const [currentView, setCurrentView] = useState<any>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alpha_notifications') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  
  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'cal-1',
      title: 'Class 12 Accountancy Partnership Practice',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      category: 'study',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-2',
      title: 'Macroeconomics National Income Numericals',
      date: new Date().toISOString().split('T')[0],
      time: '17:30',
      category: 'study',
      createdAt: new Date().toISOString()
    }
  ]);
  
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => memoryManager.getProfile());

  const addAppNotification = (title: string, message: string) => {
    const notification: AppNotification = {
      id: `notification-${Date.now()}`,
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((current) => [notification, ...current].slice(0, 50));
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body: message, tag: notification.id });
      } catch (error) {
        console.warn('Browser notification could not be shown:', error);
      }
    }
  };

  // Personas
  const [personas] = useState<AgentPersona[]>(DEFAULT_PERSONAS);
  const [activePersona, setActivePersona] = useState<AgentPersona>(() => {
    const saved = localStorage.getItem('agent_active_persona_id');
    return DEFAULT_PERSONAS.find(p => p.id === saved) || DEFAULT_PERSONAS[0];
  });

  // Settings
  const [settings, setSettings] = useState<AgentSettings>(() => {
    const saved = localStorage.getItem('agent_settings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        if (localStorage.getItem('alpha_search_preference_migrated') !== 'true') {
          savedSettings.enableSearch = false;
          localStorage.setItem('alpha_search_preference_migrated', 'true');
        }
        return savedSettings;
      } catch (e) {}
    }
    return {
      activePersonaId: activePersona.id,
      enableSearch: false,
      enableVoiceResponse: true,
      preferredLanguage: 'Hinglish',
      voiceSettings: {
        voiceURI: '',
        rate: 1.0,
        pitch: 1.0,
        autoSpeak: false
      },
      userCustomInstructions: 'Always reply in simple Hinglish step by step. Help me with Class 12 Commerce studies (Accountancy, Business Studies, Economics, English, Hindi, Computer Applications, Entrepreneurship, Physical Education) in a friendly and accurate manner.'
    };
  });

  // Chat History Sessions State (Updated for Safe Persistence)
const [sessions, setSessions] = useState<ChatSession[]>(() => {
  try {
    const saved = localStorage.getItem('alpha_chat_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading sessions from storage', e);
  }
  return [DEFAULT_SESSION];
});

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('alpha_active_session_id');
    return saved && sessions.some(s => s.id === saved) ? saved : sessions[0]?.id || DEFAULT_SESSION.id;
  });

  // Derived messages for current active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || DEFAULT_SESSION;
  const messages = activeSession ? activeSession.messages : [];

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('agent_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  // Notes State
  const [notes, setNotes] = useState<KnowledgeNote[]>(() => {
    const saved = localStorage.getItem('agent_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('alpha_splash_shown');
  });

  // Window Focus / Privacy Blur State
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false);
  const [screenshotToast, setScreenshotToast] = useState<boolean>(false);

  // Screenshot Prevention Listener
  useEffect(() => {
    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    const cleanupScreenshot = DeviceSecurity.enableScreenshotPrevention(() => {
      setScreenshotToast(true);
      setTimeout(() => setScreenshotToast(false), 3500);
    });

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      cleanupScreenshot();
    };
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('alpha_splash_shown', 'true');
    setShowSplash(false);
  };

  // App Lock State
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const savedSettings = localStorage.getItem('agent_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.appLock?.isEnabled && parsed.appLock?.pinHash) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  });

  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    mode: 'unlock-app' | 'unlock-chat' | 'setup-pin' | 'change-pin' | 'test-biometric';
    targetChatId?: string;
    targetChatTitle?: string;
  }>({ isOpen: false, mode: 'unlock-app' });

  const [unlockedSessionIds, setUnlockedSessionIds] = useState<string[]>([]);

  // Smart Tools & Onboarding Modals State
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('alpha_onboarding_completed');
  });

  // Tab visibility change (Auto-lock on background / tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && settings.appLock?.isEnabled && settings.appLock?.lockOnBackground) {
        setIsAppLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.appLock?.isEnabled, settings.appLock?.lockOnBackground]);

  // Auto lock inactivity timer
  useEffect(() => {
    if (!settings.appLock?.isEnabled || settings.appLock?.autoLockTimeout === undefined || settings.appLock.autoLockTimeout < 0) {
      return;
    }

    const timeoutMs = settings.appLock.autoLockTimeout * 60 * 1000;
    if (timeoutMs === 0) return;

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsAppLocked(true);
      }, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [settings.appLock?.isEnabled, settings.appLock?.autoLockTimeout]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('agent_active_persona_id', activePersona.id);
  }, [activePersona]);

  // Firebase Auth Listener
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const providerId =
        firebaseUser.providerData[0]?.providerId || 'email';

      const providerType =
        providerId.includes('google') ? 'google' : 'email';

      const updatedProfile: UserProfile = {
        id: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'Alpha User',
        email: firebaseUser.email || '',
        avatar:
          firebaseUser.photoURL ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
        provider: providerType,
        isLoggedIn: true,
        emailVerified: firebaseUser.emailVerified,
        joinedAt:
          firebaseUser.metadata.creationTime ||
          new Date().toISOString()
      };

      memoryManager.saveProfile(updatedProfile);
      setUserProfile(updatedProfile);
    } else {
      setUserProfile(prev => ({
        ...prev,
        isLoggedIn: false,
        provider: 'guest'
      }));
    }
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    localStorage.setItem('agent_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('alpha_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('alpha_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('alpha_active_session_id', activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem('agent_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('agent_notes', JSON.stringify(notes));
  }, [notes]);

  // Session Handlers
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

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session?.isLocked && !unlockedSessionIds.includes(id)) {
      setPinModalState({
        isOpen: true,
        mode: 'unlock-chat',
        targetChatId: id,
        targetChatTitle: session.title
      });
      return;
    }
    setActiveSessionId(id);
  };

  const handleToggleLockSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isLocked: !s.isLocked } : s));
  };

  const handlePinModalSuccess = (newPin?: string) => {
    if (pinModalState.mode === 'unlock-app') {
      setIsAppLocked(false);
    } else if (pinModalState.mode === 'unlock-chat' && pinModalState.targetChatId) {
      setUnlockedSessionIds(prev => [...prev, pinModalState.targetChatId!]);
      setActiveSessionId(pinModalState.targetChatId);
    } else if (pinModalState.mode === 'setup-pin' || pinModalState.mode === 'change-pin') {
      if (newPin) {
        setSettings(prev => ({
          ...prev,
          appLock: {
            isEnabled: true,
            pinHash: newPin,
            isFingerprintEnabled: prev.appLock?.isFingerprintEnabled ?? true,
            isFaceUnlockEnabled: prev.appLock?.isFaceUnlockEnabled ?? true,
            autoLockTimeout: prev.appLock?.autoLockTimeout ?? 5,
            lockOnBackground: prev.appLock?.lockOnBackground ?? true
          }
        }));
      }
    }
    setPinModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleResetAppLock = () => {
    setSettings(prev => ({
      ...prev,
      appLock: {
        isEnabled: false,
        pinHash: '',
        isFingerprintEnabled: true,
        isFaceUnlockEnabled: true,
        autoLockTimeout: 5,
        lockOnBackground: true
      }
    }));
    setIsAppLocked(false);
    setPinModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const fresh = {
          id: `session-${Date.now()}`,
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (id === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handlePinSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  };

  const handleFavoriteSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  };

  const handleArchiveSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isArchived: !s.isArchived } : s));
  };

  const handleDuplicateSession = (id: string) => {
    const sessionToDup = sessions.find(s => s.id === id);
    if (!sessionToDup) return;
    const newSession: ChatSession = {
      ...sessionToDup,
      id: `session-${Date.now()}`,
      title: `${sessionToDup.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: sessionToDup.messages.map(m => ({ ...m, id: `${m.id}-dup-${Date.now()}` }))
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

   const updateSessionMessages = (newMessages: ChatMessage[]) => {
  setSessions(prev => {
    const updatedSessions = prev.map(s => {
      if (s.id === activeSessionId) {
        let newTitle = s.title;
        if ((s.title === 'Welcome to Class 12 Commerce AI' || s.title === 'New Conversation') && newMessages.length > 0) {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? '...' : '');
          }
        }
        return {
          ...s,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: newMessages
        };
      }
      return s;
    });
    
    // Turant localStorage mein save karein taaki refresh hone par gayab na ho
    try {
      localStorage.setItem('alpha_chat_sessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
    
    return updatedSessions;
  });
};
  

  const handleSendMessage = async (content: string, attachedImage?: string, attachedDoc?: DocumentAttachment, studyTutorMode = false) => {
    let finalContent = content;
    if (attachedDoc && attachedDoc.textContent) {
      finalContent = `${content}\n\n[Attached Document: "${attachedDoc.name}" (${attachedDoc.type}, ${attachedDoc.pageCount || 1} pages)]:\n\n${attachedDoc.textContent.slice(0, 10000)}`;
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
          attachedImage,
          studyTutorMode
        })
      });

      if (!res.ok) {
        throw new Error(res.error || res.data?.error || 'Agent call failed');
      }

      const data = res.data;

      if (data.toolExecutions && Array.isArray(data.toolExecutions)) {
        for (const tool of data.toolExecutions) {
          if (tool.name === 'create_task' && tool.args?.title) {
            const newTask: Task = {
              id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              title: tool.args.title,
              description: tool.args.description,
              priority: tool.args.priority || 'medium',
              status: 'todo',
              dueDate: tool.args.dueDate,
              createdAt: new Date().toISOString()
            };
            setTasks(prev => [newTask, ...prev]);
            addAppNotification('Task created', newTask.title);
          } else if (tool.name === 'save_note' && tool.args?.title && tool.args?.content) {
            const newNote: KnowledgeNote = {
              id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              title: tool.args.title,
              content: tool.args.content,
              category: tool.args.category || 'General',
              createdAt: new Date().toISOString()
            };
            setNotes(prev => [newNote, ...prev]);
          }
        }
      }

          const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.text || 'Action completed.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const finalMessages = [...updatedMessages, assistantMsg];
    updateSessionMessages(finalMessages);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request aborted');
    } else {
      console.error('API Error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      updateSessionMessages([...updatedMessages, errorMsg]);
    }
  } finally {
    setIsLoading(false);
    abortControllerRef.current = null;
  }
};
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      const guestProfile: UserProfile = {
        id: 'usr-guest',
        name: 'Guest User',
        email: 'guest@alpha.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'guest',
        isLoggedIn: false,
        emailVerified: false,
        joinedAt: new Date().toISOString(),
      };
      memoryManager.saveProfile(guestProfile);
      setUserProfile(guestProfile);
      setCurrentView('dashboard');
      setIsMobileSidebarOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
      addAppNotification('Sign out failed', 'Please try again.');
    }
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [task, ...prev]);
    addAppNotification('Task created', task.title);
  };

  const handleUpdateTaskStatus = (id: string, status: Task['status']) => {
    const task = tasks.find((item) => item.id === id);
    if (status === 'completed' && task && task.status !== 'completed') {
      addAppNotification('Task completed', task.title);
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAskAgentAboutTask = (taskTitle: string) => {
    setCurrentView('chat');
    handleSendMessage(`Help me execute and complete this task step by step: "${taskTitle}"`);
  };

  const handleAddNote = (newNote: Omit<KnowledgeNote, 'id' | 'createdAt'>) => {
    const note: KnowledgeNote = {
      ...newNote,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNotes(prev => [note, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleAskAgentAboutNote = (noteTitle: string) => {
    setCurrentView('chat');
    handleSendMessage(`Provide additional insights and revision notes for: "${noteTitle}"`);
  };

  const handleResetData = () => {
    setTasks([]);
    setNotes([]);
    setSessions([DEFAULT_SESSION]);
    setActiveSessionId(DEFAULT_SESSION.id);
    localStorage.clear();
  };

  if (showSplash) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-950 text-sm text-slate-400" role="status">Loading...</div>}>
          <SplashScreen onComplete={handleSplashComplete} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Bypass AuthGate requirement for seamless usage if user profile is already cached or guest login is active
  if (!userProfile.isLoggedIn) {
    // If you want to allow instant testing without forcing Google login popup loop, 
    // you can auto-set isLoggedIn or use AuthGate conditionally. 
    // Here we ensure AuthGate only shows if explicitly required:
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-950 text-sm text-slate-400" role="status">Loading...</div>}>
          <AuthGate
            onUpdateProfile={(updated) => {
              const finalUpdated = { ...updated, isLoggedIn: true };
              memoryManager.saveProfile(finalUpdated);
              setUserProfile(finalUpdated);
            }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100 relative">

        {isWindowBlurred && settings.appLock?.isEnabled && (
          <div className="fixed inset-0 z-100 bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center space-y-3 pointer-events-auto select-none p-6 text-center">
            <div className="p-4 rounded-3xl bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 animate-pulse">
              <EyeOff className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-white">Protected Workspace View</h2>
            <p className="text-xs text-slate-400 max-w-xs">Screen content hidden to prevent unauthorized capture or background window peek.</p>
          </div>
        )}

        {screenshotToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 bg-rose-950/90 border border-rose-500/40 text-rose-200 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Screenshot / Screen Recording Detected — Protected Content</span>
          </div>
        )}

        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 md:hidden"
          />
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
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onPinSession={handlePinSession}
          onFavoriteSession={handleFavoriteSession}
          onArchiveSession={handleArchiveSession}
          onDuplicateSession={handleDuplicateSession}
          onToggleLockSession={handleToggleLockSession}
          onRenameSession={handleRenameSession}
          userProfile={userProfile}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSignOut={handleSignOut}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        <NotificationCenter
          notifications={notifications}
          onMarkRead={(id) => setNotifications((current) => current.map((notification) =>
            notification.id === id ? { ...notification, isRead: true } : notification,
          ))}
          onMarkAllRead={() => setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })))}
          onClearAll={() => setNotifications([])}
        />

        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden pb-20 md:pb-0">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-400" role="status">Loading...</div>}>
          {currentView === 'dashboard' && (
            <DashboardView
              userProfile={userProfile}
              sessions={sessions}
              tasks={tasks}
              notes={notes}
              calendarEvents={calendarEvents}
              onNavigateView={(view) => setCurrentView(view)}
              onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
              onQuickStartChat={(promptText) => {
                setCurrentView('chat');
                handleSendMessage(promptText);
              }}
              onAddTask={handleAddTask}
              onAddCalendarEvent={(evt) => {
                setCalendarEvents(prev => [...prev, { ...evt, id: `cal-${Date.now()}`, createdAt: new Date().toISOString() }]);
              }}
                onOpenAuth={() => setIsAuthOpen(true)}
  onGoogleSignIn={() => setIsAuthOpen(true)}
/>
          )}

          {currentView === 'commerce' && (
            <CommerceStudyHubView
              onAskAgentAboutTopic={(topic) => {
                setCurrentView('chat');
                handleSendMessage(`Start a guided Maharashtra HSC Class 12 Commerce study session for: ${topic}. Begin with step 1 only.`, undefined, undefined, true);
              }}
            />
          )}

          {currentView === 'tools' && (
            <AIWorkspaceToolsView
              onSendMessageToChat={(promptText) => {
                setCurrentView('chat');
                handleSendMessage(promptText);
              }}
            />
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
              onStopGenerating={handleStopGenerating}
              tasks={tasks}
              notes={notes}
              settings={settings}
              onUpdateSettings={(updates) => setSettings(s => ({ ...s, ...updates }))}
              onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
              onRenameSession={handleRenameSession}
              onDeleteSession={handleDeleteSession}
              onDuplicateSession={handleDuplicateSession}
              onPinSession={handlePinSession}
              onFavoriteSession={handleFavoriteSession}
              onArchiveSession={handleArchiveSession}
            />
          )}

          {currentView === 'tasks' && (
            <TaskBoardView
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              onAskAgentAboutTask={handleAskAgentAboutTask}
            />
          )}

          {currentView === 'notes' && (
            <KnowledgeBaseView
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onAskAgentAboutNote={handleAskAgentAboutNote}
            />
          )}

          {currentView === 'personas' && (
            <PersonaSelectorView
              personas={personas}
              activePersona={activePersona}
              onSelectPersona={setActivePersona}
              onSwitchToChat={() => setCurrentView('chat')}
            />
          )}
          {currentView === 'terms' && (
            <LegalPage
              type="terms"
              onBack={() => setCurrentView('dashboard')}
              onOpenOther={(type) => setCurrentView(type)}
            />
          )}

          {currentView === 'privacy' && (
            <LegalPage
              type="privacy"
              onBack={() => setCurrentView('dashboard')}
              onOpenOther={(type) => setCurrentView(type)}
            />
          )}
 
          {currentView === 'settings' && (
            <SettingsModal
              settings={settings}
              userProfile={userProfile}
              sessions={sessions}
              onSaveSettings={(newSettings) => setSettings(s => ({ ...s, ...newSettings }))}
              onUpdateProfile={(updated) => {
                memoryManager.saveProfile(updated);
                setUserProfile(updated);
              }}
              onResetData={handleResetData}
              onOpenPinModal={(mode) => setPinModalState({ isOpen: true, mode })}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenLegalPage={(type) => setCurrentView(type)} 
              onToggleLockSession={handleToggleLockSession}
            />
          )}
          </Suspense>
        </main>

        <BottomNavigation
          activeView={currentView === 'notes' ? 'tasks' : currentView}
          onSelectView={(view) => {
            if (view === 'security') {
              setCurrentView('settings');
            } else {
              setCurrentView(view as any);
            }
          }}
          activeSessionTitle={activeSession.title}
          isAppLockEnabled={settings.appLock?.isEnabled}
          taskCount={tasks.filter(t => t.status !== 'completed').length}
        />

        {isAppLocked && settings.appLock?.isEnabled && (
          <Suspense fallback={null}>
            <AppLockModal
              mode="unlock-app"
              appLockSettings={settings.appLock}
              onSuccess={() => setIsAppLocked(false)}
              onResetAppLock={handleResetAppLock}
            />
          </Suspense>
        )}

        {pinModalState.isOpen && (
          <Suspense fallback={null}>
            <AppLockModal
              mode={pinModalState.mode}
              targetChatTitle={pinModalState.targetChatTitle}
              appLockSettings={settings.appLock}
              onSuccess={handlePinModalSuccess}
              onCancel={() => setPinModalState(prev => ({ ...prev, isOpen: false }))}
              onResetAppLock={handleResetAppLock}
            />
          </Suspense>
        )}

        {isAuthOpen && (
          <Suspense fallback={null}>
            <AuthModal
              isOpen={isAuthOpen}
              userProfile={userProfile}
              onUpdateProfile={(updated) => {
                memoryManager.saveProfile(updated);
                setUserProfile(updated);
              }}
              onClose={() => setIsAuthOpen(false)}
            />
          </Suspense>
        )}

        {isVoiceModalOpen && (
          <Suspense fallback={null}>
            <VoiceConversationModal
              isOpen={isVoiceModalOpen}
              onClose={() => setIsVoiceModalOpen(false)}
              activePersona={activePersona}
              settings={settings}
              onSendMessageToChat={handleSendMessage}
            />
          </Suspense>
        )}

        {isPromptLibraryOpen && (
          <Suspense fallback={null}>
            <SmartPromptLibraryModal
              isOpen={isPromptLibraryOpen}
              onClose={() => setIsPromptLibraryOpen(false)}
              onSelectPrompt={(promptText) => {
                if (currentView !== 'chat') setCurrentView('chat');
                handleSendMessage(promptText);
              }}
            />
          </Suspense>
        )}

        {isOnboardingOpen && (
          <Suspense fallback={null}>
            <OnboardingTutorialModal
              isOpen={isOnboardingOpen}
              onClose={() => {
                localStorage.setItem('alpha_onboarding_completed', 'true');
                setIsOnboardingOpen(false);
              }}
            />
          </Suspense>
        )}

        <FloatingAssistantWidget
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
          onSendToMainChat={(promptText) => {
            if (currentView !== 'chat') setCurrentView('chat');
            handleSendMessage(promptText);
          }}
        />
      </div>
    </ErrorBoundary>
  );}
   
