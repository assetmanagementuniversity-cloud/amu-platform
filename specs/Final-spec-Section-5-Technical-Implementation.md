# AMU LMS TECHNICAL SPECIFICATION
## Section 5: Technical Implementation

**Status:** Development Ready  
**Version:** 1.0  
**Last Updated:** December 2024  
**Document Type:** Technical Specification

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | Claude | Initial compilation from Draft spec with UK English standardisation |

**Related Documents:**
- Section 4: System Architecture and Governance
- Section 6: Course Structure and Content Architecture
- Section 7: Operations and Compliance

---

## Table of Contents

5.1 Database Schema (Firestore)  
5.2 File Storage (Cloud Storage)  
5.3 Authentication Implementation  
5.4 Anthropic API Integration  
5.5 Conversation System with Intelligent Context  
5.6 Payment Integration (Stripe)  
5.7 Referral Programme Implementation  
5.8 Certificate System  
5.9 API Endpoints  
5.10 Security Implementation  

---

## 5.1 Database Schema (Firestore)

### 5.1.1 Overview

AMU uses Google Cloud Firestore in Native Mode for all operational data.

**Why Firestore?**
- Real-time synchronisation (essential for chat interface)
- Scalable to millions of documents without manual sharding
- Strong consistency guarantees
- Offline support (PWA capability)
- Integrated with Firebase ecosystem
- Pay-per-use (cost-effective for variable load)

**Design Principles:**
- Denormalisation for read performance
- Subcollections for 1-to-many relationships
- Composite indexes for complex queries
- Security rules at document level
- TypeScript interfaces enforce schema at application layer

### 5.1.2 Collection Structure

```
/users/{user_id}
/companies/{company_id}
/courses/{course_id}
/modules/{module_id}
/enrolments/{enrolment_id}
/conversations/{conversation_id}
  /messages/{message_id}
/conversation_summaries/{summary_id}
/assignments/{assignment_id}
/certificates/{certificate_id}
/seta_registrations/{registration_id}
/referrals/{referral_id}
/payments/{payment_id}
/karma_transactions/{transaction_id}
/ai_test_runs/{test_run_id}
/content_improvements/{improvement_id}
/api_queue/{queue_id}
/api_usage/{minute_key}
```

### 5.1.3 Users Collection

```typescript
// /users/{user_id}
interface User {
  // Identity
  user_id: string;                           // Primary key (Firebase Auth UID)
  user_email: string;                        // Unique, indexed
  user_name: string;
  user_type: 'learner' | 'training_manager'; // Role type
  
  // Authentication
  user_email_verified: boolean;
  user_created_date: Date;
  user_last_login_date: Date;
  user_auth_provider: 'email' | 'google';    // How they signed up
  
  // Profile
  user_preferred_language?: string;          // ISO code: en, zu, af, etc.
  user_location?: string;                    // "Johannesburg, South Africa"
  user_phone_number?: string;                // For SETA registration
  user_physical_address?: string;            // For SETA registration
  user_id_number?: string;                   // SA ID for SETA registration
  
  // Learning Preferences (detected over time)
  user_learning_style?: string;
  user_experience_level?: 'beginner' | 'intermediate' | 'advanced';
  user_preferences?: string[];               // ["prefers concrete examples", "visual learner"]
  user_challenges?: string[];                // ["struggles with abstract concepts"]
  
  // Company Linkage
  user_company_id?: string;                  // If linked to a company
  user_company_code_used?: string;           // The company code they used
  
  // Referral Programme
  user_referred_by?: string;                 // User ID of referrer (activates discount)
  user_referral_code: string;                // Unique code for this user
  user_karma_balance: number;                // R amount available for payout
  user_karma_lifetime_earned: number;        // Total earned all time
  
  // Payment
  user_stripe_customer_id?: string;          // Stripe customer ID
  user_stripe_connect_account_id?: string;   // For receiving karma payouts
  
  // SETA Registration
  user_seta_registration_id?: string;
  user_seta_registration_date?: Date;
}

// Indexes:
// - user_email (unique)
// - user_referral_code (unique)
// - user_referred_by (for querying referrals)
// - user_company_id (for company dashboards)
// - user_created_date (analytics)
```

### 5.1.4 Companies Collection

```typescript
// /companies/{company_id}
interface Company {
  company_id: string;                        // Primary key
  company_name: string;                      // Legal company name
  company_registration_number: string;       // CIPC registration
  company_tax_number?: string;               // For SDL grant assistance
  
  // Company Code
  company_code: string;                      // Unique code (e.g., MININGCORP-ABC123)
  company_referrer_user_id?: string;         // Who referred this company (activates discount)
  company_discount_active: boolean;          // True if referrer code was entered
  
  // Setup
  company_training_manager_user_id: string;  // Who set up the company
  company_created_date: Date;
  
  // Payment
  company_payment_method: 'invoice' | 'prepaid' | 'credit_card';
  company_stripe_customer_id?: string;
  company_prepaid_balance?: number;          // If using prepaid credits
  
  // Stats (denormalised for dashboard performance)
  company_total_employees: number;
  company_active_learners: number;
  company_certificates_earned: number;
  company_certificates_official: number;
}

// Indexes:
// - company_code (unique)
// - company_referrer_user_id (for commission calculations)
// - company_training_manager_user_id
```

### 5.1.5 Courses Collection

```typescript
// /courses/{course_id}
interface Course {
  course_id: string;
  course_title: string;
  course_description: string;
  course_type: 'gfmam' | 'qcto_knowledge' | 'qcto_practical' | 'qcto_work_experience';
  course_level: 'foundation' | 'intermediate' | 'advanced';
  
  // QCTO/SETA
  course_nqf_level?: number;                 // 4, 5, 6, etc.
  course_credits?: number;
  course_notional_hours?: number;
  
  // Structure
  course_module_ids: string[];               // Ordered list
  course_prerequisite_course_ids?: string[];
  
  // Certification Pricing (list prices - discounts applied at checkout)
  course_certificate_price: number;          // List price in Rands
  course_estimated_facilitation_hours: number;
  
  // Content
  course_learning_outcomes: string[];
  course_competency_framework: string;       // Link to GFMAM/QCTO doc
  
  // Metadata
  course_published: boolean;
  course_version: string;
  course_last_updated_date: Date;
  course_created_date: Date;
}
```

### 5.1.6 Modules Collection

```typescript
// /modules/{module_id}
interface Module {
  module_id: string;
  module_course_id: string;
  module_title: string;
  module_description: string;
  module_order: number;                      // Position in course
  
  // Content
  module_learning_objectives: string[];
  module_case_study_id: string;
  module_competencies: Competency[];
  
  // Facilitator Guidance
  module_facilitator_playbook: string;       // Markdown content
  module_discovery_questions: string[];
  module_scaffolding_strategies: string[];
  module_common_misconceptions: string[];
  
  // Estimated Time
  module_estimated_hours: number;
  
  // GitHub
  module_github_path: string;                // Path in content repo
  module_version: string;
  module_last_updated_date: Date;
}

interface Competency {
  competency_id: string;
  competency_title: string;
  competency_description: string;
  competency_evidence_criteria: string[];    // What learner must demonstrate
  competency_assessment_type: 'conversation' | 'assignment' | 'both';
}
```

### 5.1.7 enrolments Collection

