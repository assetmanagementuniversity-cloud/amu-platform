'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LOGO_WITH_SLOGAN_INVERTED, LOGO_ONLY } from '@/lib/brand-assets';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
} from 'lucide-react';

// =============================================================================
// TYPES (matching AI package types)
// =============================================================================

interface LearnerPersona {
  id: string;
  name: string;
  background: string;
  demographics: {
    occupation: string;
    industry: string;
  };
  characteristics: {
    confidence_level: 'low' | 'medium' | 'high';
    prior_knowledge: 'none' | 'basic' | 'intermediate' | 'advanced';
  };
}

interface SimulationMessage {
  role: 'learner' | 'facilitator' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    confusion_detected?: boolean;
    frustration_detected?: boolean;
    success_detected?: boolean;
    stuck_detected?: boolean;
  };
}

interface ContentIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  turn_number: number;
  suggested_fix?: string;
}

interface SimulationResult {
  simulation_id: string;
  persona_id: string;
  persona_name: string;
  module_id: string;
  module_title: string;
  started_at: string;
  completed_at: string;
  total_turns: number;
  messages: SimulationMessage[];
  metrics: {
    confusion_events: number;
    frustration_events: number;
    success_events: number;
    stuck_events: number;
    questions_asked: number;
    completion_achieved: boolean;
  };
  issues: ContentIssue[];
  recommendations: string[];
}

// =============================================================================
// MOCK DATA (for demo when API not available)
// =============================================================================

const mockPersonas: LearnerPersona[] = [
  {
    id: 'nomvula',
    name: 'Nomvula Dlamini',
    background: 'Practical asset maintenance technician',
    demographics: { occupation: 'Senior Maintenance Technician', industry: 'Water and Sanitation' },
    characteristics: { confidence_level: 'medium', prior_knowledge: 'basic' },
  },
  {
    id: 'james',
    name: 'James van der Merwe',
    background: 'Engineering graduate seeking career advancement',
    demographics: { occupation: 'Reliability Engineer', industry: 'Mining' },
    characteristics: { confidence_level: 'high', prior_knowledge: 'intermediate' },
  },
  {
    id: 'fatima',
    name: 'Fatima Mahomed',
    background: 'Business owner seeking asset management understanding',
    demographics: { occupation: 'Business Owner', industry: 'Transport and Logistics' },
    characteristics: { confidence_level: 'high', prior_knowledge: 'basic' },
  },
  {
    id: 'sipho',
    name: 'Sipho Mthembu',
    background: 'Requires encouragement and support',
    demographics: { occupation: 'Facilities Manager', industry: 'Manufacturing' },
    characteristics: { confidence_level: 'low', prior_knowledge: 'basic' },
  },
  {
    id: 'priya',
    name: 'Priya Naidoo',
    background: 'International consultant seeking SA context',
    demographics: { occupation: 'Senior Consultant', industry: 'Consulting' },
    characteristics: { confidence_level: 'high', prior_knowledge: 'advanced' },
  },
  {
    id: 'mandla',
    name: 'Mandla Zwane',
    background: 'Rural learner with connectivity challenges',
    demographics: { occupation: 'Equipment Technician', industry: 'Agriculture' },
    characteristics: { confidence_level: 'medium', prior_knowledge: 'basic' },
  },
];

// =============================================================================
// PERSONA CARD
// =============================================================================

interface PersonaCardProps {
  persona: LearnerPersona;
  result?: SimulationResult;
  onRun: (personaId: string) => void;
  isRunning: boolean;
}

