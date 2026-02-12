import { create } from 'zustand';
import api from '@/lib/api';
import { useCalendarStore } from './useCalendarStore';
import { useXPStore } from './useXPStore';
import { useProfileStore } from './useProfileStore';
import { useHabitStore } from './useHabitStore';
import { useCategoryStore } from './useCategoryStore';
import { useGoalStore } from './useGoalStore';
import { useNotificationStore } from './useNotificationStore';
import { useSettingsStore } from './useSettingsStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionResult[];
  needsClarification?: boolean;
  clarificationQuestion?: string | null;
  modelUsed?: string;
  timestamp: number;
}

export interface ActionResult {
  type: string;
  success: boolean;
  detail: string;
}

interface ClientAction {
  type: string;
  themeId?: string;
  enabled?: boolean;
  path?: string;
}

interface AIChatResponse {
  response: string;
  actions_taken: ActionResult[];
  client_actions?: ClientAction[];
  needs_clarification: boolean;
  clarification_question: string | null;
  model_used: string;
}

interface AIChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

let msgCounter = 0;
function nextId(): string {
  return `msg_${Date.now()}_${++msgCounter}`;
}

// Callback refs for client-side actions (set by components)
let _navigateFn: ((path: string) => void) | null = null;
let _openCommandPaletteFn: (() => void) | null = null;

export function setAINavigate(fn: (path: string) => void) {
  _navigateFn = fn;
}
export function setAICommandPalette(fn: () => void) {
  _openCommandPaletteFn = fn;
}

function executeClientActions(actions: ClientAction[], clearChatFn: () => void) {
  const settings = useSettingsStore.getState();

  for (const action of actions) {
    switch (action.type) {
      case 'change_theme':
        if (action.themeId) {
          settings.setTheme(action.themeId);
        }
        break;
      case 'toggle_sound':
        settings.setSfxEnabled(action.enabled ?? !settings.sfxEnabled);
        break;
      case 'toggle_music':
        settings.setMusicEnabled(action.enabled ?? !settings.musicEnabled);
        break;
      case 'toggle_animations':
        settings.setAnimationsEnabled(action.enabled ?? !settings.animationsEnabled);
        break;
      case 'navigate':
        if (action.path && _navigateFn) {
          _navigateFn(action.path);
        }
        break;
      case 'open_command_palette':
        if (_openCommandPaletteFn) {
          _openCommandPaletteFn();
        }
        break;
      case 'clear_chat':
        setTimeout(() => clearChatFn(), 1500);
        break;
    }
  }
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isOpen: false,
  error: null,

  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  sendMessage: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: nextId(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true,
      error: null,
    }));

    try {
      // Build history from recent messages (last 10)
      const state = get();
      const history = state.messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data } = await api.post<AIChatResponse>('/ai/chat', {
        message: trimmed,
        history,
      });

      const assistantMsg: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        content: data.response,
        actions: data.actions_taken,
        needsClarification: data.needs_clarification,
        clarificationQuestion: data.clarification_question,
        modelUsed: data.model_used,
        timestamp: Date.now(),
      };

      set((s) => ({
        messages: [...s.messages, assistantMsg],
        isLoading: false,
      }));

      // Execute client-side actions (theme change, navigation, etc.)
      if (data.client_actions && data.client_actions.length > 0) {
        executeClientActions(data.client_actions, get().clearChat);
      }

      // AI actions may have created/modified habits, categories, goals, XP, etc.
      // Refresh all relevant stores so the UI reflects changes
      if (data.actions_taken && data.actions_taken.length > 0) {
        const hasServerActions = data.actions_taken.some((a) =>
          ['create_category', 'create_habit', 'complete_habit', 'create_goal', 'log_xp'].includes(a.type)
        );
        if (hasServerActions) {
          const cal = useCalendarStore.getState();
          cal.fetchCalendar(cal.year).catch(() => {});
          useXPStore.getState().fetchLogs(1).catch(() => {});
          useProfileStore.getState().fetchProfile(true).catch(() => {});
          useHabitStore.getState().fetchHabits(true).catch(() => {});
          useCategoryStore.getState().fetchCategories(true).catch(() => {});
          useGoalStore.getState().fetchGoals(true).catch(() => {});
          useNotificationStore.getState().fetchNotifications(20).catch(() => {});
          useNotificationStore.getState().fetchUnreadCount(true).catch(() => {});
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = e.response?.data?.message ?? e.message ?? 'AI request failed';

      const errorAssistantMsg: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        timestamp: Date.now(),
      };

      set((s) => ({
        messages: [...s.messages, errorAssistantMsg],
        isLoading: false,
        error: errorMsg,
      }));
    }
  },

  clearChat: () => set({ messages: [], error: null }),
}));