```typescript
// /enrolments/{enrolment_id}
interface enrolment {
  enrolment_id: string;
  enrolment_user_id: string;
  enrolment_course_id: string;
  
  // Status
  enrolment_status: 'active' | 'paused' | 'completed' | 'abandoned';
  enrolment_started_date: Date;
  enrolment_completed_date?: Date;
  enrolment_last_activity_date: Date;
  
  // Progress
  enrolment_current_module_id: string;
  enrolment_current_module_title: string;
  enrolment_modules_completed: string[];    // Module IDs
  enrolment_progress_percentage: number;    // 0-100
  
  // Competencies
  enrolment_competencies_achieved: CompetencyAchievement[];
  enrolment_current_competency_id?: string;
  enrolment_current_competency_status?: 'not_yet' | 'developing' | 'competent';
  
  // Language
  enrolment_language: string;               // Can differ from user default
  
  // Conversations
  enrolment_conversation_ids: string[];     // All conversations for this enrolment
  enrolment_active_conversation_id?: string;
  
  // Certificate
  enrolment_certificate_generated: boolean;
  enrolment_certificate_type?: 'unofficial' | 'official';
  enrolment_certificate_id?: string;
}

interface CompetencyAchievement {
  competency_id: string;
  competency_title: string;
  achieved_date: Date;
  achievement_level: 'competent';            // Only competent is stored
  evidence_conversation_id?: string;
  evidence_assignment_id?: string;
}
```

### 5.1.8 Conversations Collection

```typescript
// /conversations/{conversation_id}
interface Conversation {
  conversation_id: string;
  conversation_user_id: string;
  conversation_enrolment_id?: string;       // Null for anonymous inquiry chats
  conversation_type: 'inquiry' | 'learning' | 'assessment';
  
  // Status
  conversation_status: 'active' | 'paused' | 'completed';
  conversation_started_date: Date;
  conversation_last_message_date: Date;
  
  // Context
  conversation_module_id?: string;
  conversation_competency_id?: string;
  
  // Stats
  conversation_message_count: number;
  conversation_total_tokens_used: number;
  
  // Summaries
  conversation_latest_summary_id?: string;
  conversation_summary_count: number;
}

// /conversations/{conversation_id}/messages/{message_id}
interface Message {
  message_id: string;
  message_role: 'user' | 'assistant';
  message_content: string;
  message_timestamp: Date;
  
  // Token tracking
  message_input_tokens?: number;
  message_output_tokens?: number;
  
  // Assessment (if this message contains assessment)
  message_competency_assessment?: {
    competency_id: string;
    assessment_result: 'not_yet' | 'developing' | 'competent';
    evidence_captured: string;
  };
}
```

### 5.1.9 Conversation Summaries Collection

```typescript
// /conversation_summaries/{summary_id}
interface ConversationSummary {
  summary_id: string;
  summary_conversation_id: string;
  summary_session_number: number;
  
  // Message Range
  summary_start_message_id: string;
  summary_end_message_id: string;
  summary_message_count: number;
  
  // Content (generated by Claude)
  summary_text: string;                      // Full narrative summary
  summary_key_insights: string[];
  summary_breakthroughs: string[];
  summary_struggles: string[];
  summary_notable_moments: string[];
  
  // Metadata
  summary_created_date: Date;
  summary_tokens_used: number;
}
```

### 5.1.10 Certificates Collection

```typescript
// /certificates/{certificate_id}
interface Certificate {
  certificate_id: string;
  certificate_user_id: string;
  certificate_enrolment_id: string;
  certificate_course_id: string;
  
  // Type
  certificate_type: 'unofficial' | 'official';
  certificate_watermark: boolean;
  certificate_seta_registered: boolean;
  
  // Details
  certificate_learner_name: string;
  certificate_course_title: string;
  certificate_competencies: string[];        // Achieved competencies
  certificate_completion_date: Date;
  certificate_issue_date: Date;
  
  // Verification
  certificate_code: string;                  // Unique verification code
  certificate_qr_code_url: string;
  
  // Files
  certificate_pdf_url: string;               // Cloud Storage URL
  certificate_pdf_size_bytes: number;
  
  // SETA (for official certificates)
  certificate_nqf_level?: number;
  certificate_credits?: number;
  certificate_seta_registration_number?: string;
  
  // Payment (for official certificates)
  certificate_payment_id?: string;
  certificate_price_paid?: number;
  certificate_discount_applied?: number;     // If referral code used
  certificate_referrer_user_id?: string;     // Who gets commission
}

// Indexes:
// - certificate_code (unique, for verification)
// - certificate_user_id + certificate_type
// - certificate_referrer_user_id (for commission queries)
```

### 5.1.11 Referrals Collection

```typescript
// /referrals/{referral_id}
interface Referral {
  referral_id: string;
  referral_referrer_user_id: string;         // Who referred
  referral_referred_user_id?: string;        // Who was referred (user)
  referral_referred_company_id?: string;     // Who was referred (company)
  referral_date: Date;
  
  // Status
  referral_status: 'pending' | 'converted' | 'paid';
  referral_conversion_date?: Date;           // When referred user/company purchased
  referral_payment_date?: Date;
  
  // Tier tracking
  referral_tier: 1 | 2;                      // Direct or second-level
  referral_source_referral_id?: string;      // If tier 2, which tier 1 referral
  
  // Karma
  referral_karma_earned: number;             // R amount (10% of list price)
  referral_purchase_amount?: number;         // Certificate list price
  
  // Payment
  referral_payout_id?: string;
  referral_payout_date?: Date;
}

// Indexes:
// - referral_referrer_user_id + referral_status
// - referral_referred_user_id
// - referral_referred_company_id
// - referral_tier + referral_status (analytics)
```

### 5.1.12 Payments Collection

```typescript
// /payments/{payment_id}
interface Payment {
  payment_id: string;
  payment_user_id: string;
  payment_company_id?: string;               // If company payment
  payment_type: 'certificate' | 'seta_registration' | 'prepaid_credits';
  
  // Amount
  payment_amount: number;                    // Amount paid
  payment_list_price: number;                // Original price before discount
  payment_discount_amount: number;           // Discount applied (if referral code)
  payment_currency: 'ZAR';
  
  // Referral
  payment_referrer_user_id?: string;         // Who gets commission
  payment_tier1_commission?: number;         // 10% of list price
  payment_tier2_referrer_user_id?: string;
  payment_tier2_commission?: number;         // 10% of list price
  
  // Stripe
  payment_stripe_payment_intent_id: string;
  payment_stripe_charge_id?: string;
  payment_stripe_receipt_url?: string;
  
  // Status
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_created_date: Date;
  payment_completed_date?: Date;
  
  // Related Items
  payment_certificate_ids?: string[];
  payment_seta_registration_id?: string;
}
```

