/**
 * Marketing Opportunity Detector - AMU Platform
 *
 * Section 4.8: Marketing Campaign Autonomy
 *
 * Background service that identifies industry-specific growth opportunities
 * based on current learner demographics and engagement patterns.
 *
 * Claude uses this to recommend targeted marketing campaigns.
 *
 * "Ubuntu - I am because we are"
 */

// ============================================================================
// Types
// ============================================================================

export interface LearnerDemographics {
  total_learners: number;
  by_industry: Record<string, IndustrySegment>;
  by_company_size: {
    individual: number;
    small_business: number;      // 1-50 employees
    medium_business: number;     // 51-500 employees
    enterprise: number;          // 500+ employees
  };
  by_qualification_level: {
    exploring: number;           // No course started
    in_progress: number;         // At least one course active
    completed_one: number;       // Completed at least one course
    multi_qualified: number;     // Completed multiple courses
    certified: number;           // Paid for official certificate
  };
  by_referral_source: Record<string, number>;
  geographic_distribution: Record<string, number>;
}

export interface IndustrySegment {
  industry_code: string;
  industry_name: string;
  learner_count: number;
  growth_rate_30d: number;       // % growth in last 30 days
  completion_rate: number;       // % who complete courses
  certification_rate: number;    // % who pay for certificates
  avg_courses_per_learner: number;
  top_courses: string[];
  engagement_score: number;      // 0-100 based on activity
}

export interface EngagementPattern {
  period: '7d' | '30d' | '90d';

  // Activity metrics
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;

  // Learning behaviour
  avg_session_duration_minutes: number;
  avg_messages_per_session: number;
  peak_hours: number[];          // Hours of day with most activity (0-23)
  peak_days: string[];           // Days of week with most activity

  // Content engagement
  most_viewed_courses: CourseEngagement[];
  most_completed_modules: string[];
  highest_satisfaction_content: string[];

  // Conversion funnel
  visitor_to_registered: number;  // % conversion rate
  registered_to_enrolled: number;
  enrolled_to_completed: number;
  completed_to_certified: number;
}

export interface CourseEngagement {
  course_id: string;
  course_name: string;
  view_count: number;
  enrolment_count: number;
  completion_rate: number;
  avg_rating: number;
}

export interface MarketingOpportunity {
  opportunity_id: string;
  opportunity_type: OpportunityType;

  // Opportunity details
  title: string;
  description: string;
  rationale: string;

  // Target segment
  target_segment: {
    type: 'industry' | 'company_size' | 'qualification_level' | 'geographic' | 'behavioural';
    identifier: string;
    segment_name: string;
    segment_size: number;
  };

  // Scoring
  confidence_score: number;      // 0-100, how confident Claude is
  potential_impact: ImpactLevel;
  effort_required: EffortLevel;
  priority_score: number;        // Calculated from confidence, impact, effort

  // Supporting data
  data_points: DataPoint[];

  // Timing
  identified_at: string;
  expires_at?: string;           // Some opportunities are time-sensitive

  // Status
  status: 'new' | 'under_review' | 'approved' | 'rejected' | 'executed';
  reviewed_by?: string;
  reviewed_at?: string;
}

export type OpportunityType =
  | 'industry_growth'           // Growing industry segment
  | 'course_demand'             // High demand for specific course
  | 'certification_gap'         // Low certification rate in segment
  | 'geographic_expansion'      // Opportunity in new region
  | 'competitor_gap'            // Competitor weakness to exploit
  | 'seasonal_trend'            // Seasonal pattern identified
  | 'referral_potential'        // High referral potential segment
  | 'corporate_expansion'       // Corporate training opportunity
  | 'reactivation'              // Dormant learners to reactivate
  | 'upsell';                   // Cross-sell/upsell opportunity

export type ImpactLevel = 'low' | 'medium' | 'high' | 'very_high';
export type EffortLevel = 'minimal' | 'moderate' | 'significant' | 'major';

export interface DataPoint {
  metric: string;
  value: number | string;
  comparison?: string;          // e.g., "vs. 25% average"
  trend?: 'up' | 'down' | 'stable';
}

export interface OpportunityDetectorConfig {
  // Analysis frequency
  analysis_interval_hours: number;

  // Thresholds
  min_segment_size: number;             // Minimum learners to consider segment
  growth_rate_threshold: number;        // % growth to flag as opportunity
  certification_gap_threshold: number;  // Below this rate is a gap
  confidence_threshold: number;         // Minimum confidence to report

