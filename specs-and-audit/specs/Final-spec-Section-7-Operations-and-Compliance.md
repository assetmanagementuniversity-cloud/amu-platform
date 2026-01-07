# AMU LMS TECHNICAL SPECIFICATION
## Section 7: Operations and Compliance

**Status:** Development Ready  
**Version:** 1.0  
**Last Updated:** December 2024  
**Document Type:** Technical Specification

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | Claude | Initial compilation from Draft and Final specs with UK English standardisation |

**Related Documents:**
- Section 4: System Architecture and Governance
- Section 5: Technical Implementation
- Section 6: Course Structure and Content Architecture
- Section 8: Implementation Roadmap

---

## Table of Contents

7.1 SETA Registration and Compliance  
7.2 SDL Grants and Tax Benefits  
7.3 POPI Act Compliance  
7.4 Security Implementation  
7.5 Monitoring and Observability  
7.6 Backup and Disaster Recovery  
7.7 Cost Management  
7.8 Support Operations  
7.9 Regulatory Reporting  

---

## 7.1 SETA Registration and Compliance

### 7.1.1 AMU's SETA Registration Strategy

AMU will register as a Skills Development Provider (SDP) with CHIETA (Chemical Industries Education and Training Authority) to offer SETA-registered qualifications.

**Registration Requirements:**
- Company registration (Pty Ltd or NPC)
- Proof of financial viability
- Quality Management System documentation
- Facilitator qualifications and experience
- Learning materials aligned with unit standards
- Assessment tools and moderation processes
- Learner management system capabilities

**AMU's Approach:**
- AI facilitation doesn't replace human facilitators—it augments them
- Muhammad Ali (and future team members) serve as registered assessors
- Claude handles facilitation; humans handle final assessment verification
- Quality assurance through AI-as-learner testing ensures content exceeds standards

### 7.1.2 SETA Registration Workflow for Learners

```
Learner Journey to SETA Registration:

Step 1: Learn (FREE)
├── Complete Knowledge Modules
├── Complete Practical Modules
├── Complete Work Experience
└── Demonstrate all competencies

Step 2: Obtain Official Certificates
├── Pay for certificate (removes watermark)
├── Knowledge Modules: R8,890 (R8,000 with referral)
├── Practical Modules: R8,890 (R8,000 with referral)
└── Work Experience: R2,775 (R2,500 with referral)

Step 3: SETA Registration (Optional)
├── Provide additional documentation:
│   ├── Certified ID copy
│   ├── Proof of residence
│   └── Digital signatures
├── Sign enrolment form
├── Sign tri-party agreement (learner, AMU, workplace)
└── AMU submits to CHIETA

Step 4: EISA (if required)
├── External Integrated Summative Assessment
└── Conducted by QCTO-appointed assessor

Step 5: Qualification Issued
├── CHIETA issues qualification certificate
├── Recorded on National Learner Records Database
└── NQF credits officially recognised
```

### 7.1.3 SETA Registration Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  SETA Registration Progress                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Step 1: Courses Completed                                │
│     • QCTO KM-01: Work Management ✓                          │
│     • QCTO KM-02: Job Planning ✓                             │
│     • [... all modules]                                      │
│                                                              │
│  ✅ Step 2: Documents Uploaded                               │
│     • ID Document: Verified ✓                                │
│     • Proof of Residence: Verified ✓                         │
│                                                              │
│  ✅ Step 3: Payment Completed                                │
│     • Total Paid: R18,500                                    │
│     • Official Certificates Generated ✓                      │
│                                                              │
│  ⏳ Step 4: Digital Signatures                               │
│     • Enrolment Form: [Sign Now]                             │
│     • Tri-party Agreement: [Sign Now]                        │
│                                                              │
│  ⬚ Step 5: SETA Submission                                   │
│     (Awaiting signature completion)                          │
│                                                              │
│  Questions? [Chat with Support]                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 7.1.4 Digital Signature Integration

```typescript
// Using SignRequest (primary) or DocuSign (alternative)

interface SETADocumentPackage {
  registration_id: string;
  learner_id: string;
  documents: {
    enrolment_form: {
      template_id: string;
      fields: {
        learner_name: string;
        id_number: string;
        qualification_title: string;
        provider_name: 'Asset Management University';
        start_date: Date;
      };
      signers: ['learner'];
    };
    triparty_agreement: {
      template_id: string;
      fields: {
        learner_name: string;
        employer_name: string;
        provider_name: 'Asset Management University';
        qualification_title: string;
        workplace_supervisor: string;
      };
      signers: ['learner', 'employer', 'amu_representative'];
    };
  };
}

async function initiateSETASignatures(
  registrationId: string
): Promise<SignatureResult> {
  
  const registration = await getSETARegistration(registrationId);
  const learner = await getUser(registration.registration_user_id);
  
  // Create signature request via SignRequest
  const signRequest = await signRequestClient.createSignRequest({
    template: 'seta_enrolment_form',
    signers: [
      {
        email: learner.user_email,
        first_name: learner.user_name.split(' ')[0],
        last_name: learner.user_name.split(' ').slice(1).join(' ')
      }
    ],
    prefill_tags: [
      { external_id: 'learner_name', text: learner.user_name },
      { external_id: 'id_number', text: learner.user_id_number },
      { external_id: 'qualification', text: registration.qualification_title }
    ]
  });
  
  // Update registration status
  await updateSETARegistration(registrationId, {
    registration_status: 'awaiting_signatures',
    signature_request_id: signRequest.uuid
  });
  
  // Send notification to learner
  await sendEmail(
    learner.user_email,
    'Please Sign Your SETA Enrolment Documents',
    setaSignatureTemplate(signRequest.signing_url)
  );
  
  return { success: true, signing_url: signRequest.signing_url };
}
```

