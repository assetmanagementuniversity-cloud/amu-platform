'use client';

/**
 * Global Search & Intelligent Discovery Page
 *
 * Section 21: AI-powered search using Claude to interpret
 * natural language queries and map them to specific modules.
 *
 * "Ubuntu - I am because we are"
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LOGO_WITH_SLOGAN_INVERTED, LOGO_ONLY } from '@/lib/brand-assets';

// ============================================================================
// Types
// ============================================================================

interface SearchResult {
  moduleId: string;
  moduleTitle: string;
  description: string;
  framework: 'gfmam' | 'qcto';
  level?: 'foundation' | 'intermediate' | 'advanced';
  relevanceScore: number;
  matchReason: string;
  careerAlignment?: string;
  prerequisitesMet: boolean;
  learningOutcomes: string[];
  nqfLevel?: number;
  credits?: number;
}

interface CareerPath {
  role: string;
  description: string;
  progressPercentage: number;
  nextSteps: SearchResult[];
}

interface SearchSuggestion {
  text: string;
  type: 'career' | 'skill' | 'framework';
}

// ============================================================================
// Mock Data (Replace with API calls)
// ============================================================================

const CAREER_PATHS: { role: string; description: string }[] = [
  { role: 'Maintenance Planner', description: 'Plans and schedules maintenance activities' },
  { role: 'Senior Maintenance Planner', description: 'Leads maintenance planning teams and develops strategies' },
  { role: 'Reliability Engineer', description: 'Improves asset reliability and develops maintenance strategies' },
  { role: 'Asset Manager', description: 'Manages asset portfolios and develops asset strategies' },
  { role: 'Asset Management Leader', description: 'Leads asset management functions and drives organisational capability' },
];

const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { text: 'I want to become a Maintenance Planner', type: 'career' },
  { text: 'Learn reliability engineering', type: 'skill' },
  { text: 'GFMAM ISO 55000 certification', type: 'framework' },
  { text: 'Improve my scheduling skills', type: 'skill' },
  { text: 'QCTO Maintenance Planning Qualification', type: 'framework' },
];

// ============================================================================
// Search Page Component
// ============================================================================

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string | null>(null);
  const [careerProgress, setCareerProgress] = useState<CareerPath | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'gfmam' | 'qcto'>('all');
  const [contentGapMessage, setContentGapMessage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/search');
    }
  }, [user, authLoading, router]);

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setContentGapMessage(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filter: activeFilter,
          userId: user?.uid,
        }),
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.results || []);

      if (data.contentGapDetected) {
        setContentGapMessage(data.contentGapSuggestion || 'We noticed you might be looking for content we don\'t have yet. We\'ve logged this to improve our offerings.');
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock results for demo
      setSearchResults(getMockResults(query, activeFilter));
    } finally {
      setIsSearching(false);
    }
  }, [activeFilter, user?.uid]);

  // Career path selection
  const selectCareerPath = async (role: string) => {
    setSelectedCareerPath(role);
    setIsSearching(true);

    try {
      const response = await fetch('/api/search/career-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, userId: user?.uid }),
      });

      if (!response.ok) throw new Error('Failed to load career path');

      const data = await response.json();
      setCareerProgress(data);
      setSearchResults(data.nextSteps || []);
    } catch (error) {
      console.error('Career path error:', error);
      // Fallback to mock data
      setCareerProgress({
        role,
        description: CAREER_PATHS.find(p => p.role === role)?.description || '',
        progressPercentage: 25,
        nextSteps: getMockResults(`become ${role}`, 'all'),
      });
      setSearchResults(getMockResults(`become ${role}`, 'all'));
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setSelectedCareerPath(null);
    setCareerProgress(null);
    performSearch(searchQuery);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    performSearch(suggestion.text);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Image
            src={LOGO_ONLY}
            alt="Asset Management University"
            width={40}
            height={40}
            className="mx-auto h-10 w-10 animate-pulse"
          />
          <p className="mt-4 font-body text-sm text-amu-charcoal">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header - Navy Blue (Section 9.5) */}
      <header className="bg-amu-navy">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/courses" className="flex items-center">
            <Image
              src={LOGO_WITH_SLOGAN_INVERTED}
              alt="Asset Management University - Develop Capability"
              width={200}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/courses"
              className="font-body text-sm text-white/80 hover:text-white transition-colors"
            >
              My Courses
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
              <span className="font-heading text-sm">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Hero Section */}
      <section className="bg-gradient-to-b from-amu-navy to-amu-slate py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Discover Your Learning Path
          </h1>
          <p className="mt-3 font-body text-lg text-white/80">
            Tell us your career goals, and we'll guide you to the right courses
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g., 'I want to become a Senior Maintenance Planner'"
                className="w-full rounded-xl border-0 bg-white px-6 py-4 pr-14 font-body text-lg text-amu-charcoal placeholder-amu-charcoal/50 shadow-lg focus:outline-none focus:ring-4 focus:ring-amu-sky/50"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-amu-navy p-3 text-white transition-colors hover:bg-amu-navy/90 disabled:opacity-50"
              >
                {isSearching ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && !searchResults.length && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl bg-white py-2 shadow-xl">
                  <p className="px-4 py-2 font-body text-xs font-medium uppercase tracking-wide text-amu-charcoal/60">
                    Try searching for...
                  </p>
                  {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amu-sky/20"
                    >
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        suggestion.type === 'career' ? 'bg-amu-navy/10 text-amu-navy' :
                        suggestion.type === 'skill' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {suggestion.type === 'career' ? '🎯' : suggestion.type === 'skill' ? '🔧' : '📜'}
                      </span>
                      <span className="font-body text-amu-charcoal">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Framework Filter Tabs */}
          <div className="mt-6 flex justify-center gap-2">
            {(['all', 'gfmam', 'qcto'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  if (searchQuery) performSearch(searchQuery);
                }}
                className={`rounded-full px-4 py-2 font-body text-sm transition-colors ${
                  activeFilter === filter
                    ? 'bg-white text-amu-navy'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {filter === 'all' ? 'All Courses' : filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 bg-amu-sky/10 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Content Gap Alert */}
          {contentGapMessage && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="font-body text-sm text-amber-800">{contentGapMessage}</p>
                  <p className="mt-1 font-body text-xs text-amber-600">
                    Your feedback helps us build better learning experiences.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Career Path Selection (when no search) */}
          {!searchResults.length && !isSearching && !careerProgress && (
            <section className="mb-8">
              <h2 className="font-heading text-xl font-semibold text-amu-navy">
                Choose Your Career Path
              </h2>
              <p className="mt-1 font-body text-sm text-amu-charcoal/70">
                Select a career goal to see your personalized learning journey
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CAREER_PATHS.map((path) => (
                  <button
                    key={path.role}
                    onClick={() => selectCareerPath(path.role)}
                    className="group rounded-xl border border-amu-slate/20 bg-white p-6 text-left shadow-sm transition-all hover:border-amu-navy/30 hover:shadow-md"
                  >
                    <h3 className="font-heading text-lg font-semibold text-amu-navy group-hover:text-amu-navy/80">
                      {path.role}
                    </h3>
                    <p className="mt-2 font-body text-sm text-amu-charcoal/70">
                      {path.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 font-body text-sm font-medium text-amu-navy">
                      View path
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Career Progress (when career path selected) */}
          {careerProgress && (
            <section className="mb-8">
              <div className="rounded-xl border border-amu-slate/20 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-amu-charcoal/60">Your path to</p>
                    <h2 className="font-heading text-2xl font-bold text-amu-navy">
                      {careerProgress.role}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setCareerProgress(null);
                      setSelectedCareerPath(null);
                      setSearchResults([]);
                    }}
                    className="font-body text-sm text-amu-slate hover:text-amu-navy"
                  >
                    Change path
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-body text-amu-charcoal/70">Progress</span>
                    <span className="font-heading font-semibold text-amu-navy">
                      {careerProgress.progressPercentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-amu-sky/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amu-navy to-amu-slate transition-all duration-500"
                      style={{ width: `${careerProgress.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Search Results */}
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amu-sky border-t-amu-navy" />
                <p className="mt-4 font-body text-sm text-amu-charcoal/70">
                  Finding the best courses for you...
                </p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold text-amu-navy">
                  {careerProgress ? 'Recommended Next Steps' : 'Search Results'}
                </h2>
                <span className="font-body text-sm text-amu-charcoal/60">
                  {searchResults.length} course{searchResults.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {/* Results Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((result, index) => (
                  <ModuleCard key={result.moduleId} result={result} priority={index + 1} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="amu-footer-bar">
        <p className="font-system text-amu-charcoal">
          You can. | assetmanagementuniversity.org
        </p>
      </footer>
    </div>
  );
}

// ============================================================================
// Module Card Component
// ============================================================================

interface ModuleCardProps {
  result: SearchResult;
  priority: number;
}

function ModuleCard({ result, priority }: ModuleCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-amu-slate/20 bg-white shadow-sm transition-all hover:shadow-lg">
      {/* Priority Badge */}
      {priority <= 3 && (
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amu-navy font-heading text-sm font-bold text-white">
          {priority}
        </div>
      )}

      {/* Framework Badge */}
      <div className={`px-4 py-2 ${
        result.framework === 'gfmam' ? 'bg-amu-navy/5' : 'bg-purple-50'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
            result.framework === 'gfmam'
              ? 'bg-amu-navy/10 text-amu-navy'
              : 'bg-purple-100 text-purple-700'
          }`}>
            {result.framework.toUpperCase()}
          </span>
          {result.level && (
            <span className={`rounded-full px-2.5 py-0.5 font-body text-xs ${
              result.level === 'foundation' ? 'bg-green-100 text-green-700' :
              result.level === 'intermediate' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {result.level.charAt(0).toUpperCase() + result.level.slice(1)}
            </span>
          )}
          {result.nqfLevel && (
            <span className="rounded-full bg-amu-sky/50 px-2.5 py-0.5 font-body text-xs text-amu-navy">
              NQF {result.nqfLevel}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-amu-navy line-clamp-2">
          {result.moduleTitle}
        </h3>
        <p className="mt-2 font-body text-sm text-amu-charcoal/70 line-clamp-2">
          {result.description}
        </p>

        {/* Match Reason */}
        <div className="mt-3 rounded-lg bg-amu-sky/20 p-3">
          <p className="font-body text-xs text-amu-charcoal/80">
            <span className="font-medium">Why this course:</span> {result.matchReason}
          </p>
        </div>

        {/* Learning Outcomes Preview */}
        {result.learningOutcomes.length > 0 && (
          <div className="mt-3">
            <p className="font-body text-xs font-medium text-amu-charcoal/60">
              You'll learn to:
            </p>
            <ul className="mt-1 space-y-1">
              {result.learningOutcomes.slice(0, 2).map((outcome, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-xs text-amu-charcoal/70">
                  <svg className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="line-clamp-1">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prerequisites Warning */}
        {!result.prerequisitesMet && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 p-2">
            <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-body text-xs text-amber-700">Prerequisites required</span>
          </div>
        )}

        {/* Credits */}
        {result.credits && (
          <div className="mt-3 flex items-center gap-2">
            <span className="font-body text-xs text-amu-charcoal/60">
              {result.credits} credits
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="border-t border-amu-slate/10 p-4">
        <Link
          href={`/courses/${result.moduleId}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amu-navy py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-amu-navy/90"
        >
          View Course
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Mock Results (For development/demo)
// ============================================================================

function getMockResults(query: string, filter: 'all' | 'gfmam' | 'qcto'): SearchResult[] {
  const queryLower = query.toLowerCase();

  const allResults: SearchResult[] = [
    {
      moduleId: 'gfmam-335',
      moduleTitle: '335: Maintenance Delivery',
      description: 'Executing maintenance activities effectively, including planning, scheduling, and resource management.',
      framework: 'gfmam',
      level: 'foundation',
      relevanceScore: 0.95,
      matchReason: 'Core skill for maintenance planning roles',
      careerAlignment: 'Essential for Maintenance Planner path',
      prerequisitesMet: true,
      learningOutcomes: [
        'Plan and schedule maintenance work',
        'Execute maintenance safely and efficiently',
        'Manage maintenance resources',
      ],
    },
    {
      moduleId: 'qcto-KM-01',
      moduleTitle: 'KM-01: Maintenance Planning Fundamentals',
      description: 'Foundation concepts and principles of maintenance planning for asset-intensive organisations.',
      framework: 'qcto',
      level: 'foundation',
      nqfLevel: 5,
      credits: 8,
      relevanceScore: 0.92,
      matchReason: 'Starting point for QCTO qualification',
      careerAlignment: 'First module in Maintenance Planner qualification',
      prerequisitesMet: true,
      learningOutcomes: [
        'Explain maintenance planning concepts and terminology',
        'Describe maintenance strategies and their applications',
        'Understand the role of planning in asset management',
      ],
    },
    {
      moduleId: 'gfmam-322',
      moduleTitle: '322: Operations & Maintenance Decision-Making',
      description: 'Optimising operations and maintenance decisions to balance cost, risk, and performance.',
      framework: 'gfmam',
      level: 'intermediate',
      relevanceScore: 0.88,
      matchReason: 'Develops strategic decision-making skills',
      careerAlignment: 'Key for Senior Maintenance Planner progression',
      prerequisitesMet: false,
      learningOutcomes: [
        'Develop maintenance strategies',
        'Optimise inspection and testing regimes',
        'Balance cost, risk, and performance',
      ],
    },
    {
      moduleId: 'qcto-KM-02',
      moduleTitle: 'KM-02: Work Order Management',
      description: 'Managing work orders through the complete lifecycle from creation to completion.',
      framework: 'qcto',
      level: 'foundation',
      nqfLevel: 5,
      credits: 10,
      relevanceScore: 0.85,
      matchReason: 'Practical work management skills',
      prerequisitesMet: true,
      learningOutcomes: [
        'Create and process work orders',
        'Prioritise and schedule maintenance activities',
        'Track work order completion and costs',
      ],
    },
    {
      moduleId: 'gfmam-336',
      moduleTitle: '336: Reliability Engineering',
      description: 'Applying reliability engineering principles including FMEA, predictive maintenance, and improvement programs.',
      framework: 'gfmam',
      level: 'advanced',
      relevanceScore: 0.82,
      matchReason: 'Advanced skills for reliability-focused roles',
      careerAlignment: 'Critical for Reliability Engineer path',
      prerequisitesMet: false,
      learningOutcomes: [
        'Apply reliability analysis techniques',
        'Develop reliability improvement programs',
        'Implement predictive maintenance strategies',
      ],
    },
    {
      moduleId: 'qcto-KM-03',
      moduleTitle: 'KM-03: Resource Planning & Scheduling',
      description: 'Planning and scheduling maintenance resources effectively for optimal utilisation.',
      framework: 'qcto',
      level: 'intermediate',
      nqfLevel: 5,
      credits: 10,
      relevanceScore: 0.80,
      matchReason: 'Core scheduling competency',
      prerequisitesMet: false,
      learningOutcomes: [
        'Estimate resource requirements for maintenance work',
        'Develop maintenance schedules',
        'Optimise resource utilisation',
      ],
    },
  ];

  // Filter by framework if specified
  let filtered = filter === 'all'
    ? allResults
    : allResults.filter(r => r.framework === filter);

  // Simple relevance boost based on query keywords
  if (queryLower.includes('maintenance') || queryLower.includes('planner')) {
    filtered = filtered.sort((a, b) => {
      const aMatch = a.moduleTitle.toLowerCase().includes('maintenance') ? 1 : 0;
      const bMatch = b.moduleTitle.toLowerCase().includes('maintenance') ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  if (queryLower.includes('reliability')) {
    filtered = filtered.sort((a, b) => {
      const aMatch = a.moduleTitle.toLowerCase().includes('reliability') ? 1 : 0;
      const bMatch = b.moduleTitle.toLowerCase().includes('reliability') ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  return filtered.slice(0, 6);
}