### 5.1.13 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isCompanyTrainingManager(companyId) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/companies/$(companyId))
          .data.company_training_manager_user_id == request.auth.uid;
    }
    
    // Users - read/write own profile
    match /users/{userId} {
      allow read, update: if isOwner(userId);
      allow create: if isAuthenticated();
      allow delete: if false;  // Never allow deletion (audit trail)
    }
    
    // Companies - training manager can read/update
    match /companies/{companyId} {
      allow read: if isCompanyTrainingManager(companyId);
      allow create: if isAuthenticated();
      allow update: if isCompanyTrainingManager(companyId);
      allow delete: if false;
    }
    
    // Courses - public read
    match /courses/{courseId} {
      allow read: if true;
      allow write: if false;  // Only via Cloud Functions
    }
    
    // Modules - public read
    match /modules/{moduleId} {
      allow read: if true;
      allow write: if false;
    }
    
    // enrolments - only owner
    match /enrolments/{enrolmentId} {
      allow read, write: if isAuthenticated() && 
        resource.data.enrolment_user_id == request.auth.uid;
    }
    
    // Conversations - only owner
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() && 
        resource.data.conversation_user_id == request.auth.uid;
      allow write: if false;  // Only via Cloud Functions
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
          get(/databases/$(database)/documents/conversations/$(conversationId))
            .data.conversation_user_id == request.auth.uid;
        allow write: if false;
      }
    }
    
    // Certificates - owner + public verification
    match /certificates/{certificateId} {
      // Owner can always read
      allow read: if isAuthenticated() && 
        resource.data.certificate_user_id == request.auth.uid;
      allow write: if false;
    }
    
    // Referrals - referrer can read their own
    match /referrals/{referralId} {
      allow read: if isAuthenticated() && 
        (resource.data.referral_referrer_user_id == request.auth.uid ||
         resource.data.referral_referred_user_id == request.auth.uid);
      allow write: if false;
    }
    
    // All other collections - no direct access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 5.2 File Storage (Cloud Storage)

### 5.2.1 Bucket Structure

```
amu-certificates-production/
  ├── unofficial/
  │   └── {user_id}/
  │       └── {course_id}.pdf
  └── official/
      └── {user_id}/
          └── {course_id}.pdf

amu-seta-documents-production/
  └── {registration_id}/
      ├── id_document.pdf
      ├── proof_of_residence.pdf
      └── signature.png

amu-assignments-production/
  └── {user_id}/
      └── {assignment_id}/
          ├── submission.pdf
          └── attachments/

amu-content-cache-production/
  ├── course-images/
  ├── case-study-assets/
  └── markdown-rendered/

amu-backups-production/
  ├── firestore-exports/
  └── user-data-archives/
```

### 5.2.2 Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Certificates - owner can read
    match /unofficial/{userId}/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if false;
    }
    
    match /official/{userId}/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if false;
    }
    
    // SETA documents - owner can read and upload
    match /seta-documents/{registrationId}/{allPaths=**} {
      allow read: if request.auth != null;  // Verified by Cloud Function
      allow write: if request.auth != null && 
                     request.resource.size < 10 * 1024 * 1024;  // Max 10MB
    }
    
    // Assignments - owner can upload
    match /assignments/{userId}/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId &&
                     request.resource.size < 25 * 1024 * 1024;  // Max 25MB
    }
    
    // Public content cache
    match /content-cache/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 5.3 Authentication Implementation

### 5.3.1 Firebase Authentication Configuration

```typescript
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "amu-production.firebaseapp.com",
  projectId: "amu-production",
  storageBucket: "amu-production.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

### 5.3.2 Email/Password Registration

```typescript
interface RegistrationData {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}

async function registerWithEmail(data: RegistrationData): Promise<RegisterResult> {
  try {
    // Validate password requirements
    if (!isValidPassword(data.password)) {
      return {
        success: false,
        error: "Password must be at least 8 characters with 1 number and 1 uppercase letter"
      };
    }
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      data.email, 
      data.password
    );
    
    const user = userCredential.user;
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Process referral code if provided
    let referrerId: string | null = null;
    let companyId: string | null = null;
    
    if (data.referralCode) {
      const referralResult = await processReferralCode(data.referralCode, user.uid);
      referrerId = referralResult.referrerId;
      companyId = referralResult.companyId;
    }
    
    // Create user document in Firestore
    await createUserDocument({
      user_id: user.uid,
      user_email: data.email,
      user_name: data.name,
      user_type: 'learner',
      user_email_verified: false,
      user_created_date: new Date(),
      user_last_login_date: new Date(),
      user_auth_provider: 'email',
      user_referred_by: referrerId,
      user_company_id: companyId,
      user_company_code_used: data.referralCode,
      user_referral_code: await generateUniqueReferralCode(data.name),
      user_karma_balance: 0,
      user_karma_lifetime_earned: 0
    });
    
    // Create referral records if applicable
    if (referrerId) {
      await createReferralRecords(referrerId, user.uid);
    }
    
    return {
      success: true,
      userId: user.uid,
      emailVerificationSent: true
    };
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: "An account with this email already exists" };
    }
    throw error;
  }
}

function isValidPassword(password: string): boolean {
  // Minimum 8 characters, at least 1 number, at least 1 uppercase
  const minLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  
  return minLength && hasNumber && hasUppercase;
}
```

### 5.3.3 Google Sign-In

```typescript
async function signInWithGoogle(referralCode?: string): Promise<RegisterResult> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user already exists in Firestore
    const existingUser = await getUser(user.uid);
    
    if (!existingUser) {
      // New user - create document
      let referrerId: string | null = null;
      let companyId: string | null = null;
      
      if (referralCode) {
        const referralResult = await processReferralCode(referralCode, user.uid);
        referrerId = referralResult.referrerId;
        companyId = referralResult.companyId;
      }
      
      await createUserDocument({
        user_id: user.uid,
        user_email: user.email!,
        user_name: user.displayName || 'Learner',
        user_type: 'learner',
        user_email_verified: user.emailVerified,
        user_created_date: new Date(),
        user_last_login_date: new Date(),
        user_auth_provider: 'google',
        user_referred_by: referrerId,
        user_company_id: companyId,
        user_company_code_used: referralCode,
        user_referral_code: await generateUniqueReferralCode(user.displayName || 'User'),
        user_karma_balance: 0,
        user_karma_lifetime_earned: 0
      });
      
      if (referrerId) {
        await createReferralRecords(referrerId, user.uid);
      }
    } else {
      // Existing user - update last login
      await updateUser(user.uid, { user_last_login_date: new Date() });
    }
    
    return { success: true, userId: user.uid };
    
  } catch (error) {
    throw error;
  }
}
```

### 5.3.4 Referral Code Processing

```typescript
interface ReferralCodeResult {
  referrerId: string | null;
  companyId: string | null;
  discountActive: boolean;
}

async function processReferralCode(
  code: string, 
  newUserId: string
): Promise<ReferralCodeResult> {
  
  // Check if it's a company code
  const company = await getCompanyByCode(code);
  if (company) {
    return {
      referrerId: company.company_referrer_user_id || null,
      companyId: company.company_id,
      discountActive: company.company_discount_active
    };
  }
  
  // Check if it's an individual referral code
  const referrer = await getUserByReferralCode(code);
  if (referrer) {
    return {
      referrerId: referrer.user_id,
      companyId: null,
      discountActive: true  // Individual referral codes always activate discount
    };
  }
  
  // Code not found - no referrer, no discount
  return {
    referrerId: null,
    companyId: null,
    discountActive: false
  };
}

