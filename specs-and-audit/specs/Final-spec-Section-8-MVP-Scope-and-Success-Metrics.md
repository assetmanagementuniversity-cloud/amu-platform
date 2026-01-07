# AMU LMS TECHNICAL SPECIFICATION
## Section 8: MVP Scope and Success Metrics

**Status:** Development Ready  
**Version:** 1.0  
**Last Updated:** December 2024  
**Document Type:** Technical Specification

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | Claude | Initial creation - MVP scope and success metrics |

**Related Documents:**
- Section 4: System Architecture and Governance
- Section 5: Technical Implementation
- Section 6: Course Structure and Content Architecture
- Section 7: Operations and Compliance

---

## Table of Contents

8.1 MVP Scope Definition  
8.2 Success Metrics  
8.3 Post-MVP Priorities  

---

## 8.1 MVP Scope Definition

### Purpose

The Minimum Viable Product (MVP) validates AMU's core value proposition: **AI-facilitated education that develops genuine competency**. Everything else can wait.

### MVP Includes

| Component | Scope |
|-----------|-------|
| **Access Tiers** | Tier 1 (Anonymous browsing) + Tier 2 (Free authenticated learning) |
| **Courses** | 1 complete GFMAM course (311: Organisational Context) |
| **Learning** | AI-facilitated conversations, competency tracking, assignment submission, automated grading |
| **Certificates** | Unofficial certificates (free, watermarked) with verification |
| **Infrastructure** | Core platform on Google Cloud, Firestore, Claude API integration |
| **Content** | GitHub repository with case study, facilitator playbook, competencies |

### MVP Excludes

| Component | Rationale | When to Add |
|-----------|-----------|-------------|
| **Tier 3 (SETA registration)** | Requires CHIETA approval | After CHIETA relationship established |
| **Official certificates** | Requires payment integration + SETA | After Tier 3 |
| **Referral programme** | Needs user base first | After 100+ users |
| **Payment processing** | Not needed until official certificates | With Tier 3 |
| **Corporate portal** | B2B features need B2C validation first | After individual model proven |
| **AI-as-learner testing** | Manual testing sufficient initially | When adding courses at scale |
| **Multilingual UI** | Claude translates content dynamically; UI can stay English | When non-English users request it |
| **Mobile app** | PWA/responsive web sufficient | If mobile-specific needs emerge |

### MVP Technical Boundaries

```typescript
const MVP_BOUNDARIES = {
  
  users: {
    registration: 'Email + password only',
    social_login: false,  // Add later
    mfa: false            // Add later
  },
  
  learning: {
    courses: 1,           // GFMAM 311
    concurrent_enrolments: 'Unlimited',
    conversation_history: 'Full retention',
    context_summarisation: true  // Essential for cost management
  },
  
  certificates: {
    unofficial: true,     // Free, watermarked
    official: false,      // Post-MVP
    verification: true    // Public verification page
  },
  
  payments: {
    stripe_integration: false,  // Post-MVP
    referral_system: false      // Post-MVP
  },
  
  monitoring: {
    health_checks: true,
    basic_analytics: true,
    cost_tracking: true,
    advanced_dashboards: false  // Post-MVP
  }
};
```

---

## 8.2 Success Metrics

### Core Metrics

AMU measures success across four dimensions aligned with our strategic pillars:

#### 1. Accessibility (Radical Accessibility)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Account creation time | < 60 seconds | Time from landing to dashboard |
| Platform availability | > 99% | Uptime monitoring |
| Page load time | < 3 seconds | Performance monitoring |
| Device compatibility | All modern browsers + mobile | Manual testing |

#### 2. Learning Quality (Unlimited Scalability with Attention)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Course completion rate | > 50% | Completions / Enrolments |
| Competency achievement | > 85% of completers | Learners achieving all competencies |
| Learner satisfaction | > 4.0 / 5.0 | Post-completion survey |
| Time to competency | Baseline first, then improve | Average days to completion |

#### 3. Engagement (Complete Flexibility)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Return rate | > 60% | Learners returning within 7 days |
| Messages per session | > 5 | Average conversation depth |
| Session duration | 15-45 minutes | Indicates engagement without fatigue |
| Voluntary referrals | > 20% | Learners who share without incentive |

