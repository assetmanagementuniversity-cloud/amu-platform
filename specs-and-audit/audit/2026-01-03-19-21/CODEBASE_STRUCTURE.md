# AMU-Platform Codebase Structure

## Directory Organization

```
C:\Users\marah\Documents\AMU-Platform/
├── apps/                              # Application packages
│   ├── api/                           # Backend API (Express.js)
│   │   └── src/
│   │       ├── index.ts               # API server entry point
│   │       ├── middleware/
│   │       │   ├── auth.ts            # Firebase Auth + role validation
│   │       │   ├── error-handler.ts   # Error response standardization
│   │       │   ├── rate-limit.ts      # Auth & AI endpoint protection
│   │       │   └── request-logger.ts  # Request/response logging
│   │       └── routes/                # API endpoint definitions
│   │           ├── auth.ts            # Registration, login, profile
│   │           ├── courses.ts         # Browse courses & modules
│   │           ├── enrolments.ts      # Manage course enrolments
│   │           ├── conversations.ts   # AI facilitation endpoints
│   │           ├── certificates.ts    # Generate & verify certificates
│   │           ├── content-feedback.ts # Content improvement tracking
│   │           ├── verification.ts    # Identity verification
│   │           ├── split-tests.ts     # A/B testing endpoints
│   │           ├── payments.ts        # Financial workflows
│   │           ├── search.ts          # Natural language search
│   │           ├── team.ts            # Team autonomy & tasks
│   │           └── marketing.ts       # Marketing intelligence
│   │
│   └── web/                           # Frontend (Next.js + React)
│       └── src/
│           ├── app/                   # Next.js app directory
│           │   ├── (auth)/            # Auth pages: login, register
│           │   ├── (dashboard)/       # Authenticated dashboard
│           │   │   ├── learn/         # Course learning interface
│           │   │   ├── admin/         # Admin panels
│           │   │   ├── organisation/  # Organization management
│           │   │   ├── settings/      # User settings
│           │   │   ├── referrals/     # Referral program
│           │   │   └── courses/       # Course browsing
│           │   ├── (public)/          # Public pages
│           │   ├── (team)/            # Team dashboard
│           │   ├── layout.tsx         # Root layout
│           │   └── page.tsx           # Home page
│           │
│           └── lib/                   # Shared services & utilities
│               ├── api.ts             # API client with typed methods
│               ├── auth/              # Authentication context
│               │   ├── auth-context.tsx # React context provider
│               │   └── index.ts       # Auth exports
│               ├── certificates/      # Certificate generation
│               │   ├── generator.ts   # PDF generation with PDFKit
│               │   ├── types.ts       # Certificate type definitions
│               │   └── index.ts
│               ├── competency/        # Competency assessment
│               │   ├── competency-service.ts
│               │   ├── milestone-parser.ts
│               │   └── index.ts
│               ├── email/             # Email service
│               │   ├── service.ts
│               │   ├── templates.ts
│               │   ├── types.ts
│               │   └── index.ts
│               ├── finance/           # Financial integrations
│               │   └── xero-service.ts
│               ├── firebase/          # Firebase client config
│               │   └── client.ts
│               ├── identity/          # Identity verification
│               │   ├── service.ts
│               │   └── index.ts
│               ├── analytics/         # Analytics integration
│               │   ├── bigquery.ts
│               │   └── index.ts
│               ├── stripe/            # Payment processing
│               │   └── (Stripe integration)
│               ├── organisation/      # Organization management
│               ├── referrals/         # Referral system
│               ├── utils/             # Utility functions
│               ├── brand-assets.ts    # Logo & branding (280KB)
│               ├── mock-courses.ts    # Test data
│               └── utils.ts           # Helper functions
│
├── packages/                          # Shared packages
│   │
│   ├── database/                      # Firestore operations (@amu/database)
│   │   └── src/
│   │       ├── config/
│   │       │   └── firebase-admin.ts  # Firebase Admin SDK setup
│   │       ├── collections/
│   │       │   ├── users.ts           # User CRUD operations
│   │       │   ├── courses.ts         # Course & module operations
│   │       │   ├── enrolments.ts      # Enrolment lifecycle
│   │       │   ├── conversations.ts   # Conversation & message operations
│   │       │   ├── certificates.ts    # Certificate generation & tracking
│   │       │   ├── verification.ts    # Privacy-first verification audits
│   │       │   ├── content-improvements.ts # Content analysis & feedback
│   │       │   ├── split-tests.ts     # A/B testing framework
│   │       │   ├── team-autonomy.ts   # Claude autonomy & team chat
│   │       │   ├── prepared-payments.ts # Financial payment workflows
│   │       │   ├── course-search-index.ts # NLP-ready search index
│   │       │   └── index.ts           # Exports all collections
│   │       └── index.ts               # Main package exports
│   │
│   ├── ai/                            # AI Integration (@amu/ai)
│   │   └── src/
│   │       ├── client.ts              # Anthropic Claude API client
│   │       ├── facilitation.ts        # Learning facilitation logic
│   │       │                          # - Learning responses
│   │       │                          # - Inquiry responses
│   │       │                          # - Auto-summarization
│   │       │                          # - Competency assessment
│   │       ├── context/
│   │       │   ├── builder.ts         # Context assembly for conversations
│   │       │   │                      # - Token budget allocation
│   │       │   │                      # - Learner profile loading
│   │       │   │                      # - Summary context building
│   │       │   └── index.ts
│   │       ├── prompts/
│   │       │   ├── system-prompt.ts   # Dynamic system prompt generation
│   │       │   ├── summary-prompt.ts  # Summary extraction prompts
│   │       │   └── index.ts
│   │       ├── verification/          # Privacy-first AI verification
│   │       │   ├── verification-engine.ts # AI verification logic
│   │       │   ├── id-validator.ts    # SAID & ID validation
│   │       │   ├── audit-prompts.ts   # Verification audit prompts
│   │       │   └── index.ts
│   │       ├── analysis/              # Content analysis for improvements
│   │       │   ├── content-analyzer.ts # Struggle point detection
│   │       │   └── index.ts
│   │       ├── marketing/             # Marketing intelligence
│   │       │   ├── campaign-recommender.ts
│   │       │   ├── opportunity-detector.ts
│   │       │   └── index.ts
│   │       ├── search/                # Natural language search
│   │       │   ├── search-interpreter.ts # Intent parsing & recommendations
│   │       │   ├── career-pathway.ts  # Career path mapping
│   │       │   └── index.ts
│   │       └── index.ts               # Main package exports
│   │
│   ├── shared/                        # Shared types & validation (@amu/shared)
│   │   └── src/
│   │       ├── types/
│   │       │   ├── user.ts            # User types with SETA fields
│   │       │   ├── course.ts          # Course & module types
│   │       │   ├── enrolment.ts       # Enrolment types
│   │       │   ├── conversation.ts    # Conversation & message types
│   │       │   ├── certificate.ts     # Certificate types
│   │       │   ├── company.ts         # Organization types
│   │       │   ├── payment.ts         # Payment types
│   │       │   ├── referral.ts        # Referral program types
│   │       │   ├── verification.ts    # Verification audit types
│   │       │   ├── content-improvement.ts # Content tracking types
│   │       │   ├── split-test.ts      # A/B test types
│   │       │   ├── team-autonomy.ts   # Team autonomy types
│   │       │   ├── finance.ts         # Financial record types
│   │       │   └── index.ts           # Export all types
│   │       ├── constants/
│   │       │   └── index.ts           # Default values and constants
│   │       │                          # - SUMMARY_MESSAGE_THRESHOLD
│   │       │                          # - CONTEXT_TOKEN_BUDGETS
│   │       │                          # - DEFAULT_STOP_CONDITIONS
│   │       │                          # - etc.
│   │       ├── validation/
│   │       │   └── schemas.ts         # Zod input validation schemas
│   │       ├── utils/
│   │       │   └── index.ts           # Utility functions
│   │       │                          # - generateId()
│   │       │                          # - generateReferralCode()
│   │       │                          # - generateCertificateCode()
│   │       └── index.ts               # Main package exports
│   │
│   ├── automation/                    # Automation tasks (reserved)
│   ├── marketing/                     # Marketing utilities (reserved)
│   └── (other packages as needed)
│
├── infrastructure/                    # Terraform configurations
│   └── (GCP infrastructure as code)
│
├── specs/                             # Specification documents
│   └── (Technical specifications)
│
├── CLAUDE.md                          # Project guidelines for Claude
├── IMPLEMENTATION_INVENTORY.md        # This detailed inventory
├── IMPLEMENTATION_SUMMARY.txt         # Quick reference summary
├── CODEBASE_STRUCTURE.md             # This file
├── .env.example                       # Environment variable template
├── package.json                       # Root monorepo config
├── tsconfig.base.json                # TypeScript base config
├── .eslintrc.js                      # Linting configuration
├── .prettierrc                        # Code formatting config
├── .gitignore                         # Git ignore rules
└── .git/                              # Git repository
```