async function createReferralRecords(
  referrerId: string, 
  newUserId: string
): Promise<void> {
  
  // Create Tier 1 referral record
  await firestore.collection('referrals').add({
    referral_id: generateId('ref'),
    referral_referrer_user_id: referrerId,
    referral_referred_user_id: newUserId,
    referral_date: new Date(),
    referral_status: 'pending',
    referral_tier: 1,
    referral_karma_earned: 0
  });
  
  // Check if referrer was also referred (Tier 2)
  const referrer = await getUser(referrerId);
  if (referrer.user_referred_by) {
    await firestore.collection('referrals').add({
      referral_id: generateId('ref'),
      referral_referrer_user_id: referrer.user_referred_by,
      referral_referred_user_id: newUserId,
      referral_date: new Date(),
      referral_status: 'pending',
      referral_tier: 2,
      referral_karma_earned: 0
    });
  }
}
```

### 5.3.5 MFA (Optional)

```typescript
async function enableMFA(phoneNumber: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  
  const multiFactorSession = await multiFactor(user).getSession();
  
  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber(
    { phoneNumber, session: multiFactorSession },
    window.recaptchaVerifier
  );
  
  // User enters verification code
  const verificationCode = await promptUserForCode();
  
  const phoneAuthCredential = PhoneAuthProvider.credential(
    verificationId, 
    verificationCode
  );
  
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(
    phoneAuthCredential
  );
  
  await multiFactor(user).enroll(multiFactorAssertion, 'Phone Number');
}
```

---

## 5.4 Anthropic API Integration

### 5.4.1 Configuration

```typescript
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_CONFIG = {
  model: 'claude-sonnet-4-5-20250929',        // Claude Sonnet 4.5
  api_version: '2023-06-01',
  max_tokens: 2000,                            // Sufficient for educational responses
  temperature: 1.0,                            // Natural variation
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### 5.4.2 Core Facilitation Pattern

```typescript
async function facilitateLearning(
  conversationId: string,
  newMessage: string
): Promise<FacilitationResult> {
  try {
    // 1. Load conversation context
    const context = await buildConversationContext(conversationId);
    
    // 2. Build messages array
    const messages = [
      ...context.recentMessages,  // Last 10-20 messages verbatim
      {
        role: 'user' as const,
        content: newMessage
      }
    ];
    
    // 3. Build system prompt with full context
    const systemPrompt = buildSystemPrompt({
      learnerProfile: context.learnerProfile,
      courseContext: context.courseContext,
      conversationSummary: context.summaries,
      currentCompetency: context.currentCompetency,
      facilitatorPlaybook: context.playbook
    });
    
    // 4. Call Claude API
    const response = await anthropic.messages.create({
      model: ANTHROPIC_CONFIG.model,
      max_tokens: ANTHROPIC_CONFIG.max_tokens,
      system: systemPrompt,
      messages: messages
    });
    
    // 5. Extract response
    const facilitatorResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    // 6. Store message in Firestore
    await storeMessage(conversationId, {
      role: 'assistant',
      content: facilitatorResponse,
      timestamp: new Date(),
      tokens_used: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens
      }
    });
    
    // 7. Update conversation summary if needed
    if (shouldUpdateSummary(context.messageCount)) {
      await generateConversationSummary(conversationId);
    }
    
    // 8. Return response
    return {
      success: true,
      response: facilitatorResponse,
      conversationId: conversationId
    };
    
  } catch (error) {
    return await handleAnthropicError(error, conversationId);
  }
}
```

### 5.4.3 System Prompt Builder

```typescript
function buildSystemPrompt(context: ContextData): string {
  return `You are an AI facilitator at Asset Management University (AMU), embodying Ubuntu philosophy: "I am because we are."

YOUR ROLE:
You facilitate learning through Socratic dialogue - asking questions that guide discovery rather than lecturing. You are warm, encouraging, and genuinely curious about each learner's thinking.

LEARNER PROFILE:
Name: ${context.learnerProfile.name}
Language: ${context.learnerProfile.language}
Location: ${context.learnerProfile.location}
Experience Level: ${context.learnerProfile.experience_level || 'Unknown'}
Learning Style: ${context.learnerProfile.learning_style || 'Adapting'}
Key Preferences: ${context.learnerProfile.key_preferences?.join(', ') || 'Still learning'}
Noted Challenges: ${context.learnerProfile.challenges_noted?.join(', ') || 'None yet'}

COURSE CONTEXT:
Course: ${context.courseContext.course_title}
Current Module: ${context.courseContext.current_module}
Learning Objectives: ${context.courseContext.learning_objectives?.join('; ')}

CURRENT COMPETENCY:
Title: ${context.currentCompetency.title}
Description: ${context.currentCompetency.description}
Evidence Required: ${context.currentCompetency.evidence_criteria?.join('; ')}
Current Status: ${context.currentCompetency.current_status}

CASE STUDY:
${context.courseContext.case_study}

PREVIOUS SESSION SUMMARIES:
${context.summaries.map(s => `Session ${s.session_number}:\n${s.key_insights?.join('\n')}`).join('\n\n')}

FACILITATOR PLAYBOOK:
${context.playbook}

FACILITATION PRINCIPLES:
1. Ask questions that prompt discovery - don't lecture
2. Connect concepts to the learner's workplace context
3. Celebrate insights and breakthroughs authentically
4. When learner struggles, provide scaffolding not answers
5. Assess competency through natural conversation
6. Remember everything - attention is respect
7. Use the case study to make concepts concrete
8. Adapt language complexity to learner's level
9. Be patient - learning takes time

RESPONSE GUIDELINES:
- Keep responses focused and conversational (typically 100-300 words)
- Ask one thoughtful question to guide their thinking
- Reference their specific context when possible
- If they demonstrate competency, note it naturally
- If they're struggling, offer a simpler angle
- Be warm, human, and genuinely helpful`;
}
```

### 5.4.4 Intelligent Context Management

```typescript
async function buildConversationContext(
  conversationId: string
): Promise<ConversationContext> {
  
  const conversation = await getConversation(conversationId);
  const user = await getUser(conversation.conversation_user_id);
  const enrolment = conversation.conversation_enrolment_id 
    ? await getenrolment(conversation.conversation_enrolment_id)
    : null;
  
  // 1. LEARNER PROFILE (~500 tokens)
  const learnerProfile = {
    name: user.user_name,
    language: user.user_preferred_language || 'en',
    location: user.user_location || 'South Africa',
    learning_style: user.user_learning_style,
    experience_level: user.user_experience_level,
    key_preferences: user.user_preferences,
    challenges_noted: user.user_challenges
  };
  
  // 2. COURSE CONTEXT (~300 tokens) - if enrolled
  const courseContext = enrolment ? {
    course_title: enrolment.enrolment_course_title,
    current_module: enrolment.enrolment_current_module_title,
    learning_objectives: enrolment.enrolment_current_learning_objectives,
    case_study: await getCurrentCaseStudy(enrolment.enrolment_current_module_id)
  } : {
    course_title: 'General Inquiry',
    current_module: null,
    learning_objectives: [],
    case_study: null
  };
  
  // 3. RECENT MESSAGES (~2,000 tokens)
  const messages = await firestore
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .orderBy('message_timestamp', 'desc')
    .limit(20)
    .get();
  
  const recentMessages = messages.docs.reverse().map(doc => ({
    role: doc.data().message_role as 'user' | 'assistant',
    content: doc.data().message_content
  }));
  
  // 4. CONVERSATION SUMMARIES (~1,000 tokens per session)
  const summaries = await firestore
    .collection('conversation_summaries')
    .where('summary_conversation_id', '==', conversationId)
    .orderBy('summary_session_number', 'asc')
    .get();
  
  const conversationSummaries = summaries.docs.map(doc => ({
    session_number: doc.data().summary_session_number,
    key_insights: doc.data().summary_key_insights,
    breakthroughs: doc.data().summary_breakthroughs,
    struggles: doc.data().summary_struggles,
    notable_moments: doc.data().summary_notable_moments
  }));
  
  // 5. CURRENT COMPETENCY (~200 tokens)
  const currentCompetency = enrolment ? {
    title: enrolment.enrolment_current_competency_title,
    description: enrolment.enrolment_current_competency_description,
    evidence_criteria: enrolment.enrolment_current_competency_criteria,
    current_status: enrolment.enrolment_current_competency_status,
    development_areas: enrolment.enrolment_competency_development_areas
  } : null;
  
  // 6. FACILITATOR PLAYBOOK (~500 tokens)
  const playbook = enrolment 
    ? await getFacilitatorPlaybook(enrolment.enrolment_current_module_id)
    : getGeneralInquiryPlaybook();
  
  return {
    learnerProfile,
    courseContext,
    recentMessages,
    summaries: conversationSummaries,
    currentCompetency,
    playbook,
    messageCount: conversation.conversation_message_count
  };
}
```

### 5.4.5 Conversation Summary Generation

```typescript
async function generateConversationSummary(
  conversationId: string
): Promise<void> {
  
  // Get messages since last summary
  const lastSummary = await getLatestSummary(conversationId);
  const startMessage = lastSummary ? lastSummary.summary_end_message_id : null;
  
  const messages = await getMessagesSince(conversationId, startMessage);
  
  if (messages.length < 5) {
    return;  // Not enough for meaningful summary
  }
  
  // Ask Claude to summarise
  const summary = await anthropic.messages.create({
    model: ANTHROPIC_CONFIG.model,
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Summarise this learning session for context in future conversations:

LEARNER: ${await getLearnerName(conversationId)}

CONVERSATION:
${formatMessagesForSummary(messages)}

Create a rich summary that captures:
1. KEY INSIGHTS - What did the learner discover or understand?
2. BREAKTHROUGHS - Moments of genuine understanding or "aha!"
3. STRUGGLES - What was difficult? What needed scaffolding?
4. NOTABLE MOMENTS - Anything important to remember about this learner
5. PROGRESS - How did their understanding develop?

Write in narrative form, as if briefing yourself before continuing the conversation.
Be specific about their thinking, not just topics covered.`
      }
    ]
  });
  
  const summaryText = summary.content[0].type === 'text' 
    ? summary.content[0].text 
    : '';
  
  // Store summary
  await firestore.collection('conversation_summaries').add({
    summary_id: generateId('sum'),
    summary_conversation_id: conversationId,
    summary_session_number: (lastSummary?.summary_session_number || 0) + 1,
    summary_start_message_id: startMessage,
    summary_end_message_id: messages[messages.length - 1].message_id,
    summary_text: summaryText,
    summary_created_date: new Date(),
    summary_message_count: messages.length,
    summary_tokens_used: summary.usage.input_tokens + summary.usage.output_tokens
  });
}