### 7.1.5 SETA Submission Process

```typescript
async function submitToSETA(registrationId: string): Promise<SETASubmissionResult> {
  
  const registration = await getSETARegistration(registrationId);
  
  // Verify all prerequisites
  const checks = {
    courses_complete: registration.all_courses_completed,
    documents_verified: registration.documents_verified,
    payment_complete: registration.payment_status === 'completed',
    signatures_complete: registration.signatures_status === 'completed'
  };
  
  if (!Object.values(checks).every(Boolean)) {
    return {
      success: false,
      error: 'Prerequisites not met',
      missing: Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k, _]) => k)
    };
  }
  
  // Compile submission package
  const submissionPackage = {
    provider_accreditation_number: process.env.CHIETA_PROVIDER_NUMBER,
    qualification_id: registration.qualification_id,
    learner: {
      id_number: registration.learner_id_number,
      name: registration.learner_name,
      contact: registration.learner_contact
    },
    modules_completed: registration.completed_modules,
    evidence_documents: registration.evidence_urls,
    signed_forms: registration.signed_document_urls
  };
  
  // Submit to CHIETA (API or manual upload depending on SETA capabilities)
  // Most SETAs currently require manual portal submission
  
  // Generate submission report for manual upload
  const submissionReport = await generateSETASubmissionReport(submissionPackage);
  
  // Update status
  await updateSETARegistration(registrationId, {
    registration_status: 'submitted_to_seta',
    submission_date: new Date(),
    submission_reference: generateSubmissionReference()
  });
  
  // Notify team for manual submission step
  await notifyTeam('SETA_SUBMISSION_READY', {
    registrationId,
    learnerName: registration.learner_name,
    qualification: registration.qualification_title,
    reportUrl: submissionReport.url
  });
  
  return { success: true, reference: submissionReport.reference };
}
```

---

## 7.2 SDL Grants and Tax Benefits

### 7.2.1 Skills Development Levy Overview

**What is SDL?**
- 1% of payroll paid by employers to SARS
- Distributed to SETAs for skills development
- Companies can claim back up to 70% for qualifying training

**SDL Grant Structure:**
- **Mandatory Grant (20%):** For submitting Workplace Skills Plan (WSP) and Annual Training Report (ATR)
- **Discretionary Grant (up to 50%):** For priority skills training programmes

### 7.2.2 Corporate Value Proposition

```
TRADITIONAL TRAINING vs AMU - COMPLETE COMPARISON

Train 20 Maintenance Planners (CHIETA-Registered Company):

TRADITIONAL PROVIDER:
├── Upfront cost: 20 × R56,000 = R1,120,000
├── SDL Grant (70%): -R784,000
├── Tax deduction (27%): -R302,400
├── Real cost after benefits: R33,600 (R1,680/learner)
├── PLUS: Travel, accommodation, meals
├── Risk: Pay upfront, even if learners don't complete
├── Time: 12 months, during work hours
└── Disruption: High (classroom attendance required)

AMU:
├── Cost: Pay only for completions at R18,500 each
├── Example: 18 learners complete and qualify
├── Total paid: 18 × R18,500 = R333,000
├── SDL Grant (70%): -R233,100
├── Tax deduction (27%): -R89,910
├── Real cost after benefits: R9,990 (R555/learner)
├── PLUS: Zero travel, accommodation, meals
├── Risk: Zero - only pay for successful completions
├── Time: 3-6 months, self-paced, after hours
└── Disruption: Minimal (mobile learning, 24/7 AI facilitator)

SAVINGS:
├── Training cost: 67% cheaper (R555 vs R1,680 per learner)
├── Logistics: 100% savings (no travel/accommodation)
├── Risk: 100% eliminated (pay only for completions)
└── Productivity: No time away from work
```

### 7.2.3 SDL Grant Assistance

AMU assists companies with SDL grant claims:

```typescript
interface SDLGrantAssistance {
  // Documentation AMU provides
  documentation: {
    learner_records: 'Completion certificates with dates';
    attendance_records: 'AI-generated learning activity logs';
    assessment_results: 'Competency achievement records';
    qualification_evidence: 'SETA registration confirmations';
  };
  
  // Report templates
  reports: {
    wsp_contribution: 'Data for Workplace Skills Plan';
    atr_contribution: 'Data for Annual Training Report';
    grant_claim_support: 'Supporting documentation for claims';
  };
  
  // Process
  process: [
    '1. Company completes training via AMU',
    '2. AMU provides learner records and completion data',
    '3. Company includes in WSP/ATR submission',
    '4. Company submits SDL grant claim to SETA',
    '5. SETA verifies with AMU (registered provider)',
    '6. Grant disbursed to company'
  ];
}
```

### 7.2.4 Tax Benefits

**Section 12H Tax Incentive:**
- Additional tax deduction for registered learnerships
- R40,000 per learner (disabled: R60,000) over learnership period
- R20,000 on commencement, R20,000 on completion

**Standard Training Deduction:**
- Training costs deductible as business expense
- 27% corporate tax rate = 27% effective saving

**Combined Benefit Calculation:**

```
For CHIETA Company Training 1 Employee:

AMU Certification Cost: R18,500

Tax Benefits:
├── SDL Grant (70%): R12,950
├── Tax Deduction (27% of R18,500): R4,995
└── Total Benefits: R17,945

Real Cost to Company: R555 per qualified learner

Note: Section 12H learnership incentive may apply additionally
if formal learnership agreement signed (R40,000 over term)
```