  // Limits
  max_opportunities_per_run: number;

  // Feature flags
  enable_competitor_analysis: boolean;
  enable_geographic_analysis: boolean;
  enable_seasonal_analysis: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_DETECTOR_CONFIG: OpportunityDetectorConfig = {
  analysis_interval_hours: 24,
  min_segment_size: 20,
  growth_rate_threshold: 15,         // 15% growth is noteworthy
  certification_gap_threshold: 10,   // Less than 10% certification is a gap
  confidence_threshold: 60,          // Only report opportunities with >60% confidence
  max_opportunities_per_run: 10,
  enable_competitor_analysis: true,
  enable_geographic_analysis: true,
  enable_seasonal_analysis: true,
};

// ============================================================================
// Industry Classification
// ============================================================================

export const INDUSTRY_CLASSIFICATIONS = {
  mining: {
    code: 'mining',
    name: 'Mining & Resources',
    keywords: ['mining', 'resources', 'extraction', 'minerals'],
    sa_relevance: 'very_high',
  },
  manufacturing: {
    code: 'manufacturing',
    name: 'Manufacturing',
    keywords: ['manufacturing', 'production', 'factory', 'industrial'],
    sa_relevance: 'high',
  },
  infrastructure: {
    code: 'infrastructure',
    name: 'Infrastructure & Utilities',
    keywords: ['infrastructure', 'utilities', 'power', 'water', 'transport'],
    sa_relevance: 'very_high',
  },
  financial_services: {
    code: 'financial_services',
    name: 'Financial Services',
    keywords: ['bank', 'insurance', 'investment', 'financial'],
    sa_relevance: 'high',
  },
  government: {
    code: 'government',
    name: 'Government & Public Sector',
    keywords: ['government', 'municipality', 'public', 'state'],
    sa_relevance: 'very_high',
  },
  education: {
    code: 'education',
    name: 'Education & Training',
    keywords: ['education', 'training', 'university', 'college', 'school'],
    sa_relevance: 'medium',
  },
  healthcare: {
    code: 'healthcare',
    name: 'Healthcare',
    keywords: ['healthcare', 'hospital', 'medical', 'pharmaceutical'],
    sa_relevance: 'medium',
  },
  technology: {
    code: 'technology',
    name: 'Technology',
    keywords: ['technology', 'software', 'IT', 'digital'],
    sa_relevance: 'medium',
  },
  agriculture: {
    code: 'agriculture',
    name: 'Agriculture',
    keywords: ['agriculture', 'farming', 'agricultural'],
    sa_relevance: 'high',
  },
  retail: {
    code: 'retail',
    name: 'Retail & Consumer',
    keywords: ['retail', 'consumer', 'shop', 'store'],
    sa_relevance: 'medium',
  },
  other: {
    code: 'other',
    name: 'Other Industries',
    keywords: [],
    sa_relevance: 'low',
  },
} as const;

// ============================================================================
// Opportunity Detection Functions
// ============================================================================

/**
 * Analyse learner demographics to identify industry growth opportunities
 */
export function detectIndustryGrowthOpportunities(
  demographics: LearnerDemographics,
  config: OpportunityDetectorConfig = DEFAULT_DETECTOR_CONFIG
): MarketingOpportunity[] {
  const opportunities: MarketingOpportunity[] = [];

  for (const [industryCode, segment] of Object.entries(demographics.by_industry)) {
    // Skip small segments
    if (segment.learner_count < config.min_segment_size) continue;

    // Check for high growth rate
    if (segment.growth_rate_30d >= config.growth_rate_threshold) {
      const confidenceScore = calculateGrowthConfidence(segment);

      if (confidenceScore >= config.confidence_threshold) {
        opportunities.push({
          opportunity_id: `growth_${industryCode}_${Date.now()}`,
          opportunity_type: 'industry_growth',
          title: `Growing demand in ${segment.industry_name}`,
          description: `The ${segment.industry_name} sector has shown ${segment.growth_rate_30d.toFixed(1)}% growth in learner registrations over the past 30 days.`,
          rationale: generateGrowthRationale(segment),
          target_segment: {
            type: 'industry',
            identifier: industryCode,
            segment_name: segment.industry_name,
            segment_size: segment.learner_count,
          },
          confidence_score: confidenceScore,
          potential_impact: segment.growth_rate_30d > 30 ? 'very_high' : segment.growth_rate_30d > 20 ? 'high' : 'medium',
          effort_required: 'moderate',
          priority_score: calculatePriorityScore(confidenceScore, segment.growth_rate_30d),
          data_points: [
            { metric: 'Growth rate (30d)', value: `${segment.growth_rate_30d.toFixed(1)}%`, trend: 'up' },
            { metric: 'Learner count', value: segment.learner_count },
            { metric: 'Completion rate', value: `${segment.completion_rate.toFixed(1)}%` },
            { metric: 'Top course', value: segment.top_courses[0] || 'N/A' },
          ],
          identified_at: new Date().toISOString(),
          status: 'new',
        });
      }
    }

    // Check for certification gap (high completion, low certification)
    if (
      segment.completion_rate > 30 &&
      segment.certification_rate < config.certification_gap_threshold
    ) {
      const gapSize = segment.completion_rate - segment.certification_rate;
      const confidenceScore = Math.min(90, 50 + gapSize);

      if (confidenceScore >= config.confidence_threshold) {
        opportunities.push({
          opportunity_id: `cert_gap_${industryCode}_${Date.now()}`,
          opportunity_type: 'certification_gap',
          title: `Certification opportunity in ${segment.industry_name}`,
          description: `${segment.industry_name} learners show ${segment.completion_rate.toFixed(1)}% course completion but only ${segment.certification_rate.toFixed(1)}% certification rate. This ${gapSize.toFixed(0)}% gap represents revenue potential.`,
          rationale: generateCertificationGapRationale(segment),
          target_segment: {
            type: 'industry',
            identifier: industryCode,
            segment_name: segment.industry_name,
            segment_size: Math.round(segment.learner_count * (segment.completion_rate / 100)),
          },
          confidence_score: confidenceScore,
          potential_impact: gapSize > 30 ? 'very_high' : gapSize > 20 ? 'high' : 'medium',
          effort_required: 'minimal',
          priority_score: calculatePriorityScore(confidenceScore, gapSize),
          data_points: [
            { metric: 'Completion rate', value: `${segment.completion_rate.toFixed(1)}%` },
            { metric: 'Certification rate', value: `${segment.certification_rate.toFixed(1)}%`, comparison: 'vs. 25% target' },
            { metric: 'Gap size', value: `${gapSize.toFixed(0)}%` },
            { metric: 'Potential certifications', value: Math.round(segment.learner_count * gapSize / 100) },
          ],
          identified_at: new Date().toISOString(),
          status: 'new',
        });
      }
    }
  }

  // Sort by priority and limit
  return opportunities
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, config.max_opportunities_per_run);
}