#### 4. Sustainability (Economic Sustainability)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cost per active learner | < R30/month | Infrastructure + AI costs / active users |
| AI cost per conversation | < R5 | Token costs per learning session |
| Support ticket rate | < 0.5 per user | Indicates platform clarity |
| Bug resolution time | < 24 hours (critical) | Time to fix critical issues |

### Leading Indicators

Early signals that predict long-term success:

| Indicator | What It Shows | Healthy Range |
|-----------|---------------|---------------|
| Signup → Start rate | Content/UX appeal | > 70% |
| First session → Return | Initial experience quality | > 50% |
| Module 1 → Module 2 | Sustained engagement | > 80% |
| Completion → Recommend | Genuine satisfaction | > 60% |

### Metrics We Don't Track

Deliberately excluded to maintain focus on genuine learning:

- **Time on platform** - More time ≠ better learning
- **Daily active users** - Vanity metric for education
- **Gamification scores** - Extrinsic motivation undermines learning
- **Comparative rankings** - Ubuntu philosophy rejects competition

---

## 8.3 Post-MVP Priorities

### Priority 1: Revenue Enablement

**Trigger:** MVP validated with 50+ course completions

| Feature | Purpose |
|---------|---------|
| Stripe integration | Enable certificate purchases |
| Official certificates | Remove watermark after payment |
| Basic referral tracking | Prepare for referral programme |

### Priority 2: SETA Registration

**Trigger:** CHIETA relationship established

| Feature | Purpose |
|---------|---------|
| Tier 3 registration flow | Collect SETA-required information |
| Document upload | ID, proof of residence |
| Digital signatures | SignRequest integration |
| SETA submission workflow | Prepare documentation packages |

### Priority 3: Referral Programme

**Trigger:** 100+ registered users

| Feature | Purpose |
|---------|---------|
| Referral code generation | Enable sharing |
| Karma tracking | Track referral earnings |
| Stripe Connect | Enable payouts |
| Referral dashboard | Transparency for referrers |

### Priority 4: Course Expansion

**Trigger:** GFMAM 311 completion rate > 50%

| Feature | Purpose |
|---------|---------|
| GFMAM 312: Asset Information | Second foundation course |
| GFMAM 331: Technical Standards & Legislation | Third foundation course |
| AI-as-learner testing | Quality assurance at scale |

### Priority 5: Corporate Features

**Trigger:** Inbound corporate interest

| Feature | Purpose |
|---------|---------|
| Company registration | Enable B2B relationships |
| Training manager dashboard | Oversight of employee progress |
| Bulk enrolment | Streamline corporate onboarding |
| Company referral codes | Enable corporate discounts |

### Priority 6: QCTO Qualification

**Trigger:** CHIETA SDP registration approved

| Feature | Purpose |
|---------|---------|
| Knowledge modules (KM-01 to KM-07) | SETA-registered content |
| Practical modules | Workplace simulation |
| Work experience tracking | Logbook and supervisor verification |
| Full qualification pathway | 120 credits, NQF Level 5 |

---

## Section 8 Summary

This section establishes clear boundaries for MVP development and defines how AMU measures success:

**MVP Scope:**
- Tier 1 + Tier 2 access (no payments yet)
- One complete course (GFMAM 311)
- AI-facilitated learning with competency tracking
- Unofficial certificates with verification
- Core infrastructure only

**Success Metrics:**
- Accessibility: < 60s signup, > 99% uptime, < 3s load
- Quality: > 50% completion, > 4.0/5.0 satisfaction
- Engagement: > 60% return rate, > 20% voluntary referrals
- Sustainability: < R30/learner/month cost

**Post-MVP Priorities:**
1. Revenue enablement (payments, official certificates)
2. SETA registration (Tier 3)
3. Referral programme
4. Course expansion
5. Corporate features
6. QCTO qualification

The specification is now complete. Sections 4-8 provide everything needed to build AMU.

---

**End of Section 8**

---

## Specification Complete

**AMU LMS Technical Specification**

| Section | Title | Status |
|---------|-------|--------|
| 4 | System Architecture and Governance | ✅ Complete |
| 5 | Technical Implementation | ✅ Complete |
| 6 | Course Structure and Content Architecture | ✅ Complete |
| 7 | Operations and Compliance | ✅ Complete |
| 8 | MVP Scope and Success Metrics | ✅ Complete |

**Combined with Final Spec Sections 1-3** (Business Case and Philosophy), this specification provides everything needed to build Asset Management University.

*"Ubuntu: I am because we are."*