function PersonaCard({ persona, result, onRun, isRunning }: PersonaCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const calculateScore = (r: SimulationResult) => {
    const successRate = r.metrics.success_events / Math.max(r.total_turns, 1);
    const confusionPenalty = (r.metrics.confusion_events * 10) / Math.max(r.total_turns, 1);
    const frustrationPenalty = (r.metrics.frustration_events * 15) / Math.max(r.total_turns, 1);
    const completionBonus = r.metrics.completion_achieved ? 20 : 0;
    return Math.round(
      Math.max(0, Math.min(100, 50 + successRate * 30 + completionBonus - confusionPenalty - frustrationPenalty))
    );
  };

  const score = result ? calculateScore(result) : null;

  return (
    <div className="rounded-lg border border-amu-slate/30 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amu-navy text-white">
              <span className="font-heading text-sm">{persona.name[0]}</span>
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-amu-navy">
                {persona.name}
              </h3>
              <p className="font-body text-xs text-amu-charcoal">
                {persona.demographics.occupation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {score !== null && (
              <span
                className={cn(
                  'rounded-full px-3 py-1 font-heading text-sm font-semibold',
                  getScoreColor(score)
                )}
              >
                {score}%
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRun(persona.id)}
              disabled={isRunning}
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Persona details */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-amu-sky/50 px-2 py-0.5 text-xs text-amu-charcoal">
            {persona.characteristics.confidence_level} confidence
          </span>
          <span className="rounded-full bg-amu-sky/50 px-2 py-0.5 text-xs text-amu-charcoal">
            {persona.characteristics.prior_knowledge} knowledge
          </span>
          <span className="rounded-full bg-amu-sky/50 px-2 py-0.5 text-xs text-amu-charcoal">
            {persona.demographics.industry}
          </span>
        </div>

        {/* Results summary */}
        {result && (
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <div className="rounded bg-emerald-50 p-2">
              <div className="font-heading text-lg font-bold text-emerald-600">
                {result.metrics.success_events}
              </div>
              <div className="font-body text-xs text-emerald-700">Success</div>
            </div>
            <div className="rounded bg-amber-50 p-2">
              <div className="font-heading text-lg font-bold text-amber-600">
                {result.metrics.confusion_events}
              </div>
              <div className="font-body text-xs text-amber-700">Confused</div>
            </div>
            <div className="rounded bg-red-50 p-2">
              <div className="font-heading text-lg font-bold text-red-600">
                {result.metrics.frustration_events}
              </div>
              <div className="font-body text-xs text-red-700">Frustrated</div>
            </div>
            <div className="rounded bg-gray-50 p-2">
              <div className="font-heading text-lg font-bold text-gray-600">
                {result.total_turns}
              </div>
              <div className="font-body text-xs text-gray-700">Turns</div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable conversation */}
      {result && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full border-t border-amu-slate/20 bg-amu-sky/20 px-4 py-2 text-left font-body text-sm text-amu-charcoal hover:bg-amu-sky/40"
          >
            <div className="flex items-center justify-between">
              <span>View conversation ({result.messages.length} messages)</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {expanded && (
            <div className="max-h-96 overflow-y-auto border-t border-amu-slate/20 p-4">
              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 font-heading text-xs font-semibold uppercase text-amu-navy">
                    Issues Detected
                  </h4>
                  <div className="space-y-2">
                    {result.issues.map((issue, i) => (
                      <div
                        key={i}
                        className={cn(
                          'rounded-md p-2 text-xs',
                          issue.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : issue.severity === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : issue.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        )}
                      >
                        <div className="font-semibold">
                          [{issue.severity.toUpperCase()}] {issue.type}
                        </div>
                        <div>{issue.description}</div>
                        {issue.suggested_fix && (
                          <div className="mt-1 italic">Fix: {issue.suggested_fix}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-3">
                {result.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-lg p-3',
                      msg.role === 'learner'
                        ? 'ml-4 bg-amu-sky'
                        : msg.role === 'facilitator'
                        ? 'mr-4 bg-white border border-amu-slate/20'
                        : 'bg-gray-100 text-center text-xs italic'
                    )}
                  >
                    {msg.role !== 'system' && (
                      <div className="mb-1 font-heading text-xs font-semibold text-amu-navy">
                        {msg.role === 'learner' ? persona.name : 'Facilitator'}
                      </div>
                    )}
                    <p className="font-body text-sm text-amu-charcoal">{msg.content}</p>
                    {msg.metadata && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.metadata.confusion_detected && (
                          <span className="rounded bg-amber-100 px-1 py-0.5 text-xs text-amber-700">
                            confused
                          </span>
                        )}
                        {msg.metadata.frustration_detected && (
                          <span className="rounded bg-red-100 px-1 py-0.5 text-xs text-red-700">
                            frustrated
                          </span>
                        )}
                        {msg.metadata.success_detected && (
                          <span className="rounded bg-emerald-100 px-1 py-0.5 text-xs text-emerald-700">
                            success
                          </span>
                        )}
                        {msg.metadata.stuck_detected && (
                          <span className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-700">
                            stuck
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ContentTestingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [selectedModule, setSelectedModule] = React.useState('gfmam-311');
  const [results, setResults] = React.useState<Record<string, SimulationResult>>({});
  const [runningPersona, setRunningPersona] = React.useState<string | null>(null);
  const [runningAll, setRunningAll] = React.useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/content-testing');
    }
  }, [user, authLoading, router]);

  // Mock modules for testing
  const modules = [
    { id: 'gfmam-311', title: 'Foundations of Asset Management' },
    { id: 'gfmam-312', title: 'Asset Management Strategy and Planning' },
    { id: 'gfmam-313', title: 'Lifecycle Delivery and Maintenance' },
  ];

  // Run simulation for a persona
  const runSimulation = async (personaId: string) => {
    setRunningPersona(personaId);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock result
    const mockResult: SimulationResult = {
      simulation_id: `sim_${Date.now()}_${personaId}`,
      persona_id: personaId,
      persona_name: mockPersonas.find((p) => p.id === personaId)?.name || '',
      module_id: selectedModule,
      module_title: modules.find((m) => m.id === selectedModule)?.title || '',
      started_at: new Date(Date.now() - 120000).toISOString(),
      completed_at: new Date().toISOString(),
      total_turns: Math.floor(Math.random() * 5) + 5,
      messages: [
        {
          role: 'facilitator',
          content:
            'Welcome to this module on asset management. I am here to guide you through the fundamentals. What aspects are you most interested in exploring?',
          timestamp: new Date(Date.now() - 100000).toISOString(),
        },
        {
          role: 'learner',
          content:
            personaId === 'sipho'
              ? 'I am not sure if I understand what asset management really means. Maybe I should just read the materials again...'
              : 'I am interested in understanding how asset management applies to my work context.',
          timestamp: new Date(Date.now() - 90000).toISOString(),
          metadata: {
            confusion_detected: personaId === 'sipho',
            success_detected: personaId !== 'sipho',
          },
        },
        {
          role: 'facilitator',
          content:
            'That is a great starting point! Asset management is about making informed decisions about assets throughout their lifecycle. Can you tell me about the types of assets you work with?',
          timestamp: new Date(Date.now() - 80000).toISOString(),
        },
        {
          role: 'learner',
          content:
            personaId === 'fatima'
              ? 'What is the bottom line here? How does this affect my costs?'
              : personaId === 'james'
              ? 'According to ISO 55001, asset management should align with organizational objectives. How does this framework address that?'
              : 'In my work, I deal with pumps and valves. How does this connect to those?',
          timestamp: new Date(Date.now() - 70000).toISOString(),
          metadata: {
            success_detected: true,
            frustration_detected: personaId === 'fatima',
          },
        },
      ],
      metrics: {
        confusion_events: personaId === 'sipho' ? 2 : Math.floor(Math.random() * 2),
        frustration_events: personaId === 'fatima' ? 1 : Math.floor(Math.random() * 2),
        success_events: Math.floor(Math.random() * 3) + 2,
        stuck_events: 0,
        questions_asked: Math.floor(Math.random() * 3) + 1,
        completion_achieved: Math.random() > 0.3,
      },
      issues:
        personaId === 'sipho'
          ? [
              {
                severity: 'medium',
                type: 'accessibility',
                description: 'Content may be too academic for learners with lower confidence',
                turn_number: 2,
                suggested_fix: 'Add more scaffolding and validation for uncertain learners',
              },
            ]
          : personaId === 'fatima'
          ? [
              {
                severity: 'low',
                type: 'frustration',
                description: 'Business-oriented learners need ROI focus earlier',
                turn_number: 4,
                suggested_fix: 'Lead with business impact before theoretical concepts',
              },
            ]
          : [],
      recommendations:
        personaId === 'sipho'
          ? ['Add more encouragement phrases', 'Break concepts into smaller steps']
          : [],
    };

    setResults((prev) => ({ ...prev, [personaId]: mockResult }));
    setRunningPersona(null);
  };

  // Run all simulations
  const runAllSimulations = async () => {
    setRunningAll(true);
    for (const persona of mockPersonas) {
      await runSimulation(persona.id);
    }
    setRunningAll(false);
  };

  // Calculate overall stats
  const overallStats = React.useMemo(() => {
    const resultList = Object.values(results);
    if (resultList.length === 0) {
      return { avgScore: 0, totalIssues: 0, completionRate: 0 };
    }

    const scores = resultList.map((r) => {
      const successRate = r.metrics.success_events / Math.max(r.total_turns, 1);
      const confusionPenalty = (r.metrics.confusion_events * 10) / Math.max(r.total_turns, 1);
      const completionBonus = r.metrics.completion_achieved ? 20 : 0;
      return Math.max(0, Math.min(100, 50 + successRate * 30 + completionBonus - confusionPenalty));
    });

    return {
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      totalIssues: resultList.reduce((acc, r) => acc + r.issues.length, 0),
      completionRate: Math.round(
        (resultList.filter((r) => r.metrics.completion_achieved).length / resultList.length) * 100
      ),
    };
  }, [results]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Image
            src={LOGO_ONLY}
            alt="AMU"
            width={40}
            height={40}
            className="mx-auto h-10 w-10 animate-pulse"
          />
          <p className="mt-4 font-body text-sm text-amu-charcoal">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="bg-amu-navy">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Image
              src={LOGO_WITH_SLOGAN_INVERTED}
              alt="AMU"
              width={200}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="rounded bg-amber-500 px-2 py-1 font-heading text-xs font-semibold text-white">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-white/90">{user.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-amu-sky/20 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-amu-navy md:text-3xl">
              AI-as-Learner Content Testing
            </h1>
            <p className="mt-2 font-body text-base text-amu-charcoal">
              Test content quality by simulating diverse learner personas
            </p>
          </header>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="font-heading text-xs font-medium text-amu-charcoal">
                  Module
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="mt-1 block rounded-md border border-amu-slate bg-white px-3 py-2 font-body text-sm"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={runAllSimulations}
                disabled={runningAll || runningPersona !== null}
              >
                {runningAll ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run All Personas
                  </>
                )}
              </Button>
              <Button variant="outline" disabled={Object.keys(results).length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Overall Stats */}
          {Object.keys(results).length > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-amu-slate/30 bg-white p-4 text-center">
                <div
                  className={cn(
                    'font-heading text-3xl font-bold',
                    overallStats.avgScore >= 80
                      ? 'text-emerald-600'
                      : overallStats.avgScore >= 60
                      ? 'text-amber-600'
                      : 'text-red-600'
                  )}
                >
                  {overallStats.avgScore}%
                </div>
                <div className="font-body text-sm text-amu-charcoal">Average Score</div>
              </div>
              <div className="rounded-lg border border-amu-slate/30 bg-white p-4 text-center">
                <div className="font-heading text-3xl font-bold text-amu-navy">
                  {overallStats.totalIssues}
                </div>
                <div className="font-body text-sm text-amu-charcoal">Issues Found</div>
              </div>
              <div className="rounded-lg border border-amu-slate/30 bg-white p-4 text-center">
                <div className="font-heading text-3xl font-bold text-amu-navy">
                  {overallStats.completionRate}%
                </div>
                <div className="font-body text-sm text-amu-charcoal">Completion Rate</div>
              </div>
            </div>
          )}

          {/* Persona Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mockPersonas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                result={results[persona.id]}
                onRun={runSimulation}
                isRunning={runningPersona === persona.id || runningAll}
              />
            ))}
          </div>
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
