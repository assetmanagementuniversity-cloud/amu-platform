/**
 * Marketing API Routes - AMU Platform
 *
 * Section 4.8: Marketing Campaign Autonomy
 *
 * API endpoints for:
 * - Campaign recommendations (Claude-generated)
 * - Campaign approval/rejection workflow
 * - Campaign execution tracking
 * - Marketing autonomy integration
 *
 * "Ubuntu - I am because we are"
 */

import { Router, Response } from 'express';
import { TeamMemberRequest, requireTeamMember } from '../middleware/auth';
import {
  createClaudeActivity,
  updateTaskTypeMetrics,
  createAutonomyRequest,
  AUTONOMY_REQUEST_THRESHOLD,
} from '@amu/database';

const router = Router();

// All marketing routes require team member authentication
router.use(requireTeamMember);

// ============================================================================
// Types (simplified for API)
// ============================================================================

interface CampaignRecommendation {
  recommendation_id: string;
  campaign_name: string;
  opportunity_type: string;
  campaign_summary: string;
  target_segment: string;
  segment_size: number;
  confidence_score: number;
  budget: number;
  duration_days: number;
  channels: string[];
  status: 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  messaging?: {
    headline: string;
    key_message: string;
    call_to_action: string;
  };
  success_metrics?: {
    metric_name: string;
    target_value: number;
    unit: string;
  }[];
}

// In-memory store for development (replace with Firestore in production)
const campaignRecommendations: Map<string, CampaignRecommendation> = new Map();

// Initialize with mock data
function initializeMockCampaigns() {
  if (campaignRecommendations.size === 0) {
    const mockCampaigns: CampaignRecommendation[] = [
      {
        recommendation_id: 'rec_mining_growth_001',
        campaign_name: 'Mining & Resources Excellence Series',
        opportunity_type: 'industry_growth',
        campaign_summary: 'This 14-day campaign targets Mining & Resources (342 potential learners) based on 23.5% growth in the sector. Using LinkedIn and email channels, we aim to capture growing demand.',
        target_segment: 'Mining & Resources',
        segment_size: 342,
        confidence_score: 78,
        budget: 0,
        duration_days: 14,
        channels: ['linkedin', 'email'],
        status: 'pending_review',
        created_at: new Date().toISOString(),
        messaging: {
          headline: 'Elevate Your Asset Management Career',
          key_message: 'AMU offers free, AI-facilitated asset management education aligned with global GFMAM standards.',
          call_to_action: 'Start Learning Free',
        },
        success_metrics: [
          { metric_name: 'Reach', target_value: 100, unit: 'people' },
          { metric_name: 'New Registrations', target_value: 17, unit: 'registrations' },
        ],
      },
      {
        recommendation_id: 'rec_gov_cert_002',
        campaign_name: 'Government Sector Certification Drive',
        opportunity_type: 'certification_gap',
        campaign_summary: 'Government learners show 38.7% completion but only 5.2% certification rate - a 33% gap representing revenue potential.',
        target_segment: 'Government & Public Sector',
        segment_size: 77,
        confidence_score: 83,
        budget: 0,
        duration_days: 10,
        channels: ['email'],
        status: 'pending_review',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        messaging: {
          headline: 'Make Your Achievement Official',
          key_message: 'You\'ve completed the learning - now get the certification your career deserves.',
          call_to_action: 'Get Certified Today',
        },
        success_metrics: [
          { metric_name: 'Certification Conversions', target_value: 4, unit: 'certifications' },
          { metric_name: 'Email Open Rate', target_value: 35, unit: '%' },
        ],
      },
      {
        recommendation_id: 'rec_infra_corp_003',
        campaign_name: 'Infrastructure Corporate Partnership Programme',
        opportunity_type: 'corporate_expansion',
        campaign_summary: 'Infrastructure shows strong engagement (82/100) and 12.5% certification rate. High potential for corporate training partnerships.',
        target_segment: 'Infrastructure & Utilities Corporates',
        segment_size: 287,
        confidence_score: 65,
        budget: 3000,
        duration_days: 30,
        channels: ['linkedin', 'email', 'webinar'],
        status: 'pending_review',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        messaging: {
          headline: 'Transform Your Team\'s Asset Management Capability',
          key_message: 'Corporate training partnerships with up to 10% discount and real-time progress dashboards.',
          call_to_action: 'Request Corporate Demo',
        },
        success_metrics: [
          { metric_name: 'Corporate Inquiries', target_value: 10, unit: 'inquiries' },
          { metric_name: 'Reach', target_value: 86, unit: 'people' },
        ],
      },
    ];

    mockCampaigns.forEach(c => campaignRecommendations.set(c.recommendation_id, c));
  }
}

initializeMockCampaigns();

