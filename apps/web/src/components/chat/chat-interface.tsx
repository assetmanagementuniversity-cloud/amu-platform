'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { AlertCircle, RefreshCw, BookOpen, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConversation, type UseConversationOptions } from '@/hooks/use-conversation';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ChatThinking } from './chat-thinking';
import { Alert, AlertDescription, Button } from '@/components/ui';
import { parseMilestoneFromResponse, saveMilestoneAchievement } from '@/lib/competency';
import { CompetencyBadge } from '@/components/competency';
import type { ConversationMessage } from '@/lib/api';

// ============================================
// Types
// ============================================

export interface ChatInterfaceProps {
  /** Existing conversation ID to load */
  conversationId?: string;
  /** Enrolment ID for learning conversations */
  enrolmentId?: string;
  /** Current module ID */
  moduleId?: string;
  /** Current competency ID being assessed */
  competencyId?: string;
  /** Conversation type */
  type?: 'inquiry' | 'learning' | 'assessment';
  /** Course title for header display */
  courseTitle?: string;
  /** Module title for header display */
  moduleTitle?: string;
  /** Custom welcome message */
  welcomeMessage?: string;
  /** Callback when conversation is created */
  onConversationCreated?: (conversationId: string) => void;
  /** Custom class name */
  className?: string;
}

// ============================================
// Welcome Messages
// ============================================

const DEFAULT_WELCOME_MESSAGES = {
  inquiry: {
    title: 'Welcome to Asset Management University',
    message:
      "I'm here to answer your questions about AMU, our courses, and how we can help you develop your asset management capabilities. What would you like to know?",
  },
  learning: {
    title: 'Ready to Learn Together',
    message:
      "Welcome back! I'm your learning guide for this module. Remember, I won't simply give you answers—instead, I'll ask questions that help you discover concepts yourself. This is how deep understanding develops.\n\nWhat aspect of the material would you like to explore?",
  },
  assessment: {
    title: 'Competency Discussion',
    message:
      "Let's have a conversation about what you've learned. I'll ask some questions to understand your grasp of the concepts. There's no pressure—this is just a dialogue to see where you are in your learning journey.\n\nShall we begin?",
  },
};

// ============================================
// Component
// ============================================

