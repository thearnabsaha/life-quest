import { create } from 'zustand';
import api from '@/lib/api';

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

interface AIChatResponse {
  response: string;
  actions_taken: ActionResult[];
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
