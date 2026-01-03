/**
 * Career Pathway Recommendation Engine - AMU Platform
 *
 * Section 21.2: "Next Step" Recommendations
 *
 * Analyzes a learner's completed competencies and suggests
 * the most logical next course to bridge their specific
 * capability gap.
 *
 * "Ubuntu - I am because we are"
 */

import { getAnthropicClient, defaultConfig } from '../client';
import type {
  SearchableModule,
  CareerPath,
  CAREER_PATHS,
  GFMAMGroup,
  GFMAM_GROUPS,
} from '@amu/database';
import type { CompetencyAchievement, Enrolment } from '@amu/shared';

// ============================================================================
// Types
// ============================================================================

export interface LearnerProfile {
  userId: string;
  completedModuleIds: string[];
  competenciesAchieved: CompetencyAchievement[];
  currentEnrolments: Enrolment[];
  careerGoal?: string;
  currentRole?: string;
  experienceLevel: 'entry' | 'developing' | 'experienced' | 'expert';
}

export interface CapabilityGap {
  competencyId: string;
  competencyName: string;
  requiredFor: string[];
  priority: 'high' | 'medium' | 'low';
  bridgingModules: string[];
}

export interface NextStepRecommendation {
  moduleId: string;
  moduleTitle: string;
  framework: 'gfmam' | 'qcto';
  reason: string;
  gapsAddressed: string[];
  careerImpact: string;
  priority: number;
  estimatedHours: number;
  prerequisitesMet: boolean;
  missingPrerequisites: string[];
}

export interface CareerPathwayAnalysis {
  currentPosition: {
    title: string;
    description: string;
    competencyScore: number;
  };
  targetPosition: {
    title: string;
    description: string;
    requiredCompetencies: string[];
  };
  progressPercentage: number;
  gapsIdentified: CapabilityGap[];
  nextSteps: NextStepRecommendation[];
  estimatedTimeToTarget: string;
  milestones: {
    title: string;
    modules: string[];
    completed: boolean;
  }[];
}

export interface SkillMatrix {
  category: string;
  skills: {
    name: string;
    currentLevel: 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';
    targetLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
    gap: number;
  }[];
}

// ============================================================================
// Competency to Skill Mapping
// ============================================================================

const COMPETENCY_SKILL_MAP: Record<string, { category: string; skills: string[] }> = {
  // Strategy & Planning
  'strategic-planning': { category: 'Strategy', skills: ['Strategic thinking', 'Long-term planning', 'Objective setting'] },
  'strategic-alignment': { category: 'Strategy', skills: ['Business alignment', 'Stakeholder management', 'Value creation'] },
  'policy-development': { category: 'Strategy', skills: ['Policy writing', 'Standards development', 'Governance'] },

  // Decision Making
  'investment-appraisal': { category: 'Financial', skills: ['NPV analysis', 'ROI calculation', 'Business case development'] },
  'lifecycle-costing': { category: 'Financial', skills: ['TCO analysis', 'Cost modelling', 'Economic evaluation'] },
  'cost-risk-balance': { category: 'Financial', skills: ['Risk quantification', 'Cost-benefit analysis', 'Optimisation'] },

  // Maintenance
  'work-planning': { category: 'Maintenance', skills: ['Work order management', 'Job planning', 'Resource estimation'] },
  'scheduling': { category: 'Maintenance', skills: ['Schedule development', 'Resource allocation', 'Conflict resolution'] },
  'maintenance-strategy': { category: 'Maintenance', skills: ['RCM', 'Preventive maintenance', 'Corrective maintenance'] },

  // Reliability
  'reliability-analysis': { category: 'Reliability', skills: ['FMEA', 'Weibull analysis', 'Failure prediction'] },
  'predictive-maintenance': { category: 'Reliability', skills: ['Condition monitoring', 'Vibration analysis', 'Oil analysis'] },
  'root-cause-analysis': { category: 'Reliability', skills: ['5 Whys', 'Fishbone diagrams', 'Fault tree analysis'] },

  // Information
  'data-management': { category: 'Information', skills: ['Data governance', 'Data quality', 'Master data management'] },
  'information-systems': { category: 'Information', skills: ['CMMS', 'EAM', 'System integration'] },

  // Leadership
  'leadership': { category: 'Leadership', skills: ['Team leadership', 'Change management', 'Vision setting'] },
  'team-building': { category: 'Leadership', skills: ['Talent development', 'Collaboration', 'Motivation'] },
  'change-management': { category: 'Leadership', skills: ['Change planning', 'Stakeholder engagement', 'Resistance management'] },

  // Risk
  'risk-identification': { category: 'Risk', skills: ['Hazard identification', 'Risk assessment', 'Risk registers'] },
  'risk-treatment': { category: 'Risk', skills: ['Risk mitigation', 'Control implementation', 'Risk monitoring'] },
};