### 7.2.5 Critical Verification Required

**UNVERIFIED ASSUMPTION:**

AMU's business model assumes companies can claim SDL grants for employees who complete qualifications via RPL (Recognition of Prior Learning) pathway, without formal learnership agreements signed upfront.

**Verification Steps Required:**

1. **Contact CHIETA Directly:**
   - Ask: "Can companies claim discretionary grants for employees who complete occupational qualifications via RPL pathway, without formal learnership agreements signed at commencement?"

2. **Contact QCTO:**
   - Confirm RPL pathway recognition for grant purposes

3. **Consult SDL Grant Specialists:**
   - Ask: "Do clients successfully claim grants for RPL certifications without learnerships?"

**Potential Outcomes:**

| Scenario | Impact | Response |
|----------|--------|----------|
| RPL grants work without learnerships | ✅ Model works as designed | Proceed with current approach |
| RPL grants require learnerships | ⚠️ Must offer optional learnership pathway | Design learnership option |
| Discretionary grants available | ✅ Alternative pathway exists | May be lower percentage |

**Status:** UNVERIFIED - Requires investigation before MVP launch

---

## 7.3 POPI Act Compliance

### 7.3.1 POPI Overview

The Protection of Personal Information Act (POPIA) is South Africa's data protection law, similar to GDPR.

**Eight Conditions for Lawful Processing:**

| Condition | Requirement | AMU Implementation |
|-----------|-------------|-------------------|
| 1. Accountability | Organisation responsible for compliance | Information Officer designated |
| 2. Processing Limitation | Process lawfully, with consent, for specific purpose | Clear consent checkboxes, separate marketing consent |
| 3. Purpose Specification | Collect for specific, lawful purpose | Purposes stated in privacy policy |
| 4. Further Processing | Compatible with original purpose | No selling of data, anonymised analytics |
| 5. Information Quality | Data must be accurate and up to date | Users can update profile anytime |
| 6. Openness | Transparent about data processing | Privacy policy in clear language |
| 7. Security Safeguards | Secure against loss, damage, unauthorised access | Encryption, access controls, audits |
| 8. Data Subject Participation | Rights to access, correct, delete | Privacy dashboard, export, deletion |

### 7.3.2 Data Collection by Tier

```typescript
const DATA_COLLECTION_BY_TIER = {
  
  ANONYMOUS: {
    collected: [
      'Session ID (anonymous)',
      'Browser/device info (for compatibility)',
      'Page visits (analytics)'
    ],
    not_collected: [
      'Name',
      'Email',
      'Any personal information'
    ],
    purpose: 'Platform improvement only'
  },
  
  AUTHENTICATED: {
    collected: [
      'Name',
      'Email',
      'Preferred language',
      'Workplace context (optional)',
      'Learning progress',
      'Conversation history'
    ],
    not_collected: [
      'ID number',
      'Physical address',
      'Phone number (unless provided)'
    ],
    purpose: 'Educational services, progress tracking'
  },
  
  SETA_REGISTERED: {
    collected: [
      'All Tier 2 data',
      'ID number (SETA requirement)',
      'Physical address (SETA requirement)',
      'Phone number',
      'Employer details',
      'Signed documents'
    ],
    purpose: 'SETA registration and qualification issuance',
    retention: '7 years (regulatory requirement)'
  }
};
```

### 7.3.3 Privacy Dashboard

```typescript
interface PrivacyDashboard {
  // What data AMU holds
  data_collected: {
    personal_info: {
      name: string;
      email: string;
      phone?: string;
      id_number?: string;     // Encrypted, shown as ****
      address?: string;
    };
    
    learning_data: {
      enrollments: number;
      conversations: number;
      assignments: number;
      certificates: number;
    };
    
    usage_data: {
      login_history: LoginRecord[];
      device_info: DeviceInfo[];
      ip_addresses: string[];  // Last 10
    };
  };
  
  // How data is processed
  data_processing: {
    purposes: string[];
    third_parties: string[];  // e.g., "CHIETA (for SETA certification)"
    retention_period: string;
  };
  
  // User rights
  your_rights: {
    export_data: () => Promise<DataExport>;
    correct_data: () => void;  // Links to profile edit
    delete_account: () => Promise<void>;
    opt_out_marketing: () => Promise<void>;
  };
  
  // Consent history
  consent_history: ConsentRecord[];
}
```

### 7.3.4 Data Export (POPI Right)

```typescript
async function exportUserData(userId: string): Promise<Buffer> {
  
  const user = await getUser(userId);
  const enrollments = await getUserEnrollments(userId);
  const conversations = await getUserConversations(userId);
  const certificates = await getUserCertificates(userId);
  const payments = await getUserPayments(userId);
  
  const exportData = {
    exported_date: new Date().toISOString(),
    user_profile: {
      ...user,
      // Redact sensitive fields for security
      user_id_number: user.user_id_number ? '****' + user.user_id_number.slice(-4) : null
    },
    enrollments: enrollments,
    conversations: conversations.map(c => ({
      ...c,
      // Include only user messages (not system prompts)
      messages: c.messages.filter(m => m.role === 'user' || m.role === 'assistant')
    })),
    certificates: certificates,
    payments: payments.map(p => ({
      payment_id: p.payment_id,
      payment_date: p.payment_date,
      payment_amount: p.payment_amount,
      payment_type: p.payment_type
      // Redact full payment details
    }))
  };
  
  const json = JSON.stringify(exportData, null, 2);
  
  // Send download link
  await sendEmail(
    user.user_email,
    'Your AMU Data Export',
    `Your data export is ready. This link expires in 24 hours.\n\n[Download Data]`
  );
  
  return Buffer.from(json);
}
```