export function ChatInterface({
  conversationId,
  enrolmentId,
  moduleId,
  competencyId,
  type = 'learning',
  courseTitle,
  moduleTitle,
  welcomeMessage,
  onConversationCreated,
  className,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  // Competency badge state
  const [badgeVisible, setBadgeVisible] = useState(false);
  const [achievedCompetency, setAchievedCompetency] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Use ref for conversation ID to avoid circular dependency
  const conversationIdRef = useRef<string | null>(null);

  // Conversation hook
  const {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    refreshConversation,
    clearError,
  } = useConversation({
    conversationId,
    enrolmentId,
    moduleId,
    competencyId,
    type,
  });

  // Keep ref updated with current conversation ID
  useEffect(() => {
    conversationIdRef.current = conversation?.id || null;
  }, [conversation?.id]);

  /**
   * Process AI response for milestone detection
   */
  const processMessageForMilestones = useCallback(
    async (content: string) => {
      // Parse the message for milestone tags
      const { milestone } = parseMilestoneFromResponse(content);

      if (milestone && enrolmentId && moduleId && conversationIdRef.current) {
        // Save the milestone to Firestore
        const result = await saveMilestoneAchievement({
          enrolmentId,
          milestone,
          conversationId: conversationIdRef.current,
          moduleId,
        });

        if (result.success && milestone.type === 'complete') {
          // Show the celebration badge
          setAchievedCompetency({
            id: milestone.competencyId,
            title: milestone.competencyTitle || milestone.competencyId,
          });
          setBadgeVisible(true);
        }

        // Log completion status for debugging
        if (result.isModuleComplete) {
          console.log('Module complete! All competencies achieved.');
        }
        if (result.isCourseComplete) {
          console.log('Course complete! Certificate generation triggered.');
        }
      }
    },
    [enrolmentId, moduleId]
  );

  // Monitor messages for milestone tags
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        processMessageForMilestones(lastMessage.content);
      }
    }
  }, [messages, processMessageForMilestones]);

  // Notify parent when conversation is created
  useEffect(() => {
    if (conversation?.id && onConversationCreated) {
      onConversationCreated(conversation.id);
    }
  }, [conversation?.id, onConversationCreated]);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  /**
   * Handle scroll to detect if user scrolled up
   */
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setHasScrolledUp(!isAtBottom);
  }, []);

  /**
   * Auto-scroll on new messages (unless user scrolled up)
   */
  useEffect(() => {
    if (!hasScrolledUp) {
      scrollToBottom();
    }
  }, [messages, isSending, hasScrolledUp, scrollToBottom]);

  /**
   * Handle message send
   */
  const handleSend = useCallback(
    async (content: string) => {
      setHasScrolledUp(false);
      await sendMessage(content);
    },
    [sendMessage]
  );

  // Get welcome content
  const welcomeContent = welcomeMessage
    ? { title: 'Welcome', message: welcomeMessage }
    : DEFAULT_WELCOME_MESSAGES[type];

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border border-amu-sky bg-white shadow-sm',
        className
      )}
    >
      {/* Header */}
      <ChatHeader
        type={type}
        courseTitle={courseTitle}
        moduleTitle={moduleTitle}
        isLoading={isLoading}
        onRefresh={refreshConversation}
      />

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Sparkles className="mx-auto h-8 w-8 animate-pulse text-amu-navy" />
              <p className="mt-2 text-sm text-amu-slate">
                Preparing your learning space...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4">
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearError();
                  refreshConversation();
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        {!isLoading && !error && (
          <div className="divide-y divide-slate-100">
            {/* Welcome Message (shown if no messages yet) */}
            {messages.length === 0 && (
              <WelcomeMessage
                title={welcomeContent.title}
                message={welcomeContent.message}
              />
            )}

            {/* Message List */}
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                assessment={message.assessment}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Thinking Indicator */}
            {isSending && <ChatThinking />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button (shown when scrolled up) */}
      {hasScrolledUp && messages.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <button
            onClick={() => {
              setHasScrolledUp(false);
              scrollToBottom();
            }}
            className="flex items-center gap-1 rounded-full bg-amu-navy px-3 py-1.5 text-xs text-white shadow-lg hover:bg-amu-navy/90"
          >
            <MessageCircle className="h-3 w-3" />
            New messages
          </button>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isSending={isSending}
        disabled={isLoading || !!error}
        placeholder={
          type === 'inquiry'
            ? 'Ask a question about AMU or asset management...'
            : 'Share your thoughts or ask a question...'
        }
      />

      {/* Competency Achievement Badge */}
      {achievedCompetency && (
        <CompetencyBadge
          competencyId={achievedCompetency.id}
          competencyTitle={achievedCompetency.title}
          isVisible={badgeVisible}
          onDismiss={() => {
            setBadgeVisible(false);
            setAchievedCompetency(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Chat Header
// ============================================

interface ChatHeaderProps {
  type: 'inquiry' | 'learning' | 'assessment';
  courseTitle?: string;
  moduleTitle?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

function ChatHeader({
  type,
  courseTitle,
  moduleTitle,
  isLoading,
  onRefresh,
}: ChatHeaderProps) {
  const typeConfig = {
    inquiry: {
      icon: MessageCircle,
      label: 'Inquiry',
      color: 'text-blue-600 bg-blue-50',
    },
    learning: {
      icon: BookOpen,
      label: 'Learning',
      color: 'text-amu-navy bg-amu-sky/30',
    },
    assessment: {
      icon: Sparkles,
      label: 'Assessment',
      color: 'text-purple-600 bg-purple-50',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between border-b border-amu-sky bg-amu-sky/30 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Type Badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            config.color
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </div>

        {/* Course/Module Info */}
        {(courseTitle || moduleTitle) && (
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 text-sm">
              {courseTitle && (
                <span className="font-medium text-amu-charcoal">{courseTitle}</span>
              )}
              {courseTitle && moduleTitle && (
                <span className="text-amu-slate">/</span>
              )}
              {moduleTitle && (
                <span className="text-amu-slate">{moduleTitle}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-lg p-2 text-amu-slate hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Refresh conversation"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Welcome Message
// ============================================

interface WelcomeMessageProps {
  title: string;
  message: string;
}

function WelcomeMessage({ title, message }: WelcomeMessageProps) {
  return (
    <div className="flex gap-3 px-4 py-6 bg-gradient-to-br from-amu-sky/30 to-amu-sky/50">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amu-sky/300 to-amu-slate text-white shadow-md">
        <Sparkles className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <h3 className="font-semibold text-amu-navy">{title}</h3>
        <div className="prose prose-sm prose-slate max-w-none">
          {message.split('\n').map((paragraph, index) => (
            <p key={index} className="text-amu-charcoal">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Ubuntu Quote */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2">
          <div className="h-1 w-1 rounded-full bg-amu-navy" />
          <p className="text-xs italic text-amu-navy">
            "I am because we are" — Ubuntu philosophy guides our learning approach
          </p>
        </div>
      </div>
    </div>
  );
}