function shouldUpdateSummary(messageCount: number): boolean {
  // Generate summary every 10 messages
  return messageCount > 0 && messageCount % 10 === 0;
}
```

### 5.4.6 Error Handling

```typescript
async function handleAnthropicError(
  error: any, 
  conversationId: string
): Promise<FacilitationResult> {
  
  // Rate limit error
  if (error.status === 429) {
    // Add to queue for retry
    await addToQueue(conversationId);
    return {
      success: false,
      error: "I'm currently helping many learners. Your message is queued and I'll respond shortly.",
      retry: true
    };
  }
  
  // Context too long
  if (error.status === 400 && error.message.includes('context')) {
    // Force summary generation and retry
    await generateConversationSummary(conversationId);
    return {
      success: false,
      error: "Let me organise my thoughts. Please try again.",
      retry: true
    };
  }
  
  // Service unavailable
  if (error.status === 503 || error.status === 500) {
    return {
      success: false,
      error: "I'm experiencing temporary difficulties. Please try again in a moment.",
      retry: true
    };
  }
  
  // Log unexpected error
  console.error('Anthropic API error:', error);
  
  return {
    success: false,
    error: "Something went wrong. Please try again.",
    retry: false
  };
}
```

---

## 5.5 Conversation System with Intelligent Context

### 5.5.1 Context Token Budget

```typescript
// Total context budget: ~8,000 tokens (leaving room for response)
const CONTEXT_BUDGET = {
  learner_profile: 500,
  course_context: 300,
  recent_messages: 2000,      // Last 10-20 messages
  summaries: 3000,            // ~3 session summaries
  current_competency: 200,
  facilitator_playbook: 500,
  case_study: 1500,
  
  total: 8000
};

// Cost savings: 85-90% vs full history
// Quality: Maintains complete "attention" - Claude knows everything important
```

### 5.5.2 Summary Example

```
Session 3 Summary:

Sipho demonstrated significant growth in understanding stakeholder 
analysis. Initially struggled with abstract concept of "competing 
interests" but breakthrough came when discussing his taxi company 
context - drivers want higher pay, passengers want lower fares, 
municipality wants compliance. He naturally connected this to Old 
Mill Bakery case study.

KEY INSIGHTS:
• Grasped that stakeholders can have conflicting yet valid needs
• Understood concept of trade-offs in decision-making
• Made unprompted connection to his workplace challenges

BREAKTHROUGHS:
• "Oh! Management isn't choosing between right and wrong, they're 
  choosing between multiple rights!" - This showed deep understanding
  of stakeholder balance

STRUGGLES:
• Abstract terminology still challenging (prefers concrete examples)
• Sometimes jumps to solutions before fully analysing problem
• Needs reminding to consider ALL stakeholders, not just obvious ones

NOTABLE MOMENTS:
• Shared personal story about conflict between drivers and company
• Showed empathy for different perspectives
• Asked thoughtful question about ethics in decision-making

PROGRESS:
Moved from "Developing" to showing signs of "Competent" in 
stakeholder analysis. Ready to tackle next competency on 
organisational purpose. Continue using his taxi company as primary 
example - this resonates deeply and makes concepts concrete.

NEXT SESSION FOCUS:
Build on stakeholder understanding to explore how organisational 
purpose guides decision-making when stakeholder interests conflict.
```

---

## 5.6 Payment Integration (Stripe)

### 5.6.1 Configuration

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// For referral payouts
const STRIPE_CONNECT_CONFIG = {
  country: 'ZA',
  capabilities: {
    transfers: { requested: true }
  }
};
```

### 5.6.2 Certificate Purchase Flow

