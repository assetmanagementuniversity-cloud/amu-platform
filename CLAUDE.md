# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Asset Management University (AMU)** is an AI-facilitated learning platform making asset management education radically accessible through:
- Free lifetime education for all learners
- Competency-based assessment (Competent / Developing / Not Yet)
- Corporate-subsidised free access through optional certification
- Ubuntu philosophy: "I am because we are"

This repository currently contains **specification documents only** (10,000+ lines in `/Final spec/`). No code has been implemented yet.

## Technology Stack (To Be Implemented)

| Layer | Technology |
|-------|------------|
| Frontend | React + Next.js 13+ (SSR, PWA) |
| Backend | Node.js + TypeScript (Cloud Functions on Cloud Run) |
| Database | Google Cloud Firestore (Native mode) |
| Authentication | Firebase Auth |
| AI Facilitation | Anthropic Claude API (Sonnet 4.5) |
| Payments | Stripe + Stripe Connect |
| File Storage | Google Cloud Storage |
| Hosting | GCP (africa-south1 primary, europe-west1 failover) |
| CI/CD | GitHub Actions |

## Planned Repository Structure

The project will be organised into 8 repositories:
- `amu-platform/` - Main application (frontend, backend, database, tests)
- `amu-course-content/` - GFMAM courses, case studies, facilitator playbooks
- `amu-infrastructure/` - Terraform configurations
- `amu-constitution-strategy/` - Philosophy, mission, business model (private)
- `amu-website-content/` - Marketing materials (private)
- `amu-communications/` - Email templates (private)
- `amu-emergency-crisis/` - Incident response protocols (private)
- `amu-technical-specification/` - This specification document (public)

## Architecture Principles

1. **Separation of Concerns** - Distinct frontend, backend, database layers
2. **Stateless Backend** - Any instance handles any request (enables auto-scaling)
3. **Event-Driven Processing** - Asynchronous operations via Cloud Functions
4. **Real-Time Synchronisation** - Firestore enables live updates
5. **AI-First Design** - Claude integrated at every layer
6. **Progressive Enhancement** - Core functionality works offline (PWA)

## Key Technical Specifications

### Firestore Collections
```
/users/{user_id}
/companies/{company_id}
/courses/{course_id}
/modules/{module_id}
/enrolments/{enrolment_id}
/conversations/{conversation_id}
  /messages/{message_id}
/conversation_summaries/{summary_id}
/certificates/{certificate_id}
/referrals/{referral_id}
/payments/{payment_id}
```

### Naming Conventions
- Database fields: `snake_case` prefixed by collection name (`user_email`, `course_title`)
- TypeScript interfaces: `PascalCase`
- Files: `kebab-case`
- Environment variables: `SCREAMING_SNAKE_CASE`

### Conversation Context Management
- Summarisation every 10 messages
- Context window: learner profile (500 tokens) + recent messages (2,000 tokens) + summaries (3,000 tokens)
- Achieves 85-90% API cost reduction vs full history

## MVP Scope

**Included:**
- Anonymous browsing + Free authenticated learning (Tiers 1 & 2)
- 1 GFMAM course (311: Organisational Context)
- AI-facilitated conversations with competency tracking
- Unofficial certificates (free, watermarked)
- Basic monitoring and cost tracking

**Excluded from MVP:**
- SETA registration (Tier 3)
- Official certificates and payments
- Referral programme
- Corporate portal
- Mobile app (PWA sufficient)

## Specification Documents

All specifications are in `/Final spec/`:
- **Sections 1-3**: Business case, philosophy, Ubuntu economics
- **Section 4**: System architecture, governance, Claude's autonomous management
- **Section 5**: Technical implementation (database schema, API endpoints, security)
- **Section 6**: Course structure, competency-based assessment, pedagogy
- **Section 7**: Operations, SETA compliance, POPI Act
- **Section 8**: MVP scope and success metrics
- **Section 9**: Brand identity
- **Appendix**: VAT strategy, SDL grants, implementation notes

## Development Commands (When Implemented)

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run unit tests (Jest)
npm run test:watch       # Watch mode
npm run test:integration # Integration tests

# Code Quality
npm run lint             # ESLint
npm run type-check       # TypeScript validation
npm run format           # Prettier

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
```

## Environment Variables (Required)

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MESSAGING_ID
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

## Key Business Logic

### Certificate Types
- **Unofficial**: Free, watermarked ("UNOFFICIAL - For Personal Development Only")
- **Official**: Paid (R500-R8,890), unwatermarked, SETA-registered

### Referral Programme (Two-Tier)
- Tier 1 (direct referrer): 10% of list price
- Tier 2 (referrer's referrer): 10% of list price
- Learner discount: 10% off list price

### Competency Assessment
Three levels only: `competent` | `developing` | `not_yet`
- No numeric scores
- Focus on demonstrated capability
- Progress at own pace