---

## File Organization by Functionality

### Authentication & User Management
```
/apps/api/src/routes/auth.ts
/apps/web/src/lib/auth/auth-context.tsx
/packages/database/src/collections/users.ts
/packages/shared/src/types/user.ts
/packages/shared/src/validation/schemas.ts
```

### Learning Experience (Core)
```
/apps/api/src/routes/enrolments.ts
/apps/api/src/routes/conversations.ts
/apps/api/src/routes/courses.ts
/packages/database/src/collections/enrolments.ts
/packages/database/src/collections/conversations.ts
/packages/database/src/collections/courses.ts
/packages/ai/src/facilitation.ts
/packages/ai/src/context/builder.ts
/packages/web/src/lib/competency/competency-service.ts
```

### Certificates & Completion
```
/apps/api/src/routes/certificates.ts
/apps/web/src/lib/certificates/generator.ts
/packages/database/src/collections/certificates.ts
/packages/shared/src/types/certificate.ts
```

### Identity Verification (Privacy-First)
```
/apps/api/src/routes/verification.ts
/packages/ai/src/verification/verification-engine.ts
/packages/database/src/collections/verification.ts
/packages/shared/src/types/verification.ts
```

### Content Improvement System
```
/apps/api/src/routes/content-feedback.ts
/packages/ai/src/analysis/content-analyzer.ts
/packages/database/src/collections/content-improvements.ts
/packages/shared/src/types/content-improvement.ts
```

