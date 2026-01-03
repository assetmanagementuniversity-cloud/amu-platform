/**
 * Course Search Index - AMU Platform
 *
 * Section 21: Global Search & Intelligent Discovery
 *
 * Provides Firestore-backed index of all GFMAM and QCTO modules
 * including learning outcomes, NQF levels, and prerequisite links
 * for instant discovery via Claude natural language search.
 *
 * "Ubuntu - I am because we are"
 */

import { getFirestore } from '../config/firebase-admin';
import type { Course, Module, CourseType } from '@amu/shared';

// ============================================================================
// GFMAM Subject Framework (Section 6.2)
// ============================================================================

export interface GFMAMSubject {
  code: string;
  title: string;
  group: GFMAMGroup;
  level: 'foundation' | 'intermediate' | 'advanced';
  description: string;
  learningOutcomes: string[];
  competencies: string[];
  relatedSubjects: string[];
}

export type GFMAMGroup =
  | 'strategy_planning'
  | 'decision_making'
  | 'lifecycle_delivery'
  | 'asset_information'
  | 'organisation_people'
  | 'risk_review';

export const GFMAM_GROUPS: Record<GFMAMGroup, { name: string; subjects: string[] }> = {
  strategy_planning: {
    name: 'Group 1: Strategy & Planning',
    subjects: ['311', '312', '313', '314', '315', '316'],
  },
  decision_making: {
    name: 'Group 2: Decision-Making',
    subjects: ['321', '322', '323', '324', '325'],
  },
  lifecycle_delivery: {
    name: 'Group 3: Lifecycle Delivery',
    subjects: ['331', '332', '333', '334', '335', '336', '337', '338'],
  },
  asset_information: {
    name: 'Group 4: Asset Information',
    subjects: ['341', '342', '343', '344', '345'],
  },
  organisation_people: {
    name: 'Group 5: Organisation & People',
    subjects: ['351', '352', '353', '354', '355', '356'],
  },
  risk_review: {
    name: 'Group 6: Risk & Review',
    subjects: ['361', '362', '363', '364', '365'],
  },
};

