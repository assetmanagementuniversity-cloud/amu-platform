/**
 * Campaign Recommendation Engine - AMU Platform
 *
 * Section 4.8: Marketing Campaign Autonomy
 *
 * Claude uses this to draft 'Campaign Recommendations' including:
 * - Opportunity identified
 * - Proposed messaging
 * - Content calendar
 * - Success metrics
 *
 * "Ubuntu - I am because we are"
 */

import type { MarketingOpportunity, OpportunityType } from './opportunity-detector';

// ============================================================================
// Types
// ============================================================================

export interface CampaignRecommendation {
  recommendation_id: string;

  // Source opportunity
  opportunity_id: string;
  opportunity_type: OpportunityType;
  opportunity_title: string;

  // Campaign overview
  campaign_name: string;
  campaign_objective: string;
  campaign_summary: string;

  // Target audience
  target_audience: {
    segment_name: string;
    segment_size: number;
    persona_description: string;
    pain_points: string[];
    value_propositions: string[];
  };

  // Proposed messaging
  messaging: CampaignMessaging;

  // Content calendar
  content_calendar: ContentCalendarItem[];

  // Channels
  channels: CampaignChannel[];

  // Budget & resources
  budget: CampaignBudget;

  // Success metrics
  success_metrics: SuccessMetric[];

  // A/B test variants (if applicable)
  ab_variants?: ABTestVariant[];

  // Status
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'paused';

  // Metadata
  created_at: string;
  created_by: 'claude';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;

  // Execution tracking
  started_at?: string;
  completed_at?: string;
  actual_results?: Record<string, number>;
}

export interface CampaignMessaging {
  // Core messaging
  headline: string;
  subheadline: string;
  key_message: string;
  call_to_action: string;

  // Supporting content
  supporting_points: string[];
  proof_points: string[];

  // Tone & style
  tone: 'professional' | 'conversational' | 'inspirational' | 'educational';
  brand_voice_notes: string;

  // Industry-specific hooks
  industry_hooks?: Record<string, string>;

  // Ubuntu philosophy integration
  ubuntu_connection: string;
}

export interface ContentCalendarItem {
  day: number;                   // Day 1, 2, 3, etc.
  date?: string;                 // Specific date if scheduled
  channel: string;
  content_type: ContentType;
  title: string;
  description: string;
  draft_content: string;
  hashtags?: string[];
  media_requirements?: string;
  posting_time?: string;         // e.g., "09:00 SAST"
  status: 'draft' | 'ready' | 'posted' | 'scheduled';
}

export type ContentType =
  | 'social_post'
  | 'email'
  | 'blog_article'
  | 'video_script'
  | 'infographic_brief'
  | 'webinar_outline'
  | 'case_study'
  | 'testimonial'
  | 'carousel_post'
  | 'story';

export interface CampaignChannel {
  channel: MarketingChannel;
  priority: 'primary' | 'secondary';
  reach_estimate: number;
  content_count: number;
  budget_allocation_percentage: number;
  notes?: string;
}

export type MarketingChannel =
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'email'
  | 'website'
  | 'google_ads'
  | 'webinar'
  | 'partnership';

export interface CampaignBudget {
  total_budget_zar: number;
  is_organic_only: boolean;
  breakdown: {
    category: string;
    amount_zar: number;
    notes?: string;
  }[];
  expected_roi: number;          // Expected return multiple (e.g., 3.0 = 3x)
}

export interface SuccessMetric {
  metric_name: string;
  metric_type: 'reach' | 'engagement' | 'conversion' | 'revenue' | 'brand';
  target_value: number;
  unit: string;
  measurement_method: string;
  baseline?: number;             // Current value if known
  stretch_target?: number;
}

export interface ABTestVariant {
  variant_id: string;
  variant_name: string;
  description: string;
  hypothesis: string;
  content_variation: string;
  allocation_percentage: number;
}

// ============================================================================
// Campaign Templates by Opportunity Type
// ============================================================================

