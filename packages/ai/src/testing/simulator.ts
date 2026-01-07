/**
 * AI Learner Simulator - AMU Platform
 *
 * Simulates learner interactions to test content quality and effectiveness.
 * Uses Claude to roleplay as diverse learner personas.
 *
 * "Ubuntu - I am because we are"
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  LearnerPersona,
  PersonaId,
  personas,
  generatePersonaSystemPrompt,
} from './personas';

// =============================================================================
// TYPES
// =============================================================================

export interface SimulationConfig {
  persona_id: PersonaId;
  module_id: string;
  module_title: string;
  module_content: string;
  facilitator_prompt: string;
  max_turns: number;
  goals?: string[];
}

export interface SimulationMessage {
  role: 'learner' | 'facilitator' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    confusion_detected?: boolean;
    frustration_detected?: boolean;
    success_detected?: boolean;
    stuck_detected?: boolean;
    topics_covered?: string[];
    competency_signals?: string[];
  };
}

export interface SimulationResult {
  simulation_id: string;
  persona_id: PersonaId;
  persona_name: string;
  module_id: string;
  module_title: string;
  started_at: string;
  completed_at: string;
  total_turns: number;
  messages: SimulationMessage[];
  metrics: SimulationMetrics;
  issues: ContentIssue[];
  recommendations: string[];
}

export interface SimulationMetrics {
  confusion_events: number;
  frustration_events: number;
  success_events: number;
  stuck_events: number;
  average_response_length: number;
  questions_asked: number;
  topics_covered: string[];
  competencies_demonstrated: string[];
  completion_achieved: boolean;
}

export interface ContentIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type:
    | 'confusion'
    | 'frustration'
    | 'stuck'
    | 'accessibility'
    | 'cultural'
    | 'technical';
  description: string;
  turn_number: number;
  suggested_fix?: string;
}

// =============================================================================
// ANALYSIS PROMPTS
// =============================================================================

const ANALYSIS_PROMPT = `Analyze this learner message and identify:
1. Is confusion detected? (learner seems unsure, asks for clarification, expresses doubt)
2. Is frustration detected? (learner shows impatience, criticism, desire to skip)
3. Is success detected? (learner shows understanding, applies concepts, expresses satisfaction)
4. Is stuck detected? (learner cannot progress, repeats same questions, disengages)
5. What topics were covered in this exchange?
6. What competency signals are present?

Respond in JSON format:
{
  "confusion_detected": boolean,
  "frustration_detected": boolean,
  "success_detected": boolean,
  "stuck_detected": boolean,
  "topics_covered": string[],
  "competency_signals": string[]
}`;

const ISSUE_DETECTION_PROMPT = `Based on this conversation between a learner and facilitator, identify any content issues.

Consider:
1. Was the content accessible to this learner's level?
2. Were there cultural or contextual gaps?
3. Was the pacing appropriate?
4. Were practical examples provided when needed?
5. Was scaffolding applied when the learner struggled?
6. Were there technical barriers (jargon, complexity)?

Respond in JSON format with an array of issues:
{
  "issues": [
    {
      "severity": "low|medium|high|critical",
      "type": "confusion|frustration|stuck|accessibility|cultural|technical",
      "description": "string",
      "turn_number": number,
      "suggested_fix": "string"
    }
  ],
  "recommendations": ["string"]
}`;

// =============================================================================
// SIMULATOR CLASS
// =============================================================================

export class AILearnerSimulator {
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.model = model;
  }

  /**
   * Run a full simulation with a persona
   */
  async runSimulation(config: SimulationConfig): Promise<SimulationResult> {
    const persona = personas[config.persona_id];
    const startTime = new Date().toISOString();
    const simulationId = `sim_${Date.now()}_${config.persona_id}`;

    const messages: SimulationMessage[] = [];
    const metrics: SimulationMetrics = {
      confusion_events: 0,
      frustration_events: 0,
      success_events: 0,
      stuck_events: 0,
      average_response_length: 0,
      questions_asked: 0,
      topics_covered: [],
      competencies_demonstrated: [],
      completion_achieved: false,
    };

    // Start conversation with facilitator welcome
    const facilitatorWelcome = await this.generateFacilitatorResponse(
      config.facilitator_prompt,
      config.module_content,
      []
    );

    messages.push({
      role: 'facilitator',
      content: facilitatorWelcome,
      timestamp: new Date().toISOString(),
    });

    // Run conversation turns
    let turnCount = 0;
    let totalLearnerLength = 0;
    let consecutiveStuckCount = 0;

    while (turnCount < config.max_turns) {
      turnCount++;

      // Generate learner response
      const learnerResponse = await this.generateLearnerResponse(
        persona,
        messages,
        config.module_content
      );

      // Analyze learner response
      const analysis = await this.analyzeMessage(learnerResponse);

      // Update metrics
      if (analysis.confusion_detected) metrics.confusion_events++;
      if (analysis.frustration_detected) metrics.frustration_events++;
      if (analysis.success_detected) metrics.success_events++;
      if (analysis.stuck_detected) {
        metrics.stuck_events++;
        consecutiveStuckCount++;
      } else {
        consecutiveStuckCount = 0;
      }

      // Count questions
      if (learnerResponse.includes('?')) {
        metrics.questions_asked += (learnerResponse.match(/\?/g) || []).length;
      }

      // Add topics and competencies
      metrics.topics_covered = [
        ...new Set([...metrics.topics_covered, ...analysis.topics_covered]),
      ];
      metrics.competencies_demonstrated = [
        ...new Set([
          ...metrics.competencies_demonstrated,
          ...analysis.competency_signals,
        ]),
      ];

      totalLearnerLength += learnerResponse.length;

      messages.push({
        role: 'learner',
        content: learnerResponse,
        timestamp: new Date().toISOString(),
        metadata: analysis,
      });

      // Check for early termination conditions
      if (consecutiveStuckCount >= 3) {
        messages.push({
          role: 'system',
          content: 'Simulation terminated: Learner stuck for 3 consecutive turns',
          timestamp: new Date().toISOString(),
        });
        break;
      }

      // Generate facilitator response
      const facilitatorResponse = await this.generateFacilitatorResponse(
        config.facilitator_prompt,
        config.module_content,
        messages
      );

      messages.push({
        role: 'facilitator',
        content: facilitatorResponse,
        timestamp: new Date().toISOString(),
      });

      // Check for completion signals
      if (this.checkCompletionSignals(messages, config.goals)) {
        metrics.completion_achieved = true;
        if (turnCount >= Math.min(5, config.max_turns * 0.5)) {
          break; // Allow early completion if goals met
        }
      }
    }

    // Calculate average response length
    const learnerMessages = messages.filter((m) => m.role === 'learner');
    metrics.average_response_length =
      learnerMessages.length > 0
        ? Math.round(totalLearnerLength / learnerMessages.length)
        : 0;

    // Detect issues
    const { issues, recommendations } = await this.detectIssues(
      persona,
      messages
    );

    return {
      simulation_id: simulationId,
      persona_id: config.persona_id,
      persona_name: persona.name,
      module_id: config.module_id,
      module_title: config.module_title,
      started_at: startTime,
      completed_at: new Date().toISOString(),
      total_turns: turnCount,
      messages,
      metrics,
      issues,
      recommendations,
    };
  }

  /**
   * Generate a learner response based on persona
   */
  private async generateLearnerResponse(
    persona: LearnerPersona,
    conversationHistory: SimulationMessage[],
    moduleContent: string
  ): Promise<string> {
    const systemPrompt = generatePersonaSystemPrompt(persona);

    const formattedHistory = conversationHistory.map((m) => ({
      role: m.role === 'facilitator' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Add module context
    const contextPrompt = `You are learning about: ${moduleContent.substring(0, 500)}...

Now respond to the facilitator as your character would. Stay in character and respond naturally.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: contextPrompt,
        },
        ...formattedHistory.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    return textContent ? textContent.text : '';
  }

  /**
   * Generate facilitator response
   */
  private async generateFacilitatorResponse(
    facilitatorPrompt: string,
    moduleContent: string,
    conversationHistory: SimulationMessage[]
  ): Promise<string> {
    const formattedHistory = conversationHistory.map((m) => ({
      role: m.role === 'learner' ? 'user' : 'assistant',
      content: m.content,
    }));

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 800,
      system: facilitatorPrompt,
      messages: [
        {
          role: 'user',
          content: `Module content for reference:\n${moduleContent.substring(0, 2000)}\n\nBegin the learning conversation or continue based on history.`,
        },
        ...formattedHistory
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    return textContent ? textContent.text : '';
  }

  /**
   * Analyze a message for metrics
   */
  private async analyzeMessage(
    message: string
  ): Promise<SimulationMessage['metadata']> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-20250514', // Use faster model for analysis
        max_tokens: 500,
        system: 'You are an analyzer. Respond only with valid JSON.',
        messages: [
          {
            role: 'user',
            content: `${ANALYSIS_PROMPT}\n\nMessage to analyze:\n"${message}"`,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (textContent) {
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }

    return {
      confusion_detected: false,
      frustration_detected: false,
      success_detected: false,
      stuck_detected: false,
      topics_covered: [],
      competency_signals: [],
    };
  }

  /**
   * Detect content issues from the full conversation
   */
  private async detectIssues(
    persona: LearnerPersona,
    messages: SimulationMessage[]
  ): Promise<{ issues: ContentIssue[]; recommendations: string[] }> {
    try {
      const conversationText = messages
        .map(
          (m, i) =>
            `Turn ${Math.floor(i / 2) + 1} (${m.role}): ${m.content.substring(0, 300)}...`
        )
        .join('\n\n');

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1500,
        system: 'You are a content quality analyst. Respond only with valid JSON.',
        messages: [
          {
            role: 'user',
            content: `${ISSUE_DETECTION_PROMPT}

Persona: ${persona.name}
- Background: ${persona.background}
- Confidence: ${persona.characteristics.confidence_level}
- Prior Knowledge: ${persona.characteristics.prior_knowledge}

Conversation:
${conversationText}`,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (textContent) {
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return {
            issues: result.issues || [],
            recommendations: result.recommendations || [],
          };
        }
      }
    } catch (error) {
      console.error('Issue detection error:', error);
    }

    return { issues: [], recommendations: [] };
  }

  /**
   * Check if learning goals have been achieved
   */
  private checkCompletionSignals(
    messages: SimulationMessage[],
    goals?: string[]
  ): boolean {
    // Check for success signals in recent messages
    const recentMessages = messages.slice(-4);
    const successCount = recentMessages.filter(
      (m) => m.metadata?.success_detected
    ).length;

    return successCount >= 2;
  }

  /**
   * Run simulations across all personas
   */
  async runAllPersonaSimulations(
    baseConfig: Omit<SimulationConfig, 'persona_id'>
  ): Promise<SimulationResult[]> {
    const results: SimulationResult[] = [];

    for (const personaId of Object.keys(personas) as PersonaId[]) {
      console.log(`Running simulation for ${personaId}...`);
      const result = await this.runSimulation({
        ...baseConfig,
        persona_id: personaId,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Generate a summary report across all simulations
   */
  generateSummaryReport(results: SimulationResult[]): {
    overall_score: number;
    persona_scores: Record<string, number>;
    common_issues: ContentIssue[];
    priority_recommendations: string[];
  } {
    const personaScores: Record<string, number> = {};
    const allIssues: ContentIssue[] = [];
    const allRecommendations: string[] = [];

    for (const result of results) {
      // Calculate score (0-100)
      const successRate =
        result.metrics.success_events /
        Math.max(result.total_turns, 1);
      const confusionPenalty =
        (result.metrics.confusion_events * 10) / Math.max(result.total_turns, 1);
      const frustrationPenalty =
        (result.metrics.frustration_events * 15) / Math.max(result.total_turns, 1);
      const stuckPenalty =
        (result.metrics.stuck_events * 20) / Math.max(result.total_turns, 1);
      const completionBonus = result.metrics.completion_achieved ? 20 : 0;

      const score = Math.max(
        0,
        Math.min(
          100,
          50 +
            successRate * 30 +
            completionBonus -
            confusionPenalty -
            frustrationPenalty -
            stuckPenalty
        )
      );

      personaScores[result.persona_id] = Math.round(score);
      allIssues.push(...result.issues);
      allRecommendations.push(...result.recommendations);
    }

    // Calculate overall score
    const scores = Object.values(personaScores);
    const overallScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Find common issues (appearing in multiple simulations)
    const issueMap = new Map<string, ContentIssue>();
    for (const issue of allIssues) {
      const key = `${issue.type}:${issue.description.substring(0, 50)}`;
      if (!issueMap.has(key) || issue.severity > issueMap.get(key)!.severity) {
        issueMap.set(key, issue);
      }
    }

    // Deduplicate recommendations
    const uniqueRecommendations = [...new Set(allRecommendations)];

    return {
      overall_score: overallScore,
      persona_scores: personaScores,
      common_issues: Array.from(issueMap.values()).sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      priority_recommendations: uniqueRecommendations.slice(0, 5),
    };
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createSimulator(apiKey?: string): AILearnerSimulator {
  return new AILearnerSimulator(apiKey);
}