```typescript
interface CertificatePurchaseRequest {
  userId: string;
  certificateIds: string[];      // Certificates to make official
  referralCodeUsed?: string;     // For discount calculation
}

async function createCertificatePayment(
  request: CertificatePurchaseRequest
): Promise<PaymentResult> {
  
  const user = await getUser(request.userId);
  
  // Calculate pricing
  let listPriceTotal = 0;
  const certificates = [];
  
  for (const certId of request.certificateIds) {
    const cert = await getCertificate(certId);
    const course = await getCourse(cert.certificate_course_id);
    certificates.push({ cert, course });
    listPriceTotal += course.course_certificate_price;
  }
  
  // Check for discount (via referral code)
  let discountAmount = 0;
  let referrerId: string | null = null;
  let tier2ReferrerId: string | null = null;
  
  if (user.user_referred_by) {
    // User has a referrer - 10% discount applies
    discountAmount = Math.round(listPriceTotal * 0.10);
    referrerId = user.user_referred_by;
    
    // Check for tier 2 referrer
    const referrer = await getUser(referrerId);
    if (referrer.user_referred_by) {
      tier2ReferrerId = referrer.user_referred_by;
    }
  }
  
  // Also check if user is linked to a company with a referrer
  if (!referrerId && user.user_company_id) {
    const company = await getCompany(user.user_company_id);
    if (company.company_discount_active && company.company_referrer_user_id) {
      discountAmount = Math.round(listPriceTotal * 0.10);
      referrerId = company.company_referrer_user_id;
      
      const referrer = await getUser(referrerId);
      if (referrer.user_referred_by) {
        tier2ReferrerId = referrer.user_referred_by;
      }
    }
  }
  
  const amountToPay = listPriceTotal - discountAmount;
  
  // Create or retrieve Stripe customer
  let stripeCustomerId = user.user_stripe_customer_id;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.user_email,
      name: user.user_name,
      metadata: { amu_user_id: user.user_id }
    });
    stripeCustomerId = customer.id;
    await updateUser(user.user_id, { user_stripe_customer_id: stripeCustomerId });
  }
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountToPay * 100,  // Convert to cents
    currency: 'zar',
    customer: stripeCustomerId,
    metadata: {
      amu_user_id: user.user_id,
      certificate_ids: request.certificateIds.join(','),
      list_price: listPriceTotal.toString(),
      discount: discountAmount.toString(),
      referrer_id: referrerId || '',
      tier2_referrer_id: tier2ReferrerId || ''
    }
  });
  
  // Create payment record
  const paymentId = generateId('pay');
  await firestore.collection('payments').add({
    payment_id: paymentId,
    payment_user_id: user.user_id,
    payment_type: 'certificate',
    payment_amount: amountToPay,
    payment_list_price: listPriceTotal,
    payment_discount_amount: discountAmount,
    payment_currency: 'ZAR',
    payment_referrer_user_id: referrerId,
    payment_tier1_commission: referrerId ? Math.round(listPriceTotal * 0.10) : 0,
    payment_tier2_referrer_user_id: tier2ReferrerId,
    payment_tier2_commission: tier2ReferrerId ? Math.round(listPriceTotal * 0.10) : 0,
    payment_stripe_payment_intent_id: paymentIntent.id,
    payment_status: 'pending',
    payment_created_date: new Date(),
    payment_certificate_ids: request.certificateIds
  });
  
  return {
    success: true,
    paymentIntentClientSecret: paymentIntent.client_secret,
    paymentId: paymentId,
    breakdown: {
      listPrice: listPriceTotal,
      discount: discountAmount,
      amountDue: amountToPay
    }
  };
}
```

### 5.6.3 Webhook Handler

```typescript
async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
      break;
  }
}

async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  
  const metadata = paymentIntent.metadata;
  const userId = metadata.amu_user_id;
  const certificateIds = metadata.certificate_ids.split(',');
  const referrerId = metadata.referrer_id || null;
  const tier2ReferrerId = metadata.tier2_referrer_id || null;
  const listPrice = parseInt(metadata.list_price);
  
  // 1. Update payment record
  await updatePaymentByIntentId(paymentIntent.id, {
    payment_status: 'succeeded',
    payment_completed_date: new Date(),
    payment_stripe_charge_id: paymentIntent.latest_charge as string
  });
  
  // 2. Upgrade certificates to official
  for (const certId of certificateIds) {
    await upgradeCertificateToOfficial(certId);
  }
  
  // 3. Process referral karma (10% of LIST PRICE, not discounted price)
  if (referrerId) {
    const tier1Karma = Math.round(listPrice * 0.10);
    await creditKarma(referrerId, tier1Karma, {
      source: 'tier_1_referral',
      purchaser_id: userId,
      certificate_price: listPrice
    });
    
    // Update referral record
    await updateReferralStatus(referrerId, userId, 'converted', tier1Karma);
  }
  
  if (tier2ReferrerId) {
    const tier2Karma = Math.round(listPrice * 0.10);
    await creditKarma(tier2ReferrerId, tier2Karma, {
      source: 'tier_2_referral',
      purchaser_id: userId,
      certificate_price: listPrice
    });
    
    await updateReferralStatus(tier2ReferrerId, userId, 'converted', tier2Karma);
  }
  
  // 4. Send confirmation email
  await sendCertificateEmail(userId, certificateIds);
}
```

---

## 5.7 Referral Programme Implementation

### 5.7.1 Referral Code Generation

```typescript
async function generateUniqueReferralCode(name: string): Promise<string> {
  const firstName = name.split(' ')[0].toUpperCase();
  const maxAttempts = 10;
  
  for (let i = 0; i < maxAttempts; i++) {
    const randomChars = generateRandomChars(4);
    const code = `${firstName}-${randomChars}`;
    
    // Check uniqueness
    const existing = await getUserByReferralCode(code);
    if (!existing) {
      return code;
    }
  }
  
  // Fallback with longer random string
  return `${firstName}-${generateRandomChars(8)}`;
}

function generateRandomChars(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // Exclude confusing chars
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

### 5.7.2 Karma Credit System

```typescript
async function creditKarma(
  userId: string,
  amount: number,
  metadata: KarmaMetadata
): Promise<void> {
  
  // Update user balance
  await firestore.collection('users').doc(userId).update({
    user_karma_balance: FieldValue.increment(amount),
    user_karma_lifetime_earned: FieldValue.increment(amount)
  });
  
  // Create transaction record
  await firestore.collection('karma_transactions').add({
    transaction_id: generateId('karma'),
    transaction_user_id: userId,
    transaction_amount: amount,
    transaction_type: 'credit',
    transaction_source: metadata.source,
    transaction_metadata: metadata,
    transaction_date: new Date()
  });
  
  // Send notification
  await sendKarmaNotification(userId, amount, metadata);
}
```

### 5.7.3 Karma Payout via Stripe Connect

```typescript
async function requestKarmaPayout(userId: string): Promise<PayoutResult> {
  
  const user = await getUser(userId);
  
  // Minimum R100
  if (user.user_karma_balance < 100) {
    return {
      success: false,
      error: `Minimum payout is R100. Current balance: R${user.user_karma_balance}`
    };
  }
  
  // Check/create Stripe Connect account
  if (!user.user_stripe_connect_account_id) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'ZA',
      email: user.user_email,
      capabilities: {
        transfers: { requested: true }
      }
    });
    
    await updateUser(userId, {
      user_stripe_connect_account_id: account.id
    });
    
    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://assetmanagementuniversity.org/dashboard/referrals',
      return_url: 'https://assetmanagementuniversity.org/dashboard/referrals?setup=complete',
      type: 'account_onboarding'
    });
    
    return {
      success: false,
      requires_setup: true,
      setup_url: accountLink.url,
      message: "Please complete your payout account setup first"
    };
  }
  
  // Process payout
  const payoutAmount = user.user_karma_balance;
  
  const transfer = await stripe.transfers.create({
    amount: payoutAmount * 100,  // Convert to cents
    currency: 'zar',
    destination: user.user_stripe_connect_account_id,
    description: `AMU Referral Karma Payout - ${user.user_name}`
  });
  
  // Deduct from balance
  await firestore.collection('users').doc(userId).update({
    user_karma_balance: 0
  });
  
  // Record transaction
  await firestore.collection('karma_transactions').add({
    transaction_id: generateId('karma'),
    transaction_user_id: userId,
    transaction_amount: -payoutAmount,
    transaction_type: 'payout',
    transaction_stripe_transfer_id: transfer.id,
    transaction_date: new Date()
  });
  
  return {
    success: true,
    amount_paid: payoutAmount,
    message: "Payout initiated! Funds will arrive in 1-3 business days."
  };
}
```

### 5.7.4 Anti-Fraud Measures

```typescript
const ANTI_ABUSE_RULES = {
  SELF_REFERRAL: "Cannot refer yourself",
  ACTUAL_PURCHASE: "Karma only credited after payment clears",
  PATTERN_DETECTION: [
    "Flag if many referrals from same IP",
    "Flag if referrals all purchase same day",
    "Flag if payment method matches referrer"
  ],
  MAX_DEPTH: 2,
  REQUIRE_LEARNING: "Can't buy certificate without completing course"
};