### A/B Testing Framework
```
/apps/api/src/routes/split-tests.ts
/packages/database/src/collections/split-tests.ts
/packages/shared/src/types/split-test.ts
```

### Financial Management
```
/apps/api/src/routes/payments.ts
/packages/database/src/collections/prepared-payments.ts
/apps/web/src/lib/finance/xero-service.ts
/packages/shared/src/types/payment.ts
/packages/shared/src/types/finance.ts
```

### Search & Discovery
```
/apps/api/src/routes/search.ts
/packages/ai/src/search/search-interpreter.ts
/packages/ai/src/search/career-pathway.ts
/packages/database/src/collections/course-search-index.ts
```

### Team & Autonomy
```
/apps/api/src/routes/team.ts
/packages/database/src/collections/team-autonomy.ts
/packages/shared/src/types/team-autonomy.ts
```

### Marketing & Engagement
```
/apps/api/src/routes/marketing.ts
/packages/ai/src/marketing/campaign-recommender.ts
/packages/ai/src/marketing/opportunity-detector.ts
```

---

## Development Workflow

### Backend Development Path
```
1. Add type in packages/shared/src/types/
2. Add database functions in packages/database/src/collections/
3. Create API route in apps/api/src/routes/
4. Add validation schema in packages/shared/src/validation/
5. Add middleware if needed in apps/api/src/middleware/
```

### AI Feature Development Path
```
1. Add supporting types in packages/shared/src/types/
2. Implement AI logic in packages/ai/src/
3. Integrate into facilitation or analysis modules
4. Create API endpoint in apps/api/src/routes/
5. Add frontend service in apps/web/src/lib/
```

### Frontend Development Path
```
1. Create page in apps/web/src/app/
2. Add service layer in apps/web/src/lib/
3. Use API client (apps/web/src/lib/api.ts)
4. Access auth context (apps/web/src/lib/auth/)
5. Style with brand assets (apps/web/src/lib/brand-assets.ts)
```

---

## Key File Dependencies

### Critical Dependencies

```
apps/api/src/routes/*
  ↓ imports from
packages/database/src/collections/*
packages/ai/src/*
packages/shared/src/types/*
packages/shared/src/validation/*
  ↓ which depend on
apps/api/src/middleware/*
```

### Database Dependencies

```
packages/database/src/collections/*
  ↓ uses
packages/database/src/config/firebase-admin.ts
  ↓ which configures
Google Cloud Firestore
Firebase Auth
Google Cloud Storage
```

### AI Dependencies

```
packages/ai/src/*
  ↓ uses
packages/ai/src/client.ts (Anthropic API)
packages/ai/src/context/builder.ts
packages/ai/src/prompts/*
  ↓ which depend on
packages/shared/src/constants/*
packages/shared/src/types/*
```

---

## Configuration Files