export const GFMAM_SUBJECTS: GFMAMSubject[] = [
  // Group 1: Strategy & Planning
  {
    code: '311',
    title: 'Organisational Context',
    group: 'strategy_planning',
    level: 'foundation',
    description: 'Understanding organisational strategic context and stakeholder requirements',
    learningOutcomes: [
      'Explain how asset management supports organisational objectives',
      'Identify key stakeholders and their requirements',
      'Describe the relationship between corporate and asset management strategy',
    ],
    competencies: ['stakeholder-analysis', 'strategic-alignment', 'context-assessment'],
    relatedSubjects: ['312', '313'],
  },
  {
    code: '312',
    title: 'Asset Information',
    group: 'strategy_planning',
    level: 'foundation',
    description: 'Managing asset data and information throughout the lifecycle',
    learningOutcomes: [
      'Define asset information requirements',
      'Establish data quality standards',
      'Implement information management systems',
    ],
    competencies: ['data-management', 'information-systems', 'quality-assurance'],
    relatedSubjects: ['311', '341'],
  },
  {
    code: '313',
    title: 'Asset Management Strategy',
    group: 'strategy_planning',
    level: 'intermediate',
    description: 'Developing and implementing asset management strategy',
    learningOutcomes: [
      'Develop asset management policy and strategy',
      'Align asset strategies with organisational objectives',
      'Create strategic asset management plans',
    ],
    competencies: ['strategic-planning', 'policy-development', 'objective-setting'],
    relatedSubjects: ['311', '314'],
  },
  {
    code: '314',
    title: 'Demand Analysis',
    group: 'strategy_planning',
    level: 'intermediate',
    description: 'Analysing current and future asset demand',
    learningOutcomes: [
      'Forecast future demand requirements',
      'Assess capacity and capability needs',
      'Develop demand management strategies',
    ],
    competencies: ['demand-forecasting', 'capacity-planning', 'trend-analysis'],
    relatedSubjects: ['313', '315'],
  },
  {
    code: '315',
    title: 'Strategic Planning',
    group: 'strategy_planning',
    level: 'advanced',
    description: 'Long-term strategic asset planning and portfolio management',
    learningOutcomes: [
      'Develop long-term asset investment strategies',
      'Optimise asset portfolio performance',
      'Integrate sustainability into asset strategies',
    ],
    competencies: ['portfolio-management', 'investment-planning', 'sustainability'],
    relatedSubjects: ['314', '316'],
  },
  {
    code: '316',
    title: 'Asset Management Plans',
    group: 'strategy_planning',
    level: 'advanced',
    description: 'Creating comprehensive asset management plans',
    learningOutcomes: [
      'Develop tactical asset management plans',
      'Integrate financial and technical planning',
      'Establish performance targets and monitoring',
    ],
    competencies: ['plan-development', 'integration', 'performance-management'],
    relatedSubjects: ['315', '321'],
  },

  // Group 2: Decision-Making
  {
    code: '321',
    title: 'Capital Investment Decision-Making',
    group: 'decision_making',
    level: 'intermediate',
    description: 'Making informed capital investment decisions',
    learningOutcomes: [
      'Apply investment appraisal techniques',
      'Evaluate capital project options',
      'Develop business cases for asset investments',
    ],
    competencies: ['investment-appraisal', 'business-case', 'option-evaluation'],
    relatedSubjects: ['316', '322'],
  },
  {
    code: '322',
    title: 'Operations & Maintenance Decision-Making',
    group: 'decision_making',
    level: 'intermediate',
    description: 'Optimising operations and maintenance decisions',
    learningOutcomes: [
      'Develop maintenance strategies',
      'Optimise inspection and testing regimes',
      'Balance cost, risk, and performance',
    ],
    competencies: ['maintenance-strategy', 'optimisation', 'cost-risk-balance'],
    relatedSubjects: ['321', '323'],
  },
  {
    code: '323',
    title: 'Lifecycle Value Realisation',
    group: 'decision_making',
    level: 'advanced',
    description: 'Maximising value throughout the asset lifecycle',
    learningOutcomes: [
      'Apply lifecycle costing methodologies',
      'Optimise asset lifecycle decisions',
      'Realise value from asset disposal',
    ],
    competencies: ['lifecycle-costing', 'value-optimisation', 'disposal-planning'],
    relatedSubjects: ['322', '324'],
  },
  {
    code: '324',
    title: 'Resourcing Strategy',
    group: 'decision_making',
    level: 'intermediate',
    description: 'Developing resource strategies for asset management',
    learningOutcomes: [
      'Assess resourcing requirements',
      'Develop sourcing strategies',
      'Manage service provider relationships',
    ],
    competencies: ['resource-planning', 'sourcing', 'contract-management'],
    relatedSubjects: ['323', '325'],
  },
  {
    code: '325',
    title: 'Shutdowns & Outage Optimisation',
    group: 'decision_making',
    level: 'advanced',
    description: 'Planning and optimising shutdowns and outages',
    learningOutcomes: [
      'Plan major shutdowns and outages',
      'Optimise shutdown scope and timing',
      'Manage shutdown execution and recovery',
    ],
    competencies: ['shutdown-planning', 'scheduling', 'execution-management'],
    relatedSubjects: ['322', '324'],
  },

  // Group 3: Lifecycle Delivery
  {
    code: '331',
    title: 'Technical Standards & Legislation',
    group: 'lifecycle_delivery',
    level: 'foundation',
    description: 'Understanding technical standards and regulatory requirements',
    learningOutcomes: [
      'Identify applicable standards and regulations',
      'Implement compliance management systems',
      'Manage regulatory relationships',
    ],
    competencies: ['standards-compliance', 'regulation', 'governance'],
    relatedSubjects: ['332', '361'],
  },
  {
    code: '332',
    title: 'Asset Creation & Acquisition',
    group: 'lifecycle_delivery',
    level: 'intermediate',
    description: 'Managing asset creation and acquisition processes',
    learningOutcomes: [
      'Specify asset requirements',
      'Manage procurement processes',
      'Oversee asset construction and commissioning',
    ],
    competencies: ['specification', 'procurement', 'commissioning'],
    relatedSubjects: ['331', '333'],
  },
  {
    code: '333',
    title: 'Systems Engineering',
    group: 'lifecycle_delivery',
    level: 'advanced',
    description: 'Applying systems engineering to asset management',
    learningOutcomes: [
      'Apply systems thinking to asset problems',
      'Manage system interfaces and integration',
      'Optimise system performance',
    ],
    competencies: ['systems-thinking', 'integration', 'performance-engineering'],
    relatedSubjects: ['332', '334'],
  },
  {
    code: '334',
    title: 'Configuration Management',
    group: 'lifecycle_delivery',
    level: 'intermediate',
    description: 'Managing asset configuration throughout lifecycle',
    learningOutcomes: [
      'Establish configuration management systems',
      'Control asset modifications and changes',
      'Maintain configuration documentation',
    ],
    competencies: ['configuration-control', 'change-management', 'documentation'],
    relatedSubjects: ['333', '335'],
  },
  {
    code: '335',
    title: 'Maintenance Delivery',
    group: 'lifecycle_delivery',
    level: 'foundation',
    description: 'Executing maintenance activities effectively',
    learningOutcomes: [
      'Plan and schedule maintenance work',
      'Execute maintenance safely and efficiently',
      'Manage maintenance resources',
    ],
    competencies: ['work-planning', 'execution', 'resource-management'],
    relatedSubjects: ['334', '336'],
  },
  {
    code: '336',
    title: 'Reliability Engineering',
    group: 'lifecycle_delivery',
    level: 'advanced',
    description: 'Applying reliability engineering principles',
    learningOutcomes: [
      'Apply reliability analysis techniques',
      'Develop reliability improvement programs',
      'Implement predictive maintenance strategies',
    ],
    competencies: ['reliability-analysis', 'predictive-maintenance', 'improvement'],
    relatedSubjects: ['335', '337'],
  },
  {
    code: '337',
    title: 'Asset Operations',
    group: 'lifecycle_delivery',
    level: 'foundation',
    description: 'Operating assets safely and efficiently',
    learningOutcomes: [
      'Develop operating procedures',
      'Monitor asset performance',
      'Respond to operational incidents',
    ],
    competencies: ['operations', 'monitoring', 'incident-response'],
    relatedSubjects: ['336', '338'],
  },
  {
    code: '338',
    title: 'Fault & Incident Response',
    group: 'lifecycle_delivery',
    level: 'intermediate',
    description: 'Managing faults and incidents effectively',
    learningOutcomes: [
      'Establish incident response procedures',
      'Conduct root cause analysis',
      'Implement corrective actions',
    ],
    competencies: ['incident-management', 'root-cause-analysis', 'corrective-action'],
    relatedSubjects: ['337', '362'],
  },

  // Group 4: Asset Information
  {
    code: '341',
    title: 'Asset Information Strategy',
    group: 'asset_information',
    level: 'intermediate',
    description: 'Developing asset information strategies',
    learningOutcomes: [
      'Define information requirements',
      'Develop information management strategies',
      'Establish data governance frameworks',
    ],
    competencies: ['information-strategy', 'data-governance', 'requirements-analysis'],
    relatedSubjects: ['312', '342'],
  },
  {
    code: '342',
    title: 'Asset Information Standards',
    group: 'asset_information',
    level: 'intermediate',
    description: 'Implementing asset information standards',
    learningOutcomes: [
      'Apply asset information standards',
      'Develop data dictionaries and taxonomies',
      'Ensure data interoperability',
    ],
    competencies: ['standards-implementation', 'taxonomy', 'interoperability'],
    relatedSubjects: ['341', '343'],
  },
  {
    code: '343',
    title: 'Asset Information Systems',
    group: 'asset_information',
    level: 'advanced',
    description: 'Managing asset information systems',
    learningOutcomes: [
      'Specify information system requirements',
      'Implement and integrate asset systems',
      'Manage system lifecycle and upgrades',
    ],
    competencies: ['system-specification', 'implementation', 'lifecycle-management'],
    relatedSubjects: ['342', '344'],
  },
  {
    code: '344',
    title: 'Data & Information Management',
    group: 'asset_information',
    level: 'foundation',
    description: 'Managing asset data and information',
    learningOutcomes: [
      'Collect and validate asset data',
      'Manage data quality and integrity',
      'Provide asset information services',
    ],
    competencies: ['data-collection', 'quality-management', 'information-services'],
    relatedSubjects: ['343', '345'],
  },
  {
    code: '345',
    title: 'Asset Knowledge Management',
    group: 'asset_information',
    level: 'advanced',
    description: 'Managing organisational asset knowledge',
    learningOutcomes: [
      'Capture and preserve asset knowledge',
      'Develop knowledge sharing systems',
      'Build organisational asset capability',
    ],
    competencies: ['knowledge-capture', 'knowledge-sharing', 'capability-building'],
    relatedSubjects: ['344', '352'],
  },

  // Group 5: Organisation & People
  {
    code: '351',
    title: 'Procurement & Supply Chain Management',
    group: 'organisation_people',
    level: 'intermediate',
    description: 'Managing procurement and supply chains for assets',
    learningOutcomes: [
      'Develop procurement strategies',
      'Manage supplier relationships',
      'Optimise supply chain performance',
    ],
    competencies: ['procurement-strategy', 'supplier-management', 'supply-chain'],
    relatedSubjects: ['324', '352'],
  },
  {
    code: '352',
    title: 'Asset Management Leadership',
    group: 'organisation_people',
    level: 'advanced',
    description: 'Leading asset management organisations',
    learningOutcomes: [
      'Develop asset management vision',
      'Lead organisational change',
      'Build high-performing teams',
    ],
    competencies: ['leadership', 'change-management', 'team-building'],
    relatedSubjects: ['351', '353'],
  },
  {
    code: '353',
    title: 'Asset Management Competence',
    group: 'organisation_people',
    level: 'intermediate',
    description: 'Developing asset management competence',
    learningOutcomes: [
      'Assess competence requirements',
      'Develop training and development programs',
      'Evaluate competence achievement',
    ],
    competencies: ['competence-assessment', 'training-development', 'evaluation'],
    relatedSubjects: ['352', '354'],
  },
  {
    code: '354',
    title: 'Organisational Structure',
    group: 'organisation_people',
    level: 'intermediate',
    description: 'Designing effective asset management organisations',
    learningOutcomes: [
      'Design organisational structures',
      'Define roles and responsibilities',
      'Establish governance frameworks',
    ],
    competencies: ['organisation-design', 'role-definition', 'governance'],
    relatedSubjects: ['353', '355'],
  },
  {
    code: '355',
    title: 'Stakeholder Engagement',
    group: 'organisation_people',
    level: 'foundation',
    description: 'Engaging stakeholders in asset management',
    learningOutcomes: [
      'Identify and analyse stakeholders',
      'Develop engagement strategies',
      'Manage stakeholder communications',
    ],
    competencies: ['stakeholder-analysis', 'engagement-strategy', 'communication'],
    relatedSubjects: ['311', '354'],
  },
  {
    code: '356',
    title: 'Communication & Consultation',
    group: 'organisation_people',
    level: 'foundation',
    description: 'Communicating asset management effectively',
    learningOutcomes: [
      'Develop communication plans',
      'Present asset management information',
      'Facilitate consultation processes',
    ],
    competencies: ['communication-planning', 'presentation', 'facilitation'],
    relatedSubjects: ['355', '352'],
  },

  // Group 6: Risk & Review
  {
    code: '361',
    title: 'Risk Assessment & Management',
    group: 'risk_review',
    level: 'intermediate',
    description: 'Managing asset-related risks',
    learningOutcomes: [
      'Identify and assess asset risks',
      'Develop risk treatment strategies',
      'Monitor and review risk management',
    ],
    competencies: ['risk-identification', 'risk-treatment', 'risk-monitoring'],
    relatedSubjects: ['331', '362'],
  },
  {
    code: '362',
    title: 'Contingency Planning & Resilience',
    group: 'risk_review',
    level: 'advanced',
    description: 'Building asset resilience and contingency plans',
    learningOutcomes: [
      'Assess business continuity requirements',
      'Develop contingency plans',
      'Build organisational resilience',
    ],
    competencies: ['business-continuity', 'contingency-planning', 'resilience'],
    relatedSubjects: ['361', '363'],
  },
  {
    code: '363',
    title: 'Sustainable Development',
    group: 'risk_review',
    level: 'advanced',
    description: 'Integrating sustainability into asset management',
    learningOutcomes: [
      'Assess environmental and social impacts',
      'Develop sustainable asset strategies',
      'Report on sustainability performance',
    ],
    competencies: ['impact-assessment', 'sustainability-strategy', 'reporting'],
    relatedSubjects: ['362', '364'],
  },
  {
    code: '364',
    title: 'Management of Change',
    group: 'risk_review',
    level: 'intermediate',
    description: 'Managing changes to assets and processes',
    learningOutcomes: [
      'Establish change management processes',
      'Assess and approve changes',
      'Implement changes safely',
    ],
    competencies: ['change-process', 'approval', 'implementation'],
    relatedSubjects: ['363', '365'],
  },
  {
    code: '365',
    title: 'Asset Performance & Health Monitoring',
    group: 'risk_review',
    level: 'foundation',
    description: 'Monitoring asset performance and condition',
    learningOutcomes: [
      'Establish performance indicators',
      'Monitor asset condition',
      'Analyse performance trends',
    ],
    competencies: ['kpi-development', 'condition-monitoring', 'trend-analysis'],
    relatedSubjects: ['364', '337'],
  },
];

