/**
 * Content Loader Service - AMU Platform
 *
 * Fetches course content from the amu-content GitHub repository.
 * Per Section 6.3: Content stored in separate public repository.
 *
 * Features:
 * - Fetches from GitHub raw content (raw.githubusercontent.com)
 * - In-memory caching with TTL
 * - Fallback to Firestore for production
 * - Markdown parsing
 *
 * "Ubuntu - I am because we are"
 */

import type {
  ModuleMetadata,
  Competency,
  CaseStudy,
  FacilitatorPlaybook,
  EmailTemplate,
  UIMessages,
  CachedContent,
  ContentLoadResult,
} from './types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONTENT_REPO = process.env.NEXT_PUBLIC_CONTENT_REPO || 'amu-org/amu-content';
const CONTENT_BRANCH = process.env.NEXT_PUBLIC_CONTENT_BRANCH || 'main';
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${CONTENT_REPO}/${CONTENT_BRANCH}`;

// Cache TTL: 5 minutes in dev, 1 hour in production
const CACHE_TTL_MS = process.env.NODE_ENV === 'production' ? 60 * 60 * 1000 : 5 * 60 * 1000;

// In-memory cache
const contentCache = new Map<string, CachedContent<unknown>>();

// =============================================================================
// CACHE HELPERS
// =============================================================================

/**
 * Get item from cache if not expired
 */
function getCached<T>(key: string): T | null {
  const cached = contentCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expires_at) {
    contentCache.delete(key);
    return null;
  }

  return cached.content as T;
}

/**
 * Set item in cache
 */
function setCache<T>(key: string, content: T, source: 'github' | 'firestore' = 'github'): void {
  const now = Date.now();
  contentCache.set(key, {
    content,
    cached_at: now,
    expires_at: now + CACHE_TTL_MS,
    source,
  });
}

/**
 * Clear all cached content
 */
export function clearContentCache(): void {
  contentCache.clear();
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string): void {
  contentCache.delete(key);
}

// =============================================================================
// GITHUB FETCHING
// =============================================================================

/**
 * Fetch raw content from GitHub
 */
async function fetchFromGitHub(path: string): Promise<string | null> {
  const url = `${GITHUB_RAW_BASE}/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
      },
      next: {
        revalidate: CACHE_TTL_MS / 1000, // Next.js cache
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[ContentLoader] Content not found: ${path}`);
        return null;
      }
      throw new Error(`GitHub fetch failed: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`[ContentLoader] Error fetching ${path}:`, error);
    return null;
  }
}

/**
 * Fetch and parse JSON content from GitHub
 */
async function fetchJSON<T>(path: string): Promise<T | null> {
  const content = await fetchFromGitHub(path);
  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`[ContentLoader] Error parsing JSON from ${path}:`, error);
    return null;
  }
}

// =============================================================================
// MODULE CONTENT LOADERS
// =============================================================================

/**
 * Load module metadata
 */
export async function loadModuleMetadata(
  courseId: string,
  moduleId: string
): Promise<ContentLoadResult<ModuleMetadata>> {
  const cacheKey = `module:${courseId}:${moduleId}`;

  // Check cache first
  const cached = getCached<ModuleMetadata>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `courses/${courseId}/${moduleId}/module.json`;
  const data = await fetchJSON<ModuleMetadata>(path);

  if (!data) {
    return { success: false, error: 'Module not found', fromCache: false };
  }

  setCache(cacheKey, data);
  return { success: true, data, fromCache: false };
}

/**
 * Load module competencies
 */
export async function loadModuleCompetencies(
  courseId: string,
  moduleId: string
): Promise<ContentLoadResult<Competency[]>> {
  const cacheKey = `competencies:${courseId}:${moduleId}`;

  // Check cache first
  const cached = getCached<Competency[]>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `courses/${courseId}/${moduleId}/competencies.json`;
  const data = await fetchJSON<{ competencies: Competency[] }>(path);

  if (!data?.competencies) {
    return { success: false, error: 'Competencies not found', fromCache: false };
  }

  setCache(cacheKey, data.competencies);
  return { success: true, data: data.competencies, fromCache: false };
}

