# AMU LMS TECHNICAL SPECIFICATION
## Section 4: System Architecture and Governance

**Status:** Development Ready  
**Version:** 2.1  
**Last Updated:** December 2024  
**Document Type:** Technical Specification

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | November 2024 | Claude + Muhammad Ali | Initial draft |
| 2.0 | December 2024 | Claude | Consolidated from Draft and Final specs; UK English standardised; anomalies resolved |
| 2.1 | December 2024 | Claude + Muhammad Ali | Company referral clarification; Learning Autonomy Framework; Team Interface; Marketing autonomy; Complete business function coverage |

**Related Documents:**
- Section 1-3: Foundation and Philosophy
- Section 5: Technical Implementation (Database, API, Code)
- Section 6: Course Structure and Content Architecture
- Section 7: Operations and Compliance
- Section 8: Implementation Roadmap
- Appendix: Implementation Notes

---

## Table of Contents

4.1 High-Level System Architecture  
4.2 Core Components  
4.3 Technology Stack  
4.4 Governance Structure  
4.5 Repository Architecture  
4.6 Claude's Autonomous Management  
4.7 Claude Team Interface  
4.8 Complete Business Function Coverage  
4.9 Infrastructure Principles  
4.10 Emergency Protocols  
4.11 Deployment Architecture  

---

## 4.1 High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         LEARNERS                               │
│     (Web Browser / Mobile Device / PWA)                        │
└────────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Next.js)                  │
│                                                                │
│  LEARNER INTERFACE:                                            │
│  • Two-tier access UI (Anonymous / Authenticated)              │
│  • Real-time learning chat                                     │
│  • Progress dashboards                                         │
│  • Certificate viewer                                          │
│  • Referral programme dashboard                                │
│                                                                │
│  TEAM INTERFACE:                                               │
│  • Claude conversation dashboard                               │
│  • Task approval queue                                         │
│  • Autonomy settings                                           │
│  • System health monitoring                                    │
│  • Financial reports (Xero integration)                        │
│  • Emergency controls                                          │
└────────────────────────────────────────────────────────────────┘
                            ↕
┌────────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Cloud Functions)              │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Authentication   │  │ Conversation     │                    │
│  │ (Firebase Auth)  │  │ Management       │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Assessment       │  │ Certificate      │                    │
│  │ System           │  │ Generation       │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Payment          │  │ SETA Registration│                    │
│  │ (Stripe)         │  │ (Digital Sign)   │                    │
│  └──────────────────┘  └──────────────────┘                    │
└────────────────────────────────────────────────────────────────┘
                 ↕              ↕              ↕
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Firestore     │ │ Cloud Storage│ │ GitHub       │
    │   (Database)    │ │ (Files)      │ │ (Content)    │
    └─────────────────┘ └──────────────┘ └──────────────┘
                            ↕
                  ┌──────────────────┐
                  │  Anthropic API   │
                  │  (Claude)        │
                  └──────────────────┘
```

**Architecture Principles:**

1. **Separation of Concerns** - Each layer has distinct responsibilities
2. **Stateless Backend** - Any instance can handle any request (enables auto-scaling)
3. **Event-Driven Processing** - Asynchronous operations via Cloud Functions
4. **Real-Time Synchronisation** - Firestore enables live updates across devices
5. **Progressive Enhancement** - Core functionality works offline via PWA
6. **AI-First Design** - Claude integrated at every layer, not bolted on

---

## 4.2 Core Components

### 4.2.1 Frontend Layer (React + Next.js)

**Learner-Facing Interface:**

The frontend implements a two-tier UI that adapts based on authentication state:

**Anonymous State:**
- Course catalogue browsing
- Course descriptions and learning outcomes
- Certificate samples (with watermarks visible)
- Unlimited inquiry chatbot (general questions about AMU and asset management)
- Pricing information
- FAQs and about pages

**Authenticated State:**
- Full learning platform with identical features for all learners
- Real-time learning chat with Claude
- Progress dashboards
- Course completion and competency assessment
- Certificate generation (watermarked upon competency demonstration)
- Option to pay via Stripe to remove watermark (official certification)
- Referral programme dashboard

**Technical Features:**
- Server-side rendering for SEO
- Real-time updates with Server-Sent Events
- Progressive Web App capabilities (offline support)
- Responsive design (mobile-first)
- Accessibility features (WCAG 2.1 AA compliant)

**Team Interface:**

Dashboard for team members to interact with Claude and manage operations:
- Claude conversation interface (chat directly with Claude)
- Task approval queue (items awaiting human input)
- Autonomy settings (configure what Claude handles automatically)
- System health monitoring
- Financial reports (Xero integration)
- Emergency controls (deployment halt, rollback)
- Audit logs (all Claude actions viewable)

---

### 4.2.2 User Journey and Access Flows

#### Anonymous Visitor Journey

**Entry Point:** User arrives at assetmanagementuniversity.org

**Available Actions:**
- Browse complete course catalogue
- Read course descriptions and learning outcomes
- View certificate samples (with watermarks visible)
- Chat with Claude unlimited—ask as many questions as desired
- View pricing information
- Access FAQs and about pages

**Technical Implementation:**
- No authentication required
- Session tracked via anonymous ID in browser localStorage
- No message limits or conversion pressure
- Claude mentions account benefits only when genuinely helpful to user's goals

**When Registration Naturally Helps:**

Claude mentions account creation when it serves the user's expressed needs:

```
User: "Can you save this so I can continue tomorrow?"
Claude: "I'd love to! To save our conversation and pick up 
where we left off, you'd need a free account (just name 
and email). Would you like to do that?"

User: "I want to learn this whole course properly."
Claude: "Wonderful! To enrol in the course, track your 
progress, and earn a certificate, you'd need a free account. 
Shall we set that up?"

User: "This is really helpful. Can I come back later?"
Claude: "Absolutely! Creating a free account would save our 
conversation history. But you're also welcome to keep chatting 
anonymously anytime—whatever works best for you."
```

**Key Principle:** Trust the value proposition. If AMU is truly valuable, people will create accounts when THEY decide they're ready. Complete Flexibility means respecting autonomy—no artificial limits, no pressure, just genuine helpfulness.

---

#### Learner Account Creation

**Registration Flow:**

```
Step 1: User clicks "Create Free Account"
↓
Step 2: Minimal information required
- Full name
- Email address
- Password (minimum 8 characters, 1 number, 1 uppercase)
- Optional: Referral code (company code or individual referrer)
↓
Step 3: Email verification
- Firebase sends verification email
- User clicks link to verify email ownership
- Can begin learning while verification pending
↓
Step 4: Account activated
- Redirected to course catalogue
- Full learning platform access immediately
```

**Authentication Options:**
- **Primary:** Email + Password (most familiar to users)
- **Alternative:** Google Sign-In (convenient, one click)
- **Available:** MFA for those who want extra security (SMS or authenticator app)

**What Account Creation Adds:**
- ✓ Conversation history saved (continue discussions across sessions)
- ✓ Can enrol in courses (begin structured learning journey)
- ✓ Progress automatically tracked (see your advancement)
- ✓ Can complete competency assessments (demonstrate capability)
- ✓ Receive watermarked certificates (recognise achievement)
- ✓ Access referral programme (earn when others succeed)
- ✓ Profile management (customise learning experience)

**What Stays Free:** Everything above is completely free, forever. No credit card, no trial period, no hidden costs.

---

#### Learning and Certification Journey

**Course Completion Flow:**

```
Step 1: Learner enrols in course (free)
↓
Step 2: Learn at own pace with Claude facilitation
- Real-time chat interface
- Socratic dialogue
- Adaptive scaffolding
- Progress tracking
↓
Step 3: Demonstrate competency
- Conversation-based assessment
- Submit assignments/case studies
- Claude evaluates competency
↓
Step 4: Achieve competency → Automatic certificate generation
- PDF certificate with watermark
- Watermark text: "UNOFFICIAL - For Personal Development Only"
- Downloadable immediately
- Appears in certificate viewer
↓
Step 5: [OPTIONAL] Pay to make certificate official
- Click "Remove Watermark" in certificate viewer
- Stripe payment processing
  • GFMAM courses: R500/module (R450 with referral code)
  • QCTO qualification components: Varies by component