// ============================================================================
// QCTO Module Framework (Section 6.3)
// ============================================================================

export interface QCTOModule {
  code: string;
  title: string;
  type: 'knowledge' | 'practical' | 'work_experience';
  credits: number;
  nqfLevel: number;
  description: string;
  learningOutcomes: string[];
  assessmentCriteria: string[];
  prerequisites: string[];
  practicalRequirements?: string[];
}

export const QCTO_MODULES: QCTOModule[] = [
  // Knowledge Modules (60 credits)
  {
    code: 'KM-01',
    title: 'Maintenance Planning Fundamentals',
    type: 'knowledge',
    credits: 8,
    nqfLevel: 5,
    description: 'Foundation concepts and principles of maintenance planning',
    learningOutcomes: [
      'Explain maintenance planning concepts and terminology',
      'Describe maintenance strategies and their applications',
      'Understand the role of planning in asset management',
    ],
    assessmentCriteria: [
      'Define key maintenance planning terms accurately',
      'Compare preventive, predictive, and corrective maintenance',
      'Explain the maintenance planning cycle',
    ],
    prerequisites: [],
  },
  {
    code: 'KM-02',
    title: 'Work Order Management',
    type: 'knowledge',
    credits: 10,
    nqfLevel: 5,
    description: 'Managing work orders through the complete lifecycle',
    learningOutcomes: [
      'Create and process work orders',
      'Prioritise and schedule maintenance activities',
      'Track work order completion and costs',
    ],
    assessmentCriteria: [
      'Generate work orders with complete information',
      'Apply prioritisation frameworks correctly',
      'Calculate work order metrics and KPIs',
    ],
    prerequisites: ['KM-01'],
  },
  {
    code: 'KM-03',
    title: 'Resource Planning & Scheduling',
    type: 'knowledge',
    credits: 10,
    nqfLevel: 5,
    description: 'Planning and scheduling maintenance resources',
    learningOutcomes: [
      'Estimate resource requirements for maintenance work',
      'Develop maintenance schedules',
      'Optimise resource utilisation',
    ],
    assessmentCriteria: [
      'Calculate labour, material, and equipment needs',
      'Create realistic maintenance schedules',
      'Identify and resolve resource conflicts',
    ],
    prerequisites: ['KM-01', 'KM-02'],
  },
  {
    code: 'KM-04',
    title: 'Maintenance Budgeting & Cost Control',
    type: 'knowledge',
    credits: 8,
    nqfLevel: 5,
    description: 'Financial management for maintenance operations',
    learningOutcomes: [
      'Develop maintenance budgets',
      'Track and control maintenance costs',
      'Analyse cost performance',
    ],
    assessmentCriteria: [
      'Prepare maintenance budget estimates',
      'Monitor budget variances',
      'Recommend cost optimisation measures',
    ],
    prerequisites: ['KM-01'],
  },
  {
    code: 'KM-05',
    title: 'Asset Condition Assessment',
    type: 'knowledge',
    credits: 8,
    nqfLevel: 5,
    description: 'Assessing and monitoring asset condition',
    learningOutcomes: [
      'Apply condition assessment techniques',
      'Interpret condition monitoring data',
      'Recommend maintenance actions based on condition',
    ],
    assessmentCriteria: [
      'Conduct visual and functional inspections',
      'Analyse vibration, oil, and thermal data',
      'Document condition findings accurately',
    ],
    prerequisites: ['KM-01'],
  },
  {
    code: 'KM-06',
    title: 'Reliability-Centred Maintenance',
    type: 'knowledge',
    credits: 8,
    nqfLevel: 5,
    description: 'Applying RCM principles to maintenance planning',
    learningOutcomes: [
      'Explain RCM methodology',
      'Conduct failure mode analysis',
      'Develop maintenance strategies from RCM',
    ],
    assessmentCriteria: [
      'Apply RCM decision logic',
      'Complete FMEA documentation',
      'Select appropriate maintenance tasks',
    ],
    prerequisites: ['KM-01', 'KM-05'],
  },
  {
    code: 'KM-07',
    title: 'Computerised Maintenance Management Systems',
    type: 'knowledge',
    credits: 8,
    nqfLevel: 5,
    description: 'Using CMMS for maintenance planning and execution',
    learningOutcomes: [
      'Configure and use CMMS effectively',
      'Generate reports and analytics from CMMS',
      'Manage asset data in CMMS',
    ],
    assessmentCriteria: [
      'Navigate and operate CMMS functions',
      'Extract meaningful reports',
      'Maintain data integrity in the system',
    ],
    prerequisites: ['KM-01', 'KM-02'],
  },

  // Practical Modules (40 credits)
  {
    code: 'PM-01',
    title: 'Maintenance Planning Practice',
    type: 'practical',
    credits: 15,
    nqfLevel: 5,
    description: 'Practical application of maintenance planning skills',
    learningOutcomes: [
      'Develop maintenance plans for real equipment',
      'Create work packages with all required documentation',
      'Coordinate with operations and trades personnel',
    ],
    assessmentCriteria: [
      'Produce comprehensive maintenance plans',
      'Demonstrate effective stakeholder coordination',
      'Show evidence of planning improvements',
    ],
    prerequisites: ['KM-01', 'KM-02', 'KM-03'],
    practicalRequirements: [
      'Access to maintenance planning environment',
      'Portfolio of planning work samples',
      'Supervisor observation records',
    ],
  },
  {
    code: 'PM-02',
    title: 'Scheduling & Coordination',
    type: 'practical',
    credits: 15,
    nqfLevel: 5,
    description: 'Practical scheduling and coordination skills',
    learningOutcomes: [
      'Build and maintain maintenance schedules',
      'Coordinate resources across departments',
      'Manage schedule changes and conflicts',
    ],
    assessmentCriteria: [
      'Produce realistic, achievable schedules',
      'Demonstrate effective resource coordination',
      'Show flexibility in schedule management',
    ],
    prerequisites: ['KM-03', 'PM-01'],
    practicalRequirements: [
      'Access to scheduling tools',
      'Evidence of schedule management',
      'Coordination meeting records',
    ],
  },
  {
    code: 'PM-03',
    title: 'CMMS Application',
    type: 'practical',
    credits: 10,
    nqfLevel: 5,
    description: 'Practical CMMS operation and administration',
    learningOutcomes: [
      'Configure CMMS for planning activities',
      'Generate and analyse system reports',
      'Maintain system data quality',
    ],
    assessmentCriteria: [
      'Demonstrate proficient CMMS operation',
      'Produce accurate system reports',
      'Show data quality management practices',
    ],
    prerequisites: ['KM-07'],
    practicalRequirements: [
      'Access to CMMS environment',
      'System usage logs',
      'Report portfolio',
    ],
  },

  // Work Experience Module (20 credits)
  {
    code: 'WE-01',
    title: 'Workplace Experience',
    type: 'work_experience',
    credits: 20,
    nqfLevel: 5,
    description: 'Supervised workplace experience in maintenance planning',
    learningOutcomes: [
      'Apply planning skills in workplace context',
      'Work effectively as part of maintenance team',
      'Demonstrate professional conduct',
    ],
    assessmentCriteria: [
      'Complete required workplace hours',
      'Achieve satisfactory supervisor assessments',
      'Build portfolio of workplace evidence',
    ],
    prerequisites: ['PM-01', 'PM-02', 'PM-03'],
    practicalRequirements: [
      'Minimum 200 hours workplace exposure',
      'Mentor/supervisor assignment',
      'Logbook completion',
    ],
  },
];