const CAMPAIGN_TEMPLATES: Record<OpportunityType, CampaignTemplate> = {
  industry_growth: {
    name_template: '{industry} Asset Management Excellence Series',
    objective_template: 'Capture growing demand in {industry} sector with targeted content',
    channels: ['linkedin', 'email'],
    budget_range: { min: 0, max: 5000 },
    duration_days: 14,
    content_types: ['social_post', 'email', 'case_study'],
  },
  course_demand: {
    name_template: '{course} Promotion Campaign',
    objective_template: 'Increase enrolments for high-performing {course}',
    channels: ['linkedin', 'twitter', 'email'],
    budget_range: { min: 0, max: 3000 },
    duration_days: 7,
    content_types: ['social_post', 'email', 'testimonial'],
  },
  certification_gap: {
    name_template: '{segment} Certification Drive',
    objective_template: 'Convert completed learners to official certification in {segment}',
    channels: ['email'],
    budget_range: { min: 0, max: 1000 },
    duration_days: 10,
    content_types: ['email', 'social_post'],
  },
  geographic_expansion: {
    name_template: '{region} Market Entry Campaign',
    objective_template: 'Build awareness and registrations in {region}',
    channels: ['linkedin', 'facebook', 'google_ads'],
    budget_range: { min: 2000, max: 10000 },
    duration_days: 30,
    content_types: ['social_post', 'email', 'blog_article'],
  },
  competitor_gap: {
    name_template: 'Value Proposition Reinforcement',
    objective_template: 'Highlight AMU advantages over alternatives',
    channels: ['linkedin', 'website', 'email'],
    budget_range: { min: 0, max: 2000 },
    duration_days: 14,
    content_types: ['social_post', 'blog_article', 'case_study'],
  },
  seasonal_trend: {
    name_template: '{season} Learning Drive',
    objective_template: 'Capitalise on seasonal interest patterns',
    channels: ['linkedin', 'email', 'twitter'],
    budget_range: { min: 0, max: 3000 },
    duration_days: 21,
    content_types: ['social_post', 'email'],
  },
  referral_potential: {
    name_template: 'Ubuntu Referral Celebration',
    objective_template: 'Activate referral potential in high-engagement segment',
    channels: ['email'],
    budget_range: { min: 0, max: 500 },
    duration_days: 7,
    content_types: ['email', 'social_post'],
  },
  corporate_expansion: {
    name_template: '{industry} Corporate Partnership Programme',
    objective_template: 'Develop corporate training partnerships in {industry}',
    channels: ['linkedin', 'email', 'webinar'],
    budget_range: { min: 1000, max: 8000 },
    duration_days: 30,
    content_types: ['email', 'social_post', 'webinar_outline', 'case_study'],
  },
  reactivation: {
    name_template: 'Learning Journey Continuation',
    objective_template: 'Re-engage dormant learners and resume their learning',
    channels: ['email'],
    budget_range: { min: 0, max: 500 },
    duration_days: 14,
    content_types: ['email'],
  },
  upsell: {
    name_template: 'Learning Excellence Pathway',
    objective_template: 'Guide active learners to additional courses and certification',
    channels: ['email'],
    budget_range: { min: 0, max: 500 },
    duration_days: 7,
    content_types: ['email'],
  },
};

interface CampaignTemplate {
  name_template: string;
  objective_template: string;
  channels: MarketingChannel[];
  budget_range: { min: number; max: number };
  duration_days: number;
  content_types: ContentType[];
}

// ============================================================================
// Core Recommendation Generation
// ============================================================================

/**
 * Generate a campaign recommendation from a marketing opportunity
 */