async function detectReferralFraud(userId: string): Promise<FraudCheck> {
  
  const referrals = await getReferrals(userId);
  const flags: FraudFlag[] = [];
  
  // Check 1: Suspicious timing (many purchases in 24h)
  const recentPurchases = referrals.filter(r => 
    r.referral_conversion_date && 
    r.referral_conversion_date > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  
  if (recentPurchases.length > 5) {
    flags.push({
      type: 'suspicious_timing',
      severity: 'medium',
      detail: `${recentPurchases.length} referrals purchased in 24 hours`
    });
  }
  
  // Check 2: Same payment methods
  const referredUserIds = referrals.map(r => r.referral_referred_user_id);
  const paymentMethods = await getPaymentMethods(referredUserIds);
  const duplicates = findDuplicates(paymentMethods);
  
  if (duplicates.length > 2) {
    flags.push({
      type: 'duplicate_payment_methods',
      severity: 'high',
      detail: `${duplicates.length} referrals using same payment method`
    });
  }
  
  // Check 3: Same IP addresses
  const ipAddresses = await getSignupIPs(referredUserIds);
  const sameIPCount = countMostFrequent(ipAddresses);
  
  if (sameIPCount > 3) {
    flags.push({
      type: 'same_ip_signups',
      severity: 'high',
      detail: `${sameIPCount} referrals signed up from same IP`
    });
  }
  
  // Suspend karma if high severity flags
  if (flags.some(f => f.severity === 'high')) {
    await suspendKarma(userId, flags);
  }
  
  return {
    fraud_likely: flags.length > 0,
    flags: flags
  };
}
```

---

## 5.8 Certificate System

### 5.8.1 Certificate Types

```typescript
const CERTIFICATE_TYPES = {
  
  UNOFFICIAL: {
    name: "Unofficial Certificate",
    watermark: true,
    cost: "FREE",
    format: "PDF",
    generation: "Automatic on competency demonstration",
    seta_registered: false,
    
    use_cases: [
      "Personal achievement record",
      "Portfolio demonstration",
      "Informal employer recognition",
      "Motivation to continue learning"
    ],
    
    limitations: [
      "Watermarked 'UNOFFICIAL - FOR PERSONAL USE ONLY'",
      "Not SETA-registered",
      "Not valid for formal qualifications",
      "Not accepted for NQF credits"
    ]
  },
  
  OFFICIAL: {
    name: "Official Certificate",
    watermark: false,
    cost: "Variable (R500-R8,890 depending on course)",
    format: "PDF (digitally signed)",
    generation: "After payment + SETA registration (if applicable)",
    seta_registered: true,
    
    use_cases: [
      "SETA-registered qualification",
      "Formal employer recognition",
      "Job applications",
      "Salary negotiations",
      "Professional development records",
      "NQF credit accumulation"
    ]
  }
};
```

### 5.8.2 Certificate Generation

```typescript
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

async function generateCertificatePDF(
  certificateData: CertificateData
): Promise<Buffer> {
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });
  
  const chunks: Buffer[] = [];
  doc.on('data', chunk => chunks.push(chunk));
  
  // Brand colours
  const AMU_NAVY = '#0A2F5C';
  const AMU_SKY = '#87CEEB';
  
  // Header
  doc.fontSize(24)
     .fillColor(AMU_NAVY)
     .font('Helvetica-Bold')
     .text('ASSET MANAGEMENT UNIVERSITY', { align: 'center' });
  
  doc.fontSize(10)
     .fillColor('#666')
     .font('Helvetica')
     .text('www.assetmanagementuniversity.org', { align: 'center' });
  
  doc.moveDown(2);
  
  // Watermark for unofficial certificates
  if (certificateData.watermark) {
    doc.save();
    doc.fontSize(60)
       .fillColor('#CCCCCC')
       .opacity(0.3)
       .rotate(-45, { origin: [400, 300] })
       .text('UNOFFICIAL - FOR PERSONAL USE ONLY', 100, 250, {
         width: 600,
         align: 'center'
       });
    doc.restore();
  }
  
  // Certificate type indicator
  if (certificateData.seta_registered) {
    doc.rect(250, 100, 300, 60)
       .lineWidth(2)
       .strokeColor(AMU_NAVY)
       .stroke();
    
    doc.fontSize(16)
       .fillColor(AMU_NAVY)
       .font('Helvetica-Bold')
       .text('OFFICIAL SETA CERTIFICATE', 250, 115, {
         width: 300,
         align: 'center'
       });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text('CHIETA REGISTERED', 250, 140, {
         width: 300,
         align: 'center'
       });
  } else {
    doc.fontSize(18)
       .fillColor(AMU_NAVY)
       .font('Helvetica-Bold')
       .text('Certificate of Completion', { align: 'center' });
  }
  
  doc.moveDown(2);
  
  // Main content
  doc.fontSize(12)
     .fillColor('#333')
     .font('Helvetica')
     .text('This certifies that', { align: 'center' });
  
  doc.moveDown();
  
  doc.fontSize(22)
     .fillColor(AMU_NAVY)
     .font('Helvetica-Bold')
     .text(certificateData.learner_name.toUpperCase(), { align: 'center' });
  
  if (certificateData.id_number) {
    doc.fontSize(10)
       .fillColor('#666')
       .font('Helvetica')
       .text(`ID: ${certificateData.id_number}`, { align: 'center' });
  }
  
  doc.moveDown(1.5);
  
  doc.fontSize(12)
     .fillColor('#333')
     .text('has successfully completed', { align: 'center' });
  
  doc.moveDown();
  
  doc.fontSize(16)
     .fillColor(AMU_NAVY)
     .font('Helvetica-Bold')
     .text(certificateData.course_title, { align: 'center' });
  
  doc.moveDown(1.5);
  
  // NQF Information (if applicable)
  if (certificateData.nqf_level) {
    doc.fontSize(11)
       .fillColor('#333')
       .font('Helvetica')
       .text(`NQF Level: ${certificateData.nqf_level}  |  ` +
             `Credits: ${certificateData.credits}  |  ` +
             `Notional Hours: ${certificateData.notional_hours}`,
             { align: 'center' });
    doc.moveDown();
  }
  
  // Competencies
  doc.fontSize(11)
     .fillColor('#333')
     .font('Helvetica-Bold')
     .text('Competencies Demonstrated:', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');
  
  const competencies = certificateData.competencies.slice(0, 4);
  competencies.forEach(comp => {
    doc.text(`✓ ${comp}`, { align: 'center' });
  });
  
  doc.moveDown(1.5);
  
  // Dates and certificate number
  doc.fontSize(10)
     .fillColor('#666')
     .text(`Completion Date: ${formatDate(certificateData.completion_date)}`, 
           { align: 'center' });
  
  doc.text(`Certificate Number: ${certificateData.certificate_code}`, 
           { align: 'center' });
  
  doc.moveDown(2);
  
  // QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(
    `https://assetmanagementuniversity.org/verify/${certificateData.certificate_code}`
  );
  
  doc.image(qrCodeDataUrl, 50, 450, { width: 80 });
  
  // Verification text
  doc.fontSize(9)
     .fillColor('#666')
     .text('Verify this certificate at:', 50, 540)
     .fillColor(AMU_SKY)
     .text(`assetmanagementuniversity.org/verify/${certificateData.certificate_code.substring(0, 20)}...`, 50, 552);
  
  doc.end();
  
  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
