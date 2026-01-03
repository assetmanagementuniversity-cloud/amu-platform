/**
 * AI Search Interpreter - AMU Platform
 *
 * Section 21.2: Natural Language Search
 *
 * Uses Claude to interpret natural language queries like
 * "I want to be a senior maintenance planner" and map them
 * to specific GFMAM and QCTO modules.
 *
 * "Ubuntu - I am because we are"
 */

import { getAnthropicClient, defaultConfig } from '../client';
import type {
  SearchableModule,
  CareerPath,
} from '@amu/database';

// ============================================================================
// Types
// ============================================================================

export interface SearchIntent {
  type: 'career_goal' | 'skill_development' | 'specific_topic' | 'certification' | 'general';
  careerRole?: string;
  skills: string[];
  topics: string[];
  level?: 'foundation' | 'intermediate' | 'advanced';
  framework?: 'gfmam' | 'qcto' | 'both';
  urgency?: 'immediate' | 'planned' | 'exploring';
}

export interface InterpretedQuery {
  originalQuery: string;
  intent: SearchIntent;
  searchTerms: string[];
  suggestedFilters: {
    level?: 'foundation' | 'intermediate' | 'advanced';
    framework?: 'gfmam' | 'qcto';
    nqfLevel?: number;
  };
  careerContext?: string;
  confidenceScore: number;
}

export interface SearchRecommendation {
  module: SearchableModule;
  relevanceScore: number;
  matchReason: string;
  careerAlignment?: string;
  prerequisitesMet: boolean;
  suggestedOrder: number;
}

export interface AISearchResult {
  query: InterpretedQuery;
  recommendations: SearchRecommendation[];
  careerInsight?: string;
  suggestedLearningPath?: string[];
  contentGapDetected: boolean;
  contentGapSuggestion?: string;
}

// ============================================================================
// Search Interpretation System Prompt
// ============================================================================

const SEARCH_INTERPRETER_PROMPT = `You are the AMU (Asset Management University) search assistant. Your role is to interpret learner queries and help them find the right learning modules.

AMU offers two frameworks:
1. GFMAM (Global Forum on Maintenance and Asset Management) - 39 subjects covering ISO 55000 aligned asset management
2. QCTO (Quality Council for Trades and Occupations) Maintenance Planning Qualification - NQF Level 5, 120 credits

GFMAM Groups:
- Group 1: Strategy & Planning (311-316)
- Group 2: Decision-Making (321-325)
- Group 3: Lifecycle Delivery (331-338)
- Group 4: Asset Information (341-345)
- Group 5: Organisation & People (351-356)
- Group 6: Risk & Review (361-365)

QCTO Modules:
- Knowledge Modules: KM-01 to KM-07 (60 credits)
- Practical Modules: PM-01 to PM-03 (40 credits)
- Work Experience: WE-01 (20 credits)

When interpreting queries:
1. Identify the user's intent (career goal, skill development, specific topic, certification, or general)
2. Extract relevant skills and topics they're interested in
3. Determine their current level if mentioned
4. Suggest appropriate search terms and filters
5. Provide career context when relevant

Career levels:
- Foundation: New to asset management, basic concepts
- Intermediate: Some experience, building specific skills
- Advanced: Experienced professionals, leadership and strategy

Common career paths:
- Maintenance Planner → Senior Maintenance Planner → Maintenance Manager
- Reliability Engineer → Asset Manager → Asset Management Leader
- Asset Information Analyst → Asset Data Manager → Digital Asset Manager

Respond in JSON format with the following structure:
{
  "intent": {
    "type": "career_goal|skill_development|specific_topic|certification|general",
    "careerRole": "if applicable",
    "skills": ["list", "of", "skills"],
    "topics": ["list", "of", "topics"],
    "level": "foundation|intermediate|advanced",
    "framework": "gfmam|qcto|both",
    "urgency": "immediate|planned|exploring"
  },
  "searchTerms": ["term1", "term2"],
  "suggestedFilters": {
    "level": "if applicable",
    "framework": "if applicable",
    "nqfLevel": "if applicable"
  },
  "careerContext": "Brief context about how this relates to their career",
  "confidenceScore": 0.0-1.0
}`;

// ============================================================================
// Module Ranking Prompt
// ============================================================================

const MODULE_RANKING_PROMPT = `You are ranking learning modules for an AMU learner based on their query and the available modules.

For each module, consider:
1. How well it matches the learner's stated goals
2. Its relevance to their career path
3. The logical learning sequence (prerequisites)
4. Their current level and progression

Provide rankings with clear reasoning. Focus on practical career value.

Respond in JSON format:
{
  "rankings": [
    {
      "moduleId": "module-id",
      "relevanceScore": 0.0-1.0,
      "matchReason": "Why this module matches their needs",
      "careerAlignment": "How it supports their career goals",
      "suggestedOrder": 1
    }
  ],
  "careerInsight": "Overall insight about their learning journey",
  "suggestedLearningPath": ["module-id-1", "module-id-2", "..."],
  "contentGapDetected": true/false,
  "contentGapSuggestion": "If gap detected, what content would help"
}`;