### 7.3.5 Account Deletion (Right to be Forgotten)

```typescript
async function deleteUserAccount(userId: string): Promise<DeleteResult> {
  
  const user = await getUser(userId);
  
  // Check for SETA registrations (regulatory retention required)
  const setaRegistrations = await getSETARegistrations(userId);
  
  if (setaRegistrations.some(r => r.registration_status !== 'completed')) {
    return {
      success: false,
      error: 'Cannot delete account with pending SETA registrations.'
    };
  }
  
  if (setaRegistrations.length > 0) {
    // SETA records must be retained for 7 years
    // Anonymise instead of delete
    await anonymiseAccount(userId);
    return {
      success: true,
      method: 'anonymised',
      message: 'Account anonymised. SETA records retained for compliance (7 years).'
    };
  }
  
  // Full deletion for users without SETA registrations
  await deleteUserCompletely(userId);
  return {
    success: true,
    method: 'deleted',
    message: 'Account and all data permanently deleted.'
  };
}

async function anonymiseAccount(userId: string): Promise<void> {
  await firestore.collection('users').doc(userId).update({
    user_name: 'Anonymous User',
    user_email: `deleted_${userId}@anonymised.amu`,
    user_phone_number: null,
    user_id_number: null,
    user_address: null,
    user_account_status: 'deleted',
    user_deleted_date: new Date()
  });
  
  // Delete Firebase Auth account
  await admin.auth().deleteUser(userId);
}
```

### 7.3.6 Data Breach Response

```typescript
const DATA_BREACH_RESPONSE = {
  
  detection: {
    automated: [
      'Failed login attempts > 5',
      'Unusual data access patterns',
      'Error rate spike',
      'Anomalous API usage'
    ],
    manual: [
      'User report of unauthorised access',
      'Vulnerability disclosure',
      'Security audit finding'
    ]
  },
  
  classification: {
    P0_CRITICAL: {
      examples: ['Data breach (PII exposed)', 'System compromise'],
      response_time: 'Immediate',
      notification: 'All stakeholders + Information Regulator within 72 hours'
    },
    P1_HIGH: {
      examples: ['Attempted unauthorised access', 'Payment fraud'],
      response_time: 'Within 1 hour',
      notification: 'Management + affected users'
    },
    P2_MEDIUM: {
      examples: ['Suspicious login patterns', 'Potential vulnerability'],
      response_time: 'Within 4 hours',
      notification: 'Management'
    }
  },
  
  response_steps: [
    '1. CONTAIN: Isolate affected systems',
    '2. ASSESS: Determine scope and impact',
    '3. ERADICATE: Remove threat',
    '4. RECOVER: Restore normal operations',
    '5. NOTIFY: Inform affected parties and regulator',
    '6. LEARN: Post-incident review and improvements'
  ],
  
  regulator_notification: {
    authority: 'Information Regulator',
    deadline: '72 hours from discovery',
    required_info: [
      'Nature of breach',
      'Categories of data affected',
      'Number of data subjects affected',
      'Consequences of breach',
      'Measures taken'
    ]
  }
};
```

---

## 7.4 Security Implementation

### 7.4.1 Security Principles

```typescript
const SECURITY_PRINCIPLES = {
  
  DATA_MINIMISATION: {
    principle: 'Collect only what is necessary',
    implementation: [
      'Tier 1: Name and email only',
      'Tier 2: Add language and workplace context',
      'Tier 3: Add ID, address (SETA requirement only)',
      'Never collect: race, religion, political affiliation, health, biometrics'
    ]
  },
  
  TRANSPARENCY: {
    principle: 'Learners know what data we have and why',
    implementation: [
      'Clear data collection notices',
      'Privacy dashboard showing all data',
      'Export capability (POPI right)',
      'Deletion capability (right to be forgotten)'
    ]
  },
  
  PURPOSE_LIMITATION: {
    principle: 'Use data only for stated educational purposes',
    implementation: [
      'NO selling of data',
      'NO marketing beyond educational content (without consent)',
      'NO sharing with third parties (except SETA)',
      'Analytics aggregated and anonymised'
    ]
  },
  
  SECURITY_BY_DESIGN: {
    principle: 'Security embedded, not added later',
    implementation: [
      'Encryption at rest and in transit',
      'Least-privilege access control',
      'Regular security audits',
      'Incident response procedures'
    ]
  }
};
```

### 7.4.2 Encryption

```typescript
const ENCRYPTION_STANDARDS = {
  
  IN_TRANSIT: {
    protocol: 'TLS 1.3',
    certificate: "Let's Encrypt (auto-renewed)",
    grade_target: 'A+ (SSL Labs)'
  },
  
  AT_REST: {
    firestore: 'Automatic encryption (Google-managed keys)',
    cloud_storage: 'Automatic encryption (Google-managed keys)',
    
    sensitive_fields: {
      method: 'Application-level encryption (AES-256)',
      fields: [
        'user_id_number',
        'user_phone_number',
        'seta_registration_documents'
      ],
      key_management: 'Google Cloud KMS'
    }
  }
};

// Encrypt sensitive field
async function encryptSensitiveField(plaintext: string): Promise<string> {
  const kms = new KeyManagementServiceClient();
  const keyName = kms.cryptoKeyPath(
    'amu-production',
    'global',
    'amu-keyring',
    'sensitive-data-key'
  );
  
  const [encryptResponse] = await kms.encrypt({
    name: keyName,
    plaintext: Buffer.from(plaintext)
  });
  
  return encryptResponse.ciphertext.toString('base64');
}
```

