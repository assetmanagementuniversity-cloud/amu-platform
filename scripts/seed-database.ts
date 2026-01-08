/**
 * Database Seeding Script for AMU Platform
 *
 * Seeds Firestore with initial course data for testing.
 * Run with: npx ts-node scripts/seed-database.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable to be set
 * to the path of your Firebase service account JSON file.
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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
  course_certificate_price: 500, // R500
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

// Additional courses for variety (can be used for testing multi-course scenarios)
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
// SEEDING FUNCTIONS
// =============================================================================

async function seedCourses(): Promise<void> {
  console.log('Seeding courses...');

  // Seed main course
  await db.collection('courses').doc(GFMAM_COURSE.course_id).set(GFMAM_COURSE);
  console.log(`  ✓ Created course: ${GFMAM_COURSE.course_title}`);

  // Seed additional courses
  for (const course of ADDITIONAL_COURSES) {
    await db.collection('courses').doc(course.course_id).set(course);
    console.log(`  ✓ Created course: ${course.course_title}`);
  }
}

async function seedModules(): Promise<void> {
  console.log('Seeding modules...');

  await db.collection('modules').doc(GFMAM_311_MODULE.module_id).set(GFMAM_311_MODULE);
  console.log(`  ✓ Created module: ${GFMAM_311_MODULE.module_title}`);
}

async function createTestUser(): Promise<void> {
  console.log('Creating test user...');

  const testUser = {
    user_id: 'test-user-001',
    user_email: 'test@assetmanagementuniversity.org',
    user_name: 'Test Learner',
    user_type: 'learner',
    user_tier: 'authenticated',
    user_language_preference: 'en',
    user_referral_code: 'TEST001',
    user_created_at: new Date().toISOString(),
    user_updated_at: new Date().toISOString(),
    user_marketing_consent: true,
    user_terms_accepted_at: new Date().toISOString(),
  };

  await db.collection('users').doc(testUser.user_id).set(testUser);
  console.log(`  ✓ Created test user: ${testUser.user_email}`);
}

async function createAdminUser(): Promise<void> {
  console.log('Creating admin user...');

  const adminUser = {
    user_id: 'admin-user-001',
    user_email: 'admin@assetmanagementuniversity.org',
    user_name: 'Admin User',
    user_type: 'admin',
    user_tier: 'authenticated',
    user_language_preference: 'en',
    user_referral_code: 'ADMIN001',
    user_created_at: new Date().toISOString(),
    user_updated_at: new Date().toISOString(),
    user_marketing_consent: false,
    user_terms_accepted_at: new Date().toISOString(),
  };

  await db.collection('users').doc(adminUser.user_id).set(adminUser);
  console.log(`  ✓ Created admin user: ${adminUser.user_email}`);
}

async function verifySeeding(): Promise<void> {
  console.log('\nVerifying seeded data...');

  // Check courses
  const coursesSnap = await db.collection('courses').get();
  console.log(`  Courses: ${coursesSnap.size} documents`);

  // Check modules
  const modulesSnap = await db.collection('modules').get();
  console.log(`  Modules: ${modulesSnap.size} documents`);

  // Check users
  const usersSnap = await db.collection('users').get();
  console.log(`  Users: ${usersSnap.size} documents`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('AMU Platform Database Seeding');
  console.log('='.repeat(60));
  console.log('');

  try {
    await seedCourses();
    await seedModules();
    await createTestUser();
    await createAdminUser();
    await verifySeeding();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database seeding complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Navigate to http://localhost:3000');
    console.log('3. Browse courses and enroll in GFMAM 311');
    console.log('');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