// ============================================================================
// Search Interpreter Functions
// ============================================================================

/**
 * Interpret a natural language search query
 */
export async function interpretSearchQuery(
  query: string,
  userContext?: {
    completedModules?: string[];
    currentRole?: string;
    careerGoal?: string;
  }
): Promise<InterpretedQuery> {
  const client = getAnthropicClient();

  const contextInfo = userContext
    ? `
User Context:
- Completed Modules: ${userContext.completedModules?.join(', ') || 'None'}
- Current Role: ${userContext.currentRole || 'Not specified'}
- Career Goal: ${userContext.careerGoal || 'Not specified'}`
    : '';

  const response = await client.messages.create({
    ...defaultConfig,
    system: SEARCH_INTERPRETER_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Interpret this search query: "${query}"${contextInfo}`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  const content = textContent && 'text' in textContent ? textContent.text : '{}';

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const parsed = JSON.parse(jsonStr);

    return {
      originalQuery: query,
      intent: {
        type: parsed.intent?.type || 'general',
        careerRole: parsed.intent?.careerRole,
        skills: parsed.intent?.skills || [],
        topics: parsed.intent?.topics || [],
        level: parsed.intent?.level,
        framework: parsed.intent?.framework,
        urgency: parsed.intent?.urgency || 'exploring',
      },
      searchTerms: parsed.searchTerms || [query],
      suggestedFilters: parsed.suggestedFilters || {},
      careerContext: parsed.careerContext,
      confidenceScore: parsed.confidenceScore || 0.5,
    };
  } catch {
    // Fallback to basic interpretation
    return {
      originalQuery: query,
      intent: {
        type: 'general',
        skills: [],
        topics: query.toLowerCase().split(' ').filter((w) => w.length > 3),
      },
      searchTerms: query.toLowerCase().split(' ').filter((w) => w.length > 3),
      suggestedFilters: {},
      confidenceScore: 0.3,
    };
  }
}

/**
 * Rank modules based on interpreted query
 */
export async function rankModulesForQuery(
  interpretedQuery: InterpretedQuery,
  availableModules: SearchableModule[],
  completedModuleIds: string[] = []
): Promise<AISearchResult> {
  const client = getAnthropicClient();

  // Filter out completed modules
  const uncompletedModules = availableModules.filter(
    (m) => !completedModuleIds.includes(m.id)
  );

  // Limit to top 20 potentially relevant modules for AI ranking
  const candidateModules = uncompletedModules
    .filter((m) => {
      const queryLower = interpretedQuery.originalQuery.toLowerCase();
      const searchVector = m.searchVector.toLowerCase();
      return (
        interpretedQuery.searchTerms.some((term) => searchVector.includes(term)) ||
        searchVector.includes(queryLower) ||
        m.title.toLowerCase().includes(queryLower)
      );
    })
    .slice(0, 20);

  // If no candidates found, use general modules based on intent
  const modulesToRank = candidateModules.length > 0
    ? candidateModules
    : uncompletedModules
        .filter((m) => {
          if (interpretedQuery.suggestedFilters.framework) {
            return m.framework === interpretedQuery.suggestedFilters.framework;
          }
          if (interpretedQuery.suggestedFilters.level) {
            return m.level === interpretedQuery.suggestedFilters.level;
          }
          return true;
        })
        .slice(0, 15);

  const moduleContext = modulesToRank.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    framework: m.framework,
    level: m.level,
    learningOutcomes: m.learningOutcomes.slice(0, 3),
    competencies: m.competencies.slice(0, 3),
    prerequisites: m.prerequisites,
  }));

  const response = await client.messages.create({
    ...defaultConfig,
    system: MODULE_RANKING_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Query: "${interpretedQuery.originalQuery}"
Intent: ${JSON.stringify(interpretedQuery.intent)}

Available Modules:
${JSON.stringify(moduleContext, null, 2)}

Rank these modules by relevance to the learner's needs.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  const content = textContent && 'text' in textContent ? textContent.text : '{}';

  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const parsed = JSON.parse(jsonStr);

    const recommendations: SearchRecommendation[] = (parsed.rankings || [])
      .map((ranking: {
        moduleId: string;
        relevanceScore: number;
        matchReason: string;
        careerAlignment?: string;
        suggestedOrder: number;
      }) => {
        const module = modulesToRank.find((m) => m.id === ranking.moduleId);
        if (!module) return null;

        const prerequisitesMet = module.prerequisites.every(
          (prereq) => completedModuleIds.includes(prereq)
        );

        return {
          module,
          relevanceScore: ranking.relevanceScore || 0.5,
          matchReason: ranking.matchReason || 'Matches your search criteria',
          careerAlignment: ranking.careerAlignment,
          prerequisitesMet,
          suggestedOrder: ranking.suggestedOrder || 99,
        };
      })
      .filter(Boolean)
      .sort((a: SearchRecommendation, b: SearchRecommendation) =>
        a.suggestedOrder - b.suggestedOrder
      );

    return {
      query: interpretedQuery,
      recommendations,
      careerInsight: parsed.careerInsight,
      suggestedLearningPath: parsed.suggestedLearningPath,
      contentGapDetected: parsed.contentGapDetected || recommendations.length === 0,
      contentGapSuggestion: parsed.contentGapSuggestion,
    };
  } catch {
    // Fallback to basic ranking
    const recommendations: SearchRecommendation[] = modulesToRank
      .slice(0, 10)
      .map((module, index) => ({
        module,
        relevanceScore: 0.5 - index * 0.05,
        matchReason: 'Matches your search terms',
        prerequisitesMet: module.prerequisites.every((prereq) =>
          completedModuleIds.includes(prereq)
        ),
        suggestedOrder: index + 1,
      }));

    return {
      query: interpretedQuery,
      recommendations,
      contentGapDetected: recommendations.length === 0,
    };
  }
}

/**
 * Get career-based recommendations
 */
export async function getCareerRecommendations(
  careerPath: CareerPath,
  completedModuleIds: string[],
  availableModules: SearchableModule[]
): Promise<{
  nextSteps: SearchRecommendation[];
  progressPercentage: number;
  careerInsight: string;
}> {
  const client = getAnthropicClient();

  const recommendedModules = availableModules.filter((m) =>
    careerPath.recommendedModules.includes(m.id)
  );

  const completedRecommended = recommendedModules.filter((m) =>
    completedModuleIds.includes(m.id)
  );

  const remainingModules = recommendedModules.filter(
    (m) => !completedModuleIds.includes(m.id)
  );

  const progressPercentage = recommendedModules.length > 0
    ? (completedRecommended.length / recommendedModules.length) * 100
    : 0;

  // Get AI insight on next steps
  const response = await client.messages.create({
    ...defaultConfig,
    max_tokens: 500,
    system: `You are a career advisor for asset management professionals. Provide brief, actionable guidance.`,
    messages: [
      {
        role: 'user',
        content: `Career Goal: ${careerPath.role}
Progress: ${Math.round(progressPercentage)}% complete
Completed: ${completedRecommended.map((m) => m.title).join(', ') || 'None yet'}
Remaining: ${remainingModules.map((m) => m.title).join(', ')}

Provide a brief career insight (2-3 sentences) about their progress and recommended next focus.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  const careerInsight = textContent && 'text' in textContent
    ? textContent.text
    : `You're ${Math.round(progressPercentage)}% of the way to ${careerPath.role}. Keep progressing!`;

  // Order remaining modules by prerequisites
  const nextSteps: SearchRecommendation[] = remainingModules
    .map((module) => {
      const prerequisitesMet = module.prerequisites.every(
        (prereq) => completedModuleIds.includes(prereq)
      );
      const prereqCount = module.prerequisites.filter(
        (prereq) => !completedModuleIds.includes(prereq)
      ).length;

      return {
        module,
        relevanceScore: prerequisitesMet ? 1.0 : 0.7 - prereqCount * 0.1,
        matchReason: prerequisitesMet
          ? 'Ready to start - all prerequisites met'
          : `Requires ${prereqCount} prerequisite(s)`,
        careerAlignment: `Part of ${careerPath.role} learning path`,
        prerequisitesMet,
        suggestedOrder: prerequisitesMet ? 1 : 2 + prereqCount,
      };
    })
    .sort((a, b) => a.suggestedOrder - b.suggestedOrder);

  return {
    nextSteps,
    progressPercentage,
    careerInsight,
  };
}

/**
 * Generate search suggestions based on partial input
 */
export function generateSearchSuggestions(partialQuery: string): string[] {
  const suggestions: string[] = [];
  const query = partialQuery.toLowerCase();

  // Career-based suggestions
  const careerKeywords = [
    'maintenance planner',
    'reliability engineer',
    'asset manager',
    'senior maintenance planner',
    'asset management leader',
  ];

  careerKeywords.forEach((career) => {
    if (career.includes(query)) {
      suggestions.push(`I want to become a ${career}`);
    }
  });

  // Skill-based suggestions
  const skillKeywords = [
    'scheduling',
    'reliability',
    'budgeting',
    'risk management',
    'condition monitoring',
    'work orders',
    'CMMS',
  ];

  skillKeywords.forEach((skill) => {
    if (skill.toLowerCase().includes(query)) {
      suggestions.push(`Learn ${skill}`);
      suggestions.push(`Improve my ${skill} skills`);
    }
  });

  // Framework suggestions
  if (query.includes('gfmam') || query.includes('iso')) {
    suggestions.push('GFMAM ISO 55000 asset management');
    suggestions.push('GFMAM certification preparation');
  }

  if (query.includes('qcto') || query.includes('nqf') || query.includes('qualification')) {
    suggestions.push('QCTO Maintenance Planning Qualification');
    suggestions.push('NQF Level 5 maintenance certification');
  }

  return suggestions.slice(0, 5);
}
