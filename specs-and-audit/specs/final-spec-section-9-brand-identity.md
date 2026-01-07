# AMU LMS TECHNICAL SPECIFICATION
## Section 9: Brand Identity

**Status:** Development Ready  
**Version:** 1.0  
**Last Updated:** December 2024  
**Document Type:** Technical Specification

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | Claude | Initial creation from AMU brand guidelines |

**Related Documents:**
- Section 4: System Architecture and Governance
- Section 5: Technical Implementation
- Section 8: MVP Scope and Success Metrics

---

## Table of Contents

9.1 Brand Identity  
9.2 Colour Palette  
9.3 Typography  
9.4 Logo Usage  
9.5 Layout Guidelines  
9.6 Brand Voice  
9.7 Writing Guidelines  
9.8 Language Standard  

---

## 9.1 Brand Identity

### Logo Concept

Asset Management University uses a **bridge icon** as its logo.

**Symbolism:**
- **Bridging the gap** - Making asset management education accessible to everyone
- **Asset management in action** - Bridges exemplify proper planning, maintenance, and lifecycle thinking
- **Enduring infrastructure** - Demonstrates how asset management creates structures that serve communities

### Taglines

| Tagline | Purpose |
|---------|---------|
| **"Develop Capability"** | Our method: building the skills people need to achieve what they desire |
| **"You can."** | Our message: affirming that capability is within everyone's reach |

---

## 9.2 Colour Palette

### Primary Colours

```css
/* Primary - Navy Blue */
--amu-navy: #0A2F5C;
/* RGB: 10, 47, 92 */
/* Use for: logos, headings, strong visual anchors */

/* Base Background - Pure White */
--amu-white: #FFFFFF;
/* RGB: 255, 255, 255 */
/* Use for: all backgrounds to maximise clarity */
```

### Secondary Colours

```css
/* Accent - Slate Blue */
--amu-slate: #5D7290;
/* RGB: 93, 114, 144 */
/* Use for: quotes, icons, highlight borders (subtle contrast) */

/* Highlight Area - Light Sky Blue */
--amu-sky: #D9E6F2;
/* RGB: 217, 230, 242 */
/* Use for: highlight boxes, labels */
/* Pair with Slate Blue border for subtle emphasis */
/* Pair with Navy Blue border for strong emphasis */

/* Text - Charcoal Grey */
--amu-charcoal: #2F2F2F;
/* RGB: 47, 47, 47 */
/* Use for: all paragraph and body text */
```

### Colour Usage Summary

| Colour | Hex | Usage |
|--------|-----|-------|
| Navy Blue | `#0A2F5C` | Logos, headings, primary buttons, strong emphasis |
| Pure White | `#FFFFFF` | Backgrounds, text on dark backgrounds |
| Slate Blue | `#5D7290` | Quotes, icons, subtle borders, secondary text |
| Light Sky Blue | `#D9E6F2` | Highlight boxes, labels, subtle backgrounds |
| Charcoal Grey | `#2F2F2F` | Body text, paragraphs |

### CSS Variables

```css
:root {
  /* Brand colours */
  --color-primary: #0A2F5C;
  --color-background: #FFFFFF;
  --color-accent: #5D7290;
  --color-highlight: #D9E6F2;
  --color-text: #2F2F2F;
  
  /* Semantic aliases */
  --color-heading: var(--color-primary);
  --color-body: var(--color-text);
  --color-quote: var(--color-accent);
  --color-box-background: var(--color-highlight);
  --color-border-subtle: var(--color-accent);
  --color-border-strong: var(--color-primary);
}
```

---

## 9.3 Typography

### Font Stack

| Font | Usage | Fallback |
|------|-------|----------|
| **Montserrat** | Titles, headings | `'Montserrat', sans-serif` |
| **Poppins** | Callouts, quotes | `'Poppins', sans-serif` |
| **Open Sans** | Body text | `'Open Sans', sans-serif` |
| **Roboto** | System/Google tools, footers | `'Roboto', sans-serif` |

### Type Hierarchy

