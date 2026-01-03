/**
 * Milestone Parser - Detects and extracts milestone tags from AI responses
 *
 * The AI includes hidden tags in responses when learners achieve milestones:
 * - [MILESTONE_COMPLETE:competency_id:competency_title] - Full mastery achieved
 * - [MILESTONE_PROGRESS:competency_id:developing] - Partial progress made
 */

export interface ParsedMilestone {
  type: 'complete' | 'progress';
  competencyId: string;
  competencyTitle?: string;
  status: 'developing' | 'competent';
}

export interface MilestoneParseResult {
  cleanContent: string;
  milestone: ParsedMilestone | null;
}

// Regex patterns for milestone detection
const MILESTONE_COMPLETE_PATTERN = /\[MILESTONE_COMPLETE:([^:]+):([^\]]+)\]/g;
const MILESTONE_PROGRESS_PATTERN = /\[MILESTONE_PROGRESS:([^:]+):([^\]]+)\]/g;

/**
 * Parse an AI response to detect and extract milestone tags
 * Returns the cleaned content (without tags) and any detected milestone
 */
export function parseMilestoneFromResponse(content: string): MilestoneParseResult {
  let cleanContent = content;
  let milestone: ParsedMilestone | null = null;

  // Check for MILESTONE_COMPLETE first (higher priority)
  const completeMatch = MILESTONE_COMPLETE_PATTERN.exec(content);
  if (completeMatch) {
    milestone = {
      type: 'complete',
      competencyId: completeMatch[1].trim(),
      competencyTitle: completeMatch[2].trim(),
      status: 'competent',
    };
    // Remove the tag from content
    cleanContent = content.replace(MILESTONE_COMPLETE_PATTERN, '').trim();
  } else {
    // Check for MILESTONE_PROGRESS
    const progressMatch = MILESTONE_PROGRESS_PATTERN.exec(content);
    if (progressMatch) {
      milestone = {
        type: 'progress',
        competencyId: progressMatch[1].trim(),
        status: 'developing',
      };
      // Remove the tag from content
      cleanContent = content.replace(MILESTONE_PROGRESS_PATTERN, '').trim();
    }
  }

  // Reset regex lastIndex for subsequent calls
  MILESTONE_COMPLETE_PATTERN.lastIndex = 0;
  MILESTONE_PROGRESS_PATTERN.lastIndex = 0;

  return {
    cleanContent,
    milestone,
  };
}

/**
 * Check if a response contains any milestone tag
 */
export function hasMilestoneTag(content: string): boolean {
  const hasComplete = MILESTONE_COMPLETE_PATTERN.test(content);
  MILESTONE_COMPLETE_PATTERN.lastIndex = 0;

  const hasProgress = MILESTONE_PROGRESS_PATTERN.test(content);
  MILESTONE_PROGRESS_PATTERN.lastIndex = 0;

  return hasComplete || hasProgress;
}

/**
 * Strip all milestone tags from content for display
 */
export function stripMilestoneTags(content: string): string {
  return content
    .replace(MILESTONE_COMPLETE_PATTERN, '')
    .replace(MILESTONE_PROGRESS_PATTERN, '')
    .trim();
}

/**
 * Get competency category from ID prefix
 */
export function getCompetencyCategory(competencyId: string): string {
  const prefixMap: Record<string, string> = {
    'am-foundations': 'Asset Management Fundamentals',
    'am-strategy': 'Strategy and Planning',
    'am-lifecycle': 'Lifecycle Management',
    'am-risk': 'Risk and Performance',
    'am-info': 'Information Management',
  };

  for (const [prefix, category] of Object.entries(prefixMap)) {
    if (competencyId.startsWith(prefix)) {
      return category;
    }
  }

  return 'General Competency';
}