// ============================================================================
// Search Index Types
// ============================================================================

export interface SearchableModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  courseType: CourseType;
  nqfLevel?: number;
  credits?: number;
  level?: 'foundation' | 'intermediate' | 'advanced';
  learningOutcomes: string[];
  competencies: string[];
  prerequisites: string[];
  keywords: string[];
  framework: 'gfmam' | 'qcto';
  frameworkCode: string;
  group?: string;
  searchVector: string;
}

export interface CourseSearchResult {
  module: SearchableModule;
  relevanceScore: number;
  matchedTerms: string[];
  careerRelevance?: string;
}

export interface ContentGap {
  id: string;
  searchQuery: string;
  timestamp: Date;
  userId?: string;
  matchedCount: number;
  suggestedTopics: string[];
  status: 'new' | 'reviewed' | 'addressed';
}

// ============================================================================
// Index Building Functions
// ============================================================================

/**
 * Build searchable index from GFMAM subjects
 */
export function buildGFMAMIndex(): SearchableModule[] {
  return GFMAM_SUBJECTS.map((subject) => {
    const keywords = [
      subject.title.toLowerCase(),
      ...subject.learningOutcomes.map((lo) => lo.toLowerCase()),
      ...subject.competencies,
      subject.group.replace(/_/g, ' '),
      'gfmam',
      'iso 55000',
      'asset management',
      subject.level,
    ];

    return {
      id: `gfmam-${subject.code}`,
      courseId: `course-gfmam-${subject.code}`,
      title: `${subject.code}: ${subject.title}`,
      description: subject.description,
      courseType: 'gfmam' as CourseType,
      level: subject.level,
      learningOutcomes: subject.learningOutcomes,
      competencies: subject.competencies,
      prerequisites: subject.relatedSubjects.map((code) => `gfmam-${code}`),
      keywords,
      framework: 'gfmam',
      frameworkCode: subject.code,
      group: GFMAM_GROUPS[subject.group].name,
      searchVector: keywords.join(' ').toLowerCase(),
    };
  });
}

