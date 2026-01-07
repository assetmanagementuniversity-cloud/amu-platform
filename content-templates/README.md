# AMU Content Repository Templates

This folder contains templates for the **amu-content** GitHub repository structure.

## Overview

Per AMU Platform Specification Section 6.3, course content is stored in a separate public GitHub repository. This allows:

- Version control of educational content
- Community contributions
- Separation of content from platform code
- Easy content updates without code deployments

## Repository Structure

```
amu-content/
├── README.md
├── CONTRIBUTING.md
├── LICENSE.md
├── CODE_OF_CONDUCT.md
├── .github/
│   └── workflows/
│       └── deploy-to-production.yml    # Auto-deploys on push to main
├── courses/
│   └── gfmam/
│       └── 311-organisational-context/
│           ├── module.json             # Module metadata
│           ├── competencies.json       # Competency definitions
│           ├── case-study.md           # South African case study
│           ├── discovery-questions.md  # Socratic dialogue questions
│           ├── scaffolding-strategies.md # Support for struggling learners
│           └── common-misconceptions.md  # Errors to address
├── email-templates/
│   ├── welcome.md
│   ├── certificate-ready.md
│   └── seta-approved.md
└── ui-text/
    └── messages.json                   # UI messages and labels
```

## File Specifications

### module.json
Contains module metadata:
- `module_id`: Unique identifier (e.g., "311-organisational-context")
- `module_title`: Display title
- `module_description`: Brief description
- `module_version`: Semantic version (e.g., "1.0.0")
- `module_last_updated`: ISO date
- `module_estimated_duration_minutes`: Expected completion time
- `module_nqf_level`: National Qualifications Framework level (1-10)
- `module_credits`: SAQA credits
- `module_learning_outcomes`: Array of learning outcomes

### competencies.json
Defines assessable competencies:
- `competency_id`: Unique identifier
- `competency_title`: Short title
- `competency_description`: Full description
- `competency_indicators`: Observable behaviours at different levels
- `competency_related_outcomes`: Links to learning outcomes

### case-study.md
South African workplace scenario:
- Real-world context (mining, manufacturing, utilities, etc.)
- Stakeholder complexity
- Discussion points
- Key learnings

### discovery-questions.md
Questions for AI-facilitated Socratic dialogue:
- Opening questions to connect to experience
- Topic-specific exploration questions
- Follow-up prompts
- Facilitator notes

### scaffolding-strategies.md
Support strategies for struggling learners:
- Trigger signs (how to recognise struggle)
- Scaffolding approaches
- Example dialogues
- Ubuntu-aligned support

### common-misconceptions.md
Frequently misunderstood concepts:
- What learners typically say
- Why it's incomplete/incorrect
- Correction approach
- Example dialogue

## Content Guidelines

### Ubuntu Philosophy
- Learning is a journey, not a destination
- Recognise existing knowledge and experience
- Create safe spaces for uncertainty
- Celebrate questions as much as answers

### South African Context
- Use local examples (Mzansi, not generic "XYZ Corp")
- Reference relevant regulations (OHSA, MHSA, Environmental Acts)
- Include diverse stakeholder perspectives
- Acknowledge local challenges and opportunities

### Assessment Approach
Three competency levels only:
- **Competent**: Demonstrates full understanding and application
- **Developing**: Shows partial understanding, needs refinement
- **Not Yet**: Needs further learning before competency is achieved

No numeric scores. No pass/fail. Progress at own pace.

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make changes following the templates
4. Submit a pull request
5. Content team reviews and merges

## Deployment

On push to `main` branch:
1. GitHub Action validates JSON files
2. Validates required markdown files exist
3. Notifies AMU Platform to refresh cache
4. Content available within 5 minutes

## Questions?

Contact the AMU Content Team at content@amu.ac.za

---

**Ubuntu - I am because we are**