### 7.4.3 Access Control

```typescript
// Firestore Security Rules
const SECURITY_RULES = `
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
    
    function isTeamMember() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/team_members/$(request.auth.uid))
          .data.active == true;
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false;  // Deletion via Cloud Function only
    }
    
    // Courses are public
    match /courses/{courseId} {
      allow read: if true;
      allow write: if false;  // Admin only via Cloud Functions
    }
    
    // Enrollments are user-specific
    match /enrollments/{enrollmentId} {
      allow read: if isOwner(resource.data.enrollment_user_id);
      allow write: if false;  // Managed via Cloud Functions
    }
    
    // Conversations are strictly private
    match /conversations/{conversationId} {
      allow read: if isOwner(resource.data.conversation_user_id);
      allow write: if false;
      
      match /messages/{messageId} {
        allow read: if isOwner(
          get(/databases/$(database)/documents/conversations/$(conversationId))
            .data.conversation_user_id
        );
        allow write: if false;
      }
    }
    
    // Certificates allow public verification
    match /certificates/{certificateId} {
      allow read: if isOwner(resource.data.certificate_user_id);
      // Public verification by code handled via Cloud Function
    }
    
    // Team-only collections
    match /audit_logs/{logId} {
      allow read: if isTeamMember();
      allow write: if false;
    }
  }
}
`;
```

### 7.4.4 Authentication Security

```typescript
const AUTHENTICATION_SECURITY = {
  
  password_requirements: {
    min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_special: false,  // Reduces friction without major security impact
    max_age_days: null       // No forced rotation (per NIST guidelines)
  },
  
  rate_limiting: {
    login_attempts: { max: 5, window: '15 minutes' },
    password_reset: { max: 3, window: '1 hour' },
    api_calls: { max: 100, window: '1 minute' }
  },
  
  session_management: {
    token_type: 'JWT (Firebase)',
    expiry: '1 hour',
    refresh: 'Automatic via Firebase SDK',
    revocation: 'On logout, password change, or security event'
  },
  
  mfa: {
    available: true,
    methods: ['SMS', 'Authenticator app'],
    required_for: ['Team members'],
    optional_for: ['All users']
  }
};
```

---

## 7.5 Monitoring and Observability

### 7.5.1 Health Checks

```typescript
// Health check endpoint: /api/health
async function healthCheck(): Promise<HealthStatus> {
  
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    
    components: {
      firestore: 'unknown',
      cloud_storage: 'unknown',
      anthropic_api: 'unknown',
      stripe_api: 'unknown'
    }
  };
  
  // Check Firestore
  try {
    await firestore.collection('_health').doc('check').get();
    health.components.firestore = 'healthy';
  } catch (error) {
    health.components.firestore = 'unhealthy';
    health.status = 'degraded';
  }
  
  // Check Anthropic API
  try {
    await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }]
    });
    health.components.anthropic_api = 'healthy';
  } catch (error) {
    health.components.anthropic_api = 'unhealthy';
    health.status = 'degraded';
  }
  
  // Check Stripe
  try {
    await stripe.balance.retrieve();
    health.components.stripe_api = 'healthy';
  } catch (error) {
    health.components.stripe_api = 'unhealthy';
    // Stripe down doesn't degrade learning - just payments
  }
  
  return health;
}
```

### 7.5.2 Logging Strategy

```typescript
const LOGGING_STRATEGY = {
  
  APPLICATION_LOGS: {
    what: 'Application events, errors, warnings',
    where: 'Cloud Logging (Google Cloud)',
    retention: '30 days',
    
    levels: {
      DEBUG: 'Development only',
      INFO: 'Normal operations',
      WARN: 'Potential issues',
      ERROR: 'Failures requiring attention',
      CRITICAL: 'System-threatening issues'
    }
  },
  
  AUDIT_LOGS: {
    what: 'Security-relevant events',
    where: 'Cloud Logging (separate log, immutable)',
    retention: '7 years (compliance)',
    
    events: [
      'User login/logout',
      'Account creation/deletion',
      'Data access (PII)',
      'Permission changes',
      'Payment transactions',
      'SETA registration actions',
      'Certificate issuance'
    ]
  },
  
  CONVERSATION_LOGS: {
    what: 'Learning conversations (educational data)',
    where: 'Firestore (conversations collection)',
    retention: 'Indefinite (educational value)',
    privacy: 'User can export/delete'
  }
};

// Structured logging
function logInfo(message: string, metadata?: Record<string, any>) {
  console.log(JSON.stringify({
    severity: 'INFO',
    message: message,
    timestamp: new Date().toISOString(),
    ...metadata
  }));
}

function logError(error: Error, context?: Record<string, any>) {
  console.error(JSON.stringify({
    severity: 'ERROR',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  }));
}

// Audit logging
async function logAuditEvent(event: AuditEvent): Promise<void> {
  await firestore.collection('audit_logs').add({
    event_type: event.type,
    event_user_id: event.userId,
    event_action: event.action,
    event_resource: event.resource,
    event_timestamp: new Date(),
    event_ip_address: event.ipAddress,
    event_user_agent: event.userAgent,
    event_result: event.result
  });
}
```

### 7.5.3 Alerting Rules

