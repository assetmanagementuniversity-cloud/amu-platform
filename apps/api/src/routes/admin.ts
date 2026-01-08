/**
 * Admin API Routes - AMU Platform
 *
 * Administrative endpoints for seeding data and managing the platform.
 * These endpoints should be protected in production.
 */

import { Router } from 'express';
import { getFirestore } from '@amu/database';

const router = Router();

// =============================================================================
// SEED DATA
// =============================================================================

const GFMAM_COURSE = {
  course_id: 'gfmam-311',
  course_title: 'GFMAM 311: Organisational Context',
  course_description: 'Understanding how asset management fits within organisational strategy, stakeholders, and governance structures. This foundational module explores the GFMAM standards through a lens of lifecycle thinking.',
  course_type: 'gfmam',
  course_level: 'foundation',
  course_nqf_level: 5,
  course_credits: 8,
  course_notional_hours: 80,
  course_module_ids: ['311-organisational-context'],
  course_prerequisite_course_ids: [],
  course_certificate_price: 500,
  course_estimated_facilitation_hours: 8,
  course_learning_outcomes: [
    'Explain the role of asset management within an organisation\'s strategic context',
    'Identify key stakeholders and their interests in asset management decisions',
    'Describe the governance framework for asset management',
    'Apply organisational context analysis to a workplace scenario',
  ],
  course_competency_framework: 'GFMAM Asset Management Landscape',
  course_published: true,
  course_version: '1.0.0',
  course_last_updated_date: new Date().toISOString(),
  course_created_date: new Date().toISOString(),
};

const GFMAM_311_MODULE = {
  module_id: '311-organisational-context',
  module_course_id: 'gfmam-311',
  module_title: 'Organisational Context',
  module_description: 'Understanding how asset management fits within organisational strategy, stakeholders, and governance structures.',
  module_order: 1,
  module_learning_objectives: [
    'Explain the importance of organisational context in asset management',
    'Identify internal and external factors affecting asset management decisions',
    'Analyse stakeholder needs and expectations',
    'Apply context analysis to asset management planning',
    'Evaluate organisational constraints and opportunities',
  ],
  module_case_study_id: 'mzansi-mining',
  module_competencies: [
    {
      competency_id: 'COMP-311-01',
      competency_title: 'Strategic Context Understanding',
      competency_description: 'Demonstrate understanding of how asset management aligns with and supports organisational strategy and objectives.',
      competency_evidence_criteria: [
        'Can articulate the organisation\'s mission, vision, and strategic objectives related to assets',
        'Can explain how asset management decisions impact strategic outcomes',
        'Can identify gaps between current asset management practices and strategic requirements',
        'Can propose strategic improvements to asset management approach',
      ],
      competency_assessment_type: 'conversation',
    },
    {
      competency_id: 'COMP-311-02',
      competency_title: 'Stakeholder Management',
      competency_description: 'Identify, analyse, and effectively engage with stakeholders who have interests in asset management decisions.',
      competency_evidence_criteria: [
        'Can identify all relevant internal and external stakeholders',
        'Can describe each stakeholder\'s interests, influence, and expectations',
        'Can prioritise stakeholder engagement based on influence and interest',
        'Can develop stakeholder communication and engagement strategies',
      ],
      competency_assessment_type: 'conversation',
    },
    {
      competency_id: 'COMP-311-03',
      competency_title: 'Governance Framework Application',
      competency_description: 'Understand and apply appropriate governance frameworks to asset management within an organisation.',
      competency_evidence_criteria: [
        'Can describe the key elements of ISO 55001 governance requirements',
        'Can identify roles and responsibilities in asset management governance',
        'Can assess current governance practices against best practice frameworks',
        'Can design governance improvements aligned with organisational needs',
      ],
      competency_assessment_type: 'conversation',
    },
  ],
  module_facilitator_playbook: 'See facilitator-playbook.json in content repository',
  module_discovery_questions: [
    'What is the relationship between your organisation\'s strategy and its assets?',
    'Who are the key stakeholders that influence asset management decisions in your context?',
    'How does governance currently work in your organisation for asset-related decisions?',
    'What internal factors most significantly impact your asset management practices?',
    'What external pressures is your organisation facing regarding its assets?',
  ],
  module_scaffolding_strategies: [
    'Connect abstract concepts to learner\'s workplace examples',
    'Use the case study to illustrate stakeholder analysis',
    'Break down ISO 55001 requirements into digestible pieces',
    'Encourage reflection on current organisational practices',
  ],
  module_common_misconceptions: [
    'Asset management is only about maintenance',
    'Stakeholder management is purely about communication',
    'ISO 55001 compliance is the goal rather than a framework',
    'Governance is bureaucracy rather than enablement',
  ],
  module_estimated_hours: 8,
  module_github_path: 'courses/gfmam/311-organisational-context',
  module_version: '1.0.0',
  module_last_updated_date: new Date().toISOString(),
};