/**
 * Analyse engagement patterns to identify behavioural opportunities
 */
export function detectEngagementOpportunities(
  engagement: EngagementPattern,
  demographics: LearnerDemographics,
  config: OpportunityDetectorConfig = DEFAULT_DETECTOR_CONFIG
): MarketingOpportunity[] {
  const opportunities: MarketingOpportunity[] = [];

  // Check for reactivation opportunity
  const dormantRatio = 1 - (engagement.monthly_active_users / demographics.total_learners);
  if (dormantRatio > 0.5 && demographics.total_learners > config.min_segment_size * 2) {
    const dormantCount = Math.round(demographics.total_learners * dormantRatio);

    opportunities.push({
      opportunity_id: `reactivation_${Date.now()}`,
      opportunity_type: 'reactivation',
      title: 'Reactivation campaign opportunity',
      description: `${dormantCount} learners (${(dormantRatio * 100).toFixed(0)}%) have been inactive in the past 30 days. A targeted reactivation campaign could bring them back.`,
      rationale: 'Dormant learners have already demonstrated interest by registering. Reactivation is typically more cost-effective than new acquisition.',
      target_segment: {
        type: 'behavioural',
        identifier: 'dormant_30d',
        segment_name: 'Dormant Learners (30+ days)',
        segment_size: dormantCount,
      },
      confidence_score: 75,
      potential_impact: 'high',
      effort_required: 'moderate',
      priority_score: 75 * 0.8,
      data_points: [
        { metric: 'Dormant learners', value: dormantCount },
        { metric: 'Dormancy rate', value: `${(dormantRatio * 100).toFixed(0)}%` },
        { metric: 'Monthly active users', value: engagement.monthly_active_users },
        { metric: 'Potential reactivation (10%)', value: Math.round(dormantCount * 0.1) },
      ],
      identified_at: new Date().toISOString(),
      status: 'new',
    });
  }

  // Check for high-performing courses to promote
  const topCourse = engagement.most_viewed_courses[0];
  if (topCourse && topCourse.completion_rate > 50) {
    opportunities.push({
      opportunity_id: `promote_course_${topCourse.course_id}_${Date.now()}`,
      opportunity_type: 'course_demand',
      title: `Promote high-performing course: ${topCourse.course_name}`,
      description: `${topCourse.course_name} has exceptional engagement with ${topCourse.completion_rate.toFixed(0)}% completion rate. Increased promotion could drive significant enrolments.`,
      rationale: 'Courses with high completion rates indicate strong learner satisfaction and are more likely to generate referrals and certifications.',
      target_segment: {
        type: 'behavioural',
        identifier: 'potential_enrollees',
        segment_name: 'Prospective Learners',
        segment_size: Math.round(demographics.total_learners * 0.3),
      },
      confidence_score: 80,
      potential_impact: 'high',
      effort_required: 'minimal',
      priority_score: 80 * 0.9,
      data_points: [
        { metric: 'Course completion rate', value: `${topCourse.completion_rate.toFixed(0)}%`, trend: 'up' },
        { metric: 'Current enrolments', value: topCourse.enrolment_count },
        { metric: 'View count', value: topCourse.view_count },
        { metric: 'Avg rating', value: topCourse.avg_rating.toFixed(1) },
      ],
      identified_at: new Date().toISOString(),
      status: 'new',
    });
  }

  // Check for conversion funnel gaps
  if (engagement.enrolled_to_completed < 30) {
    opportunities.push({
      opportunity_id: `completion_funnel_${Date.now()}`,
      opportunity_type: 'upsell',
      title: 'Improve enrolled-to-completed conversion',
      description: `Only ${engagement.enrolled_to_completed.toFixed(0)}% of enrolled learners complete their courses. Targeted nurturing could significantly improve this.`,
      rationale: 'Improving completion rates increases satisfaction, referrals, and certification revenue potential.',
      target_segment: {
        type: 'behavioural',
        identifier: 'enrolled_incomplete',
        segment_name: 'Enrolled but Incomplete',
        segment_size: Math.round(demographics.by_qualification_level.in_progress),
      },
      confidence_score: 70,
      potential_impact: 'high',
      effort_required: 'moderate',
      priority_score: 70 * 0.8,
      data_points: [
        { metric: 'Completion rate', value: `${engagement.enrolled_to_completed.toFixed(0)}%`, comparison: 'vs. 50% target' },
        { metric: 'Learners in progress', value: demographics.by_qualification_level.in_progress },
        { metric: 'Potential completions', value: Math.round(demographics.by_qualification_level.in_progress * 0.2) },
      ],
      identified_at: new Date().toISOString(),
      status: 'new',
    });
  }

  return opportunities
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, config.max_opportunities_per_run);
}