/**
 * Load module case study (markdown)
 */
export async function loadCaseStudy(
  courseId: string,
  moduleId: string
): Promise<ContentLoadResult<string>> {
  const cacheKey = `casestudy:${courseId}:${moduleId}`;

  // Check cache first
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `courses/${courseId}/${moduleId}/case-study.md`;
  const content = await fetchFromGitHub(path);

  if (!content) {
    return { success: false, error: 'Case study not found', fromCache: false };
  }

  setCache(cacheKey, content);
  return { success: true, data: content, fromCache: false };
}

/**
 * Load facilitator playbook
 */
export async function loadFacilitatorPlaybook(
  courseId: string,
  moduleId: string
): Promise<ContentLoadResult<FacilitatorPlaybook>> {
  const cacheKey = `playbook:${courseId}:${moduleId}`;

  // Check cache first
  const cached = getCached<FacilitatorPlaybook>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `courses/${courseId}/${moduleId}/facilitator-playbook.json`;
  const data = await fetchJSON<FacilitatorPlaybook>(path);

  if (!data) {
    return { success: false, error: 'Facilitator playbook not found', fromCache: false };
  }

  setCache(cacheKey, data);
  return { success: true, data, fromCache: false };
}

/**
 * Load discovery questions for a module
 */
export async function loadDiscoveryQuestions(
  courseId: string,
  moduleId: string
): Promise<ContentLoadResult<string>> {
  const cacheKey = `discovery:${courseId}:${moduleId}`;

  // Check cache first
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `courses/${courseId}/${moduleId}/discovery-questions.md`;
  const content = await fetchFromGitHub(path);

  if (!content) {
    return { success: false, error: 'Discovery questions not found', fromCache: false };
  }

  setCache(cacheKey, content);
  return { success: true, data: content, fromCache: false };
}

/**
 * Load scaffolding strategies for a module
 */
export async function loadScaffoldingStrategies(
  courseId: string,
  moduleId: string
): Promise<ContentLoadResult<string>> {
  const cacheKey = `scaffolding:${courseId}:${moduleId}`;

  // Check cache first
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `courses/${courseId}/${moduleId}/scaffolding-strategies.md`;
  const content = await fetchFromGitHub(path);

  if (!content) {
    return { success: false, error: 'Scaffolding strategies not found', fromCache: false };
  }

  setCache(cacheKey, content);
  return { success: true, data: content, fromCache: false };
}

/**
 * Load common misconceptions for a module
 */
export async function loadCommonMisconceptions(
  courseId: string,
  moduleId: string
): Promise<ContentLoadResult<string>> {
  const cacheKey = `misconceptions:${courseId}:${moduleId}`;

  // Check cache first
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `courses/${courseId}/${moduleId}/common-misconceptions.md`;
  const content = await fetchFromGitHub(path);

  if (!content) {
    return { success: false, error: 'Common misconceptions not found', fromCache: false };
  }

  setCache(cacheKey, content);
  return { success: true, data: content, fromCache: false };
}

// =============================================================================
// EMAIL TEMPLATE LOADERS
// =============================================================================

/**
 * Load email template
 */
export async function loadEmailTemplate(
  templateId: string
): Promise<ContentLoadResult<EmailTemplate>> {
  const cacheKey = `email:${templateId}`;

  // Check cache first
  const cached = getCached<EmailTemplate>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `email-templates/${templateId}.json`;
  const data = await fetchJSON<EmailTemplate>(path);

  if (!data) {
    return { success: false, error: 'Email template not found', fromCache: false };
  }

  setCache(cacheKey, data);
  return { success: true, data, fromCache: false };
}

/**
 * Load email template body (markdown)
 */
