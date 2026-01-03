'use client';

import { memo } from 'react';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@amu/shared';
import { stripMilestoneTags } from '@/lib/competency';

// ============================================
// Types
// ============================================

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isLatest?: boolean;
  assessment?: {
    competency_id: string;
    status: 'not_yet' | 'developing' | 'competent';
  };
}

// ============================================
// Component (AMU Brand Styling - Section 9)
// ============================================

export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  timestamp,
  isLatest,
  assessment,
}: ChatMessageProps) {
  const isGuide = role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-4 transition-colors',
        isGuide ? 'bg-amu-sky/30' : 'bg-white',
        isLatest && 'animate-fade-in'
      )}
    >
      {/* Avatar - AMU Navy for Guide */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isGuide
            ? 'bg-amu-navy text-white'
            : 'bg-amu-sky text-amu-charcoal'
        )}
      >
        {isGuide ? (
          <Sparkles className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-heading text-sm font-medium',
              isGuide ? 'text-amu-navy' : 'text-amu-charcoal'
            )}
          >
            {isGuide ? 'Guide' : 'You'}
          </span>
          {timestamp && (
            <span className="font-body text-xs text-amu-slate">
              {formatDateTime(timestamp)}
            </span>
          )}
        </div>

        {/* Message Content - strip milestone tags before display */}
        <div className="prose prose-sm max-w-none prose-slate">
          <MessageContent content={stripMilestoneTags(content)} />
        </div>

        {/* Competency Assessment Badge (if present) */}
        {assessment && <CompetencyBadge assessment={assessment} />}
      </div>
    </div>
  );
});

// ============================================
// Message Content Renderer
// ============================================

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering for common patterns
  // In production, you might use a proper markdown renderer

  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Empty line
        if (!line.trim()) {
          return <div key={index} className="h-2" />;
        }

        // Bullet point
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={index} className="flex gap-2 pl-1 font-body text-amu-charcoal">
              <span className="text-amu-slate">•</span>
              <span>{line.trim().slice(2)}</span>
            </div>
          );
        }

        // Numbered list
        const numberedMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
        if (numberedMatch) {
          return (
            <div key={index} className="flex gap-2 pl-1 font-body text-amu-charcoal">
              <span className="text-amu-slate tabular-nums">
                {numberedMatch[1]}.
              </span>
              <span>{numberedMatch[2]}</span>
            </div>
          );
        }

        // Question (ends with ?) - Use heading font
        if (line.trim().endsWith('?')) {
          return (
            <p key={index} className="font-heading font-medium text-amu-navy">
              {renderInlineFormatting(line)}
            </p>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className="font-body text-amu-charcoal">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Render inline formatting (bold, italic)
 */
function renderInlineFormatting(text: string): React.ReactNode {
  // Handle **bold** and *italic*
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(
          <span key={key++}>{remaining.slice(0, boldMatch.index)}</span>
        );
      }
      parts.push(
        <strong key={key++} className="font-semibold text-amu-navy">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Check for italic - use callout font for emphasis
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(
          <span key={key++}>{remaining.slice(0, italicMatch.index)}</span>
        );
      }
      parts.push(
        <em key={key++} className="font-callout italic text-amu-slate">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    // No more formatting, add the rest
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts.length > 0 ? parts : text;
}

// ============================================
// Competency Badge - AMU Brand Colors
// ============================================

function CompetencyBadge({
  assessment,
}: {
  assessment: NonNullable<ChatMessageProps['assessment']>;
}) {
  const statusConfig = {
    not_yet: {
      label: 'Not Yet Demonstrated',
      className: 'bg-amu-sky text-amu-charcoal border-amu-slate/30',
    },
    developing: {
      label: 'Developing',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    competent: {
      label: 'Competent',
      className: 'bg-amu-sky text-amu-navy border-amu-navy/30',
    },
  };

  const config = statusConfig[assessment.status];

  return (
    <div className="mt-3 pt-3 border-t border-amu-sky">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-xs font-medium',
          config.className
        )}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            assessment.status === 'competent' && 'bg-amu-navy',
            assessment.status === 'developing' && 'bg-amber-500',
            assessment.status === 'not_yet' && 'bg-amu-slate'
          )}
        />
        {config.label}
      </div>
    </div>
  );
}
