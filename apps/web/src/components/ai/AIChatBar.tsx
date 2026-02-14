'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIChatStore, setAINavigate, setAICommandPalette, type ChatMessage } from '@/stores/useAIChatStore';
import clsx from 'clsx';

function ActionBadge({ type, success, detail }: { type: string; success: boolean; detail: string }) {
  const Icon = success ? CheckCircle2 : XCircle;
  const color = success ? 'text-neonGreen border-neonGreen/30 bg-neonGreen/5' : 'text-neonPink border-neonPink/30 bg-neonPink/5';

  return (
    <div className={`flex items-start gap-2 border px-2 py-1.5 text-xs ${color}`}>
      <Icon className="w-3 h-3 mt-0.5 shrink-0" />
      <span className="font-body">{detail}</span>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-6 h-6 shrink-0 flex items-center justify-center border text-[10px] font-heading',
          isUser
            ? 'border-neonBlue bg-neonBlue/10 text-neonBlue'
            : 'border-neonGreen bg-neonGreen/10 text-neonGreen'
        )}
      >
        {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
      </div>

      {/* Content */}
      <div className={clsx('max-w-[85%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'border-2 px-3 py-2 font-body text-sm',
            isUser
              ? 'border-neonBlue/40 bg-neonBlue/5 text-white'
              : 'border-zinc-700 bg-zinc-900 text-zinc-200'
          )}
        >
          {message.content}
        </div>

        {/* Actions taken */}
        {message.actions && message.actions.length > 0 && (
          <div className="space-y-1">
            {message.actions.map((a, i) => (
              <ActionBadge key={i} type={a.type} success={a.success} detail={a.detail} />
            ))}
          </div>
        )}

        {/* Clarification prompt */}
        {message.needsClarification && message.clarificationQuestion && (
          <div className="border border-neonYellow/30 bg-neonYellow/5 px-2 py-1.5 text-xs text-neonYellow font-body">
            {message.clarificationQuestion}
          </div>
        )}

        {/* Model tag */}
        {message.modelUsed && (
          <span className="font-mono text-[9px] text-zinc-600">
            {message.modelUsed.split('-').slice(0, 2).join('-')}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function AIChatBar() {
  const router = useRouter();
  const { messages, isLoading, isOpen, toggleOpen, sendMessage, clearChat } =
    useAIChatStore();
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Register AI callbacks for navigation and command palette
  useEffect(() => {
    setAINavigate((path: string) => {
      router.push(path);
    });
    setAICommandPalette(() => {
      // Simulate Ctrl+K to open command palette
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    });
  }, [router]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            type="button"
            onClick={toggleOpen}
            className="fixed right-3 md:right-6 bottom-above-nav z-50 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl border-2 border-neonGreen bg-zinc-950 text-neonGreen shadow-[4px_4px_0px_0px_#39ff14] hover:shadow-[6px_6px_0px_0px_#39ff14] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            aria-label="Open AI Chat"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'fixed z-50 border-2 border-neonGreen bg-zinc-950 shadow-[6px_6px_0px_0px_#39ff14] flex flex-col',
              isExpanded
                ? 'right-0 left-0 bottom-0 top-below-topbar md:bottom-4 md:right-4 md:left-auto md:top-auto md:w-[480px] md:h-[600px]'
                : 'right-3 bottom-above-nav md:bottom-4 md:right-4 w-[calc(100vw-1.5rem)] max-w-[420px] h-[60vh] max-h-[420px]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neonGreen" />
                <span className="font-heading text-xs text-neonGreen">AI ASSISTANT</span>
                {isLoading && (
                  <Loader2 className="w-3 h-3 text-neonGreen animate-spin" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  aria-label={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearChat}
                    className="p-1.5 text-zinc-500 hover:text-neonPink transition-colors"
                    aria-label="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleOpen}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
            >
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
                  <Sparkles className="w-8 h-8 text-neonGreen/30" />
                  <div>
                    <p className="font-heading text-xs text-zinc-500 mb-2">
                      AI QUEST ASSISTANT
                    </p>
                    <p className="font-body text-xs text-zinc-600 leading-relaxed">
                      I can create categories, habits &amp; challenges, change themes,
                      toggle audio, navigate pages, and more!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      'I did my morning run',
                      'Switch to Cyberpunk theme',
                      'Turn on the music',
                      'Go to analytics',
                      'What can you do?',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="border border-zinc-700 bg-zinc-900 px-2 py-1 font-body text-[10px] text-zinc-400 hover:border-neonGreen hover:text-neonGreen transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-1"
                >
                  <div className="w-6 h-6 border border-neonGreen bg-neonGreen/10 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-neonGreen" />
                  </div>
                  <div className="border-2 border-zinc-700 bg-zinc-900 px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-neonGreen/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neonGreen/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neonGreen/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t-2 border-zinc-800 px-3 py-3 shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me what you did today..."
                  disabled={isLoading}
                  maxLength={500}
                  className="flex-1 border-2 border-zinc-700 bg-zinc-900 px-3 py-2.5 font-body text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-neonGreen disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="border-2 border-neonGreen bg-neonGreen px-3 py-2.5 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(57,255,20,0.4)] transition-all active:translate-y-[1px]"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              <p className="mt-1.5 font-mono text-[9px] text-zinc-700 text-right">
                {input.length}/500
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