/**
 * Detect corporate expansion opportunities
 */
export function detectCorporateOpportunities(
  demographics: LearnerDemographics,
  config: OpportunityDetectorConfig = DEFAULT_DETECTOR_CONFIG
): MarketingOpportunity[] {
  const opportunities: MarketingOpportunity[] = [];

  // Identify industries with high individual learners but low corporate presence
  for (const [industryCode, segment] of Object.entries(demographics.by_industry)) {
    if (segment.learner_count < config.min_segment_size) continue;

    // High engagement score suggests corporate potential
    if (segment.engagement_score > 70 && segment.certification_rate > 15) {
      const industryInfo = INDUSTRY_CLASSIFICATIONS[industryCode as keyof typeof INDUSTRY_CLASSIFICATIONS];

      if (industryInfo?.sa_relevance === 'very_high' || industryInfo?.sa_relevance === 'high') {
        opportunities.push({
          opportunity_id: `corporate_${industryCode}_${Date.now()}`,
          opportunity_type: 'corporate_expansion',
          title: `Corporate partnership opportunity: ${segment.industry_name}`,
          description: `${segment.industry_name} shows strong individual engagement (${segment.engagement_score}/100) and certification commitment (${segment.certification_rate.toFixed(0)}%). This indicates potential for corporate training partnerships.`,
          rationale: `Individual learners often become internal advocates for corporate training programmes. ${segment.industry_name} is a high-relevance sector for South African asset management education.`,
          target_segment: {
            type: 'industry',
            identifier: industryCode,
            segment_name: `${segment.industry_name} Corporates`,
            segment_size: segment.learner_count,
          },
          confidence_score: 65,
          potential_impact: 'very_high',
          effort_required: 'significant',
          priority_score: 65 * 0.95, // Corporate deals are high value
          data_points: [
            { metric: 'Engagement score', value: segment.engagement_score },
            { metric: 'Certification rate', value: `${segment.certification_rate.toFixed(0)}%` },
            { metric: 'Individual learners', value: segment.learner_count },
            { metric: 'SA relevance', value: industryInfo?.sa_relevance || 'medium' },
          ],
          identified_at: new Date().toISOString(),
          status: 'new',
        });
      }
    }
  }

  return opportunities
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, config.max_opportunities_per_run);
}