// ============================================================================
// Campaign Recommendations Endpoints
// ============================================================================

/**
 * GET /marketing/recommendations
 * Get all campaign recommendations
 */
router.get('/recommendations', async (req: TeamMemberRequest, res: Response) => {
  try {
    const { status } = req.query;

    let recommendations = Array.from(campaignRecommendations.values());

    if (status) {
      recommendations = recommendations.filter(r => r.status === status);
    }

    // Sort by created_at desc
    recommendations.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.json({
      success: true,
      data: recommendations,
      summary: {
        total: recommendations.length,
        pending_review: recommendations.filter(r => r.status === 'pending_review').length,
        approved: recommendations.filter(r => r.status === 'approved').length,
        in_progress: recommendations.filter(r => r.status === 'in_progress').length,
        completed: recommendations.filter(r => r.status === 'completed').length,
      },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * GET /marketing/recommendations/:id
 * Get a specific campaign recommendation
 */
router.get('/recommendations/:id', async (req: TeamMemberRequest, res: Response) => {
  try {
    const recommendation = campaignRecommendations.get(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
});

/**
 * POST /marketing/recommendations/:id/approve
 * Approve a campaign recommendation
 */
router.post('/recommendations/:id/approve', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const recommendation = campaignRecommendations.get(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    if (recommendation.status !== 'pending_review') {
      return res.status(400).json({ error: `Cannot approve recommendation with status: ${recommendation.status}` });
    }

    // Update recommendation
    recommendation.status = 'approved';
    recommendation.reviewed_by = req.user.uid;
    recommendation.reviewed_at = new Date().toISOString();

    campaignRecommendations.set(req.params.id, recommendation);

    // Log activity for autonomy tracking
    try {
      await createClaudeActivity({
        activity_type: 'task_handled',
        category: 'marketing',
        title: `Campaign approved: ${recommendation.campaign_name}`,
        description: `Marketing campaign recommendation was approved for execution`,
        action_taken: 'approved',
        was_autonomous: false,
        claude_initiated: true,
        team_member_id: req.user.uid,
        team_member_name: req.user.displayName || 'Team Member',
        metrics: {
          learners_affected: recommendation.segment_size,
        },
      });

      // Update task type metrics for autonomy tracking
      await updateTaskTypeMetrics('marketing', 'campaign_recommendations', 'approved');
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }

    res.json({
      success: true,
      message: `Campaign "${recommendation.campaign_name}" approved`,
      data: recommendation,
    });
  } catch (error) {
    console.error('Error approving recommendation:', error);
    res.status(500).json({ error: 'Failed to approve recommendation' });
  }
});

/**
 * POST /marketing/recommendations/:id/reject
 * Reject a campaign recommendation
 */
router.post('/recommendations/:id/reject', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { reason } = req.body;
    const recommendation = campaignRecommendations.get(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    if (recommendation.status !== 'pending_review') {
      return res.status(400).json({ error: `Cannot reject recommendation with status: ${recommendation.status}` });
    }

    // Update recommendation
    recommendation.status = 'rejected';
    recommendation.reviewed_by = req.user.uid;
    recommendation.reviewed_at = new Date().toISOString();

    campaignRecommendations.set(req.params.id, recommendation);

    // Log activity
    try {
      await createClaudeActivity({
        activity_type: 'task_handled',
        category: 'marketing',
        title: `Campaign rejected: ${recommendation.campaign_name}`,
        description: reason || 'Marketing campaign recommendation was rejected',
        action_taken: 'rejected',
        was_autonomous: false,
        claude_initiated: true,
        team_member_id: req.user.uid,
        team_member_name: req.user.displayName || 'Team Member',
      });

      await updateTaskTypeMetrics('marketing', 'campaign_recommendations', 'rejected');
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }

    res.json({
      success: true,
      message: `Campaign "${recommendation.campaign_name}" rejected`,
      data: recommendation,
    });
  } catch (error) {
    console.error('Error rejecting recommendation:', error);
    res.status(500).json({ error: 'Failed to reject recommendation' });
  }
});

/**
 * POST /marketing/recommendations/:id/start
 * Start executing an approved campaign
 */
router.post('/recommendations/:id/start', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const recommendation = campaignRecommendations.get(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    if (recommendation.status !== 'approved') {
      return res.status(400).json({ error: `Cannot start campaign with status: ${recommendation.status}` });
    }

    // Update recommendation
    recommendation.status = 'in_progress';

    campaignRecommendations.set(req.params.id, recommendation);

    // Log activity
    try {
      await createClaudeActivity({
        activity_type: 'task_handled',
        category: 'marketing',
        title: `Campaign started: ${recommendation.campaign_name}`,
        description: `Campaign execution begun across ${recommendation.channels.join(', ')}`,
        action_taken: 'executed',
        was_autonomous: false,
        claude_initiated: true,
        team_member_id: req.user.uid,
        team_member_name: req.user.displayName || 'Team Member',
        metrics: {
          learners_affected: recommendation.segment_size,
        },
      });

      await updateTaskTypeMetrics('marketing', 'campaign_execution', 'approved');
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }

    res.json({
      success: true,
      message: `Campaign "${recommendation.campaign_name}" started`,
      data: recommendation,
    });
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ error: 'Failed to start campaign' });
  }
});

/**
 * POST /marketing/recommendations/:id/pause
 * Pause a running campaign
 */
router.post('/recommendations/:id/pause', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const recommendation = campaignRecommendations.get(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    if (recommendation.status !== 'in_progress') {
      return res.status(400).json({ error: `Cannot pause campaign with status: ${recommendation.status}` });
    }

    // Update recommendation (back to approved so it can be restarted)
    recommendation.status = 'approved';

    campaignRecommendations.set(req.params.id, recommendation);

    // Log activity
    try {
      await createClaudeActivity({
        activity_type: 'task_handled',
        category: 'marketing',
        title: `Campaign paused: ${recommendation.campaign_name}`,
        description: 'Campaign execution paused',
        action_taken: 'paused',
        was_autonomous: false,
        claude_initiated: false,
        team_member_id: req.user.uid,
        team_member_name: req.user.displayName || 'Team Member',
      });
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }

    res.json({
      success: true,
      message: `Campaign "${recommendation.campaign_name}" paused`,
      data: recommendation,
    });
  } catch (error) {
    console.error('Error pausing campaign:', error);
    res.status(500).json({ error: 'Failed to pause campaign' });
  }
});

/**
 * POST /marketing/recommendations/:id/complete
 * Mark a campaign as completed
 */
router.post('/recommendations/:id/complete', async (req: TeamMemberRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { results } = req.body;
    const recommendation = campaignRecommendations.get(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    if (recommendation.status !== 'in_progress') {
      return res.status(400).json({ error: `Cannot complete campaign with status: ${recommendation.status}` });
    }

    // Update recommendation
    recommendation.status = 'completed';

    campaignRecommendations.set(req.params.id, recommendation);

    // Log activity
    try {
      await createClaudeActivity({
        activity_type: 'task_handled',
        category: 'marketing',
        title: `Campaign completed: ${recommendation.campaign_name}`,
        description: `Campaign completed with results: ${JSON.stringify(results || {})}`,
        action_taken: 'completed',
        was_autonomous: false,
        claude_initiated: true,
        team_member_id: req.user.uid,
        team_member_name: req.user.displayName || 'Team Member',
        metrics: {
          learners_affected: recommendation.segment_size,
        },
      });

      await updateTaskTypeMetrics('marketing', 'campaign_execution', 'approved');
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }

    res.json({
      success: true,
      message: `Campaign "${recommendation.campaign_name}" completed`,
      data: recommendation,
    });
  } catch (error) {
    console.error('Error completing campaign:', error);
    res.status(500).json({ error: 'Failed to complete campaign' });
  }
});

// ============================================================================
// Analytics & Reporting
// ============================================================================

/**
 * GET /marketing/analytics
 * Get marketing performance analytics
 */
router.get('/analytics', async (req: TeamMemberRequest, res: Response) => {
  try {
    const recommendations = Array.from(campaignRecommendations.values());

    const analytics = {
      campaigns: {
        total: recommendations.length,
        by_status: {
          pending_review: recommendations.filter(r => r.status === 'pending_review').length,
          approved: recommendations.filter(r => r.status === 'approved').length,
          in_progress: recommendations.filter(r => r.status === 'in_progress').length,
          completed: recommendations.filter(r => r.status === 'completed').length,
          rejected: recommendations.filter(r => r.status === 'rejected').length,
        },
        by_type: {} as Record<string, number>,
      },
      reach: {
        potential: recommendations.reduce((sum, r) => sum + r.segment_size, 0),
        in_progress: recommendations
          .filter(r => r.status === 'in_progress')
          .reduce((sum, r) => sum + r.segment_size, 0),
        completed: recommendations
          .filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + r.segment_size, 0),
      },
      budget: {
        total_approved: recommendations
          .filter(r => r.status !== 'pending_review' && r.status !== 'rejected')
          .reduce((sum, r) => sum + r.budget, 0),
        in_progress: recommendations
          .filter(r => r.status === 'in_progress')
          .reduce((sum, r) => sum + r.budget, 0),
      },
    };

    // Count by opportunity type
    recommendations.forEach(r => {
      analytics.campaigns.by_type[r.opportunity_type] =
        (analytics.campaigns.by_type[r.opportunity_type] || 0) + 1;
    });

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