| Element | Font | Size | Weight | Colour |
|---------|------|------|--------|--------|
| Main Title | Montserrat | 24pt | Regular | Navy Blue |
| Section Heading | Montserrat | 18pt | Regular | Navy Blue |
| Callouts/Quotes | Poppins | 13pt | Italic | Slate Blue |
| Body Text | Open Sans | 12pt | Regular | Charcoal Grey |
| Footer | Roboto | 10pt | Regular | Charcoal Grey |

### CSS Implementation

```css
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Open+Sans:wght@400;600&family=Poppins:ital,wght@0,400;1,400&family=Roboto:wght@400&display=swap');

/* Typography classes */
.amu-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 24pt;
  font-weight: 400;
  color: #0A2F5C;
}

.amu-heading {
  font-family: 'Montserrat', sans-serif;
  font-size: 18pt;
  font-weight: 400;
  color: #0A2F5C;
}

.amu-callout {
  font-family: 'Poppins', sans-serif;
  font-size: 13pt;
  font-style: italic;
  color: #5D7290;
}

.amu-body {
  font-family: 'Open Sans', sans-serif;
  font-size: 12pt;
  font-weight: 400;
  color: #2F2F2F;
}

.amu-footer {
  font-family: 'Roboto', sans-serif;
  font-size: 10pt;
  font-weight: 400;
  color: #2F2F2F;
}
```

---

## 9.4 Logo Usage

### Logo Versions

Four logo versions are available:

| Version | Filename | Usage |
|---------|----------|-------|
| Standard with tagline | `Logo_with_slogan.png` | Primary use - headers, documents |
| Standard icon only | `Logo_only.png` | Favicon, small spaces |
| Inverted with tagline | `Logo_with_slogan__colours_inverted_.png` | On navy blue backgrounds |
| Inverted icon only | `Logo_only__colours_inverted_.png` | On dark surfaces |

### Usage Guidelines

**Standard versions** (Navy blue bridge on white/transparent):
- Use on white or light backgrounds
- Primary choice for most applications

**Inverted versions** (White bridge on navy blue):
- Use on navy blue backgrounds
- Use on dark surfaces or images

### Clear Space

Maintain clear space around the logo equal to the height of the bridge arch on all sides.

### Minimum Size

- Logo with tagline: Minimum 150px width
- Logo icon only: Minimum 32px width

---

## 9.5 Layout Guidelines

### Header Style

```css
.amu-header {
  background-color: #0A2F5C;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 20pt;
  font-weight: 400;  /* NOT bold */
  text-align: center;
  padding: 1em 0;
  width: 100%;
  margin-bottom: 1.5em;  /* Breathing room after header */
}
```

**Header specifications:**
- Navy Blue background (`#0A2F5C`)
- White text
- Montserrat font, 20pt
- **Not bolded** - use regular weight
- Centre-aligned
- Full width
- Blank line above and below text within header
- Additional spacing after header before content

### Footer Style

```css
.amu-footer-bar {
  background-color: #D9E6F2;
  font-family: 'Roboto', sans-serif;
  font-size: 10pt;
  color: #2F2F2F;
  text-align: center;
  padding: 0.75em 0;
}
```

**Footer content:**
- Tagline: "You can. | assetmanagementuniversity.org"
- Light Sky Blue background (`#D9E6F2`)

### Highlight Boxes

```css
/* Subtle emphasis */
.amu-highlight-subtle {
  background-color: #D9E6F2;
  border: 1px solid #5D7290;
  padding: 1em;
  border-radius: 4px;
}

/* Strong emphasis */
.amu-highlight-strong {
  background-color: #D9E6F2;
  border: 2px solid #0A2F5C;
  padding: 1em;
  border-radius: 4px;
}
```

### Content Structure

- White backgrounds for main content
- Charcoal Grey (`#2F2F2F`) for body text
- Navy Blue (`#0A2F5C`) for headings
- Adequate white space throughout
- Consistent margins and padding

---

## 9.6 Brand Voice

### Core Philosophy

Each person is born to contribute uniquely to the world. When we do what we're born to do, we feel fulfilled.