export async function loadEmailTemplateBody(
  templateId: string
): Promise<ContentLoadResult<string>> {
  const cacheKey = `email-body:${templateId}`;

  // Check cache first
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = `email-templates/${templateId}.md`;
  const content = await fetchFromGitHub(path);

  if (!content) {
    return { success: false, error: 'Email template not found', fromCache: false };
  }

  setCache(cacheKey, content);
  return { success: true, data: content, fromCache: false };
}

// =============================================================================
// UI TEXT LOADERS
// =============================================================================

/**
 * Load UI messages
 */
export async function loadUIMessages(): Promise<ContentLoadResult<UIMessages>> {
  const cacheKey = 'ui-messages';

  // Check cache first
  const cached = getCached<UIMessages>(cacheKey);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }

  // Fetch from GitHub
  const path = 'ui-text/messages.json';
  const data = await fetchJSON<UIMessages>(path);

  if (!data) {
    return { success: false, error: 'UI messages not found', fromCache: false };
  }

  setCache(cacheKey, data);
  return { success: true, data, fromCache: false };
}

// =============================================================================
// BULK LOADING
// =============================================================================

/**
 * Load all content for a module
 */
export async function loadFullModuleContent(
  courseId: string,
  moduleId: string
): Promise<{
  metadata: ContentLoadResult<ModuleMetadata>;
  competencies: ContentLoadResult<Competency[]>;
  caseStudy: ContentLoadResult<string>;
  playbook: ContentLoadResult<FacilitatorPlaybook>;
  discoveryQuestions: ContentLoadResult<string>;
  scaffolding: ContentLoadResult<string>;
  misconceptions: ContentLoadResult<string>;
}> {
  // Load all content in parallel
  const [
    metadata,
    competencies,
    caseStudy,
    playbook,
    discoveryQuestions,
    scaffolding,
    misconceptions,
  ] = await Promise.all([
    loadModuleMetadata(courseId, moduleId),
    loadModuleCompetencies(courseId, moduleId),
    loadCaseStudy(courseId, moduleId),
    loadFacilitatorPlaybook(courseId, moduleId),
    loadDiscoveryQuestions(courseId, moduleId),
    loadScaffoldingStrategies(courseId, moduleId),
    loadCommonMisconceptions(courseId, moduleId),
  ]);

  return {
    metadata,
    competencies,
    caseStudy,
    playbook,
    discoveryQuestions,
    scaffolding,
    misconceptions,
  };
}

// =============================================================================
// CONTENT REFRESH
// =============================================================================

/**
 * Force refresh all cached content for a module
 */
export async function refreshModuleContent(
  courseId: string,
  moduleId: string
): Promise<void> {
  // Clear relevant cache entries
  const keysToDelete = [
    `module:${courseId}:${moduleId}`,
    `competencies:${courseId}:${moduleId}`,
    `casestudy:${courseId}:${moduleId}`,
    `playbook:${courseId}:${moduleId}`,
    `discovery:${courseId}:${moduleId}`,
    `scaffolding:${courseId}:${moduleId}`,
    `misconceptions:${courseId}:${moduleId}`,
  ];

  keysToDelete.forEach((key) => contentCache.delete(key));

  // Reload content
  await loadFullModuleContent(courseId, moduleId);
}

// =============================================================================
// API ENDPOINT FOR CONTENT SYNC
// =============================================================================

/**
 * API handler for content sync webhook (called by GitHub Action)
 * This would be called from an API route
 */
export async function handleContentSyncWebhook(
  courseId?: string,
  moduleId?: string
): Promise<{ success: boolean; message: string }> {
  if (courseId && moduleId) {
    // Refresh specific module
    await refreshModuleContent(courseId, moduleId);
    return {
      success: true,
      message: `Refreshed content for ${courseId}/${moduleId}`,
    };
  }

  // Clear all cache
  clearContentCache();
  return {
    success: true,
    message: 'Cleared all content cache',
  };
}