```typescript
const ALERTING_RULES = {
  
  CRITICAL_ALERTS: {
    triggers: [
      'Error rate > 5%',
      'Response time > 10s (p99)',
      'Health check fails 3 times',
      'Anthropic API quota exceeded',
      'Payment processing fails > 3 times',
      'Security incident detected'
    ],
    
    notification: {
      channels: ['SMS', 'Email', 'Slack'],
      recipients: ['board_members'],
      escalation: 'Call after 15 minutes if not acknowledged'
    }
  },
  
  WARNING_ALERTS: {
    triggers: [
      'Error rate > 1%',
      'Response time > 5s (p99)',
      'Disk usage > 80%',
      'Token usage 80% of quota',
      'Cost spike (20% above average)',
      '10+ learners in attention queue'
    ],
    
    notification: {
      channels: ['Email', 'Slack'],
      recipients: ['team_members']
    }
  },
  
  INFO_ALERTS: {
    triggers: [
      'Daily summary',
      'Weekly report',
      'New user milestone (100, 1000, 10000)',
      'Revenue milestone'
    ],
    
    notification: {
      channels: ['Email'],
      recipients: ['founder']
    }
  }
};
```

### 7.5.4 Performance Monitoring

```typescript
const PERFORMANCE_METRICS = {
  
  RESPONSE_TIMES: {
    target: {
      p50: '< 500ms',
      p95: '< 2s',
      p99: '< 5s'
    },
    
    measure: [
      'Page load time',
      'API response time',
      'Claude API latency',
      'Database query time'
    ]
  },
  
  AVAILABILITY: {
    target: '99.5% uptime',  // ~3.6 hours downtime per month
    calculate: 'Successful requests / Total requests',
    exclude: 'Planned maintenance windows'
  },
  
  SCALABILITY: {
    measure: [
      'Requests per second',
      'Concurrent users',
      'Database operations per second',
      'Token usage per hour'
    ],
    
    load_test: 'Quarterly (simulate 2x expected traffic)'
  }
};
```

### 7.5.5 Business Metrics Dashboard

```typescript
interface DashboardMetrics {
  // Real-time metrics (updated every 5 minutes)
  realtime: {
    active_conversations: number;
    users_online: number;
    certificates_issued_today: number;
    tokens_used_last_hour: number;
    cost_last_hour: number;
    average_response_time: number;
    error_rate: number;
    learners_needing_attention: number;
  };
  
  // Daily metrics
  daily: {
    new_users: number;
    active_learners: number;
    messages_sent: number;
    competencies_achieved: number;
    certificates_issued: number;
    revenue: number;
    ai_cost: number;
  };
  
  // Weekly report
  weekly: {
    user_growth: number;
    revenue_growth: number;
    completion_rate: number;
    average_satisfaction: number;
    top_courses: CourseStats[];
    learners_stuck: LearnerAlert[];
  };
}

// Generate dashboard metrics every 5 minutes
export const generateDashboardMetrics = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    
    const metrics = {
      timestamp: new Date(),
      active_conversations: await countActiveConversations(),
      users_online: await countOnlineUsers(),
      certificates_issued_today: await countCertificatesToday(),
      tokens_used_last_hour: await getTokensLastHour(),
      cost_last_hour: await getCostLastHour(),
      average_response_time: await getAverageResponseTime(),
      error_rate: await getErrorRate(),
      learners_needing_attention: await countLearnersNeedingAttention()
    };
    
    await firestore.collection('dashboard_metrics').add(metrics);
    
    // Alert if issues
    if (metrics.error_rate > 0.05) {
      await alertTeam('High error rate detected', metrics);
    }
    
    if (metrics.learners_needing_attention > 10) {
      await alertTeam('10+ learners need attention', metrics);
    }
  });
```

---

## 7.6 Backup and Disaster Recovery

### 7.6.1 Backup Strategy

```typescript
const BACKUP_STRATEGY = {
  
  FIRESTORE: {
    method: 'Automated daily exports',
    schedule: '02:00 SAST daily',
    destination: 'gs://amu-backups-production/firestore-backups/',
    retention: '30 days',
    verification: 'Weekly restore test'
  },
  
  CLOUD_STORAGE: {
    method: 'Object versioning enabled',
    retention: '30 versions per object',
    soft_delete: '7 days recovery window',
    cross_region: 'Replicated to europe-west1'
  },
  
  CODE: {
    method: 'GitHub',
    protection: 'Branch protection on main',
    recovery: 'Clone from any commit'
  },
  
  INFRASTRUCTURE: {
    method: 'Terraform in GitHub',
    recovery: 'terraform apply recreates everything',
    secrets: 'Google Secret Manager (backed up separately)'
  }
};

// Automated Firestore backup
export const backupFirestore = functions.pubsub
  .schedule('every day 02:00')
  .timeZone('Africa/Johannesburg')
  .onRun(async (context) => {
    
    const projectId = process.env.GCP_PROJECT;
    const bucket = 'amu-backups-production';
    const timestamp = new Date().toISOString().split('T')[0];
    
    const client = new FirestoreAdminClient();
    const databaseName = client.databasePath(projectId, '(default)');
    
    const [operation] = await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: `gs://${bucket}/firestore-backups/${timestamp}`,
      collectionIds: []  // Export all collections
    });
    
    await operation.promise();
    
    // Delete backups older than 30 days
    await deleteOldBackups(bucket, 'firestore-backups/', 30);
    
    logInfo('Firestore backup completed', { timestamp });
  });
