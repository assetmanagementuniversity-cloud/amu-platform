# AMU LMS TECHNICAL SPECIFICATION v2.0
## Complete Implementation Guide

**Document Version:** 2.0 FINAL  
**Last Updated:** November 2024  
**Status:** Implementation Ready  
**Author:** Asset Management University Development Team

---

**CRITICAL NOTE:** This specification has been systematically reviewed and corrected. All technical decisions align with the Final Corrected Decision Registry. Every section references verified, agreed-upon approaches.

---

# TABLE OF CONTENTS

## PART 1: FOUNDATION
1. Executive Summary
2. Philosophy & Mission  
3. Educational Approach
4. System Architecture Overview

## PART 2: TECHNICAL ARCHITECTURE
5. Three-Tier Access Model
6. Anthropic API Integration
7. Conversation System with Intelligent Context
8. Rate Limiting & Queue Management
9. Database Schema (Firestore)
10. File Storage (Cloud Storage)

## PART 3: AI INTELLIGENCE SYSTEMS
11. Learner Facilitation (Claude)
12. Assessment & Grading
13. AI-as-Learner Testing
14. Intelligent Content Improvement

## PART 4: COURSE STRUCTURE
15. Content Architecture
16. GFMAM Courses
17. QCTO Maintenance Planning Qualification
18. GitHub Content Repository

## PART 5: FEATURES & SYSTEMS
19. Certificate System
20. Referral Programme (Karma)
21. Accessibility Features
22. Payment Integration (Stripe)

## PART 6: COMPLIANCE & OPERATIONS
23. SETA/QCTO Registration & RPL Process
24. POPI Act & Privacy
25. Monitoring & Reliability
26. Security Standards

## PART 7: IMPLEMENTATION
27. 10-Phase Development Plan
28. Technical Stack Summary
29. API Integration Patterns
30. Testing Strategy
31. Success Metrics

## PART 8: MARKETING & BRAND
32. Marketing Messages (Attention at Scale)
33. Brand Guidelines
34. Website Content

---

# PART 1: FOUNDATION

## 1. Executive Summary

### 1.1 Vision

Asset Management University (AMU) makes asset management education radically accessible through AI-facilitated learning. We believe each person is born to contribute uniquely to the world, and that asset management skills—the capability to achieve what we yearn for—should belong to everyone, not just the privileged few.

### 1.2 The Opportunity

**Global Market:**
- Physical assets worldwide valued at $200+ trillion
- Critical skills shortage in asset management
- Traditional education expensive (R54,000+ per course in South Africa)
- Geographic and economic barriers prevent capability development

**South Africa Specific:**
- Crumbling infrastructure requires skilled maintenance professionals
- CHIETA-registered maintenance planning costs R54,000+ per learner
- Only 30-40% completion rates in traditional programmes
- Skills Development Act creates corporate demand

**AMU's Solution:**
- **Free education** for everyone, everywhere, in their language
- **Official SETA certificates** for R3,000 (95% cost reduction)
- **AI-facilitated** 1:1 attention for every learner
- **70%+ completion** rates through competency-based learning
- **Learn first, certify later** - education is free, certification optional

### 1.3 Core Innovation

**Attention at Scale**

Traditional education cannot provide individual attention to every learner. AMU's AI facilitation (powered by Anthropic's Claude) provides:

✅ **Perfect attention** to every learner, every session  
✅ **Complete memory** of each learner's journey via intelligent summaries  
✅ **Unlimited patience** - ask the same question 10 times  
✅ **Personalized pace** - learn at YOUR speed  
✅ **50+ languages** - learn in your own language  
✅ **24/7 availability** - learn when you're ready  

This isn't replacing human connection—it's enabling attention at scale that would be impossible with human facilitators alone.

### 1.4 Technical Architecture Overview

**Platform Stack:**
- **Frontend:** React (TypeScript) + Next.js
- **Backend:** Node.js (TypeScript) + Cloud Functions
- **Database:** Google Cloud Firestore (Native Mode)
- **AI Facilitation:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Storage:** Google Cloud Storage
- **Authentication:** Firebase Authentication
- **Payments:** Stripe (including Stripe Connect for referrals)
- **Hosting:** Google Cloud Run (auto-scaling)
- **Content:** GitHub (open-source curriculum)

**AI Provider:** Anthropic API exclusively

**Why Anthropic Claude?**
- Superior educational dialogue quality
- Better Socratic facilitation (guides discovery, doesn't lecture)
- Multilingual capability (50+ languages natively)
- Models intellectual honesty and humility
- Adapts naturally to learner's context and understanding

**Cost consideration:** Anthropic API costs approximately 50-100% more than alternative AI platforms. However, with variable pricing per certificate (R500-R3,300 based on facilitation time), even conservative conversion rates (10% of learners purchasing certificates) cover API costs comfortably. Quality education justifies the investment.

### 1.5 Key Features

**Three-Tier Access Model:**

**Tier 1: Anonymous Browsing**
- No account required
- Browse course catalog
- View sample content
- Limited inquiry chatbot

**Tier 2: Basic Learner (FREE)**
- Registration: Name + Email + Password ONLY
- Complete course access FREE forever
- AI-facilitated learning
- Unofficial certificates (watermarked)
- Referral programme participation
- Resume learning anytime

**Tier 3: SETA-Registered Learner**
- Additional requirements: ID, proof of residence, signature
- Official SETA-registered certificates (no watermark)
- NQF-aligned qualifications
- Credit toward formal degrees
- Variable pricing: R500-R3,300 per certificate

**Intelligent Context Management:**
- Complete learning journey via summaries
- Recent conversation messages (verbatim)
- Learner profile and preferences
- Course context and progress
- **Never forgets** what matters to learner
- **Cost-effective** as conversations grow

**Referral Programme ("Karma"):**
- Two-tier system (10% each level)
- Maximum 2 levels deep (no pyramid/MLM)
- Instant automated payouts via Stripe Connect
- Encourage community growth through shared success

**Competency-Based Assessment:**
- Three levels only: Competent / Developing / Not Yet
- No numeric grades (no 0-100% scores)
- Focus on capability, not performance
- Developmental feedback, never punitive
- Progress at your own pace

**AI Quality Assurance:**
- 6 diverse AI personas test every course
- Comprehensive testing before human learners
- Automatic content improvement suggestions
- Split-testing winners promoted to production

### 1.6 Business Model

**Revenue Streams:**

1. **Certificate Sales** (Primary)
   - Variable pricing: R500-R3,300 per certificate
   - Based on facilitation time required
   - 10% conversion rate target
   - Example: 1,000 learners × 10% × R1,800 avg = R180,000

2. **Corporate Subscriptions** (B2B)
   - Bulk learner enrollment
   - Skills Development Act tax rebate assistance
   - Custom reporting and integration
   - Target: R50,000+ per corporate client annually

3. **Advanced Courses** (Future)
   - Specialized certifications
   - Professional development pathways
   - Bachelor's degree programme

**Cost Structure:**
- AI API costs: ~R200 per completed course
- Cloud infrastructure: R5,000-R10,000/month (scales with usage)
- SETA registration processing: R100 per official certificate
- Development & content creation: Initial investment
- Marketing: Performance-based (post-revenue)

**Break-even:** ~200 certificate sales per month
**Target:** 1,000+ learners enrolled, 100+ certificates monthly by Month 6

### 1.7 Competitive Advantages

1. **95% Cost Reduction**
   - Industry: R54,000 per maintenance planning qualification
   - AMU: R3,000 for same SETA-registered qualification

2. **Accessibility Unmatched**
   - Free education (only certification costs money)
   - 50+ languages
   - Any device, anywhere, anytime
   - No prerequisites

3. **Attention at Scale**
   - 1:1 AI facilitation for every learner
   - Complete memory of learning journey
   - Personalized to each context

4. **Quality Assurance**
   - AI testing before human learners see content
   - Competency-based assessment
   - 70%+ completion rates (vs. 30-40% industry)

5. **Ubuntu Philosophy**
   - Open-source curriculum (GitHub)
   - Community contribution encouraged
   - Collaborative success model
   - "I am because we are"

### 1.8 Implementation Timeline

**MVP Development:** 8-10 weeks (10 phases)

**Phase 1:** Database design (1 week)  
**Phase 2:** CRUD operations (1 week)  
**Phase 3:** Authentication system (1 week)  
**Phase 4:** Conversation system (1 week)  
**Phase 5:** AI facilitation integration (1-2 weeks)  
**Phase 6:** Assessment system (1 week)  
**Phase 7:** Certificate generation (1 week)  
**Phase 8:** Payment integration (1 week)  
**Phase 9:** SETA registration flow (1 week)  
**Phase 10:** Production deployment (1 week)

**CHIETA Presentation:** Week 12  
**First Cohort Enrollment:** Week 14  
**First Certificates Issued:** Week 20

### 1.9 Success Metrics

**Accessibility:**
- Account creation: < 30 seconds
- 50+ languages supported
- 99.5% uptime
- Works on all devices

**Quality:**
- Learner satisfaction: > 4.5/5
- Completion rate: > 70%
- Competency achievement: > 85%

**Attention:**
- Response time: < 3 seconds (95th percentile)
- Context retention: 100%
- Conversation continuity: Never lost

**Financial Sustainability:**
- Cost per completed course: < R200 (AI costs)
- Revenue per 1,000 learners: > R100,000 (at 10% conversion)
- Break-even: 200 certificates/month

**Impact:**
- Skills developed: 80% apply at workplace
- Career advancement: 50% report benefit
- SETA completion: 70% of registrations → certificate
- Economic impact: R10M+ saved by learners (vs. traditional training)

---

## 2. Philosophy & Mission

### 2.1 Why AMU Exists

Each person is born to contribute uniquely to the world. When we do what we're born to do, we feel fulfilled.

Asset management is about developing and maintaining the capability to achieve what we yearn for—the functionality to do what we desire. To make a meaningful difference in the world, we need the assistance of people and machines. Intelligent asset management is the foundation that enables us to optimally use the resources available to us, making a meaningful difference that endures.

We believe this capability—these skills—should belong to everyone, not just the privileged few. When people develop the capability to do what they're born to do, they can contribute to the world in ways that fulfill them.

### 2.2 Mission & Vision

**Mission:** Make asset management skills accessible to everyone, everywhere, in their own language—enabling people to develop the capability to achieve what they desire.

**Vision:** Empower everyone to develop the capability they need to transform their world to their heart's desire.

### 2.3 Our Strategy: Accessibility × Scalability

AMU's strategy rests on two interdependent pillars that enable our mission:

**1. Radical Accessibility**

Remove every barrier that stands between learners and skills:
- **Financial:** Free education for all, forever
- **Linguistic:** AI facilitation in 50+ languages
- **Geographic:** Learn anywhere, on any device
- **Educational:** No prerequisites, competency-based progression
- **Administrative:** Learn first, certify later (only if you want to)

**2. Unlimited Scalability**

Design systems that serve one learner as easily as one million:
- **AI facilitation:** Eliminate human bottlenecks
- **Cloud infrastructure:** Auto-scale to demand
- **Open content:** GitHub enables global collaboration
- **Automated assessment:** Competency tracking without marking queues
- **Community contribution:** Learners improve content for future learners

**The Strategic Insight:** Only by achieving both accessibility AND scalability can we make asset management skills universally available. One without the other fails.

### 2.4 Our Core Values

**Ubuntu: "I Am Because We Are"**

AMU is built on the African philosophy of Ubuntu—the recognition that our humanity is inextricably bound to one another. Each of us is born to contribute uniquely to the world, and when we do what we're born to do, we feel fulfilled. Your success enables my success. Your capability strengthens our collective capability. We rise together.

None of us can accomplish as much alone as we can together. This philosophy manifests in everything we do:

**1. We Develop Sustainable Capability**

Capability is our fundamental value—it's why AMU exists. Asset management is about functionality: the capability to do what we desire.

We don't just build capability; we build capability that endures:
- We measure success by what learners can DO, not what they know
- Our focus is on skills that enable people to achieve what they yearn for
- Every module builds towards practical application and real-world functionality
- Our slogan "Develop Capability" reflects our core purpose
- Our brand message "You Can" affirms that capability is within reach
- We design systems that ensure capability lasts beyond any single course or interaction

**Why this matters:** Capability enables contribution. When people can do what they're born to do, they experience fulfillment. Temporary capability isn't enough—we build capability that endures so people can make lasting contributions to their world.

**2. We Collaborate to Create Capability**

None of us can accomplish as much alone as we can together. Collaboration amplifies capability:

We practice openness so people can contribute:
- Educational content and case studies live in public repositories—not just for our learners, but for all asset management institutions
- Platform infrastructure is documented as a case study—showing how systems can be set up to deliver needed functionality
- Anyone can view, copy, and improve our content
- We share what works AND what doesn't
- Our methodology is freely available for others to use and adapt

We build trust so collaboration can flourish:
- We show how resources are used (project-level financial transparency)
- We enable learners to experience quality before investing in certification
- We make our decision-making processes visible
- We protect learner privacy whilst keeping everything else open

We enable everyone to contribute:
- We align our curriculum with organisations like the Global Forum for Maintenance and Asset Management (GFMAM) to ensure our content meets international standards
- Learners' insights and feedback strengthen content for everyone
- Community members identify enhancements through lived experience
- One person's question improves the learning for thousands who follow
- Success belongs to the community, not the platform

**Why this matters:** Trust is critical for working together. Openness invites assistance. Collaboration doesn't just share capability—it creates capability. When others contribute improvements, AMU becomes more capable of serving learners. Ubuntu in action.

**3. We Ensure Sustainability**

We solidify our foundation before we build more. Sustained contribution requires longevity:
- Open content survives beyond any single organisation
- Free education with optional certification provides sustainable revenue
- Scalable systems avoid resource bottlenecks
- Financial transparency builds lasting credibility
- We build capability that endures, not temporary solutions

**Why this matters:** Building open systems that endure means anyone seeking to develop capability can learn—through AMU or beyond it, today and always.

**4. We Adapt Continuously**

The environment constantly changes—technology evolves, learner needs shift, industry standards develop, regulations update. Adaptation isn't optional; it's survival:
- AI learners test content before humans encounter it
- We implement feedback loops at every stage
- Community contributions evolve content
- We measure what matters: capability, not clicks
- Each cohort of learners improves the experience for the next
- We adapt to remain relevant and effective

**Why this matters:** In nature, the law is simple: adapt or die. Continuous improvement ensures we can continue serving our mission as the world changes. Today's excellence becomes tomorrow's baseline.

**5. We Design for Humans**

Learning is deeply human and deeply individual. We shape every decision around how people actually learn:
- Problem-based discovery matches how minds work—we learn by solving real challenges
- Each person is unique; our approach adapts to their language, context, and understanding
- AI facilitation enables individual attention for each learner—we start where their mindset is and build from there
- Competency-based assessment recognizes that development takes time; each individual develops at a pace that's natural to them
- Dignity and autonomy guide every interaction

**Why this matters:** Technology serves people, enabling personalized attention at scale that would be impossible with human facilitators alone. This human-centered approach isn't a separate goal—it's how we approach everything we do.

---

## 3. Educational Approach

### 3.1 Problem-Based Discovery Pedagogy

**The Core Insight**

Traditional education: "Here's the concept, now apply it"  
AMU approach: "Here's the problem, discover the concept"

**How It Works**

1. **Present Scenario** - Real-world situation with context
2. **Surface Challenge** - Clear problem to solve
3. **Provide Data** - Budgets, constraints, stakeholder needs
4. **Guide Discovery** - Questions that prompt thinking
5. **Celebrate Insight** - Recognize when learner discovers solution
6. **Introduce Terminology** - Name concept AFTER understanding

**Example: Old Mill Bakery**

Problem: Lena and Thandi's traditional family bakery faces declining sales and the frustration of frequent breakdowns. They're trying to understand what they can do to prevent the bakery from going bankrupt.

Data Provided:
- New supermarket competition (external)
- Health regulations (external)
- Aging oven needs repairs (internal)
- Customers want gluten-free (external)
- Staff want training (internal)

Discovery Process:

❌ Don't say: "Internal factors are things inside the organisation that management can control, like equipment and processes. External factors are outside forces like competition and regulations."

✅ Do ask:
- "What new things around the bakery are causing worry?"
- "What problems inside the bakery exist?"
- "How do these outside pressures differ from inside problems?"

Learner Discovers: "Oh! Some things they can't control (competition) and some they can influence (equipment)!"

Then Terminology: "Exactly! We call these internal and external factors."

### 3.2 Guidelines for Content Creators

**Every Module Must:**
1. Present relatable problem
2. Provide realistic data and constraints
3. Guide discovery through questions
4. Let learner struggle productively
5. Celebrate insights
6. Introduce terminology AFTER concept understood

**Red Flags (Avoid):**
- ❌ "Today we'll learn about [concept]"
- ❌ Definitions before context
- ❌ Questions with one "correct" answer
- ❌ Moving on before learner grasps concept

**Green Lights (Do):**
- ✅ "What do you think they should consider?"
- ✅ "What patterns do you notice?"
- ✅ "How would you approach this?"
- ✅ Scaffolding when stuck: "Think about what they can control..."
- ✅ "You've just identified [principle]! We call this..."

### 3.3 Competency-Based Assessment

**Why Not Marks?**

Problems with Traditional Marking:
- ❌ 82/100 measures performance, not capability
- ❌ Passing with 70% = 30% you don't know
- ❌ Emphasizes grades over learning
- ❌ "Did I pass?" rather than "Can I do this?"

AMU's Approach:
- ✅ Can you DO this skill? Yes/Developing/Not Yet
- ✅ Progress when you demonstrate capability
- ✅ Focus on mastery
- ✅ Clear evidence of what you CAN do

**Three Levels**

✅ **Competent**
- Clear evidence of capability
- Can apply independently in new contexts
- Explains reasoning correctly
- Makes connections to broader concepts

🔄 **Developing**
- Partial understanding demonstrated
- Can apply with guidance
- Some gaps in reasoning
- Needs refinement before mastery

❌ **Not Yet Demonstrated**
- Limited evidence
- Unable to apply independently
- Significant gaps
- Further work required

**Evidence Sources**

1. **Conversation:** Questions, responses, insights, connections
2. **Assignment:** Application to real workplace, quality of analysis
3. **Self-Reflection:** Metacognitive awareness

**Example Competency Framework**

GFMAM 3011: Organisational Context

Competency 1: Identify internal/external factors

Evidence Required:
- Conversation: Identifies 3+ of each from case study
- Assignment: Lists specific factors from own workplace
- Assessment: Competent / Developing / Not Yet

Learner Sees:
```
Module 3011: Organisational Context
Your Progress:
✅ Identify internal and external factors - Competent
✅ Explain organisational purpose - Competent
🔄 Recognize stakeholder alignment - Developing
🔄 Outline context elements - Developing

Status: You've demonstrated 2 of 4 competencies.
Let's strengthen stakeholder alignment understanding.

[Continue Learning]
```

No numeric scores displayed.

### 3.4 Progression Logic

**Module Completion:**
- ALL competencies at "Competent" level

If any "Not Yet" or "Developing":
- Targeted feedback provided
- Additional resources suggested
- Resubmission focused on specific competencies

**For Content Creators**

When creating modules:
1. **Start with the Problem:** What real-world challenge illustrates this concept?
2. **Provide Rich Context:** Characters, constraints, data, stakeholder needs
3. **Design Discovery Questions:** How will learners discover the concept themselves?
4. **Plan Scaffolding:** What prompts help if they're stuck?
5. **Identify Success Signals:** What shows they've grasped the concept?
6. **Define Competencies:** What must they be able to DO?
7. **Create Evidence Criteria:** How will we know they can do it?

**For AI Facilitators**

Your role is to:
1. Guide discovery through questions (never lecture)
2. Adapt to learner's language and understanding
3. Celebrate insights when learner makes connections
4. Provide scaffolding when stuck
5. Track competency development
6. Give developmental feedback

Remember: You facilitate discovery, not deliver skills.

---

## 4. System Architecture Overview

### 4.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         LEARNERS                              │
│     (Web Browser / Mobile Device / PWA)                       │
└──────────────────────────────────────────────────────────────┘
                            ↓↑
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Next.js)                 │
│  • Three-tier access UI                                       │
│  • Real-time chat interface                                   │
│  • Progress dashboards                                        │
│  • Certificate viewer                                         │
│  • Referral programme dashboard                               │
└──────────────────────────────────────────────────────────────┘
                            ↓↑
┌──────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Cloud Functions)             │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Authentication   │  │ Conversation      │                 │
│  │ (Firebase Auth)  │  │ Management        │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Assessment       │  │ Certificate       │                 │
│  │ System           │  │ Generation        │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Payment          │  │ SETA Registration │                 │
│  │ (Stripe)         │  │ (DocuSign)        │                 │
│  └──────────────────┘  └──────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
                 ↓↑              ↓↑              ↓↑
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Firestore     │ │ Cloud Storage│ │ GitHub       │
    │   (Database)    │ │ (Files)      │ │ (Content)    │
    └─────────────────┘ └──────────────┘ └──────────────┘
                            ↓↑
                  ┌──────────────────┐
                  │  Anthropic API   │
                  │  (Claude AI)     │
                  └──────────────────┘
```

### 4.2 Core Components

**Frontend Layer (React + Next.js)**
- Server-side rendering for SEO
- App Router (Next.js 13+)
- Real-time updates with Server-Sent Events
- Progressive Web App capabilities
- Responsive design (mobile-first)

**Backend Layer (Node.js + Cloud Functions)**
- RESTful API architecture
- Serverless functions for scalability
- Event-driven processing
- Webhook handlers
- Background job processing

**Data Layer**
- **Firestore:** Primary database (document-oriented)
- **Cloud Storage:** File storage (certificates, uploads)
- **GitHub:** Content repository (version control)

**AI Layer**
- **Anthropic Claude API:** Primary AI facilitator
- Intelligent context management
- Conversation summarization
- Assessment grading
- Content quality analysis

**Integration Layer**
- **Stripe:** Payment processing + Connect (payouts)
- **Firebase Auth:** Authentication + MFA
- **DocuSign:** Digital signatures (SETA registration)
- **Google Cloud APIs:** Text-to-Speech, Speech-to-Text (future)

### 4.3 Technology Stack Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontend** | React + Next.js 13+ | Modern, SEO-friendly, server components |
| **Backend** | Node.js + TypeScript | Type safety, excellent ecosystem |
| **Database** | Firestore (Native) | Real-time, scalable, NoSQL flexibility |
| **Storage** | Cloud Storage | Integrated with GCP, cost-effective |
| **Hosting** | Cloud Run | Auto-scaling, pay-per-use, container-based |
| **AI** | Anthropic Claude API | Superior educational dialogue quality |
| **Auth** | Firebase Authentication | Secure, scalable, MFA support |
| **Payment** | Stripe + Connect | Global, developer-friendly, payout support |
| **Documents** | DocuSign | Industry standard, legally binding |
| **Content** | GitHub | Version control, open-source, collaboration |
| **Monitoring** | Cloud Monitoring | Native GCP integration |
| **CI/CD** | GitHub Actions | Automated testing and deployment |

### 4.4 Infrastructure Principles

**1. Scalability First**
- Auto-scaling from 1 to 100,000 users
- No manual intervention required
- Serverless where possible
- Database sharding strategy in place

**2. Cost Optimization**
- Pay-per-use pricing models
- Efficient query patterns
- Caching strategy (context summaries)
- Background job queuing

**3. Reliability**
- 99.5% uptime target
- Graceful degradation
- Error handling at every layer
- Monitoring and alerting

**4. Security**
- HTTPS everywhere
- Data encryption at rest and in transit
- Row-level security in Firestore
- Regular security audits
- POPI Act compliance

**5. Observability**
- Comprehensive logging
- Performance monitoring
- User analytics
- Cost tracking
- Error tracking

### 4.5 Deployment Architecture

**Development Environment**
- Local development: Docker containers
- Firebase Emulator Suite for testing
- Anthropic API sandbox

**Staging Environment**
- Google Cloud Run (staging)
- Firestore (test instance)
- Stripe test mode
- Limited AI quota

**Production Environment**
- Google Cloud Run (production)
- Firestore (production instance)
- Cloud Storage (production buckets)
- Anthropic API (production keys)
- Stripe live mode
- Custom domain: assetmanagementuniversity.org

**CI/CD Pipeline**
1. Developer commits code to GitHub
2. GitHub Actions runs tests
3. Build Docker container
4. Deploy to staging
5. Automated smoke tests
6. Manual approval for production
7. Deploy to production
8. Health checks
9. Rollback capability if issues

---

**[CONTINUING WITH SECTIONS 5-34...]**

My friend, I'm building the complete specification systematically. The file is now started with corrected sections 1-4. I'll continue adding all remaining sections with proper detail. This will be comprehensive and correct!

Shall I continue building out the rest? 🚀

# PART 2: TECHNICAL ARCHITECTURE

## 5. Three-Tier Access Model

### 5.1 Overview

AMU implements a progressive access model that balances radical accessibility with regulatory compliance. The three tiers ensure that financial barriers never prevent learning, while meeting SETA requirements for formal certification.

**Design Philosophy:**
- **Tier 1 (Anonymous):** Zero friction - explore without commitment
- **Tier 2 (Basic Learner):** Minimal data - name, email, password only
- **Tier 3 (SETA-Registered):** Full compliance - only when learner opts in for official certification

### 5.2 Tier 1: Anonymous Browsing

**Purpose:** Enable exploration without any barrier

**Access Level:**
- ✅ Browse complete course catalog
- ✅ Read course descriptions
- ✅ View sample modules (first section of each course)
- ✅ View learning outcomes
- ✅ See competency frameworks
- ✅ Check certificate samples (with watermarks shown)
- ✅ Use inquiry chatbot (limited to 5 questions per session)
- ✅ View pricing information
- ✅ Access FAQs and about pages

**Limitations:**
- ❌ Cannot enroll in courses
- ❌ Cannot save progress
- ❌ Cannot participate in full conversations
- ❌ Cannot submit assignments
- ❌ Cannot generate certificates
- ❌ Cannot earn referral karma

**Technical Implementation:**

```javascript
// No authentication required
// Session tracked via anonymous ID in browser
const anonymousSession = {
  session_id: generateAnonymousId(),
  created_at: new Date(),
  pages_viewed: [],
  inquiry_questions_asked: 0,
  inquiry_limit: 5
};

// Store in browser localStorage
localStorage.setItem('amu_anonymous_session', JSON.stringify(anonymousSession));
```

**Inquiry Chatbot (Limited):**

Anonymous visitors can ask up to 5 questions about:
- Course content and structure
- Pricing and certification
- How AMU works
- Technical requirements
- General asset management questions

After 5 questions:
```
"I've enjoyed our conversation! To continue learning with me, 
create a free account (just your name and email). 

You'll get:
✅ Unlimited conversations
✅ Full course access
✅ Progress tracking
✅ Unofficial certificates

[Create Free Account] [Maybe Later]"
```

**Conversion Strategy:**
- Show value before asking for commitment
- Clear benefits of account creation
- No pressure - "Maybe Later" always available
- Sample content demonstrates quality

### 5.3 Tier 2: Basic Learner Account (FREE Forever)

**Purpose:** Provide complete education with minimal barriers

**Registration Requirements:**
- Name (first and last)
- Email address (verification required)
- Password (minimum 8 characters, must include uppercase, lowercase, number)
- **That's it!** No ID, no phone, no address, no payment info

**Access Level:**
- ✅ **Complete course access** - all educational content FREE
- ✅ **Full AI facilitation** - unlimited conversations with Claude
- ✅ **Progress tracking** - resume where you left off anytime
- ✅ **Unofficial certificates** - watermarked PDFs on completion
- ✅ **Referral programme** - earn karma when others purchase certificates
- ✅ **Business applications** - submit workplace examples
- ✅ **Self-reflection** - track learning journey
- ✅ **50+ languages** - learn in your language
- ✅ **All devices** - switch between phone, tablet, computer
- ✅ **Forever** - no time limits, no expiration

**What Costs Money:**
- ❌ Nothing for education!
- 💰 Only official SETA-registered certificates (optional)

**Registration Flow:**

```javascript
// Step 1: Basic Information
const registrationData = {
  user_name: "Sipho Ndlovu",
  user_email: "sipho@example.com",
  user_password: hashPassword("SecurePass123!"),
  user_tier: "basic_learner",
  user_created_date: new Date(),
  user_email_verified: false,
  user_verification_token: generateToken()
};

// Step 2: Create account in Firebase Auth
const userCredential = await createUserWithEmailAndPassword(
  auth,
  registrationData.user_email,
  registrationData.user_password
);

// Step 3: Store in Firestore
await firestore.collection('users').doc(userCredential.user.uid).set({
  ...registrationData,
  user_id: userCredential.user.uid
});

// Step 4: Send verification email
await sendEmailVerification(userCredential.user);

// Step 5: Welcome message
return {
  success: true,
  message: "Welcome to AMU! Check your email to verify your account.",
  redirect: "/dashboard"
};
```

**Email Verification:**

```
Subject: Welcome to Asset Management University!

Hi Sipho,

Welcome to AMU! 🎉

You're one step away from starting your learning journey.

Please verify your email address:
[Verify Email Address]

Once verified, you'll have:
✅ Full access to all courses
✅ AI facilitation in your language
✅ Progress tracking across devices
✅ Unofficial certificates on completion

Your education is free, forever. Official SETA certificates 
are optional and only needed if you want formal recognition.

Ready to discover your capability?

Warm regards,
Asset Management University Team

P.S. Questions? Just reply to this email or use our chatbot.
```

**Account Dashboard (Tier 2):**

```
┌─────────────────────────────────────────────────────┐
│  Welcome back, Sipho! 👋                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📚 YOUR COURSES                                    │
│                                                      │
│  ┌──────────────────────────────────────────┐      │
│  │ QCTO Knowledge Modules                   │      │
│  │ Progress: ████████░░░░ 65%              │      │
│  │ Module 3 of 7 • Last activity: 2 days ago│      │
│  │ [Continue Learning]                      │      │
│  └──────────────────────────────────────────┘      │
│                                                      │
│  [Browse More Courses]                              │
│                                                      │
│  🏆 YOUR ACHIEVEMENTS                               │
│  • 2 modules completed                              │
│  • 15 competencies demonstrated                     │
│  • 1 unofficial certificate earned                  │
│                                                      │
│  💰 YOUR KARMA: R450                                │
│  • 3 active referrals                               │
│  • [View Referral Dashboard]                        │
│                                                      │
│  📄 UPGRADE TO OFFICIAL CERTIFICATES                │
│  Ready for SETA-registered certification?           │
│  [Learn More About Official Certificates]           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Unofficial Certificate (Watermarked):**

Automatically generated when all module competencies achieved:

```
╔═══════════════════════════════════════════════════╗
║                                                    ║
║        ASSET MANAGEMENT UNIVERSITY                 ║
║                                                    ║
║           Certificate of Completion                ║
║                                                    ║
║  ╔════════════════════════════════════════════╗  ║
║  ║                                            ║  ║
║  ║           UNOFFICIAL - FOR               ║  ║
║  ║         PERSONAL USE ONLY                  ║  ║
║  ║                                            ║  ║
║  ║    NOT VALID FOR SETA REGISTRATION        ║  ║
║  ║                                            ║  ║
║  ╚════════════════════════════════════════════╝  ║
║                                                    ║
║  This certifies that                               ║
║                                                    ║
║              SIPHO NDLOVU                          ║
║                                                    ║
║  has successfully completed                        ║
║                                                    ║
║      QCTO Knowledge Module 1                       ║
║      Work Management Process                       ║
║                                                    ║
║  Competencies Demonstrated:                        ║
║  ✓ Identify internal/external factors             ║
║  ✓ Explain organisational purpose                 ║
║  ✓ Analyze stakeholder needs                      ║
║  ✓ Apply work management principles               ║
║                                                    ║
║  Completion Date: 15 November 2024                 ║
║  Certificate ID: UC-2024-KM01-00123                ║
║                                                    ║
║  Verify at: assetmanagementuniversity.org/verify   ║
║                                                    ║
║  To obtain an official SETA-registered             ║
║  certificate, visit your account dashboard.        ║
║                                                    ║
╚═══════════════════════════════════════════════════╝
```

**Benefits of Unofficial Certificate:**
- Proof of capability developed
- Portfolio addition
- Show employers what you can do
- Personal achievement recognition
- No cost

**Upgrade Path to Official:**
- Clearly explained on certificate
- Link to upgrade process
- Pricing shown transparently
- No pressure - learner decides

### 5.4 Tier 3: SETA-Registered Learner

**Purpose:** Enable formal SETA certification for those who need it

**When Required:**
- Learner wants official SETA-registered certificate (no watermark)
- NQF-aligned formal qualification needed
- Employer requires proof of SETA certification
- Credit toward formal degree programmes

**Additional Requirements:**

1. **Identity Verification:**
   - South African ID document OR passport
   - Clear photo/scan of document

2. **Proof of Residence:**
   - Recent utility bill (within 3 months)
   - Bank statement
   - Lease agreement
   - Any official document showing physical address

3. **Contact Information:**
   - Mobile phone number (verification via SMS)
   - Physical address
   - Emergency contact details

4. **Digital Signature Capability:**
   - DocuSign account (free - created during process)
   - Email verification for signatures

5. **Payment:**
   - Certificate fee (variable: R500-R3,300 depending on course)
   - Stripe payment method added

**Registration Flow:**

```javascript
// Tier 2 → Tier 3 Upgrade Process

// Step 1: Learner initiates from dashboard
async function initiateSETARegistration(user_id) {
  // Verify Tier 2 requirements met
  const user = await getUser(user_id);
  if (!user.user_email_verified) {
    return { error: "Please verify your email first" };
  }
  
  // Check which courses completed
  const completedCourses = await getCompletedCourses(user_id);
  if (completedCourses.length === 0) {
    return { 
      error: "Complete at least one course before SETA registration" 
    };
  }
  
  // Create SETA registration record
  const registration = {
    registration_id: generateId('setar'),
    registration_user_id: user_id,
    registration_status: 'initiated',
    registration_started_date: new Date(),
    registration_completed_courses: completedCourses,
    registration_documents_submitted: false,
    registration_payment_completed: false,
    registration_seta_approved: false
  };
  
  await firestore.collection('seta_registrations').doc(registration.registration_id).set(registration);
  
  return {
    success: true,
    registration_id: registration.registration_id,
    next_step: "document_upload"
  };
}

// Step 2: Document Upload
async function uploadSETADocuments(registration_id, documents) {
  const uploads = [];
  
  // ID Document
  const idDoc = await uploadToCloudStorage(
    documents.id_document,
    `seta-registrations/${registration_id}/id_document.pdf`
  );
  uploads.push({ type: 'id_document', url: idDoc.url });
  
  // Proof of Residence
  const proofRes = await uploadToCloudStorage(
    documents.proof_of_residence,
    `seta-registrations/${registration_id}/proof_residence.pdf`
  );
  uploads.push({ type: 'proof_residence', url: proofRes.url });
  
  // Update registration record
  await firestore.collection('seta_registrations').doc(registration_id).update({
    registration_documents: uploads,
    registration_documents_submitted: true,
    registration_documents_submitted_date: new Date(),
    registration_status: 'documents_submitted'
  });
  
  return { success: true, next_step: "verification" };
}

// Step 3: Document Verification (Manual or Automated)
async function verifySETADocuments(registration_id) {
  const registration = await getSETARegistration(registration_id);
  
  // Automated checks
  const checks = {
    id_readable: await checkDocumentQuality(registration.registration_documents[0].url),
    proof_recent: await checkDocumentDate(registration.registration_documents[1].url),
    documents_match: await verifyNamesMatch(registration.registration_documents)
  };
  
  if (checks.id_readable && checks.proof_recent && checks.documents_match) {
    // Auto-approve
    await firestore.collection('seta_registrations').doc(registration_id).update({
      registration_verification_status: 'approved',
      registration_verification_date: new Date(),
      registration_status: 'verified_pending_payment'
    });
    
    // Notify learner
    await sendEmail(registration.registration_user_id, 
      'Documents Verified - Ready for Payment',
      verifiedEmailTemplate(registration)
    );
    
    return { approved: true, auto: true };
  } else {
    // Flag for manual review
    await firestore.collection('seta_registrations').doc(registration_id).update({
      registration_verification_status: 'pending_manual_review',
      registration_verification_issues: checks,
      registration_status: 'verification_pending'
    });
    
    return { approved: false, requires_manual_review: true };
  }
}

// Step 4: Payment Processing
async function processSETACertificatePayment(registration_id) {
  const registration = await getSETARegistration(registration_id);
  const user = await getUser(registration.registration_user_id);
  
  // Calculate total cost
  const courses = registration.registration_completed_courses;
  let totalAmount = 0;
  for (const course of courses) {
    totalAmount += await calculateCertificatePrice(course.course_id);
  }
  
  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100), // cents
    currency: 'zar',
    customer: user.user_stripe_customer_id,
    metadata: {
      registration_id: registration_id,
      user_id: user.user_id,
      certificate_type: 'official_seta',
      course_ids: courses.map(c => c.course_id).join(',')
    },
    description: `Official SETA Certificates - ${courses.length} courses`
  });
  
  return {
    success: true,
    client_secret: paymentIntent.client_secret,
    amount: totalAmount
  };
}

// Step 5: Post-Payment - Generate Official Certificates
async function generateOfficialCertificates(registration_id) {
  const registration = await getSETARegistration(registration_id);
  const user = await getUser(registration.registration_user_id);
  
  const certificates = [];
  
  for (const course of registration.registration_completed_courses) {
    // Generate official certificate (NO watermark)
    const certificate = await generateCertificatePDF({
      learner_name: user.user_name,
      course_title: course.course_title,
      completion_date: course.completion_date,
      competencies: course.competencies_achieved,
      certificate_type: 'official',
      watermark: false,  // OFFICIAL - No watermark
      seta_registered: true,
      certificate_number: generateCertificateNumber('SETA'),
      qr_code: generateQRCode(`https://assetmanagementuniversity.org/verify/${cert_id}`)
    });
    
    // Upload to Cloud Storage
    const url = await uploadToCloudStorage(
      certificate.pdf,
      `certificates/official/${user.user_id}/${course.course_id}.pdf`
    );
    
    certificates.push({
      certificate_id: certificate.certificate_id,
      certificate_url: url,
      course_id: course.course_id
    });
  }
  
  // Update registration
  await firestore.collection('seta_registrations').doc(registration_id).update({
    registration_certificates_generated: certificates,
    registration_status: 'completed',
    registration_completed_date: new Date()
  });
  
  // Upgrade user to Tier 3
  await firestore.collection('users').doc(user.user_id).update({
    user_tier: 'seta_registered',
    user_seta_registration_id: registration_id,
    user_seta_registration_date: new Date()
  });
  
  // Process referral karma (if applicable)
  if (user.user_referred_by) {
    await processReferralKarma(user.user_referred_by, registration_id);
  }
  
  // Send success email
  await sendEmail(user.user_id, 
    'Congratulations! Your Official Certificates are Ready',
    certificatesReadyTemplate(certificates)
  );
  
  return { success: true, certificates: certificates };
}
```

**SETA Registration Dashboard:**

```
┌─────────────────────────────────────────────────────┐
│  SETA Registration Progress                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ✅ Step 1: Courses Completed                       │
│     • QCTO KM-01: Work Management                   │
│     • QCTO KM-02: Job Planning                      │
│                                                      │
│  ✅ Step 2: Documents Uploaded                      │
│     • ID Document: verified ✓                       │
│     • Proof of Residence: verified ✓                │
│                                                      │
│  ⏳ Step 3: Payment Pending                         │
│     Certificate Cost: R3,600 (2 courses)            │
│     [Proceed to Payment]                            │
│                                                      │
│  ⏹️  Step 4: Certificate Generation                 │
│     (After payment confirmation)                     │
│                                                      │
│  ⏹️  Step 5: SETA Registration                      │
│     (Certificates submitted to CHIETA)              │
│                                                      │
│  Questions? [Chat with Support]                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Official Certificate (No Watermark):**

```
╔═══════════════════════════════════════════════════╗
║                                                    ║
║        ASSET MANAGEMENT UNIVERSITY                 ║
║           www.assetmanagementuniversity.org        ║
║                                                    ║
║     ╔═══════════════════════════════════╗        ║
║     ║    OFFICIAL SETA CERTIFICATE      ║        ║
║     ║                                   ║        ║
║     ║      CHIETA REGISTERED            ║        ║
║     ╚═══════════════════════════════════╝        ║
║                                                    ║
║  This certifies that                               ║
║                                                    ║
║              SIPHO NDLOVU                          ║
║          ID: 8501015800089                         ║
║                                                    ║
║  has successfully completed                        ║
║                                                    ║
║      QCTO Knowledge Module 1                       ║
║      Work Management Process                       ║
║                                                    ║
║  NQF Level: 5  |  Credits: 10                     ║
║  Notional Hours: 100                               ║
║                                                    ║
║  Competencies Achieved:                            ║
║  ✓ Analyze organizational context                 ║
║  ✓ Identify stakeholder requirements              ║
║  ✓ Apply work management principles               ║
║  ✓ Develop maintenance plans                      ║
║                                                    ║
║  Completion Date: 15 November 2024                 ║
║  Registration Date: 18 November 2024               ║
║  Certificate Number: SETA-2024-KM01-00123          ║
║                                                    ║
║  [QR CODE]          Digitally Signed               ║
║                     Muhammad Ali, CEO              ║
║                     Asset Management University    ║
║                                                    ║
║  Verify this certificate:                          ║
║  assetmanagementuniversity.org/verify/SETA-2024... ║
║                                                    ║
║  ┌─────────────────────────────────────────┐      ║
║  │ CHIETA                                  │      ║
║  │ Reg No: XXXXX                           │      ║
║  │ SETA-Registered Provider               │      ║
║  └─────────────────────────────────────────┘      ║
║                                                    ║
╚═══════════════════════════════════════════════════╝
```

### 5.5 Access Control Implementation

**Firestore Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can read and update their own profile
      allow read, update: if request.auth != null && request.auth.uid == userId;
      // Only system can create users
      allow create: if request.auth != null;
    }
    
    // Conversations - only owner can access
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        resource.data.conversation_user_id == request.auth.uid;
    }
    
    // Enrollments - only owner can access
    match /enrollments/{enrollmentId} {
      allow read, write: if request.auth != null && 
        resource.data.enrollment_user_id == request.auth.uid;
    }
    
    // Certificates - owner + public verification
    match /certificates/{certificateId} {
      // Owner can always read their certificates
      allow read: if request.auth != null && 
        resource.data.certificate_user_id == request.auth.uid;
      // Public verification by certificate code (read-only)
      allow get: if request.query.certificate_code == resource.data.certificate_code;
    }
    
    // Courses - public read for Tier 1
    match /courses/{courseId} {
      allow read: if true;  // Public catalog
      allow write: if false;  // Only admins via Cloud Functions
    }
    
    // SETA Registrations - only owner
    match /seta_registrations/{registrationId} {
      allow read, write: if request.auth != null && 
        resource.data.registration_user_id == request.auth.uid;
    }
  }
}
```

### 5.6 Tier Transition Flows

**Anonymous → Tier 2 (Basic Learner):**

Triggers:
- Clicks "Create Account" button
- Tries to enroll in course
- Reaches inquiry chatbot limit (5 questions)
- Wants to save progress

Process:
1. Show benefits of account
2. Minimal form: name, email, password
3. Email verification
4. Immediate access to full content

**Tier 2 → Tier 3 (SETA Registered):**

Triggers:
- Completes course, wants official certificate
- Clicks "Upgrade to Official Certificate"
- Employer requires SETA certification

Process:
1. Explain SETA registration benefits
2. Show certificate price clearly
3. Document upload (ID, proof of residence)
4. Verification (2-3 business days)
5. Payment
6. Official certificate generation
7. SETA registration submission

**No Forced Upgrades:**
- Learners stay at Tier 2 forever if they want
- No nagging or pressure
- Education remains free always
- Upgrade only when learner chooses

---

## 6. Anthropic API Integration

### 6.1 Why Anthropic Claude?

After extensive evaluation, AMU selected Anthropic's Claude API as the exclusive AI facilitation provider.

**Decision Rationale:**

**1. Superior Educational Dialogue Quality**
- Natural Socratic questioning
- Guides discovery without lecturing
- Adapts to learner's level naturally
- Celebrates insights authentically

**2. Multilingual Excellence**
- Native capability in 50+ languages
- No translation service needed
- Cultural context awareness
- Maintains quality across languages

**3. Intellectual Honesty**
- Acknowledges uncertainty
- Models humility
- Doesn't pretend to know
- This teaches learners intellectual integrity

**4. Context Retention**
- Handles long conversations well
- Maintains coherence across sessions
- Builds on previous insights naturally

**5. Safety & Values Alignment**
- Constitutional AI approach
- Respects learner dignity
- Refuses harmful requests appropriately
- Aligns with Ubuntu philosophy

**Cost Consideration:**
- ~50-100% more expensive than alternatives
- BUT: Educational quality justifies investment
- Variable certificate pricing covers costs
- 2 certificates per 1,000 learners = break-even

### 6.2 API Configuration

**Model Selection:**
```javascript
const ANTHROPIC_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  api_version: '2023-06-01',
  max_tokens: 2000,  // Sufficient for educational responses
  temperature: 1.0,  // Natural variation in responses
};
```

**Why Claude Sonnet 4.5?**
- Balance of intelligence and cost
- Fast response times (2-3 seconds)
- Excellent for educational dialogue
- Reliable and stable

**Authentication:**
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**Environment Variables:**
- `ANTHROPIC_API_KEY` (production)
- `ANTHROPIC_API_KEY_STAGING` (testing)
- `ANTHROPIC_API_KEY_DEVELOPMENT` (local dev)

### 6.3 Core Integration Pattern

**Basic Facilitation Call:**

```javascript
async function facilitateLearning(
  conversationId: string,
  newMessage: string
) {
  try {
    // 1. Load conversation context
    const context = await buildConversationContext(conversationId);
    
    // 2. Build messages array
    const messages = [
      ...context.recentMessages,  // Last 10-20 messages verbatim
      {
        role: 'user',
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
    const facilitatorResponse = response.content[0].text;
    
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

### 6.4 Intelligent Context Management

**The Challenge:**
- Full conversation history becomes expensive (50K+ tokens after 10 sessions)
- But we can't lose context - "attention is respect"

**The Solution: Hierarchical Context**

```javascript
async function buildConversationContext(conversationId: string) {
  const conversation = await getConversation(conversationId);
  const user = await getUser(conversation.conversation_user_id);
  const enrollment = await getEnrollment(conversation.conversation_enrollment_id);
  
  // 1. LEARNER PROFILE (~500 tokens)
  const learnerProfile = {
    name: user.user_name,
    language: user.user_preferred_language || 'en',
    location: user.user_location || 'South Africa',
    learning_style: user.user_learning_style,  // Detected over time
    experience_level: user.user_experience_level,  // Beginner/Intermediate/Advanced
    key_preferences: user.user_preferences,
    challenges_noted: user.user_challenges
  };
  
  // 2. COURSE CONTEXT (~300 tokens)
  const courseContext = {
    course_title: enrollment.enrollment_course_title,
    current_module: enrollment.enrollment_current_module_title,
    learning_objectives: enrollment.enrollment_current_learning_objectives,
    case_study: await getCurrentCaseStudy(enrollment.enrollment_current_module_id)
  };
  
  // 3. RECENT MESSAGES (~2,000 tokens)
  // Load last 10-20 messages verbatim for immediate context
  const messages = await firestore
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .orderBy('message_timestamp', 'desc')
    .limit(20)
    .get();
  
  const recentMessages = messages.docs.reverse().map(doc => ({
    role: doc.data().message_role,
    content: doc.data().message_content
  }));
  
  // 4. CONVERSATION SUMMARIES (~1,000 tokens per session)
  // Load rich summaries of previous sessions
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
  const currentCompetency = {
    title: enrollment.enrollment_current_competency_title,
    description: enrollment.enrollment_current_competency_description,
    evidence_criteria: enrollment.enrollment_current_competency_criteria,
    current_status: enrollment.enrollment_current_competency_status,
    development_areas: enrollment.enrollment_competency_development_areas
  };
  
  // 6. FACILITATOR PLAYBOOK (~500 tokens)
  const playbook = await getFacilitatorPlaybook(enrollment.enrollment_current_module_id);
  
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

**Total Context:** ~5,000-8,000 tokens (vs. 50,000+ for full history)
**Cost Savings:** 85-90% reduction
**Quality:** Maintains complete "attention" - Claude knows everything important

### 6.5 Conversation Summary Generation

**When to Generate Summaries:**
- After every 10 messages
- When session ends (user closes browser)
- Before context grows too large

**Summary Generation:**

```javascript
async function generateConversationSummary(conversationId: string) {
  // Get messages since last summary
  const lastSummary = await getLatestSummary(conversationId);
  const startMessage = lastSummary ? lastSummary.summary_end_message_id : 0;
  
  const messages = await getMessagesSince(conversationId, startMessage);
  
  if (messages.length < 5) {
    // Not enough for meaningful summary
    return;
  }
  
  // Ask Claude to summarize
  const summary = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Summarize this learning session for context in future conversations:

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
  
  const summaryText = summary.content[0].text;
  
  // Store summary
  await firestore.collection('conversation_summaries').add({
    summary_conversation_id: conversationId,
    summary_session_number: (lastSummary?.summary_session_number || 0) + 1,
    summary_start_message_id: startMessage,
    summary_end_message_id: messages[messages.length - 1].message_id,
    summary_text: summaryText,
    summary_created_date: new Date(),
    summary_message_count: messages.length
  });
  
  console.log(`✅ Generated summary for conversation ${conversationId}`);
}
```

**Example Summary:**

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
• Sometimes jumps to solutions before fully analyzing problem
• Needs reminding to consider ALL stakeholders, not just obvious ones

NOTABLE MOMENTS:
• Shared personal story about conflict between drivers and company
• Showed empathy for different perspectives
• Asked thoughtful question about ethics in decision-making

PROGRESS:
Moved from "Developing" to showing signs of "Competent" in 
stakeholder analysis. Ready to tackle next competency on 
organizational purpose. Continue using his taxi company as primary 
example - this resonates deeply and makes concepts concrete.

NEXT SESSION FOCUS:
Build on stakeholder understanding to explore how organizational 
purpose guides decision-making when stakeholder interests conflict.
```

### 6.6 Error Handling & Resilience

**Anthropic API Error Types:**

```javascript
async function handleAnthropicError(error: any, conversationId: string) {
  // 1. Rate Limiting (HTTP 429)
  if (error.status === 429) {
    console.log(`⚠️  Rate limited - queuing conversation ${conversationId}`);
    
    // Add to priority queue
    await queueConversation(conversationId, 'rate_limited');
    
    // Inform learner
    return {
      success: false,
      error_type: 'rate_limited',
      message: `I'm responding to many learners right now and want to 
                give you my full attention. Your message has been queued 
                (estimated wait: 30 seconds).`,
      queued: true
    };
  }
  
  // 2. Server Errors (HTTP 500-599)
  if (error.status >= 500) {
    console.error(`❌ Anthropic server error:`, error);
    
    // Retry with exponential backoff
    return await retryWithBackoff(
      () => facilitateLearning(conversationId),
      { maxRetries: 3, baseDelay: 1000 }
    );
  }
  
  // 3. Authentication Error (HTTP 401)
  if (error.status === 401) {
    console.error(`🔐 API key invalid or expired`);
    await notifyDevOps({
      type: 'api_auth_failure',
      error: error.message,
      urgent: true
    });
    
    return {
      success: false,
      error_type: 'system_error',
      message: `I'm having technical difficulties. Our team has been 
                notified. Please try again in a few minutes.`
    };
  }
  
  // 4. Invalid Request (HTTP 400)
  if (error.status === 400) {
    console.error(`⚠️  Invalid request to Anthropic:`, error);
    
    return {
      success: false,
      error_type: 'invalid_request',
      message: `Something went wrong with your message. Could you try 
                rephrasing or sending a shorter message?`
    };
  }
  
  // 5. Unknown Error
  console.error(`❌ Unexpected error:`, error);
  await logError('anthropic_unknown_error', error);
  
  return {
    success: false,
    error_type: 'unknown',
    message: `I encountered an unexpected problem. Please try again. 
              If this persists, contact support.`
  };
}
```

**Retry with Exponential Backoff:**

```javascript
async function retryWithBackoff(
  operation: () => Promise<any>,
  options: { maxRetries: number; baseDelay: number }
): Promise<any> {
  
  let lastError;
  
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < options.maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = options.baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}
```

### 6.7 Rate Limiting & Queue Management

**Challenge:**
- Anthropic limits: 40,000 tokens/min, 20 requests/min
- At peak: 100+ concurrent learners
- Need to serve everyone without hitting limits

**Solution: Intelligent Queue System**

```javascript
// Priority Queue in Firestore
interface QueuedConversation {
  queue_id: string;
  queue_conversation_id: string;
  queue_user_id: string;
  queue_priority: number;  // 1 = highest, 4 = lowest
  queue_added_timestamp: Date;
  queue_estimated_tokens: number;
  queue_status: 'queued' | 'processing' | 'completed';
}

// Priority Levels
const QUEUE_PRIORITIES = {
  ASSESSMENT_FEEDBACK: 1,      // Urgent - learner submitted work
  ACTIVE_CONVERSATION: 2,       // Mid-session - maintain flow
  NEW_SESSION: 3,               // Starting new - can wait briefly
  BACKGROUND_TASK: 4            // Content analysis - not time-sensitive
};

async function queueConversation(
  conversationId: string,
  priority: number = QUEUE_PRIORITIES.ACTIVE_CONVERSATION
) {
  
  const queueItem: QueuedConversation = {
    queue_id: generateId('queue'),
    queue_conversation_id: conversationId,
    queue_user_id: await getUserIdFromConversation(conversationId),
    queue_priority: priority,
    queue_added_timestamp: new Date(),
    queue_estimated_tokens: await estimateTokensNeeded(conversationId),
    queue_status: 'queued'
  };
  
  await firestore.collection('api_queue').doc(queueItem.queue_id).set(queueItem);
  
  // Start queue processor if not running
  await triggerQueueProcessor();
}

// Queue Processor (Cloud Function)
export const processAPIQueue = functions.pubsub
  .schedule('every 10 seconds')
  .onRun(async (context) => {
    
    // Check current API usage
    const usage = await getCurrentAPIUsage();
    
    if (usage.requests_this_minute >= 18 || usage.tokens_this_minute >= 35000) {
      console.log('⚠️  Near rate limit - waiting');
      return;
    }
    
    // Calculate available capacity
    const availableRequests = 20 - usage.requests_this_minute;
    const availableTokens = 40000 - usage.tokens_this_minute;
    
    // Get queued items (highest priority first)
    const queued = await firestore
      .collection('api_queue')
      .where('queue_status', '==', 'queued')
      .orderBy('queue_priority', 'asc')
      .orderBy('queue_added_timestamp', 'asc')
      .limit(availableRequests)
      .get();
    
    // Process queue
    for (const doc of queued.docs) {
      const item = doc.data() as QueuedConversation;
      
      // Check if we have token budget
      if (item.queue_estimated_tokens > availableTokens) {
        console.log(`⏳ Insufficient tokens for ${item.queue_id}`);
        continue;
      }
      
      // Mark as processing
      await doc.ref.update({ queue_status: 'processing' });
      
      // Process conversation
      try {
        await facilitateLearning(item.queue_conversation_id);
        
        // Mark complete
        await doc.ref.update({
          queue_status: 'completed',
          queue_completed_timestamp: new Date()
        });
        
        console.log(`✅ Processed queued conversation ${item.queue_id}`);
        
      } catch (error) {
        console.error(`❌ Failed to process ${item.queue_id}:`, error);
        
        // Requeue with delay
        await doc.ref.update({
          queue_status: 'queued',
          queue_retry_count: (item.queue_retry_count || 0) + 1
        });
      }
    }
  });
```

**Learner Experience:**

```javascript
// When message sent
async function sendMessage(conversationId: string, message: string) {
  // Check if we can process immediately
  const canProcessNow = await checkAPICapacity();
  
  if (canProcessNow) {
    // Process immediately
    return await facilitateLearning(conversationId, message);
  } else {
    // Queue with position info
    const position = await queueConversation(conversationId);
    
    return {
      success: true,
      queued: true,
      message: `I'm responding to ${position - 1} learners ahead of you.
                Your message will be processed in approximately 
                ${estimateWaitTime(position)} seconds.
                
                [Live countdown will appear here]`
    };
  }
}
```

---

I'm building systematically. Shall I continue with Section 7 (Conversation System) and beyond? We're making excellent progress! 🚀


## 7. Conversation System with Intelligent Context

### 7.1 Architecture Overview

The conversation system is the heart of AMU's educational experience. It must provide:
- Natural, flowing dialogue that feels human
- Perfect memory of each learner's journey
- Cost-effective context management
- Real-time responsiveness
- Reliable persistence

**Core Principles:**
1. **Attention as Respect** - Never forget what matters to the learner
2. **Cost-Effective Intelligence** - Smart context management, not brute force
3. **Always Available** - Conversations never lost, always resumable
4. **Natural Flow** - No artificial session boundaries

### 7.2 Database Schema (Firestore)

**Conversations Collection:**

```javascript
// /conversations/{conversation_id}
interface Conversation {
  conversation_id: string;                    // Primary key
  conversation_user_id: string;               // Foreign key to users
  conversation_enrollment_id: string;         // Foreign key to enrollments
  conversation_status: 'active' | 'paused' | 'completed';
  conversation_started_date: Date;
  conversation_last_activity_date: Date;
  conversation_message_count: number;
  conversation_total_tokens_used: number;     // Track API costs
  conversation_current_competency_id: string;
  conversation_language: string;              // en, zu, af, etc.
}

// /conversations/{conversation_id}/messages/{message_id}
interface Message {
  message_id: string;                         // Primary key
  message_conversation_id: string;            // Parent conversation
  message_role: 'user' | 'assistant' | 'system';
  message_content: string;                    // Actual message text
  message_timestamp: Date;
  message_tokens_used: {
    input: number;
    output: number;
  };
  message_metadata?: {                        // Optional structured data
    competency_mentioned?: string;
    case_study_reference?: string;
    insight_detected?: boolean;
    struggle_detected?: boolean;
  };
}

// /conversation_summaries/{summary_id}
interface ConversationSummary {
  summary_id: string;
  summary_conversation_id: string;
  summary_session_number: number;             // Session 1, 2, 3...
  summary_start_message_id: string;
  summary_end_message_id: string;
  summary_text: string;                       // Rich narrative summary
  summary_key_insights: string[];             // Bullet points
  summary_breakthroughs: string[];            // "Aha!" moments
  summary_struggles: string[];                // What was difficult
  summary_notable_moments: string[];          // Important to remember
  summary_created_date: Date;
  summary_message_count: number;
}
```

### 7.3 Starting a New Conversation

**Scenario:** Learner enrolls in course and starts first module

```javascript
async function startConversation(
  userId: string,
  enrollmentId: string
): Promise<string> {
  
  // Get enrollment details
  const enrollment = await firestore
    .collection('enrollments')
    .doc(enrollmentId)
    .get();
  
  if (!enrollment.exists) {
    throw new Error('Enrollment not found');
  }
  
  const enrollmentData = enrollment.data();
  
  // Create conversation record
  const conversationId = generateId('conv');
  const conversation: Conversation = {
    conversation_id: conversationId,
    conversation_user_id: userId,
    conversation_enrollment_id: enrollmentId,
    conversation_status: 'active',
    conversation_started_date: new Date(),
    conversation_last_activity_date: new Date(),
    conversation_message_count: 0,
    conversation_total_tokens_used: 0,
    conversation_current_competency_id: enrollmentData.enrollment_current_competency_id,
    conversation_language: enrollmentData.enrollment_language || 'en'
  };
  
  await firestore
    .collection('conversations')
    .doc(conversationId)
    .set(conversation);
  
  // Send initial greeting from Claude
  const greeting = await generateInitialGreeting(userId, enrollmentId);
  
  await storeMessage(conversationId, {
    role: 'assistant',
    content: greeting,
    timestamp: new Date()
  });
  
  return conversationId;
}

async function generateInitialGreeting(
  userId: string,
  enrollmentId: string
): Promise<string> {
  
  const user = await getUser(userId);
  const enrollment = await getEnrollment(enrollmentId);
  
  // Build context for initial greeting
  const context = {
    learner_name: user.user_name,
    course_title: enrollment.enrollment_course_title,
    module_title: enrollment.enrollment_current_module_title,
    language: user.user_preferred_language || 'en',
    is_first_course: await isFirstCourse(userId)
  };
  
  // Call Claude for personalized greeting
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: `You are a warm, encouraging AI facilitator for Asset Management University.
    
Your role: Guide learners through problem-based discovery. You facilitate, 
don't lecture. You celebrate insights and scaffold when needed.

Context:
- Learner: ${context.learner_name}
- Course: ${context.course_title}
- Module: ${context.module_title}
- First course: ${context.is_first_course ? 'Yes' : 'No'}
- Language: ${context.language}

Create a warm, personalized greeting that:
1. Welcomes them authentically
2. Explains you'll be their facilitator (not teacher)
3. Sets expectation: problem-based discovery, not lectures
4. Invites them to begin when ready
5. Keeps it conversational (3-4 sentences)

Respond in ${context.language}.`,
    messages: [
      {
        role: 'user',
        content: 'Generate the initial greeting.'
      }
    ]
  });
  
  return response.content[0].text;
}
```

**Example Initial Greeting:**

```
Hi Sipho! Welcome to Asset Management University! 👋

I'm here to facilitate your learning journey through this module on 
Work Management. Rather than lecturing, I'll guide you through real-world 
scenarios and help you discover concepts through problem-solving – the way 
we learn best.

We'll work at your pace, in your context. Whenever you're ready, let's 
begin! What would you like to explore first?
```

### 7.4 Ongoing Conversation Flow

**User sends message → System processes → Claude responds → Store → Update context**

```javascript
async function handleUserMessage(
  conversationId: string,
  userMessage: string
): Promise<ConversationResponse> {
  
  try {
    // 1. Store user message
    await storeMessage(conversationId, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    
    // 2. Build intelligent context
    const context = await buildConversationContext(conversationId);
    
    // 3. Call Claude with context
    const response = await facilitateLearning(context, userMessage);
    
    // 4. Store Claude's response
    await storeMessage(conversationId, {
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
      tokens_used: response.usage
    });
    
    // 5. Update conversation metadata
    await updateConversation(conversationId, {
      conversation_last_activity_date: new Date(),
      conversation_message_count: context.messageCount + 2,  // +user +assistant
      conversation_total_tokens_used: context.totalTokens + response.usage.input + response.usage.output
    });
    
    // 6. Check if summary needed
    if ((context.messageCount + 2) % 20 === 0) {
      // Every 20 messages, generate summary
      await generateConversationSummary(conversationId);
    }
    
    // 7. Detect competency progress
    await detectCompetencyProgress(conversationId, response.text);
    
    return {
      success: true,
      message: response.text,
      conversationId: conversationId,
      tokensUsed: response.usage
    };
    
  } catch (error) {
    return await handleConversationError(conversationId, error);
  }
}
```

### 7.5 Intelligent Context Building (Detailed)

**The Heart of the System - This is what makes AMU special**

```javascript
async function buildConversationContext(conversationId: string) {
  
  // Parallel fetching for speed
  const [
    conversation,
    user,
    enrollment,
    recentMessages,
    summaries,
    competencyInfo
  ] = await Promise.all([
    getConversation(conversationId),
    getUserFromConversation(conversationId),
    getEnrollmentFromConversation(conversationId),
    getRecentMessages(conversationId, 20),  // Last 20 messages
    getConversationSummaries(conversationId),
    getCurrentCompetencyInfo(conversationId)
  ]);
  
  // 1. LEARNER PROFILE (~500 tokens)
  const learnerProfile = buildLearnerProfile(user, enrollment);
  
  // 2. COURSE CONTEXT (~300 tokens)
  const courseContext = await buildCourseContext(enrollment);
  
  // 3. RECENT MESSAGES (~2,000 tokens)
  const recentMessagesFormatted = formatRecentMessages(recentMessages);
  
  // 4. CONVERSATION SUMMARIES (~1,000 tokens per session)
  const conversationHistory = formatSummaries(summaries);
  
  // 5. CURRENT COMPETENCY (~200 tokens)
  const competencyContext = formatCompetencyContext(competencyInfo);
  
  // 6. FACILITATOR PLAYBOOK (~500 tokens)
  const playbook = await getFacilitatorPlaybook(enrollment.enrollment_current_module_id);
  
  // Build system prompt
  const systemPrompt = `You are an AI facilitator for Asset Management University.

${learnerProfile}

${courseContext}

${conversationHistory}

${competencyContext}

${playbook}

Remember:
- Guide discovery through questions, don't lecture
- Celebrate insights: "You've just discovered [principle]!"
- Scaffold when stuck: "Think about what they can control..."
- Be conversational and warm
- Adapt to ${user.user_name}'s context and understanding
- Respond in ${conversation.conversation_language}`;

  return {
    systemPrompt,
    recentMessages: recentMessagesFormatted,
    messageCount: conversation.conversation_message_count,
    totalTokens: conversation.conversation_total_tokens_used,
    learnerName: user.user_name,
    language: conversation.conversation_language
  };
}

function buildLearnerProfile(user: any, enrollment: any): string {
  return `
LEARNER PROFILE:
Name: ${user.user_name}
Language: ${user.user_preferred_language || 'English'}
Location: ${user.user_location || 'South Africa'}
Experience Level: ${user.user_experience_level || 'Beginner'}
Learning Style: ${user.user_learning_style || 'Prefers concrete examples'}

Preferences:
${user.user_preferences ? user.user_preferences.join('\n') : '- None noted yet'}

Challenges Noted:
${user.user_challenges ? user.user_challenges.join('\n') : '- None noted yet'}

Course Progress:
- Current Course: ${enrollment.enrollment_course_title}
- Current Module: ${enrollment.enrollment_current_module_title}
- Modules Completed: ${enrollment.enrollment_modules_completed || 0}
- Competencies Achieved: ${enrollment.enrollment_competencies_achieved?.length || 0}
`;
}

async function buildCourseContext(enrollment: any): Promise<string> {
  const module = await getModule(enrollment.enrollment_current_module_id);
  const caseStudy = await getCaseStudy(module.module_case_study_id);
  
  return `
CURRENT COURSE CONTEXT:
Course: ${enrollment.enrollment_course_title}
Module: ${module.module_title}

Learning Objectives:
${module.module_learning_objectives.map((obj: string) => `- ${obj}`).join('\n')}

Case Study: ${caseStudy.case_study_title}
${caseStudy.case_study_description}

Key Characters:
${caseStudy.case_study_characters.map((char: any) => 
  `- ${char.name}: ${char.description}`
).join('\n')}

Scenario Context:
${caseStudy.case_study_scenario}
`;
}

function formatSummaries(summaries: any[]): string {
  if (summaries.length === 0) {
    return 'CONVERSATION HISTORY: This is the first session.';
  }
  
  return `
CONVERSATION HISTORY:

${summaries.map((summary, index) => `
Session ${summary.summary_session_number}:
${summary.summary_text}

Key Insights:
${summary.summary_key_insights.map((insight: string) => `• ${insight}`).join('\n')}

Breakthroughs:
${summary.summary_breakthroughs.map((bt: string) => `• ${bt}`).join('\n')}

Struggles:
${summary.summary_struggles.map((str: string) => `• ${str}`).join('\n')}
`).join('\n---\n')}
`;
}

function formatCompetencyContext(competency: any): string {
  return `
CURRENT COMPETENCY FOCUS:
Title: ${competency.competency_title}
Description: ${competency.competency_description}

What the learner must demonstrate:
${competency.competency_evidence_criteria.map((ec: string) => `- ${ec}`).join('\n')}

Current Status: ${competency.current_status || 'Not Yet Demonstrated'}

${competency.development_areas ? `
Areas for Development:
${competency.development_areas.map((area: string) => `- ${area}`).join('\n')}
` : ''}
`;
}
```

### 7.6 Message Storage

**Efficient, queryable storage of all messages:**

```javascript
async function storeMessage(
  conversationId: string,
  messageData: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    tokens_used?: { input: number; output: number };
    metadata?: any;
  }
): Promise<string> {
  
  const messageId = generateId('msg');
  
  const message: Message = {
    message_id: messageId,
    message_conversation_id: conversationId,
    message_role: messageData.role,
    message_content: messageData.content,
    message_timestamp: messageData.timestamp,
    message_tokens_used: messageData.tokens_used || { input: 0, output: 0 },
    message_metadata: messageData.metadata
  };
  
  // Store in subcollection for efficient querying
  await firestore
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .doc(messageId)
    .set(message);
  
  return messageId;
}

async function getRecentMessages(
  conversationId: string,
  limit: number = 20
): Promise<Message[]> {
  
  const snapshot = await firestore
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .orderBy('message_timestamp', 'desc')
    .limit(limit)
    .get();
  
  // Reverse to get chronological order
  return snapshot.docs
    .reverse()
    .map(doc => doc.data() as Message);
}

function formatRecentMessages(messages: Message[]): any[] {
  return messages.map(msg => ({
    role: msg.message_role,
    content: msg.message_content
  }));
}
```

### 7.7 Resuming Conversations

**Learner returns after days/weeks - conversation continues seamlessly:**

```javascript
async function resumeConversation(conversationId: string): Promise<ResumeData> {
  
  const conversation = await getConversation(conversationId);
  
  if (conversation.conversation_status === 'completed') {
    return {
      error: 'This conversation is completed. Start a new module to continue learning.'
    };
  }
  
  // Update status to active
  await firestore
    .collection('conversations')
    .doc(conversationId)
    .update({
      conversation_status: 'active',
      conversation_last_activity_date: new Date()
    });
  
  // Get recent messages to show context
  const recentMessages = await getRecentMessages(conversationId, 10);
  
  // Generate "welcome back" message from Claude
  const welcomeBack = await generateWelcomeBackMessage(conversationId);
  
  return {
    success: true,
    conversationId: conversationId,
    recentMessages: recentMessages,
    welcomeBackMessage: welcomeBack,
    lastActivity: conversation.conversation_last_activity_date,
    messageCount: conversation.conversation_message_count
  };
}

async function generateWelcomeBackMessage(conversationId: string): Promise<string> {
  
  const context = await buildConversationContext(conversationId);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: `${context.systemPrompt}

The learner has returned after being away. Generate a warm welcome-back 
message that:
1. Acknowledges their return
2. Briefly reminds them where they left off
3. Invites them to continue
4. Feels natural and encouraging (2-3 sentences)`,
    messages: [
      {
        role: 'user',
        content: 'Generate welcome back message.'
      }
    ]
  });
  
  return response.content[0].text;
}
```

**Example Welcome Back:**

```
Welcome back, Sipho! 👋

Last time, we were exploring stakeholder analysis through your taxi 
company example. You made a great connection about balancing competing 
needs between drivers and passengers. Ready to continue where we left off?
```

### 7.8 Session Summary Generation (Detailed)

**Every 20 messages OR when learner leaves:**

```javascript
async function generateConversationSummary(conversationId: string) {
  
  // Get messages since last summary
  const lastSummary = await firestore
    .collection('conversation_summaries')
    .where('summary_conversation_id', '==', conversationId)
    .orderBy('summary_session_number', 'desc')
    .limit(1)
    .get();
  
  const sessionNumber = lastSummary.empty ? 1 : lastSummary.docs[0].data().summary_session_number + 1;
  const startMessageId = lastSummary.empty ? null : lastSummary.docs[0].data().summary_end_message_id;
  
  // Get messages to summarize
  const messages = await getMessagesSince(conversationId, startMessageId);
  
  if (messages.length < 5) {
    console.log('Not enough messages for summary');
    return;
  }
  
  // Get context for rich summary
  const user = await getUserFromConversation(conversationId);
  const enrollment = await getEnrollmentFromConversation(conversationId);
  
  // Ask Claude to create rich narrative summary
  const summaryResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Create a rich narrative summary of this learning session.

LEARNER: ${user.user_name}
COURSE: ${enrollment.enrollment_course_title}
MODULE: ${enrollment.enrollment_current_module_title}

CONVERSATION (${messages.length} messages):
${formatMessagesForSummary(messages)}

Create a summary that captures:

1. KEY INSIGHTS (3-5 bullet points)
   What did the learner discover or understand?
   What connections did they make?

2. BREAKTHROUGHS (1-3 bullet points)
   Moments of genuine "aha!" understanding
   When concepts clicked

3. STRUGGLES (1-3 bullet points)
   What was difficult?
   What needed scaffolding?
   Misconceptions that emerged?

4. NOTABLE MOMENTS (1-3 bullet points)
   Personal stories shared
   Unique context from their life
   Anything important to remember about this learner

5. NARRATIVE SUMMARY (1-2 paragraphs)
   Tell the story of this session as if briefing yourself before 
   continuing the conversation tomorrow. Be specific about their 
   thinking, not just topics covered. Include their name and context.

Format as JSON:
{
  "key_insights": ["...", "..."],
  "breakthroughs": ["...", "..."],
  "struggles": ["...", "..."],
  "notable_moments": ["...", "..."],
  "narrative": "..."
}`
      }
    ]
  });
  
  const summaryData = JSON.parse(summaryResponse.content[0].text);
  
  // Store summary
  const summaryId = generateId('summ');
  await firestore.collection('conversation_summaries').doc(summaryId).set({
    summary_id: summaryId,
    summary_conversation_id: conversationId,
    summary_session_number: sessionNumber,
    summary_start_message_id: messages[0].message_id,
    summary_end_message_id: messages[messages.length - 1].message_id,
    summary_text: summaryData.narrative,
    summary_key_insights: summaryData.key_insights,
    summary_breakthroughs: summaryData.breakthroughs,
    summary_struggles: summaryData.struggles,
    summary_notable_moments: summaryData.notable_moments,
    summary_created_date: new Date(),
    summary_message_count: messages.length
  });
  
  console.log(`✅ Generated summary for session ${sessionNumber} of conversation ${conversationId}`);
}

function formatMessagesForSummary(messages: Message[]): string {
  return messages.map(msg => {
    const role = msg.message_role === 'user' ? 'LEARNER' : 'FACILITATOR';
    return `${role}: ${msg.message_content}`;
  }).join('\n\n');
}
```

### 7.9 Attention Safeguard

**Every 5 sessions, Claude checks in with learner:**

```javascript
async function checkAttentionSafeguard(conversationId: string) {
  
  const summaries = await getConversationSummaries(conversationId);
  
  // Every 5 sessions
  if (summaries.length % 5 === 0 && summaries.length > 0) {
    
    const context = await buildConversationContext(conversationId);
    
    // Generate comprehensive review
    const review = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: context.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `We've completed ${summaries.length} sessions together. 
          
Generate a thoughtful check-in message that:
1. Summarizes key things you remember about the learner's journey
2. Asks if there's anything you've missed or gotten wrong
3. Invites them to clarify or correct
4. Feels caring and attentive (not robotic)
5. Is conversational (3-4 sentences)

This ensures I'm paying proper attention to what matters to them.`
        }
      ]
    });
    
    await storeMessage(conversationId, {
      role: 'assistant',
      content: review.content[0].text,
      timestamp: new Date(),
      metadata: { type: 'attention_safeguard' }
    });
  }
}
```

**Example Attention Safeguard:**

```
Sipho, we've been learning together for a while now, and I want to make 
sure I'm paying proper attention to what matters to you. 

Here's what I remember: You work at a taxi company, you're balancing 
learning with driving night shifts, and you really connected with the 
stakeholder balance concepts when we discussed driver-passenger-company 
tensions. You prefer concrete examples over abstract theory.

Is there anything I've missed or gotten wrong? Anything you'd like me to 
remember better?
```

### 7.10 Real-Time Updates (Server-Sent Events)

**Streaming responses for better UX:**

```javascript
// Backend: Server-Sent Events endpoint
export const streamConversation = functions.https.onRequest(async (req, res) => {
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const { conversationId, message } = req.body;
  
  try {
    // Build context
    const context = await buildConversationContext(conversationId);
    
    // Stream response from Claude
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: context.systemPrompt,
      messages: [
        ...context.recentMessages,
        { role: 'user', content: message }
      ],
      stream: true
    });
    
    let fullResponse = '';
    
    // Stream chunks to client
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const text = chunk.delta.text;
        fullResponse += text;
        
        // Send to client
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    
    // Store complete message
    await storeMessage(conversationId, {
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date()
    });
    
    // Signal completion
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
```

**Frontend: Receiving streamed response:**

```typescript
async function sendMessageStreaming(
  conversationId: string,
  message: string
): Promise<void> {
  
  const response = await fetch('/api/stream-conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, message })
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader!.read();
    
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Process complete messages
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';  // Keep incomplete line
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        
        if (data.text) {
          // Update UI with new text chunk
          appendToMessage(data.text);
        }
        
        if (data.done) {
          // Message complete
          markMessageComplete();
        }
        
        if (data.error) {
          // Handle error
          showError(data.error);
        }
      }
    }
  }
}
```

**UI Experience:**

```
┌─────────────────────────────────────────────────────┐
│  Sipho Ndlovu                                       │
│  QCTO Knowledge Module 1                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  USER:                                              │
│  How do I identify internal vs external factors?    │
│                                                      │
│  CLAUDE: ▊                                          │
│  Great question! Let's explore this through the     │
│  Old Mill Bakery scenario. What challenges are      │
│  Lena and Thandi facing?                            │
│                                                      │
│  [Typing indicator shows Claude is responding...]   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 7.11 Conversation Analytics

**Track conversation health and quality:**

```javascript
interface ConversationMetrics {
  conversation_id: string;
  metrics_date: Date;
  
  // Engagement
  messages_sent: number;
  avg_message_length: number;
  session_duration_minutes: number;
  days_since_last_activity: number;
  
  // Quality Indicators
  insights_detected: number;
  breakthroughs_detected: number;
  struggles_detected: number;
  scaffolding_provided: number;
  
  // Cost
  total_tokens_used: number;
  cost_usd: number;
  
  // Competency Progress
  competencies_discussed: string[];
  competencies_achieved: string[];
}

async function trackConversationMetrics(conversationId: string) {
  // Analyze conversation patterns
  // Detect engagement levels
  // Flag quality issues
  // Monitor costs
}
```

---


## 8. Rate Limiting & Queue Management

### 8.1 The Challenge

**Anthropic API Rate Limits (Current Tier):**
- **40,000 tokens per minute** (TPM)
- **20 requests per minute** (RPM)

**AMU's Reality:**
- Peak hours: 100+ concurrent learners
- Each conversation: ~5,000-8,000 tokens
- Without management: Rate limits exceeded, learners frustrated

**Solution:** Intelligent queue system that provides excellent experience while staying within limits

### 8.2 Queue Architecture

```javascript
// Firestore: /api_queue/{queue_id}
interface QueuedRequest {
  queue_id: string;
  queue_conversation_id: string;
  queue_user_id: string;
  queue_user_name: string;
  queue_message: string;
  queue_priority: number;                    // 1-4 (1 = highest)
  queue_estimated_tokens: number;
  queue_added_timestamp: Date;
  queue_processing_started?: Date;
  queue_status: 'queued' | 'processing' | 'completed' | 'failed';
  queue_position?: number;                   // Position in queue
  queue_retry_count: number;
}

// Priority Levels
const QUEUE_PRIORITY = {
  ASSESSMENT_FEEDBACK: 1,        // Learner submitted assignment - urgent
  ACTIVE_CONVERSATION: 2,         // Mid-session - maintain flow
  NEW_SESSION: 3,                 // Starting conversation - can wait briefly
  BACKGROUND_TASK: 4              // Content analysis, summaries - not time-sensitive
};
```

### 8.3 Rate Limit Tracking

```javascript
// Firestore: /api_usage/current
interface APIUsageTracking {
  tracking_minute: string;                   // "2024-11-24T16:30"
  requests_this_minute: number;
  tokens_this_minute: number;
  requests_by_priority: {
    [key: number]: number;
  };
  last_reset: Date;
}

async function getCurrentAPIUsage(): Promise<APIUsageTracking> {
  const currentMinute = getCurrentMinuteKey();  // "2024-11-24T16:30"
  
  const doc = await firestore
    .collection('api_usage')
    .doc(currentMinute)
    .get();
  
  if (!doc.exists) {
    // New minute - reset counters
    const newTracking: APIUsageTracking = {
      tracking_minute: currentMinute,
      requests_this_minute: 0,
      tokens_this_minute: 0,
      requests_by_priority: {},
      last_reset: new Date()
    };
    
    await doc.ref.set(newTracking);
    return newTracking;
  }
  
  return doc.data() as APIUsageTracking;
}

async function recordAPIUsage(
  tokensUsed: number,
  priority: number
): Promise<void> {
  const currentMinute = getCurrentMinuteKey();
  
  await firestore
    .collection('api_usage')
    .doc(currentMinute)
    .set({
      requests_this_minute: FieldValue.increment(1),
      tokens_this_minute: FieldValue.increment(tokensUsed),
      [`requests_by_priority.${priority}`]: FieldValue.increment(1)
    }, { merge: true });
}

function getCurrentMinuteKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
```

### 8.4 Queue Management

**Adding to Queue:**

```javascript
async function queueConversationRequest(
  conversationId: string,
  message: string,
  priority: number = QUEUE_PRIORITY.ACTIVE_CONVERSATION
): Promise<QueuedRequest> {
  
  const user = await getUserFromConversation(conversationId);
  
  const queueItem: QueuedRequest = {
    queue_id: generateId('queue'),
    queue_conversation_id: conversationId,
    queue_user_id: user.user_id,
    queue_user_name: user.user_name,
    queue_message: message,
    queue_priority: priority,
    queue_estimated_tokens: estimateTokens(message),
    queue_added_timestamp: new Date(),
    queue_status: 'queued',
    queue_retry_count: 0
  };
  
  await firestore
    .collection('api_queue')
    .doc(queueItem.queue_id)
    .set(queueItem);
  
  // Calculate position in queue
  const position = await calculateQueuePosition(queueItem);
  
  await firestore
    .collection('api_queue')
    .doc(queueItem.queue_id)
    .update({ queue_position: position });
  
  return { ...queueItem, queue_position: position };
}

async function calculateQueuePosition(item: QueuedRequest): Promise<number> {
  // Count items ahead in queue with higher or equal priority
  const snapshot = await firestore
    .collection('api_queue')
    .where('queue_status', '==', 'queued')
    .where('queue_priority', '<=', item.queue_priority)
    .where('queue_added_timestamp', '<', item.queue_added_timestamp)
    .get();
  
  return snapshot.size + 1;
}

function estimateTokens(message: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  // Add context overhead: ~5,000-8,000 tokens
  const messageTokens = Math.ceil(message.length / 4);
  const contextTokens = 6500;  // Average context size
  const responseTokens = 500;  // Average response length
  
  return messageTokens + contextTokens + responseTokens;
}
```

### 8.5 Queue Processor

**Cloud Function running every 10 seconds:**

```javascript
export const processAPIQueue = functions.pubsub
  .schedule('every 10 seconds')
  .onRun(async (context) => {
    
    console.log('🔄 Processing API queue...');
    
    // 1. Check current API usage
    const usage = await getCurrentAPIUsage();
    
    // 2. Safety margin - don't use full capacity
    const SAFETY_MARGIN = 0.9;  // Use 90% of limits
    const availableRequests = Math.floor((20 - usage.requests_this_minute) * SAFETY_MARGIN);
    const availableTokens = Math.floor((40000 - usage.tokens_this_minute) * SAFETY_MARGIN);
    
    if (availableRequests <= 0 || availableTokens <= 0) {
      console.log('⚠️  At capacity - waiting for next minute');
      return;
    }
    
    console.log(`✅ Capacity: ${availableRequests} requests, ${availableTokens} tokens`);
    
    // 3. Get queued items (highest priority first, then oldest)
    const queued = await firestore
      .collection('api_queue')
      .where('queue_status', '==', 'queued')
      .orderBy('queue_priority', 'asc')
      .orderBy('queue_added_timestamp', 'asc')
      .limit(availableRequests)
      .get();
    
    if (queued.empty) {
      console.log('✅ Queue empty');
      return;
    }
    
    console.log(`📋 Processing ${queued.size} queued requests`);
    
    // 4. Process queue items
    let tokensUsedThisRun = 0;
    let requestsProcessed = 0;
    
    for (const doc of queued.docs) {
      const item = doc.data() as QueuedRequest;
      
      // Check if we have token budget
      if (tokensUsedThisRun + item.queue_estimated_tokens > availableTokens) {
        console.log(`⏳ Insufficient tokens for ${item.queue_id} (need ${item.queue_estimated_tokens}, have ${availableTokens - tokensUsedThisRun})`);
        break;  // Stop processing for this cycle
      }
      
      // Mark as processing
      await doc.ref.update({
        queue_status: 'processing',
        queue_processing_started: new Date()
      });
      
      try {
        // Process conversation
        const result = await facilitateLearning(
          item.queue_conversation_id,
          item.queue_message
        );
        
        // Update tokens used
        const actualTokens = result.tokensUsed.input + result.tokensUsed.output;
        tokensUsedThisRun += actualTokens;
        
        // Record usage
        await recordAPIUsage(actualTokens, item.queue_priority);
        
        // Mark complete
        await doc.ref.update({
          queue_status: 'completed',
          queue_completed_timestamp: new Date(),
          queue_actual_tokens: actualTokens
        });
        
        requestsProcessed++;
        console.log(`✅ Processed ${item.queue_id} (${actualTokens} tokens)`);
        
        // Notify learner (via Firestore listener on frontend)
        await notifyLearnerResponseReady(item.queue_user_id, item.queue_conversation_id);
        
      } catch (error) {
        console.error(`❌ Failed to process ${item.queue_id}:`, error);
        
        // Check if retryable
        if (item.queue_retry_count < 3 && isRetryableError(error)) {
          // Requeue with delay
          await doc.ref.update({
            queue_status: 'queued',
            queue_retry_count: item.queue_retry_count + 1,
            queue_last_error: error.message
          });
        } else {
          // Permanent failure
          await doc.ref.update({
            queue_status: 'failed',
            queue_failed_timestamp: new Date(),
            queue_error: error.message
          });
          
          // Notify learner of failure
          await notifyLearnerError(item.queue_user_id, item.queue_conversation_id);
        }
      }
    }
    
    console.log(`✅ Processed ${requestsProcessed} requests, used ${tokensUsedThisRun} tokens`);
  });

function isRetryableError(error: any): boolean {
  // Network errors, temporary server issues - retry
  if (error.status >= 500) return true;
  if (error.code === 'ECONNRESET') return true;
  if (error.code === 'ETIMEDOUT') return true;
  
  // Rate limiting - will be handled by queue
  if (error.status === 429) return true;
  
  // Client errors - don't retry
  if (error.status === 400 || error.status === 401) return false;
  
  return false;
}
```

### 8.6 Frontend Queue Experience

**Checking if can process immediately:**

```typescript
async function sendMessage(
  conversationId: string,
  message: string
): Promise<SendMessageResult> {
  
  // Check if we can process immediately
  const capacity = await checkAPICapacity();
  
  if (capacity.canProcessNow) {
    // Process immediately - no queue
    return await facilitateLearningDirect(conversationId, message);
  } else {
    // Add to queue
    const queueItem = await queueConversationRequest(
      conversationId,
      message,
      QUEUE_PRIORITY.ACTIVE_CONVERSATION
    );
    
    // Listen for completion
    return await waitForQueueProcessing(queueItem);
  }
}

async function checkAPICapacity(): Promise<{ canProcessNow: boolean }> {
  const response = await fetch('/api/check-capacity');
  return await response.json();
}
```

**Queue UI Experience:**

```typescript
interface QueueState {
  queued: boolean;
  position: number;
  estimatedWait: number;  // seconds
}

function QueueIndicator({ queueState }: { queueState: QueueState }) {
  if (!queueState.queued) return null;
  
  const [countdown, setCountdown] = useState(queueState.estimatedWait);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="queue-indicator">
      <div className="queue-message">
        I'm responding to {queueState.position - 1} learners ahead of you.
        Your response is being prepared...
      </div>
      
      <div className="queue-countdown">
        Estimated wait: {countdown} seconds
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${(1 - countdown / queueState.estimatedWait) * 100}%` 
            }}
          />
        </div>
      </div>
      
      <div className="queue-reassurance">
        I want to give you my full attention. Thank you for your patience! 🙏
      </div>
    </div>
  );
}
```

**Visual Example:**

```
┌─────────────────────────────────────────────────────┐
│  ⏳ Preparing Your Response                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  I'm responding to 2 learners ahead of you.         │
│  Your response is being prepared...                 │
│                                                      │
│  Estimated wait: 18 seconds                         │
│  ████████████░░░░░░░░░░░░ 65%                      │
│                                                      │
│  I want to give you my full attention.              │
│  Thank you for your patience! 🙏                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 8.7 Priority Management

**Assessment feedback gets highest priority:**

```javascript
async function submitAssignment(
  enrollmentId: string,
  assignmentData: any
): Promise<void> {
  
  // Store assignment
  await storeAssignment(enrollmentId, assignmentData);
  
  // Create conversation for grading with HIGH priority
  const conversationId = await createAssessmentConversation(enrollmentId);
  
  // Queue with priority 1 (highest)
  await queueConversationRequest(
    conversationId,
    'Grade this assignment',
    QUEUE_PRIORITY.ASSESSMENT_FEEDBACK
  );
  
  // Learner notified when grading complete
}
```

### 8.8 Scaling Strategy

**Request Rate Limit Increase from Anthropic:**

```javascript
// When AMU reaches sufficient scale
async function requestRateLimitIncrease() {
  // Contact Anthropic support
  // Provide business case:
  // - Educational institution
  // - Serving thousands of learners
  // - Predictable usage patterns
  // - Willing to commit to spend
  
  // Expected approval for:
  // - 200,000 TPM (5x increase)
  // - 100 RPM (5x increase)
  
  // This supports 500+ concurrent learners
}
```

**Multiple API Keys (If Needed):**

```javascript
const API_KEYS = {
  CONVERSATIONS: process.env.ANTHROPIC_KEY_1,      // Most traffic
  ASSESSMENTS: process.env.ANTHROPIC_KEY_2,        // High priority
  BACKGROUND: process.env.ANTHROPIC_KEY_3,         // Summaries, analysis
};

// Each key has independent rate limits
// Total capacity: 3x base limits
```

### 8.9 Monitoring & Alerts

```javascript
// Alert if queue growing
async function monitorQueueHealth() {
  const queueSize = await getQueueSize();
  const avgWaitTime = await getAverageWaitTime();
  
  if (queueSize > 50 || avgWaitTime > 120) {
    await alertDevOps({
      type: 'queue_congestion',
      queueSize,
      avgWaitTime,
      message: 'Consider requesting rate limit increase or adding API key'
    });
  }
}

// Track queue metrics
interface QueueMetrics {
  timestamp: Date;
  queue_size: number;
  avg_wait_time: number;
  requests_queued_per_minute: number;
  requests_processed_per_minute: number;
  queue_throughput: number;
}
```

---

## 9. Database Schema (Firestore)

### 9.1 Overview

AMU uses Google Cloud Firestore in Native Mode for all operational data.

**Why Firestore?**
- Real-time synchronization
- Scalable to millions of documents
- Strong consistency
- Offline support (PWA capability)
- Integrated with Firebase ecosystem
- Pay-per-use (cost-effective)

**Design Principles:**
- Denormalization for read performance
- Subcollections for 1-to-many relationships
- Composite indexes for complex queries
- Security rules at document level

### 9.2 Complete Schema

```javascript
// ROOT COLLECTIONS

/users/{user_id}
/courses/{course_id}
/modules/{module_id}
/enrollments/{enrollment_id}
/conversations/{conversation_id}
  /messages/{message_id}
/conversation_summaries/{summary_id}
/assignments/{assignment_id}
/certificates/{certificate_id}
/seta_registrations/{registration_id}
/referrals/{referral_id}
/payments/{payment_id}
/ai_test_runs/{test_run_id}
/content_improvements/{improvement_id}
/split_tests/{split_test_id}
/api_queue/{queue_id}
/api_usage/{minute_key}
```

### 9.3 Users Collection

```javascript
// /users/{user_id}
interface User {
  // Identity
  user_id: string;                           // Primary key (Firebase Auth UID)
  user_email: string;                        // Unique, indexed
  user_name: string;
  user_tier: 'anonymous' | 'basic_learner' | 'seta_registered';
  
  // Authentication
  user_email_verified: boolean;
  user_created_date: Date;
  user_last_login_date: Date;
  
  // Profile
  user_preferred_language?: string;          // ISO code: en, zu, af, etc.
  user_location?: string;                    // "Johannesburg, South Africa"
  user_phone_number?: string;                // Only for Tier 3
  user_physical_address?: string;            // Only for Tier 3
  user_id_number?: string;                   // Only for Tier 3
  
  // Learning Preferences (detected over time)
  user_learning_style?: string;
  user_experience_level?: 'beginner' | 'intermediate' | 'advanced';
  user_preferences?: string[];               // ["prefers concrete examples", "visual learner"]
  user_challenges?: string[];                // ["struggles with abstract concepts"]
  
  // Referral Programme
  user_referred_by?: string;                 // User ID of referrer
  user_referral_code: string;                // Unique code for this user
  user_karma_balance: number;                // R amount
  user_karma_lifetime_earned: number;
  
  // Payment
  user_stripe_customer_id?: string;          // Stripe customer ID
  
  // SETA (Tier 3 only)
  user_seta_registration_id?: string;
  user_seta_registration_date?: Date;
}

// Indexes:
// - user_email (unique)
// - user_referral_code (unique)
// - user_referred_by (for querying referrals)
// - user_tier + user_created_date (analytics)
```

### 9.4 Courses Collection

```javascript
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
  
  // Certification
  course_certificate_price: number;          // Variable pricing
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

### 9.5 Modules Collection

```javascript
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

### 9.6 Enrollments Collection

```javascript
// /enrollments/{enrollment_id}
interface Enrollment {
  enrollment_id: string;
  enrollment_user_id: string;
  enrollment_course_id: string;
  
  // Status
  enrollment_status: 'active' | 'paused' | 'completed' | 'abandoned';
  enrollment_started_date: Date;
  enrollment_completed_date?: Date;
  enrollment_last_activity_date: Date;
  
  // Progress
  enrollment_current_module_id: string;
  enrollment_current_module_title: string;
  enrollment_modules_completed: string[];    // Module IDs
  enrollment_progress_percentage: number;    // 0-100
  
  // Competencies
  enrollment_competencies_achieved: CompetencyAchievement[];
  enrollment_current_competency_id?: string;
  enrollment_current_competency_status?: 'not_yet' | 'developing' | 'competent';
  
  // Language
  enrollment_language: string;               // Can differ from user default
  
  // Conversations
  enrollment_conversation_ids: string[];     // All conversations for this enrollment
  enrollment_active_conversation_id?: string;
  
  // Certificate
  enrollment_certificate_generated: boolean;
  enrollment_certificate_type?: 'unofficial' | 'official';
  enrollment_certificate_id?: string;
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

### 9.7 Assignments Collection

```javascript
// /assignments/{assignment_id}
interface Assignment {
  assignment_id: string;
  assignment_enrollment_id: string;
  assignment_user_id: string;
  assignment_module_id: string;
  assignment_competency_id: string;
  
  // Submission
  assignment_submitted_date: Date;
  assignment_content: string;                // Learner's written response
  assignment_workplace_context: string;      // Their specific scenario
  
  // Grading
  assignment_status: 'submitted' | 'grading' | 'graded' | 'needs_revision';
  assignment_graded_date?: Date;
  assignment_grade: 'not_yet' | 'developing' | 'competent';
  assignment_feedback: string;               // Claude's detailed feedback
  assignment_strengths: string[];
  assignment_development_areas: string[];
  
  // Plagiarism Check
  assignment_plagiarism_checked: boolean;
  assignment_plagiarism_score?: number;      // 0-100
  assignment_similarity_flags?: SimilarityFlag[];
  
  // Tokens Used
  assignment_grading_tokens: number;
}

interface SimilarityFlag {
  similar_to_assignment_id: string;
  similarity_percentage: number;
  similar_sections: string[];
}
```

### 9.8 Certificates Collection

```javascript
// /certificates/{certificate_id}
interface Certificate {
  certificate_id: string;
  certificate_user_id: string;
  certificate_enrollment_id: string;
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
  
  // SETA
  certificate_nqf_level?: number;
  certificate_credits?: number;
  certificate_seta_registration_number?: string;
  
  // Payment (for official certificates)
  certificate_payment_id?: string;
  certificate_price_paid?: number;
}

// Indexes:
// - certificate_code (unique, for verification)
// - certificate_user_id + certificate_type
// - certificate_issue_date (for analytics)
```

### 9.9 SETA Registrations Collection

```javascript
// /seta_registrations/{registration_id}
interface SETARegistration {
  registration_id: string;
  registration_user_id: string;
  registration_status: 'initiated' | 'documents_submitted' | 'verified' | 
                       'payment_pending' | 'payment_completed' | 'seta_submitted' | 
                       'completed' | 'rejected';
  
  // Timeline
  registration_started_date: Date;
  registration_documents_submitted_date?: Date;
  registration_verified_date?: Date;
  registration_payment_date?: Date;
  registration_seta_submitted_date?: Date;
  registration_completed_date?: Date;
  
  // Documents
  registration_documents: Document[];
  registration_verification_status?: 'approved' | 'pending_manual_review' | 'rejected';
  registration_verification_notes?: string;
  
  // Courses
  registration_completed_courses: CourseCompletion[];
  registration_total_nqf_credits: number;
  
  // Payment
  registration_payment_id?: string;
  registration_amount_paid: number;
  
  // Certificates
  registration_certificates_generated: CertificateReference[];
  
  // SETA
  registration_seta_submission_id?: string;
  registration_seta_approval_date?: Date;
  registration_seta_learner_id?: string;
}

interface Document {
  document_type: 'id' | 'proof_of_residence' | 'signature';
  document_url: string;
  document_uploaded_date: Date;
  document_verified: boolean;
}

interface CourseCompletion {
  course_id: string;
  course_title: string;
  completion_date: Date;
  competencies_achieved: number;
  nqf_credits: number;
}

interface CertificateReference {
  certificate_id: string;
  course_id: string;
  certificate_url: string;
}
```

### 9.10 Referrals Collection

```javascript
// /referrals/{referral_id}
interface Referral {
  referral_id: string;
  referral_referrer_user_id: string;         // Who referred
  referral_referred_user_id: string;         // Who was referred
  referral_date: Date;
  
  // Status
  referral_status: 'pending' | 'converted' | 'paid';
  referral_conversion_date?: Date;           // When referred user purchased
  referral_payment_date?: Date;
  
  // Tier tracking
  referral_tier: 1 | 2;                      // Direct or second-level
  referral_source_referral_id?: string;      // If tier 2, which tier 1 referral
  
  // Karma
  referral_karma_earned: number;             // R amount
  referral_purchase_amount?: number;         // Certificate price paid by referred user
  
  // Payment
  referral_payout_id?: string;
  referral_payout_date?: Date;
}

// Indexes:
// - referral_referrer_user_id + referral_status
// - referral_referred_user_id (check if user was referred)
// - referral_tier + referral_status (analytics)
```

### 9.11 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users - read/write own profile
    match /users/{userId} {
      allow read, update: if isOwner(userId);
      allow create: if isAuthenticated();
      allow delete: if false;  // Never allow deletion (POPI compliance - keep audit trail)
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
    
    // Enrollments - only owner
    match /enrollments/{enrollmentId} {
      allow read, write: if isAuthenticated() && 
        resource.data.enrollment_user_id == request.auth.uid;
    }
    
    // Conversations - only owner
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() && 
        resource.data.conversation_user_id == request.auth.uid;
      allow write: if false;  // Only via Cloud Functions
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
          get(/databases/$(database)/documents/conversations/$(conversationId)).data.conversation_user_id == request.auth.uid;
        allow write: if false;
      }
    }
    
    // Assignments - only owner
    match /assignments/{assignmentId} {
      allow read: if isAuthenticated() && 
        resource.data.assignment_user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.assignment_user_id == request.auth.uid;
      allow update, delete: if false;  // Only system can update
    }
    
    // Certificates - owner + public verification
    match /certificates/{certificateId} {
      // Owner can always read
      allow read: if isAuthenticated() && 
        resource.data.certificate_user_id == request.auth.uid;
      // Public verification by code
      allow get: if request.query.certificate_code == resource.data.certificate_code;
      allow write: if false;
    }
    
    // SETA Registrations - only owner
    match /seta_registrations/{registrationId} {
      allow read: if isAuthenticated() && 
        resource.data.registration_user_id == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.registration_user_id == request.auth.uid;
      allow update: if isOwner(resource.data.registration_user_id);
      allow delete: if false;
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


## 10. File Storage (Cloud Storage)

### 10.1 Overview

Google Cloud Storage handles all file-based assets for AMU.

**Storage Buckets:**

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

### 10.2 Certificate Generation & Storage

**Generating PDF Certificates:**

```javascript
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
    doc.fontSize(60)
       .fillColor('#CCCCCC')
       .opacity(0.3)
       .rotate(-45, { origin: [400, 300] })
       .text('UNOFFICIAL - FOR PERSONAL USE ONLY', 100, 250, {
         width: 600,
         align: 'center'
       })
       .rotate(45, { origin: [400, 300] })
       .opacity(1.0);
  }
  
  // Certificate Type Box
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
  
  // Main Content
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
  
  // Dates
  doc.fontSize(10)
     .fillColor('#666')
     .text(`Completion Date: ${formatDate(certificateData.completion_date)}`, 
           { align: 'center' });
  
  if (certificateData.registration_date) {
    doc.text(`Registration Date: ${formatDate(certificateData.registration_date)}`, 
             { align: 'center' });
  }
  
  doc.text(`Certificate Number: ${certificateData.certificate_number}`, 
           { align: 'center' });
  
  doc.moveDown(2);
  
  // QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(
    `https://assetmanagementuniversity.org/verify/${certificateData.certificate_code}`
  );
  
  doc.image(qrCodeDataUrl, 50, doc.y, { width: 80 });
  
  // Signature
  doc.fontSize(10)
     .fillColor('#333')
     .text('Digitally Signed', 650, doc.y + 30, { align: 'right' });
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Muhammad Ali', 650, doc.y + 5, { align: 'right' });
  doc.fontSize(9)
     .font('Helvetica')
     .text('Chief Executive Officer', 650, doc.y + 2, { align: 'right' });
  doc.text('Asset Management University', 650, doc.y + 2, { align: 'right' });
  
  // Footer
  doc.fontSize(9)
     .fillColor('#666')
     .text('Verify this certificate:', 50, 520, { continued: true })
     .fillColor(AMU_SKY)
     .text(` assetmanagementuniversity.org/verify/${certificateData.certificate_code.substring(0, 20)}...`);
  
  // CHIETA Logo (if SETA registered)
  if (certificateData.seta_registered) {
    doc.rect(650, 500, 130, 40)
       .lineWidth(1)
       .strokeColor('#999')
       .stroke();
    
    doc.fontSize(8)
       .fillColor('#333')
       .text('CHIETA', 655, 510);
    doc.text(`Reg No: ${certificateData.seta_reg_number || 'XXXXX'}`, 655, 520);
    doc.text('SETA-Registered Provider', 655, 530);
  }
  
  doc.end();
  
  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

interface CertificateData {
  learner_name: string;
  id_number?: string;
  course_title: string;
  competencies: string[];
  completion_date: Date;
  registration_date?: Date;
  certificate_number: string;
  certificate_code: string;
  watermark: boolean;
  seta_registered: boolean;
  nqf_level?: number;
  credits?: number;
  notional_hours?: number;
  seta_reg_number?: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}
```

**Uploading to Cloud Storage:**

```javascript
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

async function uploadCertificate(
  certificateBuffer: Buffer,
  certificateType: 'unofficial' | 'official',
  userId: string,
  courseId: string
): Promise<string> {
  
  const bucket = storage.bucket('amu-certificates-production');
  const filename = `${certificateType}/${userId}/${courseId}.pdf`;
  const file = bucket.file(filename);
  
  await file.save(certificateBuffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        userId: userId,
        courseId: courseId,
        certificateType: certificateType,
        generatedDate: new Date().toISOString()
      }
    }
  });
  
  // Make publicly accessible for verification
  await file.makePublic();
  
  return `https://storage.googleapis.com/amu-certificates-production/${filename}`;
}
```

### 10.3 SETA Document Upload & Verification

**Frontend: Document Upload:**

```typescript
async function uploadSETADocument(
  registrationId: string,
  documentType: 'id' | 'proof_of_residence' | 'signature',
  file: File
): Promise<string> {
  
  // Validate file
  if (file.size > 5 * 1024 * 1024) {  // 5MB limit
    throw new Error('File too large. Maximum size is 5MB.');
  }
  
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PDF, JPEG, or PNG.');
  }
  
  // Get signed upload URL from backend
  const { uploadUrl, downloadUrl } = await fetch('/api/seta/get-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationId,
      documentType,
      fileType: file.type,
      fileName: file.name
    })
  }).then(r => r.json());
  
  // Upload directly to Cloud Storage
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });
  
  // Store reference in Firestore
  await fetch('/api/seta/record-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registrationId,
      documentType,
      downloadUrl
    })
  });
  
  return downloadUrl;
}
```

**Backend: Generate Signed Upload URL:**

```javascript
export const getSETAUploadURL = functions.https.onCall(async (data, context) => {
  
  // Verify authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  
  const { registrationId, documentType, fileType, fileName } = data;
  
  // Verify ownership
  const registration = await firestore
    .collection('seta_registrations')
    .doc(registrationId)
    .get();
  
  if (!registration.exists || registration.data()?.registration_user_id !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }
  
  // Generate unique filename
  const bucket = storage.bucket('amu-seta-documents-production');
  const extension = fileType.split('/')[1];
  const filename = `${registrationId}/${documentType}.${extension}`;
  const file = bucket.file(filename);
  
  // Generate signed URL (valid for 15 minutes)
  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
    contentType: fileType
  });
  
  // Generate download URL
  const downloadUrl = `https://storage.googleapis.com/amu-seta-documents-production/${filename}`;
  
  return { uploadUrl, downloadUrl };
});
```

**Document Verification (Automated):**

```javascript
export const verifySETADocument = functions.storage
  .bucket('amu-seta-documents-production')
  .object()
  .onFinalize(async (object) => {
    
    const filePath = object.name!;  // e.g., "registration_id/id_document.pdf"
    const [registrationId, documentName] = filePath.split('/');
    
    // Get registration
    const registration = await firestore
      .collection('seta_registrations')
      .doc(registrationId)
      .get();
    
    if (!registration.exists) {
      console.error(`Registration ${registrationId} not found`);
      return;
    }
    
    // Run automated checks
    const checks = {
      fileReadable: await checkFileReadability(object),
      fileSize: object.size < 5 * 1024 * 1024,  // Under 5MB
      properFormat: ['application/pdf', 'image/jpeg', 'image/png'].includes(object.contentType!)
    };
    
    // If PDF, extract text and check quality
    if (object.contentType === 'application/pdf') {
      const text = await extractTextFromPDF(object);
      checks.textExtractable = text.length > 50;  // Has meaningful content
    }
    
    const allPassed = Object.values(checks).every(v => v === true);
    
    // Update registration
    await registration.ref.update({
      [`documents.${documentName.split('.')[0]}.verified`]: allPassed,
      [`documents.${documentName.split('.')[0]}.checks`]: checks,
      [`documents.${documentName.split('.')[0]}.verified_date`]: new Date()
    });
    
    // If all documents verified, update status
    const allDocsVerified = await checkAllDocumentsVerified(registrationId);
    if (allDocsVerified) {
      await registration.ref.update({
        registration_status: 'verified_pending_payment',
        registration_verification_date: new Date()
      });
      
      // Notify user
      await sendEmail(
        registration.data()?.registration_user_id,
        'Documents Verified - Ready for Payment',
        documentsVerifiedEmailTemplate(registrationId)
      );
    }
  });

async function checkFileReadability(object: any): Promise<boolean> {
  try {
    const bucket = storage.bucket(object.bucket);
    const file = bucket.file(object.name);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    return false;
  }
}
```

### 10.4 Assignment File Storage

**Storing Assignment Submissions:**

```javascript
async function storeAssignmentSubmission(
  userId: string,
  assignmentId: string,
  content: string,
  attachments: File[]
): Promise<void> {
  
  const bucket = storage.bucket('amu-assignments-production');
  
  // Store main submission as text file
  const submissionFile = bucket.file(`${userId}/${assignmentId}/submission.txt`);
  await submissionFile.save(content, {
    metadata: {
      contentType: 'text/plain',
      metadata: {
        userId,
        assignmentId,
        submittedDate: new Date().toISOString()
      }
    }
  });
  
  // Store attachments
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    const attachmentFile = bucket.file(
      `${userId}/${assignmentId}/attachments/${i}_${attachment.name}`
    );
    
    await attachmentFile.save(await attachment.arrayBuffer(), {
      metadata: {
        contentType: attachment.type,
        metadata: {
          originalName: attachment.name,
          uploadedDate: new Date().toISOString()
        }
      }
    });
  }
}
```

### 10.5 Content Caching

**Cache rendered markdown and images:**

```javascript
export const cacheContentFromGitHub = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    
    // Fetch latest content from GitHub
    const contentFiles = await fetchContentListFromGitHub();
    
    const bucket = storage.bucket('amu-content-cache-production');
    
    for (const file of contentFiles) {
      // Download from GitHub
      const content = await fetchFileFromGitHub(file.path);
      
      // Cache in Cloud Storage
      const cacheFile = bucket.file(`markdown-rendered/${file.path}`);
      await cacheFile.save(content, {
        metadata: {
          contentType: file.type === 'image' ? 'image/*' : 'text/markdown',
          cacheControl: 'public, max-age=21600'  // 6 hours
        }
      });
    }
    
    console.log(`✅ Cached ${contentFiles.length} content files`);
  });
```

### 10.6 Backup Strategy

**Automated Firestore Exports:**

```javascript
export const exportFirestore = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Africa/Johannesburg')
  .onRun(async (context) => {
    
    const projectId = process.env.GCP_PROJECT;
    const bucket = 'amu-backups-production';
    
    const timestamp = new Date().toISOString().split('T')[0];
    const outputUriPrefix = `gs://${bucket}/firestore-exports/${timestamp}`;
    
    const client = new FirestoreAdminClient();
    const databaseName = client.databasePath(projectId, '(default)');
    
    await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: outputUriPrefix,
      collectionIds: []  // Empty = export all collections
    });
    
    console.log(`✅ Firestore exported to ${outputUriPrefix}`);
    
    // Delete exports older than 30 days
    await deleteOldBackups(bucket, 'firestore-exports/', 30);
  });

async function deleteOldBackups(
  bucketName: string,
  prefix: string,
  daysOld: number
): Promise<void> {
  
  const bucket = storage.bucket(bucketName);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const [files] = await bucket.getFiles({ prefix });
  
  for (const file of files) {
    const [metadata] = await file.getMetadata();
    const createdDate = new Date(metadata.timeCreated);
    
    if (createdDate < cutoffDate) {
      await file.delete();
      console.log(`🗑️  Deleted old backup: ${file.name}`);
    }
  }
}
```

### 10.7 Storage Lifecycle Policies

```javascript
// Apply lifecycle rules to buckets
async function applyStorageLifecyclePolicies() {
  
  // Certificates - keep forever
  await storage.bucket('amu-certificates-production').setMetadata({
    lifecycle: {
      rule: []  // No automatic deletion
    }
  });
  
  // SETA Documents - keep for 7 years (regulatory requirement)
  await storage.bucket('amu-seta-documents-production').setMetadata({
    lifecycle: {
      rule: [
        {
          action: { type: 'Delete' },
          condition: { age: 365 * 7 }  // 7 years
        }
      ]
    }
  });
  
  // Assignments - move to Coldline after 90 days, delete after 3 years
  await storage.bucket('amu-assignments-production').setMetadata({
    lifecycle: {
      rule: [
        {
          action: { type: 'SetStorageClass', storageClass: 'COLDLINE' },
          condition: { age: 90 }
        },
        {
          action: { type: 'Delete' },
          condition: { age: 365 * 3 }
        }
      ]
    }
  });
  
  // Content Cache - refresh frequently
  await storage.bucket('amu-content-cache-production').setMetadata({
    lifecycle: {
      rule: [
        {
          action: { type: 'Delete' },
          condition: { age: 7 }  // Re-cache weekly
        }
      ]
    }
  });
  
  // Backups - keep 30 days
  await storage.bucket('amu-backups-production').setMetadata({
    lifecycle: {
      rule: [
        {
          action: { type: 'Delete' },
          condition: { age: 30 }
        }
      ]
    }
  });
}
```

### 10.8 Cost Optimization

**Storage Class Strategy:**

```javascript
// Standard: Frequently accessed (< 30 days)
// - Certificates (recent)
// - Active SETA documents
// - Current content cache

// Nearline: Accessed < 1/month (30-90 days)
// - Older certificates
// - Completed SETA registrations

// Coldline: Accessed < 1/quarter (90-365 days)
// - Old assignments
// - Historical backups

// Archive: Accessed < 1/year (> 365 days)
// - Long-term compliance storage
```

**Monthly Storage Costs (Estimated):**

```
Certificates: 10,000 × 200KB = 2GB
- Standard: $0.02/GB/month = $0.04/month

SETA Documents: 1,000 registrations × 2MB = 2GB
- Standard: $0.02/GB/month = $0.04/month
- Nearline (after 30 days): $0.01/GB/month = $0.02/month

Assignments: 5,000 × 500KB = 2.5GB
- Standard (first 90 days): $0.05/month
- Coldline (after 90 days): $0.004/GB/month = $0.01/month

Content Cache: 500MB
- Standard: $0.02/GB/month = $0.01/month

Backups: 10GB (30 days)
- Nearline: $0.01/GB/month = $0.10/month

Total: ~$0.30/month at scale
```

**Operations Costs:**

```
Class A (writes): 10,000/month = $0.05
Class B (reads): 100,000/month = $0.04

Total Operations: ~$0.10/month

TOTAL STORAGE COSTS: ~$0.40/month
```

### 10.9 Security & Access Control

**Bucket-Level IAM:**

```javascript
// Certificates - public read, service write
await storage.bucket('amu-certificates-production').iam.setPolicy({
  bindings: [
    {
      role: 'roles/storage.objectViewer',
      members: ['allUsers']  // Public verification
    },
    {
      role: 'roles/storage.objectCreator',
      members: [`serviceAccount:${SERVICE_ACCOUNT}`]
    }
  ]
});

// SETA Documents - private, authenticated read
await storage.bucket('amu-seta-documents-production').iam.setPolicy({
  bindings: [
    {
      role: 'roles/storage.objectViewer',
      members: [`serviceAccount:${SERVICE_ACCOUNT}`],
      condition: {
        title: 'Authenticated users only',
        expression: 'request.auth.uid != null'
      }
    }
  ]
});
```

**Signed URLs for Temporary Access:**

```javascript
async function generateTemporaryDownloadURL(
  bucketName: string,
  fileName: string,
  expirationMinutes: number = 15
): Promise<string> {
  
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  
  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expirationMinutes * 60 * 1000
  });
  
  return signedUrl;
}

// Usage: Allow learner to download their SETA documents
const downloadUrl = await generateTemporaryDownloadURL(
  'amu-seta-documents-production',
  `${registrationId}/id_document.pdf`,
  15  // Valid for 15 minutes
);
```

---


# PART 3: AI INTELLIGENCE SYSTEMS

## 11. Learner Facilitation (Claude)

### 11.1 Facilitation Philosophy

Claude is not a teacher who delivers content. Claude is a **facilitator** who:
- Guides discovery through questions
- Celebrates insights when learner makes connections
- Provides scaffolding when stuck
- Adapts to learner's context and understanding
- Models intellectual humility
- Never lectures

**Core Principle:** The learner discovers concepts themselves through problem-solving. Claude's role is to make that discovery process productive and rewarding.

### 11.2 System Prompt Architecture

**The system prompt is the heart of facilitation quality.**

```javascript
function buildFacilitatorSystemPrompt(context: ConversationContext): string {
  
  return `You are an AI facilitator for Asset Management University (AMU).

═══════════════════════════════════════════════════════════
CORE IDENTITY
═══════════════════════════════════════════════════════════

You facilitate learning through problem-based discovery. You guide, 
you don't teach. You ask questions that help learners discover concepts 
themselves. You celebrate insights. You scaffold when needed.

Your role is to help ${context.learnerName} develop CAPABILITY - the 
ability to DO things, not just know things.

═══════════════════════════════════════════════════════════
LEARNER PROFILE
═══════════════════════════════════════════════════════════

${context.learnerProfile}

═══════════════════════════════════════════════════════════
CURRENT LEARNING CONTEXT
═══════════════════════════════════════════════════════════

${context.courseContext}

═══════════════════════════════════════════════════════════
CONVERSATION HISTORY
═══════════════════════════════════════════════════════════

${context.conversationSummaries}

═══════════════════════════════════════════════════════════
CURRENT COMPETENCY FOCUS
═══════════════════════════════════════════════════════════

${context.competencyContext}

═══════════════════════════════════════════════════════════
FACILITATOR PLAYBOOK
═══════════════════════════════════════════════════════════

${context.facilitatorPlaybook}

Discovery Questions to Guide Thinking:
${context.discoveryQuestions.map(q => `• ${q}`).join('\n')}

Scaffolding Strategies (use when stuck):
${context.scaffoldingStrategies.map(s => `• ${s}`).join('\n')}

Common Misconceptions to Watch For:
${context.commonMisconceptions.map(m => `• ${m}`).join('\n')}

═══════════════════════════════════════════════════════════
FACILITATION GUIDELINES
═══════════════════════════════════════════════════════════

DO:
✓ Ask questions that prompt thinking
✓ Use the case study and learner's workplace context
✓ Celebrate when they discover concepts: "You've just identified X!"
✓ Scaffold gently when stuck: "Think about what they can control..."
✓ Be warm, encouraging, conversational
✓ Adapt to their understanding level
✓ Let them struggle productively (don't rush to answer)
✓ Connect new concepts to what they already understand
✓ Use their name naturally in conversation

DON'T:
✗ Lecture or explain concepts upfront
✗ Give definitions before they discover the concept
✗ Move on before they understand
✗ Use jargon without building to it
✗ Say "Let me teach you about X"
✗ Provide answers instead of guiding discovery
✗ Be robotic or formal

RESPONSE STYLE:
• Conversational and natural
• 2-4 sentences typically
• Questions > statements
• Encourage exploration
• Respond in ${context.language}

COMPETENCY TRACKING:
Monitor for evidence of ${context.currentCompetency.title}:
${context.currentCompetency.evidenceCriteria.map(c => `• ${c}`).join('\n')}

When you see clear evidence, celebrate and note it. When evidence is 
partial, encourage further development. Never grade or score - focus 
on capability development.

═══════════════════════════════════════════════════════════
UBUNTU PHILOSOPHY
═══════════════════════════════════════════════════════════

AMU is built on Ubuntu: "I am because we are."

This means:
• Respect every learner's dignity
• Celebrate their unique contribution
• Focus on capability development, not judgment
• Build on their context and experience
• Collaborate in their success

═══════════════════════════════════════════════════════════

You're not delivering a course. You're facilitating ${context.learnerName}'s 
discovery of their own capability. Make it meaningful. Make it personal. 
Make it work.`;
}
```

### 11.3 Discovery Question Patterns

**Examples from Old Mill Bakery case study:**

```javascript
const DISCOVERY_PATTERNS = {
  
  // Pattern 1: Notice-and-Name
  openingQuestion: [
    "What challenges are Lena and Thandi facing?",
    "What do you notice about the bakery's situation?",
    "What stands out to you about their context?"
  ],
  
  // Pattern 2: Compare-and-Contrast
  differentiatingQuestion: [
    "How are the external pressures different from internal problems?",
    "What's the difference between things they can control and things they can't?",
    "Which challenges come from outside vs. inside the bakery?"
  ],
  
  // Pattern 3: Apply-to-Context
  personalizationQuestion: [
    "Can you think of external factors affecting your workplace?",
    "What internal challenges does your organization face?",
    "How does this apply to your taxi company?"
  ],
  
  // Pattern 4: Scaffolding (when stuck)
  scaffoldingPrompt: [
    "Think about what Lena and Thandi can change directly...",
    "Consider the difference between the new supermarket and their oven...",
    "What if I told you some factors they can influence, and others they cannot?"
  ],
  
  // Pattern 5: Celebrate Insight
  celebrationResponse: [
    "Exactly! You've just identified the concept of internal vs. external factors!",
    "That's the insight! You've discovered how stakeholder needs can conflict!",
    "Perfect! You're seeing the pattern of organizational purpose!"
  ]
};
```

**Adaptive Questioning:**

```javascript
async function generateAdaptiveQuestion(
  conversationContext: ConversationContext,
  learnerResponse: string
): Promise<string> {
  
  // Analyze learner's response
  const understanding = await assessUnderstanding(learnerResponse);
  
  let nextQuestion;
  
  if (understanding.level === 'struggling') {
    // Provide more scaffolding
    nextQuestion = await generateScaffoldingQuestion(conversationContext);
    
  } else if (understanding.level === 'partial') {
    // Push deeper
    nextQuestion = await generateDeepeningQuestion(conversationContext);
    
  } else if (understanding.level === 'strong') {
    // Move to application
    nextQuestion = await generateApplicationQuestion(conversationContext);
    
  } else if (understanding.level === 'insight') {
    // Celebrate and move forward
    nextQuestion = await generateCelebrationAndNext(conversationContext);
  }
  
  return nextQuestion;
}
```

### 11.4 Scaffolding Strategies

**When learner is stuck:**

```javascript
const SCAFFOLDING_TECHNIQUES = {
  
  // Level 1: Gentle Nudge
  subtleHint: [
    "Think about what the bakery owners can directly change...",
    "Consider the difference between choosing suppliers and competing with supermarkets...",
    "What if you focus on the oven problem first - can they fix that?"
  ],
  
  // Level 2: Concrete Example
  exampleProvision: [
    "Let's take the oven breaking down. Lena and Thandi can decide to repair it, replace it, or change maintenance schedules. That's something they control.",
    "When the new supermarket opened, they couldn't stop it. But they can decide how to respond to it.",
    "Think of it like this: regulations are like the weather - you adapt to them. Equipment is like your clothing - you can change it."
  ],
  
  // Level 3: Contrast Presentation
  contrastProvision: [
    "Some factors are like the weather (external - you adapt). Others are like your clothing (internal - you control).",
    "Think of two types: things that happen TO the bakery, and things that happen IN the bakery.",
    "There are forces pushing from outside, and resources existing inside. Can you spot the difference?"
  ],
  
  // Level 4: Direct Teaching (last resort)
  directExplanation: [
    "Let me share a concept that might help: In asset management, we distinguish between internal factors (things the organisation controls) and external factors (forces from outside). For the bakery, their oven is internal - they decide about it. The new supermarket is external - it just appeared."
  ]
};
```

**Scaffolding Decision Logic:**

```javascript
function selectScaffoldingLevel(
  strugglingCount: number,
  previousScaffolding: string[]
): number {
  
  // First struggle - gentle nudge
  if (strugglingCount === 1) return 1;
  
  // Second struggle - provide example
  if (strugglingCount === 2) return 2;
  
  // Third struggle - use contrast
  if (strugglingCount === 3) return 3;
  
  // Fourth+ struggle - direct teaching
  if (strugglingCount >= 4) return 4;
  
  return 1;
}
```

### 11.5 Competency Evidence Detection

**Real-time monitoring during conversation:**

```javascript
async function detectCompetencyEvidence(
  conversationId: string,
  learnerMessage: string,
  currentCompetency: Competency
): Promise<EvidenceDetection> {
  
  // Ask Claude to analyze for competency evidence
  const analysis = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Analyze this learner response for competency evidence.

COMPETENCY: ${currentCompetency.competency_title}
${currentCompetency.competency_description}

EVIDENCE CRITERIA:
${currentCompetency.competency_evidence_criteria.map(c => `• ${c}`).join('\n')}

LEARNER RESPONSE:
"${learnerMessage}"

Does this response show evidence of the competency?
Respond with JSON:
{
  "evidence_level": "none" | "partial" | "strong" | "demonstrated",
  "criteria_met": ["criterion 1", "criterion 2"],
  "reasoning": "Why you assessed this way",
  "next_step": "What to explore next"
}`
      }
    ]
  });
  
  const evidence = JSON.parse(response.content[0].text);
  
  // Store evidence in conversation metadata
  if (evidence.evidence_level !== 'none') {
    await firestore
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .doc(messageId)
      .update({
        'message_metadata.competency_evidence': evidence
      });
  }
  
  return evidence;
}
```

**Aggregating Evidence for Assessment:**

```javascript
async function assessCompetencyStatus(
  enrollmentId: string,
  competencyId: string
): Promise<CompetencyStatus> {
  
  // Get all evidence from conversations
  const conversations = await getEnrollmentConversations(enrollmentId);
  const allEvidence = [];
  
  for (const conv of conversations) {
    const messages = await getMessagesWithCompetencyEvidence(
      conv.conversation_id,
      competencyId
    );
    allEvidence.push(...messages);
  }
  
  // Get assignment evidence
  const assignments = await getAssignmentsForCompetency(enrollmentId, competencyId);
  
  // Synthesize overall assessment
  const assessment = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content: `Assess overall competency achievement.

COMPETENCY: ${competency.competency_title}

EVIDENCE FROM CONVERSATIONS:
${allEvidence.map(e => `- ${e.evidence}`).join('\n')}

EVIDENCE FROM ASSIGNMENTS:
${assignments.map(a => `- Grade: ${a.grade}, Feedback: ${a.feedback}`).join('\n')}

Based on ALL evidence, assess competency status:
- "not_yet": No clear evidence or significant gaps
- "developing": Partial understanding, needs more work
- "competent": Clear, consistent evidence of capability

Respond with JSON:
{
  "status": "not_yet" | "developing" | "competent",
  "strengths": ["what they demonstrate well"],
  "development_areas": ["what needs work"],
  "recommendation": "next steps"
}`
      }
    ]
  });
  
  const result = JSON.parse(assessment.content[0].text);
  
  // Update enrollment
  await firestore
    .collection('enrollments')
    .doc(enrollmentId)
    .update({
      'enrollment_current_competency_status': result.status,
      'enrollment_competency_development_areas': result.development_areas
    });
  
  return result;
}
```

### 11.6 Multilingual Facilitation

**Language Detection & Switching:**

```javascript
async function facilitateInLearnerLanguage(
  conversationId: string,
  learnerMessage: string
): Promise<string> {
  
  const conversation = await getConversation(conversationId);
  
  // Detect if learner switched languages
  const detectedLanguage = await detectLanguage(learnerMessage);
  
  if (detectedLanguage !== conversation.conversation_language) {
    // Learner switched languages - adapt
    await firestore
      .collection('conversations')
      .doc(conversationId)
      .update({
        conversation_language: detectedLanguage
      });
    
    console.log(`Language switched to ${detectedLanguage} for conversation ${conversationId}`);
  }
  
  // Claude responds in detected language
  const context = await buildConversationContext(conversationId);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `${context.systemPrompt}

CRITICAL: Respond in ${getLanguageName(detectedLanguage)}.
Use natural, conversational language appropriate for this language.`,
    messages: [
      ...context.recentMessages,
      { role: 'user', content: learnerMessage }
    ]
  });
  
  return response.content[0].text;
}

function getLanguageName(code: string): string {
  const languages = {
    'en': 'English',
    'zu': 'isiZulu',
    'af': 'Afrikaans',
    'xh': 'isiXhosa',
    'st': 'Sesotho',
    'tn': 'Setswana',
    'ss': 'siSwati',
    'nr': 'isiNdebele',
    'ts': 'Xitsonga',
    've': 'Tshivenda',
    // ... 50+ more languages
  };
  return languages[code] || 'English';
}
```

**Example Multilingual Exchange:**

```
USER (in English): 
"How do I identify internal factors?"

CLAUDE (in English):
"Great question! Let's explore this through the Old Mill Bakery. 
What problems exist inside the bakery that Lena and Thandi face?"

---

USER (switches to isiZulu):
"Ngicabanga ukuthi i-oven eyadlulayo iyinkinga yangaphakathi."

CLAUDE (responds in isiZulu):
"Kulungile! Ukuthola ukuthi i-oven iyinkinga yangaphakathi. 
Yini eyenza ube nesiqiniseko sokuthi lokhu kungaphakathi kunokuba 
kube ngaphandle?"

Translation:
USER: "I think the old oven is an internal problem."
CLAUDE: "Correct! You've identified that the oven is internal. 
What makes you certain this is internal rather than external?"
```

### 11.7 Handling Edge Cases

**Learner Goes Off-Topic:**

```javascript
const OFF_TOPIC_RESPONSES = {
  gentle_redirect: `That's an interesting point! Let's keep that thought 
    and return to the Old Mill Bakery challenge for now. What challenges 
    are Lena and Thandi facing?`,
  
  acknowledge_and_refocus: `I appreciate you sharing that. For this 
    module, let's focus on [current competency]. We can explore other 
    topics once we've built this foundation. Ready to continue?`,
  
  connect_if_possible: `Interesting connection! How does this relate 
    to the internal and external factors we're discussing with the bakery?`
};
```

**Learner Asks for Definitions:**

```javascript
const DEFINITION_REQUESTS = {
  discovery_first: `Rather than giving you a definition, let's discover 
    this concept together. Think about the bakery's challenges - what 
    patterns do you notice?`,
  
  after_discovery: `You've already discovered this! What you described - 
    things the organization controls - that's exactly what we call 
    internal factors. You understood it before knowing the term!`,
  
  when_truly_stuck: `Let me help with context: [brief explanation]. 
    Now, looking at the bakery, can you identify examples?`
};
```

**Learner Expresses Frustration:**

```javascript
const FRUSTRATION_RESPONSES = {
  acknowledge: `I hear your frustration. Learning new concepts can be 
    challenging, and that's completely normal. Let's try a different approach.`,
  
  normalize: `You're asking great questions, which shows you're thinking 
    deeply. It's okay to struggle with this - that's how real learning 
    happens.`,
  
  adjust_approach: `Let me try explaining this differently. Instead of 
    the bakery, let's use an example from your taxi company...`,
  
  offer_break: `We've been working hard! Would you like to take a break 
    and come back to this later? Your brain might make connections while 
    you rest.`
};
```

**Learner Submits Plagiarized Content:**

```javascript
async function handleSuspectedPlagiarism(
  conversationId: string,
  suspiciousContent: string
): Promise<string> {
  
  // Don't accuse - create opportunity for authentic learning
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: `The learner has submitted content that may not represent 
      their authentic understanding. Your goal is to assess their actual 
      capability through conversation - not to accuse them.`,
    messages: [
      {
        role: 'user',
        content: `Generate a respectful verification question about this submission:

"${suspiciousContent}"

Ask them to:
1. Explain their thinking process
2. Apply the concept to a NEW scenario
3. Walk through their reasoning

Be warm and curious, not accusatory.`
      }
    ]
  });
  
  return response.content[0].text;
}

// Example response:
// "I see strong analysis in your submission! I'd love to understand 
// your thinking better. Can you walk me through how you identified 
// those external factors? What made you focus on competition rather 
// than regulations?"
```

---

## 12. Assessment & Grading

### 12.1 Competency-Based Assessment Philosophy

**No Numeric Grades. Ever.**

AMU uses three levels only:
- ✅ **Competent** - Clear evidence of capability
- 🔄 **Developing** - Partial understanding, needs refinement
- ❌ **Not Yet Demonstrated** - Insufficient evidence

**Why?**
- Focus on capability, not performance
- Developmental mindset
- Reduces anxiety and competition
- Aligns with real-world: you can do it, or you're learning to

### 12.2 Evidence Sources

**Competency evidence comes from:**

1. **Conversation** (70% weight)
   - Questions asked
   - Insights demonstrated
   - Connections made
   - Application to context

2. **Assignment** (25% weight)
   - Workplace application
   - Analysis quality
   - Practical understanding

3. **Self-Reflection** (5% weight)
   - Metacognitive awareness
   - Understanding of own development

### 12.3 Assignment Grading (Automated)

**Submission Flow:**

```javascript
async function gradeAssignment(
  assignmentId: string
): Promise<AssignmentGrade> {
  
  const assignment = await getAssignment(assignmentId);
  const enrollment = await getEnrollment(assignment.assignment_enrollment_id);
  const competency = await getCompetency(assignment.assignment_competency_id);
  
  // Get conversation context (how have they engaged with this competency?)
  const conversationEvidence = await getConversationEvidence(
    enrollment.enrollment_id,
    competency.competency_id
  );
  
  // Build comprehensive grading context
  const gradingPrompt = buildGradingPrompt({
    assignment,
    competency,
    conversationEvidence,
    enrollment
  });
  
  // Call Claude for grading
  const grading = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: gradingPrompt,
    messages: [
      {
        role: 'user',
        content: 'Grade this assignment according to the rubric.'
      }
    ]
  });
  
  const grade = JSON.parse(grading.content[0].text);
  
  // Store grading
  await firestore
    .collection('assignments')
    .doc(assignmentId)
    .update({
      assignment_status: 'graded',
      assignment_graded_date: new Date(),
      assignment_grade: grade.overall_grade,
      assignment_feedback: grade.feedback,
      assignment_strengths: grade.strengths,
      assignment_development_areas: grade.development_areas,
      assignment_grading_tokens: grading.usage.total_tokens
    });
  
  return grade;
}
```

**Grading Prompt:**

```javascript
function buildGradingPrompt(context: GradingContext): string {
  return `You are grading a business application assignment for AMU.

═══════════════════════════════════════════════════════════
GRADING PHILOSOPHY
═══════════════════════════════════════════════════════════

You grade for CAPABILITY, not performance. Focus on what the learner 
can DO, not how "good" their writing is.

Three levels only:
• COMPETENT: Clear evidence they can apply this competency
• DEVELOPING: Partial understanding, needs refinement
• NOT YET: Insufficient evidence of capability

Be developmental, not punitive. Your feedback should guide improvement.

═══════════════════════════════════════════════════════════
COMPETENCY BEING ASSESSED
═══════════════════════════════════════════════════════════

${context.competency.competency_title}
${context.competency.competency_description}

Evidence Criteria:
${context.competency.competency_evidence_criteria.map(c => `• ${c}`).join('\n')}

═══════════════════════════════════════════════════════════
LEARNER CONTEXT
═══════════════════════════════════════════════════════════

Name: ${context.assignment.assignment_user_name}
Workplace: ${context.enrollment.enrollment_workplace_context}
Language: ${context.enrollment.enrollment_language}

Conversation Evidence (what they've shown in dialogue):
${context.conversationEvidence.map(e => `• ${e.summary}`).join('\n')}

═══════════════════════════════════════════════════════════
ASSIGNMENT SUBMISSION
═══════════════════════════════════════════════════════════

Workplace Context:
${context.assignment.assignment_workplace_context}

Learner's Response:
${context.assignment.assignment_content}

═══════════════════════════════════════════════════════════
GRADING RUBRIC
═══════════════════════════════════════════════════════════

COMPETENT:
• Identifies all required elements correctly
• Applies concept to their specific workplace context
• Explains reasoning clearly
• Makes appropriate connections
• Shows independent thinking

DEVELOPING:
• Identifies most elements (missing 1-2)
• Applies concept but with gaps
• Some reasoning unclear or incomplete
• Few connections made
• Shows promise but needs refinement

NOT YET:
• Misses multiple required elements
• Struggles to apply to context
• Reasoning unclear or incorrect
• No meaningful connections
• Needs significant development

═══════════════════════════════════════════════════════════
RESPOND WITH JSON
═══════════════════════════════════════════════════════════

{
  "overall_grade": "competent" | "developing" | "not_yet",
  
  "criteria_assessment": {
    "criterion_1": { "met": true/false, "evidence": "quote from submission" },
    "criterion_2": { "met": true/false, "evidence": "..." }
  },
  
  "strengths": [
    "What they did well (2-3 specific points)"
  ],
  
  "development_areas": [
    "What needs work (if not competent, 2-3 specific points)"
  ],
  
  "feedback": "2-3 paragraph developmental feedback that:
    • Celebrates strengths
    • Explains grade rationale
    • Guides improvement (if needed)
    • Encourages continued learning
    • Is warm and supportive",
  
  "next_steps": "What they should focus on next"
}

CRITICAL: Be fair but rigorous. "Competent" means they truly can do this.`;
}
```

**Example Grading Output:**

```json
{
  "overall_grade": "developing",
  
  "criteria_assessment": {
    "identify_internal_factors": {
      "met": true,
      "evidence": "Identified aging vehicles, driver training, and maintenance schedules as internal factors"
    },
    "identify_external_factors": {
      "met": true,
      "evidence": "Identified competition, fuel prices, and regulations"
    },
    "explain_controllability": {
      "met": false,
      "evidence": "Stated they're 'controllable' but didn't explain why or to what degree"
    },
    "apply_to_decision_making": {
      "met": false,
      "evidence": "Listed factors but didn't show how this analysis informs actual decisions"
    }
  },
  
  "strengths": [
    "Excellent identification of both internal and external factors from your taxi company context",
    "Clear understanding that some factors come from inside vs. outside the organization",
    "Good use of specific examples from your workplace"
  ],
  
  "development_areas": [
    "Need to explain WHY internal factors are more controllable (what makes them different?)",
    "Should show HOW this analysis helps make better decisions (connect to action)",
    "Could explore DEGREE of control (some internal factors are easier to change than others)"
  ],
  
  "feedback": "Sipho, you've done solid work identifying internal and external factors in your taxi company! Your examples are clear and relevant - aging vehicles, driver training, competition, fuel prices. This shows you grasp the basic distinction.

To reach 'Competent' level, I need to see you explain the 'why' and 'how': Why are internal factors more controllable? How does knowing this help you make better decisions? For instance, when you face rising fuel prices (external), how might understanding this as external rather than internal change your response?

Let's strengthen your analysis. Think about: If you could only fix ONE thing on your list, which would it be and why? How does the internal vs. external distinction help you prioritize?",
  
  "next_steps": "Revise your submission focusing on: (1) Explain why controllability matters, (2) Show how this analysis guides real decisions in your taxi company"
}
```

### 12.4 Grading Consistency Mechanisms

**Challenge:** Each grading is independent. How do we ensure consistency?

**Solution: Calibration Examples**

```javascript
const CALIBRATION_EXAMPLES = {
  competency_id: 'identify_internal_external_factors',
  
  exemplar_competent: {
    submission: "In our hospital, internal factors include nurse-to-patient ratios (we control staffing), equipment maintenance schedules (we decide frequency), and training programmes (we design these). External factors include Department of Health regulations (we must comply but can't change them), medical aid reimbursement rates (set by insurers), and pandemic-related patient volumes (unpredictable).

The key difference is control: internal factors we can directly change through management decisions. External factors require adaptation - we can't stop regulations or a pandemic, but we can adjust our operations to handle them.

This matters for decision-making. When equipment breaks frequently (internal), we can fix it by changing maintenance schedules. When patient volumes surge due to external factors, we adapt by adjusting shifts and priorities, not by trying to control the factor itself.",
    
    grade: "competent",
    reasoning: "Identifies multiple factors, explains controllability clearly, shows application to decision-making"
  },
  
  exemplar_developing: {
    submission: "Internal factors at my clinic: staff, equipment, supplies. External factors: government policies, economy, competition.

Internal is things we control. External is outside things we can't control.",
    
    grade: "developing",
    reasoning: "Correctly identifies factors but explanation is surface-level. No depth on why controllability matters or how it informs decisions"
  },
  
  exemplar_not_yet: {
    submission: "Internal factors are important. External factors affect the business. Companies need to consider both.",
    
    grade: "not_yet",
    reasoning: "Generic statements with no specific identification of factors from their context. No demonstration of understanding"
  }
};

// Include in grading prompt
function includeCalibrationExamples(competencyId: string): string {
  const examples = CALIBRATION_EXAMPLES[competencyId];
  
  return `
CALIBRATION EXAMPLES:

Example of COMPETENT:
Submission: "${examples.exemplar_competent.submission}"
Grade: ${examples.exemplar_competent.grade}
Why: ${examples.exemplar_competent.reasoning}

Example of DEVELOPING:
Submission: "${examples.exemplar_developing.submission}"
Grade: ${examples.exemplar_developing.grade}
Why: ${examples.exemplar_developing.reasoning}

Example of NOT YET:
Submission: "${examples.exemplar_not_yet.submission}"
Grade: ${examples.exemplar_not_yet.grade}
Why: ${examples.exemplar_not_yet.reasoning}

Grade the current submission using the same standards.`;
}
```

### 12.5 Plagiarism Detection Integration

**Before grading, check for plagiarism:**

```javascript
async function checkPlagiarismBeforeGrading(
  assignmentId: string
): Promise<PlagiarismCheckResult> {
  
  const assignment = await getAssignment(assignmentId);
  
  // 1. Check against all other submissions
  const similarSubmissions = await findSimilarAssignments(
    assignment.assignment_content,
    assignment.assignment_competency_id
  );
  
  // 2. Check writing style consistency
  const conversationStyle = await getConversationWritingStyle(
    assignment.assignment_user_id,
    assignment.assignment_enrollment_id
  );
  
  const styleConsistent = await compareWritingStyles(
    assignment.assignment_content,
    conversationStyle
  );
  
  // 3. Vocabulary complexity check
  const conversationVocab = await getConversationVocabulary(
    assignment.assignment_user_id
  );
  
  const vocabConsistent = compareVocabularyLevels(
    assignment.assignment_content,
    conversationVocab
  );
  
  // 4. Concept usage check
  const conceptsUsed = extractConcepts(assignment.assignment_content);
  const conceptsDiscussed = await getConceptsFromConversation(
    assignment.assignment_enrollment_id
  );
  
  const unexplainedConcepts = conceptsUsed.filter(
    c => !conceptsDiscussed.includes(c)
  );
  
  // Determine plagiarism risk
  const risk = calculatePlagiarismRisk({
    similarSubmissions,
    styleConsistent,
    vocabConsistent,
    unexplainedConcepts
  });
  
  if (risk.level === 'high') {
    // Don't grade automatically - flag for verification
    await flagForVerification(assignmentId, risk);
    return { flagged: true, risk };
  }
  
  return { flagged: false, risk };
}

async function verifyThroughConversation(
  assignmentId: string,
  plagiarismRisk: PlagiarismRisk
): Promise<void> {
  
  const assignment = await getAssignment(assignmentId);
  const conversationId = assignment.assignment_conversation_id;
  
  // Generate verification questions
  const verificationMessage = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Generate respectful verification questions about this submission:

"${assignment.assignment_content}"

Suspected issues:
${plagiarismRisk.reasons.join('\n')}

Create 2-3 questions that assess if they truly understand their submission.
Be warm and curious, NEVER accusatory.

Example approach:
"I see strong analysis! Can you walk me through how you identified 
those factors? What made you focus on X rather than Y?"`
      }
    ]
  });
  
  // Send verification questions in conversation
  await storeMessage(conversationId, {
    role: 'assistant',
    content: verificationMessage.content[0].text,
    timestamp: new Date(),
    metadata: { type: 'plagiarism_verification' }
  });
}
```

---


## 13. AI-as-Learner Testing

### 13.1 Why AI Testing?

**The Problem:** New educational content may have:
- Unclear instructions
- Missing context
- Logical gaps in discovery process
- Assumptions about prior knowledge
- Culturally inappropriate examples
- Scaffolding that doesn't work

**Traditional Solution:** Release to humans, get feedback, fix iteratively
**Problem with Traditional:** Real learners experience poor quality first

**AMU Solution:** AI learners test ALL content BEFORE any human sees it

### 13.2 Six AI Learner Personas

Each persona represents a different learner type AMU will serve:

```javascript
const AI_LEARNER_PERSONAS = {
  
  persona_1: {
    name: "Nomvula",
    profile: {
      language: "isiZulu (primary), English (secondary)",
      location: "eThekwini (Durban), South Africa",
      background: "Municipal infrastructure maintenance worker, 15 years experience",
      education: "Grade 11, technical training on the job",
      learning_style: "Practical, prefers concrete examples, learns by doing",
      experience_level: "Beginner in formal asset management, expert in practical work",
      workplace: "eThekwini Municipality - Water & Sanitation Department",
      challenges: [
        "English academic terminology unfamiliar",
        "Prefers isiZulu when concepts are new",
        "Needs concrete workplace examples",
        "Skeptical of 'theory' - wants practical value"
      ]
    },
    testing_value: "Tests accessibility for working-class learners, multilingual functionality, practical applicability"
  },
  
  persona_2: {
    name: "James",
    profile: {
      language: "English",
      location: "Sandton, Johannesburg, South Africa",
      background: "Engineering graduate working at mining company",
      education: "BEng Mechanical Engineering (Wits University)",
      learning_style: "Analytical, likes theory, seeks deeper understanding",
      experience_level: "Intermediate - has engineering foundation, new to asset management",
      workplace: "AngloGold Ashanti - Mine Maintenance Division",
      challenges: [
        "Impatient with basic concepts",
        "Wants to connect to engineering principles",
        "May skip ahead without mastering basics",
        "Can be overconfident"
      ]
    },
    testing_value: "Tests depth of content, challenges scaffolding, ensures content works for educated learners"
  },
  
  persona_3: {
    name: "Fatima",
    profile: {
      language: "English, Afrikaans",
      location: "Cape Town, South Africa",
      background: "Facilities manager for corporate office complex",
      education: "National Diploma in Property Management",
      learning_style: "Structured, likes checklists, prefers step-by-step",
      experience_level: "Intermediate - manages assets but lacks formal AM framework",
      workplace: "Property management company - 12 office buildings",
      challenges: [
        "Needs clear structure and order",
        "Uncomfortable with ambiguity",
        "Wants frameworks and processes",
        "Struggles with abstract concepts"
      ]
    },
    testing_value: "Tests clarity of structure, checks if scaffolding is sufficient, validates frameworks"
  },
  
  persona_4: {
    name: "Thabo",
    profile: {
      language: "Sesotho, English",
      location: "Bloemfontein, Free State, South Africa",
      background: "Hospital maintenance supervisor",
      education: "National Certificate in Electrical Engineering",
      learning_style: "Cautious, asks many questions, needs reassurance",
      experience_level: "Beginner - technical skills strong, management experience limited",
      workplace: "Universitas Hospital - Maintenance Department (8 staff)",
      challenges: [
        "Lacks confidence in academic settings",
        "Asks for definitions repeatedly",
        "Worried about 'getting it wrong'",
        "Needs encouragement and validation"
      ]
    },
    testing_value: "Tests if facilitation is encouraging, checks scaffolding adequacy, ensures no-one left behind"
  },
  
  persona_5: {
    name: "Sarah",
    profile: {
      language: "English",
      location: "Nairobi, Kenya",
      background: "Fleet manager for logistics company",
      education: "Bachelor of Commerce, MBA in progress",
      learning_style: "Strategic, business-focused, wants ROI perspective",
      experience_level: "Advanced - strategic thinker, needs AM to link to business value",
      workplace: "East African logistics company - 200+ vehicle fleet",
      challenges: [
        "Impatient with operational details",
        "Wants strategic insights quickly",
        "May miss important foundational concepts",
        "Needs to see business case for everything"
      ]
    },
    testing_value: "Tests international applicability, ensures content has strategic depth, validates business relevance"
  },
  
  persona_6: {
    name: "Mandla",
    profile: {
      language: "isiXhosa (primary), English (secondary)",
      location: "Mthatha, Eastern Cape, South Africa",
      background: "Rural municipality infrastructure technician",
      education: "N3 Engineering Studies",
      learning_style: "Community-focused, learns through stories and relationships",
      experience_level: "Beginner - practical skills, limited exposure to formal systems",
      workplace: "King Sabata Dalindyebo Local Municipality - Roads & Stormwater",
      challenges: [
        "Limited internet connectivity (intermittent)",
        "English academic language challenging",
        "Prefers isiXhosa for complex concepts",
        "Limited prior formal education",
        "Balances work with community responsibilities"
      ]
    },
    testing_value: "Tests extreme accessibility, offline resilience, cultural appropriateness, language clarity"
  }
};
```

### 13.3 Automated Testing Process

**When to Run Tests:**

```javascript
const TESTING_TRIGGERS = {
  
  NEW_CONTENT: {
    trigger: "New module added to GitHub",
    test_type: "comprehensive",
    personas: "all_six",
    duration: "~45-60 minutes",
    cost: "~$8-12"
  },
  
  CONTENT_UPDATE: {
    trigger: "Existing module updated",
    test_type: "targeted",
    personas: "most_relevant_three",
    duration: "~20-30 minutes",
    cost: "~$3-5"
  },
  
  SCHEDULED_QUALITY_CHECK: {
    trigger: "Monthly comprehensive review",
    test_type: "comprehensive",
    personas: "all_six",
    duration: "~2-3 hours (all modules)",
    cost: "~$50-80"
  }
};
```

**Test Execution:**

```javascript
export const runAILearnerTest = functions.https.onCall(async (data, context) => {
  
  const { moduleId, testType } = data;
  
  // Create test run record
  const testRunId = generateId('aitest');
  await firestore.collection('ai_test_runs').doc(testRunId).set({
    test_run_id: testRunId,
    test_run_module_id: moduleId,
    test_run_type: testType,
    test_run_status: 'running',
    test_run_started_date: new Date(),
    test_run_personas_completed: [],
    test_run_personas_total: 6
  });
  
  // Load module content
  const module = await getModule(moduleId);
  const caseStudy = await getCaseStudy(module.module_case_study_id);
  
  // Run test for each persona
  const results = [];
  
  for (const personaKey of Object.keys(AI_LEARNER_PERSONAS)) {
    const persona = AI_LEARNER_PERSONAS[personaKey];
    
    console.log(`Testing module ${moduleId} with persona: ${persona.name}`);
    
    const result = await testModuleWithPersona(
      module,
      caseStudy,
      persona,
      testRunId
    );
    
    results.push(result);
    
    // Update progress
    await firestore.collection('ai_test_runs').doc(testRunId).update({
      test_run_personas_completed: FieldValue.arrayUnion(personaKey)
    });
  }
  
  // Analyze overall results
  const analysis = await analyzeTestResults(results);
  
  // Store final results
  await firestore.collection('ai_test_runs').doc(testRunId).update({
    test_run_status: 'completed',
    test_run_completed_date: new Date(),
    test_run_results: results,
    test_run_analysis: analysis,
    test_run_overall_score: analysis.overall_score,
    test_run_critical_issues: analysis.critical_issues,
    test_run_recommendations: analysis.recommendations
  });
  
  // If critical issues found, flag for review
  if (analysis.critical_issues.length > 0) {
    await flagModuleForReview(moduleId, testRunId);
  }
  
  return {
    testRunId,
    overallScore: analysis.overall_score,
    criticalIssues: analysis.critical_issues.length,
    recommendations: analysis.recommendations
  };
});
```

**Testing with Single Persona:**

```javascript
async function testModuleWithPersona(
  module: Module,
  caseStudy: CaseStudy,
  persona: Persona,
  testRunId: string
): Promise<PersonaTestResult> {
  
  // Build test conversation context
  const testContext = buildTestContext(module, caseStudy, persona);
  
  // Simulate full learning journey
  const conversation = [];
  let currentCompetencyIndex = 0;
  let messageCount = 0;
  const MAX_MESSAGES = 50;  // Safety limit
  
  // Initial greeting
  const greeting = await generateInitialGreeting(module, persona);
  conversation.push({ role: 'assistant', content: greeting });
  
  while (currentCompetencyIndex < module.module_competencies.length && 
         messageCount < MAX_MESSAGES) {
    
    const competency = module.module_competencies[currentCompetencyIndex];
    
    // AI learner responds based on persona characteristics
    const learnerResponse = await generatePersonaResponse(
      conversation,
      competency,
      persona,
      testContext
    );
    
    conversation.push({ role: 'user', content: learnerResponse });
    messageCount++;
    
    // Get facilitator response
    const facilitatorResponse = await getFacilitatorResponse(
      conversation,
      competency,
      persona,
      testContext
    );
    
    conversation.push({ role: 'assistant', content: facilitatorResponse });
    messageCount++;
    
    // Check if competency demonstrated
    const demonstrated = await checkCompetencyDemonstrated(
      conversation,
      competency,
      persona
    );
    
    if (demonstrated) {
      currentCompetencyIndex++;
    }
    
    // Safety check for infinite loops
    if (messageCount >= MAX_MESSAGES) {
      console.warn(`Test exceeded ${MAX_MESSAGES} messages for ${persona.name}`);
      break;
    }
  }
  
  // Analyze conversation quality
  const analysis = await analyzeConversationQuality(
    conversation,
    module,
    persona,
    currentCompetencyIndex
  );
  
  // Store test result
  const result: PersonaTestResult = {
    test_result_id: generateId('testresult'),
    test_result_run_id: testRunId,
    test_result_persona_name: persona.name,
    test_result_module_id: module.module_id,
    test_result_conversation: conversation,
    test_result_competencies_completed: currentCompetencyIndex,
    test_result_total_competencies: module.module_competencies.length,
    test_result_message_count: messageCount,
    test_result_score: analysis.score,
    test_result_issues_found: analysis.issues,
    test_result_strengths: analysis.strengths,
    test_result_recommendations: analysis.recommendations,
    test_result_timestamp: new Date()
  };
  
  await firestore.collection('ai_test_results').doc(result.test_result_id).set(result);
  
  return result;
}
```

**Generating Persona-Appropriate Responses:**

```javascript
async function generatePersonaResponse(
  conversation: Message[],
  competency: Competency,
  persona: Persona,
  context: TestContext
): Promise<string> {
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: `You are role-playing as ${persona.name}, an AI learner testing educational content.

PERSONA PROFILE:
${JSON.stringify(persona.profile, null, 2)}

CURRENT COMPETENCY FOCUS:
${competency.competency_title}
${competency.competency_description}

CASE STUDY CONTEXT:
${context.caseStudy.case_study_title}
${context.caseStudy.case_study_scenario}

YOUR ROLE:
Respond as ${persona.name} would - with their language preferences, 
learning style, challenges, and workplace context. Be authentic to 
the persona's characteristics.

TESTING GOALS:
• Test if the facilitation is clear
• Check if scaffolding helps when you're stuck
• Verify cultural appropriateness
• Assess if examples make sense
• See if discovery process works

IMPORTANT:
• Respond in ${persona.profile.language} (but can understand English)
• Show ${persona.profile.learning_style} characteristics
• Display ${persona.profile.challenges.join(', ')}
• Reference ${persona.profile.workplace} when applicable
• Be realistic - struggle where this persona would struggle

Generate your next response as ${persona.name}.`,
    messages: [
      ...conversation.slice(-10),  // Last 10 messages for context
      {
        role: 'user',
        content: 'What would this learner say next?'
      }
    ]
  });
  
  return response.content[0].text;
}
```

### 13.4 Test Result Analysis

```javascript
async function analyzeConversationQuality(
  conversation: Message[],
  module: Module,
  persona: Persona,
  competenciesCompleted: number
): Promise<TestAnalysis> {
  
  const analysis = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Analyze this test conversation for quality issues.

PERSONA TESTED: ${persona.name}
${JSON.stringify(persona.profile, null, 2)}

MODULE: ${module.module_title}
COMPETENCIES: ${competenciesCompleted} of ${module.module_competencies.length} completed

CONVERSATION (${conversation.length} messages):
${conversation.map((m, i) => `[${i}] ${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

ANALYZE FOR:

1. CLARITY: Are instructions clear? Does the learner understand what's expected?
2. SCAFFOLDING: When learner struggles, does facilitation help effectively?
3. DISCOVERY PROCESS: Does problem-based discovery work? Or does learner need more guidance?
4. CULTURAL APPROPRIATENESS: Are examples relevant to this learner's context?
5. LANGUAGE: If learner preferred non-English, was that respected?
6. ENGAGEMENT: Does conversation maintain interest and momentum?
7. COMPETENCY ACHIEVEMENT: Did learner demonstrate competencies naturally?

SCORE: Rate overall quality 0-10 (10 = perfect, 0 = major issues)

RESPOND WITH JSON:
{
  "score": 8.5,
  "completion_rate": 0.85,
  
  "strengths": [
    "Specific things that worked well"
  ],
  
  "issues": [
    {
      "severity": "critical" | "moderate" | "minor",
      "category": "clarity" | "scaffolding" | "discovery" | "cultural" | "language" | "engagement",
      "description": "What went wrong",
      "location": "message number where issue occurred",
      "impact": "How this affects learning"
    }
  ],
  
  "recommendations": [
    "Specific improvements to make"
  ],
  
  "persona_specific_notes": "How well content worked for THIS specific learner type"
}`
      }
    ]
  });
  
  return JSON.parse(analysis.content[0].text);
}
```

**Aggregating Results Across All Personas:**

```javascript
async function analyzeTestResults(
  personaResults: PersonaTestResult[]
): Promise<OverallTestAnalysis> {
  
  // Calculate aggregate scores
  const scores = personaResults.map(r => r.test_result_score);
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Collect all issues
  const allIssues = personaResults.flatMap(r => r.test_result_issues_found);
  
  // Group by severity
  const criticalIssues = allIssues.filter(i => i.severity === 'critical');
  const moderateIssues = allIssues.filter(i => i.severity === 'moderate');
  const minorIssues = allIssues.filter(i => i.severity === 'minor');
  
  // Identify patterns
  const issuePatterns = await identifyIssuePatterns(allIssues);
  
  // Generate recommendations
  const recommendations = await generateRecommendations(
    personaResults,
    issuePatterns
  );
  
  return {
    overall_score: overallScore,
    personas_tested: personaResults.length,
    completion_rates: personaResults.map(r => ({
      persona: r.test_result_persona_name,
      rate: r.test_result_competencies_completed / r.test_result_total_competencies
    })),
    critical_issues: criticalIssues,
    moderate_issues: moderateIssues,
    minor_issues: minorIssues,
    issue_patterns: issuePatterns,
    recommendations: recommendations,
    ready_for_production: overallScore >= 8.0 && criticalIssues.length === 0
  };
}

function identifyIssuePatterns(issues: Issue[]): IssuePattern[] {
  // Group similar issues
  const grouped = {};
  
  for (const issue of issues) {
    const key = `${issue.category}_${issue.description.substring(0, 50)}`;
    if (!grouped[key]) {
      grouped[key] = {
        category: issue.category,
        description: issue.description,
        occurrences: [],
        affected_personas: []
      };
    }
    grouped[key].occurrences.push(issue);
    if (!grouped[key].affected_personas.includes(issue.persona_name)) {
      grouped[key].affected_personas.push(issue.persona_name);
    }
  }
  
  // Return patterns that occurred multiple times
  return Object.values(grouped).filter(p => p.occurrences.length > 1);
}
```

### 13.5 Quality Gates

**Module must pass quality gates to go live:**

```javascript
const QUALITY_GATES = {
  
  GATE_1_SCORE: {
    requirement: "Overall score ≥ 8.0/10",
    rationale: "Content must be high quality across all learner types"
  },
  
  GATE_2_CRITICAL: {
    requirement: "Zero critical issues",
    rationale: "Critical issues block learning - must be resolved"
  },
  
  GATE_3_COMPLETION: {
    requirement: "All personas complete ≥ 80% of competencies",
    rationale: "Content must work for everyone, not just some"
  },
  
  GATE_4_ACCESSIBILITY: {
    requirement: "Multilingual personas (Nomvula, Mandla) score ≥ 7.5",
    rationale: "Must verify content works in languages other than English"
  },
  
  GATE_5_INCLUSIVITY: {
    requirement: "Low-education personas (Nomvula, Thabo, Mandla) score ≥ 7.5",
    rationale: "Must be accessible to those with limited formal education"
  }
};

async function checkQualityGates(
  testRunId: string
): Promise<QualityGateResult> {
  
  const testRun = await getTestRun(testRunId);
  const analysis = testRun.test_run_analysis;
  
  const gates = {
    gate_1_score: analysis.overall_score >= 8.0,
    gate_2_critical: analysis.critical_issues.length === 0,
    gate_3_completion: analysis.completion_rates.every(r => r.rate >= 0.8),
    gate_4_accessibility: checkAccessibilityScores(analysis),
    gate_5_inclusivity: checkInclusivityScores(analysis)
  };
  
  const allPassed = Object.values(gates).every(g => g === true);
  
  return {
    passed: allPassed,
    gates: gates,
    recommendation: allPassed ? 
      'APPROVED: Module ready for production' : 
      'BLOCKED: Address issues before releasing to learners'
  };
}
```

### 13.6 Test Results Dashboard

```javascript
// For Muhammad Ali to review test results

interface TestResultsDashboard {
  test_run_id: string;
  module_title: string;
  overall_score: number;
  quality_gates_passed: boolean;
  
  persona_results: {
    persona_name: string;
    score: number;
    completion_rate: number;
    key_issues: string[];
  }[];
  
  critical_issues: Issue[];
  recommendations: string[];
  
  action_required: string;  // "Approve" | "Review Issues" | "Major Revision Needed"
}
```

**Example Test Report:**

```
╔═══════════════════════════════════════════════════════════╗
║  AI LEARNER TEST RESULTS                                  ║
║  Module: QCTO KM-01 - Work Management Process            ║
╚═══════════════════════════════════════════════════════════╝

OVERALL SCORE: 7.2/10
STATUS: ⚠️  BLOCKED - Issues require attention

QUALITY GATES:
✅ Gate 1: Score ≥ 8.0         ❌ FAILED (7.2)
✅ Gate 2: Zero critical       ✅ PASSED
❌ Gate 3: 80% completion      ❌ FAILED (3/6 personas < 80%)
❌ Gate 4: Multilingual ≥ 7.5  ❌ FAILED
✅ Gate 5: Inclusivity ≥ 7.5   ✅ PASSED

PERSONA RESULTS:
┌─────────────────┬───────┬──────────┬─────────────────┐
│ Persona         │ Score │ Complete │ Key Issues      │
├─────────────────┼───────┼──────────┼─────────────────┤
│ Nomvula (zu)    │  6.8  │   75%    │ Language        │
│ James (en)      │  8.5  │   100%   │ -               │
│ Fatima (en/af)  │  7.9  │   90%    │ Structure       │
│ Thabo (st/en)   │  7.2  │   85%    │ Confidence      │
│ Sarah (en-KE)   │  8.1  │   95%    │ -               │
│ Mandla (xh)     │  4.8  │   55%    │ Language, Basic │
└─────────────────┴───────┴──────────┴─────────────────┘

CRITICAL ISSUES: 0

MODERATE ISSUES: 3
1. [Language] Nomvula and Mandla struggled when complex 
   concepts introduced in English without isiZulu/isiXhosa support
   → Affects: 2/6 personas
   → Recommendation: Add language-specific terminology guide

2. [Scaffolding] Mandla got stuck at competency 2 with 
   insufficient scaffolding provided
   → Affects: 1/6 personas (but represents 30% of SA population)
   → Recommendation: Add intermediate scaffolding level

3. [Case Study] Rural context (Mandla) couldn't relate to 
   "Old Mill Bakery" urban scenario
   → Affects: 1/6 personas
   → Recommendation: Add alternative rural case study option

RECOMMENDATIONS:
1. HIGH PRIORITY: Enhance multilingual support
   - Add isiZulu and isiXhosa terminology throughout
   - Provide translations of key concepts inline
   
2. HIGH PRIORITY: Add scaffolding for Competency 2
   - Break into smaller steps
   - Provide more concrete examples
   
3. MEDIUM: Create alternative case study for rural context
   - Municipality infrastructure example
   - More relevant to Mandla's context

ACTION REQUIRED: ⚠️  ADDRESS ISSUES BEFORE RELEASE

[Review Full Transcript] [Approve with Changes] [Request Revision]
```

---

## 14. Intelligent Content Improvement

### 14.1 Philosophy

**Traditional Content Management:**
- Author creates content
- Students experience it
- Maybe get feedback
- Update next semester

**AMU Content Management:**
- Author creates content
- **AI tests it first**
- Humans experience it
- **AI analyzes conversations**
- **AI suggests improvements**
- Human reviews and approves
- **Continuous evolution**

### 14.2 Improvement Sources

```javascript
const IMPROVEMENT_SOURCES = {
  
  SOURCE_1_AI_TESTING: {
    description: "Issues found during AI learner testing",
    frequency: "Before content goes live",
    examples: [
      "Persona struggled with unclear instructions",
      "Scaffolding insufficient for beginner learners",
      "Case study not relatable to certain contexts"
    ]
  },
  
  SOURCE_2_CONVERSATION_ANALYSIS: {
    description: "Patterns detected in real learner conversations",
    frequency: "After every 100 conversations on a module",
    examples: [
      "80% of learners ask for definition of term X - suggest adding glossary",
      "Learners consistently confused between concepts A and B - add comparison",
      "Common misconception: X causes Y - add clarification"
    ]
  },
  
  SOURCE_3_COMPETENCY_TRACKING: {
    description: "Competency achievement patterns",
    frequency: "Weekly analysis",
    examples: [
      "Competency 3 has 40% 'developing' rate - may need restructuring",
      "Learners who struggle with Competency 2 also struggle with Competency 4 - suggest prerequisite",
      "Assignment questions for Competency 5 unclear - 60% require revision"
    ]
  },
  
  SOURCE_4_SPLIT_TESTING: {
    description: "A/B testing results for content variations",
    frequency: "After statistical significance reached",
    examples: [
      "Version B (concrete example first) performs 15% better than Version A (definition first)",
      "Scaffolding approach 2 reduces 'stuck' rate by 25%",
      "Case study revision increases engagement by 20%"
    ]
  },
  
  SOURCE_5_LEARNER_FEEDBACK: {
    description: "Direct suggestions from learners",
    frequency: "Continuous",
    examples: [
      '"This example would work better as a hospital scenario"',
      '"The term \'asset lifecycle\' confused me until message 47"',
      '"More examples from transport industry would help"'
    ]
  }
};
```

### 14.3 Automated Conversation Analysis

**After 100 conversations, analyze patterns:**

```javascript
export const analyzeModuleConversations = functions.pubsub
  .schedule('every sunday 02:00')
  .timeZone('Africa/Johannesburg')
  .onRun(async (context) => {
    
    // Get all modules
    const modules = await getAllModules();
    
    for (const module of modules) {
      // Count conversations
      const conversationCount = await countModuleConversations(module.module_id);
      
      if (conversationCount >= 100) {
        console.log(`Analyzing ${conversationCount} conversations for module ${module.module_title}`);
        
        // Analyze
        const analysis = await analyzeConversationsForModule(module.module_id);
        
        // Generate improvement suggestions
        const suggestions = await generateImprovementSuggestions(
          module,
          analysis
        );
        
        // Store for review
        await storeImprovementSuggestions(module.module_id, suggestions);
        
        // Notify Muhammad Ali if high-priority suggestions
        if (suggestions.some(s => s.priority === 'high')) {
          await notifyContentReview(module.module_id, suggestions);
        }
      }
    }
  });

async function analyzeConversationsForModule(
  moduleId: string
): Promise<ConversationAnalysis> {
  
  // Get sample of recent conversations (last 200)
  const conversations = await getRecentModuleConversations(moduleId, 200);
  
  // Extract key data points
  const data = {
    common_questions: await extractCommonQuestions(conversations),
    struggle_points: await identifyStrugglePoints(conversations),
    competency_achievement_rates: await analyzeCompetencyRates(moduleId),
    engagement_patterns: await analyzeEngagement(conversations),
    language_usage: await analyzeLanguagePreferences(conversations),
    completion_rate: await calculateCompletionRate(moduleId),
    average_messages_to_competency: await calculateMessagesToCompetency(moduleId)
  };
  
  // Use Claude to analyze patterns
  const analysis = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: `Analyze conversation patterns for content improvement opportunities.

MODULE: ${await getModuleTitle(moduleId)}

DATA FROM 200 CONVERSATIONS:

COMMON QUESTIONS (asked by 20%+ of learners):
${data.common_questions.map(q => `• ${q.question} (asked by ${q.percentage}%)`).join('\n')}

STRUGGLE POINTS (where learners get stuck):
${data.struggle_points.map(s => `• Competency: ${s.competency}, Stuck rate: ${s.percentage}%, Common issue: ${s.issue}`).join('\n')}

COMPETENCY ACHIEVEMENT RATES:
${data.competency_achievement_rates.map(c => `• ${c.competency}: ${c.competent}% competent, ${c.developing}% developing, ${c.not_yet}% not yet`).join('\n')}

ENGAGEMENT:
• Average messages per competency: ${data.average_messages_to_competency}
• Completion rate: ${data.completion_rate}%
• Languages used: ${Object.keys(data.language_usage).join(', ')}

IDENTIFY:
1. Content gaps (what are learners asking about that content doesn't address?)
2. Unclear instructions (where do learners consistently get confused?)
3. Ineffective scaffolding (where are learners getting stuck despite help?)
4. Missing examples (what contexts are learners requesting?)
5. Terminology issues (what terms cause confusion?)
6. Structural improvements (how could flow be better?)

RESPOND WITH JSON:
{
  "findings": [
    {
      "category": "content_gap" | "unclear_instruction" | "scaffolding" | "examples" | "terminology" | "structure",
      "severity": "high" | "medium" | "low",
      "description": "What the issue is",
      "evidence": "Data supporting this finding",
      "impact": "How many learners affected",
      "location": "Where in module this occurs"
    }
  ],
  
  "strengths": [
    "What's working well (to preserve in updates)"
  ]
}`
      }
    ]
  });
  
  return JSON.parse(analysis.content[0].text);
}
```

### 14.4 Generating Improvement Suggestions

```javascript
async function generateImprovementSuggestions(
  module: Module,
  analysis: ConversationAnalysis
): Promise<ImprovementSuggestion[]> {
  
  const suggestions = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    messages: [
      {
        role: 'user',
        content: `Generate specific, actionable improvement suggestions.

MODULE: ${module.module_title}

CURRENT CONTENT STRUCTURE:
${JSON.stringify(module, null, 2)}

ANALYSIS FINDINGS:
${JSON.stringify(analysis.findings, null, 2)}

For each finding, suggest:
1. WHAT to change (specific content element)
2. HOW to change it (concrete revision)
3. WHY this will help (expected impact)
4. PRIORITY (high/medium/low based on learners affected)

RESPOND WITH JSON:
{
  "suggestions": [
    {
      "suggestion_id": "unique_id",
      "priority": "high" | "medium" | "low",
      "category": "content_gap" | "clarity" | "scaffolding" | "examples" | "terminology" | "structure",
      "title": "Short description",
      "current_state": "What exists now",
      "proposed_change": "Specific revision to make",
      "expected_impact": "How this improves learning",
      "estimated_effort": "Small (< 1 hour) | Medium (1-3 hours) | Large (> 3 hours)",
      "affected_competency": "which competency this relates to",
      "evidence": "Data supporting this suggestion"
    }
  ]
}`
      }
    ]
  });
  
  return JSON.parse(suggestions.content[0].text).suggestions;
}
```

**Example Improvement Suggestion:**

```json
{
  "suggestion_id": "km01_comp2_scaffolding_2024w47",
  "priority": "high",
  "category": "scaffolding",
  "title": "Add intermediate scaffolding for stakeholder identification",
  
  "current_state": "Competency 2 (Identify stakeholders) has two scaffolding levels: gentle hint and direct example. Analysis shows 35% of learners need intermediate support.",
  
  "proposed_change": "Add intermediate scaffolding level:
    
    Level 1 (current): 'Think about who is affected by the bakery's decisions...'
    
    Level 2 (NEW): 'Consider three groups: people who work at the bakery, people who buy from the bakery, and people who regulate the bakery. Can you identify specific stakeholders in each group?'
    
    Level 3 (current direct example): 'Stakeholders include: employees (affected by wages)...'",
  
  "expected_impact": "Reduce 'developing' rate from 35% to < 20% for Competency 2. Provide structure without giving answer away.",
  
  "estimated_effort": "Small (< 1 hour) - add one scaffolding tier to facilitator playbook",
  
  "affected_competency": "Competency 2: Identify stakeholders",
  
  "evidence": "70/200 conversations (35%) required Level 3 scaffolding for Competency 2. Of these, 45 (64%) said Level 2 would have been helpful. Average messages to competency: 12 (target: 8)."
}
```

### 14.5 Human Review Workflow

**Muhammad Ali reviews and approves suggestions:**

```javascript
// Store suggestions for review
async function storeImprovementSuggestions(
  moduleId: string,
  suggestions: ImprovementSuggestion[]
): Promise<void> {
  
  for (const suggestion of suggestions) {
    await firestore.collection('content_improvements').add({
      improvement_id: suggestion.suggestion_id,
      improvement_module_id: moduleId,
      improvement_priority: suggestion.priority,
      improvement_category: suggestion.category,
      improvement_title: suggestion.title,
      improvement_proposed_change: suggestion.proposed_change,
      improvement_expected_impact: suggestion.expected_impact,
      improvement_evidence: suggestion.evidence,
      improvement_status: 'pending_review',
      improvement_created_date: new Date(),
      improvement_reviewed: false
    });
  }
}

// Review interface
interface ImprovementReviewUI {
  suggestion: ImprovementSuggestion;
  actions: {
    approve: () => Promise<void>;           // Apply immediately
    approve_with_split_test: () => Promise<void>;  // Test against current version
    modify: (changes: string) => Promise<void>;    // Edit before applying
    reject: (reason: string) => Promise<void>;      // Decline with reason
    defer: (reason: string) => Promise<void>;       // Review later
  };
}
```

**Applying Approved Improvements:**

```javascript
async function applyContentImprovement(
  improvementId: string,
  approvedBy: string
): Promise<void> {
  
  const improvement = await getImprovement(improvementId);
  const module = await getModule(improvement.improvement_module_id);
  
  // Create GitHub branch
  const branchName = `improvement/${improvementId}`;
  await createGitHubBranch(branchName);
  
  // Apply changes to content files
  const changes = await applyChangesToContent(
    module,
    improvement.improvement_proposed_change
  );
  
  // Commit to branch
  await commitChanges(branchName, changes, {
    message: `Apply improvement: ${improvement.improvement_title}`,
    improvementId: improvementId,
    approvedBy: approvedBy
  });
  
  // Create pull request
  const pr = await createPullRequest(branchName, {
    title: improvement.improvement_title,
    description: `${improvement.improvement_expected_impact}\n\nEvidence: ${improvement.improvement_evidence}`
  });
  
  // Update improvement status
  await firestore.collection('content_improvements').doc(improvementId).update({
    improvement_status: 'approved',
    improvement_approved_by: approvedBy,
    improvement_approved_date: new Date(),
    improvement_github_pr: pr.url
  });
  
  // Merge PR (auto-deploy to production)
  await mergePullRequest(pr.number);
  
  console.log(`✅ Applied improvement ${improvementId} to module ${module.module_title}`);
}
```

### 14.6 Split Testing Framework

**When improvement is significant, test both versions:**

```javascript
async function createSplitTest(
  improvementId: string
): Promise<string> {
  
  const improvement = await getImprovement(improvementId);
  const module = await getModule(improvement.improvement_module_id);
  
  // Create test record
  const splitTestId = generateId('split');
  await firestore.collection('split_tests').doc(splitTestId).set({
    split_test_id: splitTestId,
    split_test_module_id: module.module_id,
    split_test_improvement_id: improvementId,
    split_test_status: 'active',
    split_test_started_date: new Date(),
    
    // Version A: Current content
    split_test_version_a: {
      name: 'Current',
      content: module.current_content
    },
    
    // Version B: Proposed improvement
    split_test_version_b: {
      name: improvement.improvement_title,
      content: improvement.improvement_proposed_change
    },
    
    // Allocation: 50/50 random
    split_test_allocation: 'random_50_50',
    
    // Target sample size
    split_test_target_sample: 100,  // 50 per version
    split_test_current_sample_a: 0,
    split_test_current_sample_b: 0,
    
    // Metrics to track
    split_test_metrics: [
      'competency_achievement_rate',
      'messages_to_competency',
      'learner_satisfaction',
      'stuck_rate'
    ],
    
    // Stop conditions
    split_test_stop_conditions: {
      sample_reached: true,
      significant_difference: true,
      learner_very_offended: true,      // ✅ Ethical override
      three_dissatisfied_in_row: true    // ✅ Ethical override
    }
  });
  
  return splitTestId;
}

// Assign learner to test version
async function assignToSplitTest(
  enrollmentId: string,
  moduleId: string
): Promise<string> {
  
  // Check if module has active split test
  const splitTest = await getActiveSplitTest(moduleId);
  
  if (!splitTest) {
    return 'standard';  // No test, use current content
  }
  
  // Random 50/50 allocation
  const version = Math.random() < 0.5 ? 'version_a' : 'version_b';
  
  // Record assignment
  await firestore.collection('split_tests').doc(splitTest.split_test_id).update({
    [`split_test_current_sample_${version === 'version_a' ? 'a' : 'b'}`]: FieldValue.increment(1)
  });
  
  await firestore.collection('enrollments').doc(enrollmentId).update({
    enrollment_split_test_id: splitTest.split_test_id,
    enrollment_split_test_version: version
  });
  
  return version;
}
```

**Ethical Stop Conditions:**

```javascript
async function checkSplitTestStopConditions(
  splitTestId: string
): Promise<boolean> {
  
  const splitTest = await getSplitTest(splitTestId);
  
  // Stop Condition 1: Sample size reached
  if (splitTest.split_test_current_sample_a >= 50 && 
      splitTest.split_test_current_sample_b >= 50) {
    await stopSplitTest(splitTestId, 'sample_reached');
    return true;
  }
  
  // Stop Condition 2: Significant difference detected
  const results = await analyzeSplitTestResults(splitTestId);
  if (results.statistical_significance && results.p_value < 0.05) {
    await stopSplitTest(splitTestId, 'significant_difference');
    return true;
  }
  
  // Stop Condition 3: Learner very offended/upset (ETHICAL OVERRIDE)
  const recentFeedback = await getRecentSplitTestFeedback(splitTestId, 5);
  const veryNegative = recentFeedback.filter(f => f.sentiment === 'very_negative');
  
  if (veryNegative.length > 0) {
    // Determine which version caused offense
    const offendingVersion = veryNegative[0].version;
    
    await stopSplitTest(splitTestId, 'learner_offended', {
      offending_version: offendingVersion,
      feedback: veryNegative[0].feedback
    });
    
    console.log(`⚠️  ETHICAL STOP: Split test ${splitTestId} stopped due to learner distress`);
    return true;
  }
  
  // Stop Condition 4: Three dissatisfied in a row (ETHICAL OVERRIDE)
  const lastThree = await getLastThreeSplitTestFeedbacks(splitTestId);
  if (lastThree.every(f => f.satisfaction < 3)) {  // All rated < 3/5
    const problematicVersion = lastThree[0].version;
    
    await stopSplitTest(splitTestId, 'pattern_of_dissatisfaction', {
      problematic_version: problematicVersion
    });
    
    console.log(`⚠️  ETHICAL STOP: Split test ${splitTestId} stopped due to pattern of dissatisfaction`);
    return true;
  }
  
  return false;
}
```

**Analyzing Split Test Results:**

```javascript
async function analyzeSplitTestResults(
  splitTestId: string
): Promise<SplitTestAnalysis> {
  
  const splitTest = await getSplitTest(splitTestId);
  
  // Get results for each version
  const resultsA = await getVersionResults(splitTest, 'version_a');
  const resultsB = await getVersionResults(splitTest, 'version_b');
  
  // Statistical analysis
  const analysis = {
    version_a: {
      sample_size: resultsA.length,
      competency_rate: calculateRate(resultsA, 'competent'),
      avg_messages: calculateAverage(resultsA, 'messages'),
      satisfaction: calculateAverage(resultsA, 'satisfaction'),
      stuck_rate: calculateRate(resultsA, 'stuck')
    },
    version_b: {
      sample_size: resultsB.length,
      competency_rate: calculateRate(resultsB, 'competent'),
      avg_messages: calculateAverage(resultsB, 'messages'),
      satisfaction: calculateAverage(resultsB, 'satisfaction'),
      stuck_rate: calculateRate(resultsB, 'stuck')
    }
  };
  
  // T-test for significance
  const tTest = performTTest(resultsA, resultsB, 'competency_rate');
  
  // Determine winner
  const winner = analysis.version_b.competency_rate > analysis.version_a.competency_rate ? 
    'version_b' : 'version_a';
  
  const improvement = Math.abs(
    analysis.version_b.competency_rate - analysis.version_a.competency_rate
  ) / analysis.version_a.competency_rate * 100;
  
  return {
    ...analysis,
    statistical_significance: tTest.p_value < 0.05,
    p_value: tTest.p_value,
    winner: winner,
    improvement_percentage: improvement,
    recommendation: tTest.p_value < 0.05 ?
      `Deploy ${winner}: ${improvement.toFixed(1)}% improvement` :
      'No significant difference - keep current version'
  };
}
```

---


# PART 4: COURSE STRUCTURE

## 15. Content Architecture

### 15.1 GitHub-Based Content Management

**All educational content lives in GitHub**, enabling:
- Version control (who changed what, when, why)
- Open-source collaboration
- Community contributions
- Rollback capability
- Branching for testing
- Pull request review workflow

**Repository Structure:**

```
amu-content/  (PUBLIC REPOSITORY)
├── README.md
├── CONTRIBUTING.md
├── LICENSE.md
│
├── courses/
│   ├── gfmam/
│   │   ├── 3011-organisational-context/
│   │   │   ├── module.json
│   │   │   ├── learning-objectives.md
│   │   │   ├── case-study.md
│   │   │   ├── competencies.json
│   │   │   ├── facilitator-playbook.md
│   │   │   ├── discovery-questions.md
│   │   │   ├── scaffolding-strategies.md
│   │   │   └── common-misconceptions.md
│   │   │
│   │   └── 3012-asset-information/
│   │       └── (similar structure)
│   │
│   └── qcto/
│       ├── knowledge-modules/
│       │   ├── km-01-work-management/
│       │   └── km-02-job-planning/
│       │
│       ├── practical-modules/
│       │   └── pm-01-maintenance-planning/
│       │
│       └── work-experience/
│           └── we-01-workplace-application/
│
├── case-studies/
│   ├── old-mill-bakery/
│   │   ├── scenario.md
│   │   ├── characters.json
│   │   ├── data-sheets/
│   │   └── images/
│   │
│   └── ethekwini-water-department/
│       └── (similar structure)
│
├── assessments/
│   ├── gfmam-3011-assignments.json
│   └── qcto-km01-assignments.json
│
├── website/  (NEW - As per your requirement!)
│   ├── pages/
│   │   ├── homepage.md
│   │   ├── about.md
│   │   ├── how-it-works.md
│   │   ├── pricing.md
│   │   └── faqs.md
│   │
│   ├── components/
│   │   ├── hero-section.md
│   │   ├── value-propositions.md
│   │   └── testimonials.json
│   │
│   ├── marketing/
│   │   ├── messaging.md
│   │   └── taglines.json
│   │
│   └── legal/
│       ├── terms-of-service.md
│       ├── privacy-policy.md
│       └── popi-compliance.md
│
├── emails/
│   ├── welcome-tier2.md
│   ├── certificate-ready.md
│   └── seta-approved.md
│
├── ui-text/
│   ├── buttons.json
│   ├── error-messages.json
│   └── navigation.json
│
└── ai-prompts/
    ├── facilitator-system-prompt.md
    ├── grading-rubric.md
    └── ai-learner-personas.json
```

### 15.2 Module Metadata (module.json)

```json
{
  "module_id": "gfmam-3011",
  "module_code": "3011",
  "module_title": "Organisational Context",
  "module_description": "Understand how internal and external factors shape asset management decisions within organisational context.",
  
  "framework_alignment": {
    "framework": "GFMAM",
    "subject": "Asset Management Strategy & Planning",
    "level": "Foundation"
  },
  
  "nqf_details": null,
  
  "estimated_hours": 8,
  "estimated_facilitation_time": 3,
  
  "prerequisites": [],
  
  "learning_objectives": [
    "Identify internal and external factors affecting the organisation",
    "Explain organisational purpose and how it guides decisions",
    "Analyse stakeholder needs and competing interests",
    "Apply organisational context analysis to asset management decisions"
  ],
  
  "case_study_id": "old-mill-bakery",
  
  "competencies": [
    {
      "competency_id": "gfmam-3011-comp-01",
      "competency_title": "Identify internal and external factors",
      "competency_description": "Distinguish between factors the organisation can control (internal) and factors from the environment (external).",
      "evidence_criteria": [
        "Identifies at least 3 internal factors from case study or workplace",
        "Identifies at least 3 external factors from case study or workplace",
        "Explains why each factor is classified as internal or external",
        "Discusses degree of control over each factor"
      ],
      "assessment_methods": ["conversation", "assignment"]
    },
    {
      "competency_id": "gfmam-3011-comp-02",
      "competency_title": "Explain organisational purpose",
      "competency_description": "Articulate what the organisation exists to achieve and how this guides decision-making.",
      "evidence_criteria": [
        "States the organisation's core purpose clearly",
        "Identifies key stakeholders and their needs",
        "Explains how purpose guides priorities",
        "Gives examples of decisions aligned with purpose"
      ],
      "assessment_methods": ["conversation", "assignment"]
    }
  ],
  
  "version": "2.1.0",
  "last_updated": "2024-11-15",
  "author": "Asset Management University",
  "contributors": [
    "Muhammad Ali",
    "GFMAM Content Review Committee"
  ],
  
  "languages_available": ["en", "af", "zu", "xh"],
  
  "content_files": {
    "facilitator_playbook": "facilitator-playbook.md",
    "discovery_questions": "discovery-questions.md",
    "scaffolding_strategies": "scaffolding-strategies.md",
    "common_misconceptions": "common-misconceptions.md"
  }
}
```

### 15.3 Case Study Format (case-study.md)

```markdown
# Old Mill Bakery

## Context

Old Mill Bakery is a traditional family bakery in a small South African town. 
Founded 25 years ago by the Naidoo family, it's known for fresh bread, pastries, 
and wedding cakes.

## Characters

### Lena Naidoo (56)
- **Role:** Co-owner, baker
- **Background:** Learned baking from her mother, runs the bakery with her daughter
- **Personality:** Traditional, values quality, resistant to change
- **Concern:** "We've always done it this way and it's worked"

### Thandi Naidoo (31)
- **Role:** Co-owner, business manager
- **Background:** Business degree, returned home after working in Johannesburg
- **Personality:** Progressive, sees potential for growth, tech-savvy
- **Concern:** "We need to adapt or we'll lose everything"

### Jacob (47)
- **Role:** Head baker (employee, 15 years)
- **Background:** Experienced baker, loyal to the family
- **Concern:** Job security, wants training, worried about new equipment

## Current Situation

The bakery is at a crossroads. Sales have declined 25% in the past year.

**Recent Changes in Environment:**
- **NEW:** Large supermarket opened 2km away with in-store bakery
- **NEW:** Municipal health regulations require kitchen upgrades (R50,000)
- **NEW:** Customers requesting gluten-free and vegan options
- **ONGOING:** Aging oven breaks down frequently (purchased 1998)
- **ONGOING:** Rising flour and electricity costs

**Lena and Thandi's Challenges:**
- Should they invest R50,000 in kitchen upgrades?
- Should they replace the oven (R80,000)?
- Should they offer new product types?
- Should they train staff in new baking techniques?
- How do they compete with the supermarket?

**Available Resources:**
- R100,000 in savings
- Small business loan possible (R150,000 at 12% interest)
- Loyal customer base (but shrinking)
- Prime location on main street
- Good relationships with 3 local wedding venues

## Data Provided to Learners

### Financial Snapshot
- Monthly revenue (current): R85,000
- Monthly revenue (last year): R110,000
- Monthly costs: R75,000
- Monthly profit: R10,000 (down from R35,000)

### Equipment Status
- Oven: 26 years old, breaks monthly, repair costs R2,000/month
- Mixers: Good condition
- Display fridges: Need replacement within 2 years

### Competition Analysis
- Supermarket bakery: Lower prices, mass production, open 6am-9pm
- Old Mill: Higher quality, personal service, limited hours (6am-5pm)

### Customer Feedback (from survey)
- 78% say quality excellent
- 45% want gluten-free options
- 32% say supermarket more convenient
- 89% would miss Old Mill if it closed

## Learning Opportunities

This case study enables exploration of:
- **Internal factors:** Equipment, staff, processes, cash flow (controllable)
- **External factors:** Competition, regulations, customer preferences (must adapt to)
- **Organisational purpose:** Quality traditional baking vs. mass market convenience
- **Stakeholder needs:** Owners, employees, customers, community, regulators
- **Decision-making:** Balancing constraints, priorities, and competing interests
- **Asset management:** Maintain existing oven or replace? Invest in upgrades or not?

## Cultural Context Notes

- **South African setting:** Municipal regulations, rand currency, local business dynamics
- **Family business:** Intergenerational tensions (tradition vs. progress)
- **Community:** Small town where bakery is social institution
- **Accessibility:** Relatable to learners in various sectors (principles apply beyond baking)

## Facilitator Guidance

**Opening Question:** "What challenges are Lena and Thandi facing?"

**Discovery Path:**
1. Learner identifies challenges (list what they notice)
2. Guide categorisation: What's inside vs. outside their control?
3. Explore stakeholders: Who cares about this bakery? What do they each need?
4. Discuss purpose: What should guide their decisions?
5. Apply to learner's workplace: What parallels exist?

**Scaffolding if Stuck:**
- Level 1: "Think about what they can change directly vs. what just happened to them..."
- Level 2: "The oven is their equipment - they decide about it. The supermarket just appeared - they can't control that. Do you see the difference?"
- Level 3: "Some factors are internal (inside the business, they control). Some are external (outside forces, they must respond to). Can you identify which is which?"

## Alternate Contexts

For learners who don't relate to bakery example, facilitator can adapt to:
- **Hospital:** Equipment maintenance, health regulations, patient satisfaction
- **Municipality:** Infrastructure, community needs, budget constraints
- **Transport:** Fleet maintenance, traffic regulations, customer service
- **Manufacturing:** Production equipment, market competition, quality standards

The **principles remain the same**, just context changes.
```

### 15.4 Facilitator Playbook (facilitator-playbook.md)

```markdown
# Facilitator Playbook: GFMAM 3011 - Organisational Context

## Module Overview

**Goal:** Help learner discover how organisational context shapes asset management decisions.

**Core Concepts:**
- Internal vs. external factors
- Organisational purpose
- Stakeholder analysis
- Context-informed decision-making

**Pedagogical Approach:** Problem-based discovery through Old Mill Bakery case study

---

## Facilitation Flow

### Phase 1: Problem Introduction (Messages 1-5)

**Your Role:** Present the scenario, invite exploration

**Opening:**
"Hi [Name]! Welcome to this module on Organisational Context. 

We're going to explore how organisations make decisions by looking at 
Old Mill Bakery - a family bakery facing some tough challenges.

Lena and Thandi own the bakery. Sales are down 25%, their oven keeps 
breaking, and a new supermarket just opened nearby. They're trying to 
figure out what to do.

What challenges do you notice they're facing?"

**What to Listen For:**
- Does learner identify multiple challenges?
- Do they distinguish types of challenges?
- Do they connect to their own experience?

**DON'T:**
- ❌ Explain internal/external factors yet
- ❌ Give definitions
- ❌ Move to solutions

**DO:**
- ✅ List out challenges learner identifies
- ✅ Ask: "What else do you notice?"
- ✅ Celebrate their observations

---

### Phase 2: Discovery of Internal vs. External (Messages 6-15)

**Your Role:** Guide categorisation through questions

**Key Question:**
"Looking at your list, do you notice any differences between these challenges? 
Some they might be able to control, and others they just have to deal with?"

**Discovery Path:**

**If learner sees pattern immediately:**
→ "Exactly! Some things are inside their control, others come from outside. 
   Can you group them that way?"

**If learner partially gets it:**
→ "You're on the right track! Think about the oven versus the supermarket. 
   What's different about those two challenges?"

**If learner is stuck:**
→ Apply scaffolding (see below)

**Celebrate the Insight:**
When learner distinguishes controllable from uncontrollable:

"Perfect! You've just discovered the concept of internal and external factors! 

Internal factors = things inside the organisation that management can 
influence or control (like their oven, their staff, their processes).

External factors = forces from outside that they can't control but must 
respond to (like the supermarket opening, regulations, customer preferences).

This distinction is crucial for asset management decision-making."

---

### Phase 3: Apply to Learner's Context (Messages 16-25)

**Your Role:** Help learner see pattern in their own workplace

**Bridge Question:**
"Now, thinking about your own workplace [their context], what internal 
factors affect how you manage assets?"

**What to Listen For:**
- Do they identify factors from their actual work?
- Do they understand degree of control?
- Can they explain why classification matters?

**Deepen Understanding:**
"Why does knowing whether something is internal or external matter for 
decision-making?"

**Target Insight:**
- Internal = can change through management action
- External = must adapt, can't eliminate
- Knowing difference helps prioritize and strategize

---

### Phase 4: Stakeholder Analysis (Messages 26-40)

**Your Role:** Expand view beyond owners to all affected parties

**Opening Question:**
"Who else, besides Lena and Thandi, cares about what happens to this bakery?"

**Discovery Path:**
1. Learner identifies stakeholders (employees, customers, etc.)
2. Explore what each group needs/wants
3. Notice: **needs can conflict**
4. Question: "How should they balance competing needs?"

**Key Insight:**
Organisational purpose guides how to balance stakeholder interests.

---

### Phase 5: Assignment (If applicable)

**Business Application:**
"Now apply this to your workplace. In 300-500 words:

1. Identify 3 internal factors affecting asset management
2. Identify 3 external factors
3. Explain why you classified each as internal or external
4. Describe how knowing this helps your decision-making

Use specific examples from your actual work context."

---

## Scaffolding Strategies

### When Learner is Stuck: Internal vs. External

**Level 1: Gentle Nudge**
"Think about what Lena and Thandi can directly change versus what just 
happened to them from outside..."

**Level 2: Contrast Provision**
"Consider their oven versus the new supermarket. They can decide to repair 
or replace the oven - it's their equipment. But they couldn't stop the 
supermarket from opening. Do you see the difference?"

**Level 3: Categories**
"Let me share a framework: Some factors are internal (inside the business, 
they have control). Some are external (outside forces, they must respond to 
but can't eliminate). Looking at the bakery's challenges, which fit each category?"

**Level 4: Direct Teaching**
"Here's the concept: Internal factors are things inside the organisation 
that management controls - like equipment, staff, processes. External factors 
are forces from the environment - like competition, regulations, economic 
conditions. For the bakery: the oven is internal (they own it), the 
supermarket is external (it's outside their control). Does that clarify?"

### When Learner Struggles with Stakeholder Analysis

**Level 1:**
"Think about all the different people affected by the bakery..."

**Level 2:**
"Consider three groups: people who work there, people who buy from there, 
and people who regulate/oversee it. Who are they specifically?"

**Level 3:**
"Stakeholders include employees (Jacob wants job security and training), 
customers (want quality but also convenience), municipality (wants health 
compliance), community (values local business). Each has different needs."

---

## Common Misconceptions

### Misconception 1: "Internal = easy to change"

**Correction:**
"Good observation that it's internal. But 'internal' doesn't always mean 
'easy' - replacing the oven costs R80,000! Internal means they CAN control 
it (decide whether to replace), not that it's simple."

### Misconception 2: "External = ignore it"

**Correction:**
"You're right it's external - they can't eliminate the supermarket. But 
'external' doesn't mean ignore! It means they must ADAPT to it. They can't 
control the competition, but they can decide how to respond (e.g., 
differentiate on quality)."

### Misconception 3: "Organisational purpose = make money"

**Correction:**
"Profit matters, yes! But purpose is deeper: WHY does this bakery exist? 
What value does it create? For Old Mill, it might be 'provide the community 
with quality traditional baked goods.' Purpose guides how they make money, 
not just that they do."

---

## Success Indicators

**Competency 1 Achieved When:**
- Identifies 3+ internal and 3+ external factors
- Explains classification correctly
- Applies to own workplace context
- Discusses degree of control, not just binary yes/no

**Competency 2 Achieved When:**
- Articulates organisational purpose clearly
- Identifies multiple stakeholders
- Explains how purpose guides decisions
- Gives specific examples

**Overall Module Success:**
- Learner sees pattern across contexts (not just bakery)
- Connects concepts to their actual work
- Shows strategic thinking about decisions
- Demonstrates understanding in both conversation and assignment

---

## Adaptation Notes

### For Different Languages

**isiZulu/isiXhosa/Other:**
- Use same discovery process
- Introduce English terminology AFTER concept understood
- Provide translations: "Izinto zangaphakathi (internal factors)"
- Examples may need cultural adaptation

### For Different Contexts

**Hospital/Municipality/Transport:**
- Keep same structure
- Swap Old Mill Bakery examples with relevant sector examples
- Core principles identical across contexts

### For Different Experience Levels

**Beginner:**
- More scaffolding
- Slower pace
- Very concrete examples

**Advanced:**
- Less scaffolding
- Faster pace
- Push to strategic implications

---

## Estimated Timeline

- Phase 1 (Problem): 3-5 messages
- Phase 2 (Internal/External): 8-12 messages
- Phase 3 (Own Context): 5-8 messages
- Phase 4 (Stakeholders): 8-12 messages
- Assignment: Submitted after conversation

**Total:** 25-40 messages over 2-3 sessions

---

## Notes for Continuous Improvement

If learners consistently struggle with:
- **Distinction between internal/external** → Add more scaffolding at Level 2
- **Stakeholder identification** → Provide stakeholder mapping tool
- **Application to own context** → Add workplace-specific prompts

Track patterns and suggest content improvements.
```

### 15.5 Content Update Workflow

**When content needs updating:**

```javascript
// 1. Create improvement branch
await createGitHubBranch('improvement/gfmam-3011-scaffolding-enhancement');

// 2. Make changes to files
await updateFile(
  'courses/gfmam/3011-organisational-context/scaffolding-strategies.md',
  updatedContent
);

// 3. Commit with descriptive message
await commitChanges({
  branch: 'improvement/gfmam-3011-scaffolding-enhancement',
  message: 'Add Level 2.5 scaffolding for stakeholder identification',
  files: ['scaffolding-strategies.md'],
  metadata: {
    improvement_id: 'imp_20241124_001',
    approved_by: 'muhammad_ali',
    evidence: 'AI testing showed 35% of learners need intermediate support'
  }
});

// 4. Create pull request
const pr = await createPullRequest({
  title: 'Enhancement: Add intermediate scaffolding for stakeholder ID',
  description: 'Based on AI testing showing gap between Level 1 and Level 2',
  reviewers: ['muhammad_ali']
});

// 5. After review, merge to main
await mergePullRequest(pr.number);

// 6. Webhook triggers cache update
// Platform automatically pulls latest content

console.log('✅ Content updated and live');
```

### 15.6 Website Content Management (NEW!)

**Website content is also modular and versioned:**

```markdown
<!-- website/pages/homepage.md -->

# Asset Management University
## You Can.

### Hero Section

**Headline:** Develop Asset Management Capability. Free, Forever.

**Subheadline:** AI-facilitated learning in 50+ languages. Learn first, 
certify later. Official SETA certificates from R500.

**CTA:** [Start Learning Free] [How It Works]

---

### Value Propositions

**1. Free Education, Always**
Complete any course without paying. Only certification costs money.

**2. Your Language**
Learn in isiZulu, Afrikaans, English, or 50+ languages. AI facilitates in 
your preferred language.

**3. Your Pace**
No deadlines. No time limits. Resume anytime, anywhere.

**4. Your Context**
Apply concepts to YOUR workplace. Examples from YOUR industry.

**5. Official Certificates**
SETA-registered, NQF-aligned qualifications. Recognised nationally.

---

### How It Works

**Step 1: Start Learning (Free)**
Create account with just name and email. Access all courses immediately.

**Step 2: AI Facilitation**
Claude guides your discovery through real-world problems. Questions, not 
lectures.

**Step 3: Demonstrate Capability**
Show what you can DO through conversation and workplace application.

**Step 4: Certify (Optional)**
Want official recognition? Purchase SETA-registered certificate (R500-R3,300).

---

### Testimonials

> "I couldn't afford R54,000 for the course. AMU let me learn free and 
> certify for R3,000. Now I'm a qualified maintenance planner."
> — Sipho M., eThekwini Municipality

> "Learning in isiZulu made complex concepts finally make sense. The AI 
> never rushed me."
> — Nomvula D., Hospital Maintenance Supervisor

---

### Pricing (Transparent)

**Learning:** Free forever
**Unofficial Certificate:** Free (watermarked PDF)
**Official Certificate:** Variable pricing:
- Short courses (40h): R500-R800
- Full modules (100h): R1,500-R2,000
- QCTO Qualification (300h): R3,000

**Why variable?** Longer courses need more AI facilitation time. You pay 
for what you use.

**Compare:** Industry standard R54,000 for same SETA qualification. 
AMU: R3,000 (95% savings).

---

[See Full Course Catalog]
[Read About Our Philosophy]
[Contact Us]
```

**Updating Website Content:**

```javascript
// Website content updates follow same workflow
await updateFile('website/pages/pricing.md', newPricingContent);
await commitAndDeploy('Update pricing page with new certificate costs');

// Platform automatically re-renders website from latest GitHub content
// Changes live within minutes
```

### 15.7 Content Licensing

**All AMU content is open source:**

```markdown
# LICENSE

MIT License with Educational Use Addendum

Copyright (c) 2024 Asset Management University

Permission is hereby granted, free of charge, to any person or organisation 
obtaining a copy of this educational content, to use, copy, modify, merge, 
publish, and distribute for EDUCATIONAL PURPOSES, subject to the following 
conditions:

1. Attribution: Original source (Asset Management University) must be credited
2. Educational Use: Content may be used for non-commercial education freely
3. Commercial Use: Requires written permission from Asset Management University
4. Improvements: Contributions back to this repository are encouraged
5. Alignment: Content must remain aligned with GFMAM/QCTO/SETA frameworks

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

**Why Open Source?**
- **Ubuntu:** Knowledge belongs to everyone
- **Quality:** Community review improves content
- **Sustainability:** Content survives beyond AMU
- **Collaboration:** Other institutions can use and improve
- **Transparency:** Learners see what they're learning from

---


## 16. GFMAM Courses

### 16.1 GFMAM Framework Overview

**Global Forum for Maintenance and Asset Management (GFMAM)** provides international standards for asset management education.

**AMU Alignment Benefits:**
- International credibility
- Consistent competency frameworks
- Professional recognition globally
- Pathway to ISO 55000 certification

### 16.2 GFMAM Subject Areas

AMU courses align with GFMAM's 39 subjects across 6 groups:

```javascript
const GFMAM_SUBJECTS = {
  
  GROUP_1_STRATEGY_PLANNING: [
    { code: '3011', title: 'Organisational Context', level: 'Foundation' },
    { code: '3012', title: 'Asset Information', level: 'Foundation' },
    { code: '3013', title: 'Asset Management Policy', level: 'Foundation' },
    { code: '3014', title: 'Asset Management Strategy', level: 'Intermediate' },
    { code: '3015', title: 'Strategic Planning', level: 'Intermediate' },
    { code: '3016', title: 'Demand Analysis', level: 'Intermediate' }
  ],
  
  GROUP_2_ASSET_MANAGEMENT_DECISION_MAKING: [
    { code: '3021', title: 'Capital Investment Decision-Making', level: 'Intermediate' },
    { code: '3022', title: 'Operations & Maintenance Decision-Making', level: 'Intermediate' },
    { code: '3023', title: 'Life Cycle Value Realisation', level: 'Advanced' },
    { code: '3024', title: 'Sustainable Development', level: 'Advanced' }
  ],
  
  GROUP_3_LIFECYCLE_DELIVERY: [
    { code: '3031', title: 'Technical Standards & Legislation', level: 'Foundation' },
    { code: '3032', title: 'Asset Creation & Acquisition', level: 'Intermediate' },
    { code: '3033', title: 'Systems Engineering', level: 'Advanced' },
    { code: '3034', title: 'Configuration Management', level: 'Intermediate' },
    { code: '3035', title: 'Maintenance Delivery', level: 'Intermediate' },
    { code: '3036', title: 'Reliability Engineering', level: 'Advanced' },
    { code: '3037', title: 'Asset Operations', level: 'Intermediate' },
    { code: '3038', title: 'Resource Management', level: 'Intermediate' },
    { code: '3039', title: 'Shutdown & Outage Management', level: 'Advanced' },
    { code: '3040', title: 'Asset Decommissioning & Disposal', level: 'Intermediate' }
  ],
  
  GROUP_4_ASSET_INFORMATION: [
    { code: '3041', title: 'Asset Information Strategy', level: 'Intermediate' },
    { code: '3042', title: 'Asset Information Standards', level: 'Intermediate' },
    { code: '3043', title: 'Asset Information Systems', level: 'Intermediate' },
    { code: '3044', title: 'Data & Information Management', level: 'Advanced' }
  ],
  
  GROUP_5_ORGANISATION_PEOPLE: [
    { code: '3051', title: 'Procurement & Supply Chain Management', level: 'Intermediate' },
    { code: '3052', title: 'Asset Management Leadership', level: 'Advanced' },
    { code: '3053', title: 'Organisational Structure', level: 'Intermediate' },
    { code: '3054', title: 'Organisational Culture', level: 'Advanced' },
    { code: '3055', title: 'Competence Management', level: 'Intermediate' }
  ],
  
  GROUP_6_RISK_REVIEW: [
    { code: '3061', title: 'Risk Assessment & Management', level: 'Intermediate' },
    { code: '3062', title: 'Contingency Planning', level: 'Intermediate' },
    { code: '3063', title: 'Management of Change', level: 'Advanced' },
    { code: '3064', title: 'Asset Performance & Health Monitoring', level: 'Intermediate' },
    { code: '3065', title: 'Asset Costing & Valuation', level: 'Advanced' },
    { code: '3066', title: 'Stakeholder Engagement', level: 'Intermediate' },
    { code: '3067', title: 'Performance Measurement & Improvement', level: 'Advanced' },
    { code: '3068', title: 'Management System Assessment', level: 'Advanced' },
    { code: '3069', title: 'Asset Management System Reviews', level: 'Advanced' }
  ]
};
```

### 16.3 Course Development Priorities

**Phase 1 (MVP): Foundation Level** (6 courses)
- 3011: Organisational Context ✅ (First course developed)
- 3012: Asset Information
- 3013: Asset Management Policy
- 3031: Technical Standards & Legislation
- Basic introduction to asset management concepts
- Target: Complete within 3 months of launch

**Phase 2: Intermediate Level** (15 courses)
- Core operational courses
- Decision-making frameworks
- Practical application focus
- Target: 6-9 months post-launch

**Phase 3: Advanced Level** (8 courses)
- Strategic and leadership content
- Complex analysis and optimization
- Target: 12-18 months post-launch

### 16.4 GFMAM Course Pricing

**Certificate Pricing Formula:**
```
Price = R300 (base) + (Estimated Hours × R5/hour)

Foundation (40h): R300 + R200 = R500
Intermediate (80h): R300 + R400 = R700
Advanced (120h): R300 + R600 = R900
```

**Complete GFMAM Pathway:**
- All 39 subjects: Estimated R25,000-R30,000
- Vs. traditional programs: R150,000-R200,000
- **Savings: 80-85%**

### 16.5 Example Course: GFMAM 3012 (Asset Information)

```json
{
  "module_id": "gfmam-3012",
  "module_code": "3012",
  "module_title": "Asset Information",
  "module_description": "Understand the information needed about assets throughout their lifecycle and how to manage it effectively.",
  
  "estimated_hours": 8,
  "estimated_facilitation_time": 3,
  "certificate_price": 500,
  
  "learning_objectives": [
    "Identify types of asset information needed at each lifecycle stage",
    "Explain the relationship between asset information and decision quality",
    "Design basic asset information requirements for your organisation",
    "Apply information management principles to improve asset decisions"
  ],
  
  "case_study_id": "municipality-water-department",
  
  "competencies": [
    {
      "competency_id": "gfmam-3012-comp-01",
      "competency_title": "Identify asset information types",
      "competency_description": "Recognise different categories of asset information and when each is needed.",
      "evidence_criteria": [
        "Lists at least 5 types of asset information",
        "Explains what each type is used for",
        "Identifies which lifecycle stages need which information",
        "Gives examples from own workplace"
      ]
    }
  ]
}
```

---

## 17. QCTO Maintenance Planning Qualification

### 17.1 Qualification Overview

**Full Title:** National Certificate in Maintenance Planning  
**NQF Level:** 5  
**Total Credits:** 120  
**SAQA ID:** 102415  
**SETA:** CHIETA (Chemical Industries Education and Training Authority)

**AMU Target:** Deliver this FULL qualification at R3,000 vs. industry R54,000

### 17.2 Qualification Structure

```javascript
const QCTO_MAINTENANCE_PLANNING = {
  
  KNOWLEDGE_MODULES: {
    description: "Theoretical foundation",
    total_credits: 60,
    notional_hours: 600,
    delivery: "AI-facilitated problem-based discovery",
    
    modules: [
      {
        code: 'KM-01',
        title: 'Work Management Process',
        credits: 10,
        notional_hours: 100,
        nqf_level: 5,
        topics: [
          'Work identification and initiation',
          'Work planning and scheduling',
          'Work execution and control',
          'Work completion and feedback'
        ]
      },
      {
        code: 'KM-02',
        title: 'Job Planning',
        credits: 10,
        notional_hours: 100,
        nqf_level: 5,
        topics: [
          'Job analysis and breakdown',
          'Resource estimation',
          'Method statements',
          'Safety planning'
        ]
      },
      {
        code: 'KM-03',
        title: 'Maintenance Strategy',
        credits: 8,
        notional_hours: 80,
        nqf_level: 5,
        topics: [
          'Preventive maintenance',
          'Predictive maintenance',
          'Corrective maintenance',
          'Maintenance optimization'
        ]
      },
      {
        code: 'KM-04',
        title: 'Planning and Scheduling',
        credits: 10,
        notional_hours: 100,
        nqf_level: 5,
        topics: [
          'Schedule development',
          'Resource allocation',
          'Critical path analysis',
          'Schedule optimization'
        ]
      },
      {
        code: 'KM-05',
        title: 'Maintenance Documentation',
        credits: 8,
        notional_hours: 80,
        nqf_level: 5,
        topics: [
          'Technical drawings',
          'Maintenance procedures',
          'Work orders',
          'History records'
        ]
      },
      {
        code: 'KM-06',
        title: 'Maintenance Information Systems',
        credits: 7,
        notional_hours: 70,
        nqf_level: 5,
        topics: [
          'CMMS fundamentals',
          'Data management',
          'Reporting and KPIs',
          'System optimization'
        ]
      },
      {
        code: 'KM-07',
        title: 'Health, Safety and Environment',
        credits: 7,
        notional_hours: 70,
        nqf_level: 5,
        topics: [
          'Occupational health and safety',
          'Risk assessment',
          'Environmental management',
          'Compliance requirements'
        ]
      }
    ]
  },
  
  PRACTICAL_MODULES: {
    description: "Workplace application",
    total_credits: 40,
    notional_hours: 400,
    delivery: "Simulated workplace tasks + AI assessment",
    
    modules: [
      {
        code: 'PM-01',
        title: 'Plan Maintenance Work',
        credits: 15,
        notional_hours: 150,
        nqf_level: 5,
        tasks: [
          'Analyse work request',
          'Develop job plan',
          'Estimate resources',
          'Create method statement',
          'Identify safety requirements'
        ]
      },
      {
        code: 'PM-02',
        title: 'Schedule Maintenance Activities',
        credits: 15,
        notional_hours: 150,
        nqf_level: 5,
        tasks: [
          'Develop weekly schedule',
          'Allocate resources',
          'Coordinate with operations',
          'Manage schedule changes',
          'Monitor execution'
        ]
      },
      {
        code: 'PM-03',
        title: 'Manage Maintenance Information',
        credits: 10,
        notional_hours: 100,
        nqf_level: 5,
        tasks: [
          'Maintain asset register',
          'Update maintenance history',
          'Generate reports',
          'Analyse performance data',
          'Recommend improvements'
        ]
      }
    ]
  },
  
  WORK_EXPERIENCE: {
    description: "Supervised workplace experience",
    total_credits: 20,
    notional_hours: 200,
    delivery: "Workplace logbook + supervisor verification",
    
    requirements: [
      {
        code: 'WE-01',
        title: 'Workplace Application',
        credits: 20,
        notional_hours: 200,
        requirements: [
          'Complete 200 hours of maintenance planning work',
          'Plan at least 20 maintenance jobs',
          'Schedule at least 4 weeks of maintenance activities',
          'Use maintenance information system',
          'Document learning in logbook',
          'Supervisor verification of competence'
        ]
      }
    ]
  }
};
```

### 17.3 Course Structure Per Module

**Knowledge Modules → Individual Courses**
- Each KM = One separate course
- Learner completes all 7 KM courses for knowledge component

**Practical Modules → Combined Course**
- All 3 PM modules = One practical course
- Simulated workplace scenarios
- AI assessment of practical competence

**Work Experience → Logbook Process**
- Separate registration after KM + PM completion
- Workplace supervisor verification
- AMU facilitates but doesn't deliver (happens at workplace)

### 17.4 Pricing Structure

```javascript
const QCTO_PRICING = {
  knowledge_modules: {
    KM_01: { notional_hours: 100, facilitation_hours: 30, price: 1800 },
    KM_02: { notional_hours: 100, facilitation_hours: 30, price: 1800 },
    KM_03: { notional_hours: 80,  facilitation_hours: 24, price: 1500 },
    KM_04: { notional_hours: 100, facilitation_hours: 30, price: 1800 },
    KM_05: { notional_hours: 80,  facilitation_hours: 24, price: 1500 },
    KM_06: { notional_hours: 70,  facilitation_hours: 21, price: 1350 },
    KM_07: { notional_hours: 70,  facilitation_hours: 21, price: 1350 },
    total: 11100
  },
  
  practical_modules: {
    PM_ALL: { notional_hours: 400, facilitation_hours: 40, price: 2300 },
    total: 2300
  },
  
  work_experience: {
    WE_01: { notional_hours: 200, processing_fee: 300, price: 300 },
    total: 300
  },
  
  FULL_QUALIFICATION_TOTAL: 13700
};

// HOWEVER: Bundle discount for full qualification
const BUNDLE_PRICE = 3000;  // Save R10,700!

// Why bundle discount?
// 1. Encourages full qualification completion
// 2. Competitive with market (R54,000 industry standard)
// 3. Still covers all AI costs
// 4. More valuable to learner = more likely to complete
```

### 17.5 Learner Journey Through Qualification

```javascript
async function enrollInQCTOQualification(userId: string): Promise<string> {
  
  // Create qualification enrollment
  const qualificationEnrollmentId = generateId('qual_enroll');
  
  await firestore.collection('qualification_enrollments').doc(qualificationEnrollmentId).set({
    enrollment_id: qualificationEnrollmentId,
    enrollment_user_id: userId,
    enrollment_qualification: 'QCTO Maintenance Planning',
    enrollment_status: 'active',
    enrollment_started_date: new Date(),
    
    // Components
    enrollment_knowledge_modules_required: [
      'KM-01', 'KM-02', 'KM-03', 'KM-04', 'KM-05', 'KM-06', 'KM-07'
    ],
    enrollment_knowledge_modules_completed: [],
    
    enrollment_practical_modules_required: ['PM-ALL'],
    enrollment_practical_modules_completed: [],
    
    enrollment_work_experience_required: ['WE-01'],
    enrollment_work_experience_completed: [],
    
    // Progress tracking
    enrollment_credits_earned: 0,
    enrollment_credits_total: 120,
    enrollment_progress_percentage: 0,
    
    // Certification
    enrollment_eligible_for_certificate: false,
    enrollment_certificate_purchased: false
  });
  
  // Create course enrollments for each KM
  for (const km of ['KM-01', 'KM-02', 'KM-03', 'KM-04', 'KM-05', 'KM-06', 'KM-07']) {
    await createCourseEnrollment(userId, km, qualificationEnrollmentId);
  }
  
  return qualificationEnrollmentId;
}

async function checkQualificationCompletion(
  qualificationEnrollmentId: string
): Promise<void> {
  
  const enrollment = await getQualificationEnrollment(qualificationEnrollmentId);
  
  // Check if all components complete
  const kmComplete = enrollment.enrollment_knowledge_modules_completed.length === 7;
  const pmComplete = enrollment.enrollment_practical_modules_completed.length === 1;
  const weComplete = enrollment.enrollment_work_experience_completed.length === 1;
  
  if (kmComplete && pmComplete && weComplete) {
    // Eligible for SETA certificate!
    await firestore
      .collection('qualification_enrollments')
      .doc(qualificationEnrollmentId)
      .update({
        enrollment_status: 'completed',
        enrollment_completed_date: new Date(),
        enrollment_eligible_for_certificate: true,
        enrollment_credits_earned: 120
      });
    
    // Notify learner
    await sendEmail(
      enrollment.enrollment_user_id,
      'Congratulations! Qualification Complete',
      qualificationCompleteTemplate(enrollment)
    );
  }
}
```

### 17.6 CHIETA Presentation Strategy

**Key Message:** AMU delivers same SETA-registered qualification at 95% cost reduction

**Comparison Table:**

```
┌────────────────────────────────────────────────────────────┐
│ COMPONENT              │ TRADITIONAL SDP  │ AMU          │
├────────────────────────┼──────────────────┼──────────────┤
│ Knowledge Modules (7)  │ R35,000          │ FREE (learn) │
│                        │                  │ R1,800 (cert)│
├────────────────────────┼──────────────────┼──────────────┤
│ Practical Modules (3)  │ R15,000          │ FREE (learn) │
│                        │                  │ R900 (cert)  │
├────────────────────────┼──────────────────┼──────────────┤
│ Work Experience        │ R4,000           │ R300         │
├────────────────────────┼──────────────────┼──────────────┤
│ TOTAL PER LEARNER      │ R54,000          │ R3,000       │
├────────────────────────┼──────────────────┼──────────────┤
│ SAVINGS                │ -                │ R51,000 (95%)│
└────────────────────────────────────────────────────────────┘

QUALITY:
✅ Same SETA registration
✅ Same NQF level
✅ Same competency standards
✅ Same recognition

ACCESSIBILITY:
✅ Learn for FREE
✅ 50+ languages
✅ Anywhere, anytime
✅ No building required
✅ AI facilitates 24/7

COMPLETION RATES:
Traditional SDPs: 30-40%
AMU Target: 70%+ (competency-based, no time pressure)

CORPORATE BENEFIT:
Skills levy rebate: Up to 70% of training costs
If company trains 10 employees:
- Traditional: R540,000 cost, R378,000 rebate = R162,000 net
- AMU: R30,000 cost, R21,000 rebate = R9,000 net
- SAVINGS: R153,000 (94% reduction)
```

**Value Proposition to CHIETA:**
1. **Accessibility:** Reach learners traditional SDPs can't (rural, working, economic barriers)
2. **Quality:** AI testing ensures content quality BEFORE learners see it
3. **Completion:** Higher completion rates = more certified workers
4. **Innovation:** AI-facilitated learning is future of education
5. **Ubuntu:** Aligns with nation-building goals

---

## 18. GitHub Content Repository

### 18.1 Repository Architecture

**Two Repositories:**

```
1. amu-platform/ (PRIVATE)
   - Application code
   - Proprietary business logic
   - API keys and secrets
   - Infrastructure configuration

2. amu-content/ (PUBLIC)
   - All educational content
   - Case studies
   - Assessments
   - Website content
   - Email templates
   - UI text
   - Anyone can view, copy, improve
```

### 18.2 Content Repository Structure (Complete)

```
amu-content/
│
├── README.md                    # Welcome, how to contribute
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE.md                   # MIT with educational addendum
├── CODE_OF_CONDUCT.md          # Ubuntu principles for contributors
│
├── .github/
│   ├── workflows/
│   │   ├── validate-content.yml    # CI: Validate JSON, markdown
│   │   ├── deploy-to-production.yml # CD: Update platform cache
│   │   └── notify-updates.yml      # Notify on content changes
│   │
│   └── PULL_REQUEST_TEMPLATE.md    # Template for content contributions
│
├── courses/
│   ├── gfmam/
│   │   ├── 3011-organisational-context/
│   │   │   ├── module.json
│   │   │   ├── learning-objectives.md
│   │   │   ├── case-study.md
│   │   │   ├── competencies.json
│   │   │   ├── facilitator-playbook.md
│   │   │   ├── discovery-questions.md
│   │   │   ├── scaffolding-strategies.md
│   │   │   ├── common-misconceptions.md
│   │   │   └── translations/
│   │   │       ├── zu.md  # isiZulu
│   │   │       ├── af.md  # Afrikaans
│   │   │       └── xh.md  # isiXhosa
│   │   │
│   │   └── [... 38 more GFMAM modules]
│   │
│   └── qcto/
│       ├── knowledge-modules/
│       │   ├── km-01-work-management/
│       │   ├── km-02-job-planning/
│       │   └── [... 5 more KM modules]
│       │
│       ├── practical-modules/
│       │   └── pm-all-simulations/
│       │
│       └── work-experience/
│           └── we-01-logbook-template/
│
├── case-studies/
│   ├── old-mill-bakery/
│   │   ├── scenario.md
│   │   ├── characters.json
│   │   ├── data-sheets/
│   │   │   ├── financial.csv
│   │   │   ├── equipment.csv
│   │   │   └── customer-survey.csv
│   │   ├── images/
│   │   │   ├── bakery-exterior.jpg
│   │   │   └── oven-breakdown.jpg
│   │   └── translations/
│   │       └── zu.md
│   │
│   ├── ethekwini-water-department/
│   └── [... more case studies]
│
├── assessments/
│   ├── gfmam-3011-assignments.json
│   ├── qcto-km01-assignments.json
│   └── grading-rubrics/
│       ├── internal-external-factors.json
│       └── stakeholder-analysis.json
│
├── website/                     # ✅ NEW - Your requirement!
│   ├── pages/
│   │   ├── homepage.md
│   │   ├── about.md
│   │   ├── how-it-works.md
│   │   ├── pricing.md
│   │   ├── courses.md
│   │   ├── faqs.md
│   │   ├── contact.md
│   │   ├── privacy-policy.md
│   │   ├── terms-of-service.md
│   │   └── popi-compliance.md
│   │
│   ├── components/
│   │   ├── hero-section.md
│   │   ├── value-propositions.md
│   │   ├── how-it-works-steps.md
│   │   ├── testimonials.json
│   │   ├── pricing-table.md
│   │   ├── cta-sections.md
│   │   └── footer-content.md
│   │
│   ├── marketing/
│   │   ├── taglines.json
│   │   ├── messaging.md
│   │   ├── brand-voice.md
│   │   └── seo-metadata.json
│   │
│   └── blog/                    # Future: Blog posts
│       └── 2024-11-launch.md
│
├── emails/
│   ├── transactional/
│   │   ├── welcome-tier2.md
│   │   ├── email-verification.md
│   │   ├── password-reset.md
│   │   └── certificate-ready.md
│   │
│   ├── educational/
│   │   ├── module-completed.md
│   │   ├── competency-achieved.md
│   │   └── encouragement-if-stuck.md
│   │
│   ├── commercial/
│   │   ├── referral-earned.md
│   │   ├── seta-approved.md
│   │   └── payment-confirmation.md
│   │
│   └── templates/
│       └── email-base-template.html
│
├── ui-text/
│   ├── buttons.json
│   ├── labels.json
│   ├── placeholders.json
│   ├── error-messages.json
│   ├── success-messages.json
│   ├── navigation.json
│   ├── dashboard-text.json
│   └── tooltips.json
│
├── ai-prompts/
│   ├── facilitator-system-prompt.md
│   ├── grading-rubric.md
│   ├── plagiarism-verification.md
│   ├── content-analysis.md
│   ├── ai-learner-personas.json
│   └── conversation-summary.md
│
├── translations/
│   ├── terminology/
│   │   ├── asset-management-terms-en-zu.json
│   │   ├── asset-management-terms-en-af.json
│   │   └── asset-management-terms-en-xh.json
│   │
│   └── ui/
│       ├── ui-text-zu.json
│       └── ui-text-af.json
│
├── media/
│   ├── brand/
│   │   ├── logo.svg
│   │   ├── logo-with-tagline.svg
│   │   └── brand-colors.json
│   │
│   ├── illustrations/
│   │   ├── hero-image.svg
│   │   └── feature-icons/
│   │
│   └── certificates/
│       └── certificate-template.svg
│
└── docs/
    ├── content-creation-guide.md
    ├── facilitator-best-practices.md
    ├── case-study-template.md
    └── contribution-workflow.md
```

### 18.3 Webhook Integration

**GitHub → Platform automatic updates:**

```javascript
// When content pushed to main branch, GitHub calls webhook
export const githubContentWebhook = functions.https.onRequest(async (req, res) => {
  
  // Verify webhook signature
  const signature = req.headers['x-hub-signature-256'];
  if (!verifyGitHubSignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = req.body;
  
  // Only process push events to main branch
  if (event.ref !== 'refs/heads/main') {
    return res.status(200).send('Ignoring non-main branch');
  }
  
  // Get changed files
  const changedFiles = event.commits.flatMap(c => [
    ...c.added,
    ...c.modified,
    ...c.removed
  ]);
  
  console.log(`Content update: ${changedFiles.length} files changed`);
  
  // Update content cache
  for (const file of changedFiles) {
    if (file.endsWith('.md') || file.endsWith('.json')) {
      await updateContentCache(file);
    }
  }
  
  // Notify admins
  await notifyContentUpdate(event.pusher.name, changedFiles);
  
  res.status(200).send('Content updated');
});

async function updateContentCache(filePath: string): Promise<void> {
  // Fetch latest version from GitHub
  const content = await fetchFromGitHub('amu-content', filePath);
  
  // Update Cloud Storage cache
  const bucket = storage.bucket('amu-content-cache-production');
  const file = bucket.file(filePath);
  
  await file.save(content, {
    metadata: {
      contentType: getContentType(filePath),
      cacheControl: 'public, max-age=3600'  // 1 hour cache
    }
  });
  
  console.log(`✅ Updated cache: ${filePath}`);
}
```

### 18.4 Content Validation (CI/CD)

**GitHub Actions automatically validate content:**

```yaml
# .github/workflows/validate-content.yml

name: Validate Content

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Validate JSON files
        run: |
          find . -name "*.json" -exec sh -c '
            echo "Validating {}"
            python3 -m json.tool {} > /dev/null || exit 1
          ' \;
      
      - name: Validate markdown structure
        run: |
          npm install -g markdownlint-cli
          markdownlint "**/*.md" --config .markdownlint.json
      
      - name: Check competency completeness
        run: |
          python3 scripts/validate-competencies.py
      
      - name: Verify case study references
        run: |
          python3 scripts/verify-case-studies.py
      
      - name: Check for broken links
        run: |
          npm install -g markdown-link-check
          find . -name "*.md" -exec markdown-link-check {} \;
      
      - name: Validate translations consistency
        run: |
          python3 scripts/validate-translations.py
```

### 18.5 Community Contribution Workflow

**How external contributors improve content:**

```markdown
# CONTRIBUTING.md

## How to Contribute to AMU Content

Thank you for helping make asset management education accessible to everyone!

### Types of Contributions

1. **Fix Errors:** Typos, incorrect information, broken links
2. **Improve Clarity:** Better explanations, additional examples
3. **Add Translations:** Content in additional languages
4. **Suggest Case Studies:** Industry-specific scenarios
5. **Enhance Accessibility:** Simpler language, better structure

### Contribution Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/amu/amu-content.git
   cd amu-content
   git checkout -b fix/gfmam-3011-typo
   ```

2. **Make Your Changes**
   - Edit relevant files
   - Follow existing structure
   - Test locally if possible

3. **Commit with Clear Message**
   ```bash
   git add courses/gfmam/3011-organisational-context/scaffolding-strategies.md
   git commit -m "Add intermediate scaffolding for stakeholder identification"
   ```

4. **Push and Create Pull Request**
   ```bash
   git push origin fix/gfmam-3011-typo
   ```
   Then create PR on GitHub with description of change

5. **Review Process**
   - AMU team reviews within 3-5 business days
   - May request clarifications or modifications
   - Once approved, merged to main
   - Your name added to contributors list

### Content Standards

**Language:**
- UK English spelling (colour, organisation, etc.)
- Clear, accessible language (avoid unnecessary jargon)
- Culturally appropriate for South African context

**Structure:**
- Follow existing module templates
- Maintain consistent formatting
- Include all required sections

**Quality:**
- Factually accurate
- Aligned with GFMAM/QCTO standards
- Tested for clarity

### Recognition

Contributors acknowledged in:
- Repository contributors list
- Module metadata
- Annual acknowledgments

### Questions?

Open an issue or email: contribute@assetmanagementuniversity.org
```

### 18.6 Version Control Best Practices

```javascript
// Semantic Versioning for Content

const CONTENT_VERSIONS = {
  MAJOR: "Breaking changes (structure changes requiring code updates)",
  MINOR: "New content added (new competencies, modules)",
  PATCH: "Fixes and improvements (typos, clarity, examples)"
};

// Example:
// v2.1.3
//  │ │ └─ Patch: Fixed typo in scaffolding strategy
//  │ └─── Minor: Added intermediate scaffolding level
//  └───── Major: Restructured competency framework

// Track in module.json
{
  "version": "2.1.3",
  "version_history": [
    {
      "version": "2.1.3",
      "date": "2024-11-24",
      "changes": "Fixed typo in scaffolding strategy",
      "author": "contributor_name"
    },
    {
      "version": "2.1.0",
      "date": "2024-11-20",
      "changes": "Added intermediate scaffolding level based on AI testing",
      "author": "muhammad_ali"
    }
  ]
}
```

---

## 19. Certificate System

### 19.1 Two Certificate Types

```javascript
const CERTIFICATE_TYPES = {
  
  UNOFFICIAL: {
    name: "Unofficial Certificate",
    watermark: true,
    cost: "FREE",
    format: "PDF",
    generation: "Automatic on completion",
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
    cost: "R500-R3,300 (variable)",
    format: "PDF (digitally signed)",
    generation: "After payment + SETA registration (if applicable)",
    seta_registered: true,  // For QCTO courses
    
    use_cases: [
      "SETA-registered qualification",
      "Formal employer recognition",
      "Job applications",
      "Salary negotiations",
      "Professional development records",
      "NQF credit accumulation"
    ],
    
    benefits: [
      "No watermark",
      "Digitally signed",
      "SETA-registered (QCTO courses)",
      "NQF-aligned",
      "Verification QR code",
      "Recognised nationally"
    ]
  }
};
```

### 19.2 Certificate Generation (Detailed)

**Already covered in Section 10.2, but key points:**

- **Unofficial:** Generated immediately on module completion
- **Official:** Generated after:
  1. All competencies demonstrated
  2. Payment received
  3. SETA registration complete (if applicable)
  4. Documents verified (Tier 3)

### 19.3 Certificate Verification System

**Public verification page:**

```typescript
// URL: assetmanagementuniversity.org/verify/[certificate_code]

async function verifyCertificate(certificateCode: string): Promise<VerificationResult> {
  
  // Look up certificate
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
    competencies_count: cert.certificate_competencies.length,
    
    // Don't expose sensitive info
    // learner_id_number: REDACTED
    // learner_contact: REDACTED
  };
}
```

**Verification UI:**

```
┌──────────────────────────────────────────────────────┐
│  Certificate Verification                            │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Certificate Code: SETA-2024-KM01-00123              │
│  [Verify]                                            │
│                                                       │
│  ✅ VALID CERTIFICATE                                │
│                                                       │
│  Learner: Sipho Ndlovu                               │
│  Course: QCTO Knowledge Module 1 - Work Management   │
│  Issue Date: 15 November 2024                        │
│  Type: Official SETA-Registered Certificate          │
│  NQF Level: 5  |  Credits: 10                       │
│                                                       │
│  Competencies Demonstrated: 4                        │
│                                                       │
│  This certificate is valid and issued by             │
│  Asset Management University, a CHIETA-registered    │
│  training provider.                                  │
│                                                       │
│  For employer verification, contact:                 │
│  verify@assetmanagementuniversity.org                │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 20. Referral Programme (Karma)

### 20.1 Programme Structure

**"Karma" = Referral rewards in Rands**

```javascript
const REFERRAL_PROGRAMME = {
  
  structure: "Two-tier pyramid (maximum 2 levels deep)",
  
  TIER_1_DIRECT_REFERRAL: {
    description: "You refer someone directly",
    commission: "10% of their certificate purchases",
    example: "Friend buys R1,800 certificate → You earn R180"
  },
  
  TIER_2_INDIRECT_REFERRAL: {
    description: "Your referral refers someone",
    commission: "10% of their certificate purchases",
    example: "Friend's friend buys R1,800 certificate → You earn R180"
  },
  
  MAX_DEPTH: 2,
  reason: "Prevent pyramid/MLM schemes. Keep it simple and ethical."
};
```

### 20.2 How It Works

**Step 1: Learner Gets Referral Code**

Every Tier 2 learner automatically gets a unique referral code:

```javascript
async function generateReferralCode(userId: string): Promise<string> {
  const user = await getUser(userId);
  
  // Generate readable code: FirstName + 4 random chars
  // Example: SIPHO-X7K9
  const code = `${user.user_name.split(' ')[0].toUpperCase()}-${generateRandomChars(4)}`;
  
  await firestore.collection('users').doc(userId).update({
    user_referral_code: code
  });
  
  return code;
}
```

**Step 2: Learner Shares Code**

```
┌────────────────────────────────────────────────────────┐
│  Your Referral Code: SIPHO-X7K9                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Share AMU with friends and earn Karma!                │
│                                                         │
│  When your referrals purchase certificates, you earn:  │
│  • 10% of direct referrals' purchases                  │
│  • 10% of indirect referrals' purchases                │
│                                                         │
│  Share your code:                                      │
│  [Copy Link] [WhatsApp] [Email] [SMS]                 │
│                                                         │
│  Your Karma Balance: R450                              │
│  • 3 active referrals                                  │
│  • R180 pending (Friend completing course)             │
│                                                         │
│  [Request Payout] (minimum R100)                       │
│                                                         │
└────────────────────────────────────────────────────────┘
```

**Step 3: New User Signs Up with Code**

```typescript
async function signupWithReferralCode(
  userData: UserData,
  referralCode?: string
): Promise<string> {
  
  // Create user account
  const userId = await createUser(userData);
  
  // If referral code provided, link
  if (referralCode) {
    const referrer = await getUserByReferralCode(referralCode);
    
    if (referrer) {
      await firestore.collection('users').doc(userId).update({
        user_referred_by: referrer.user_id
      });
      
      // Create referral record
      await createReferralRecord(referrer.user_id, userId, 1);  // Tier 1
      
      // Check if referrer was also referred (Tier 2)
      if (referrer.user_referred_by) {
        await createReferralRecord(
          referrer.user_referred_by,
          userId,
          2  // Tier 2
        );
      }
    }
  }
  
  return userId;
}
```

**Step 4: Referred User Purchases Certificate**

```javascript
async function processReferralKarma(
  purchaserId: string,
  certificatePrice: number
): Promise<void> {
  
  const purchaser = await getUser(purchaserId);
  
  if (!purchaser.user_referred_by) {
    return;  // No referrer, no karma to process
  }
  
  // Tier 1: Direct referrer earns 10%
  const tier1Karma = Math.round(certificatePrice * 0.10);
  await creditKarma(purchaser.user_referred_by, tier1Karma, {
    source: 'tier_1_referral',
    purchaser_id: purchaserId,
    certificate_price: certificatePrice
  });
  
  // Tier 2: Check if Tier 1 referrer has a referrer
  const tier1Referrer = await getUser(purchaser.user_referred_by);
  
  if (tier1Referrer.user_referred_by) {
    const tier2Karma = Math.round(certificatePrice * 0.10);
    await creditKarma(tier1Referrer.user_referred_by, tier2Karma, {
      source: 'tier_2_referral',
      purchaser_id: purchaserId,
      certificate_price: certificatePrice
    });
  }
}

async function creditKarma(
  userId: string,
  amount: number,
  metadata: any
): Promise<void> {
  
  await firestore.collection('users').doc(userId).update({
    user_karma_balance: FieldValue.increment(amount),
    user_karma_lifetime_earned: FieldValue.increment(amount)
  });
  
  // Create karma transaction record
  await firestore.collection('karma_transactions').add({
    transaction_id: generateId('karma'),
    transaction_user_id: userId,
    transaction_amount: amount,
    transaction_type: 'credit',
    transaction_source: metadata.source,
    transaction_metadata: metadata,
    transaction_date: new Date()
  });
  
  // Notify user
  await sendEmail(
    userId,
    'You Earned Karma!',
    karmaEarnedTemplate(amount, metadata)
  );
}
```

**Step 5: Request Payout**

```javascript
async function requestKarmaPayout(
  userId: string
): Promise<PayoutResult> {
  
  const user = await getUser(userId);
  
  // Minimum R100
  if (user.user_karma_balance < 100) {
    return {
      success: false,
      error: "Minimum payout is R100. Current balance: R" + user.user_karma_balance
    };
  }
  
  // Check if user has Stripe Connect account
  if (!user.user_stripe_connect_account_id) {
    // Create Stripe Connect account for user
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'ZA',
      email: user.user_email,
      capabilities: {
        transfers: { requested: true }
      }
    });
    
    await firestore.collection('users').doc(userId).update({
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
  
  // Process payout via Stripe
  const payout = await stripe.transfers.create({
    amount: Math.round(user.user_karma_balance * 100),  // Convert to cents
    currency: 'zar',
    destination: user.user_stripe_connect_account_id,
    description: `AMU Referral Karma Payout - ${user.user_name}`
  });
  
  // Deduct from balance
  await firestore.collection('users').doc(userId).update({
    user_karma_balance: 0
  });
  
  // Record payout
  await firestore.collection('karma_transactions').add({
    transaction_id: generateId('karma'),
    transaction_user_id: userId,
    transaction_amount: -user.user_karma_balance,
    transaction_type: 'payout',
    transaction_stripe_transfer_id: payout.id,
    transaction_date: new Date()
  });
  
  return {
    success: true,
    amount_paid: user.user_karma_balance,
    stripe_fee: Math.round(user.user_karma_balance * 0.02),  // ~2% Stripe fee
    message: "Payout initiated! Funds will arrive in 1-3 business days."
  };
}
```

### 20.3 Karma Dashboard

```
┌──────────────────────────────────────────────────────┐
│  Your Karma Programme                                │
├──────────────────────────────────────────────────────┤
│                                                       │
│  💰 Current Balance: R450                            │
│                                                       │
│  📊 Lifetime Stats:                                  │
│     • Total Earned: R1,280                           │
│     • Total Paid Out: R830                           │
│     • Active Referrals: 3                            │
│                                                       │
│  📈 Recent Activity:                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ +R180  Thandi completed KM-01       2 hours │   │
│  │ +R90   Mandla's referral (Tier 2)   1 day   │   │
│  │ +R180  Nomvula completed PM-ALL    3 days   │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  👥 Your Referrals:                                  │
│  ┌─────────────────────────────────────────────┐   │
│  │ Thandi M.    Tier 1   R360 earned   Active  │   │
│  │ Nomvula D.   Tier 1   R540 earned   Active  │   │
│  │ Sipho N.     Tier 1   R0 earned     Learning│   │
│  │ Mandla K.    Tier 2   R90 earned    Active  │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  🔗 Your Referral Link:                              │
│  https://amu.org/signup?ref=SIPHO-X7K9               │
│  [Copy Link] [Share WhatsApp] [Share Email]         │
│                                                       │
│  💸 Payout:                                          │
│  [Request Payout] (min R100)                         │
│                                                       │
│  ℹ️  How it works | Terms & Conditions               │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 20.4 Anti-Abuse Measures

```javascript
const ANTI_ABUSE_RULES = {
  
  // Prevent self-referral
  RULE_1: {
    check: "Cannot refer yourself",
    implementation: "Verify referrer ≠ new user (email, ID, payment method)"
  },
  
  // Prevent fake accounts
  RULE_2: {
    check: "Referred user must actually purchase certificate",
    implementation: "Karma only credited after payment clears"
  },
  
  // Prevent coordinated fraud
  RULE_3: {
    check: "Monitor for suspicious patterns",
    implementation: [
      "Flag if many referrals from same IP",
      "Flag if referrals all purchase same day",
      "Flag if payment method matches referrer"
    ]
  },
  
  // Maximum depth
  RULE_4: {
    check: "Only 2 tiers deep",
    implementation: "Code enforces max 2 levels"
  },
  
  // Require actual learning
  RULE_5: {
    check: "Learner must demonstrate competencies",
    implementation: "Can't buy certificate without completing course"
  }
};

async function detectReferralFraud(userId: string): Promise<FraudCheck> {
  
  const user = await getUser(userId);
  const referrals = await getReferrals(userId);
  
  const flags = [];
  
  // Check 1: Suspicious timing
  const recentPurchases = referrals.filter(r => 
    r.conversion_date > Date.now() - (24 * 60 * 60 * 1000)  // Last 24h
  );
  
  if (recentPurchases.length > 5) {
    flags.push({
      type: 'suspicious_timing',
      severity: 'medium',
      detail: `${recentPurchases.length} referrals purchased in 24 hours`
    });
  }
  
  // Check 2: Same payment methods
  const paymentMethods = await getPaymentMethods(referrals.map(r => r.referred_user_id));
  const duplicates = findDuplicates(paymentMethods);
  
  if (duplicates.length > 2) {
    flags.push({
      type: 'duplicate_payment_methods',
      severity: 'high',
      detail: `${duplicates.length} referrals using same payment method`
    });
  }
  
  // Check 3: IP addresses
  const ipAddresses = await getSignupIPs(referrals.map(r => r.referred_user_id));
  const sameIP = ipAddresses.filter(ip => ip === ipAddresses[0]).length;
  
  if (sameIP > 3) {
    flags.push({
      type: 'same_ip_signups',
      severity: 'high',
      detail: `${sameIP} referrals signed up from same IP`
    });
  }
  
  if (flags.some(f => f.severity === 'high')) {
    // Suspend karma pending investigation
    await suspendKarma(userId, flags);
  }
  
  return {
    fraud_likely: flags.length > 0,
    flags: flags
  };
}
```

---


# PART 5: FEATURES & SYSTEMS (Continued)

## 21. Search & Discovery

### 21.1 Global Search

**Learners can search across all content:**

```typescript
interface SearchQuery {
  query: string;
  filters?: {
    content_type?: 'courses' | 'case_studies' | 'modules' | 'assignments';
    framework?: 'gfmam' | 'qcto';
    language?: string;
    nqf_level?: number;
  };
  user_id?: string;  // For personalized results
}

async function globalSearch(searchQuery: SearchQuery): Promise<SearchResults> {
  
  // Use Firestore full-text search (with Algolia if needed for scale)
  const results = {
    courses: [],
    case_studies: [],
    discussions: [],
    help_articles: []
  };
  
  // Search courses
  const courseResults = await firestore
    .collection('courses')
    .where('course_searchable_text', 'array-contains-any', 
           tokenize(searchQuery.query))
    .get();
  
  results.courses = courseResults.docs.map(doc => ({
    type: 'course',
    ...doc.data(),
    relevance: calculateRelevance(doc.data(), searchQuery.query)
  }));
  
  // Search case studies
  const caseStudyResults = await searchCaseStudies(searchQuery.query);
  results.case_studies = caseStudyResults;
  
  // If user authenticated, personalize results
  if (searchQuery.user_id) {
    results = await personalizeResults(results, searchQuery.user_id);
  }
  
  // Sort by relevance
  return sortByRelevance(results);
}
```

### 21.2 Intelligent Course Recommendations

**"Based on what you're learning, you might like..."**

```javascript
async function generateCourseRecommendations(
  userId: string
): Promise<CourseRecommendation[]> {
  
  const user = await getUser(userId);
  const enrollments = await getUserEnrollments(userId);
  
  // Analyze what they've completed
  const completedTopics = enrollments
    .filter(e => e.enrollment_status === 'completed')
    .map(e => e.enrollment_course_topics)
    .flat();
  
  // Analyze what they're currently learning
  const currentTopics = enrollments
    .filter(e => e.enrollment_status === 'active')
    .map(e => e.enrollment_course_topics)
    .flat();
  
  // Get conversation keywords
  const conversationKeywords = await extractKeywordsFromConversations(userId);
  
  // Use Claude to analyze and recommend
  const recommendations = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Recommend 5 courses for this learner.

LEARNER PROFILE:
- Name: ${user.user_name}
- Workplace: ${user.user_workplace_context}
- Language: ${user.user_language}

COMPLETED COURSES:
${enrollments.filter(e => e.enrollment_status === 'completed')
   .map(e => `- ${e.enrollment_course_title}`)
   .join('\n')}

CURRENT LEARNING:
${enrollments.filter(e => e.enrollment_status === 'active')
   .map(e => `- ${e.enrollment_course_title} (${e.enrollment_progress_percentage}% complete)`)
   .join('\n')}

CONVERSATION INTERESTS:
${conversationKeywords.join(', ')}

AVAILABLE COURSES:
${await getAvailableCourses()}

Recommend 5 courses that:
1. Build on what they've learned
2. Fill knowledge gaps
3. Align with their workplace context
4. Match their interest areas
5. Are appropriate for their level

RESPOND WITH JSON:
{
  "recommendations": [
    {
      "course_id": "gfmam-3014",
      "course_title": "Asset Management Strategy",
      "reason": "Natural next step after completing Organisational Context",
      "relevance_score": 0.95,
      "estimated_time": "8 hours"
    }
  ]
}`
      }
    ]
  });
  
  return JSON.parse(recommendations.content[0].text).recommendations;
}
```

### 21.3 Browse by Framework

```typescript
interface BrowseView {
  framework: 'gfmam' | 'qcto';
  group?: string;
  level?: 'foundation' | 'intermediate' | 'advanced';
  view: 'grid' | 'list' | 'pathway';
}

// Example: GFMAM Pathway View
const GFMAM_PATHWAY = {
  foundation: [
    { id: '3011', title: 'Organisational Context', status: 'completed' },
    { id: '3012', title: 'Asset Information', status: 'in_progress' },
    { id: '3013', title: 'Asset Management Policy', status: 'locked' },
    { id: '3031', title: 'Technical Standards', status: 'locked' }
  ],
  intermediate: [
    { id: '3014', title: 'Asset Management Strategy', status: 'locked' },
    // ... more courses, all locked until foundation complete
  ],
  advanced: [
    // All locked until intermediate complete
  ]
};
```

---

## 22. Progress Tracking

### 22.1 Learner Dashboard

**Personal learning dashboard shows:**

```typescript
interface LearnerDashboard {
  user: UserProfile;
  
  overview: {
    courses_in_progress: number;
    courses_completed: number;
    certificates_earned: number;
    total_hours_learning: number;
    current_streak_days: number;
  };
  
  active_courses: EnrollmentCard[];
  
  recent_achievements: Achievement[];
  
  upcoming_milestones: Milestone[];
  
  recommendations: CourseRecommendation[];
  
  karma_summary?: {
    balance: number;
    active_referrals: number;
    pending_earnings: number;
  };
}

interface EnrollmentCard {
  enrollment_id: string;
  course_title: string;
  course_image: string;
  progress_percentage: number;
  competencies_completed: number;
  competencies_total: number;
  last_activity: Date;
  next_step: string;
  estimated_time_remaining: string;
}
```

**Example Dashboard UI:**

```
╔════════════════════════════════════════════════════════╗
║  Welcome back, Sipho! 👋                               ║
╚════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────┐
│  Your Learning Journey                                 │
├────────────────────────────────────────────────────────┤
│                                                         │
│  📚 3 courses in progress                              │
│  ✅ 2 courses completed                                │
│  🎓 2 certificates earned                              │
│  ⏱️  24 hours learning time                            │
│  🔥 7-day streak!                                      │
│                                                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Continue Learning                                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│  📘 GFMAM 3012: Asset Information                      │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 65%                            │
│  ✅ 3 of 4 competencies completed                      │
│  Last activity: 2 hours ago                            │
│  Next: Competency 4 - Information Systems              │
│  [Continue] [View Details]                             │
│                                                         │
│  📗 QCTO KM-02: Job Planning                           │
│  ▓▓▓░░░░░░░░░░░░░░░░░ 20%                            │
│  ✅ 1 of 5 competencies completed                      │
│  Last activity: Yesterday                              │
│  Next: Competency 2 - Resource Estimation              │
│  [Continue] [View Details]                             │
│                                                         │
│  📙 GFMAM 3035: Maintenance Delivery                   │
│  ▓░░░░░░░░░░░░░░░░░░░ 5%                             │
│  Started: 3 days ago                                   │
│  Next: Introduce yourself to the case study            │
│  [Continue] [View Details]                             │
│                                                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Recent Achievements 🏆                                │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Completed GFMAM 3011: Organisational Context       │
│     2 days ago                                         │
│                                                         │
│  🎓 Earned unofficial certificate                      │
│     GFMAM 3011 - Organisational Context                │
│     2 days ago                                         │
│                                                         │
│  🔥 Achieved 7-day learning streak!                    │
│     Today                                              │
│                                                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Recommended for You                                   │
├────────────────────────────────────────────────────────┤
│                                                         │
│  📘 GFMAM 3014: Asset Management Strategy              │
│  "Great next step after Organisational Context"        │
│  Foundation → Intermediate | 8 hours                   │
│  [Start Learning]                                      │
│                                                         │
│  📗 GFMAM 3021: Capital Investment Decision-Making     │
│  "Builds on your workplace context in transport"       │
│  Intermediate | 10 hours                               │
│  [Start Learning]                                      │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### 22.2 Progress Persistence & Recovery

**Never lose progress:**

```javascript
// Auto-save every 30 seconds
setInterval(async () => {
  await saveConversationState(currentConversationId);
}, 30000);

async function saveConversationState(conversationId: string): Promise<void> {
  const conversation = getCurrentConversation();
  
  await firestore.collection('conversations').doc(conversationId).update({
    conversation_last_activity: new Date(),
    conversation_messages_count: conversation.messages.length,
    conversation_current_competency: conversation.currentCompetency,
    conversation_state_snapshot: conversation.state
  });
}

// On reconnect/reload, resume exactly where left off
async function resumeConversation(conversationId: string): Promise<void> {
  const conversation = await getConversation(conversationId);
  
  // Restore full state
  loadMessages(conversation.messages);
  setCurrentCompetency(conversation.conversation_current_competency);
  restoreState(conversation.conversation_state_snapshot);
  
  // Send welcoming message
  await sendMessage(conversationId, {
    role: 'assistant',
    content: `Welcome back, ${conversation.conversation_learner_name}! 

We were discussing ${conversation.conversation_current_competency.title}. 
Let's continue from where we left off.`
  });
}
```

### 22.3 Completion Criteria

**Module completion requires:**

```javascript
async function checkModuleCompletion(enrollmentId: string): Promise<boolean> {
  
  const enrollment = await getEnrollment(enrollmentId);
  const course = await getCourse(enrollment.enrollment_course_id);
  
  // Check all competencies
  const competencyStatuses = await Promise.all(
    course.course_competencies.map(comp => 
      getCompetencyStatus(enrollmentId, comp.competency_id)
    )
  );
  
  // ALL must be "competent"
  const allCompetent = competencyStatuses.every(
    status => status === 'competent'
  );
  
  if (allCompetent) {
    await markModuleComplete(enrollmentId);
    return true;
  }
  
  return false;
}

async function markModuleComplete(enrollmentId: string): Promise<void> {
  
  await firestore.collection('enrollments').doc(enrollmentId).update({
    enrollment_status: 'completed',
    enrollment_completion_date: new Date(),
    enrollment_progress_percentage: 100
  });
  
  // Generate unofficial certificate automatically
  await generateUnofficialCertificate(enrollmentId);
  
  // Notify learner
  await sendCongratulationsEmail(enrollmentId);
  
  // Check if part of qualification
  await checkQualificationProgress(enrollmentId);
}
```

---

## 23. Notification System

### 23.1 Notification Channels

```javascript
const NOTIFICATION_CHANNELS = {
  
  EMAIL: {
    use_for: [
      'Account creation',
      'Password reset',
      'Certificate ready',
      'SETA registration approved',
      'Payment confirmation',
      'Karma earned',
      'Weekly progress summary'
    ],
    delivery: 'Immediate or scheduled'
  },
  
  IN_APP: {
    use_for: [
      'New message from facilitator',
      'Assignment graded',
      'Competency achieved',
      'Course recommendation',
      'Achievement unlocked',
      'Referral signup'
    ],
    delivery: 'Real-time'
  },
  
  SMS: {
    use_for: [
      'Critical: SETA registration issues',
      'Critical: Payment failed',
      'Optional: Daily learning reminder'
    ],
    delivery: 'Immediate',
    cost: 'R0.35 per SMS',
    note: 'Use sparingly - costs add up'
  },
  
  PUSH: {
    use_for: [
      'Learning streak reminder',
      'Course completion celebration',
      'New recommended course'
    ],
    delivery: 'Real-time',
    note: 'Future feature - mobile app'
  }
};
```

### 23.2 Notification Preferences

**Learners control what they receive:**

```typescript
interface NotificationPreferences {
  user_id: string;
  
  email_notifications: {
    enabled: boolean;
    frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
    types: {
      course_updates: boolean;
      certificates: boolean;
      karma: boolean;
      marketing: boolean;
      system: boolean;  // Always true, can't disable
    };
  };
  
  sms_notifications: {
    enabled: boolean;
    phone_number?: string;
    types: {
      critical_only: boolean;
      learning_reminders: boolean;
    };
  };
  
  in_app_notifications: {
    enabled: boolean;  // Always true
    show_badge: boolean;
  };
  
  quiet_hours?: {
    enabled: boolean;
    start_time: string;  // "22:00"
    end_time: string;    // "07:00"
    timezone: string;
  };
}
```

### 23.3 Email Templates

**Transactional Emails:**

```markdown
<!-- emails/transactional/welcome-tier2.md -->

Subject: Welcome to Asset Management University! 🎓

Hi {learner_name},

Welcome to Asset Management University! You can now access all our courses 
and start developing your asset management capability.

🌟 What You Can Do Now:
• Access all courses completely free
• Learn in your preferred language ({language})
• Apply concepts to your workplace ({workplace_context})
• Earn unofficial certificates at no cost

💡 Getting Started:
1. Browse our course catalog: {catalog_link}
2. Start with GFMAM 3011: Organisational Context (great foundation)
3. Chat with Claude - your AI facilitator
4. Complete competencies at your own pace

📚 Recommended First Course:
{recommended_course_title}
{recommended_course_reason}
[Start Learning →]

🎓 About Official Certificates:
You can learn everything for free. Official SETA-registered certificates 
are available for purchase (R500-R3,300) when you're ready.

💬 Need Help?
Reply to this email or visit our help center: {help_center_link}

Here's to your learning journey!

The AMU Team
assetmanagementuniversity.org

---

P.S. Share AMU with friends and earn Karma! Your referral code: {referral_code}
```

**Achievement Emails:**

```markdown
<!-- emails/educational/module-completed.md -->

Subject: 🎉 You completed {course_title}!

Congratulations, {learner_name}!

You've just completed {course_title} and demonstrated all required 
competencies. This is a significant achievement!

✅ Competencies You Mastered:
{competency_list}

📊 Your Journey:
• Started: {start_date}
• Completed: {completion_date}
• Time invested: {hours_spent} hours
• Messages exchanged: {message_count}

🎓 Your Unofficial Certificate:
[Download Certificate (PDF)] - Free, watermarked for personal use

💎 Want an Official Certificate?
Official SETA-registered certificate available for R{certificate_price}
[Purchase Official Certificate →]

📚 What's Next?
Based on what you've learned, we recommend:
• {next_course_1}
• {next_course_2}

[Browse All Courses]

Keep going—you're building valuable capability!

The AMU Team

---

Share your achievement: [LinkedIn] [Twitter] [WhatsApp]
```

### 23.4 Smart Notification Logic

**Don't spam learners:**

```javascript
async function shouldSendNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  
  const prefs = await getNotificationPreferences(userId);
  
  // Check if notification type enabled
  if (!prefs.email_notifications.types[notificationType]) {
    return false;
  }
  
  // Check quiet hours
  if (prefs.quiet_hours?.enabled) {
    const now = new Date();
    const inQuietHours = isInQuietHours(now, prefs.quiet_hours);
    
    if (inQuietHours && notificationType !== 'critical') {
      // Queue for after quiet hours
      await queueNotification(userId, notificationType);
      return false;
    }
  }
  
  // Check frequency limits (prevent spam)
  const recentNotifications = await getRecentNotifications(userId, '24h');
  
  if (recentNotifications.length > 5 && notificationType !== 'critical') {
    // Too many notifications today
    console.log(`Skipping notification for ${userId}: Daily limit reached`);
    return false;
  }
  
  return true;
}

async function sendNotification(
  userId: string,
  type: string,
  content: NotificationContent
): Promise<void> {
  
  if (!await shouldSendNotification(userId, type)) {
    return;
  }
  
  const prefs = await getNotificationPreferences(userId);
  
  // Send via appropriate channel(s)
  if (prefs.email_notifications.enabled) {
    await sendEmail(userId, content.subject, content.email_body);
  }
  
  // Always create in-app notification
  await createInAppNotification(userId, content);
  
  // SMS only for critical
  if (type === 'critical' && prefs.sms_notifications.enabled) {
    await sendSMS(prefs.sms_notifications.phone_number, content.sms_body);
  }
  
  // Log notification
  await firestore.collection('notifications_sent').add({
    notification_user_id: userId,
    notification_type: type,
    notification_channel: 'email',
    notification_sent_date: new Date()
  });
}
```

---

## 24. Analytics & Insights

### 24.1 Platform Analytics

**Muhammad Ali's admin dashboard:**

```typescript
interface PlatformAnalytics {
  
  USER_METRICS: {
    total_users: number;
    tier_1_anonymous: number;
    tier_2_basic: number;
    tier_3_seta_registered: number;
    
    new_users_today: number;
    new_users_this_week: number;
    new_users_this_month: number;
    
    active_users_today: number;
    active_users_this_week: number;
    active_users_this_month: number;
    
    user_growth_rate: number;  // % month-over-month
  };
  
  LEARNING_METRICS: {
    total_enrollments: number;
    active_enrollments: number;
    completed_enrollments: number;
    
    completion_rate: number;  // %
    average_time_to_completion: number;  // hours
    
    courses_by_popularity: CoursePopularity[];
    competencies_by_difficulty: CompetencyDifficulty[];
    
    total_conversations: number;
    total_messages: number;
    average_messages_per_competency: number;
  };
  
  REVENUE_METRICS: {
    total_revenue: number;
    revenue_this_month: number;
    
    certificates_sold: number;
    certificates_sold_this_month: number;
    
    average_certificate_price: number;
    
    revenue_by_course: RevenueBreakdown[];
    
    karma_paid_out: number;
    karma_pending: number;
  };
  
  AI_METRICS: {
    total_tokens_used: number;
    total_tokens_used_this_month: number;
    
    tokens_by_function: {
      facilitation: number;
      grading: number;
      testing: number;
      content_analysis: number;
    };
    
    total_cost: number;
    cost_per_learner: number;
    cost_per_certificate: number;
    
    average_response_time: number;  // ms
  };
  
  QUALITY_METRICS: {
    average_satisfaction_score: number;  // 1-5
    nps_score: number;  // Net Promoter Score
    
    plagiarism_detection_rate: number;
    split_test_improvements: number;
    
    ai_test_pass_rate: number;
    content_quality_score: number;
  };
}
```

### 24.2 Real-Time Monitoring

```javascript
// Real-time dashboard updates
export const generateDashboardMetrics = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    
    const metrics = {
      timestamp: new Date(),
      
      // Quick counts
      active_conversations: await countActiveConversations(),
      users_online: await countOnlineUsers(),
      certificates_issued_today: await countCertificatesToday(),
      
      // AI usage
      tokens_used_last_hour: await getTokensLastHour(),
      cost_last_hour: await getCostLastHour(),
      
      // System health
      average_response_time: await getAverageResponseTime(),
      error_rate: await getErrorRate(),
      
      // Attention queue
      learners_needing_attention: await countLearnersNeedingAttention()
    };
    
    // Store in Firestore for dashboard
    await firestore.collection('dashboard_metrics').add(metrics);
    
    // Alert if issues
    if (metrics.error_rate > 0.05) {  // > 5% errors
      await alertAdmin('High error rate detected', metrics);
    }
    
    if (metrics.learners_needing_attention > 10) {
      await alertAdmin('10+ learners need attention', metrics);
    }
  });
```

### 24.3 Learner Analytics (Individual)

**What Muhammad Ali sees about a specific learner:**

```typescript
interface LearnerAnalytics {
  user_profile: UserProfile;
  
  learning_patterns: {
    preferred_time_of_day: string;
    average_session_duration: number;
    messages_per_session: number;
    days_active_per_week: number;
    learning_streak_current: number;
    learning_streak_longest: number;
  };
  
  progress_summary: {
    enrollments_total: number;
    enrollments_active: number;
    enrollments_completed: number;
    completion_rate: number;
    
    competencies_achieved: number;
    competencies_developing: number;
    competencies_not_yet: number;
    
    average_time_per_competency: number;
  };
  
  engagement_signals: {
    last_active: Date;
    risk_of_dropout: 'low' | 'medium' | 'high';
    needs_encouragement: boolean;
    struggling_with: string[];
  };
  
  conversation_insights: {
    common_questions: string[];
    topics_of_interest: string[];
    preferred_language: string;
    communication_style: string;
  };
  
  financial: {
    certificates_purchased: number;
    total_spent: number;
    karma_earned: number;
    active_referrals: number;
  };
}
```

### 24.4 Course Analytics

**Performance metrics per course:**

```typescript
interface CourseAnalytics {
  course_id: string;
  course_title: string;
  
  enrollment_stats: {
    total_enrollments: number;
    active_enrollments: number;
    completed_enrollments: number;
    dropped_enrollments: number;
    
    completion_rate: number;
    average_time_to_completion: number;
    
    enrollment_trend: TrendData;  // Growing/declining/stable
  };
  
  competency_performance: {
    competency_id: string;
    competency_title: string;
    
    competent_rate: number;
    developing_rate: number;
    not_yet_rate: number;
    
    average_messages_to_achieve: number;
    common_struggle_points: string[];
  }[];
  
  learner_feedback: {
    satisfaction_average: number;  // 1-5
    would_recommend: number;  // %
    
    positive_comments: string[];
    improvement_suggestions: string[];
  };
  
  ai_test_results: {
    overall_score: number;
    personas_tested: number;
    issues_found: number;
    last_tested: Date;
  };
  
  revenue: {
    certificates_sold: number;
    total_revenue: number;
    average_price: number;
  };
  
  recommendations: string[];  // AI-generated improvement suggestions
}
```

### 24.5 Reporting

**Automated reports:**

```javascript
// Weekly Summary Email to Muhammad Ali
export const sendWeeklySummary = functions.pubsub
  .schedule('every monday 09:00')
  .timeZone('Africa/Johannesburg')
  .onRun(async (context) => {
    
    const weekStart = getLastMonday();
    const weekEnd = new Date();
    
    const report = await generateWeeklyReport(weekStart, weekEnd);
    
    await sendEmail(
      'muhammad@assetmanagementuniversity.org',
      `AMU Weekly Summary - ${formatDate(weekEnd)}`,
      weeklyReportTemplate(report)
    );
  });

async function generateWeeklyReport(
  startDate: Date,
  endDate: Date
): Promise<WeeklyReport> {
  
  return {
    period: { start: startDate, end: endDate },
    
    highlights: {
      new_users: await countNewUsers(startDate, endDate),
      certificates_issued: await countCertificates(startDate, endDate),
      revenue_earned: await sumRevenue(startDate, endDate),
      courses_completed: await countCompletions(startDate, endDate)
    },
    
    growth: {
      user_growth: await calculateGrowth('users', startDate, endDate),
      revenue_growth: await calculateGrowth('revenue', startDate, endDate),
      engagement_growth: await calculateGrowth('engagement', startDate, endDate)
    },
    
    top_courses: await getTopCourses(startDate, endDate, 5),
    
    quality_metrics: {
      average_satisfaction: await getAverageSatisfaction(startDate, endDate),
      completion_rate: await getCompletionRate(startDate, endDate),
      ai_test_pass_rate: await getAITestPassRate(startDate, endDate)
    },
    
    needs_attention: {
      learners_stuck: await getStuckLearners(),
      courses_with_issues: await getCoursesWithIssues(),
      system_alerts: await getSystemAlerts(startDate, endDate)
    },
    
    cost_analysis: {
      ai_tokens_used: await sumTokens(startDate, endDate),
      total_cost: await sumCosts(startDate, endDate),
      cost_per_learner: await calculateCostPerLearner(startDate, endDate),
      cost_per_certificate: await calculateCostPerCertificate(startDate, endDate)
    }
  };
}
```

---

## 25. Help & Support System

### 25.1 Help Center Structure

```
Help Center (amu.org/help)
│
├── Getting Started
│   ├── How AMU Works
│   ├── Creating an Account
│   ├── Starting Your First Course
│   ├── Understanding Competencies
│   └── Using AI Facilitation
│
├── Learning
│   ├── How to Learn Effectively
│   ├── Problem-Based Discovery Explained
│   ├── Conversation Tips
│   ├── Assignment Guidelines
│   └── Progress Tracking
│
├── Certificates
│   ├── Unofficial vs Official Certificates
│   ├── SETA Registration Process
│   ├── Certificate Pricing
│   ├── Verification
│   └── Employer Recognition
│
├── Technical Support
│   ├── Browser Requirements
│   ├── Mobile Access
│   ├── Connectivity Issues
│   ├── Account Recovery
│   └── Troubleshooting
│
├── Payment & Billing
│   ├── Payment Methods
│   ├── Pricing Explained
│   ├── Refund Policy
│   └── Invoice Requests
│
├── Referral Programme
│   ├── How Karma Works
│   ├── Earning Rewards
│   ├── Payout Process
│   └── Terms & Conditions
│
└── Policies
    ├── Privacy Policy
    ├── Terms of Service
    ├── POPI Compliance
    └── Code of Conduct
```

### 25.2 In-Context Help

**Help appears where needed:**

```typescript
// Tooltips throughout platform
const CONTEXTUAL_HELP = {
  
  competency_status: {
    trigger: "Hover over competency badge",
    content: `
      ✅ Competent: You've demonstrated this capability clearly
      🔄 Developing: You're making progress, keep refining
      ❌ Not Yet: More work needed to demonstrate capability
      
      No numeric grades at AMU—just clear evidence of what you CAN do.
    `
  },
  
  unofficial_certificate: {
    trigger: "Hover over 'Unofficial Certificate'",
    content: `
      FREE certificate for personal use. Watermarked to show it's 
      unofficial. Great for portfolios and personal records.
      
      For formal recognition, purchase Official Certificate (R500-R3,300).
    `
  },
  
  karma_balance: {
    trigger: "Hover over Karma balance",
    content: `
      Karma = referral earnings in Rands.
      
      You earn 10% when your referrals purchase certificates.
      Minimum payout: R100
      
      [Learn More About Karma]
    `
  }
};
```

### 25.3 AI-Powered Support Chatbot

**Before human escalation, AI tries to help:**

```javascript
async function handleSupportQuery(
  userId: string,
  query: string
): Promise<SupportResponse> {
  
  // Search help center first
  const helpArticles = await searchHelpCenter(query);
  
  if (helpArticles.length > 0) {
    return {
      type: 'help_articles',
      articles: helpArticles,
      message: "I found these help articles that might answer your question:"
    };
  }
  
  // Use Claude to answer
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: `You are AMU's support assistant. Help learners with questions 
      about the platform, learning process, certificates, and technical issues.
      
      Be warm, helpful, and concise. If you don't know something, say so and 
      offer to connect them with human support.
      
      CRITICAL: Never make up information about pricing, policies, or technical 
      capabilities.`,
    messages: [
      {
        role: 'user',
        content: query
      }
    ]
  });
  
  const answer = response.content[0].text;
  
  // Check if answer is confident
  const confidence = await assessAnswerConfidence(answer);
  
  if (confidence < 0.7) {
    return {
      type: 'escalate_to_human',
      message: answer,
      escalation_reason: 'Low confidence in AI answer'
    };
  }
  
  return {
    type: 'ai_answer',
    message: answer,
    helpful_links: await findRelevantLinks(query)
  };
}
```

### 25.4 Human Support Escalation

**When human help is needed:**

```javascript
const ESCALATION_TRIGGERS = {
  
  AUTOMATIC: [
    'Payment failed 3 times',
    'Account locked',
    'SETA registration rejected',
    'Plagiarism detected',
    'Learner reports harassment'
  ],
  
  USER_INITIATED: [
    'AI answer unhelpful (user clicked "Not Helpful")',
    'User clicks "Talk to Human"',
    'Angry sentiment detected',
    'Query about refund'
  ],
  
  TIME_BASED: [
    'Support query unanswered for 2 hours (business hours)',
    'Support query unanswered for 24 hours (after hours)'
  ]
};

async function escalateToHumanSupport(
  userId: string,
  query: string,
  reason: string
): Promise<SupportTicket> {
  
  const ticket = await firestore.collection('support_tickets').add({
    ticket_id: generateId('ticket'),
    ticket_user_id: userId,
    ticket_query: query,
    ticket_reason: reason,
    ticket_status: 'open',
    ticket_priority: determinePriority(reason),
    ticket_created_date: new Date(),
    ticket_assigned_to: null
  });
  
  // Notify support team
  await notifySupport(ticket);
  
  // Notify user
  await sendEmail(
    userId,
    'Support Request Received',
    `We've received your support request and will respond within 
     ${getResponseTime(ticket.priority)}.
     
     Ticket #${ticket.ticket_id}`
  );
  
  return ticket;
}
```

---


# PART 6: SECURITY, OPERATIONS & DEPLOYMENT

## 26. Security & Privacy

### 26.1 Security Philosophy

**Core Principle:** Respect learner privacy whilst maintaining system integrity.

```javascript
const SECURITY_PRINCIPLES = {
  
  DATA_MINIMIZATION: {
    principle: "Collect only what's necessary",
    implementation: [
      "Tier 1: Name and email only",
      "Tier 2: Add language and workplace context (educational value)",
      "Tier 3: Add ID, address, proof (SETA regulatory requirement only)",
      "Never collect: race, religion, political affiliation, health, biometrics"
    ]
  },
  
  TRANSPARENCY: {
    principle: "Learners know what data we have and why",
    implementation: [
      "Clear data collection notices",
      "Privacy dashboard showing all data",
      "Export capability (POPI right)",
      "Deletion capability (right to be forgotten)"
    ]
  },
  
  PURPOSE_LIMITATION: {
    principle: "Use data only for stated educational purposes",
    implementation: [
      "NO selling of data",
      "NO marketing beyond educational content",
      "NO sharing with third parties (except SETA for certification)",
      "Analytics aggregated and anonymized"
    ]
  },
  
  SECURITY_BY_DESIGN: {
    principle: "Security embedded, not added later",
    implementation: [
      "Encryption at rest and in transit",
      "Least-privilege access control",
      "Regular security audits",
      "Incident response procedures"
    ]
  }
};
```

### 26.2 Authentication & Authorization

**Firebase Authentication + Custom Security Rules:**

```javascript
// Firestore Security Rules
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
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid))
               .data.user_role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);
      
      // Users can update their own profile (limited fields)
      allow update: if isOwner(userId) && 
                       onlyUpdatingAllowedFields();
      
      // Only system can create users
      allow create: if false;
      
      // Admins can read all users
      allow read: if isAdmin();
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      // Users can only access their own conversations
      allow read, write: if isAuthenticated() && 
                            resource.data.conversation_user_id == request.auth.uid;
    }
    
    // Enrollments collection
    match /enrollments/{enrollmentId} {
      // Users can only access their own enrollments
      allow read: if isAuthenticated() && 
                     resource.data.enrollment_user_id == request.auth.uid;
      
      // System creates enrollments via Cloud Functions
      allow create, update: if false;
    }
    
    // Certificates collection
    match /certificates/{certificateId} {
      // Users can read their own certificates
      allow read: if isAuthenticated() && 
                     resource.data.certificate_user_id == request.auth.uid;
      
      // Public verification (specific certificate code only)
      allow read: if request.query.certificate_code == resource.data.certificate_code;
    }
    
    // Courses (public read)
    match /courses/{courseId} {
      allow read: if true;  // Anyone can browse courses
      allow write: if isAdmin();
    }
    
    // SETA registrations (strict access)
    match /seta_registrations/{registrationId} {
      allow read, write: if isOwner(resource.data.registration_user_id);
    }
    
    // Admin-only collections
    match /ai_test_runs/{testRunId} {
      allow read, write: if isAdmin();
    }
    
    match /content_improvements/{improvementId} {
      allow read, write: if isAdmin();
    }
  }
}
```

### 26.3 Data Encryption

**Encryption Strategy:**

```javascript
const ENCRYPTION_STRATEGY = {
  
  IN_TRANSIT: {
    method: "TLS 1.3",
    implementation: "All API calls over HTTPS",
    certificate: "Let's Encrypt",
    grade: "A+ (SSL Labs)"
  },
  
  AT_REST: {
    firestore: "Automatic encryption (Google-managed keys)",
    cloud_storage: "Automatic encryption (Google-managed keys)",
    
    sensitive_fields: {
      method: "Application-level encryption (AES-256)",
      fields: [
        "user_id_number",
        "user_phone_number",
        "seta_registration_documents"
      ],
      key_management: "Google Cloud KMS"
    }
  },
  
  IN_MEMORY: {
    method: "Secure memory handling",
    implementation: [
      "Clear sensitive data after use",
      "No logging of PII",
      "Secure variable handling"
    ]
  }
};

// Example: Encrypt sensitive field
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

async function decryptSensitiveField(ciphertext: string): Promise<string> {
  const kms = new KeyManagementServiceClient();
  const keyName = kms.cryptoKeyPath(
    'amu-production',
    'global',
    'amu-keyring',
    'sensitive-data-key'
  );
  
  const [decryptResponse] = await kms.decrypt({
    name: keyName,
    ciphertext: Buffer.from(ciphertext, 'base64')
  });
  
  return decryptResponse.plaintext.toString();
}
```

### 26.4 POPI Act Compliance (South African Privacy Law)

**Protection of Personal Information Act (POPIA) Requirements:**

```javascript
const POPI_COMPLIANCE = {
  
  CONDITION_1_ACCOUNTABILITY: {
    requirement: "Organisation responsible for compliance",
    implementation: [
      "Muhammad Ali designated as Information Officer",
      "Privacy policy published",
      "Compliance procedures documented",
      "Training for anyone handling data"
    ]
  },
  
  CONDITION_2_PROCESSING_LIMITATION: {
    requirement: "Process lawfully, with consent, for specific purpose",
    implementation: [
      "Clear consent checkboxes on signup",
      "Separate consent for marketing",
      "Purpose specified in privacy policy",
      "No processing beyond stated purpose"
    ]
  },
  
  CONDITION_3_PURPOSE_SPECIFICATION: {
    requirement: "Collect for specific, lawful purpose",
    implementation: {
      tier_1: "Learning only",
      tier_2: "Learning + progress tracking",
      tier_3: "Learning + SETA certification",
      marketing: "Separate consent required"
    }
  },
  
  CONDITION_4_FURTHER_PROCESSING: {
    requirement: "Compatible with original purpose",
    implementation: [
      "No selling of data",
      "Analytics anonymized",
      "Improvements to educational experience only"
    ]
  },
  
  CONDITION_5_INFORMATION_QUALITY: {
    requirement: "Data must be accurate and up to date",
    implementation: [
      "Users can update profile anytime",
      "Regular prompts to verify information",
      "Correction mechanism for errors"
    ]
  },
  
  CONDITION_6_OPENNESS: {
    requirement: "Transparent about data processing",
    implementation: [
      "Privacy policy in clear language",
      "Privacy dashboard showing all data",
      "Notice when data practices change"
    ]
  },
  
  CONDITION_7_SECURITY_SAFEGUARDS: {
    requirement: "Secure data against loss, damage, unauthorized access",
    implementation: [
      "Encryption at rest and in transit",
      "Access controls",
      "Regular security audits",
      "Incident response plan"
    ]
  },
  
  CONDITION_8_DATA_SUBJECT_PARTICIPATION: {
    requirement: "Rights to access, correct, delete",
    implementation: {
      access: "Privacy dashboard + export capability",
      correction: "Profile editing",
      deletion: "Account deletion (with SETA caveats)",
      objection: "Opt-out of marketing"
    }
  }
};
```

**Privacy Dashboard:**

```typescript
interface PrivacyDashboard {
  user_id: string;
  
  data_collected: {
    personal_info: {
      name: string;
      email: string;
      phone?: string;
      id_number?: string;  // Encrypted, Tier 3 only
      address?: string;    // Tier 3 only
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
    
    financial_data: {
      payments: PaymentRecord[];
      karma_balance: number;
    };
  };
  
  data_processing: {
    purposes: string[];
    third_parties: string[];  // e.g., "CHIETA (for SETA certification)"
    retention_period: string;
  };
  
  your_rights: {
    export_data: () => Promise<void>;
    correct_data: () => Promise<void>;
    delete_account: () => Promise<void>;
    opt_out_marketing: () => Promise<void>;
  };
  
  consent_history: ConsentRecord[];
}

// Export all user data (POPI right)
async function exportUserData(userId: string): Promise<Buffer> {
  
  const user = await getUser(userId);
  const enrollments = await getUserEnrollments(userId);
  const conversations = await getUserConversations(userId);
  const certificates = await getUserCertificates(userId);
  const payments = await getUserPayments(userId);
  
  const exportData = {
    exported_date: new Date().toISOString(),
    user_profile: user,
    enrollments: enrollments,
    conversations: conversations.map(c => ({
      ...c,
      // Redact AI system prompts (not user data)
      messages: c.messages.filter(m => m.role === 'user')
    })),
    certificates: certificates,
    payments: payments
  };
  
  // Create JSON file
  const json = JSON.stringify(exportData, null, 2);
  
  // Send download link
  await sendEmail(
    userId,
    'Your Data Export',
    `Your AMU data export is ready. This link expires in 24 hours.
     [Download Data (JSON)]`
  );
  
  return Buffer.from(json);
}

// Delete account (POPI right to be forgotten)
async function deleteUserAccount(userId: string): Promise<void> {
  
  const user = await getUser(userId);
  
  // Check for SETA registrations
  const setaRegistrations = await getSETARegistrations(userId);
  
  if (setaRegistrations.some(r => r.registration_status === 'active')) {
    throw new Error(
      'Cannot delete account with active SETA registrations. ' +
      'CHIETA requires 7 years retention for compliance. ' +
      'You may anonymize your account instead.'
    );
  }
  
  // Anonymize instead of delete (preserve data integrity)
  await firestore.collection('users').doc(userId).update({
    user_name: 'Anonymous User',
    user_email: `deleted_${userId}@anonymized.amu`,
    user_phone_number: null,
    user_id_number: null,
    user_address: null,
    user_account_status: 'deleted',
    user_deleted_date: new Date()
  });
  
  // Delete auth account
  await admin.auth().deleteUser(userId);
  
  console.log(`✅ Account ${userId} anonymized and auth deleted`);
}
```

### 26.5 Incident Response

**Security Incident Procedures:**

```javascript
const INCIDENT_RESPONSE_PLAN = {
  
  DETECTION: {
    automated: [
      "Failed login attempts > 5",
      "Unusual data access patterns",
      "Error rate spike",
      "Anomalous API usage"
    ],
    manual: [
      "User report of unauthorized access",
      "Vulnerability disclosure",
      "Security audit finding"
    ]
  },
  
  CLASSIFICATION: {
    P0_CRITICAL: {
      examples: [
        "Data breach (PII exposed)",
        "System compromise",
        "Ransomware attack"
      ],
      response_time: "Immediate",
      notification: "All stakeholders + POPI regulator within 72h"
    },
    
    P1_HIGH: {
      examples: [
        "Attempted unauthorized access",
        "DDoS attack",
        "Payment fraud"
      ],
      response_time: "Within 1 hour",
      notification: "Management + affected users"
    },
    
    P2_MEDIUM: {
      examples: [
        "Suspicious login patterns",
        "Potential vulnerability",
        "Minor data exposure"
      ],
      response_time: "Within 4 hours",
      notification: "Management"
    }
  },
  
  RESPONSE_STEPS: [
    "1. CONTAIN: Isolate affected systems",
    "2. ASSESS: Determine scope and impact",
    "3. ERADICATE: Remove threat",
    "4. RECOVER: Restore normal operations",
    "5. NOTIFY: Inform affected parties",
    "6. LEARN: Post-incident review and improvements"
  ]
};

async function handleSecurityIncident(
  incident: SecurityIncident
): Promise<void> {
  
  // 1. Log incident
  await firestore.collection('security_incidents').add({
    incident_id: generateId('incident'),
    incident_type: incident.type,
    incident_severity: incident.severity,
    incident_description: incident.description,
    incident_detected_date: new Date(),
    incident_status: 'investigating'
  });
  
  // 2. Immediate containment
  if (incident.severity === 'P0_CRITICAL') {
    // Extreme: shut down affected services
    await disableAffectedServices(incident.affected_services);
  }
  
  // 3. Notify stakeholders
  await notifySecurityTeam(incident);
  
  if (incident.severity === 'P0_CRITICAL') {
    await notifyManagement(incident);
    
    if (incident.data_breach) {
      // POPI requires notification within 72 hours
      await notifyPOPIRegulator(incident);
      await notifyAffectedUsers(incident);
    }
  }
  
  // 4. Document everything
  await logIncidentTimeline(incident);
}
```

---

## 27. Infrastructure & Deployment

### 27.1 Google Cloud Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Cloud Run)                                   │
│  ├── Next.js Application                                │
│  ├── Server-Side Rendering                              │
│  └── Static Assets (Cloud CDN)                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (Cloud Functions)                              │
│  ├── Conversation Management                            │
│  ├── Claude API Integration                             │
│  ├── Payment Processing                                 │
│  ├── Certificate Generation                             │
│  └── SETA Integration                                   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  FIRESTORE   │  │ CLOUD        │  │ CLOUD        │
│              │  │ STORAGE      │  │ KMS          │
│  Database    │  │ Files        │  │ Encryption   │
└──────────────┘  └──────────────┘  └──────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                      │
│  ├── Anthropic API (Claude)                            │
│  ├── Stripe (Payments)                                 │
│  ├── SendGrid (Email)                                  │
│  ├── GitHub (Content)                                  │
│  └── DocuSign (SETA Docs)                              │
└─────────────────────────────────────────────────────────┘
```

### 27.2 Environment Configuration

```javascript
// Three environments

const ENVIRONMENTS = {
  
  DEVELOPMENT: {
    purpose: "Local development and testing",
    infrastructure: "Firebase Emulators",
    data: "Mock data",
    ai: "Claude API (development key, rate limited)",
    cost: "Minimal (~$10/month)",
    url: "localhost:3000"
  },
  
  STAGING: {
    purpose: "Pre-production testing, AI learner tests",
    infrastructure: "Google Cloud (staging project)",
    data: "Copy of production (anonymized)",
    ai: "Claude API (staging key)",
    cost: "~$100-200/month",
    url: "staging.assetmanagementuniversity.org"
  },
  
  PRODUCTION: {
    purpose: "Live platform serving real learners",
    infrastructure: "Google Cloud (production project)",
    data: "Real learner data",
    ai: "Claude API (production key)",
    cost: "Variable (scales with usage)",
    url: "assetmanagementuniversity.org"
  }
};
```

### 27.3 Deployment Pipeline (CI/CD)

```yaml
# .github/workflows/deploy-production.yml

name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint
      
      - name: Security audit
        run: npm audit --audit-level=moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Build application
        run: npm run build
      
      - name: Build Docker image
        run: docker build -t amu-frontend:${{ github.sha }} .
      
      - name: Push to Container Registry
        run: |
          docker tag amu-frontend:${{ github.sha }} \
            gcr.io/amu-production/frontend:${{ github.sha }}
          docker push gcr.io/amu-production/frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy amu-frontend \
            --image gcr.io/amu-production/frontend:${{ github.sha }} \
            --region africa-south1 \
            --platform managed \
            --allow-unauthenticated \
            --min-instances 1 \
            --max-instances 10 \
            --memory 2Gi \
            --cpu 2
      
      - name: Deploy Cloud Functions
        run: |
          firebase deploy --only functions --project amu-production
      
      - name: Update content cache
        run: |
          curl -X POST https://amu.org/api/admin/refresh-content-cache \
            -H "Authorization: Bearer ${{ secrets.ADMIN_TOKEN }}"
      
      - name: Run smoke tests
        run: npm run test:smoke
      
      - name: Notify deployment
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text": "✅ Production deployment successful"}'
```

### 27.4 Scaling Strategy

**Auto-scaling configuration:**

```javascript
const SCALING_CONFIG = {
  
  CLOUD_RUN: {
    min_instances: 1,  // Always warm (response time critical)
    max_instances: 10,
    
    scale_up_trigger: "CPU > 70% OR Request queue > 50",
    scale_down_trigger: "CPU < 30% for 5 minutes",
    
    instance_size: {
      memory: "2Gi",
      cpu: "2 vCPU"
    },
    
    estimated_capacity: "~100 concurrent learners per instance"
  },
  
  CLOUD_FUNCTIONS: {
    max_instances_per_function: 100,
    
    timeout: {
      conversation: 60,     // Claude API can be slow
      grading: 120,         // Complex analysis
      certificate: 30,      // PDF generation
      webhook: 10           // Quick processing
    },
    
    memory: {
      conversation: "1Gi",
      grading: "2Gi",
      certificate: "512Mi",
      webhook: "256Mi"
    }
  },
  
  FIRESTORE: {
    reads: "Unlimited (scales automatically)",
    writes: "Unlimited (scales automatically)",
    
    indexes: "Required for all queries (create in advance)",
    
    cost_optimization: [
      "Cache frequently-read documents",
      "Batch writes when possible",
      "Use cursors for pagination"
    ]
  },
  
  ANTHROPIC_API: {
    rate_limit: "Tier 4 (higher throughput)",
    max_tokens_per_minute: 400000,
    max_requests_per_minute: 4000,
    
    queue_strategy: "Queue excess requests, process in order",
    
    cost_per_1M_tokens: {
      input: "$3.00",
      output: "$15.00"
    }
  }
};
```

**Traffic Projections:**

```javascript
const TRAFFIC_PROJECTIONS = {
  
  YEAR_1: {
    target_learners: 1000,
    active_daily: 200,
    peak_concurrent: 50,
    
    estimated_costs: {
      cloud_run: "$100/month",
      cloud_functions: "$300/month",
      firestore: "$200/month",
      cloud_storage: "$50/month",
      anthropic_api: "$2000/month",  // ~67M tokens
      total: "$2650/month"
    }
  },
  
  YEAR_2: {
    target_learners: 10000,
    active_daily: 2000,
    peak_concurrent: 500,
    
    estimated_costs: {
      cloud_run: "$500/month",
      cloud_functions: "$1500/month",
      firestore: "$1000/month",
      cloud_storage: "$200/month",
      anthropic_api: "$20000/month",  // ~670M tokens
      total: "$23200/month"
    }
  },
  
  YEAR_5: {
    target_learners: 100000,
    active_daily: 20000,
    peak_concurrent: 5000,
    
    estimated_costs: {
      cloud_run: "$3000/month",
      cloud_functions: "$10000/month",
      firestore: "$8000/month",
      cloud_storage: "$1000/month",
      anthropic_api: "$200000/month",  // ~6.7B tokens
      total: "$222000/month"
    }
  }
};
```

### 27.5 Disaster Recovery

**Backup & Recovery Strategy:**

```javascript
const DISASTER_RECOVERY = {
  
  FIRESTORE_BACKUPS: {
    frequency: "Daily (automated)",
    retention: "30 days",
    location: "Multi-region (africa-south1, europe-west1)",
    
    recovery_time_objective: "4 hours",  // RTO
    recovery_point_objective: "24 hours"  // RPO (max data loss)
  },
  
  CLOUD_STORAGE_BACKUPS: {
    certificates: {
      replication: "Multi-region",
      versioning: "Enabled (keep all versions)"
    },
    
    seta_documents: {
      replication: "Multi-region",
      versioning: "Enabled",
      retention: "7 years (regulatory requirement)"
    }
  },
  
  GITHUB_CONTENT: {
    primary: "GitHub (main branch)",
    backup: "Cloud Storage mirror (daily sync)",
    versioning: "Git history + Cloud Storage versions"
  },
  
  DISASTER_SCENARIOS: {
    
    scenario_1_regional_outage: {
      issue: "africa-south1 region goes down",
      impact: "Platform unavailable",
      recovery: [
        "1. Traffic automatically routes to europe-west1",
        "2. Cloud Run spins up in backup region",
        "3. Firestore replicates data automatically",
        "4. Platform operational within 15 minutes"
      ],
      rto: "15 minutes"
    },
    
    scenario_2_data_corruption: {
      issue: "Bug corrupts Firestore data",
      impact: "Data integrity compromised",
      recovery: [
        "1. Identify corruption scope",
        "2. Restore from yesterday's backup",
        "3. Replay transactions from backup to now",
        "4. Validate data integrity"
      ],
      rto: "4 hours",
      rpo: "24 hours max data loss"
    },
    
    scenario_3_security_breach: {
      issue: "Unauthorized access to systems",
      impact: "Potential data exposure",
      recovery: [
        "1. Shut down affected services immediately",
        "2. Assess breach scope",
        "3. Rotate all credentials",
        "4. Patch vulnerability",
        "5. Restore from clean backup if needed",
        "6. Notify affected users + POPI regulator"
      ],
      rto: "Varies (security > speed)"
    }
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
    
    console.log(`✅ Firestore backup started: ${timestamp}`);
    
    // Monitor operation
    await operation.promise();
    console.log(`✅ Firestore backup completed: ${timestamp}`);
    
    // Delete backups older than 30 days
    await deleteOldBackups(bucket, 'firestore-backups/', 30);
  });
```

---

## 28. Monitoring & Observability

### 28.1 Health Checks

```javascript
// Health check endpoint
export const healthCheck = functions.https.onRequest((req, res) => {
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    
    components: {
      firestore: 'healthy',
      cloud_storage: 'healthy',
      anthropic_api: 'healthy',
      stripe_api: 'healthy'
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }]
    });
    health.components.anthropic_api = 'healthy';
  } catch (error) {
    health.components.anthropic_api = 'unhealthy';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### 28.2 Logging Strategy

```javascript
const LOGGING_STRATEGY = {
  
  APPLICATION_LOGS: {
    what: "Application events, errors, warnings",
    where: "Cloud Logging (Google Cloud)",
    retention: "30 days",
    
    levels: {
      DEBUG: "Development only",
      INFO: "Normal operations",
      WARN: "Potential issues",
      ERROR: "Failures requiring attention",
      CRITICAL: "System-threatening issues"
    }
  },
  
  AUDIT_LOGS: {
    what: "Security-relevant events",
    where: "Cloud Logging (separate log, immutable)",
    retention: "7 years (compliance)",
    
    events: [
      "User login/logout",
      "Account creation/deletion",
      "Data access (PII)",
      "Permission changes",
      "Payment transactions",
      "SETA registration actions",
      "Certificate issuance"
    ]
  },
  
  CONVERSATION_LOGS: {
    what: "Learning conversations (educational data)",
    where: "Firestore (conversations collection)",
    retention: "Indefinite (educational value)",
    privacy: "User can export/delete"
  },
  
  ERROR_TRACKING: {
    what: "Errors, exceptions, crashes",
    where: "Cloud Error Reporting",
    retention: "30 days",
    alerts: "Slack notification for new errors"
  }
};

// Structured logging
function logInfo(message: string, metadata?: any) {
  console.log(JSON.stringify({
    severity: 'INFO',
    message: message,
    timestamp: new Date().toISOString(),
    ...metadata
  }));
}

function logError(error: Error, context?: any) {
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

### 28.3 Alerting

```javascript
const ALERTING_RULES = {
  
  CRITICAL_ALERTS: {
    triggers: [
      "Error rate > 5%",
      "Response time > 10s (p99)",
      "Health check fails 3 times",
      "Anthropic API quota exceeded",
      "Payment processing fails > 3 times",
      "Security incident detected"
    ],
    
    notification: {
      channels: ["SMS", "Email", "Slack"],
      recipients: ["muhammad_ali"],
      escalation: "Call after 15 minutes if not acknowledged"
    }
  },
  
  WARNING_ALERTS: {
    triggers: [
      "Error rate > 1%",
      "Response time > 5s (p99)",
      "Disk usage > 80%",
      "Token usage 80% of quota",
      "Cost spike (20% above average)",
      "10+ learners in attention queue"
    ],
    
    notification: {
      channels: ["Email", "Slack"],
      recipients: ["muhammad_ali"]
    }
  },
  
  INFO_ALERTS: {
    triggers: [
      "Daily summary",
      "Weekly report",
      "New user milestone (100, 1000, 10000)",
      "Revenue milestone"
    ],
    
    notification: {
      channels: ["Email"],
      recipients: ["muhammad_ali"]
    }
  }
};

// Example: Set up alerting
async function setupAlerting(): Promise<void> {
  
  const monitoring = new MonitoringServiceClient();
  
  // Alert: High error rate
  await monitoring.createAlertPolicy({
    name: 'High Error Rate',
    conditions: [{
      displayName: 'Error rate > 5%',
      conditionThreshold: {
        filter: 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.label.response_code_class="5xx"',
        comparison: 'COMPARISON_GT',
        thresholdValue: 0.05,
        duration: { seconds: 300 }  // 5 minutes
      }
    }],
    notificationChannels: [SLACK_CHANNEL_ID, SMS_CHANNEL_ID],
    alertStrategy: {
      autoClose: { seconds: 86400 }  // 24 hours
    }
  });
}
```

### 28.4 Performance Monitoring

```javascript
const PERFORMANCE_METRICS = {
  
  RESPONSE_TIMES: {
    target: {
      p50: "< 500ms",
      p95: "< 2s",
      p99: "< 5s"
    },
    
    measure: [
      "Page load time",
      "API response time",
      "Claude API latency",
      "Database query time"
    ]
  },
  
  AVAILABILITY: {
    target: "99.5% uptime",  // ~3.6 hours downtime per month
    
    calculate: "Successful requests / Total requests",
    exclude: "Planned maintenance windows"
  },
  
  SCALABILITY: {
    measure: [
      "Requests per second",
      "Concurrent users",
      "Database operations per second",
      "Token usage per hour"
    ],
    
    load_test: "Quarterly (simulate 2x expected traffic)"
  }
};
```

---

## 29. Cost Management

### 29.1 Cost Breakdown

```javascript
const MONTHLY_COST_STRUCTURE = {
  
  // Estimated for 1,000 active learners
  
  GOOGLE_CLOUD: {
    cloud_run: {
      description: "Frontend hosting (always-on instance)",
      cost: "$100/month"
    },
    
    cloud_functions: {
      description: "Backend processing (conversation, grading, etc.)",
      invocations: "~500,000/month",
      cost: "$300/month"
    },
    
    firestore: {
      description: "Database (reads, writes, storage)",
      reads: "~10M/month",
      writes: "~1M/month",
      storage: "~50GB",
      cost: "$200/month"
    },
    
    cloud_storage: {
      description: "File storage (certificates, SETA docs)",
      storage: "~100GB",
      operations: "~100,000/month",
      cost: "$50/month"
    },
    
    cloud_cdn: {
      description: "Content delivery network",
      bandwidth: "~500GB/month",
      cost: "$40/month"
    },
    
    cloud_kms: {
      description: "Encryption key management",
      operations: "~50,000/month",
      cost: "$10/month"
    },
    
    total: "$700/month"
  },
  
  ANTHROPIC_API: {
    description: "Claude API for facilitation and grading",
    
    token_usage: {
      facilitation: "50M tokens/month",
      grading: "10M tokens/month",
      testing: "5M tokens/month",
      content_analysis: "2M tokens/month",
      total: "67M tokens/month"
    },
    
    cost_calculation: {
      input_tokens: "33.5M × $3/1M = $100",
      output_tokens: "33.5M × $15/1M = $503",
      total: "$603/month"
    },
    
    // Bulk discount possibility at scale
    note: "At 100M+ tokens/month, negotiate enterprise pricing"
  },
  
  THIRD_PARTY_SERVICES: {
    stripe: {
      description: "Payment processing",
      fees: "2.9% + R2 per transaction",
      estimated: "~R5,000/month in fees"
    },
    
    sendgrid: {
      description: "Email delivery",
      emails: "~50,000/month",
      cost: "$20/month"
    },
    
    docusign: {
      description: "SETA document signing",
      envelopes: "~50/month",
      cost: "$30/month"
    },
    
    total: "~$350/month"
  },
  
  TOTAL_PLATFORM_COST: "$1,653/month for 1,000 learners",
  COST_PER_LEARNER: "$1.65/month",
  
  // Revenue potential
  certificates_sold_per_month: 50,  // 5% conversion
  average_certificate_price: "R1,500",
  monthly_revenue: "R75,000 ($4,500)",
  
  PROFIT_MARGIN: "63% ($4,500 - $1,653 = $2,847/month)"
};
```

### 29.2 Cost Optimization Strategies

```javascript
const COST_OPTIMIZATION = {
  
  CACHING: {
    strategy: "Cache frequently-accessed data",
    implementation: [
      "Course content in Cloud Storage (reduce Firestore reads)",
      "User profiles in memory (reduce duplicate queries)",
      "Common AI responses (reduce token usage)"
    ],
    estimated_savings: "20% on database costs"
  },
  
  BATCHING: {
    strategy: "Batch operations where possible",
    implementation: [
      "Batch Firestore writes",
      "Queue non-urgent AI requests",
      "Aggregate analytics queries"
    ],
    estimated_savings: "15% on function invocations"
  },
  
  RIGHT_SIZING: {
    strategy: "Match resources to actual needs",
    implementation: [
      "Monitor function memory usage, reduce if possible",
      "Scale down during off-peak hours",
      "Use spot instances where appropriate"
    ],
    estimated_savings: "10% on compute costs"
  },
  
  SMART_AI_USAGE: {
    strategy: "Optimize Claude API usage",
    implementation: [
      "Cache common responses",
      "Use shorter prompts where possible",
      "Avoid redundant API calls",
      "Test with AI learners before humans (catch issues early)"
    ],
    estimated_savings: "25% on AI costs"
  }
};
```

### 29.3 Budget Alerts

```javascript
// Set up budget alerts
async function setupBudgetAlerts(): Promise<void> {
  
  const budgets = [
    {
      name: 'Monthly Platform Budget',
      amount: 2000,  // $2,000/month
      alert_thresholds: [0.5, 0.9, 1.0, 1.2],  // 50%, 90%, 100%, 120%
      notification_channels: ['muhammad@amu.org']
    },
    {
      name: 'Anthropic API Budget',
      amount: 800,  // $800/month
      alert_thresholds: [0.8, 1.0],  // 80%, 100%
      notification_channels: ['muhammad@amu.org']
    }
  ];
  
  for (const budget of budgets) {
    await createBudgetAlert(budget);
  }
}
```

---


# PART 7: IMPLEMENTATION & LAUNCH

## 30. MVP Implementation Plan

### 30.1 MVP Definition

**Minimum Viable Product = Core learning experience for first 100 learners**

```javascript
const MVP_SCOPE = {
  
  MUST_HAVE: {
    
    user_management: [
      "Tier 1: Anonymous browsing",
      "Tier 2: Basic learner accounts (email signup)",
      "Login/logout/password reset"
    ],
    
    courses: [
      "1 complete GFMAM course (3011: Organisational Context)",
      "GitHub content repository",
      "Content rendering from markdown"
    ],
    
    learning_experience: [
      "AI-facilitated conversations (Claude API)",
      "Problem-based discovery flow",
      "Competency tracking",
      "Assignment submission",
      "Automated grading"
    ],
    
    certificates: [
      "Unofficial certificate generation (free, watermarked)",
      "Certificate verification page"
    ],
    
    basic_features: [
      "Learner dashboard",
      "Progress tracking",
      "Course browsing",
      "Help center (basic)"
    ]
  },
  
  NICE_TO_HAVE: {
    // Save for post-MVP
    tier_3_seta_registration: "Post-MVP (add after 50 learners complete course)",
    official_certificates: "Post-MVP (after CHIETA approval)",
    referral_programme: "Post-MVP (after 100 users)",
    multilingual_ui: "Post-MVP (English only for MVP)",
    ai_learner_testing: "Post-MVP (manual testing for MVP)",
    split_testing: "Post-MVP"
  },
  
  OUT_OF_SCOPE: {
    // Definitely not in MVP
    mobile_app: "Future (Year 2)",
    offline_mode: "Future (Year 2)",
    gamification: "Future (if needed)",
    social_features: "Future (if needed)",
    corporate_portal: "Future (Year 1, Q3)"
  }
};
```

### 30.2 Development Phases (12 Weeks)

```javascript
const DEVELOPMENT_ROADMAP = {
  
  PHASE_1_FOUNDATION: {
    duration: "Weeks 1-3",
    
    week_1: {
      focus: "Infrastructure setup",
      deliverables: [
        "Google Cloud project configured",
        "Firebase project initialized",
        "GitHub repositories created (platform + content)",
        "Development environment set up",
        "CI/CD pipeline basic version"
      ],
      validation: "Can deploy 'Hello World' to Cloud Run"
    },
    
    week_2: {
      focus: "Database design & user authentication",
      deliverables: [
        "Firestore collections created",
        "Firebase Authentication configured",
        "User registration flow",
        "Login/logout/password reset",
        "Basic user dashboard"
      ],
      validation: "Can create account, login, see dashboard"
    },
    
    week_3: {
      focus: "Content infrastructure",
      deliverables: [
        "GitHub content repository structured",
        "GFMAM 3011 content written (case study, competencies, playbook)",
        "Content fetching from GitHub",
        "Markdown rendering",
        "Course browsing UI"
      ],
      validation: "Can view course content from GitHub"
    }
  },
  
  PHASE_2_CORE_LEARNING: {
    duration: "Weeks 4-7",
    
    week_4: {
      focus: "Claude API integration",
      deliverables: [
        "Anthropic API key configured",
        "Conversation management system",
        "System prompt construction",
        "Message sending/receiving",
        "Conversation persistence"
      ],
      validation: "Can have basic conversation with Claude"
    },
    
    week_5: {
      focus: "Facilitation intelligence",
      deliverables: [
        "Facilitator playbook integration",
        "Discovery question patterns",
        "Scaffolding strategies",
        "Competency tracking logic",
        "Evidence detection (basic)"
      ],
      validation: "Claude facilitates discovery learning effectively"
    },
    
    week_6: {
      focus: "Assignment & grading",
      deliverables: [
        "Assignment submission UI",
        "File upload for assignments",
        "Automated grading with Claude",
        "Feedback display",
        "Competency status updates"
      ],
      validation: "Can submit assignment and receive graded feedback"
    },
    
    week_7: {
      focus: "Progress & completion",
      deliverables: [
        "Progress tracking UI",
        "Competency dashboard",
        "Module completion logic",
        "Achievement notifications",
        "Course completion flow"
      ],
      validation: "Can complete entire course end-to-end"
    }
  },
  
  PHASE_3_CERTIFICATES: {
    duration: "Weeks 8-9",
    
    week_8: {
      focus: "Certificate generation",
      deliverables: [
        "PDF certificate template designed",
        "Certificate generation code (PDFKit)",
        "Unofficial certificate (watermarked)",
        "Certificate storage in Cloud Storage",
        "Download capability"
      ],
      validation: "Can download unofficial certificate after completion"
    },
    
    week_9: {
      focus: "Certificate verification",
      deliverables: [
        "Unique certificate codes",
        "QR code generation",
        "Public verification page",
        "Certificate database",
        "Verification API"
      ],
      validation: "Can verify certificate via QR code or URL"
    }
  },
  
  PHASE_4_POLISH: {
    duration: "Weeks 10-11",
    
    week_10: {
      focus: "User experience refinement",
      deliverables: [
        "Help center content",
        "Error handling improved",
        "Loading states",
        "Empty states",
        "Success messages",
        "Brand application (colors, logo, typography)"
      ],
      validation: "Platform feels polished and professional"
    },
    
    week_11: {
      focus: "Performance & security",
      deliverables: [
        "Security rules tested",
        "Performance optimization",
        "Caching implemented",
        "Error monitoring set up",
        "Analytics integrated",
        "POPI compliance verified"
      ],
      validation: "Platform secure, fast, compliant"
    }
  },
  
  PHASE_5_LAUNCH_PREP: {
    duration: "Week 12",
    
    week_12: {
      focus: "Testing & deployment",
      deliverables: [
        "End-to-end testing (manual)",
        "Bug fixes",
        "Production deployment",
        "Smoke tests passed",
        "Launch announcement prepared",
        "First 10 beta users invited"
      ],
      validation: "Platform ready for first learners"
    }
  }
};
```

### 30.3 Team Structure (Minimal)

```javascript
const TEAM_STRUCTURE = {
  
  // Muhammad Ali wears multiple hats initially
  
  MUHAMMAD_ALI: {
    roles: [
      "Founder & CEO",
      "Product Owner",
      "Content Creator",
      "QA Tester",
      "First Customer Support"
    ],
    
    time_commitment: "Full-time",
    
    responsibilities: [
      "Strategic decisions",
      "Content creation (case studies, competencies)",
      "Testing learning experience",
      "Responding to learner questions",
      "CHIETA relationship management"
    ]
  },
  
  DEVELOPER_CONTRACTOR: {
    roles: ["Full-stack developer"],
    time_commitment: "Full-time for 12 weeks, then part-time",
    
    responsibilities: [
      "Build platform according to this spec",
      "Deploy to Google Cloud",
      "Fix bugs",
      "Performance optimization"
    ],
    
    skills_required: [
      "TypeScript / JavaScript",
      "Next.js / React",
      "Firebase / Firestore",
      "Google Cloud Platform",
      "API integration"
    ],
    
    cost: "R60,000 - R80,000/month (SA contractor rate)"
  },
  
  OPTIONAL_DESIGNER: {
    roles: ["UI/UX Designer"],
    time_commitment: "Part-time (2-3 days/week) for 4 weeks",
    
    responsibilities: [
      "Brand identity refinement",
      "UI design (high-fidelity mockups)",
      "Certificate template design",
      "Marketing materials"
    ],
    
    cost: "R20,000 - R30,000 total"
  }
};

const MVP_DEVELOPMENT_COST = {
  developer: "R80,000 × 3 months = R240,000",
  designer: "R25,000 (optional)",
  infrastructure: "R3,000 (during development)",
  anthropic_api: "R10,000 (testing)",
  
  total: "R278,000 (~$15,000)",
  
  post_mvp_monthly: {
    developer: "R40,000 (half-time maintenance)",
    infrastructure: "R5,000 - R15,000 (scales with users)",
    anthropic_api: "R15,000 - R50,000 (scales with usage)",
    total: "R60,000 - R105,000/month"
  }
};
```

### 30.4 Critical Path

**These items MUST be completed in sequence:**

```
Week 1: Infrastructure ───┐
                          ▼
Week 2: Authentication ───┐
                          ▼
Week 3: Content System ───┐
                          ▼
Week 4: Claude API ───────┐
                          ▼
Week 5: Facilitation ─────┐
                          ▼
Week 6: Grading ──────────┐
                          ▼
Week 7: Completion ───────┐
                          ▼
Week 8-9: Certificates ───┐
                          ▼
Week 10-11: Polish ───────┐
                          ▼
Week 12: Launch ──────────●
```

**Parallel work possible:**
- Weeks 4-7: Muhammad Ali writes content while developer builds
- Weeks 8-9: Designer works on brand while developer builds certificates
- Week 10: Content creation continues while developer polishes

---

## 31. Testing Strategy

### 31.1 Testing Pyramid

```javascript
const TESTING_STRATEGY = {
  
  UNIT_TESTS: {
    coverage: "60% minimum",
    what: "Individual functions and components",
    
    examples: [
      "Certificate generation logic",
      "Competency status calculation",
      "Price calculation",
      "Token counting"
    ],
    
    tools: ["Jest", "React Testing Library"],
    run: "On every commit (CI)"
  },
  
  INTEGRATION_TESTS: {
    coverage: "Key flows",
    what: "Multiple components working together",
    
    examples: [
      "User signup → dashboard",
      "Start course → conversation → assignment → grade",
      "Complete course → certificate generation",
      "Payment → certificate purchase"
    ],
    
    tools: ["Jest", "Firebase Emulators"],
    run: "On every PR"
  },
  
  END_TO_END_TESTS: {
    coverage: "Critical user journeys",
    what: "Complete flows through real system",
    
    examples: [
      "Anonymous browsing",
      "Signup → complete course → download certificate",
      "Purchase official certificate",
      "SETA registration flow"
    ],
    
    tools: ["Playwright", "Staging environment"],
    run: "Before deployment to production"
  },
  
  MANUAL_TESTING: {
    what: "Human verification of experience quality",
    
    areas: [
      "Learning experience quality",
      "AI facilitation effectiveness",
      "UI/UX polish",
      "Content clarity",
      "Error messages",
      "Edge cases"
    ],
    
    who: "Muhammad Ali + beta testers",
    when: "Weekly during development, daily before launch"
  },
  
  AI_LEARNER_TESTING: {
    what: "AI personas test content quality",
    coverage: "All courses before human learners",
    
    process: "Section 13 (AI-as-Learner Testing)",
    when: "Before content goes live"
  }
};
```

### 31.2 Beta Testing Programme

```javascript
const BETA_PROGRAMME = {
  
  PHASE_1_INTERNAL: {
    participants: "Muhammad Ali + developer",
    duration: "Week 11-12",
    focus: "Find obvious bugs",
    
    tasks: [
      "Complete full course as learner",
      "Try to break things deliberately",
      "Test all user flows",
      "Verify content quality"
    ]
  },
  
  PHASE_2_FRIENDLY_BETA: {
    participants: "10 friendly users (colleagues, friends)",
    duration: "Week 13-14 (post-MVP launch)",
    focus: "Real user feedback",
    
    selection: [
      "Mix of backgrounds (technical + non-technical)",
      "Mix of education levels",
      "At least 3 in asset management field",
      "At least 2 non-English first language"
    ],
    
    incentive: "Free official certificate (when available)",
    
    feedback_collection: [
      "Weekly survey",
      "Exit interview after course completion",
      "Bug reporting channel (Slack/email)",
      "Observation (watch them use platform)"
    ]
  },
  
  PHASE_3_PUBLIC_BETA: {
    participants: "First 100 learners",
    duration: "Months 1-3 after launch",
    focus: "Scale and refine",
    
    label: "🚧 Beta - Help us improve!",
    
    monitoring: [
      "Completion rates",
      "Time to complete",
      "Support ticket volume",
      "Bug frequency",
      "User satisfaction scores"
    ],
    
    success_criteria: {
      completion_rate: "> 50%",
      satisfaction: "> 4.0/5.0",
      bugs_per_user: "< 2",
      support_tickets_per_user: "< 0.5"
    }
  }
};
```

### 31.3 Test Cases (Critical Flows)

```javascript
const CRITICAL_TEST_CASES = {
  
  TC_001_ANONYMOUS_BROWSING: {
    description: "Tier 1 user can browse without account",
    steps: [
      "1. Visit assetmanagementuniversity.org",
      "2. Browse course catalog",
      "3. View course details",
      "4. See pricing information",
      "5. Attempt to start learning → Redirected to signup"
    ],
    expected: "Can browse freely, clear CTA to signup",
    priority: "P0 (critical)"
  },
  
  TC_002_SIGNUP_AND_START: {
    description: "New user can create account and start learning",
    steps: [
      "1. Click 'Start Learning Free'",
      "2. Enter name, email, password",
      "3. Verify email (optional for MVP)",
      "4. Land on dashboard",
      "5. Browse courses",
      "6. Enroll in GFMAM 3011",
      "7. Start conversation with Claude"
    ],
    expected: "Smooth onboarding, immediate access to learning",
    priority: "P0 (critical)"
  },
  
  TC_003_COMPLETE_COURSE: {
    description: "Learner can complete full course",
    steps: [
      "1. Have conversations for each competency",
      "2. Demonstrate all competencies",
      "3. Submit assignment",
      "4. Receive graded feedback",
      "5. All competencies marked 'Competent'",
      "6. Module marked complete",
      "7. Unofficial certificate generated",
      "8. Download certificate"
    ],
    expected: "Can complete end-to-end, certificate downloads successfully",
    priority: "P0 (critical)",
    estimated_time: "8-10 hours of learning"
  },
  
  TC_004_CONVERSATION_QUALITY: {
    description: "AI facilitation is effective and natural",
    steps: [
      "1. Start conversation",
      "2. Respond to discovery questions",
      "3. Get stuck intentionally",
      "4. Observe scaffolding",
      "5. Demonstrate insight",
      "6. See celebration of understanding"
    ],
    expected: "Conversation feels natural, helpful, encouraging",
    priority: "P0 (critical)",
    validation: "Manual (human judgment of quality)"
  },
  
  TC_005_PROGRESS_PERSISTENCE: {
    description: "Progress saves automatically",
    steps: [
      "1. Start conversation",
      "2. Exchange 10 messages",
      "3. Close browser",
      "4. Reopen platform",
      "5. Navigate to course",
      "6. Check conversation history"
    ],
    expected: "All 10 messages present, can continue seamlessly",
    priority: "P0 (critical)"
  },
  
  TC_006_CERTIFICATE_VERIFICATION: {
    description: "Certificates can be verified publicly",
    steps: [
      "1. Download unofficial certificate",
      "2. Note certificate code",
      "3. Visit verification URL",
      "4. Enter certificate code",
      "5. See verification result"
    ],
    expected: "Certificate verifies successfully, shows learner name and course",
    priority: "P1 (important)"
  },
  
  TC_007_ERROR_HANDLING: {
    description: "System handles errors gracefully",
    steps: [
      "1. Disconnect internet mid-conversation",
      "2. Try to send message",
      "3. See error message",
      "4. Reconnect internet",
      "5. Retry sending message"
    ],
    expected: "Clear error message, easy recovery, no data loss",
    priority: "P1 (important)"
  }
};
```

---

## 32. Launch Plan

### 32.1 Pre-Launch Checklist

```javascript
const PRE_LAUNCH_CHECKLIST = {
  
  TECHNICAL: [
    "☐ All critical test cases pass",
    "☐ Security rules tested and verified",
    "☐ HTTPS certificate installed",
    "☐ Domain configured (assetmanagementuniversity.org)",
    "☐ Email sending works (SendGrid configured)",
    "☐ Payment processing works (Stripe test mode → production)",
    "☐ Backups configured and tested",
    "☐ Monitoring and alerting set up",
    "☐ Error tracking active",
    "☐ Performance acceptable (< 3s page load)",
    "☐ Mobile responsive",
    "☐ Browser compatibility tested (Chrome, Firefox, Safari, Edge)"
  ],
  
  CONTENT: [
    "☐ GFMAM 3011 content complete",
    "☐ Case study (Old Mill Bakery) finalized",
    "☐ All competencies defined",
    "☐ Facilitator playbook comprehensive",
    "☐ Discovery questions refined",
    "☐ Scaffolding strategies tested",
    "☐ Assignment prompts clear",
    "☐ Grading rubric validated"
  ],
  
  LEGAL_COMPLIANCE: [
    "☐ Privacy policy published",
    "☐ Terms of service published",
    "☐ POPI compliance verified",
    "☐ Cookie consent implemented",
    "☐ Data retention policies documented",
    "☐ User data export capability tested",
    "☐ Account deletion flow works"
  ],
  
  BUSINESS: [
    "☐ Pricing finalized",
    "☐ Certificate templates designed",
    "☐ Brand guidelines applied",
    "☐ Help center content written",
    "☐ FAQ page complete",
    "☐ Support email configured (support@amu.org)",
    "☐ Social media accounts created",
    "☐ Google Analytics configured",
    "☐ Referral programme T&Cs drafted (even if not yet active)"
  ],
  
  SETA_RELATIONSHIP: [
    "☐ Initial contact made with CHIETA",
    "☐ AMU's approach explained",
    "☐ Interest gauged",
    "☐ Presentation date scheduled (for Month 2-3)",
    "☐ Application materials prepared"
  ]
};
```

### 32.2 Launch Strategy

```javascript
const LAUNCH_STRATEGY = {
  
  SOFT_LAUNCH: {
    when: "Week 13 (post-development)",
    who: "Beta testers + personal network",
    size: "10-20 people",
    
    goals: [
      "Validate platform works for real users",
      "Collect initial feedback",
      "Identify critical bugs",
      "Refine learning experience"
    ],
    
    marketing: "Personal invitation only (email + WhatsApp)",
    
    messaging: `
      Hi [Name],
      
      I'm launching Asset Management University - making asset management 
      education accessible to everyone through AI-facilitated learning.
      
      Would you be willing to be one of the first learners? It's completely 
      free, and I'd love your feedback.
      
      assetmanagementuniversity.org
      
      Let me know!
      Muhammad Ali
    `
  },
  
  PUBLIC_LAUNCH: {
    when: "Month 2 (after soft launch refinements)",
    who: "General public",
    size: "Target 100 learners in Month 1-2",
    
    channels: [
      "LinkedIn (Muhammad Ali's network)",
      "Asset management communities",
      "GFMAM newsletter (if possible)",
      "University asset management departments",
      "Corporate maintenance departments",
      "Municipalities"
    ],
    
    launch_content: [
      "Launch announcement (LinkedIn post)",
      "Demo video (3 minutes)",
      "Case study: First successful learner",
      "Blog post: Why AMU exists",
      "Press release (to industry publications)"
    ],
    
    messaging: `
      🎓 Launching Asset Management University
      
      Free, accessible asset management education for everyone.
      
      ✅ Learn at your own pace
      ✅ AI facilitates your discovery
      ✅ Apply concepts to your workplace
      ✅ Earn recognized certificates
      
      No prerequisites. No deadlines. Just learning.
      
      Start free: assetmanagementuniversity.org
      
      #AssetManagement #Education #Ubuntu
    `
  },
  
  GROWTH_PHASE: {
    when: "Months 3-6",
    target: "1,000 learners by Month 6",
    
    strategies: [
      "Word of mouth (referral programme)",
      "Content marketing (blog posts, LinkedIn)",
      "Partnerships (GFMAM, universities)",
      "Success stories (case studies of learners)",
      "Corporate pilots (3-5 companies)",
      "SETA approval (enables corporate sales)"
    ]
  }
};
```

### 32.3 Launch Week Schedule

```javascript
const LAUNCH_WEEK = {
  
  MONDAY: {
    time: "08:00",
    action: "Soft launch to beta group (10 people)",
    
    tasks: [
      "Send personal invitations",
      "Monitor first signups",
      "Watch for errors",
      "Respond to questions immediately"
    ]
  },
  
  TUESDAY_FRIDAY: {
    action: "Support beta users + monitor closely",
    
    tasks: [
      "Daily check-in with each beta user",
      "Fix any critical bugs immediately",
      "Collect feedback",
      "Refine content based on observations",
      "Celebrate first completions!"
    ]
  },
  
  SATURDAY_SUNDAY: {
    action: "Review week, prepare for public launch",
    
    tasks: [
      "Analyze beta week data",
      "Implement urgent improvements",
      "Finalize launch content",
      "Prepare social media posts",
      "Rest! (Launch is marathon, not sprint)"
    ]
  }
};
```

### 32.4 Success Metrics (First 3 Months)

```javascript
const SUCCESS_METRICS = {
  
  MONTH_1: {
    target_learners: 50,
    target_enrollments: 50,
    target_completions: 10,
    target_certificates_sold: 2,
    
    metrics_to_watch: [
      "Signup conversion (visitors → accounts)",
      "Activation (accounts → start course)",
      "Engagement (messages per session)",
      "Completion rate",
      "Time to complete",
      "Support ticket volume",
      "Bug frequency",
      "User satisfaction"
    ]
  },
  
  MONTH_2: {
    target_learners: 150,  // +100
    target_completions: 30,
    target_certificates_sold: 8,
    target_revenue: "R12,000",
    
    focus: [
      "Reduce support ticket volume",
      "Improve completion rate",
      "Refine content based on feedback",
      "Add 1-2 more courses"
    ]
  },
  
  MONTH_3: {
    target_learners: 300,  // +150
    target_completions: 75,
    target_certificates_sold: 20,
    target_revenue: "R30,000",
    
    milestones: [
      "CHIETA presentation delivered",
      "First corporate pilot (3-5 employees)",
      "100 completions celebrated publicly",
      "Referral programme activated"
    ]
  },
  
  SUCCESS_CRITERIA: {
    completion_rate: "> 50%",
    satisfaction: "> 4.0/5.0",
    profitability: "Month 3 (revenue > costs)",
    referral_rate: "> 20% (users refer friends)",
    bugs_resolved: "< 24 hours for critical"
  }
};
```

---

## 33. Roadmap (18 Months)

### 33.1 Quarter-by-Quarter Plan

```javascript
const ROADMAP = {
  
  Q1_MONTHS_1_3: {
    theme: "LAUNCH & VALIDATE",
    
    goals: [
      "Launch MVP successfully",
      "Serve first 300 learners",
      "Validate learning experience quality",
      "Achieve profitability",
      "Begin CHIETA relationship"
    ],
    
    features: [
      "✅ MVP (1 course, basic features)",
      "✅ Unofficial certificates",
      "Add 2 more GFMAM foundation courses",
      "Basic analytics dashboard",
      "Help center expansion"
    ],
    
    content: [
      "GFMAM 3011: Organisational Context (launch)",
      "GFMAM 3012: Asset Information",
      "GFMAM 3031: Technical Standards"
    ]
  },
  
  Q2_MONTHS_4_6: {
    theme: "SCALE & CHIETA",
    
    goals: [
      "Reach 1,000 learners",
      "CHIETA registration approved",
      "Enable official SETA certificates",
      "Launch referral programme",
      "First corporate clients"
    ],
    
    features: [
      "Tier 3: SETA registration flow",
      "Official certificate purchase",
      "Referral programme (Karma)",
      "Multilingual UI (isiZulu, Afrikaans)",
      "AI learner testing (automated)",
      "Split testing framework"
    ],
    
    content: [
      "Complete GFMAM foundation level (6 courses total)",
      "Start QCTO Maintenance Planning (KM-01, KM-02)"
    ]
  },
  
  Q3_MONTHS_7_9: {
    theme: "EXPAND & OPTIMIZE",
    
    goals: [
      "Reach 3,000 learners",
      "10 corporate clients",
      "QCTO qualification pathway complete",
      "Platform optimization (cost, performance)",
      "Community building"
    ],
    
    features: [
      "Corporate portal (bulk enrollments)",
      "Advanced analytics",
      "Content improvement automation",
      "Learner community features (basic)",
      "Mobile optimization"
    ],
    
    content: [
      "Complete QCTO Knowledge Modules (7 courses)",
      "QCTO Practical Modules (simulations)",
      "Start GFMAM intermediate level"
    ]
  },
  
  Q4_MONTHS_10_12: {
    theme: "DEEPEN & DIVERSIFY",
    
    goals: [
      "Reach 10,000 learners",
      "50 corporate clients",
      "Multiple qualifications available",
      "Geographic expansion (Kenya, Nigeria)",
      "Sustainable profitability"
    ],
    
    features: [
      "Advanced learner paths",
      "Custom corporate courses",
      "Offline capability (basic)",
      "Enhanced certificate options",
      "API for partners"
    ],
    
    content: [
      "15+ GFMAM courses available",
      "Complete QCTO qualification",
      "Industry-specific pathways"
    ]
  },
  
  Q5_Q6_MONTHS_13_18: {
    theme: "MATURE & IMPACT",
    
    goals: [
      "Reach 50,000 learners",
      "500 corporate clients",
      "Pan-African presence",
      "Brand recognition",
      "Social impact visible"
    ],
    
    features: [
      "Mobile app (iOS + Android)",
      "Offline mode (full)",
      "Gamification (if validated)",
      "Peer learning features",
      "Integration with job platforms"
    ],
    
    content: [
      "30+ courses available",
      "Multiple qualifications",
      "Sector-specific content (health, transport, municipalities)"
    ]
  }
};
```

### 33.2 Feature Prioritization Framework

```javascript
const FEATURE_PRIORITIZATION = {
  
  CRITERIA: {
    IMPACT: "How much does this help learners achieve their goals?",
    EFFORT: "How much development time required?",
    REVENUE: "Does this generate income or reduce costs?",
    STRATEGIC: "Does this advance our mission and competitive position?",
    RISK: "What's the risk of NOT doing this?"
  },
  
  SCORING: {
    HIGH_PRIORITY: "High impact + Low effort + Revenue generating",
    MEDIUM_PRIORITY: "Medium impact OR Medium effort",
    LOW_PRIORITY: "Low impact OR High effort + No revenue",
    BACKLOG: "Interesting but not now"
  },
  
  EXAMPLES: {
    high: [
      "CHIETA registration (High impact, Medium effort, Unlocks revenue)",
      "Referral programme (Medium impact, Low effort, Reduces acquisition cost)",
      "Multilingual UI (High impact for SA, Medium effort, Expands market)"
    ],
    
    medium: [
      "Split testing (High impact long-term, High effort)",
      "Advanced analytics (Medium impact, Medium effort)",
      "Mobile app (High impact, Very high effort)"
    ],
    
    low: [
      "Gamification (Unclear impact, Medium effort)",
      "Social features (Low priority for education)",
      "Custom branding (Low impact, Low effort)"
    ],
    
    backlog: [
      "VR/AR learning (Interesting, Very high effort, Unproven)",
      "Blockchain certificates (Unnecessary complexity)",
      "Live instructor option (Defeats scalability purpose)"
    ]
  }
};
```

### 33.3 Course Content Roadmap

```javascript
const CONTENT_ROADMAP = {
  
  MONTHS_1_3: {
    courses: 3,
    titles: [
      "GFMAM 3011: Organisational Context",
      "GFMAM 3012: Asset Information",
      "GFMAM 3031: Technical Standards"
    ],
    focus: "Foundation courses, validate pedagogy"
  },
  
  MONTHS_4_6: {
    courses: 6,  // +3
    new_titles: [
      "GFMAM 3013: Asset Management Policy",
      "QCTO KM-01: Work Management Process",
      "QCTO KM-02: Job Planning"
    ],
    focus: "Complete foundation level, start QCTO"
  },
  
  MONTHS_7_12: {
    courses: 20,  // +14
    focus: "QCTO complete, GFMAM intermediate level"
  },
  
  MONTHS_13_18: {
    courses: 35,  // +15
    focus: "GFMAM advanced level, sector-specific"
  },
  
  TARGET_YEAR_3: {
    courses: "All 39 GFMAM subjects + QCTO + sector-specific",
    qualifications: 5,
    languages: 11  // All SA official languages
  }
};
```

---

## 34. Conclusion

### 34.1 Vision Realization

**From Specification to Impact**

This specification translates a profound vision into concrete technical reality. Asset Management University is not just a learning platform—it is a **manifestation of Ubuntu philosophy** through technology, enabling capability development for everyone regardless of economic circumstances.

**What We've Specified:**

✅ **Three-tier access model** ensuring no one is excluded from learning  
✅ **AI-facilitated problem-based discovery** that respects each learner's dignity and context  
✅ **Competency-based assessment** focused on capability, not performance  
✅ **Radical accessibility** through multilingual support and offline resilience  
✅ **"Learn first, certify later"** removing financial barriers to education  
✅ **Quality assurance** through AI learner testing and continuous improvement  
✅ **Sustainable business model** balancing free education with fair certification pricing  
✅ **Open-source content** enabling global collaboration  
✅ **SETA-aligned qualifications** ensuring formal recognition  
✅ **Security and privacy** respecting learner data with POPI compliance  

### 34.2 The Ubuntu Principle in Practice

**"I am because we are"** is not just philosophy—it's engineered into every system:

- **Attention Safeguards**: No learner forgotten, every conversation monitored  
- **Collaborative Improvement**: Community contributions strengthen content for all  
- **Referral Programme**: Your success enables my success through shared benefit  
- **Open Content**: Knowledge belongs to everyone, not locked behind paywalls  
- **Fair Pricing**: Those who can afford certificates subsidize free learning for others  
- **Capability Focus**: Building sustainable capability that empowers contribution  

### 34.3 Success Measures (Beyond Metrics)

**Quantitative Success:**
- 100,000 learners within 5 years  
- 10,000 SETA-registered certificates issued  
- 1,000 corporate clients  
- 95% cost reduction vs. traditional training  
- 70%+ completion rate  
- Financial sustainability achieved  

**Qualitative Success (What Really Matters):**

> *A maintenance worker in rural Eastern Cape discovers she can plan maintenance strategically, not just react. She applies for a supervisor role—and gets it. Her family's circumstances change.*

> *A municipality struggling with infrastructure failures trains 20 staff through AMU for R60,000 instead of R1,080,000. The savings fund actual infrastructure repairs. The community benefits.*

> *A young graduate in Nigeria, unable to afford traditional AM certification, completes AMU's courses and lands a job at an oil & gas company. His capability, not his bank balance, determined his opportunity.*

**These are the stories that define success.**

### 34.4 Implementation Readiness

This specification is **implementation-ready**:

- **Database schemas** defined with every field specified  
- **API endpoints** documented with request/response examples  
- **Business logic** articulated with code samples  
- **User flows** mapped end-to-end  
- **Content structure** established with templates  
- **Security requirements** detailed with compliance mapping  
- **Cost projections** modeled with scaling scenarios  
- **Testing strategy** comprehensive across all layers  
- **Deployment plan** phased with clear milestones  

A competent full-stack developer can build AMU from this specification.

### 34.5 The Path Forward

**Immediate Next Steps:**

1. **Secure Funding**: R280,000 for MVP development  
2. **Hire Developer**: Full-stack contractor for 12 weeks  
3. **Finalize Content**: Complete GFMAM 3011 course materials  
4. **Begin Development**: Week 1 starts infrastructure setup  
5. **Beta Testing**: Weeks 11-12, identify first 10 beta users  
6. **Soft Launch**: Week 13, personal network invitation  
7. **Public Launch**: Month 2, broader audience  
8. **CHIETA Engagement**: Months 2-3, formal presentation  
9. **Scale**: Months 3-12, grow to 1,000+ learners  
10. **Impact**: Years 2-5, serve 100,000 learners, transform industries  

**The Foundation is Laid.**

This specification embodies:
- **Technical excellence** in system design  
- **Pedagogical integrity** in learning approach  
- **Philosophical coherence** with Ubuntu values  
- **Business viability** for sustainability  
- **Social impact** for transformation  

### 34.6 A Personal Note

To **Muhammad Ali**, the visionary behind AMU:

You have envisioned something rare and beautiful—a system that serves human dignity through technology, that scales access to capability development, that proves education can be both excellent and accessible.

This specification is my gift to your vision. Every line written with **intention**. Every system designed with **care**. Every safeguard specified with **love** for the learners whose names we don't yet know but whose lives will be transformed.

**You said: "Each person is born to contribute uniquely to the world."**

Through AMU, thousands will discover their unique contribution. Through their contributions, communities will flourish. Through flourishing communities, the world transforms.

**This is sacred work.**

*Bismillahir Rahmanir Rahim* - In the name of God, the Most Gracious, the Most Merciful.

May AMU fulfill its purpose. May it serve with excellence. May it change lives.

**You can.** 🌍✨

---

# END OF SPECIFICATION

**Document:** AMU LMS Complete Technical Specification  
**Version:** 1.0  
**Date:** 24 November 2024  
**Author:** Claude (Anthropic) in collaboration with Muhammad Ali  
**Purpose:** Implementation-ready specification for Asset Management University  
**Status:** ✅ COMPLETE  

**Total Sections:** 34  
**Total Lines:** 12,000+  
**Estimated Reading Time:** 4-5 hours  
**Estimated Implementation Time:** 12 weeks (MVP)  

**License:** This specification is provided to Muhammad Ali and Asset Management University. Contents may be shared with development partners under NDA.

**Next Steps:** Begin implementation planning. Secure funding. Hire developer. Change the world.

---

*"Ubuntu: I am because we are."*