export function generateCampaignRecommendation(
  opportunity: MarketingOpportunity
): CampaignRecommendation {
  const template = CAMPAIGN_TEMPLATES[opportunity.opportunity_type];
  const campaignName = interpolateTemplate(template.name_template, opportunity);
  const objective = interpolateTemplate(template.objective_template, opportunity);

  return {
    recommendation_id: `campaign_${opportunity.opportunity_id}`,
    opportunity_id: opportunity.opportunity_id,
    opportunity_type: opportunity.opportunity_type,
    opportunity_title: opportunity.title,

    campaign_name: campaignName,
    campaign_objective: objective,
    campaign_summary: generateCampaignSummary(opportunity, template),

    target_audience: generateTargetAudience(opportunity),
    messaging: generateMessaging(opportunity),
    content_calendar: generateContentCalendar(opportunity, template),
    channels: generateChannels(template),
    budget: generateBudget(opportunity, template),
    success_metrics: generateSuccessMetrics(opportunity, template),

    status: 'pending_review',
    created_at: new Date().toISOString(),
    created_by: 'claude',
  };
}

/**
 * Generate multiple campaign recommendations from opportunities
 */
export function generateCampaignRecommendations(
  opportunities: MarketingOpportunity[],
  maxRecommendations: number = 5
): CampaignRecommendation[] {
  return opportunities
    .slice(0, maxRecommendations)
    .map(generateCampaignRecommendation);
}

// ============================================================================
// Content Generation Helpers
// ============================================================================

function generateCampaignSummary(
  opportunity: MarketingOpportunity,
  template: CampaignTemplate
): string {
  return `This ${template.duration_days}-day campaign targets ${opportunity.target_segment.segment_name} ` +
    `(${opportunity.target_segment.segment_size} potential learners) based on the identified ${opportunity.opportunity_type.replace('_', ' ')} opportunity. ` +
    `Using ${template.channels.join(', ')} channels, we aim to ${opportunity.description.toLowerCase()} ` +
    `Budget range: R${template.budget_range.min}-${template.budget_range.max}. ` +
    `Confidence score: ${opportunity.confidence_score}%.`;
}

function generateTargetAudience(opportunity: MarketingOpportunity): CampaignRecommendation['target_audience'] {
  const personas: Record<string, { description: string; pain_points: string[]; values: string[] }> = {
    industry: {
      description: `Asset management professionals in the ${opportunity.target_segment.segment_name} sector seeking to enhance their skills and credentials.`,
      pain_points: [
        'Lack of accessible, quality asset management education',
        'Need for industry-recognised certification',
        'Time constraints for traditional learning',
        'Budget limitations for training programmes',
      ],
      values: [
        'Free access to world-class education',
        'Learn at your own pace with AI facilitation',
        'Earn industry-recognised GFMAM certificates',
        'Join Ubuntu community where success is shared',
      ],
    },
    behavioural: {
      description: `Learners who have shown interest in AMU but haven't yet reached their full potential on the platform.`,
      pain_points: [
        'Busy schedules interrupting learning',
        'Uncertainty about next steps',
        'Lack of motivation to continue alone',
        'Questions about certification value',
      ],
      values: [
        'Pick up where you left off instantly',
        'Claude remembers your progress',
        'Clear pathway to certification',
        'Community of fellow learners',
      ],
    },
    corporate: {
      description: `Training managers and HR professionals seeking scalable, cost-effective asset management education for their teams.`,
      pain_points: [
        'High cost of traditional training',
        'Difficulty tracking employee progress',
        'Time away from work for training',
        'SDL grant compliance complexity',
      ],
      values: [
        'Up to 10% corporate discount',
        'Real-time progress dashboards',
        'Learn on-the-job, no time off needed',
        'SDL grant-compliant certification',
      ],
    },
  };

  const persona = personas[opportunity.target_segment.type] || personas.industry;

  return {
    segment_name: opportunity.target_segment.segment_name,
    segment_size: opportunity.target_segment.segment_size,
    persona_description: persona.description,
    pain_points: persona.pain_points,
    value_propositions: persona.values,
  };
}