// ============================================================================
// Career Pathway Analysis Functions
// ============================================================================

/**
 * Analyze learner's current capabilities and gaps
 */
export async function analyzeCapabilityGaps(
  profile: LearnerProfile,
  targetCareerPath: CareerPath,
  availableModules: SearchableModule[]
): Promise<CapabilityGap[]> {
  const achievedCompetencyIds = new Set(
    profile.competenciesAchieved.map((c) => c.competency_id)
  );

  const gaps: CapabilityGap[] = [];

  // Identify missing competencies for target career
  for (const requiredCompetency of targetCareerPath.requiredCompetencies) {
    if (!achievedCompetencyIds.has(requiredCompetency)) {
      // Find modules that teach this competency
      const bridgingModules = availableModules
        .filter((m) => m.competencies.includes(requiredCompetency))
        .map((m) => m.id);

      gaps.push({
        competencyId: requiredCompetency,
        competencyName: formatCompetencyName(requiredCompetency),
        requiredFor: [targetCareerPath.role],
        priority: determinePriority(requiredCompetency, targetCareerPath),
        bridgingModules,
      });
    }
  }

  // Sort by priority
  return gaps.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate "Next Step" recommendations
 */
export async function generateNextStepRecommendations(
  profile: LearnerProfile,
  availableModules: SearchableModule[],
  targetCareerPath?: CareerPath
): Promise<NextStepRecommendation[]> {
  const client = getAnthropicClient();

  // Get completed module details
  const completedModules = availableModules.filter((m) =>
    profile.completedModuleIds.includes(m.id)
  );

  // Get uncompleted modules
  const uncompletedModules = availableModules.filter(
    (m) => !profile.completedModuleIds.includes(m.id)
  );

  // Calculate prerequisite status for each module
  const modulesWithPrereqs = uncompletedModules.map((module) => {
    const missingPrereqs = module.prerequisites.filter(
      (prereq) => !profile.completedModuleIds.includes(prereq)
    );
    return {
      ...module,
      prerequisitesMet: missingPrereqs.length === 0,
      missingPrerequisites: missingPrereqs,
    };
  });

  // Filter to modules with met prerequisites (or close)
  const eligibleModules = modulesWithPrereqs
    .filter((m) => m.missingPrerequisites.length <= 1)
    .slice(0, 15);

  // Use Claude to rank recommendations
  const response = await client.messages.create({
    ...defaultConfig,
    max_tokens: 1500,
    system: `You are an expert career advisor for asset management professionals.
Analyze the learner's profile and recommend their next learning steps.

Consider:
1. Logical skill progression
2. Career goal alignment
3. Prerequisite chains
4. Industry value of competencies

Respond in JSON format:
{
  "recommendations": [
    {
      "moduleId": "module-id",
      "reason": "Why this module next",
      "gapsAddressed": ["competency-1", "competency-2"],
      "careerImpact": "How this helps their career",
      "priority": 1-10
    }
  ]
}`,
    messages: [
      {
        role: 'user',
        content: `Learner Profile:
- Experience Level: ${profile.experienceLevel}
- Current Role: ${profile.currentRole || 'Not specified'}
- Career Goal: ${profile.careerGoal || targetCareerPath?.role || 'General development'}
- Completed Modules: ${completedModules.map((m) => m.title).join(', ') || 'None'}
- Competencies Achieved: ${profile.competenciesAchieved.map((c) => c.competency_title).join(', ') || 'None'}

Available Next Modules:
${eligibleModules.map((m) => `- ${m.id}: ${m.title} (${m.framework}, ${m.level || 'N/A'}) - Prerequisites met: ${m.prerequisitesMet}`).join('\n')}

Target Career: ${targetCareerPath?.role || 'General asset management professional'}
Required Competencies: ${targetCareerPath?.requiredCompetencies.join(', ') || 'General development'}

Recommend the best next 5 modules in priority order.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  const content = textContent && 'text' in textContent ? textContent.text : '{}';

  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const parsed = JSON.parse(jsonStr);

    return (parsed.recommendations || [])
      .map((rec: {
        moduleId: string;
        reason: string;
        gapsAddressed: string[];
        careerImpact: string;
        priority: number;
      }) => {
        const moduleData = eligibleModules.find((m) => m.id === rec.moduleId);
        if (!moduleData) return null;

        return {
          moduleId: rec.moduleId,
          moduleTitle: moduleData.title,
          framework: moduleData.framework,
          reason: rec.reason,
          gapsAddressed: rec.gapsAddressed || [],
          careerImpact: rec.careerImpact,
          priority: rec.priority,
          estimatedHours: estimateModuleHours(moduleData),
          prerequisitesMet: moduleData.prerequisitesMet,
          missingPrerequisites: moduleData.missingPrerequisites,
        };
      })
      .filter(Boolean)
      .slice(0, 5);
  } catch {
    // Fallback to simple recommendations
    return eligibleModules
      .filter((m) => m.prerequisitesMet)
      .slice(0, 5)
      .map((m, index) => ({
        moduleId: m.id,
        moduleTitle: m.title,
        framework: m.framework,
        reason: 'Matches your current level and prerequisites are met',
        gapsAddressed: m.competencies.slice(0, 2),
        careerImpact: 'Builds foundational capabilities',
        priority: index + 1,
        estimatedHours: estimateModuleHours(m),
        prerequisitesMet: true,
        missingPrerequisites: [],
      }));
  }
}

/**
 * Generate full career pathway analysis
 */
export async function generateCareerPathwayAnalysis(
  profile: LearnerProfile,
  targetCareerPath: CareerPath,
  availableModules: SearchableModule[]
): Promise<CareerPathwayAnalysis> {
  // Analyze capability gaps
  const gaps = await analyzeCapabilityGaps(profile, targetCareerPath, availableModules);

  // Generate next step recommendations
  const nextSteps = await generateNextStepRecommendations(
    profile,
    availableModules,
    targetCareerPath
  );

  // Calculate progress
  const totalRequired = targetCareerPath.requiredCompetencies.length;
  const achieved = profile.competenciesAchieved.filter((c) =>
    targetCareerPath.requiredCompetencies.includes(c.competency_id)
  ).length;
  const progressPercentage = totalRequired > 0 ? (achieved / totalRequired) * 100 : 0;

  // Build milestones
  const milestones = buildMilestones(targetCareerPath, profile, availableModules);

  // Estimate time to target
  const remainingModules = targetCareerPath.recommendedModules.filter(
    (id) => !profile.completedModuleIds.includes(id)
  );
  const remainingHours = remainingModules.length * 8; // Average 8 hours per module
  const estimatedTimeToTarget = formatEstimatedTime(remainingHours);

  // Determine current position
  const currentPosition = determineCurrentPosition(profile);

  return {
    currentPosition,
    targetPosition: {
      title: targetCareerPath.role,
      description: targetCareerPath.description,
      requiredCompetencies: targetCareerPath.requiredCompetencies,
    },
    progressPercentage: Math.round(progressPercentage),
    gapsIdentified: gaps,
    nextSteps,
    estimatedTimeToTarget,
    milestones,
  };
}

/**
 * Build skill matrix visualization data
 */
export function buildSkillMatrix(
  profile: LearnerProfile,
  targetCareerPath: CareerPath
): SkillMatrix[] {
  const categories = new Map<string, SkillMatrix['skills']>();

  // Map achieved competencies to skills
  const achievedCompetencies = new Set(
    profile.competenciesAchieved.map((c) => c.competency_id)
  );

  // Build matrix from required competencies
  for (const competencyId of targetCareerPath.requiredCompetencies) {
    const mapping = COMPETENCY_SKILL_MAP[competencyId];
    if (!mapping) continue;

    if (!categories.has(mapping.category)) {
      categories.set(mapping.category, []);
    }

    const currentLevel = achievedCompetencies.has(competencyId)
      ? 'intermediate'
      : 'none';

    categories.get(mapping.category)!.push({
      name: formatCompetencyName(competencyId),
      currentLevel,
      targetLevel: 'intermediate',
      gap: currentLevel === 'none' ? 2 : 0,
    });
  }

  return Array.from(categories.entries()).map(([category, skills]) => ({
    category,
    skills,
  }));
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCompetencyName(competencyId: string): string {
  return competencyId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function determinePriority(
  competencyId: string,
  careerPath: CareerPath
): 'high' | 'medium' | 'low' {
  // Core competencies for the role are high priority
  const coreCompetencies = careerPath.requiredCompetencies.slice(0, 3);
  if (coreCompetencies.includes(competencyId)) {
    return 'high';
  }

  // Secondary competencies are medium
  const secondaryCompetencies = careerPath.requiredCompetencies.slice(3, 6);
  if (secondaryCompetencies.includes(competencyId)) {
    return 'medium';
  }

  return 'low';
}

function estimateModuleHours(module: SearchableModule): number {
  // Base hours by framework
  const baseHours = module.framework === 'qcto'
    ? (module.credits || 8) * 0.5 // QCTO credits to hours
    : 8; // GFMAM average

  // Adjust by level
  const levelMultiplier = {
    foundation: 0.8,
    intermediate: 1.0,
    advanced: 1.2,
  };

  return Math.round(baseHours * (levelMultiplier[module.level || 'intermediate']));
}

function formatEstimatedTime(hours: number): string {
  if (hours < 8) {
    return `${hours} hours`;
  }
  if (hours < 40) {
    return `${Math.round(hours / 8)} days`;
  }
  if (hours < 160) {
    return `${Math.round(hours / 40)} weeks`;
  }
  return `${Math.round(hours / 160)} months`;
}

function determineCurrentPosition(profile: LearnerProfile): {
  title: string;
  description: string;
  competencyScore: number;
} {
  const competencyCount = profile.competenciesAchieved.length;
  const moduleCount = profile.completedModuleIds.length;

  if (competencyCount === 0) {
    return {
      title: 'Aspiring Professional',
      description: 'Beginning your asset management journey',
      competencyScore: 0,
    };
  }

  if (competencyCount < 5) {
    return {
      title: 'Emerging Professional',
      description: 'Building foundational capabilities',
      competencyScore: 20,
    };
  }

  if (competencyCount < 15) {
    return {
      title: 'Developing Professional',
      description: 'Expanding skills across domains',
      competencyScore: 50,
    };
  }

  if (competencyCount < 25) {
    return {
      title: 'Competent Professional',
      description: 'Solid foundation with specialized skills',
      competencyScore: 70,
    };
  }

  return {
    title: 'Expert Professional',
    description: 'Comprehensive asset management expertise',
    competencyScore: 90,
  };
}

function buildMilestones(
  careerPath: CareerPath,
  profile: LearnerProfile,
  modules: SearchableModule[]
): { title: string; modules: string[]; completed: boolean }[] {
  // Group recommended modules into milestones
  const milestones: { title: string; modules: string[]; completed: boolean }[] = [];

  // Foundation milestone
  const foundationModules = careerPath.recommendedModules.filter((id) => {
    const module = modules.find((m) => m.id === id);
    return module?.level === 'foundation';
  });
  if (foundationModules.length > 0) {
    milestones.push({
      title: 'Foundation Skills',
      modules: foundationModules,
      completed: foundationModules.every((id) =>
        profile.completedModuleIds.includes(id)
      ),
    });
  }

  // Intermediate milestone
  const intermediateModules = careerPath.recommendedModules.filter((id) => {
    const module = modules.find((m) => m.id === id);
    return module?.level === 'intermediate';
  });
  if (intermediateModules.length > 0) {
    milestones.push({
      title: 'Core Competencies',
      modules: intermediateModules,
      completed: intermediateModules.every((id) =>
        profile.completedModuleIds.includes(id)
      ),
    });
  }

  // Advanced milestone
  const advancedModules = careerPath.recommendedModules.filter((id) => {
    const module = modules.find((m) => m.id === id);
    return module?.level === 'advanced';
  });
  if (advancedModules.length > 0) {
    milestones.push({
      title: 'Advanced Expertise',
      modules: advancedModules,
      completed: advancedModules.every((id) =>
        profile.completedModuleIds.includes(id)
      ),
    });
  }

  // If no level-based milestones, create generic ones
  if (milestones.length === 0) {
    const chunks = [];
    for (let i = 0; i < careerPath.recommendedModules.length; i += 3) {
      chunks.push(careerPath.recommendedModules.slice(i, i + 3));
    }

    chunks.forEach((chunk, index) => {
      milestones.push({
        title: `Phase ${index + 1}`,
        modules: chunk,
        completed: chunk.every((id) => profile.completedModuleIds.includes(id)),
      });
    });
  }

  return milestones;
}
