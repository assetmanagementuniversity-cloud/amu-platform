'use client';

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export interface ChatInputProps {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
  maxLength?: number;
}

// ============================================
// Component (AMU Brand Styling - Section 9)
// ============================================

export const ChatInput = memo(function ChatInput({
  onSend,
  disabled = false,
  isSending = false,
  placeholder = 'Share your thoughts or ask a question...',
  maxLength = 10000,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = disabled || isSending;

  /**
   * Auto-resize textarea
   */
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 200;
      const newHeight = textarea.scrollHeight < maxHeight ? textarea.scrollHeight : maxHeight;
      textarea.style.height = newHeight + 'px';
    }
  }, []);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= maxLength) {
        setMessage(value);
      }
    },
    [maxLength]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const trimmedMessage = message.trim();
      if (!trimmedMessage || isDisabled) return;

      try {
        await onSend(trimmedMessage);
        setMessage('');
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        // Error handling is done in parent component
        console.error('Failed to send message:', error);
      }
    },
    [message, isDisabled, onSend]
  );

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (without Shift)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  /**
   * Adjust textarea height on message change
   */
  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  /**
   * Focus textarea when not disabled
   */
  useEffect(() => {
    if (!isDisabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isDisabled]);

  const charactersRemaining = maxLength - message.length;
  const showCharacterCount = message.length > maxLength * 0.8;

  return (
    <div className="border-t border-amu-sky bg-white p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Input Area */}
        <div className="relative flex items-end gap-2">
          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border border-amu-slate/30 bg-amu-sky/20 px-4 py-3 pr-12 font-body text-sm text-amu-charcoal',
                'placeholder:text-amu-slate',
                'focus:border-amu-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-amu-navy/20',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-all duration-200'
              )}
              aria-label="Message input"
            />

            {/* Character Count (shown when near limit) */}
            {showCharacterCount && (
              <span
                className={cn(
                  'absolute bottom-2 right-14 font-body text-xs',
                  charactersRemaining < 100 ? 'text-amber-600' : 'text-amu-slate'
                )}
              >
                {charactersRemaining}
              </span>
            )}
          </div>

          {/* Send Button - AMU Navy */}
          <button
            type="submit"
            disabled={isDisabled || !message.trim()}
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              'transition-all duration-200',
              message.trim() && !isDisabled
                ? 'bg-amu-navy text-white hover:bg-amu-navy/90 active:scale-95'
                : 'bg-amu-sky text-amu-slate cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-between px-1">
          <p className="font-body text-xs text-amu-slate">
            Press <kbd className="rounded bg-amu-sky px-1 py-0.5 font-mono text-xs">Enter</kbd> to send,{' '}
            <kbd className="rounded bg-amu-sky px-1 py-0.5 font-mono text-xs">Shift+Enter</kbd> for new line
          </p>

          {isSending && (
            <p className="font-callout text-xs text-amu-navy italic animate-pulse">
              Your guide is formulating a response...
            </p>
          )}
        </div>
      </form>
    </div>
  );
});