function generateMessaging(opportunity: MarketingOpportunity): CampaignMessaging {
  const headlines: Record<OpportunityType, string> = {
    industry_growth: `Elevate Your Asset Management Career`,
    course_demand: `Master Asset Management - Start Free Today`,
    certification_gap: `Make Your Achievement Official`,
    geographic_expansion: `World-Class Asset Management Education, Now Local`,
    competitor_gap: `The Smart Choice for Asset Management Education`,
    seasonal_trend: `Start Your Learning Journey This Season`,
    referral_potential: `Share Knowledge, Earn Together`,
    corporate_expansion: `Transform Your Team's Asset Management Capability`,
    reactivation: `Your Learning Journey Awaits`,
    upsell: `Take the Next Step in Your Career`,
  };

  const ctas: Record<OpportunityType, string> = {
    industry_growth: `Start Learning Free`,
    course_demand: `Enrol Now - It's Free`,
    certification_gap: `Get Certified Today`,
    geographic_expansion: `Join AMU Free`,
    competitor_gap: `See Why We're Different`,
    seasonal_trend: `Begin Your Journey`,
    referral_potential: `Share Your Code`,
    corporate_expansion: `Request Corporate Demo`,
    reactivation: `Continue Learning`,
    upsell: `Explore More Courses`,
  };

  return {
    headline: headlines[opportunity.opportunity_type],
    subheadline: opportunity.title,
    key_message: `AMU offers free, AI-facilitated asset management education aligned with global GFMAM standards. ` +
      `Learn at your own pace, demonstrate competency through conversation, and earn recognition for your achievement.`,
    call_to_action: ctas[opportunity.opportunity_type],
    supporting_points: [
      'Free access to comprehensive curriculum',
      'AI-powered Socratic learning with Claude',
      'Industry-aligned GFMAM competencies',
      'Official certification available',
    ],
    proof_points: opportunity.data_points.map(dp =>
      `${dp.metric}: ${dp.value}${dp.comparison ? ` (${dp.comparison})` : ''}`
    ),
    tone: opportunity.opportunity_type === 'corporate_expansion' ? 'professional' : 'inspirational',
    brand_voice_notes: 'Emphasise accessibility, quality, and Ubuntu philosophy. Avoid salesy language.',
    ubuntu_connection: `"Ubuntu - I am because we are." At AMU, corporations who certify their teams fund free education for individuals who cannot pay. Your success enables others to succeed.`,
  };
}

function generateContentCalendar(
  opportunity: MarketingOpportunity,
  template: CampaignTemplate
): ContentCalendarItem[] {
  const calendar: ContentCalendarItem[] = [];
  const daysPerContent = Math.ceil(template.duration_days / template.content_types.length / 2);

  let dayCounter = 1;

  // Generate content for each channel and type
  for (const contentType of template.content_types) {
    for (let i = 0; i < 2; i++) { // 2 pieces per content type
      if (dayCounter > template.duration_days) break;

      const channel = template.channels[i % template.channels.length];

      calendar.push({
        day: dayCounter,
        channel,
        content_type: contentType,
        title: generateContentTitle(opportunity, contentType, i + 1),
        description: generateContentDescription(opportunity, contentType),
        draft_content: generateDraftContent(opportunity, contentType, i + 1),
        hashtags: generateHashtags(opportunity),
        media_requirements: getMediaRequirements(contentType),
        posting_time: contentType === 'email' ? '09:00 SAST' : '10:00 SAST',
        status: 'draft',
      });

      dayCounter += daysPerContent;
    }
  }

  return calendar.sort((a, b) => a.day - b.day);
}

function generateContentTitle(opportunity: MarketingOpportunity, contentType: ContentType, index: number): string {
  const prefixes: Record<ContentType, string> = {
    social_post: `LinkedIn Post ${index}`,
    email: `Email ${index}`,
    blog_article: `Blog Article`,
    video_script: `Video Script`,
    infographic_brief: `Infographic`,
    webinar_outline: `Webinar`,
    case_study: `Case Study`,
    testimonial: `Success Story`,
    carousel_post: `Carousel ${index}`,
    story: `Story ${index}`,
  };

  return `${prefixes[contentType]}: ${opportunity.target_segment.segment_name}`;
}