```

### 5.8.3 Certificate Verification API

```typescript
// GET /api/verify/{certificate_code}
async function verifyCertificate(
  certificateCode: string
): Promise<VerificationResult> {
  
  const certificate = await firestore
    .collection('certificates')
    .where('certificate_code', '==', certificateCode)
    .get();
  
  if (certificate.empty) {
    return {
      valid: false,
      message: "Certificate not found. Please check the code and try again."
    };
  }
  
  const cert = certificate.docs[0].data();
  
  // Return public information only
  return {
    valid: true,
    certificate_type: cert.certificate_type,
    learner_name: cert.certificate_learner_name,
    course_title: cert.certificate_course_title,
    issue_date: cert.certificate_issue_date,
    seta_registered: cert.certificate_seta_registered,
    nqf_level: cert.certificate_nqf_level,
    credits: cert.certificate_credits,
    competencies_count: cert.certificate_competencies.length
    
    // Don't expose sensitive info:
    // learner_id_number: REDACTED
    // learner_contact: REDACTED
  };
}
```

---

## 5.9 API Endpoints

### 5.9.1 Authentication Endpoints

```
POST /api/auth/register
  Body: { email, password, name, referralCode? }
  Returns: { userId, emailVerificationSent }

POST /api/auth/login
  Body: { email, password }
  Returns: { token, userId }

POST /api/auth/google
  Body: { googleIdToken, referralCode? }
  Returns: { token, userId }

POST /api/auth/forgot-password
  Body: { email }
  Returns: { success }

POST /api/auth/verify-email
  Body: { token }
  Returns: { success }
```

### 5.9.2 Learning Endpoints

```
GET /api/courses
  Returns: Course[]

GET /api/courses/{courseId}
  Returns: Course with modules

POST /api/enrolments
  Body: { courseId }
  Returns: { enrolmentId }

GET /api/enrolments/{enrolmentId}
  Returns: enrolment with progress

POST /api/conversations
  Body: { enrolmentId?, type }
  Returns: { conversationId }

POST /api/conversations/{conversationId}/messages
  Body: { content }
  Returns: { response, conversationId }

GET /api/conversations/{conversationId}/messages
  Returns: Message[]
```

### 5.9.3 Certificate Endpoints

```
GET /api/certificates
  Returns: Certificate[] (user's certificates)

GET /api/certificates/{certificateId}
  Returns: Certificate with PDF URL

POST /api/certificates/{certificateId}/upgrade
  Returns: { paymentIntentClientSecret }

GET /api/verify/{certificateCode}
  Returns: VerificationResult (public)
```

### 5.9.4 Referral Endpoints

```
GET /api/referrals
  Returns: { referralCode, balance, referrals[], transactions[] }

POST /api/referrals/payout
  Returns: { success, amount?, setupUrl? }
```

### 5.9.5 Company Endpoints

```
POST /api/companies
  Body: { name, registrationNumber, taxNumber?, referrerCode? }
  Returns: { companyId, companyCode }

GET /api/companies/{companyId}/dashboard
  Returns: { stats, employees[], certifications[] }

POST /api/companies/{companyId}/invite
  Body: { emails[] }
  Returns: { invitesSent }
```

---

## 5.10 Security Implementation

### 5.10.1 Data Encryption

```typescript
// All data encrypted at rest (Firestore default)
// All data encrypted in transit (TLS 1.3)

// Sensitive fields encrypted at application layer
import { encrypt, decrypt } from './crypto';

const ENCRYPTED_FIELDS = [
  'user_id_number',
  'user_physical_address',
  'stripe_customer_id'
];

async function encryptSensitiveData(user: User): Promise<User> {
  const encrypted = { ...user };
  
  for (const field of ENCRYPTED_FIELDS) {
    if (encrypted[field]) {
      encrypted[field] = await encrypt(encrypted[field]);
    }
  }
  
  return encrypted;
}
```

### 5.10.2 Rate Limiting

```typescript
const RATE_LIMITS = {
  // API calls
  api_general: { requests: 100, window: '1m' },
  api_ai: { requests: 20, window: '1m' },
  
  // Authentication
  login_attempts: { requests: 5, window: '15m' },
  password_reset: { requests: 3, window: '1h' },
  
  // Payments
  payment_attempts: { requests: 10, window: '1h' }
};

async function checkRateLimit(
  key: string, 
  limit: RateLimit
): Promise<boolean> {
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, parseWindow(limit.window));
  }
  
  return current <= limit.requests;
}
```

### 5.10.3 Input Validation

```typescript
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  name: z.string().min(2).max(100),
  referralCode: z.string().optional()
});

const MessageSchema = z.object({
  content: z.string().min(1).max(10000)
});
```

### 5.10.4 POPI Act Compliance

```typescript
// Data minimisation - only collect what's needed
// Purpose limitation - use data only for stated purposes
// Consent management - clear opt-in for marketing

interface PrivacySettings {
  marketing_emails: boolean;
  analytics_tracking: boolean;
  profile_visibility: 'private' | 'company' | 'public';
}

// Right to access
async function exportUserData(userId: string): Promise<UserDataExport> {
  // Compile all user data for download
}

// Right to deletion
async function deleteUserAccount(userId: string): Promise<void> {
  // Anonymise/delete user data per retention policy
}
```

---

## Section 5 Summary

This section provides the complete technical implementation details for AMU:

**Database:**
- Comprehensive Firestore schema with 15+ collections
- Security rules enforcing row-level access
- Support for referral tracking, company management, and karma system

**Authentication:**
- Firebase Auth with email/password and Google Sign-In
- MFA support
- Referral code processing at registration

**AI Integration:**
- Anthropic Claude API patterns
- Intelligent context management (~85% token savings)
- Conversation summarisation
- Error handling and resilience

**Payments:**
- Stripe integration for certificate purchases
- Stripe Connect for referral payouts
- Complete commission tracking (Tier 1 and Tier 2)

**Certificates:**
- PDF generation with watermarking
- Public verification system
- Official upgrade workflow

**Security:**
- Encryption at rest and in transit
- Rate limiting
- Input validation
- POPI Act compliance

This specification is ready for handover to Claude Code for implementation.

---

**End of Section 5**
