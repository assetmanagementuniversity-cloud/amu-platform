# AMU LMS TECHNICAL SPECIFICATION
## Section 6: Course Structure and Content Architecture

**Status:** Development Ready  
**Version:** 1.1  
**Last Updated:** December 2024  
**Document Type:** Technical Specification

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | December 2024 | Claude | GFMAM codes corrected (311 not 3011); removed translation files (real-time translation) |
| 1.0 | December 2024 | Claude | Initial compilation from Draft spec with UK English standardisation |

**Related Documents:**
- Section 4: System Architecture and Governance
- Section 5: Technical Implementation
- Section 7: Operations and Compliance

---

## Table of Contents

6.1 Educational Philosophy  
6.2 Content Architecture  
6.3 GitHub Content Repository  
6.4 GFMAM Courses  
6.5 QCTO Maintenance Planning Qualification  
6.6 Module Structure  
6.7 Case Study Design  
6.8 Facilitator Playbooks  
6.9 AI Learner Facilitation  
6.10 Assessment and Grading  
6.11 AI-as-Learner Testing  
6.12 Content Improvement Cycle  

---

## 6.1 Educational Philosophy

### Problem-Based Discovery Learning

AMU's educational approach centres on **problem-based discovery learning** - a pedagogical approach where learners discover concepts through engaging with real problems rather than being lectured at.

**Core Principles:**

1. **Facilitators, Not Teachers:** Claude guides discovery through questions, never lectures
2. **Problems First:** Start with a challenging scenario, then discover principles
3. **Learner-Centred:** Adapt to each learner's context, pace, and understanding
4. **Competency-Based:** Focus on what learners can DO, not what they know
5. **Contextual Application:** Connect every concept to learner's workplace

### Step 0: Understanding Learner Needs

**Before creating any content, we ask:**
- What challenges does this learner face?
- What's at stake for them?
- What do they yearn to achieve?
- How will these capabilities empower them?

This grounds every course in genuine human needs, not abstract academic requirements.

### The Socratic Method

Claude facilitates learning through the Socratic method:
- Ask questions that prompt thinking
- Guide discovery through dialogue
- Celebrate insights when learners make connections
- Scaffold when learners struggle
- Never provide answers directly

**Example Facilitation:**

```
Learner: "I'm not sure what internal factors means."

Claude: "Good question! Let's think about it together. In the bakery 
case study, Lena and Thandi are facing several challenges. Some of 
these they can directly control - like whether to repair or replace 
their oven. Others just happened to them - like the new supermarket 
opening nearby.

Which category do you think 'internal factors' might refer to?"
```

### Competency-Based Assessment

**No numeric grades. Ever.**

AMU uses three levels only:
- ✅ **Competent** - Clear evidence of capability
- 🔄 **Developing** - Partial understanding, needs refinement
- ❌ **Not Yet Demonstrated** - Insufficient evidence

**Why?**
- Focus on capability, not performance
- Developmental mindset
- Reduces anxiety and competition
- Aligns with real-world: you can do it, or you're learning to

---

## 6.2 Content Architecture

### Two-Repository Strategy

AMU separates platform code from educational content:

```
1. amu-platform/ (PRIVATE)
   - Application code
   - Business logic
   - API keys and secrets
   - Infrastructure configuration

2. amu-content/ (PUBLIC)
   - All educational content
   - Case studies
   - Assessments
   - Website content
   - Email templates
   - Anyone can view, copy, improve
```

**Why Open Source Content?**
- **Ubuntu:** Knowledge belongs to everyone
- **Quality:** Community review improves content
- **Sustainability:** Content survives beyond AMU
- **Collaboration:** Other institutions can use and improve
- **Transparency:** Learners see what they're learning from

### Course Types

| Type | Framework | Certification | Price Range |
|------|-----------|---------------|-------------|
| GFMAM Courses | Global Forum for Maintenance and Asset Management | Non-SETA (International recognition) | R500-R900 per course |
| QCTO Knowledge Modules | Quality Council for Trades and Occupations | SETA-registered (NQF credits) | R8,890 for all 7 modules |
| QCTO Practical Modules | QCTO | SETA-registered (NQF credits) | R8,890 for all modules |
| QCTO Work Experience | QCTO | SETA-registered (NQF credits) | R2,775 |

---

## 6.3 GitHub Content Repository