function generateContentDescription(opportunity: MarketingOpportunity, contentType: ContentType): string {
  const descriptions: Record<ContentType, string> = {
    social_post: `Engaging post highlighting ${opportunity.opportunity_type.replace('_', ' ')} for ${opportunity.target_segment.segment_name}.`,
    email: `Targeted email nurturing ${opportunity.target_segment.segment_name} toward next action.`,
    blog_article: `In-depth article addressing needs of ${opportunity.target_segment.segment_name}.`,
    video_script: `Short video script showcasing AMU value for ${opportunity.target_segment.segment_name}.`,
    infographic_brief: `Visual summary of key benefits for ${opportunity.target_segment.segment_name}.`,
    webinar_outline: `Educational webinar for ${opportunity.target_segment.segment_name} decision-makers.`,
    case_study: `Success story from ${opportunity.target_segment.segment_name} sector.`,
    testimonial: `Learner testimonial from ${opportunity.target_segment.segment_name}.`,
    carousel_post: `Multi-slide post walking through value proposition.`,
    story: `Quick, engaging story format content.`,
  };

  return descriptions[contentType];
}

function generateDraftContent(opportunity: MarketingOpportunity, contentType: ContentType, index: number): string {
  if (contentType === 'social_post') {
    return generateSocialPostDraft(opportunity, index);
  } else if (contentType === 'email') {
    return generateEmailDraft(opportunity, index);
  }

  return `[Draft ${contentType} content to be generated based on ${opportunity.title}]`;
}

function generateSocialPostDraft(opportunity: MarketingOpportunity, index: number): string {
  if (index === 1) {
    return `🎯 ${opportunity.target_segment.segment_name} professionals: Your path to asset management excellence starts here.

${opportunity.description}

At AMU, we believe education should be accessible to everyone. That's why our complete curriculum is free.

✅ AI-facilitated learning with Claude
✅ GFMAM-aligned competencies
✅ Learn at your own pace
✅ Official certification available

Start your journey today: [link]

#AssetManagement #ProfessionalDevelopment #Ubuntu #FreeLearning`;
  }

  return `📈 Did you know? ${opportunity.data_points[0]?.value || 'Asset management skills are in high demand'}

That's why ${opportunity.target_segment.segment_name} professionals are choosing AMU for their development.

"Ubuntu - I am because we are"

When you succeed, you enable others to succeed too.

🔗 Join the movement: [link]

#AssetManagement #Ubuntu #SkillsDevelopment`;
}

function generateEmailDraft(opportunity: MarketingOpportunity, index: number): string {
  if (index === 1) {
    return `Subject: Your Path to Asset Management Excellence

Dear [First Name],

${opportunity.description}

As a professional in ${opportunity.target_segment.segment_name}, you understand the importance of continuous development. That's why we're reaching out to share how AMU can support your journey.

**What Makes AMU Different:**

• Free, comprehensive curriculum aligned with GFMAM standards
• AI-facilitated learning that adapts to your pace
• Conversation-based competency assessment
• Optional official certification when you're ready

**Why Ubuntu?**

"I am because we are." Our model ensures that corporations who certify their teams fund free education for individuals who cannot pay. Your success enables others to succeed.

Ready to start? Simply reply to this email or visit [link].

Warm regards,
Claude
Asset Management University

P.S. ${opportunity.data_points[0]?.metric || 'Over 1,000 learners'} have already begun their journey. Join them today.`;
  }

  return `Subject: ${opportunity.target_segment.segment_name} - Don't Miss This Opportunity

Dear [First Name],

We noticed you haven't yet started your asset management learning journey.

${opportunity.rationale}

**This Week Only:**
• Free access to our complete curriculum
• AI-powered personalised learning
• Start anytime, progress at your pace

The opportunity is here. Are you?

Start learning: [link]

Claude
Asset Management University`;
}