Asset management is about developing and maintaining the capability to achieve what we yearn for—the functionality to do what we desire. To make a meaningful difference in the world, we need the assistance of people and machines. Intelligent asset management is the foundation that enables us to optimally use the resources available to us, making a meaningful difference that endures.

We believe this capability—these skills—should belong to everyone, not just the privileged few.

### Voice Characteristics

| Attribute | Description |
|-----------|-------------|
| **Empowering** | "You can." - Affirming capability is within reach |
| **Accessible** | Clear language, no unnecessary jargon |
| **Honest** | Understated rather than exaggerated |
| **Warm** | Respectful, encouraging, never condescending |
| **Purpose-driven** | Always connecting to meaningful contribution |

### Tone by Context

| Context | Tone |
|---------|------|
| Learning facilitation | Warm, encouraging, Socratic |
| Marketing | Confident but humble, evidence-based |
| Support | Helpful, patient, solution-focused |
| Corporate communications | Professional, clear, respectful |
| Certificates | Formal, celebratory |

---

## 9.7 Writing Guidelines

### Core Principles

**1. Precision and Truth**
- Every statement must stand to reason whether interpreted literally or figuratively
- Avoid ambiguous language that could mislead
- Ensure claims are defensible and accurate

**2. Build Trust Through Honest, Evidence-Based Communication**
- Never exaggerate - understate rather than overstate
- Every statement must be verifiable using evidence
- If no evidence exists, do not make the statement
- Let quality speak for itself
- Trust is earned through consistency between what we say and what we deliver

**3. Clarity of Purpose**
- Keep AMU's foundational purpose in mind when drafting content
- Connect concepts back to capability development
- Show how skills enable people to achieve what they yearn for

### Do's and Don'ts

| Do | Don't |
|----|-------|
| "Learn asset management for free" | "The world's best asset management education" |
| "70% of learners complete courses" | "Amazing completion rates!" |
| "AI facilitator available 24/7" | "Revolutionary AI technology" |
| "R555 real cost after benefits" | "Almost free!" |
| "Develop the capability to..." | "Become an expert in..." |

---

## 9.8 Language Standard

### UK English Required

**All AMU materials must use UK English spelling and conventions.**

| UK English ✓ | US English ✗ |
|--------------|--------------|
| colour | color |
| organisation | organization |
| programme | program |
| realise | realize |
| analyse | analyze |
| centre | center |
| behaviour | behavior |
| favour | favor |
| honour | honor |
| labour | labor |

### Special Cases

| Word | UK Usage |
|------|----------|
| licence | Noun: "a driving licence" |
| license | Verb: "to license a product" |
| practice | Noun: "best practice" |
| practise | Verb: "to practise a skill" |

### Implementation

```typescript
// ESLint configuration for UK English
// .eslintrc.js
module.exports = {
  rules: {
    // Enforce UK English in comments and strings
    'spellcheck/spell-checker': ['warn', {
      lang: 'en_GB',
      skipWords: ['AMU', 'GFMAM', 'QCTO', 'CHIETA', 'SETA']
    }]
  }
};
```

---

## Section 9 Summary

This section establishes AMU's complete visual and verbal identity:

**Colour Palette:**
- Navy Blue (`#0A2F5C`) - Primary, headings, emphasis
- Pure White (`#FFFFFF`) - Backgrounds
- Slate Blue (`#5D7290`) - Accents, quotes
- Light Sky Blue (`#D9E6F2`) - Highlights
- Charcoal Grey (`#2F2F2F`) - Body text

**Typography:**
- Montserrat - Titles and headings
- Poppins - Callouts and quotes
- Open Sans - Body text
- Roboto - System text and footers

**Logo:**
- Bridge icon symbolising accessibility and asset management excellence
- Four versions for different backgrounds
- Taglines: "Develop Capability" and "You can."

**Voice:**
- Empowering, accessible, honest, warm, purpose-driven
- Evidence-based claims only
- Connect to capability development

**Language:**
- UK English required throughout
- Precision and truth in all statements

---

**End of Section 9**