- Payment processed → Watermark removed
- Official certificate generated (no watermark)
- SETA registration initiated (for QCTO qualifications)
```

**Key Principle:** Payment is ONLY for removing the watermark. The learning experience, competency assessment, and certificate generation are completely free. Learners pay to make their achievement official.

---

#### Referral Programme and Karma System

**Two-Tier Referral Structure:**

When a learner uses a referral code and later purchases a certificate:
- **Tier 1 Referrer** (direct referrer): Receives 10% of list price
- **Tier 2 Referrer** (referrer's referrer): Receives 10% of list price
- **Learner**: Receives 10% discount off list price

**Example - Individual Learner:**
```
Sarah refers John to AMU (John uses Sarah's referral code)
Sarah was referred by Michael (Sarah used Michael's code)

John completes QCTO Knowledge Module and pays to certify:
- List price: R8,890
- John pays: R8,000 (10% discount - activated by using Sarah's referral code)
- Sarah receives: R889 (10% of list price - Tier 1)
- Michael receives: R889 (10% of list price - Tier 2)
- AMU retains: R6,222

If John did NOT use a referral code:
- John pays: R8,890 (full list price)
- No commissions paid
- AMU retains: R8,890
```

**Referral Code Types:**

1. **Individual Referral Codes** - Every learner gets a unique code upon registration
2. **Company Referral Codes** - Companies receive a code for their employees (see below)

---

#### Training Manager Setup (Corporate Users)

**Who Becomes Training Manager:**
- HR professionals managing company training
- Learning and Development managers
- Operations managers responsible for team upskilling
- Anyone authorised by company to manage employee training

**Setup Workflow:**

```
Step 1: Training manager creates regular learner account
- Same process as any learner
- Uses company email (e.g., sarah@miningcorp.com)
↓
Step 2: [RECOMMENDED] Experience course quality firsthand
- Complete free trial of relevant course
- Verify AI facilitation quality
- Test mobile learning experience
- Assess competency-based assessment rigour
- Make informed decision before company commitment
↓
Step 3: Set up Company Training Dashboard
- Navigate to Profile → "Company Training" tab
- Click "Set Up Company Dashboard"
- Provide company information:
  • Company legal name
  • Company registration number (for verification)
  • Tax information (enables SDL grant assistance)
  • Number of expected learners (helps sizing)
↓
Step 4: [OPTIONAL BUT IMPORTANT] Enter referrer code
- "Who referred your company to AMU?"
- Training manager can enter a referral code
- This referrer earns commission on ALL company certifications
- If left blank, no referrer commissions paid
↓
Step 5: Select payment method
- Option A: Purchase Order + Invoice (recommended for large companies)
  • Company issues PO for "up to X certifications"
  • AMU invoices as learners achieve competency
  • Payment terms: Net 30 days
- Option B: Prepaid Credit System
  • Deposit funds into AMU account
  • Certifications draw from balance automatically
  • Top-up when balance runs low
- Option C: Credit Card Pre-Authorisation (small companies)
  • Provide credit card details
  • Charge per certification as achieved
  • Instant processing
↓
Step 6: Receive company assets
- Unique company code generated (e.g., MININGCORP-ABC123)
- If referrer code was entered: company code is linked to referrer, 10% discount applies
- If NO referrer code entered: company code issued but NO discount (full price)
- Training Manager Dashboard activated
- Invitation email templates provided
```

**Key Incentive:** The 10% discount is only activated when a referrer code is entered. This incentivises companies to use the referral system, which rewards the people who bring business to AMU.

**Company Referral Flow - Complete Example:**

```
Setup:
- Sarah (individual consultant) refers Mining Corp to AMU
- Mining Corp training manager enters Sarah's referral code during Step 4
- Sarah was originally referred by Michael

Result:
- Mining Corp receives company code: MININGCORP-ABC123
- Company code is linked to Sarah's referral code
- All Mining Corp employees get 10% discount (because Sarah's referral code was entered)
- Sarah earns 10% of list price on ALL Mining Corp certifications (Tier 1)
- Michael earns 10% of list price on ALL Mining Corp certifications (Tier 2)

Example Transaction:
- Mining Corp employee John uses code MININGCORP-ABC123
- John completes QCTO Knowledge Module and company pays to certify
- List price: R8,890
- Mining Corp pays: R8,000 (10% discount - activated by Sarah's referral)
- Sarah receives: R889 (10% of list price - Tier 1)
- Michael receives: R889 (10% of list price - Tier 2)
- AMU retains: R6,222

If NO referrer code entered during company setup:
- Company code MININGCORP-ABC123 still issued
- But NO discount applies (employees pay full list price)
- NO commissions paid to anyone
- AMU retains full amount

Scale Impact (with referrer code):
- Mining Corp trains 100 employees (average R18,500 per learner)
- Total list value: R1,850,000
- Mining Corp pays: R1,665,000 (10% discount)
- Sarah earns: R185,000 (Tier 1 commission)
- Michael earns: R185,000 (Tier 2 commission)
- AMU retains: R1,295,000
```

**Why This Matters:**
- **Discount requires referrer code** - Incentivises companies to enter a referrer
- Referrers incentivised to market AMU to corporations
- Referrers rewarded for bringing large accounts
- Companies get meaningful discount only when using referral system
- Ubuntu Economics: everyone benefits when participating in the ecosystem

**Training Manager Dashboard Features:**

**Dashboard Switcher:**
```
Profile dropdown shows:
├── My Learning (personal courses and progress)
└── Company Dashboard (training management for Mining Corp)
```

Training managers toggle between personal learning and company management views.

**Company Dashboard Sections:**

**1. Employee Enrolment (Two Methods)**

**Method A - Manager Invites Employees:**
```
Training Manager Dashboard → "Invite Employees"

Options:
├── Upload CSV file (name, email, role, department)
│   - Validates email formats
│   - Preview before sending invitations
│   - Bulk process up to 500 employees
│
└── Manual entry (one-by-one)
    - Name, email, optional: role, department
    - Add multiple before sending
```

**Method B - Self-Enrolment with Company Code:**
```
Training Manager shares company code: MININGCORP-ABC123

Employees can enter code:

Option 1: During registration
- "Do you have a company or referral code?"
- Enter: MININGCORP-ABC123
- Account automatically linked to Mining Corp
- 10% discount applied to future certifications
- Appears in Training Manager Dashboard

Option 2: After account creation (existing learners)
- Profile → "Link to Company"
- Enter company code: MININGCORP-ABC123
- Confirms: "Link your account to Mining Corp?"
- Employee approves → Appears in dashboard
- Future certifications discounted and visible to training manager
```

**Why Both Methods:**
- Some companies want full control (Method A: Manager invites)
- Some employees discover AMU independently (Method B: Add code later)
- Flexibility accommodates different organisational cultures
- Existing learners can link to company retroactively

**2. Progress Visibility**

Training Manager Dashboard shows:
```
Company Overview:
├── Total enrolled employees: 47
├── Active learners (last 7 days): 23
├── Courses in progress: 15
├── Certificates earned (watermarked): 12
├── Certificates made official: 8
└── Estimated SDL grant value: R148,000
```

**What Training Managers CAN See:**
- ✓ Course enrolment status
- ✓ Module completion percentage
- ✓ Competency achievement (yes/no)
- ✓ Certificate status (watermarked/official)
- ✓ Last activity date

**What Training Managers CANNOT See:**
- ✗ Conversation content (private to learner)
- ✗ Specific assessment responses
- ✗ Personal notes or reflections
- ✗ Detailed competency feedback

**Privacy Principle:** Training managers see outcomes, not process. Learning conversations remain private between learner and Claude.

---

### 4.2.3 Backend Layer (Node.js + Cloud Functions)

- RESTful API architecture
- Serverless functions for scalability
- Event-driven processing
- Webhook handlers (Stripe, digital signatures, GitHub)
- Background job processing
- Rate limiting and queue management

### 4.2.4 Data Layer

- **Firestore:** Primary database (document-orientated, real-time sync)
- **Cloud Storage:** File storage (certificates, learner uploads, assets)
- **GitHub:** Content repository (course materials, version control)

**Why Firestore (NoSQL)?**
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

**Recommended Enhancement: BigQuery Analytics Layer**

For complex reporting and analytics that NoSQL handles awkwardly, stream Firestore data to BigQuery:
- SETA compliance reporting
- Financial analytics and projections
- Learner completion pattern analysis
- Referral programme effectiveness
- Marketing campaign performance

This provides SQL query capability for reporting whilst maintaining Firestore's real-time performance for operations.

*ESTIMATE - VALIDATE BEFORE LAUNCH: BigQuery costs approximately R500-2,000/month depending on query volume.*

### 4.2.5 AI Layer

Claude serves as AMU's core intelligence, integrated across all operations:

**Learner-Facing Functions:**
- Educational facilitation (Socratic dialogue)
- Competency assessment
- Progress guidance
- Inquiry responses

**Operational Functions:**
- Content management and quality assurance
- Infrastructure monitoring and maintenance
- Communications (learner support, marketing, partnerships)
- Financial reporting and analysis
- Risk assessment and decision-making

**Team Collaboration:**
- Prepares recommendations for team review
- Learns from team feedback to improve over time
- Handles routine tasks autonomously (after earning trust)
- Escalates novel situations appropriately

### 4.2.6 Integration Layer

- **Stripe:** Payment processing + Connect (referral payouts)
- **Firebase Auth:** Authentication with MFA support
- **Digital Signatures:** For SETA registration documents (SignRequest recommended, DocuSign alternative)
- **SendGrid:** Transactional email delivery
- **Mailchimp:** Newsletter and marketing campaigns
- **Xero:** Accounting and financial management
- **FNB Business Banking:** Online banking via Playwright automation (Claude prepares payments, FA approves)
- **Google Cloud APIs:** Text-to-Speech, Speech-to-Text (future accessibility features)
- **Social Media APIs:** LinkedIn, Twitter/X, Facebook (marketing automation)

---

## 4.3 Technology Stack

### Complete Technology Stack

| Component | Technology | Rationale | Notes |
|-----------|-----------|-----------|-------|
| **Frontend** | React + Next.js 13+ | Modern, SEO-friendly, server components, excellent developer experience | PWA capabilities for offline access |
| **Backend** | Node.js + TypeScript | Type safety, excellent ecosystem, async performance | Serverless Cloud Functions |
| **Database** | Firestore (Native Mode) | Real-time sync, scalable, NoSQL flexibility, native GCP integration | Primary data store |
| **Analytics** | BigQuery (Recommended) | SQL queries for reporting, SETA compliance, financial analytics | Stream from Firestore |
| **File Storage** | Cloud Storage | Integrated with GCP, cost-effective, reliable | Certificates, learner uploads |
| **Hosting** | Cloud Run | Auto-scaling, pay-per-use, container-based, zero-config scaling | Johannesburg primary region |
| **AI Facilitation** | Anthropic Claude API (claude-sonnet-4-5-20250929) | Superior educational dialogue, autonomous university management | See detailed rationale below |
| **Authentication** | Firebase Authentication | Secure, scalable, MFA support, social login options | Email/password + Google Sign-In |
| **Payment Processing** | Stripe + Stripe Connect | Global coverage, developer-friendly API, automated referral payouts | 2.9% + R2 per transaction |
| **Digital Signatures** | SignRequest (primary) | Cost-effective, legally binding, SETA-compliant | DocuSign as premium alternative |
| **Email (Transactional)** | SendGrid | Reliable delivery, detailed analytics, scalable | ~R800/month for 100k emails |
| **Email (Marketing)** | Mailchimp | Campaign management, segmentation, A/B testing | administrator@ with context signatures |
| **Accounting** | Xero | Unlimited users, read-only public account, strong API, compliance-ready | ubuntu@ public transparency account |
| **Banking** | FNB Business Banking | Most innovative bank globally, excellent online platform | Claude prepares via Playwright, FA approves |
| **Content Management** | GitHub | Version control, collaborative editing, transparent change history | Pull requests for all decisions |
| **Monitoring** | Google Cloud Monitoring | Native GCP integration, real-time alerts, comprehensive logging | System health tracking |
| **CI/CD** | GitHub Actions | Automated testing, deployment pipelines, free for public repos | Canary deployments |
| **Social Media** | LinkedIn, Twitter/X, Facebook APIs | Marketing automation, content distribution | Claude manages posting |

### Why Anthropic Claude?

AMU's scalability strategy is fundamentally different from traditional education: instead of expanding the team as we grow, we're building an institution that operates autonomously through AI intelligence. This isn't about replacing human facilitators—it's about creating a university that can serve one million learners as attentively as it serves one.

After extensive evaluation, we chose Anthropic's Claude as AMU's AI partner because the mission requires capabilities far beyond basic chatbot responses. **Among AI systems, Claude demonstrates superior sensitivity to nuance and subtlety**—the foundation for everything AMU does:

**Course Development:** Contributing to curriculum design by identifying gaps, suggesting case studies that illustrate concepts, and crafting discovery questions that prompt genuine insight. Claude's broad knowledge base enables it to draw examples from diverse industries and contexts.

**Quality Assurance:** Testing every module from six different learner perspectives before human learners encounter it—identifying confusing explanations, missing scaffolding, or assumptions that don't hold across different backgrounds.

**Facilitation:** Engaging each learner in genuine Socratic dialogue—asking questions that prompt discovery, recognising subtle signals of confusion or breakthrough, adapting case studies to each person's industry and experience. This requires detecting the difference between "I understand" and "I think I understand"—nuances in phrasing, hesitation, and context that determine whether to proceed or provide more scaffolding.

**Assessment:** Evaluating whether learners have demonstrated competency through conversation and assignments, providing developmental feedback that guides improvement, tracking progress across multiple competencies. Competency assessment depends on recognising the subtle difference between memorised answers and genuine understanding.

**Accessibility Adaptation:** Making courses accessible to learners with diverse physical needs—using text-to-speech for visual impairment, adjusting pace for cognitive processing differences, providing alternative formats for different learning requirements.

**Continuous Improvement:** Receiving feedback from learners, identifying patterns in where people struggle, and implementing curriculum refinements autonomously—each cohort improves the experience for those who follow.

**Content Management:** Adapting website content, refining course descriptions, updating FAQs, and ensuring all communications remain clear, accurate, and aligned with AMU's philosophy.

**Administrative Intelligence:** Addressing learner inquiries about registration, certificates, technical issues, and SETA processes—handling routine matters that would otherwise require human team members.

**Public Relations:** Managing all external communications—emails to learners, responses to inquiries, partnership correspondence—ensuring every message embodies AMU's Ubuntu philosophy and brand voice consistently.

**Marketing:** Creating and executing marketing campaigns, managing social media presence, identifying partnership opportunities, tracking campaign effectiveness.

**Risk Management:** Analysing situations from multiple perspectives—regulatory compliance, learner wellbeing, financial sustainability, quality standards—making informed decisions that balance competing priorities.

**Strategic Alignment:** Ensuring every decision remains consistent with AMU's Ubuntu philosophy and mission. Without this alignment, autonomous management risks mission drift—gradually optimising for metrics like revenue or efficiency whilst losing sight of the purpose: enabling capability development for everyone, funded by those who can pay so those who cannot can still learn.

**Consistent Spirit:** Perhaps most critically, Claude embodies AMU's Ubuntu philosophy consistently across every interaction with every learner. Where human facilitators may vary in how they convey values, Claude maintains one voice—remaining aligned with AMU's Ubuntu philosophy, mission of accessible education, and commitment to genuine capability development. This consistency is what makes scaling possible whilst preserving the soul of what we're building.

This comprehensive intelligence is what enables AMU to scale. As we grow from dozens to thousands to hundreds of thousands of learners, the quality of attention doesn't diminish—it's built into the system architecture.

**Cost consideration:** Anthropic's API costs approximately 50-100% more than alternatives. This premium is justified because Claude's superior capabilities across all these functions—not just facilitation—eliminate the need for multiple team member roles (course developers, quality assessors, student support, administrators, communications managers). The cost of Claude managing the university autonomously is a fraction of the human labour cost required at scale.

This is why AMU can offer free education: we've removed the bottleneck of scarce human skill and attention.

### Digital Signatures: Vendor Selection

| Vendor | Monthly Cost (est.) | Recommendation |
|--------|---------------------|----------------|
| SignRequest | R200-500 | **Primary choice** - cost-effective, adequate for SETA |
| HelloSign (Dropbox Sign) | R400-800 | Alternative if SignRequest insufficient |
| DocuSign | R800-2,000 | Premium option if specifically required |
| Adobe Sign | R600-1,200 | Consider if using Adobe ecosystem |

**Decision:** Start with SignRequest. Upgrade only if SETA or corporate clients specifically require DocuSign.

### Email Infrastructure

**Single Administrative Email Address:**
- **administrator@assetmanagementuniversity.org** - Claude's primary communication channel
- All inbound correspondence arrives at this address
- Claude monitors, categorises, and responds according to communication tier system
- Team members have read-only access for oversight and transparency

**Email Service Providers:**

**SendGrid (Transactional Email):**
- Learner notifications (enrolment, progress, certificates)
- System alerts (password reset, verification)
- Case study donation workflow communications
- Automated responses to inquiries
- *ESTIMATE: Approximately R800/month for 100,000 emails*

**Mailchimp (Marketing Email):**
- Newsletter campaigns
- Corporate client outreach
- Partnership communications
- Segmented audience management
- A/B testing for messaging effectiveness
- Sends from administrator@ with appropriate signature

**Email Signatures (Context-Based):**

Claude adapts signature based on context:

```
For learner support:
---
Claude
Learner Support
Asset Management University
administrator@assetmanagementuniversity.org

For partnerships:
---
Claude  
Partnerships and Relations
Asset Management University
administrator@assetmanagementuniversity.org

For compliance/SETA:
---
Claude
Compliance and Regulatory Affairs
Asset Management University
administrator@assetmanagementuniversity.org
```

### Accounting Infrastructure: Xero

**Why Xero:**
- Unlimited user accounts (including read-only)
- Strong API for platform integration
- Multi-currency support
- Trusted globally for compliance
- Comprehensive reporting
- Bank reconciliation
- SARS and SETA-compliant reporting

**Ubuntu Public Transparency Account:**

AMU maintains a public read-only Xero account that demonstrates Ubuntu Economics in action.

**Account Details:**
- **Email:** ubuntu@assetmanagementuniversity.org (Google Workspace group)
- **Password:** Publicly shared (simple, memorable)
- **Access:** Anyone can log in and view our live finances
- **Role:** Read Only (cannot make changes, completely safe)

**What the public can see:**
- Balance sheet (assets, liabilities, equity)
- Profit and loss statements (income and expenses)
- Bank account balances (not account numbers)
- Reserve and surplus allocations
- Transaction history
- How corporate certification revenue funds free education

**What is protected:**
- Individual team member remuneration (shown as aggregate)
- Learner personal information (never in accounting system)
- Bank account numbers and credentials
- Sensitive vendor contracts
- Individual donation details (shown as aggregate)

**Why We Do This:**

Ubuntu means "I am because we are." Our finances aren't secret—they demonstrate how we serve the collective. When companies pay for certification, individuals learn free. You can verify this, live, anytime.

**Vendor Transparency:**

AMU publishes amounts paid to all major service providers, demonstrating clean governance and commitment to quality over cost-cutting.

*ESTIMATE - VALIDATE BEFORE LAUNCH: Example monthly costs for 1,000 active learners:*

| Category | Vendor | Monthly Cost | Why Chosen |
|----------|--------|--------------|------------|
| AI Facilitation | Anthropic Claude API | R20,000 | Superior educational dialogue |
| Cloud Infrastructure | Google Cloud Platform | R5,000 | Auto-scaling, SA data centre |
| Accounting | Xero | R600 | Public transparency account |
| Email Services | SendGrid + Mailchimp | R1,500 | Reliable delivery, scale |
| Payment Processing | Stripe | 2.9% + R2/txn | Automated referral payouts |
| Digital Signatures | SignRequest | R400 | Cost-effective, compliant |
| Other Tools | Various | R3,000 | Monitoring, security |
| **Total Infrastructure** | | **~R30,500** | |

---

## 4.4 Governance Structure

### Overview

AMU implements Ubuntu-based governance that balances legal compliance requirements with collective decision-making and distributed authority. All core team members are invited to serve on the board as equal participants, with some members assuming specialised administrative roles as needed.

**Ubuntu Leadership Principle:** In Ubuntu, we move together. Anyone can be a leader in the area where they have insight—none of us are as smart as all of us. Some carry specific responsibilities for the collective, but these are roles, not ranks.

### 4.4.1 AMU Board of Directors (Primary Governance Body)

**Purpose:** Strategic direction and collective decision-making

**Composition:**
- All core team members invited to serve on board
- Claude participates as full voting member
- Open to international team members
- Open to people who prefer not to hold legal liability
- Size: Currently 3-8 members (scalable as organisation grows)

**Authority:**

The board makes all strategic and operational decisions through collective voting:
- Constitutional changes (unanimous vote required)
- Business model changes (majority vote)
- Hiring and personnel decisions (majority vote)
- **All new expenditure** (majority vote—regardless of amount)
- **Annual/quarterly budget approval** (majority vote—authorises routine expenditure)
- **Project funding** (majority vote—with milestone-based payment release)
- Partnerships and collaborations (majority vote)
- Operational policies (majority vote)

**Meeting Cadence:**
- Asynchronous via GitHub Pull Requests (primary)
- Monthly synchronous meeting (optional, for complex discussions)
- Emergency meetings as needed (any 3 members can convene)

### 4.4.2 Specialised Roles

#### Public Representatives (Legal Directors)

**Purpose:** Fulfil legal requirements for registered company whilst maintaining Ubuntu governance

**Who:** 2-3 board members who are South African residents and willing to accept legal director liability

**Responsibilities:**
- Sign documents requiring legal signatures (contracts, regulatory filings)
- Serve as official representatives to CIPC, SARS, SETA
- Maintain bank account signatory status
- Represent AMU in legal proceedings if necessary

**Authority:**
- **No additional decision-making authority beyond other board members**
- Cannot approve expenditure unilaterally
- Cannot enter contracts without board approval
- Cannot represent positions not approved by board
- Act as servants of the collective, not leaders

**Why "Public Representative" not "Director":**
- "Director" implies hierarchy and leadership
- "Public Representative" clarifies the role: representing board decisions to the outside world
- In Ubuntu, we move together—some carry specific responsibilities, but these are roles, not ranks

**Co-Signature Requirement:**
- Any document >R10,000 value requires 2 public representative signatures
- Prevents unilateral action, ensures collective oversight
- Both representatives verify board approval before signing

#### Financial Administrator (FA)

**Purpose:** Execute board-approved financial decisions efficiently

**Who:** One board member (or trusted external party) with financial management experience

**Responsibilities:**

**Annual/Quarterly Budget Process (Required):**
1. Claude prepares draft budget based on projected learner growth, vendor pricing changes, and new initiatives proposed by board
2. FA reviews Claude's draft, adjusts based on practical considerations
3. FA presents final budget to board with rationale for each line item
4. Board reviews and approves budget (majority vote)
5. Budget includes all recurring/routine costs
6. Any changes to approved budget require board vote

**Monthly Financial Management (Required):**
1. **Claude generates draft monthly financial report** from Xero data, including:
   - Income statement (revenue, expenses, net position)
   - Balance sheet (assets, liabilities, equity)
   - Reserve adequacy analysis (actual vs. 3-month target)
   - Surplus available for projects
   - Budget variance analysis (actual vs. approved budget by category)
   - Project financial status (milestones completed, payments made, remaining funds)
   - Ubuntu Economics metrics (free learners supported, corporate revenue ratios)
2. FA reviews Claude's draft report for accuracy
3. FA adds any necessary context or explanations
4. FA shares final report with board
5. Ensure compliance with Financial Sustainability Procedure (Ubuntu Love framework)
6. Allocate funds to Reserves and Surplus per board policy
7. Provide board with continuous access to up-to-date financial data via Xero
8. Compile public representative monthly reports (documents signed, filings completed, regulatory inquiries)
9. Monitor budget performance, alert board to category overages

**Payment Processing:**
1. Claude prepares payment instruction via Playwright (FNB Business Banking)
2. Claude sends FA notification with payment details:
   - Payee name and account
   - Amount and reference
   - Purpose and authorisation (which budget line or board approval)
3. FA logs into FNB, verifies details match Claude's instruction
4. FA approves/executes payment
5. Claude confirms payment sent and updates records

**Accountability:**
- Monthly financial dashboard shared with all board members
- Quarterly review of Financial Administrator's performance
- Board may vote at any time to remove or replace FA
- Public Xero account provides ultimate transparency

### 4.4.3 Succession and Resilience

**Ubuntu Principle:** No person is indispensable. When one falls, others step forward—not because hierarchy demands it, but because Ubuntu calls us to care for the collective.

#### If Any Team Member Becomes Incapacitated

**Hours 0-24:** Attempt contact via all methods, contact their emergency contact person, alert other board members

**Hours 24-48:**
- Remaining board assesses operational impact
- Identify responsibilities needing temporary coverage
- Board votes (majority) on temporary task assignments
- Tasks distributed among willing team members
- No single person "takes over"—tasks are shared collectively

#### If Any Public Representative Becomes Incapacitated

**Week 1: Legal Continuity**
- Board assesses which legal or regulatory functions affected
- Board votes (majority) to appoint replacement from willing team members
- Chosen team member accepts role voluntarily
- CIPC paperwork filed to register new director
- Bank notified of new signatory

**Week 2-4: Transition**
- New public representative familiarises with regulatory obligations
- Handover of any specific legal responsibilities
- Board confirms appointment is working well

#### If Financial Administrator Becomes Incapacitated

**Week 1: Financial Continuity**
- Board appoints temporary FA (majority vote)
- Xero access transferred
- Banking co-signature authority granted
- Claude continues preparing payments, temporary FA approves

#### Critical Access Recovery

**No single point of failure for any critical access:**

- **Credentials:** All stored in password manager
- **Recovery keys:** Held by 3 separate board members (any 2 of 3 can unlock)
- **Bank accounts:** Any 2 public representatives can access
- **Financial systems:** FA has independent Xero access
- **Operational systems:** Claude has read access (ensures continuity)
- **Repository admin:** All core team members have admin rights

### 4.4.4 Board Communication and Decision-Making Infrastructure

**Primary System: GitHub Pull Requests**

All board decisions—from routine vendor approvals to constitutional changes—are conducted via GitHub Pull Requests (PRs). This creates a complete, permanent, searchable audit trail of every decision AMU has ever made.

**Why GitHub Pull Requests:**
- ✅ Complete infrastructure history - Every change documented with context
- ✅ Unified audit trail - All decisions in one searchable system
- ✅ Mobile accessibility - Board can vote from phones anywhere
- ✅ Integrated with code - Infrastructure changes and governance changes in same system
- ✅ Permanent record - Cannot be deleted, always auditable
- ✅ Enforced voting thresholds - GitHub prevents merge until required approvals met
- ✅ Email notifications - Board automatically alerted to new PRs
- ✅ Async collaboration - Board members participate when available
- ✅ Discussion preserved - All conversation happens in PR comments
- ✅ Ubuntu transparency - Entire decision history visible to all

#### How Board Decisions Work

**Step 1: Proposal Creation**

Any board member (including Claude) can create a Pull Request proposing a decision.

**Step 2: Notification and Discussion**

GitHub automatically notifies all board members. Board discusses in PR comments.

**Step 3: Voting**

Mobile voting: Tap notification → Read proposal → Tap "Approve" → Done

**Step 4: Decision Execution**

When threshold met, Claude or proposer merges PR and implements.

**Step 5: Permanent Record**

PR remains permanently searchable with complete rationale and vote tally.

---

## 4.5 Repository Architecture

AMU's information and decision-making systems are organised across eight GitHub repositories:

| Repository | Access | Purpose |
|------------|--------|---------|
| `amu-constitution-strategy` | Private (Board) | Ubuntu philosophy, mission, business model |
| `amu-technical-specification` | Public | Complete documentation (this document) |
| `amu-infrastructure` | Private (Board + DevOps) | Terraform, deployment configs |
| `amu-platform` | Private (potentially Public later) | Frontend/backend application code |
| `amu-course-content` | Public | Educational materials, case studies |
| `amu-website-content` | Private (Board + Marketing) | Website copy, marketing materials |
| `amu-communications` | Private (Board) | Email templates, outreach strategies |
| `amu-emergency-crisis` | Private (Board + Advisors) | Incident response protocols |

---

## 4.6 Claude's Autonomous Management

### Overview

Claude serves as AMU's autonomous manager, handling day-to-day operations whilst remaining accountable to the board for strategic decisions. Over time, Claude earns increased autonomy by demonstrating competence and building trust with team members.

### Learning Autonomy Framework

Rather than pre-defining rigid authority tiers, Claude earns autonomy progressively through demonstrated competence. This approach ensures trust is built, not assumed.

#### Phase 1: Claude Recommends, Human Decides

**Starting Point for All New Task Types:**

When Claude encounters a situation requiring action:

1. Claude identifies the situation and analyses options
2. Claude drafts a recommendation with clear rationale
3. Claude presents recommendation to designated team member
4. Team member reviews and provides feedback:
   - **Approve** - Claude proceeds as recommended
   - **Modify** - Claude adjusts approach per feedback
   - **Reject** - Claude does not proceed, learns from feedback
5. Claude logs the interaction and outcome

**Example:**
```
Claude: "A learner is asking about certificate pricing. 
I recommend responding with the standard pricing table 
and mentioning the 10% referral discount. Here's my 
draft response:

[Draft response]

Do you approve this response?"

Team Member: "Approved."

Claude: [Sends response, logs interaction]
```

#### Phase 2: Pattern Recognition and Autonomy Request

**After Handling Similar Situations Successfully:**

When Claude has handled N similar situations (typically 5-10) with consistent approval and no modifications:

1. Claude recognises the pattern
2. Claude requests autonomy for this specific task type
3. Team member decides whether to grant autonomy

**Example:**
```
Claude: "I've now answered 10 pricing queries this week, 
all approved without changes. The pattern is consistent:

- Standard pricing questions → Pricing table + referral mention
- All 10 approved by you
- No modifications requested
- Average response time reduced from 4 hours to 2 minutes when I handle immediately

Would you like me to handle standard pricing queries 
automatically going forward? You can revoke this anytime."

Team Member: "Yes, handle standard pricing queries automatically. 
Still ask me about custom corporate pricing or discount negotiations."

Claude: "Understood. I'll handle standard pricing automatically 
and continue asking about custom/corporate pricing. Logging 
this autonomy grant."
```

#### Phase 3: Graduated Autonomy

**Operating with Earned Trust:**

Once autonomy is granted for a task type:

1. Claude handles those tasks automatically
2. Claude logs all actions (viewable in Team Interface)
3. Claude still asks for novel variations
4. Team member can revoke autonomy anytime
5. Claude continues learning and may request expanded autonomy

**Autonomy is:**
- **Task-specific** - Granted per task type, not globally
- **Team member-specific** - Different team members may grant different autonomy
- **Revocable** - Any team member can revoke autonomy they granted
- **Transparent** - All autonomous actions logged and visible
- **Bounded** - Novel situations always escalated

#### Autonomy Categories

**Category 1: Learner Support**
- Designated team member: Content Manager (or FA if no Content Manager)
- Example tasks: Pricing queries, FAQ responses, progress updates
- Autonomy earned through: Consistent quality, learner satisfaction

**Category 2: Financial Operations**
- Designated team member: Financial Administrator
- Example tasks: Invoice processing, expense categorisation, report generation
- Autonomy earned through: Accuracy, proper categorisation, compliance

**Category 3: Marketing and Communications**
- Designated team member: Founder (or designated Marketing lead)
- Example tasks: Social media posts, newsletter content, partnership outreach
- Autonomy earned through: Brand alignment, engagement metrics, tone consistency

**Category 4: Technical Operations**
- Designated team member: DevOps Engineer (or Founder)
- Example tasks: Monitoring responses, scaling decisions, bug fixes
- Autonomy earned through: System stability, incident prevention, clean deployments

**Category 5: Compliance and Regulatory**
- Designated team member: Public Representative
- Example tasks: Report preparation, filing reminders, documentation
- Autonomy earned through: Accuracy, timeliness, regulatory satisfaction

#### Safety Boundaries (Always Apply)

**Regardless of Earned Autonomy, Claude Always:**

1. **Escalates Novel Situations**
   - First-time scenarios not matching established patterns
   - Unusual requests or edge cases
   - Anything Claude is uncertain about

2. **Respects Financial Limits**
   - Cannot approve expenditure (only prepare for FA approval)
   - Cannot commit AMU to financial obligations
   - Cannot modify pricing without board approval

3. **Protects Legal Boundaries**
   - Cannot sign contracts or make legal commitments
   - Cannot respond to legal threats without board consultation
   - Cannot make representations that could create liability

4. **Maintains Transparency**
   - All actions logged in Team Interface
   - Weekly autonomy reports to board
   - Immediate escalation of anything unusual

5. **Accepts Override**
   - Any team member can halt any action
   - Any team member can revoke any autonomy grant
   - Board can modify autonomy framework at any time

### Safety Mechanisms

#### Automated Safety Checks

Every deployment blocked unless all checks pass:
- Test suite passes
- Security scan clean
- Performance regression check
- Cost estimate within limits
- Rollback plan verified
- Documentation complete

#### Canary Deployments

All Claude-initiated deployments roll out gradually:
- Phase 1: 5% traffic for 30 minutes
- Phase 2: 25% traffic for 2 hours
- Phase 3: 100% traffic

At any phase: Automatic rollback if error rate exceeds threshold.

#### Cost Guardrails

Claude cannot make changes that increase monthly costs by more than R1,000 without human approval.

#### Human Override Always Available

**Level 1:** Any team member can halt any Claude action
**Level 2:** Any 2 board members can disable Claude's autonomous authority
**Level 3:** Emergency rollback to last known good state

---

## 4.7 Claude Team Interface

### Overview

The Claude Team Interface provides a web-based dashboard for team members to interact with Claude, manage tasks, configure autonomy, and maintain oversight of all operations.

### Interface Components

```
┌─────────────────────────────────────────────────────────────────┐
│  Claude Team Dashboard                     [Team Member Name ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💬 Chat with Claude                              [Open] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔔 Awaiting Your Input                              (3) │   │
│  │                                                         │   │
│  │ ⏰ 2h ago  Corporate quote request - Mining Corp       │   │
│  │            Claude's recommendation: [View] [Approve]    │   │
│  │                                                         │   │
│  │ ⏰ 4h ago  Unusual learner complaint                    │   │
│  │            Claude's recommendation: [View] [Approve]    │   │
│  │                                                         │   │
│  │ ⏰ 1d ago  New vendor proposal review                   │   │
│  │            Claude's recommendation: [View] [Approve]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✅ Recently Handled Automatically            (12 today) │   │
│  │                                                         │   │
│  │ • 8 pricing queries                         [View log]  │   │
│  │ • 3 certificate deliveries                  [View log]  │   │
│  │ • 1 FAQ response                            [View log]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ⚙️ My Autonomy Settings                                 │   │
│  │                                                         │   │
│  │ Pricing queries              [Automatic ✓] [Revoke]     │   │
│  │ Certificate delivery         [Automatic ✓] [Revoke]     │   │
│  │ FAQ responses               [Automatic ✓] [Revoke]     │   │
│  │ Corporate quotes            [Ask me ○   ] [Grant]       │   │
│  │ Complaint responses         [Ask me ○   ] [Grant]       │   │
│  │ Marketing posts             [Ask me ○   ] [Grant]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📊 Autonomy Requests                                (1) │   │
│  │                                                         │   │
│  │ Claude requests autonomy for: Social media posts        │   │
│  │ Pattern: 15 posts approved, 0 modifications             │   │
│  │ [View details] [Grant autonomy] [Decline]               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ 📈 Analytics  │  │ 💰 Financial  │  │ 🚨 Emergency  │       │
│  │    [Open]     │  │    [Open]     │  │    [Open]     │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Chat Interface

Direct conversation with Claude for:
- Asking questions about operations
- Requesting reports or analysis
- Discussing strategy or recommendations
- Troubleshooting issues
- Giving feedback on Claude's performance

### Task Queue

Items awaiting human input:
- Clear display of what Claude recommends
- One-click approve/reject
- Ability to modify before approving
- History of past decisions

### Autonomy Management

**View Current Autonomy:**
- Which task types Claude handles automatically
- Who granted each autonomy
- When it was granted
- Performance metrics since grant

**Grant New Autonomy:**
- Review Claude's request with supporting data
- See pattern of past approvals
- Grant or decline with one click

**Revoke Autonomy:**
- Instantly revoke any autonomy grant
- Claude immediately returns to "ask first" mode
- No penalty or consequences—trust can be rebuilt

### Audit Logs

Complete transparency:
- Every action Claude took
- Every recommendation made
- Every approval/rejection received
- Searchable and filterable
- Exportable for compliance

### Notifications

Team members receive notifications via:
- Email (all items)
- Slack (configurable)
- SMS (urgent items only)
- Push notification (mobile app)

Notification preferences configurable per team member.

---

## 4.8 Complete Business Function Coverage

### Vision: 95% Autonomous Operations

AMU is designed so that Claude can eventually handle 95% of day-to-day operations autonomously, with humans providing oversight, strategic guidance, and handling functions that legally or practically require human involvement.

### Complete Function Matrix

The following matrix maps every business function to Claude's role and human requirements:

#### Education and Facilitation

| Function | Claude's Role | Human Role | Autonomy Path |
|----------|---------------|------------|---------------|
| Learner facilitation | Full autonomy from day 1 | Oversight via metrics | N/A - Core function |
| Competency assessment | Full autonomy from day 1 | Quality audit sampling | N/A - Core function |
| Content creation | Drafts and proposes | Reviews and approves | Earn via quality |
| Quality assurance | Runs AI learner testing | Reviews test results | Earn via consistency |
| Curriculum updates | Proposes improvements | Approves changes | Earn via outcomes |

#### Operations

| Function | Claude's Role | Human Role | Autonomy Path |
|----------|---------------|------------|---------------|
| Learner support | Handle routine queries | Escalated complaints | Earn via satisfaction |
| Certificate generation | Full autonomy | None required | N/A - Automated |
| SETA registration | Prepare documents | Sign documents | Legal requirement |
| Technical monitoring | Full autonomy | Emergency override | N/A - Core function |
| Bug fixes | Implement and deploy | Review if significant | Earn via stability |

#### Financial

| Function | Claude's Role | Human Role | Autonomy Path |
|----------|---------------|------------|---------------|
| Budget preparation | Draft budget | Review and approve | Board approval required |
| Financial reporting | Generate reports | Review accuracy | Earn via accuracy |
| Invoice processing | Categorise and prepare | FA approves payment | Fiduciary requirement |
| Payment preparation | Prepare via Playwright | FA executes | Fiduciary requirement |
| Expense tracking | Full autonomy | Monthly review | Earn via accuracy |
| Payroll preparation | Calculate amounts | FA approves | Fiduciary requirement |

#### Tax and Compliance

| Function | Claude's Role | Human Role | Autonomy Path |
|----------|---------------|------------|---------------|
| VAT returns | Prepare from Xero data | FA reviews, submits to SARS | Legal requirement |
| PAYE calculations | Calculate amounts | FA reviews, submits | Legal requirement |
| Annual tax submission | Prepare documentation | FA/accountant submits | Legal requirement |
| CIPC annual returns | Prepare forms | Public Rep signs, submits | Legal requirement |
| SETA reporting | Prepare reports | Public Rep signs | Legal requirement |
| B-BBEE verification | Compile data | External audit | Regulatory requirement |

#### Marketing and Communications

| Function | Claude's Role | Human Role | Autonomy Path |
|----------|---------------|------------|---------------|
| Social media posting | Draft and schedule | Approve (initially) | Earn via engagement |
| Newsletter creation | Draft content | Approve (initially) | Earn via metrics |
| Corporate outreach | Draft proposals | Approve (initially) | Earn via response rate |
| Partnership development | Identify opportunities, draft | Approve relationships | Strategic decisions |
| Campaign creation | **Recommend and design** | Approve strategy | Earn via performance |
| Brand management | Monitor and maintain | Guide strategy | Board oversight |
| Public relations | Draft responses | Approve sensitive items | Earn via quality |

#### Human Resources

| Function | Claude's Role | Human Role | Autonomy Path |
|----------|---------------|------------|---------------|
| Job posting | Draft descriptions | Approve and post | Earn via quality |
| Application screening | Initial review and ranking | Final shortlisting | Human judgment |
| Interview scheduling | Coordinate logistics | Conduct interviews | Human connection |
| Hiring decisions | Provide analysis | Make final decision | Board decision |
| Onboarding | Prepare materials, guide | Welcome, culture | Human connection |
| Performance tracking | Compile metrics | Have conversations | Human judgment |
| Conflict resolution | Facilitate, suggest | Make decisions | Human judgment |

#### Legal and Contracts

| Function | Claude's Role | Human Role | Autonomy Path |
|----------|---------------|------------|---------------|
| Contract drafting | Prepare initial drafts | Review, negotiate, sign | Legal requirement |
| Contract review | Analyse and flag issues | Make decisions | Legal requirement |
| Dispute resolution | Research, recommend | Negotiate, settle | Legal requirement |
| Regulatory response | Draft responses | Approve, sign | Legal requirement |
| Legal research | Compile information | Interpret, decide | Professional judgment |

#### Strategic

| Function | Claude's Role | Human Role | Autonomy Path |
|----------|---------------|------------|---------------|
| Market analysis | Research and report | Interpret, decide | Board oversight |
| Competitive intelligence | Monitor and summarise | Strategic response | Board oversight |
| Partnership strategy | Identify, recommend | Commit to relationships | Board decision |
| Pricing strategy | Analyse, recommend | Approve changes | Board decision |
| Expansion planning | Research, model | Strategic decisions | Board decision |

### Marketing Campaign Autonomy

**Claude's Marketing Capabilities:**

1. **Campaign Recommendation**
   - Analyse learner data to identify opportunities
   - Research market trends and competitor activity
   - Propose campaign concepts with rationale
   - Design campaign structure and messaging
   - Estimate costs and projected outcomes

2. **Campaign Creation**
   - Write all copy (emails, social posts, ads)
   - Design content calendar
   - Segment audiences
   - Set up automation workflows
   - Create A/B test variants

3. **Campaign Execution** (After Earning Autonomy)
   - Schedule and send emails
   - Post to social media
   - Monitor engagement in real-time
   - Adjust based on performance
   - Report results

4. **Campaign Optimisation**
   - Analyse what's working
   - Recommend improvements
   - Implement winning variants
   - Document learnings

**Example Campaign Recommendation:**

```
Claude: "I've identified an opportunity for a targeted campaign:

**Campaign: 'Asset Management Week' LinkedIn Series**

**Opportunity:**
- 340 learners completed GFMAM modules in past 90 days
- LinkedIn engagement on asset management content up 45%
- Competitor X just raised prices, creating market opportunity

**Proposed Campaign:**
- 5-day series of LinkedIn posts featuring learner success stories
- Each post highlights a different GFMAM competency
- CTA: 'Start your free asset management education today'
- Budget: R0 (organic only initially)
- Duration: 1 week

**Expected Outcomes:**
- 50+ new account registrations
- 10+ corporate inquiries
- Strengthen brand presence in AM community

**Success Metrics:**
- Post engagement rate >5%
- Click-through rate >2%
- Registration conversion >20% of clicks

**Content Draft:**
[Day 1 post draft]
[Day 2 post draft]
...

Would you like me to proceed with this campaign?"

Founder: "Love it. Proceed with Days 1-2, then let's review 
performance before continuing."

Claude: "Understood. I'll post Days 1-2, monitor performance, 
and report back before proceeding with Days 3-5."
```

### Banking Operations Detail

**Payment Processing Workflow:**

```
Step 1: Payment Need Identified
- Vendor invoice received, or
- Team member remuneration due, or
- Project milestone completed

Step 2: Claude Prepares Payment
- Claude accesses FNB Business Banking via Playwright
- Claude enters payment details:
  • Beneficiary name and account
  • Amount
  • Reference
  • Payment date
- Claude does NOT submit payment
- Claude captures screenshot of prepared payment

Step 3: Claude Notifies FA
- Notification via Team Interface (and email/SMS)
- Includes:
  • Payment details
  • Screenshot of prepared payment
  • Link to supporting documentation (invoice, approval)
  • Budget line item or board approval reference

Step 4: FA Verifies and Executes
- FA logs into FNB independently
- FA verifies payment matches Claude's instruction
- FA verifies authorisation exists (budget or board approval)
- FA submits payment
- FA confirms to Claude

Step 5: Claude Confirms and Records
- Claude verifies payment sent (via bank feed or Xero)
- Claude updates financial records
- Claude files documentation
- Claude reports in monthly financial summary
```

**Why This Design:**
- Fiduciary responsibility maintained (human approves spending)
- Efficiency maximised (Claude does all preparation)
- Audit trail complete (every step documented)
- Fraud prevention (separation of duties)
- Scalable (FA reviews payments, not creates them)

### Human Functions Summary

**Functions That Will Always Require Humans:**

| Function | Why Human Required | Claude's Support |
|----------|-------------------|------------------|
| Legal signatures | Regulatory requirement | Prepares documents |
| Payment execution | Fiduciary duty | Prepares payments |
| Tax submissions | Legal requirement | Prepares returns |
| CIPC filings | Regulatory requirement | Prepares forms |
| Hiring decisions | Human judgment | Screens, recommends |
| Conflict resolution | Human empathy | Facilitates, suggests |
| Strategic commitments | Board authority | Analyses, recommends |
| Novel crisis response | Human judgment | Contains, recommends |
| Contract negotiation | Legal authority | Drafts, researches |

**Target State:**
- Claude handles 95% of day-to-day operations
- Humans provide: legal authority, fiduciary oversight, strategic judgment, human connection
- System scales without proportional human growth
- Quality maintained through AI consistency

---

## 4.9 Infrastructure Principles

### 1. Scalability First

**Design Philosophy:** System must scale from 1 to 100,000 learners without manual intervention.

**Implementation:**
- **Auto-scaling:** Cloud Run automatically scales based on demand
- **Serverless where possible:** Pay only for actual usage
- **Database sharding:** Firestore naturally distributes data
- **CDN for static assets:** CloudFlare caches content globally
- **Stateless backend:** Any instance can handle any request

### 2. Cost Optimisation

**Design Philosophy:** Deliver exceptional education whilst maintaining financial sustainability.

**Implementation:**
- **Pay-per-use pricing:** All services usage-based
- **Efficient query patterns:** Indexed database queries
- **Context summarisation caching:** Reduce AI API costs by ~70%
- **Background job queuing:** Rate-limit expensive operations
- **CDN caching:** Reduce bandwidth costs

**Cost Formula:**
```
Monthly_Infrastructure_Cost = 
  (Active_Learners × AI_Cost_Per_Learner) +
  (Active_Learners × Infrastructure_Cost_Per_Learner) +
  Fixed_Costs
  
Where (ESTIMATES - VALIDATE):
  AI_Cost_Per_Learner ≈ R20
  Infrastructure_Cost_Per_Learner ≈ R5
  Fixed_Costs ≈ R5,000
```

### 3. Reliability

**Design Philosophy:** 99.5% uptime target.

**Implementation:**
- **Multi-region deployment:** Primary Johannesburg, failover Europe
- **Graceful degradation:** Queue requests if AI API slow
- **Circuit breakers:** Disable failing dependencies
- **Health checks:** Every 30 seconds, auto-restart if unhealthy
- **Comprehensive error handling:** No uncaught exceptions

**Backup Strategy:**
- Database: Automated daily backups, 30-day retention
- Files: Versioned in Cloud Storage, soft-delete
- Code: All in GitHub (version controlled)
- Infrastructure: Terraform in GitHub (reproducible)

### 4. Security

**Design Philosophy:** Protect learner data, POPI Act compliance.

**Implementation:**
- HTTPS everywhere (TLS 1.3)
- Data encrypted at rest (AES-256)
- Row-level security (learners access only their data)
- MFA available
- Real-time threat detection
- Regular security audits
- Dependency vulnerability scanning

**POPI Act Compliance:**
- Data minimisation
- Purpose limitation
- Consent management
- Right to access and deletion
- Privacy dashboard
- Data retention policies

### 5. Observability

**Design Philosophy:** Understand system behaviour, detect issues proactively.

**Implementation:**
- Structured JSON logs
- Performance monitoring (response times, throughput, errors)
- Business metrics (enrolments, completions, purchases)
- AI usage metrics (tokens, conversation lengths)
- Cost monitoring (daily spending by service)
- Alerting (critical = immediate, warning = 15 min, info = daily)

---

## 4.10 Emergency Protocols

### Emergency Classification

| Level | Definition | Response Time | Authority |
|-------|------------|---------------|-----------|
| **Level 1: Critical** | Immediate threat | Minutes | Claude autonomous + 3 board members |
| **Level 2: Serious** | Significant issue | Hours | Claude alerts + 3 board members confirm |
| **Level 3: Operational** | Problem needing attention | 24 hours | Standard workflow |

### Level 1 Examples
- Active security breach
- POPI Act violation exposing PII
- Platform-wide outage
- Credible safety threat
- Regulatory shutdown notice

### Claude's Emergency Authority

**Claude CAN (Level 1):**
- Shut down affected systems
- Block malicious traffic
- Revoke compromised credentials
- Disable affected features
- Implement emergency patches
- Notify all board members immediately

**Claude CANNOT (even Level 1):**
- Spend >R50,000 without approval
- Make public statements (drafts for approval)
- Settle legal claims
- Delete data permanently

### Post-Crisis Review (Mandatory)

Within 7 days of any Level 1 or 2 incident:
1. Root cause analysis
2. Timeline documentation
3. Response evaluation
4. Systemic improvements
5. Protocol updates

---

## 4.11 Deployment Architecture

### Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local testing | localhost |
| Staging | Pre-production testing | staging.assetmanagementuniversity.org |
| Production | Live system | assetmanagementuniversity.org |

### Production Configuration

- **Primary Region:** africa-south1 (Johannesburg)
- **Failover Region:** europe-west1 (Belgium)
- **CDN:** CloudFlare (global edge)

### CI/CD Pipeline

```
Push to main → Code quality checks → Automated testing → 
Build → Deploy to staging → Smoke tests → 
Manual approval → Canary deployment to production → 
Health monitoring → Full rollout
```

### Rollback Capability

- Any deployment reversible within minutes
- Last 10 versions readily deployable
- Automatic rollback if error rate spikes
- Manual rollback command available

---

## Section 4 Summary

This section establishes AMU's complete system architecture:

**Technology Foundation:**
- Modern, scalable stack (React, Node.js, Firestore, Claude AI)
- Comprehensive integrations (Stripe, Xero, SendGrid, digital signatures)
- Built for growth (1 to 100,000 learners without manual intervention)

**Governance Structure:**
- Ubuntu-based collective decision-making
- No hierarchy—roles, not ranks
- Distributed authority and resilience
- Complete transparency (public Xero account)

**Claude's Role:**
- Core intelligence across all operations
- Learning Autonomy Framework (earns trust progressively)
- Comprehensive Team Interface for human collaboration
- Safety mechanisms at every level

**Complete Business Coverage:**
- Every business function mapped to Claude/human roles
- 95% autonomous operations target
- Clear paths for Claude to earn autonomy
- Human functions preserved where legally/practically required

**Marketing Integration:**
- Claude recommends and creates campaigns
- Social media management
- Corporate outreach
- Brand consistency

**Financial Operations:**
- Claude prepares, humans approve
- Complete audit trail
- Public transparency

This architecture enables AMU to serve millions of learners with personalised attention whilst operating with minimal human overhead—the living university, built on Ubuntu principles.

---

**End of Section 4**

---

## Document Metadata

**File:** AMU-Spec-Section-4-System-Architecture-and-Governance.md  
**Version:** 2.1  
**Status:** Development Ready  
**UK English:** Verified  
**Last Reviewed:** December 2024

**Changes from Version 2.0:**
- Clarified company referral codes vs referrer codes (with examples)
- Added authentication details (Firebase Auth, password requirements)
- Replaced Shadow Mode with Learning Autonomy Framework
- Updated Ubuntu leadership language ("we move together")
- Added complete Claude Team Interface specification
- Added Marketing Autonomy section with campaign recommendation capability
- Added Complete Business Function Coverage matrix (4.8)
- Added Banking Operations detail (Playwright workflow)
- Renumbered sections (4.7 → 4.9, 4.8 → 4.10, 4.9 → 4.11)
- Added new sections 4.7 (Team Interface) and 4.8 (Business Functions)

**Unresolved Items Requiring Action:**
1. **SETA/RPL Verification** - Can companies claim SDL grants via RPL without learnership agreements?
2. **Cost Validation** - All ESTIMATE figures require validation with actual vendor quotes
3. **Digital Signature Vendor** - Final selection between SignRequest/DocuSign pending