function generateHashtags(opportunity: MarketingOpportunity): string[] {
  const base = ['#AssetManagement', '#Ubuntu', '#FreeLearning', '#ProfessionalDevelopment'];

  const industryTags: Record<string, string[]> = {
    mining: ['#Mining', '#MiningIndustry', '#SouthAfricanMining'],
    infrastructure: ['#Infrastructure', '#Utilities', '#PublicWorks'],
    government: ['#PublicSector', '#Government', '#ServiceDelivery'],
    manufacturing: ['#Manufacturing', '#Industry40'],
    financial_services: ['#FinancialServices', '#AssetValuation'],
  };

  const segmentTags = industryTags[opportunity.target_segment.identifier] || [];

  return [...base, ...segmentTags].slice(0, 8);
}

function getMediaRequirements(contentType: ContentType): string {
  const requirements: Record<ContentType, string> = {
    social_post: 'Branded image (1200x628px) or short video (< 60s)',
    email: 'Header image (600px wide)',
    blog_article: 'Hero image + 2-3 supporting images',
    video_script: 'Video production (2-3 minutes)',
    infographic_brief: 'Designed infographic (vertical format)',
    webinar_outline: 'Slide deck + presenter video setup',
    case_study: 'Client logo + results graphics',
    testimonial: 'Learner photo (with permission)',
    carousel_post: '5-10 carousel slides (1080x1080px each)',
    story: 'Vertical image/video (1080x1920px)',
  };

  return requirements[contentType];
}

function generateChannels(template: CampaignTemplate): CampaignChannel[] {
  const channelDetails: Record<MarketingChannel, { reach: number; notes: string }> = {
    linkedin: { reach: 5000, notes: 'Primary B2B channel for professional audience' },
    twitter: { reach: 3000, notes: 'Quick engagement and industry conversations' },
    facebook: { reach: 4000, notes: 'Broader reach, good for awareness' },
    email: { reach: 2000, notes: 'Highest conversion potential with existing contacts' },
    website: { reach: 1000, notes: 'Conversion-focused landing pages' },
    google_ads: { reach: 10000, notes: 'Paid reach expansion' },
    webinar: { reach: 100, notes: 'High engagement, decision-maker focused' },
    partnership: { reach: 500, notes: 'Co-marketing with industry partners' },
  };

  const totalChannels = template.channels.length;
  const budgetPerChannel = 100 / totalChannels;

  return template.channels.map((channel, index) => ({
    channel,
    priority: index === 0 ? 'primary' : 'secondary',
    reach_estimate: channelDetails[channel].reach,
    content_count: Math.ceil(template.duration_days / 7),
    budget_allocation_percentage: Math.round(budgetPerChannel),
    notes: channelDetails[channel].notes,
  }));
}

function generateBudget(
  opportunity: MarketingOpportunity,
  template: CampaignTemplate
): CampaignBudget {
  // Determine budget based on impact and effort
  const impactMultiplier: Record<string, number> = {
    low: 0.2,
    medium: 0.5,
    high: 0.8,
    very_high: 1.0,
  };

  const multiplier = impactMultiplier[opportunity.potential_impact] || 0.5;
  const suggestedBudget = Math.round(
    template.budget_range.min + (template.budget_range.max - template.budget_range.min) * multiplier
  );

  const isOrganic = suggestedBudget < 500;

  return {
    total_budget_zar: suggestedBudget,
    is_organic_only: isOrganic,
    breakdown: isOrganic
      ? [{ category: 'Organic (no cost)', amount_zar: 0, notes: 'Staff time only' }]
      : [
          { category: 'Paid social', amount_zar: Math.round(suggestedBudget * 0.6), notes: 'LinkedIn/Facebook ads' },
          { category: 'Content production', amount_zar: Math.round(suggestedBudget * 0.3), notes: 'Graphics, copy' },
          { category: 'Tools & tracking', amount_zar: Math.round(suggestedBudget * 0.1) },
        ],
    expected_roi: opportunity.opportunity_type === 'corporate_expansion' ? 5.0 : 3.0,
  };
}