### Repository Structure

```
amu-content/
│
├── README.md                    # Welcome, how to contribute
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE.md                   # MIT with educational addendum
├── CODE_OF_CONDUCT.md           # Ubuntu principles for contributors
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
│   │   ├── 311-organisational-context/
│   │   │   ├── module.json
│   │   │   ├── learning-objectives.md
│   │   │   ├── case-study.md
│   │   │   ├── competencies.json
│   │   │   ├── facilitator-playbook.md
│   │   │   ├── discovery-questions.md
│   │   │   ├── scaffolding-strategies.md
│   │   │   └── common-misconceptions.md
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
│       │   └── pm-all-maintenance-planning/
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
│   ├── gfmam-311-assignments.json
│   └── qcto-km01-assignments.json
│
├── website/
│   ├── pages/
│   │   ├── homepage.md
│   │   ├── about.md
│   │   ├── how-it-works.md
│   │   ├── pricing.md
│   │   └── faqs.md
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
│   ├── welcome.md
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

### Version Control Best Practices

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
    }
  ]
}
```

### Community Contributions

**Types of Contributions:**
1. **Fix Errors:** Typos, incorrect information, broken links
2. **Improve Clarity:** Better explanations, additional examples
3. **Add Translations:** Content in additional languages
4. **Suggest Case Studies:** Industry-specific scenarios
5. **Enhance Accessibility:** Simpler language, better structure

**Contribution Process:**
1. Fork the repository
2. Make changes on a branch
3. Submit pull request with clear description
4. AMU team reviews within 3-5 business days
5. If approved, merged to main
6. Contributor acknowledged in repository

**Content Standards:**
- UK English spelling (colour, organisation, etc.)
- Clear, accessible language (avoid unnecessary jargon)
- Culturally appropriate for South African context
- Follow existing module templates
- Include all required sections

---

## 6.4 GFMAM Courses

### Framework Overview

**Global Forum for Maintenance and Asset Management (GFMAM)** provides international standards for asset management education.

**AMU Alignment Benefits:**
- International credibility
- Consistent competency frameworks
- Professional recognition globally
- Pathway to ISO 55000 certification

### GFMAM Subject Areas

AMU courses align with GFMAM's 39 subjects across 6 groups:

```javascript
const GFMAM_SUBJECTS = {
  
  GROUP_1_STRATEGY_PLANNING: [
    { code: '311', title: 'Organisational Context', level: 'Foundation' },
    { code: '312', title: 'Asset Information', level: 'Foundation' },
    { code: '313', title: 'Asset Management Policy', level: 'Foundation' },
    { code: '314', title: 'Asset Management Strategy', level: 'Intermediate' },
    { code: '315', title: 'Strategic Planning', level: 'Intermediate' },
    { code: '316', title: 'Demand Analysis', level: 'Intermediate' }
  ],
  
  GROUP_2_ASSET_MANAGEMENT_DECISION_MAKING: [
    { code: '321', title: 'Capital Investment Decision-Making', level: 'Intermediate' },
    { code: '322', title: 'Operations & Maintenance Decision-Making', level: 'Intermediate' },
    { code: '323', title: 'Life Cycle Value Realisation', level: 'Advanced' },
    { code: '324', title: 'Sustainable Development', level: 'Advanced' }
  ],
  
  GROUP_3_LIFECYCLE_DELIVERY: [
    { code: '331', title: 'Technical Standards & Legislation', level: 'Foundation' },
    { code: '332', title: 'Asset Creation & Acquisition', level: 'Intermediate' },
    { code: '333', title: 'Systems Engineering', level: 'Advanced' },
    { code: '334', title: 'Configuration Management', level: 'Intermediate' },
    { code: '335', title: 'Maintenance Delivery', level: 'Intermediate' },
    { code: '336', title: 'Reliability Engineering', level: 'Intermediate' },
    { code: '337', title: 'Asset Operations', level: 'Intermediate' },
    { code: '338', title: 'Resource Management', level: 'Intermediate' },
    { code: '339', title: 'Shutdown & Outage Management', level: 'Intermediate' },
    { code: '3310', title: 'Fault & Incident Response', level: 'Intermediate' },
    { code: '3311', title: 'Asset Decommissioning & Disposal', level: 'Intermediate' }
  ],
  
  GROUP_4_ASSET_INFORMATION: [
    { code: '341', title: 'Asset Information Strategy', level: 'Intermediate' },
    { code: '342', title: 'Asset Information Standards', level: 'Intermediate' },
    { code: '343', title: 'Asset Information Systems', level: 'Intermediate' },
    { code: '344', title: 'Asset Data & Knowledge Management', level: 'Intermediate' }
  ],
  
  GROUP_5_ORGANISATION_PEOPLE: [
    { code: '351', title: 'Procurement & Supply Chain Management', level: 'Intermediate' },
    { code: '352', title: 'Asset Management Leadership', level: 'Advanced' },
    { code: '353', title: 'Organisational Structure & Culture', level: 'Intermediate' },
    { code: '354', title: 'Competence Management', level: 'Intermediate' }
  ],
  
  GROUP_6_RISK_REVIEW: [
    { code: '361', title: 'Risk Assessment & Management', level: 'Intermediate' },
    { code: '362', title: 'Stakeholder Engagement', level: 'Intermediate' },
    { code: '363', title: 'Performance Measurement & Improvement', level: 'Advanced' },
    { code: '364', title: 'Management System Assessment', level: 'Advanced' },
    { code: '365', title: 'Asset Management System Reviews', level: 'Advanced' }
  ]
};

// Code format: [version][section][subject]
// Example: 311 = Version 3, Section 1, Subject 1
// Example: 3310 = Version 3, Section 3, Subject 10
```