/**
 * Build searchable index from QCTO modules
 */
export function buildQCTOIndex(): SearchableModule[] {
  return QCTO_MODULES.map((module) => {
    const keywords = [
      module.title.toLowerCase(),
      ...module.learningOutcomes.map((lo) => lo.toLowerCase()),
      ...module.assessmentCriteria.map((ac) => ac.toLowerCase()),
      module.type,
      'qcto',
      'maintenance planner',
      'maintenance planning',
      `nqf ${module.nqfLevel}`,
      `${module.credits} credits`,
    ];

    const typeMapping: Record<string, CourseType> = {
      knowledge: 'qcto_knowledge',
      practical: 'qcto_practical',
      work_experience: 'qcto_work_experience',
    };

    return {
      id: `qcto-${module.code}`,
      courseId: `course-qcto-${module.code}`,
      title: `${module.code}: ${module.title}`,
      description: module.description,
      courseType: typeMapping[module.type],
      nqfLevel: module.nqfLevel,
      credits: module.credits,
      learningOutcomes: module.learningOutcomes,
      competencies: module.assessmentCriteria,
      prerequisites: module.prerequisites.map((code) => `qcto-${code}`),
      keywords,
      framework: 'qcto',
      frameworkCode: module.code,
      group: `${module.type.charAt(0).toUpperCase() + module.type.slice(1).replace('_', ' ')} Modules`,
      searchVector: keywords.join(' ').toLowerCase(),
    };
  });
}

