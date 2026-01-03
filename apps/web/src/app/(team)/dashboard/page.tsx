'use client';

/**
 * Claude Team Dashboard - AMU Platform
 *
 * Section 4.7: Claude Team Interface
 *
 * Main dashboard for team members featuring:
 * - Chat with Claude command center
 * - Task Approval Queue
 * - Autonomy Settings
 * - Emergency Controls
 * - Real-Time Activity Feed
 *
 * "Ubuntu - I am because we are"
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  MessageSquare,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Settings,
  Activity,
  Shield,
  ShieldOff,
  Send,
  RefreshCw,
  ChevronRight,
  Headphones,
  Wallet,
  Megaphone,
  Cpu,
  FileCheck,
  Zap,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Edit,
  BarChart3,
  AlertOctagon,
  TrendingUp,
  Target,
  Calendar,
  Play,
  Pause,
  Lightbulb,
  Users,
  DollarSign,
} from 'lucide-react';
import type {
  TeamDashboardData,
  ClaudeTask,
  ClaudeActivity,
  AutonomyRequest,
  AutonomyCategory,
  CategoryAutonomy,
} from '@amu/shared';

// Category icons mapping
const CATEGORY_ICONS: Record<AutonomyCategory, React.ReactNode> = {
  support: <Headphones className="h-4 w-4" />,
  finance: <Wallet className="h-4 w-4" />,
  marketing: <Megaphone className="h-4 w-4" />,
  tech: <Cpu className="h-4 w-4" />,
  compliance: <FileCheck className="h-4 w-4" />,
};

const CATEGORY_NAMES: Record<AutonomyCategory, string> = {
  support: 'Learner Support',
  finance: 'Financial Operations',
  marketing: 'Marketing & Communications',
  tech: 'Technical Operations',
  compliance: 'Compliance & Regulatory',
};

// Marketing recommendation types (simplified for dashboard)
interface MarketingRecommendation {
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

const OPPORTUNITY_TYPE_ICONS: Record<string, React.ReactNode> = {
  industry_growth: <TrendingUp className="h-4 w-4" />,
  course_demand: <Target className="h-4 w-4" />,
  certification_gap: <DollarSign className="h-4 w-4" />,
  corporate_expansion: <Users className="h-4 w-4" />,
  reactivation: <RefreshCw className="h-4 w-4" />,
  default: <Lightbulb className="h-4 w-4" />,
};

export default function TeamDashboardPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const [dashboardData, setDashboardData] = useState<TeamDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Marketing recommendations state
  const [marketingRecommendations, setMarketingRecommendations] = useState<MarketingRecommendation[]>([]);
  const [marketingLoading, setMarketingLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingRecommendation | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboard();
      loadMarketingRecommendations();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/team/dashboard', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Team member access required');
        }
        throw new Error('Failed to load dashboard');
      }

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  // ================================================
  // CHAT FUNCTIONS
  // ================================================

  const handleOpenChat = async () => {
    setChatOpen(true);

    if (!conversationId) {
      try {
        const response = await fetch('/api/team/chat', {
          headers: {
            'Authorization': `Bearer ${await user?.getIdToken()}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setConversationId(result.data.conversation_id);

          // Load existing messages
          const messagesResponse = await fetch(
            `/api/team/chat/${result.data.conversation_id}/messages`,
            {
              headers: {
                'Authorization': `Bearer ${await user?.getIdToken()}`,
              },
            }
          );

          if (messagesResponse.ok) {
            const messagesResult = await messagesResponse.json();
            setChatMessages(
              messagesResult.data.map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load chat:', err);
      }
    }

    // Focus input after opening
    setTimeout(() => chatInputRef.current?.focus(), 100);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const message = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'team_member', content: message }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/team/chat/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setConversationId(result.data.conversation_id);
        setChatMessages((prev) => [
          ...prev,
          { role: 'claude', content: result.data.claude_response.content },
        ]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'claude', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ================================================
  // TASK FUNCTIONS
  // ================================================

  const handleTaskAction = async (
    taskId: string,
    action: 'approved' | 'modified' | 'rejected' | 'escalated'
  ) => {
    setActionLoading(taskId);
    try {
      const response = await fetch(`/api/team/tasks/${taskId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        loadDashboard();
      }
    } catch (err) {
      alert('Failed to respond to task');
    } finally {
      setActionLoading(null);
    }
  };

  // ================================================
  // AUTONOMY FUNCTIONS
  // ================================================

  const handleGrantAutonomy = async (category: AutonomyCategory, taskTypeId: string) => {
    setActionLoading(`grant_${taskTypeId}`);
    try {
      const response = await fetch('/api/team/autonomy/grant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          task_type_id: taskTypeId,
        }),
      });

      if (response.ok) {
        loadDashboard();
      }
    } catch (err) {
      alert('Failed to grant autonomy');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeAutonomy = async (category: AutonomyCategory, taskTypeId: string) => {
    const reason = prompt('Please provide a reason for revoking autonomy:');
    if (!reason) return;

    setActionLoading(`revoke_${taskTypeId}`);
    try {
      const response = await fetch('/api/team/autonomy/revoke', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          task_type_id: taskTypeId,
          reason,
        }),
      });

      if (response.ok) {
        loadDashboard();
      }
    } catch (err) {
      alert('Failed to revoke autonomy');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutonomyRequestResponse = async (
    requestId: string,
    action: 'granted' | 'declined'
  ) => {
    setActionLoading(`request_${requestId}`);
    try {
      const response = await fetch(`/api/team/autonomy/requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        loadDashboard();
      }
    } catch (err) {
      alert('Failed to respond to autonomy request');
    } finally {
      setActionLoading(null);
    }
  };

  // ================================================
  // EMERGENCY FUNCTIONS
  // ================================================

  const handleEmergencyHalt = async () => {
    const confirmed = confirm(
      'EMERGENCY: This will immediately halt ALL autonomous operations.\n\n' +
      'Claude will ask for approval on EVERY action until autonomy is restored.\n\n' +
      'Are you sure you want to proceed?'
    );

    if (!confirmed) return;

    const reason = prompt('Please provide a reason for the emergency halt:');
    if (!reason) return;

    setActionLoading('emergency_halt');
    try {
      const response = await fetch('/api/team/emergency/halt-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('EMERGENCY HALT ACTIVATED\n\nAll autonomous operations have been stopped.');
        loadDashboard();
      }
    } catch (err) {
      alert('Failed to activate emergency halt');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreAutonomy = async () => {
    const confirmed = confirm(
      'This will restore Claude\'s autonomous operations.\n\n' +
      'Claude will resume handling tasks according to granted trust levels.\n\n' +
      'Are you sure you want to proceed?'
    );

    if (!confirmed) return;

    const notes = prompt('Please provide notes for the restoration:');
    if (!notes) return;

    setActionLoading('restore');
    try {
      const response = await fetch('/api/team/emergency/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        alert('Autonomy restored. Claude will resume autonomous operations.');
        loadDashboard();
      }
    } catch (err) {
      alert('Failed to restore autonomy');
    } finally {
      setActionLoading(null);
    }
  };

  // ================================================
  // MARKETING FUNCTIONS
  // ================================================

  const loadMarketingRecommendations = async () => {
    setMarketingLoading(true);
    try {
      const response = await fetch('/api/team/marketing/recommendations', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMarketingRecommendations(result.data || []);
      } else {
        // Use mock data if API not available yet
        setMarketingRecommendations(getMockMarketingRecommendations());
      }
    } catch (err) {
      // Use mock data for development
      setMarketingRecommendations(getMockMarketingRecommendations());
    } finally {
      setMarketingLoading(false);
    }
  };

  const getMockMarketingRecommendations = (): MarketingRecommendation[] => [
    {
      recommendation_id: 'mock_1',
      campaign_name: 'Mining & Resources Excellence Series',
      opportunity_type: 'industry_growth',
      campaign_summary: 'This 14-day campaign targets Mining & Resources (342 potential learners) based on 23.5% growth in the sector.',
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
      recommendation_id: 'mock_2',
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
      recommendation_id: 'mock_3',
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

  const handleCampaignAction = async (
    recommendationId: string,
    action: 'approve' | 'reject' | 'start' | 'pause'
  ) => {
    setActionLoading(`campaign_${recommendationId}`);
    try {
      const response = await fetch(`/api/team/marketing/recommendations/${recommendationId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setMarketingRecommendations((prev) =>
          prev.map((rec) =>
            rec.recommendation_id === recommendationId
              ? {
                  ...rec,
                  status:
                    action === 'approve' ? 'approved' :
                    action === 'reject' ? 'rejected' :
                    action === 'start' ? 'in_progress' :
                    'approved',
                }
              : rec
          )
        );
        setSelectedCampaign(null);
      } else {
        // For development, still update local state
        setMarketingRecommendations((prev) =>
          prev.map((rec) =>
            rec.recommendation_id === recommendationId
              ? {
                  ...rec,
                  status:
                    action === 'approve' ? 'approved' :
                    action === 'reject' ? 'rejected' :
                    action === 'start' ? 'in_progress' :
                    'approved',
                }
              : rec
          )
        );
        setSelectedCampaign(null);
      }
    } catch (err) {
      alert('Failed to update campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeColor = (status: MarketingRecommendation['status']) => {
    switch (status) {
      case 'pending_review':
        return 'bg-amber-100 text-amber-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // ================================================
  // RENDER HELPERS
  // ================================================

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-amber-100 text-amber-700';
      case 'normal':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // ================================================
  // LOADING / ERROR STATES
  // ================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amu-navy border-t-transparent" />
          <p className="text-amu-slate">Loading team dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-amu-navy">Access Denied</h2>
            <p className="mb-4 text-amu-slate">{error}</p>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  // ================================================
  // MAIN RENDER
  // ================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amu-navy">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-normal text-amu-navy">
                Claude Team Dashboard
              </h1>
              <p className="text-sm text-amu-slate">
                Welcome, {dashboardData.team_member.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {dashboardData.emergency.global_autonomy_halted && (
              <Alert variant="destructive" className="flex items-center gap-2 px-4 py-2">
                <AlertOctagon className="h-4 w-4" />
                <span className="font-medium">EMERGENCY HALT ACTIVE</span>
              </Alert>
            )}
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Chat with Claude Button */}
        <Card
          className="mb-6 cursor-pointer border-2 border-amu-navy/20 bg-gradient-to-r from-amu-navy/5 to-transparent p-6 transition-all hover:border-amu-navy/40"
          onClick={handleOpenChat}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amu-navy">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-amu-navy">
                  Chat with Claude
                </h2>
                <p className="text-amu-slate">
                  Ask questions, get reports, discuss strategy, or give feedback
                </p>
              </div>
            </div>
            <Button size="lg">
              <MessageSquare className="mr-2 h-5 w-5" />
              Open Chat
            </Button>
          </div>
        </Card>

        {/* Chat Modal */}
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="flex h-[80vh] w-full max-w-2xl flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                  <MessageSquare className="h-5 w-5" />
                  Chat with Claude
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {chatMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-amu-slate">
                    <div>
                      <MessageSquare className="mx-auto mb-4 h-12 w-12 text-amu-slate/50" />
                      <p>Start a conversation with Claude.</p>
                      <p className="mt-2 text-sm">
                        Ask about operations, request reports, or discuss strategy.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'team_member' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === 'team_member'
                              ? 'bg-amu-navy text-white'
                              : 'bg-gray-100 text-amu-charcoal'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-lg bg-gray-100 px-4 py-2">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }} />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message to Claude..."
                    className="flex-1 resize-none rounded-lg border border-gray-300 p-3 focus:border-amu-navy focus:outline-none focus:ring-1 focus:ring-amu-navy"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || chatLoading}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Tasks & Activity */}
          <div className="space-y-6 lg:col-span-2">
            {/* Awaiting Your Input */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                  <Bell className="h-5 w-5 text-amber-500" />
                  Awaiting Your Input
                  {dashboardData.task_queue.summary.total_awaiting > 0 && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-700">
                      {dashboardData.task_queue.summary.total_awaiting}
                    </span>
                  )}
                </h2>
                {dashboardData.task_queue.summary.urgent_count > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-medium text-red-700">
                    {dashboardData.task_queue.summary.urgent_count} urgent
                  </span>
                )}
              </div>

              {dashboardData.task_queue.awaiting_tasks.length === 0 ? (
                <div className="py-8 text-center text-amu-slate">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  <p>No tasks awaiting your input. Claude is handling things!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.task_queue.awaiting_tasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-amu-slate">
                            {CATEGORY_ICONS[task.category]}
                            {CATEGORY_NAMES[task.category]}
                          </span>
                        </div>
                        <span className="text-xs text-amu-slate">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {formatTimeAgo(task.created_at)}
                        </span>
                      </div>

                      <h3 className="mb-1 font-medium text-amu-navy">{task.title}</h3>
                      <p className="mb-3 text-sm text-amu-slate">{task.description}</p>

                      <div className="mb-3 rounded bg-gray-50 p-3">
                        <p className="mb-1 text-xs font-medium text-amu-charcoal">
                          Claude recommends:
                        </p>
                        <p className="text-sm text-amu-slate">{task.recommendation}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleTaskAction(task.task_id, 'approved')}
                          disabled={actionLoading === task.task_id}
                        >
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskAction(task.task_id, 'modified')}
                          disabled={actionLoading === task.task_id}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Modify
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTaskAction(task.task_id, 'rejected')}
                          disabled={actionLoading === task.task_id}
                        >
                          <ThumbsDown className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recently Handled Automatically */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recently Handled Automatically
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-sm font-medium text-green-700">
                    {dashboardData.activity.summary.autonomous_actions} today
                  </span>
                </h2>
                <Button variant="ghost" size="sm">
                  <Eye className="mr-1 h-4 w-4" />
                  View All
                </Button>
              </div>

              {dashboardData.activity.recent.filter((a) => a.was_autonomous).length === 0 ? (
                <p className="py-4 text-center text-amu-slate">
                  No autonomous actions yet today.
                </p>
              ) : (
                <div className="space-y-2">
                  {dashboardData.activity.recent
                    .filter((a) => a.was_autonomous)
                    .slice(0, 5)
                    .map((activity) => (
                      <div
                        key={activity.activity_id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-amu-charcoal">
                              {activity.title}
                            </p>
                            <p className="text-xs text-amu-slate">
                              {activity.category && CATEGORY_NAMES[activity.category]}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-amu-slate">
                          {formatTimeAgo(activity.occurred_at)}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Activity Summary by Category */}
              <div className="mt-4 grid grid-cols-5 gap-2 border-t pt-4">
                {(Object.keys(CATEGORY_NAMES) as AutonomyCategory[]).map((cat) => (
                  <div key={cat} className="text-center">
                    <div className="mb-1 flex justify-center text-amu-slate">
                      {CATEGORY_ICONS[cat]}
                    </div>
                    <p className="text-lg font-bold text-amu-navy">
                      {dashboardData.activity.summary.by_category[cat]?.autonomous || 0}
                    </p>
                    <p className="text-xs text-amu-slate">{cat}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Marketing Recommendations Section */}
            <Card className="border-2 border-teal-200 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                  <Megaphone className="h-5 w-5 text-teal-500" />
                  Marketing Recommendations
                  {marketingRecommendations.filter(r => r.status === 'pending_review').length > 0 && (
                    <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-sm font-medium text-teal-700">
                      {marketingRecommendations.filter(r => r.status === 'pending_review').length} new
                    </span>
                  )}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMarketingRecommendations}
                  disabled={marketingLoading}
                >
                  <RefreshCw className={`mr-1 h-4 w-4 ${marketingLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <p className="mb-4 text-sm text-amu-slate">
                Claude has analysed learner demographics and engagement patterns to identify these marketing opportunities.
              </p>

              {marketingLoading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  <p className="text-sm text-amu-slate">Analysing opportunities...</p>
                </div>
              ) : marketingRecommendations.length === 0 ? (
                <div className="py-8 text-center text-amu-slate">
                  <Lightbulb className="mx-auto mb-2 h-8 w-8 text-teal-300" />
                  <p>No marketing recommendations at this time.</p>
                  <p className="mt-1 text-sm">Claude will identify opportunities as data grows.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {marketingRecommendations.map((campaign) => (
                    <div
                      key={campaign.recommendation_id}
                      className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-teal-300 hover:shadow-sm"
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs text-teal-700">
                            {OPPORTUNITY_TYPE_ICONS[campaign.opportunity_type] || OPPORTUNITY_TYPE_ICONS.default}
                            {campaign.opportunity_type.replace('_', ' ')}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeColor(campaign.status)}`}>
                            {campaign.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-amu-slate">
                          {campaign.confidence_score}% confidence
                        </span>
                      </div>

                      <h3 className="mb-1 font-medium text-amu-navy">{campaign.campaign_name}</h3>
                      <p className="mb-2 text-sm text-amu-slate line-clamp-2">{campaign.campaign_summary}</p>

                      <div className="flex items-center gap-4 text-xs text-amu-slate">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.segment_size} learners
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {campaign.duration_days} days
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {campaign.budget === 0 ? 'Organic' : `R${campaign.budget.toLocaleString()}`}
                        </span>
                      </div>

                      {campaign.status === 'pending_review' && (
                        <div className="mt-3 flex items-center gap-2 border-t pt-3">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCampaignAction(campaign.recommendation_id, 'approve');
                            }}
                            disabled={actionLoading === `campaign_${campaign.recommendation_id}`}
                          >
                            <ThumbsUp className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCampaign(campaign);
                            }}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCampaignAction(campaign.recommendation_id, 'reject');
                            }}
                            disabled={actionLoading === `campaign_${campaign.recommendation_id}`}
                          >
                            <ThumbsDown className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {campaign.status === 'approved' && (
                        <div className="mt-3 flex items-center gap-2 border-t pt-3">
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCampaignAction(campaign.recommendation_id, 'start');
                            }}
                            disabled={actionLoading === `campaign_${campaign.recommendation_id}`}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Start Campaign
                          </Button>
                        </div>
                      )}

                      {campaign.status === 'in_progress' && (
                        <div className="mt-3 flex items-center gap-2 border-t pt-3">
                          <span className="flex items-center gap-1 text-xs text-blue-600">
                            <Activity className="h-3 w-3 animate-pulse" />
                            Campaign running
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCampaignAction(campaign.recommendation_id, 'pause');
                            }}
                            disabled={actionLoading === `campaign_${campaign.recommendation_id}`}
                          >
                            <Pause className="mr-1 h-4 w-4" />
                            Pause
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Link to Autonomy */}
              <div className="mt-4 rounded-lg bg-teal-50 p-3">
                <p className="text-xs text-teal-700">
                  <strong>Category 3: Marketing & Communications</strong> - As Claude successfully executes approved campaigns,
                  trust will build toward autonomous posting. Currently: <strong>Ask First</strong>
                </p>
              </div>
            </Card>

            {/* Campaign Detail Modal */}
            {selectedCampaign && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                  <div className="flex items-center justify-between border-b p-4">
                    <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                      <Megaphone className="h-5 w-5 text-teal-500" />
                      Campaign Details
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(null)}>
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeColor(selectedCampaign.status)}`}>
                        {selectedCampaign.status.replace('_', ' ')}
                      </span>
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-xs text-teal-700">
                        {selectedCampaign.confidence_score}% confidence
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-amu-navy">{selectedCampaign.campaign_name}</h3>
                    <p className="mb-4 text-amu-slate">{selectedCampaign.campaign_summary}</p>

                    {/* Target Audience */}
                    <div className="mb-4 rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-medium text-amu-charcoal">Target Audience</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-amu-navy">{selectedCampaign.segment_size}</p>
                          <p className="text-xs text-amu-slate">Potential Learners</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-amu-navy">{selectedCampaign.duration_days}</p>
                          <p className="text-xs text-amu-slate">Day Campaign</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-amu-navy">
                            {selectedCampaign.budget === 0 ? 'R0' : `R${selectedCampaign.budget.toLocaleString()}`}
                          </p>
                          <p className="text-xs text-amu-slate">{selectedCampaign.budget === 0 ? 'Organic' : 'Budget'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Channels */}
                    <div className="mb-4">
                      <h4 className="mb-2 font-medium text-amu-charcoal">Channels</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCampaign.channels.map((channel) => (
                          <span key={channel} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            {channel.charAt(0).toUpperCase() + channel.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Messaging */}
                    {selectedCampaign.messaging && (
                      <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50/50 p-4">
                        <h4 className="mb-2 font-medium text-teal-800">Proposed Messaging</h4>
                        <p className="mb-1 text-lg font-semibold text-amu-navy">{selectedCampaign.messaging.headline}</p>
                        <p className="mb-2 text-sm text-amu-slate">{selectedCampaign.messaging.key_message}</p>
                        <p className="inline-block rounded bg-teal-600 px-3 py-1 text-sm font-medium text-white">
                          {selectedCampaign.messaging.call_to_action}
                        </p>
                      </div>
                    )}

                    {/* Success Metrics */}
                    {selectedCampaign.success_metrics && selectedCampaign.success_metrics.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 font-medium text-amu-charcoal">Success Metrics</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedCampaign.success_metrics.map((metric, i) => (
                            <div key={i} className="rounded bg-gray-50 p-3">
                              <p className="text-xs text-amu-slate">{metric.metric_name}</p>
                              <p className="text-lg font-bold text-amu-navy">
                                {metric.target_value} {metric.unit}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t pt-4">
                      {selectedCampaign.status === 'pending_review' && (
                        <>
                          <Button
                            onClick={() => handleCampaignAction(selectedCampaign.recommendation_id, 'approve')}
                            disabled={actionLoading === `campaign_${selectedCampaign.recommendation_id}`}
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Approve Campaign
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCampaignAction(selectedCampaign.recommendation_id, 'reject')}
                            disabled={actionLoading === `campaign_${selectedCampaign.recommendation_id}`}
                          >
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      {selectedCampaign.status === 'approved' && (
                        <Button
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => handleCampaignAction(selectedCampaign.recommendation_id, 'start')}
                          disabled={actionLoading === `campaign_${selectedCampaign.recommendation_id}`}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Campaign Now
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => setSelectedCampaign(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Right Column - Autonomy & Emergency */}
          <div className="space-y-6">
            {/* Autonomy Requests */}
            {dashboardData.autonomy.pending_requests.length > 0 && (
              <Card className="border-2 border-purple-200 p-6">
                <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                  <Zap className="h-5 w-5 text-purple-500" />
                  Autonomy Requests
                  <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-sm font-medium text-purple-700">
                    {dashboardData.autonomy.pending_requests.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {dashboardData.autonomy.pending_requests.map((request) => (
                    <div
                      key={request.request_id}
                      className="rounded-lg border border-purple-100 bg-purple-50/50 p-3"
                    >
                      <p className="mb-1 text-sm font-medium text-amu-navy">
                        {request.task_type_name}
                      </p>
                      <p className="mb-2 text-xs text-amu-slate">
                        Pattern: {request.success_count} approved, {request.approval_rate}% approval rate
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAutonomyRequestResponse(request.request_id, 'granted')}
                          disabled={actionLoading === `request_${request.request_id}`}
                        >
                          Grant Autonomy
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAutonomyRequestResponse(request.request_id, 'declined')}
                          disabled={actionLoading === `request_${request.request_id}`}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* My Autonomy Settings */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <Settings className="h-5 w-5" />
                My Autonomy Settings
              </h2>

              <div className="space-y-4">
                {dashboardData.autonomy.registry.categories.map((cat) => (
                  <div key={cat.category} className="rounded-lg border border-gray-200 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      {CATEGORY_ICONS[cat.category]}
                      <span className="font-medium text-amu-navy">
                        {CATEGORY_NAMES[cat.category]}
                      </span>
                      <span className="ml-auto text-xs text-amu-slate">
                        {cat.overall_autonomous_percentage}% autonomous
                      </span>
                    </div>

                    <div className="space-y-1">
                      {cat.task_types.map((tt) => (
                        <div
                          key={tt.task_type_id}
                          className="flex items-center justify-between rounded bg-gray-50 px-2 py-1"
                        >
                          <span className="text-sm text-amu-charcoal">{tt.name}</span>
                          <div className="flex items-center gap-2">
                            {tt.status === 'autonomous' ? (
                              <>
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  Auto
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleRevokeAutonomy(cat.category, tt.task_type_id)}
                                  disabled={actionLoading === `revoke_${tt.task_type_id}`}
                                >
                                  Revoke
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center gap-1 text-xs text-amu-slate">
                                  <Clock className="h-3 w-3" />
                                  Ask
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleGrantAutonomy(cat.category, tt.task_type_id)}
                                  disabled={actionLoading === `grant_${tt.task_type_id}`}
                                >
                                  Grant
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Emergency Controls */}
            <Card className="border-2 border-red-200 p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-red-700">
                <Shield className="h-5 w-5" />
                Emergency Controls
              </h2>

              <p className="mb-4 text-sm text-amu-slate">
                Any team member can halt Claude's autonomous operations at any time.
              </p>

              {dashboardData.emergency.global_autonomy_halted ? (
                <div className="space-y-3">
                  <Alert variant="destructive" className="mb-4">
                    <AlertOctagon className="h-4 w-4" />
                    <span className="ml-2">All autonomy is currently halted</span>
                  </Alert>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleRestoreAutonomy}
                    disabled={actionLoading === 'restore'}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Restore Autonomy
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleEmergencyHalt}
                  disabled={actionLoading === 'emergency_halt'}
                >
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Emergency Halt All Autonomy
                </Button>
              )}

              {dashboardData.emergency.active_emergencies.length > 0 && (
                <div className="mt-4 rounded-lg bg-red-50 p-3">
                  <p className="mb-2 text-sm font-medium text-red-700">Active Emergencies:</p>
                  {dashboardData.emergency.active_emergencies.map((e) => (
                    <p key={e.action_id} className="text-xs text-red-600">
                      {e.title} - {formatTimeAgo(e.initiated_at)}
                    </p>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-amu-navy">
                <BarChart3 className="h-5 w-5" />
                Quick Stats
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {dashboardData.activity.summary.total_activities}
                  </p>
                  <p className="text-xs text-blue-600">Actions Today</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {dashboardData.activity.summary.autonomous_actions}
                  </p>
                  <p className="text-xs text-green-600">Autonomous</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3 text-center">
                  <p className="text-2xl font-bold text-purple-700">
                    {dashboardData.activity.summary.time_saved_minutes}
                  </p>
                  <p className="text-xs text-purple-600">Minutes Saved</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">
                    {dashboardData.system_health.active_learners_today}
                  </p>
                  <p className="text-xs text-amber-600">Active Learners</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gray-50 p-3">
                <div className={`h-2 w-2 rounded-full ${
                  dashboardData.system_health.status === 'healthy'
                    ? 'bg-green-500'
                    : dashboardData.system_health.status === 'degraded'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`} />
                <span className="text-sm text-amu-charcoal">
                  System: {dashboardData.system_health.status}
                </span>
                <span className="text-xs text-amu-slate">
                  ({dashboardData.system_health.uptime_percentage}% uptime)
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
