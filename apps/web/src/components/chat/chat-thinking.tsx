'use client';

import { useState, useEffect, memo } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Socratic Thinking Phrases (Section 9.6 Brand Voice)
// Voice: Warm, encouraging, Socratic (Learning facilitation)
// Empowering, Accessible, Honest, Warm, Purpose-driven
// ============================================

const THINKING_PHRASES = [
  // Warm and encouraging
  'Taking a moment to reflect on what you shared...',
  'Considering how best to guide you forward...',
  'Finding the right question to spark your insight...',
  'Connecting this to what you already understand...',
  'Thinking about how this builds your capability...',
  // Purpose-driven (capability development)
  'Exploring how this develops your skills...',
  'Considering your unique learning journey...',
  'Reflecting on how to help you discover...',
  'Finding connections that matter to you...',
  'Preparing a thoughtful response for you...',
];

// Ubuntu Philosophy Phrases (Section 9.6)
// "I am because we are" - warmth, community, shared learning
const UBUNTU_PHRASES = [
  '"I am because we are" — thinking alongside you...',
  'We walk this learning path together...',
  'Your insights help us both grow...',
  'Building understanding together, step by step...',
  'Every question you ask strengthens our shared learning...',
  'You can. Let me help you see how...',
  'Your capability is within reach...',
  'Together, we develop what you need to succeed...',
];

// ============================================
// Component
// ============================================

export const ChatThinking = memo(function ChatThinking() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showUbuntu, setShowUbuntu] = useState(false);

  // Rotate through thinking phrases
  useEffect(() => {
    const interval = setInterval(() => {
      // Occasionally show an Ubuntu phrase (30% chance)
      if (Math.random() > 0.7) {
        setShowUbuntu(true);
        setPhraseIndex(Math.floor(Math.random() * UBUNTU_PHRASES.length));
      } else {
        setShowUbuntu(false);
        setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentPhrase = showUbuntu
    ? UBUNTU_PHRASES[phraseIndex]
    : THINKING_PHRASES[phraseIndex];

  return (
    <div className="flex gap-3 px-4 py-4 bg-amu-sky/30 animate-fade-in">
      {/* Avatar - AMU Navy theme */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amu-navy text-white">
        <Sparkles className="h-4 w-4 animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-heading text-sm font-medium text-amu-navy">Guide</span>
        </div>

        {/* Thinking Animation */}
        <div className="flex items-start gap-3">
          {/* Animated Dots - AMU Navy */}
          <div className="flex items-center gap-1 pt-1">
            <ThinkingDot delay={0} />
            <ThinkingDot delay={150} />
            <ThinkingDot delay={300} />
          </div>

          {/* Rotating Phrase */}
          <p
            className={cn(
              'font-body text-sm transition-opacity duration-300',
              showUbuntu ? 'font-callout text-amu-slate italic' : 'text-amu-charcoal'
            )}
          >
            {currentPhrase}
          </p>
        </div>

        {/* Progress Bar - AMU Navy gradient */}
        <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-amu-sky">
          <div className="h-full animate-thinking-progress bg-gradient-to-r from-amu-navy via-amu-slate to-amu-navy" />
        </div>
      </div>
    </div>
  );
});

// ============================================
// Thinking Dot - AMU Navy colour
// ============================================

function ThinkingDot({ delay }: { delay: number }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-amu-navy animate-bounce"
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '1s',
      }}
    />
  );
}

// ============================================
// Minimal Thinking Indicator (for inline use)
// ============================================

export const ChatThinkingInline = memo(function ChatThinkingInline() {
  return (
    <div className="flex items-center gap-2 font-body text-sm text-amu-charcoal">
      <div className="flex items-center gap-1">
        <ThinkingDot delay={0} />
        <ThinkingDot delay={150} />
        <ThinkingDot delay={300} />
      </div>
      <span>Your guide is thinking...</span>
    </div>
  );
});