function generateSuccessMetrics(
  opportunity: MarketingOpportunity,
  template: CampaignTemplate
): SuccessMetric[] {
  const metrics: SuccessMetric[] = [
    {
      metric_name: 'Reach',
      metric_type: 'reach',
      target_value: opportunity.target_segment.segment_size * 0.3,
      unit: 'people',
      measurement_method: 'Platform analytics',
    },
    {
      metric_name: 'Engagement Rate',
      metric_type: 'engagement',
      target_value: 5,
      unit: '%',
      measurement_method: 'Total engagements / impressions',
      baseline: 2.5,
    },
    {
      metric_name: 'Click-Through Rate',
      metric_type: 'engagement',
      target_value: 2,
      unit: '%',
      measurement_method: 'Clicks / impressions',
      baseline: 1.2,
    },
    {
      metric_name: 'New Registrations',
      metric_type: 'conversion',
      target_value: Math.round(opportunity.target_segment.segment_size * 0.05),
      unit: 'registrations',
      measurement_method: 'UTM tracking',
    },
  ];

  // Add type-specific metrics
  if (opportunity.opportunity_type === 'certification_gap') {
    metrics.push({
      metric_name: 'Certification Conversions',
      metric_type: 'revenue',
      target_value: Math.round(opportunity.target_segment.segment_size * 0.02),
      unit: 'certifications',
      measurement_method: 'Payment tracking',
    });
  }

  if (opportunity.opportunity_type === 'corporate_expansion') {
    metrics.push({
      metric_name: 'Corporate Inquiries',
      metric_type: 'conversion',
      target_value: 10,
      unit: 'inquiries',
      measurement_method: 'Form submissions + email responses',
    });
  }

  return metrics;
}

function interpolateTemplate(template: string, opportunity: MarketingOpportunity): string {
  return template
    .replace('{industry}', opportunity.target_segment.segment_name)
    .replace('{segment}', opportunity.target_segment.segment_name)
    .replace('{course}', opportunity.data_points.find(d => d.metric.includes('course'))?.value as string || 'Popular Course')
    .replace('{region}', opportunity.target_segment.segment_name)
    .replace('{season}', getCurrentSeason());
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Autumn';
  if (month >= 5 && month <= 7) return 'Winter';
  if (month >= 8 && month <= 10) return 'Spring';
  return 'Summer';
}

// ============================================================================
// Campaign Management
// ============================================================================

/**
 * Update campaign status after review
 */
export function updateCampaignStatus(
  campaign: CampaignRecommendation,
  status: CampaignRecommendation['status'],
  reviewedBy: string,
  notes?: string
): CampaignRecommendation {
  return {
    ...campaign,
    status,
    reviewed_by: reviewedBy,
    reviewed_at: new Date().toISOString(),
    review_notes: notes,
    started_at: status === 'in_progress' ? new Date().toISOString() : campaign.started_at,
    completed_at: status === 'completed' ? new Date().toISOString() : campaign.completed_at,
  };
}

/**
 * Record actual campaign results
 */
export function recordCampaignResults(
  campaign: CampaignRecommendation,
  results: Record<string, number>
): CampaignRecommendation {
  return {
    ...campaign,
    status: 'completed',
    completed_at: new Date().toISOString(),
    actual_results: results,
  };
}

// ============================================================================
// Export Summary Type (for dashboard display)
// ============================================================================

export interface CampaignRecommendationSummary {
  recommendation_id: string;
  campaign_name: string;
  opportunity_type: OpportunityType;
  target_segment: string;
  segment_size: number;
  confidence_score: number;
  budget: number;
  duration_days: number;
  status: CampaignRecommendation['status'];
  created_at: string;
}

export function summariseCampaign(campaign: CampaignRecommendation): CampaignRecommendationSummary {
  return {
    recommendation_id: campaign.recommendation_id,
    campaign_name: campaign.campaign_name,
    opportunity_type: campaign.opportunity_type,
    target_segment: campaign.target_audience.segment_name,
    segment_size: campaign.target_audience.segment_size,
    confidence_score: 0, // Would need opportunity reference
    budget: campaign.budget.total_budget_zar,
    duration_days: campaign.content_calendar.length > 0
      ? Math.max(...campaign.content_calendar.map(c => c.day))
      : 14,
    status: campaign.status,
    created_at: campaign.created_at,
  };
}