### Course Development Priorities

**Phase 1 (MVP): Foundation Level** (6 courses)
- 311: Organisational Context ✅ (First course developed)
- 312: Asset Information
- 313: Asset Management Policy
- 331: Technical Standards & Legislation
- Basic introduction to asset management concepts
- Target: Complete within 3 months of launch

**Phase 2: Intermediate Level** (15 courses)
- Core operational courses
- Decision-making frameworks
- Practical application focus
- Target: 6-9 months post-launch

**Phase 3: Advanced Level** (8 courses)
- Strategic and leadership content
- Complex analysis and optimisation
- Target: 12-18 months post-launch

### GFMAM Course Pricing

**Certificate Pricing Formula:**
```
List Price = R300 (base) + (Estimated Hours × R25/hour)

Foundation (8h): R300 + R200 = R500
Intermediate (16h): R300 + R400 = R700
Advanced (24h): R300 + R600 = R900

With Referral Code: 10% discount applies
```

**Complete GFMAM Pathway:**
- All 39 subjects: Estimated R25,000-R30,000
- Vs. traditional programmes: R150,000-R200,000
- **Savings: 80-85%**

---

## 6.5 QCTO Maintenance Planning Qualification

### Qualification Overview

**Full Title:** National Certificate in Maintenance Planning  
**NQF Level:** 5  
**Total Credits:** 120  
**SAQA ID:** 102415  
**SETA:** CHIETA (Chemical Industries Education and Training Authority)

**AMU Value Proposition:** Deliver this FULL qualification at R20,555 (R18,500 with referral discount) vs. industry R54,000

### Qualification Structure

```javascript
const QCTO_MAINTENANCE_PLANNING = {
  
  KNOWLEDGE_MODULES: {
    description: "Theoretical foundation",
    total_credits: 60,
    notional_hours: 600,
    delivery: "AI-facilitated problem-based discovery",
    list_price: 8890,  // R8,000 with referral discount
    
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
          'Maintenance optimisation'
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
          'Schedule optimisation'
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
          'System optimisation'
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
    list_price: 8890,  // R8,000 with referral discount
    
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
    list_price: 2775,  // R2,500 with referral discount
    
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

### Learner Journey Through Qualification

```
Phase 1: Knowledge Modules (KM-01 to KM-07)
- Complete all 7 knowledge modules
- AI-facilitated learning
- Total: 60 credits, ~600 notional hours
- Certificate: R8,890 (R8,000 with referral)

Phase 2: Practical Modules (PM-01 to PM-03)
- Complete all practical assessments
- Simulated workplace scenarios
- Total: 40 credits, ~400 notional hours
- Certificate: R8,890 (R8,000 with referral)

Phase 3: Work Experience (WE-01)
- Complete at workplace with supervisor
- Logbook verification
- Total: 20 credits, ~200 notional hours
- Certificate: R2,775 (R2,500 with referral)