/**
 * Main opportunity detection function - runs all detectors
 */
export async function detectAllOpportunities(
  demographics: LearnerDemographics,
  engagement: EngagementPattern,
  config: OpportunityDetectorConfig = DEFAULT_DETECTOR_CONFIG
): Promise<MarketingOpportunity[]> {
  const allOpportunities: MarketingOpportunity[] = [];

  // Run all detectors
  const industryOpportunities = detectIndustryGrowthOpportunities(demographics, config);
  const engagementOpportunities = detectEngagementOpportunities(engagement, demographics, config);
  const corporateOpportunities = detectCorporateOpportunities(demographics, config);

  allOpportunities.push(
    ...industryOpportunities,
    ...engagementOpportunities,
    ...corporateOpportunities
  );

  // Deduplicate by target segment
  const seen = new Set<string>();
  const deduplicated = allOpportunities.filter((opp) => {
    const key = `${opp.opportunity_type}_${opp.target_segment.identifier}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by priority and return top opportunities
  return deduplicated
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, config.max_opportunities_per_run);
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateGrowthConfidence(segment: IndustrySegment): number {
  let confidence = 50;

  // Higher learner count = more reliable data
  if (segment.learner_count > 100) confidence += 15;
  else if (segment.learner_count > 50) confidence += 10;

  // Consistent engagement supports confidence
  if (segment.engagement_score > 70) confidence += 15;
  else if (segment.engagement_score > 50) confidence += 10;

  // High completion rate suggests quality segment
  if (segment.completion_rate > 50) confidence += 10;

  return Math.min(95, confidence);
}

function calculatePriorityScore(confidence: number, impactMetric: number): number {
  // Priority = confidence * impact factor (0.5 to 1.0)
  const impactFactor = Math.min(1.0, 0.5 + (impactMetric / 100));
  return confidence * impactFactor;
}

function generateGrowthRationale(segment: IndustrySegment): string {
  const points: string[] = [];

  points.push(`${segment.growth_rate_30d.toFixed(1)}% growth indicates increasing market demand.`);

  if (segment.engagement_score > 60) {
    points.push(`High engagement score (${segment.engagement_score}/100) suggests strong interest in content.`);
  }

  if (segment.top_courses.length > 0) {
    points.push(`Top courses in this segment: ${segment.top_courses.slice(0, 3).join(', ')}.`);
  }

  points.push('Targeting this segment with tailored messaging could accelerate growth further.');

  return points.join(' ');
}

function generateCertificationGapRationale(segment: IndustrySegment): string {
  return `Learners in ${segment.industry_name} are completing courses but not pursuing official certification. ` +
    `This ${(segment.completion_rate - segment.certification_rate).toFixed(0)}% gap could be addressed through: ` +
    `(1) Targeted email campaigns highlighting certification benefits, ` +
    `(2) Industry-specific ROI messaging, ` +
    `(3) Limited-time certification incentives. ` +
    `Average revenue per certification could be R500-R8,890 depending on course.`;
}

// ============================================================================
// Mock Data Generator (for development)
// ============================================================================

export function generateMockDemographics(): LearnerDemographics {
  return {
    total_learners: 1247,
    by_industry: {
      mining: {
        industry_code: 'mining',
        industry_name: 'Mining & Resources',
        learner_count: 342,
        growth_rate_30d: 23.5,
        completion_rate: 45.2,
        certification_rate: 8.3,
        avg_courses_per_learner: 1.8,
        top_courses: ['GFMAM Foundation', 'Asset Lifecycle Management'],
        engagement_score: 78,
      },
      infrastructure: {
        industry_code: 'infrastructure',
        industry_name: 'Infrastructure & Utilities',
        learner_count: 287,
        growth_rate_30d: 18.2,
        completion_rate: 52.1,
        certification_rate: 12.5,
        avg_courses_per_learner: 2.1,
        top_courses: ['GFMAM Foundation', 'Risk Management'],
        engagement_score: 82,
      },
      government: {
        industry_code: 'government',
        industry_name: 'Government & Public Sector',
        learner_count: 198,
        growth_rate_30d: 31.4,
        completion_rate: 38.7,
        certification_rate: 5.2,
        avg_courses_per_learner: 1.4,
        top_courses: ['GFMAM Foundation', 'Asset Governance'],
        engagement_score: 65,
      },
      manufacturing: {
        industry_code: 'manufacturing',
        industry_name: 'Manufacturing',
        learner_count: 156,
        growth_rate_30d: 12.1,
        completion_rate: 48.3,
        certification_rate: 15.8,
        avg_courses_per_learner: 1.9,
        top_courses: ['GFMAM Foundation', 'Maintenance Management'],
        engagement_score: 71,
      },
      financial_services: {
        industry_code: 'financial_services',
        industry_name: 'Financial Services',
        learner_count: 134,
        growth_rate_30d: 8.5,
        completion_rate: 61.2,
        certification_rate: 28.4,
        avg_courses_per_learner: 2.5,
        top_courses: ['Asset Valuation', 'GFMAM Foundation'],
        engagement_score: 85,
      },
      other: {
        industry_code: 'other',
        industry_name: 'Other Industries',
        learner_count: 130,
        growth_rate_30d: 5.2,
        completion_rate: 35.1,
        certification_rate: 9.1,
        avg_courses_per_learner: 1.3,
        top_courses: ['GFMAM Foundation'],
        engagement_score: 55,
      },
    },
    by_company_size: {
      individual: 523,
      small_business: 312,
      medium_business: 278,
      enterprise: 134,
    },
    by_qualification_level: {
      exploring: 287,
      in_progress: 456,
      completed_one: 312,
      multi_qualified: 134,
      certified: 58,
    },
    by_referral_source: {
      organic_search: 423,
      linkedin: 287,
      direct: 234,
      referral: 189,
      corporate: 114,
    },
    geographic_distribution: {
      gauteng: 512,
      western_cape: 287,
      kwazulu_natal: 178,
      limpopo: 89,
      mpumalanga: 67,
      other_sa: 78,
      international: 36,
    },
  };
}

export function generateMockEngagement(): EngagementPattern {
  return {
    period: '30d',
    daily_active_users: 89,
    weekly_active_users: 234,
    monthly_active_users: 567,
    avg_session_duration_minutes: 24,
    avg_messages_per_session: 12,
    peak_hours: [9, 10, 14, 15, 20],
    peak_days: ['Monday', 'Tuesday', 'Wednesday'],
    most_viewed_courses: [
      {
        course_id: 'gfmam-foundation',
        course_name: 'GFMAM Foundation',
        view_count: 2341,
        enrolment_count: 892,
        completion_rate: 48.2,
        avg_rating: 4.6,
      },
      {
        course_id: 'asset-lifecycle',
        course_name: 'Asset Lifecycle Management',
        view_count: 1567,
        enrolment_count: 456,
        completion_rate: 52.1,
        avg_rating: 4.7,
      },
      {
        course_id: 'risk-management',
        course_name: 'Risk Management',
        view_count: 1234,
        enrolment_count: 389,
        completion_rate: 45.8,
        avg_rating: 4.5,
      },
    ],
    most_completed_modules: [
      'Introduction to Asset Management',
      'Asset Lifecycle Basics',
      'Risk Assessment Fundamentals',
    ],
    highest_satisfaction_content: [
      'Interactive case studies',
      'Real-world examples',
      'Claude feedback on assignments',
    ],
    visitor_to_registered: 23.5,
    registered_to_enrolled: 67.8,
    enrolled_to_completed: 42.3,
    completed_to_certified: 18.7,
  };
}