```

### 7.6.2 Disaster Recovery Procedures

```typescript
const DISASTER_RECOVERY = {
  
  RTO: '4 hours',  // Recovery Time Objective
  RPO: '24 hours', // Recovery Point Objective (max data loss)
  
  scenarios: {
    
    CLOUD_RUN_OUTAGE: {
      issue: 'Primary region (Johannesburg) unavailable',
      impact: 'Platform inaccessible',
      recovery: [
        '1. Cloud Run auto-fails to healthy instances',
        '2. If region-wide: Deploy to europe-west1 (Belgium)',
        '3. Update DNS to point to backup region',
        '4. Verify services operational'
      ],
      rto: '15 minutes (auto) / 1 hour (manual)'
    },
    
    DATABASE_CORRUPTION: {
      issue: 'Firestore data corrupted or deleted',
      impact: 'Data loss, platform dysfunction',
      recovery: [
        '1. Identify corruption scope',
        '2. Restore from yesterday backup',
        '3. Replay transactions from backup to now (if available)',
        '4. Validate data integrity'
      ],
      rto: '4 hours',
      rpo: '24 hours max data loss'
    },
    
    SECURITY_BREACH: {
      issue: 'Unauthorised access to systems',
      impact: 'Potential data exposure',
      recovery: [
        '1. Shut down affected services immediately',
        '2. Assess breach scope',
        '3. Rotate all credentials',
        '4. Patch vulnerability',
        '5. Restore from clean backup if needed',
        '6. Notify affected users + regulator'
      ],
      rto: 'Varies (security > speed)'
    },
    
    ANTHROPIC_API_OUTAGE: {
      issue: 'Claude API unavailable',
      impact: 'Learning conversations fail',
      recovery: [
        '1. Queue incoming messages',
        '2. Display friendly "temporarily unavailable" message',
        '3. Monitor Anthropic status page',
        '4. Process queue when restored'
      ],
      rto: 'Dependent on Anthropic'
    }
  }
};
```

---

## 7.7 Cost Management

### 7.7.1 Cost Structure

```typescript
// Estimated for 1,000 active learners
const MONTHLY_COST_STRUCTURE = {
  
  GOOGLE_CLOUD: {
    cloud_run: {
      description: 'Frontend hosting',
      estimate: 'R1,500/month'
    },
    cloud_functions: {
      description: 'Backend processing',
      estimate: 'R1,000/month'
    },
    firestore: {
      description: 'Database (reads/writes/storage)',
      estimate: 'R2,000/month'
    },
    cloud_storage: {
      description: 'Files (certificates, uploads)',
      estimate: 'R500/month'
    },
    subtotal: 'R5,000/month'
  },
  
  AI_SERVICES: {
    anthropic_api: {
      description: 'Claude API calls',
      estimate: 'R20,000/month',
      calculation: '1,000 learners × R20/learner average'
    },
    subtotal: 'R20,000/month'
  },
  
  THIRD_PARTY: {
    sendgrid: {
      description: 'Transactional email',
      estimate: 'R800/month'
    },
    mailchimp: {
      description: 'Marketing email',
      estimate: 'R500/month'
    },
    signrequest: {
      description: 'Digital signatures',
      estimate: 'R400/month'
    },
    stripe: {
      description: 'Payment processing',
      estimate: '2.9% + R2 per transaction'
    },
    subtotal: 'R1,700/month + payment fees'
  },
  
  ACCOUNTING: {
    xero: {
      description: 'Accounting software',
      estimate: 'R600/month'
    }
  },
  
  TOTAL_ESTIMATE: 'R27,300/month for 1,000 active learners',
  COST_PER_LEARNER: 'R27.30/month'
};
```

### 7.7.2 Cost Optimisation Strategies

```typescript
const COST_OPTIMISATION = {
  
  AI_COSTS: {
    strategy: 'Context summarisation caching',
    description: 'Summarise conversation history instead of sending full context',
    savings: '~70% reduction in token usage',
    implementation: 'Conversation summaries generated every 10 messages'
  },
  
  COMPUTE_COSTS: {
    strategy: 'Auto-scaling with minimum instances',
    description: 'Scale to zero during low traffic, scale up during peaks',
    implementation: 'Cloud Run min instances = 1, max = 100'
  },
  
  STORAGE_COSTS: {
    strategy: 'Lifecycle policies',
    description: 'Move old data to cheaper storage classes',
    implementation: 'Nearline after 30 days, Coldline after 90 days'
  },
  
  DATABASE_COSTS: {
    strategy: 'Efficient query patterns',
    description: 'Indexed queries, denormalisation, pagination',
    implementation: 'Composite indexes, limit query results'
  }
};
```

### 7.7.3 Cost Monitoring

```typescript
// Daily cost alert if spending exceeds threshold
export const monitorCosts = functions.pubsub
  .schedule('every day 08:00')
  .timeZone('Africa/Johannesburg')
  .onRun(async (context) => {
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const costs = await getBillingData(yesterday);
    const averageDailyCost = await getAverageDailyCost(30);
    
    // Alert if cost spike
    if (costs.total > averageDailyCost * 1.2) {
      await alertTeam('Cost spike detected', {
        yesterday_cost: costs.total,
        average_cost: averageDailyCost,
        increase_percent: ((costs.total - averageDailyCost) / averageDailyCost * 100).toFixed(1)
      });
    }
    
    // Store for trending
    await firestore.collection('cost_tracking').add({
      date: yesterday,
      costs: costs,
      learner_count: await countActiveLearners()
    });
  });