const ADDITIONAL_COURSES = [
  {
    course_id: 'gfmam-312',
    course_title: 'GFMAM 312: Asset Management Strategy and Planning',
    course_description: 'Develop the capability to craft strategies that align your organisation with its deepest aspirations through purposeful asset management planning.',
    course_type: 'gfmam',
    course_level: 'intermediate',
    course_nqf_level: 6,
    course_credits: 12,
    course_notional_hours: 120,
    course_module_ids: ['312-strategy-planning'],
    course_prerequisite_course_ids: ['gfmam-311'],
    course_certificate_price: 750,
    course_estimated_facilitation_hours: 12,
    course_learning_outcomes: [
      'Develop an Asset Management Policy aligned with ISO 55001 requirements',
      'Create a Strategic Asset Management Plan (SAMP)',
      'Apply the line-of-sight principle from organisational goals to operational activities',
      'Establish governance structures for effective decision-making',
    ],
    course_competency_framework: 'GFMAM Asset Management Landscape',
    course_published: true,
    course_version: '1.0.0',
    course_last_updated_date: new Date().toISOString(),
    course_created_date: new Date().toISOString(),
  },
];

// =============================================================================
// ROUTES
// =============================================================================

/**
 * POST /api/admin/seed
 * Seed the database with initial course data
 * NOTE: In production, this should require admin authentication
 */
router.post('/seed', async (req, res) => {
  // In production, verify admin role here
  const skipAuth = process.env.NODE_ENV === 'development';

  if (!skipAuth) {
    // TODO: Add admin authentication check
    // For now, allow in development
  }

  try {
    const db = getFirestore();
    const results = {
      courses: 0,
      modules: 0,
      errors: [] as string[],
    };

    // Seed main GFMAM 311 course
    try {
      await db.collection('courses').doc(GFMAM_COURSE.course_id).set(GFMAM_COURSE);
      results.courses++;
      console.log(`Created course: ${GFMAM_COURSE.course_title}`);
    } catch (err) {
      const errorMsg = `Failed to create course ${GFMAM_COURSE.course_id}: ${err}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
    }

    // Seed additional courses
    for (const course of ADDITIONAL_COURSES) {
      try {
        await db.collection('courses').doc(course.course_id).set(course);
        results.courses++;
        console.log(`Created course: ${course.course_title}`);
      } catch (err) {
        const errorMsg = `Failed to create course ${course.course_id}: ${err}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Seed main module
    try {
      await db.collection('modules').doc(GFMAM_311_MODULE.module_id).set(GFMAM_311_MODULE);
      results.modules++;
      console.log(`Created module: ${GFMAM_311_MODULE.module_title}`);
    } catch (err) {
      const errorMsg = `Failed to create module ${GFMAM_311_MODULE.module_id}: ${err}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
    }

    // Return results
    res.json({
      success: results.errors.length === 0,
      message: `Seeded ${results.courses} courses and ${results.modules} modules`,
      results,
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/admin/status
 * Get database status (counts of collections)
 */
router.get('/status', async (_req, res) => {
  try {
    const db = getFirestore();

    const [courses, modules, users, enrolments, certificates] = await Promise.all([
      db.collection('courses').count().get(),
      db.collection('modules').count().get(),
      db.collection('users').count().get(),
      db.collection('enrolments').count().get(),
      db.collection('certificates').count().get(),
    ]);

    res.json({
      success: true,
      counts: {
        courses: courses.data().count,
        modules: modules.data().count,
        users: users.data().count,
        enrolments: enrolments.data().count,
        certificates: certificates.data().count,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/admin/clear-test-data
 * Clear test data from database (development only)
 */
router.delete('/clear-test-data', async (_req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'This endpoint is only available in development',
    });
  }

  try {
    const db = getFirestore();

    // Only delete test data (courses and modules we seeded)
    const batch = db.batch();

    // Delete seeded courses
    batch.delete(db.collection('courses').doc('gfmam-311'));
    batch.delete(db.collection('courses').doc('gfmam-312'));

    // Delete seeded modules
    batch.delete(db.collection('modules').doc('311-organisational-context'));

    await batch.commit();

    res.json({
      success: true,
      message: 'Test data cleared',
    });
  } catch (error) {
    console.error('Clear test data error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