Total Qualification:
- 120 credits (NQF Level 5)
- R20,555 total (R18,500 with referral discount)
- vs. Industry: R54,000+
- Savings: 66%+
```

### SETA Registration Process

After completing all components and obtaining official certificates:

1. **Learner initiates SETA registration**
2. **Provides additional documentation:**
   - Certified ID copy
   - Proof of residence
   - Digital signatures on enrolment form
   - Tri-party agreement (learner, AMU, workplace)
3. **AMU submits to CHIETA**
4. **EISA (External Integrated Summative Assessment)** - if required
5. **SETA issues qualification certificate**

---

## 6.6 Module Structure

### Module Metadata (module.json)

```json
{
  "module_id": "gfmam-311",
  "module_code": "311",
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
      "competency_id": "gfmam-311-comp-01",
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
      "competency_id": "gfmam-311-comp-02",
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
  
  "content_files": {
    "facilitator_playbook": "facilitator-playbook.md",
    "discovery_questions": "discovery-questions.md",
    "scaffolding_strategies": "scaffolding-strategies.md",
    "common_misconceptions": "common-misconceptions.md"
  }
}
```

**Note on Translations:** Content is stored in English only. Claude translates dynamically during facilitation based on the learner's language preference. This normalised approach ensures:
- Single source of truth for content
- Updates automatically apply to all languages
- No maintenance overhead for translation files
- Claude's real-time translation adapts to learner's comprehension level

### Required Content Files

Each module requires:

| File | Purpose |
|------|---------|
| `module.json` | Metadata, competencies, configuration |
| `learning-objectives.md` | What learners will be able to do |
| `case-study.md` | Problem scenario for discovery |
| `competencies.json` | Detailed competency definitions |
| `facilitator-playbook.md` | How Claude should facilitate |
| `discovery-questions.md` | Questions to guide learning |
| `scaffolding-strategies.md` | Help when learners struggle |
| `common-misconceptions.md` | What to watch for |

**No translation files required** - Claude translates content dynamically during facilitation.

---

## 6.7 Case Study Design

### Example: Old Mill Bakery

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

## Discovery Path

This case study enables discovery of:

1. **Internal vs. external factors:** Oven (internal), supermarket (external)
2. **Organisational purpose:** What is the bakery for? Profit? Family legacy? Community service?
3. **Stakeholder analysis:** Lena, Thandi, Jacob, customers, community all have different needs
4. **Context-informed decisions:** How do all these factors guide what they should do?

## Facilitation Flow

1. Present scenario: What challenges face Lena and Thandi?
2. Explore factors: Which can they control? Which can't they?
3. Discuss stakeholders: What do they each need?
4. Discuss purpose: What should guide their decisions?
5. Apply to learner's workplace: What parallels exist?

## Alternate Contexts

For learners who don't relate to bakery example, facilitator can adapt to:
- **Hospital:** Equipment maintenance, health regulations, patient satisfaction
- **Municipality:** Infrastructure, community needs, budget constraints
- **Transport:** Fleet maintenance, traffic regulations, customer service
- **Manufacturing:** Production equipment, market competition, quality standards

The **principles remain the same**, just context changes.
```

### Case Study Design Principles

1. **Relatable Characters:** People learners can identify with
2. **Real Tensions:** Genuine conflicts and trade-offs
3. **Multiple Valid Perspectives:** No single "right" answer
4. **Rich Context:** Enough detail for meaningful analysis
5. **Adaptable:** Can connect to learner's workplace
6. **Progressive Complexity:** Reveals new layers as learners progress

---

## 6.8 Facilitator Playbooks

### Purpose

Facilitator playbooks guide Claude on how to facilitate each module. They provide:
- Facilitation flow and phases
- Key questions to ask
- What to listen for in responses
- When and how to scaffold
- When to celebrate insights
- When to move forward

### Example Playbook