```

---

## 7.8 Support Operations

### 7.8.1 Support Tiers

```typescript
const SUPPORT_TIERS = {
  
  TIER_1_AUTOMATED: {
    handler: 'Claude',
    scope: [
      'FAQ responses',
      'Account questions',
      'Course information',
      'Certificate status',
      'Payment inquiries',
      'Technical troubleshooting'
    ],
    response_time: 'Immediate',
    escalation: 'If unresolved after 3 exchanges'
  },
  
  TIER_2_ESCALATED: {
    handler: 'Claude with human oversight',
    scope: [
      'Complex account issues',
      'Payment disputes',
      'SETA registration questions',
      'Complaints',
      'Appeals'
    ],
    response_time: '24 hours',
    escalation: 'To board if unresolved or sensitive'
  },
  
  TIER_3_EXECUTIVE: {
    handler: 'Board members',
    scope: [
      'Legal matters',
      'Serious complaints',
      'Media inquiries',
      'Partnership discussions',
      'Policy exceptions'
    ],
    response_time: '48 hours',
    escalation: 'N/A'
  }
};
```

### 7.8.2 Support Channels

```typescript
const SUPPORT_CHANNELS = {
  
  IN_APP_CHAT: {
    description: 'Primary support channel',
    handler: 'Claude (immediate)',
    hours: '24/7',
    capabilities: [
      'Real-time conversation',
      'Context-aware (knows learner history)',
      'Can take actions (check status, generate reports)'
    ]
  },
  
  EMAIL: {
    address: 'administrator@assetmanagementuniversity.org',
    handler: 'Claude (processes), human (reviews if needed)',
    response_time: '24 hours',
    capabilities: [
      'Formal documentation',
      'Attachment handling',
      'Thread tracking'
    ]
  },
  
  HELP_CENTRE: {
    url: 'help.assetmanagementuniversity.org',
    content: [
      'Getting started guides',
      'FAQ database',
      'Video tutorials',
      'Troubleshooting guides'
    ],
    maintenance: 'Claude updates based on common questions'
  }
};
```

---

## 7.9 Regulatory Reporting

### 7.9.1 SETA Reporting Requirements

```typescript
const SETA_REPORTING = {
  
  QUARTERLY_REPORT: {
    due: 'End of each quarter',
    contents: [
      'Active learner count',
      'Completions by qualification',
      'Pass/fail rates',
      'Workplace-based learning hours',
      'Assessor utilisation'
    ],
    submission: 'Via SETA portal or email'
  },
  
  ANNUAL_TRAINING_REPORT: {
    due: '30 April annually',
    contents: [
      'Total learners trained',
      'Qualifications issued',
      'Demographic breakdown',
      'Industry sector analysis',
      'Quality assurance activities'
    ],
    submission: 'Via SETA portal'
  },
  
  MODERATION_RECORDS: {
    frequency: 'Per assessment',
    contents: [
      'Assessment tools used',
      'Learner evidence',
      'Assessor decisions',
      'Moderation outcomes'
    ],
    retention: '7 years'
  }
};
```

### 7.9.2 Tax Compliance

```typescript
const TAX_COMPLIANCE = {
  
  VAT: {
    registration_threshold: 'R1,000,000 annual turnover',
    rate: '15%',
    filing: 'Monthly (if registered)',
    note: 'Educational services may be exempt - verify with SARS'
  },
  
  PAYE: {
    applicability: 'If AMU has employees',
    filing: 'Monthly',
    handled_by: 'Xero payroll integration'
  },
  
  CORPORATE_TAX: {
    rate: '27%',
    filing: 'Annual',
    prepared_by: 'Claude (draft), accountant (review)'
  },
  
  SDL: {
    rate: '1% of payroll',
    filing: 'Monthly with PAYE',
    note: 'AMU pays as employer, can claim for own staff training'
  }
};
```

### 7.9.3 B-BBEE Compliance

```typescript
const BBBEE_COMPLIANCE = {
  
  RELEVANCE: 'Required for corporate clients in regulated sectors',
  
  ELEMENTS: {
    ownership: 'AMU ownership structure',
    management_control: 'Board composition',
    skills_development: 'Training provided (our core business)',
    enterprise_development: 'Support for small businesses',
    socio_economic_development: 'Free education for individuals'
  },
  
  VERIFICATION: {
    frequency: 'Annual',
    agency: 'Accredited B-BBEE verification agency',
    certificate_validity: '12 months'
  },
  
  AMU_ADVANTAGE: 'Our free education model directly supports transformation goals'
};
```

---

## Section 7 Summary

This section establishes AMU's complete operations and compliance framework:

**SETA Registration:**
- Registration as Skills Development Provider with CHIETA
- Complete learner registration workflow
- Digital signature integration (SignRequest/DocuSign)
- SETA submission process

**SDL and Tax Benefits:**
- Corporate value proposition (R555 real cost per learner after benefits)
- SDL grant assistance for companies
- Tax benefit calculations
- Critical verification required for RPL/grant eligibility

**POPI Compliance:**
- Eight conditions for lawful processing
- Data collection by tier
- Privacy dashboard
- Data export and deletion rights
- Breach response procedures

**Security:**
- Encryption (in transit and at rest)
- Access control (Firestore security rules)
- Authentication security (passwords, rate limiting, MFA)

**Monitoring:**
- Health checks
- Structured logging and audit trails
- Alerting rules (critical, warning, info)
- Performance monitoring
- Business metrics dashboard

**Backup and Recovery:**
- Daily Firestore backups
- 30-day retention
- Disaster recovery procedures
- RTO: 4 hours, RPO: 24 hours

**Cost Management:**
- Cost structure (~R27/learner/month)
- Optimisation strategies
- Daily cost monitoring

**Support Operations:**
- Three-tier support model
- Claude as primary support agent
- Multiple channels (chat, email, help centre)

**Regulatory Reporting:**
- SETA quarterly and annual reports
- Tax compliance (VAT, PAYE, corporate tax)
- B-BBEE verification

---

**End of Section 7**