### Environment Variables (.env)
```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MESSAGING_ID
FIREBASE_ADMIN_SDK_KEY

# Anthropic
ANTHROPIC_API_KEY

# Stripe (Payments)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLIC_KEY

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### TypeScript Configuration
- `tsconfig.base.json` - Root configuration
- `apps/api/tsconfig.json` - Backend TypeScript settings
- `apps/web/tsconfig.json` - Frontend TypeScript settings
- `packages/*/tsconfig.json` - Package-specific settings

### Code Quality
- `.eslintrc.js` - ESLint rules
- `.prettierrc` - Prettier formatting
- `package.json` - npm scripts and dependencies

---

## Monorepo Structure

### Package Management
```
Root package.json
├── apps/
│   ├── api/
│   │   └── package.json
│   └── web/
│       └── package.json
└── packages/
    ├── database/
    │   └── package.json
    ├── ai/
    │   └── package.json
    ├── shared/
    │   └── package.json
    ├── automation/
    │   └── package.json
    └── marketing/
        └── package.json
```

### Workspace Commands
```bash
npm install                    # Install all dependencies
npm run build                 # Build all packages
npm run dev                   # Start dev servers
npm run lint                  # Lint all packages
npm run type-check            # TypeScript validation
npm run test                  # Run all tests
npm run deploy:prod           # Deploy to production
```

---

## Data Flow Architecture

### User Authentication Flow
```
Frontend (Firebase Auth)
  ↓
Backend (/auth/register)
  ↓
Create Firebase User → Database (users collection)
  ↓
Generate Referral Code & Karma Balance
```

### Learning Conversation Flow
```
Frontend → /conversations/new
  ↓
Database (create conversation)
  ↓
/conversations/{id}/messages (send message)
  ↓
AI Context Builder (load learner + summaries + recent messages)
  ↓
Claude Facilitation (learning response)
  ↓
Save Message + Update Stats
  ↓
Check if summary needed (10 message threshold)
  ↓
If yes → Generate Summary → Save to conversation_summaries
```

### Content Improvement Flow
```
Conversations analyzed (anonymized)
  ↓
AI Content Analyzer detects struggle points
  ↓
Generate improvement suggestions
  ↓
Store in content_improvements collection
  ↓
Display to instructors/admins
  ↓
Implement improvements
  ↓
A/B test with split tests
```

### Payment Flow
```
Learner wants official certificate
  ↓
Stripe payment processing
  ↓
Claude prepares payment (prepared_payments)
  ↓
FA reviews & approves
  ↓
FA executes in FNB
  ↓
Update certificate to "official"
  ↓
Record in Xero accounting
```

---

## Testing Strategy

### Test Files (When Created)
```
apps/api/
  └── __tests__/
      ├── routes/
      │   ├── auth.test.ts
      │   ├── conversations.test.ts
      │   ├── certificates.test.ts
      │   └── ...
      └── middleware/
          ├── auth.test.ts
          └── error-handler.test.ts

packages/database/
  └── __tests__/
      └── collections/
          ├── users.test.ts
          ├── conversations.test.ts
          └── ...

packages/ai/
  └── __tests__/
      ├── facilitation.test.ts
      ├── verification.test.ts
      └── context/builder.test.ts
```

### Test Command
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npm run test:integration   # Integration tests
```

---

## Deployment Architecture

### Development
```
localhost:3000 (Next.js dev server)
localhost:3001 (Express API)
Firestore emulator
```

### Staging
```
Cloud Run (staging environment)
Firestore (staging database)
GitHub Actions CI/CD
```

### Production
```
Cloud Run (primary: africa-south1)
Cloud Run (fallover: europe-west1)
Firestore (production database)
Cloud Storage (file storage)
BigQuery (analytics)
```

---

## Key Statistics

| Metric | Count |
|--------|-------|
| Database Collections | 11 |
| API Route Groups | 12 |
| Type Files | 13 |
| Service Modules | 7 AI + 9 Frontend |
| Total Functions | 150+ |
| Lines of Code | ~15,000+ |
| Configuration Files | 8 |

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev servers
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm run type-check       # TypeScript validation

# Testing
npm test                 # Run unit tests
npm run test:watch       # Watch mode
npm run test:integration # Integration tests

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
```

---

## Next Steps

1. **Review** - Understand the overall structure
2. **Develop** - Use patterns from existing code
3. **Test** - Create tests for new features
4. **Deploy** - Use deployment scripts
5. **Monitor** - Track performance and errors

For detailed information about each component, see **IMPLEMENTATION_INVENTORY.md**.