/**
 * Build complete search index
 */
export function buildFullSearchIndex(): SearchableModule[] {
  return [...buildGFMAMIndex(), ...buildQCTOIndex()];
}

// ============================================================================
// Firestore Operations
// ============================================================================

const SEARCH_INDEX_COLLECTION = 'course_search_index';
const CONTENT_GAPS_COLLECTION = 'content_gaps';

/**
 * Save search index to Firestore
 */
export async function saveSearchIndex(): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const index = buildFullSearchIndex();

  for (const module of index) {
    const docRef = db.collection(SEARCH_INDEX_COLLECTION).doc(module.id);
    batch.set(docRef, module);
  }

  await batch.commit();
  console.log(`[Search Index] Saved ${index.length} modules to Firestore`);
}

/**
 * Get all indexed modules
 */
export async function getSearchIndex(): Promise<SearchableModule[]> {
  const db = getFirestore();
  const snapshot = await db.collection(SEARCH_INDEX_COLLECTION).get();

  if (snapshot.empty) {
    // If index doesn't exist, build it in-memory
    return buildFullSearchIndex();
  }

  return snapshot.docs.map((doc) => doc.data() as SearchableModule);
}

/**
 * Search modules by keywords (basic text search)
 */
export async function searchModulesByKeywords(
  keywords: string[],
  filters?: {
    framework?: 'gfmam' | 'qcto';
    level?: 'foundation' | 'intermediate' | 'advanced';
    nqfLevel?: number;
  }
): Promise<SearchableModule[]> {
  const index = await getSearchIndex();
  const searchTerms = keywords.map((k) => k.toLowerCase());

  return index
    .filter((module) => {
      // Apply filters
      if (filters?.framework && module.framework !== filters.framework) {
        return false;
      }
      if (filters?.level && module.level !== filters.level) {
        return false;
      }
      if (filters?.nqfLevel && module.nqfLevel !== filters.nqfLevel) {
        return false;
      }

      // Check if any search terms match
      return searchTerms.some(
        (term) =>
          module.searchVector.includes(term) ||
          module.title.toLowerCase().includes(term) ||
          module.description.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      // Sort by relevance (number of matching terms)
      const aMatches = searchTerms.filter(
        (term) => a.searchVector.includes(term)
      ).length;
      const bMatches = searchTerms.filter(
        (term) => b.searchVector.includes(term)
      ).length;
      return bMatches - aMatches;
    });
}

/**
 * Get modules by framework
 */
export async function getModulesByFramework(
  framework: 'gfmam' | 'qcto'
): Promise<SearchableModule[]> {
  const index = await getSearchIndex();
  return index.filter((m) => m.framework === framework);
}

/**
 * Get module prerequisites chain
 */
export async function getPrerequisiteChain(
  moduleId: string
): Promise<SearchableModule[]> {
  const index = await getSearchIndex();
  const module = index.find((m) => m.id === moduleId);

  if (!module) {
    return [];
  }

  const chain: SearchableModule[] = [];
  const visited = new Set<string>();

  function addPrerequisites(modId: string) {
    if (visited.has(modId)) return;
    visited.add(modId);

    const mod = index.find((m) => m.id === modId);
    if (!mod) return;

    for (const prereqId of mod.prerequisites) {
      const prereq = index.find((m) => m.id === prereqId);
      if (prereq && !chain.includes(prereq)) {
        addPrerequisites(prereqId);
        chain.push(prereq);
      }
    }
  }

  addPrerequisites(moduleId);
  return chain;
}

/**
 * Log content gap for search analytics
 */
export async function logContentGap(
  query: string,
  matchedCount: number,
  userId?: string
): Promise<void> {
  const db = getFirestore();
  const gapId = `gap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const gap: ContentGap = {
    id: gapId,
    searchQuery: query,
    timestamp: new Date(),
    userId,
    matchedCount,
    suggestedTopics: [],
    status: 'new',
  };

  await db.collection(CONTENT_GAPS_COLLECTION).doc(gapId).set({
    ...gap,
    timestamp: gap.timestamp.toISOString(),
  });
}

/**
 * Get content gaps for review
 */
export async function getContentGaps(
  status?: ContentGap['status'],
  limit = 50
): Promise<ContentGap[]> {
  const db = getFirestore();
  let query = db.collection(CONTENT_GAPS_COLLECTION)
    .orderBy('timestamp', 'desc')
    .limit(limit);

  if (status) {
    query = db.collection(CONTENT_GAPS_COLLECTION)
      .where('status', '==', status)
      .orderBy('timestamp', 'desc')
      .limit(limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      timestamp: new Date(data.timestamp),
    } as ContentGap;
  });
}

/**
 * Update content gap status
 */
export async function updateContentGapStatus(
  gapId: string,
  status: ContentGap['status'],
  suggestedTopics?: string[]
): Promise<void> {
  const db = getFirestore();
  const updateData: Record<string, unknown> = { status };

  if (suggestedTopics) {
    updateData.suggestedTopics = suggestedTopics;
  }

  await db.collection(CONTENT_GAPS_COLLECTION).doc(gapId).update(updateData);
}

// ============================================================================
// Career Path Helpers
// ============================================================================

export interface CareerPath {
  role: string;
  description: string;
  requiredCompetencies: string[];
  recommendedModules: string[];
  seniorityLevel: 'entry' | 'mid' | 'senior' | 'expert';
}

export const CAREER_PATHS: CareerPath[] = [
  {
    role: 'Maintenance Planner',
    description: 'Plans and schedules maintenance activities',
    requiredCompetencies: [
      'work-planning',
      'scheduling',
      'resource-management',
      'cost-control',
    ],
    recommendedModules: ['qcto-KM-01', 'qcto-KM-02', 'qcto-KM-03', 'qcto-PM-01'],
    seniorityLevel: 'entry',
  },
  {
    role: 'Senior Maintenance Planner',
    description: 'Leads maintenance planning teams and develops strategies',
    requiredCompetencies: [
      'maintenance-strategy',
      'reliability-analysis',
      'team-leadership',
      'budget-management',
    ],
    recommendedModules: [
      'qcto-KM-04',
      'qcto-KM-05',
      'qcto-KM-06',
      'qcto-PM-02',
      'gfmam-322',
      'gfmam-336',
    ],
    seniorityLevel: 'mid',
  },
  {
    role: 'Reliability Engineer',
    description: 'Improves asset reliability and develops maintenance strategies',
    requiredCompetencies: [
      'reliability-analysis',
      'predictive-maintenance',
      'root-cause-analysis',
      'improvement',
    ],
    recommendedModules: ['gfmam-336', 'gfmam-338', 'gfmam-365', 'qcto-KM-05', 'qcto-KM-06'],
    seniorityLevel: 'mid',
  },
  {
    role: 'Asset Manager',
    description: 'Manages asset portfolios and develops asset strategies',
    requiredCompetencies: [
      'strategic-planning',
      'portfolio-management',
      'investment-planning',
      'stakeholder-engagement',
    ],
    recommendedModules: [
      'gfmam-313',
      'gfmam-315',
      'gfmam-316',
      'gfmam-321',
      'gfmam-355',
    ],
    seniorityLevel: 'senior',
  },
  {
    role: 'Asset Management Leader',
    description: 'Leads asset management functions and drives organisational capability',
    requiredCompetencies: [
      'leadership',
      'change-management',
      'strategic-alignment',
      'governance',
    ],
    recommendedModules: [
      'gfmam-352',
      'gfmam-353',
      'gfmam-354',
      'gfmam-361',
      'gfmam-362',
    ],
    seniorityLevel: 'expert',
  },
];

/**
 * Get career path recommendations based on competencies
 */
export function getCareerPathsForCompetencies(
  achievedCompetencies: string[]
): CareerPath[] {
  return CAREER_PATHS.filter((path) => {
    const matchedCompetencies = path.requiredCompetencies.filter((c) =>
      achievedCompetencies.includes(c)
    );
    // Recommend paths where learner has at least 25% of required competencies
    return matchedCompetencies.length >= path.requiredCompetencies.length * 0.25;
  });
}

/**
 * Get next recommended modules for a career path
 */
export async function getNextModulesForCareerPath(
  careerPath: CareerPath,
  completedModuleIds: string[]
): Promise<SearchableModule[]> {
  const index = await getSearchIndex();

  return index.filter(
    (module) =>
      careerPath.recommendedModules.includes(module.id) &&
      !completedModuleIds.includes(module.id)
  );
}