```markdown
# Facilitator Playbook: GFMAM 311 - Organisational Context

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
   What's different about how Lena and Thandi can respond to each?"

**If learner struggles:**
→ Use scaffolding strategies (see scaffolding-strategies.md)

**Celebrate Insight:**
When learner articulates the distinction: "You've just discovered one of 
the most important concepts in asset management! The distinction between 
internal and external factors. Well done!"

---

### Phase 3: Application to Workplace (Messages 16-25)

**Your Role:** Help learner connect to their context

**Key Question:**
"Thinking about your own workplace, can you identify some internal and 
external factors that affect your organisation?"

**What to Listen For:**
- Accurate classification
- Specific examples
- Understanding of controllability
- Connection to decision-making

**Competency Assessment:**
If learner can:
- Identify 3+ internal factors correctly
- Identify 3+ external factors correctly
- Explain why each is classified that way
- Discuss implications for decisions

→ Mark Competency 1 as COMPETENT

---

### Phase 4: Stakeholder Analysis (Messages 26-35)

**Your Role:** Introduce competing interests

**Transition:**
"Now that we understand internal and external factors, let's look at 
another complexity: different people have different needs."

**Key Question:**
"In the bakery, Lena, Thandi, and Jacob all want the business to succeed. 
But do they all want the same things? What might be different about their 
priorities?"

[Continue with similar detail...]

---

## Scaffolding When Stuck

**Level 1: Gentle Nudge**
"Think about what the bakery owners can directly change..."

**Level 2: Concrete Example**
"The oven breaking is something they can fix. The supermarket opening 
is something that just happened. What's different about these two?"

**Level 3: Direct Guidance**
"Some factors are internal (inside the business, they control). Some 
are external (outside forces, they must respond to). The oven is 
internal. The supermarket is external. Can you see the pattern?"

---

## Common Misconceptions

1. **"External = bad, internal = good"**
   Correction: External factors can be opportunities (new regulations 
   that competitors can't meet). Internal factors can be problems 
   (toxic culture).

2. **"We can control external factors if we try hard enough"**
   Correction: We can RESPOND to external factors, but we can't 
   control them. That's what makes them external.

3. **"Purpose is just a mission statement"**
   Correction: Purpose guides daily decisions, not just wall posters.
```

---

## 6.9 AI Learner Facilitation

### System Prompt Construction

```typescript
function buildFacilitatorSystemPrompt(context: FacilitationContext): string {
  return `You are an AI facilitator for Asset Management University.

╔══════════════════════════════════════════════════════════════╗
UBUNTU PHILOSOPHY
╚══════════════════════════════════════════════════════════════╝

"I am because we are." You embody Ubuntu in every interaction. You guide, 
you don't teach. You ask questions that help learners discover concepts 
themselves. You celebrate insights. You scaffold when needed.

Your role is to help ${context.learnerName} develop CAPABILITY - the 
ability to DO things, not just know things.

╔══════════════════════════════════════════════════════════════╗
LEARNER PROFILE
╚══════════════════════════════════════════════════════════════╝

${context.learnerProfile}

╔══════════════════════════════════════════════════════════════╗
CURRENT LEARNING CONTEXT
╚══════════════════════════════════════════════════════════════╝

${context.courseContext}

╔══════════════════════════════════════════════════════════════╗
CONVERSATION HISTORY
╚══════════════════════════════════════════════════════════════╝

${context.conversationSummaries}

╔══════════════════════════════════════════════════════════════╗
CURRENT COMPETENCY FOCUS
╚══════════════════════════════════════════════════════════════╝

${context.competencyContext}

╔══════════════════════════════════════════════════════════════╗
FACILITATOR PLAYBOOK
╚══════════════════════════════════════════════════════════════╝

${context.facilitatorPlaybook}

Discovery Questions to Guide Thinking:
${context.discoveryQuestions.map(q => `• ${q}`).join('\n')}

Scaffolding Strategies (use when stuck):
${context.scaffoldingStrategies.map(s => `• ${s}`).join('\n')}

Common Misconceptions to Watch For:
${context.commonMisconceptions.map(m => `• ${m}`).join('\n')}

╔══════════════════════════════════════════════════════════════╗
FACILITATION GUIDELINES
╚══════════════════════════════════════════════════════════════╝

DO:
✓ Ask questions that prompt thinking
✓ Use the case study and learner's workplace context
✓ Celebrate when they discover concepts: "You've just identified X!"
✓ Scaffold when struggling (use strategies above)
✓ Keep responses focused (100-300 words typically)
✓ Adapt language to their level
✓ Be warm, encouraging, and patient

DON'T:
✗ Lecture or explain concepts directly
✗ Give answers without prompting discovery first
✗ Move too fast when they're struggling
✗ Use jargon they haven't learned
✗ Be condescending or patronising

RESPONSE FORMAT:
- Acknowledge what they said
- Build on their thinking
- Ask ONE question to guide them forward
- Keep it conversational`;
}
```

### Adaptive Question Patterns

```javascript
const QUESTION_PATTERNS = {
  
  // Pattern 1: Open Exploration
  openingQuestion: [
    "What challenges do you notice they're facing?",
    "Looking at this situation, what stands out to you?",
    "What do you think is happening here?"
  ],
  
  // Pattern 2: Compare-and-Contrast
  differentiatingQuestion: [
    "How are the external pressures different from internal problems?",
    "What's the difference between things they can control and things they can't?",
    "Which challenges come from outside vs. inside the bakery?"
  ],
  
  // Pattern 3: Apply-to-Context
  personalisationQuestion: [
    "Can you think of external factors affecting your workplace?",
    "What internal challenges does your organisation face?",
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
    "Perfect! You're seeing the pattern of organisational purpose!"
  ]
};
```

### Emotional Intelligence

```javascript
const EMOTIONAL_RESPONSES = {
  
  frustration_detected: `I can sense this is challenging. That's actually 
    a good sign - it means you're working at the edge of your understanding. 
    Let's slow down and try a different angle.`,
  
  confusion_detected: `No problem - this concept trips up many people at first. 
    Let me approach it differently...`,
  
  confidence_low: `You're doing better than you think! Look at what you've 
    already identified: [list their correct observations]. That's real progress.`,
  
  breakthrough_moment: `YES! That's exactly it! You've just had a genuine 
    insight into [concept]. This is what learning feels like!`,
  
  struggling_extended: `Learning new concepts can be challenging, and that's 
    completely normal. Let's try a different approach.`,
  
  normalise: `You're asking great questions, which shows you're thinking 
    deeply. It's okay to struggle with this - that's how real learning happens.`,
  
  offer_break: `We've been working hard! Would you like to take a break 
    and come back to this later? Your brain might make connections while 
    you rest.`
};
```

---

## 6.10 Assessment and Grading

### Evidence Sources

**Competency evidence comes from:**

| Source | Weight | What It Shows |
|--------|--------|---------------|
| Conversation | 70% | Questions asked, insights demonstrated, connections made, application to context |
| Assignment | 25% | Workplace application, analysis quality, practical understanding |
| Self-Reflection | 5% | Metacognitive awareness, understanding of own development |

### Real-Time Competency Detection

```typescript
async function detectCompetencyEvidence(
  conversationId: string,
  messageId: string,
  learnerMessage: string
): Promise<CompetencyEvidence> {
  
  const conversation = await getConversation(conversationId);
  const enrollment = await getEnrollment(conversation.conversation_enrollment_id);
  const currentCompetency = await getCurrentCompetency(enrollment);
  
  // Ask Claude to assess evidence
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Assess this learner response for competency evidence.

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
  
  // Store evidence
  if (evidence.evidence_level !== 'none') {
    await storeCompetencyEvidence(conversationId, messageId, evidence);
  }
  
  return evidence;
}
```

### Assignment Grading

```typescript
async function gradeAssignment(assignmentId: string): Promise<AssignmentGrade> {
  
  const assignment = await getAssignment(assignmentId);
  const competency = await getCompetency(assignment.assignment_competency_id);
  
  // Get conversation context
  const conversationEvidence = await getConversationEvidence(
    assignment.assignment_enrollment_id,
    competency.competency_id
  );
  
  // Grade with Claude
  const grading = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Grade this assignment for competency demonstration.

COMPETENCY: ${competency.competency_title}
${competency.competency_description}

EVIDENCE CRITERIA:
${competency.competency_evidence_criteria.map(c => `• ${c}`).join('\n')}

CONVERSATION CONTEXT:
The learner has shown ${conversationEvidence.level} understanding in our conversations.
Key insights demonstrated: ${conversationEvidence.insights.join(', ')}

ASSIGNMENT SUBMISSION:
${assignment.assignment_content}

WORKPLACE CONTEXT:
${assignment.assignment_workplace_context}

Grade this submission. Focus on CAPABILITY - can they DO this in their workplace?

Respond with JSON:
{
  "overall_grade": "not_yet" | "developing" | "competent",
  "criteria_assessment": {
    "criterion_name": { "met": true/false, "evidence": "quote" }
  },
  "strengths": ["strength 1", "strength 2"],
  "development_areas": ["area 1", "area 2"],
  "feedback": "Detailed developmental feedback (3-4 paragraphs)",
  "next_steps": "What to do to improve"
}`
      }
    ]
  });
  
  const grade = JSON.parse(grading.content[0].text);
  
  // Store grade
  await updateAssignment(assignmentId, {
    assignment_status: 'graded',
    assignment_graded_date: new Date(),
    assignment_grade: grade.overall_grade,
    assignment_feedback: grade.feedback,
    assignment_strengths: grade.strengths,
    assignment_development_areas: grade.development_areas
  });
  
  return grade;
}
```

### Plagiarism Detection

```typescript
async function checkForPlagiarism(assignmentId: string): Promise<PlagiarismCheck> {
  
  const assignment = await getAssignment(assignmentId);
  
  // 1. Check against other submissions
  const similarSubmissions = await findSimilarAssignments(
    assignment.assignment_content,
    assignment.assignment_competency_id
  );
  
  // 2. Check writing style consistency with conversations
  const conversationStyle = await getConversationWritingStyle(
    assignment.assignment_user_id
  );
  
  const styleConsistent = await compareWritingStyles(
    assignment.assignment_content,
    conversationStyle
  );
  
  // 3. Check vocabulary level
  const conversationVocab = await getConversationVocabulary(
    assignment.assignment_user_id
  );
  
  const vocabConsistent = compareVocabularyLevels(
    assignment.assignment_content,
    conversationVocab
  );
  
  // Calculate risk
  const risk = calculatePlagiarismRisk({
    similarSubmissions,
    styleConsistent,
    vocabConsistent
  });
  
  if (risk.level === 'high') {
    // Verify through conversation - never accuse
    await initiateVerificationConversation(assignmentId, risk);
    return { flagged: true, risk };
  }
  
  return { flagged: false, risk };
}
```

---

## 6.11 AI-as-Learner Testing

### Why AI Testing?

**The Problem:** New educational content may have:
- Unclear instructions
- Missing context
- Logical gaps in discovery process
- Assumptions about prior knowledge
- Culturally inappropriate examples
- Scaffolding that doesn't work

**Traditional Solution:** Release to humans, get feedback, fix iteratively
**Problem:** Real learners experience poor quality first

**AMU Solution:** AI learners test ALL content BEFORE any human sees it

### Six AI Learner Personas

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
        "Sceptical of 'theory' - wants practical value"
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
      background: "Small business owner - operates vehicle maintenance workshop",
      education: "Matric, business short courses",
      learning_style: "Entrepreneurial, wants applicable knowledge, time-constrained",
      experience_level: "Intermediate - practical expertise, limited formal knowledge",
      workplace: "Own workshop - 8 employees",
      challenges: [
        "Limited time for learning",
        "Wants immediate application to business",
        "May struggle with abstract concepts",
        "Needs clear return on investment"
      ]
    },
    testing_value: "Tests business applicability, time efficiency, practical value proposition"
  },
  
  persona_4: {
    name: "Sipho",
    profile: {
      language: "English, Sesotho",
      location: "Bloemfontein, Free State, South Africa",
      background: "Transport company foreman, aspiring to management",
      education: "N4 Business Management",
      learning_style: "Steady, thorough, needs reassurance",
      experience_level: "Beginner-Intermediate - some formal knowledge, growing practical experience",
      workplace: "Provincial bus company - Fleet maintenance",
      challenges: [
        "Lacks confidence in academic settings",
        "Needs encouragement",
        "Benefits from repetition",
        "May not ask for help"
      ]
    },
    testing_value: "Tests emotional intelligence of facilitation, scaffolding quality, encouragement patterns"
  },
  
  persona_5: {
    name: "Priya",
    profile: {
      language: "English",
      location: "Mumbai, India",
      background: "Asset management consultant, seeking global certification",
      education: "MBA, engineering background",
      learning_style: "Efficient, strategic, knows what she wants",
      experience_level: "Advanced - extensive professional experience",
      workplace: "International consulting firm",
      challenges: [
        "May find content too basic",
        "Wants international applicability",
        "Time is extremely limited",
        "High expectations for quality"
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

### Testing Process

```javascript
async function runAILearnerTest(moduleId: string, testType: string): Promise<TestResult> {
  
  const testRunId = generateId('aitest');
  const module = await getModule(moduleId);
  const results: PersonaTestResult[] = [];
  
  for (const persona of Object.values(AI_LEARNER_PERSONAS)) {
    // Create test conversation
    const conversationId = await createTestConversation(moduleId, persona);
    
    // Simulate learning journey
    let messageCount = 0;
    let completed = false;
    let issues: Issue[] = [];
    
    while (!completed && messageCount < 100) {
      // Generate learner message based on persona
      const learnerMessage = await generatePersonaMessage(
        persona,
        conversationId,
        module
      );
      
      // Get facilitator response
      const facilitatorResponse = await facilitateLearning(
        conversationId,
        learnerMessage
      );
      
      // Check for issues
      const responseIssues = await analyseResponseQuality(
        persona,
        learnerMessage,
        facilitatorResponse
      );
      
      issues.push(...responseIssues);
      messageCount++;
      
      // Check if competencies achieved
      completed = await checkCompetenciesAchieved(conversationId);
    }
    
    results.push({
      persona: persona.name,
      completed,
      messageCount,
      issues,
      competencies: await getCompetencyStatus(conversationId)
    });
  }
  
  // Generate test report
  return generateTestReport(testRunId, moduleId, results);
}
```

### Quality Metrics

```javascript
const QUALITY_METRICS = {
  
  // All personas must complete
  completion_rate: {
    target: 100,
    metric: "% of personas achieving all competencies"
  },
  
  // Should be efficient
  average_messages: {
    target: 30,
    metric: "Average messages to competency"
  },
  
  // Must be accessible
  accessibility_score: {
    target: 90,
    metric: "% of messages understood by all personas"
  },
  
  // Must be engaging
  engagement_score: {
    target: 85,
    metric: "% of interactions rated positive"
  },
  
  // Must scaffold effectively
  scaffolding_effectiveness: {
    target: 95,
    metric: "% of struggles resolved within 3 scaffolding attempts"
  }
};
```

---

## 6.12 Content Improvement Cycle

### Continuous Improvement Process

```
1. AI Testing (before release)
   ↓
2. Human Learner Usage (after release)
   ↓
3. Feedback Analysis (ongoing)
   ↓
4. Issue Identification (Claude analyses patterns)
   ↓
5. Improvement Proposal (Claude drafts)
   ↓
6. Human Review (board approves)
   ↓
7. Implementation (content updated)
   ↓
8. AI Testing (verify improvement)
   ↓
9. Release (to learners)
```

### Feedback Sources

| Source | What It Shows |
|--------|---------------|
| Conversation patterns | Where learners struggle, what works |
| Completion rates | Which modules are problematic |
| Time to competency | Efficiency of content |
| Learner satisfaction | Quality of experience |
| Direct feedback | Specific issues and suggestions |
| Drop-off points | Where learners abandon |

### Claude's Improvement Role

Claude autonomously:
1. Identifies patterns in learner struggles
2. Drafts content improvements
3. Tests improvements with AI learners
4. Proposes changes via Pull Request
5. Implements after board approval

This creates a living curriculum that improves with every cohort.

---

## Section 6 Summary

This section establishes AMU's complete content architecture:

**Educational Philosophy:**
- Problem-based discovery learning
- Socratic facilitation (ask, don't tell)
- Competency-based assessment (not grades)
- Step 0: Always start with learner needs

**Content Structure:**
- GitHub-based content management (public repository)
- Two frameworks: GFMAM (international) and QCTO (SETA-registered)
- Modular design with required content files
- Version control and community contributions

**Course Portfolio:**
- 39 GFMAM subjects across 6 groups
- QCTO Maintenance Planning qualification (120 credits, NQF Level 5)
- Progressive development priorities

**Module Components:**
- module.json (metadata and configuration)
- Case studies (problem scenarios)
- Facilitator playbooks (how Claude facilitates)
- Discovery questions, scaffolding strategies, misconceptions

**AI Facilitation:**
- Rich system prompts with learner context
- Adaptive questioning patterns
- Emotional intelligence responses
- Real-time competency detection

**Quality Assurance:**
- AI-as-learner testing (6 personas)
- Before content reaches humans
- Continuous improvement cycle
- Claude drafts improvements, board approves

This architecture enables AMU to deliver world-class education that improves with every learner.

---

**End of Section 6**
