// Mock course data for AMU Platform
// Based on GFMAM (Global Forum on Maintenance and Asset Management) competency framework
// Brand Voice (Section 9.6): Empowering, Honest, and Warm
// Tone (Section 9.7): Empowering and Evidence-based

export interface Course {
  id: string;
  code: string;
  title: string;
  tagline: string;
  description: string;
  overview: string;
  welcomeMessage: string;
  duration: string;
  modules: number;
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  category: string;
  prerequisites?: string[];
  learningOutcomes: string[];
  enrolled?: boolean;
  progress?: number;
}

export const mockCourses: Course[] = [
  {
    id: 'gfmam-311',
    code: 'GFMAM 311',
    title: 'Foundations of Asset Management',
    tagline: 'Develop the capability to create enduring value.',
    description:
      'Asset management is not just about maintaining machines; it is about developing the capability to achieve what you yearn for. In this foundational module, we explore the GFMAM standards through a lens of lifecycle thinking. You will learn how proper planning and maintenance create the infrastructure that serves our communities. You can master the skills required to make a meaningful difference that endures.',
    overview:
      'This foundational course introduces you to the globally recognised GFMAM Asset Management Landscape, which defines 39 subjects across 6 subject groups. You will explore how organisations worldwide—from municipal water utilities to national rail networks—have transformed their operations through systematic asset management. The ISO 55000 family of standards, adopted by over 50 countries, provides the framework we use to structure your learning. By understanding these principles, you join a global community of practitioners committed to creating value that endures across generations.',
    welcomeMessage:
      'Welcome to GFMAM 311: Foundations of Asset Management. I am here to think with you about the foundations of asset management.\n\nTogether, we will explore what it truly means to manage assets—not just as physical things, but as the means through which we serve our communities and create lasting value.\n\nLet us begin with a question: When you hear the term "asset management," what comes to mind for you?',
    duration: '8 hours',
    modules: 6,
    level: 'Foundation',
    category: 'Asset Management Fundamentals',
    learningOutcomes: [
      'Understand the 39 subjects of the GFMAM Asset Management Landscape',
      'Explain the structure and intent of ISO 55000, ISO 55001, and ISO 55002',
      'Identify how asset management creates value for organisations and communities',
      'Describe the relationship between assets, asset systems, and asset portfolios',
      'Apply the fundamentals of lifecycle thinking to real-world scenarios',
      'Recognise the roles and responsibilities within an asset management system',
    ],
  },
  {
    id: 'gfmam-312',
    code: 'GFMAM 312',
    title: 'Asset Management Strategy and Planning',
    tagline: 'Shape the future through purposeful decision-making.',
    description:
      'Every great achievement begins with a clear vision. This module empowers you to craft strategies that align your organisation with its deepest aspirations. You will discover how thoughtful planning transforms reactive maintenance into proactive stewardship. Together, we build the frameworks that turn good intentions into lasting outcomes. You can lead with confidence when your strategy is sound.',
    overview:
      'Strategic asset management transforms how organisations deliver value. Research by the Institute of Asset Management demonstrates that organisations with mature asset management practices achieve 15-25% reductions in total cost of ownership while improving service reliability. This course guides you through developing a Strategic Asset Management Plan (SAMP) that connects your organisational objectives to the assets that deliver them. You will learn from case studies spanning infrastructure, utilities, and manufacturing sectors, understanding how leaders align long-term vision with day-to-day decisions.',
    welcomeMessage:
      'Welcome to GFMAM 312: Asset Management Strategy and Planning. I am here to guide you through the art and science of strategic thinking.\n\nStrategy is about making choices—choosing what to do, and equally important, what not to do. In this module, we will develop your capability to craft strategies that truly serve your organisation and its stakeholders.\n\nTo begin our journey together: What does "strategy" mean in your current role? How do you see it connecting to the assets you work with?',
    duration: '12 hours',
    modules: 8,
    level: 'Intermediate',
    category: 'Strategy and Planning',
    prerequisites: ['GFMAM 311'],
    learningOutcomes: [
      'Develop an Asset Management Policy aligned with ISO 55001 requirements',
      'Create a Strategic Asset Management Plan (SAMP) linking objectives to assets',
      'Apply the line-of-sight principle from organisational goals to operational activities',
      'Establish governance structures that enable effective decision-making',
      'Design performance measurement frameworks using leading and lagging indicators',
      'Integrate asset management with enterprise risk and financial planning',
      'Facilitate stakeholder engagement in strategic planning processes',
    ],
  },
  {
    id: 'gfmam-313',
    code: 'GFMAM 313',
    title: 'Lifecycle Delivery and Maintenance',
    tagline: 'Nurture assets from creation to renewal.',
    description:
      'Assets, like all things, have a lifecycle. Understanding this journey allows you to make decisions that honour both present needs and future possibilities. In this module, you will learn to see maintenance not as a cost, but as an investment in reliability and trust. From acquisition to renewal, you can guide assets through their lifecycle with wisdom and care.',
    overview:
      'The lifecycle of an asset—from concept through disposal—presents countless opportunities to optimise value. Studies show that 80% of an asset\'s total cost of ownership is determined by decisions made in the first 20% of its life. This course equips you with proven methodologies including Reliability-Centred Maintenance (RCM), which has reduced maintenance costs by 40-70% in sectors from aviation to power generation. You will master techniques for capital planning, operations optimisation, and end-of-life decision-making that balance technical, financial, and social considerations.',
    welcomeMessage:
      'Welcome to GFMAM 313: Lifecycle Delivery and Maintenance. I am here to explore with you the journey that every asset takes—from its first conception to its eventual renewal or retirement.\n\nMaintenance is often seen as a cost to be minimised. Together, we will discover how it can become a powerful tool for creating value and building trust with the communities we serve.\n\nLet me ask you: Think of an asset you know well. What stage of its lifecycle is it in, and what challenges does that stage present?',
    duration: '16 hours',
    modules: 10,
    level: 'Intermediate',
    category: 'Lifecycle Management',
    prerequisites: ['GFMAM 311'],
    learningOutcomes: [
      'Apply Total Cost of Ownership (TCO) analysis to acquisition decisions',
      'Implement Reliability-Centred Maintenance (RCM) methodology',
      'Select optimal maintenance strategies: preventive, predictive, and condition-based',
      'Calculate and interpret Overall Equipment Effectiveness (OEE) metrics',
      'Develop asset renewal and capital investment programmes',
      'Manage asset disposal considering environmental and social responsibilities',
      'Optimise the balance between maintenance, renewal, and operational costs',
      'Apply failure mode analysis to improve asset reliability',
    ],
  },
  {
    id: 'gfmam-314',
    code: 'GFMAM 314',
    title: 'Risk and Performance Management',
    tagline: 'Balance uncertainty with informed courage.',
    description:
      'Risk is not something to fear; it is something to understand. This module equips you with the tools to navigate uncertainty while maintaining the performance your stakeholders depend upon. You will learn to see risk as a dialogue between possibility and preparedness. With this knowledge, you can make decisions that protect what matters most while pursuing meaningful progress.',
    overview:
      'Effective risk management is the cornerstone of resilient asset systems. ISO 31000 provides an internationally recognised framework that integrates with ISO 55001 to create robust decision-making processes. This advanced course teaches you to quantify and communicate risk in terms stakeholders understand—whether financial, safety, environmental, or reputational. You will explore techniques from fault tree analysis to Monte Carlo simulation, learning when each tool adds value. Case studies from critical infrastructure sectors demonstrate how leading organisations balance acceptable risk with performance expectations.',
    welcomeMessage:
      'Welcome to GFMAM 314: Risk and Performance Management. I am here to help you develop a deeper relationship with uncertainty—not to eliminate it, but to understand and work with it wisely.\n\nRisk is inherent in everything we do. The question is not whether we face risk, but how we choose to respond to it. In this advanced module, we will build your capability to make decisions that balance protection with progress.\n\nTo start our conversation: What does "risk" mean in your organisation? Is it something to be avoided, or something to be managed?',
    duration: '14 hours',
    modules: 9,
    level: 'Advanced',
    category: 'Risk Management',
    prerequisites: ['GFMAM 311', 'GFMAM 312'],
    learningOutcomes: [
      'Apply ISO 31000 risk management principles within an asset management context',
      'Conduct quantitative and qualitative asset risk assessments',
      'Develop risk-based inspection and maintenance programmes',
      'Implement condition monitoring to enable predictive maintenance',
      'Create risk registers and treatment plans for asset portfolios',
      'Balance risk, cost, and performance using multi-criteria decision analysis',
      'Communicate risk effectively to technical and non-technical stakeholders',
      'Establish key risk indicators (KRIs) for continuous monitoring',
    ],
  },
  {
    id: 'gfmam-315',
    code: 'GFMAM 315',
    title: 'Asset Information and Data Management',
    tagline: 'Transform data into wisdom for better decisions.',
    description:
      'In a world rich with information, the challenge is not gathering data but making it meaningful. This module helps you build the systems and practices that turn raw numbers into actionable insights. You will discover how quality information empowers teams to work smarter, not harder. You can create an environment where every decision is supported by the truth your data reveals.',
    overview:
      'Quality asset information is the foundation of every good decision. Research indicates that poor data quality costs organisations 15-25% of their operating budgets through inefficient decisions and rework. This course introduces you to asset information standards including ISO 55000\'s requirements and the ISO 8000 data quality framework. You will learn to design information architectures that serve both operational and strategic needs, implementing master data management practices that ensure consistency across your organisation. From asset registers to predictive analytics, you will build the capability to harness data as a strategic asset.',
    welcomeMessage:
      'Welcome to GFMAM 315: Asset Information and Data Management. I am here to explore with you how information—when managed well—becomes the foundation for every good decision.\n\nWe live in a world overflowing with data. The challenge is not collecting more, but making what we have meaningful and trustworthy. Together, we will build your capability to create information systems that truly serve your organisation.\n\nLet us begin: How would you describe the quality of asset information in your organisation today? What decisions does it support well, and where does it fall short?',
    duration: '10 hours',
    modules: 7,
    level: 'Intermediate',
    category: 'Information Management',
    prerequisites: ['GFMAM 311'],
    learningOutcomes: [
      'Define asset information requirements aligned with ISO 55001 clause 7.5',
      'Implement data quality management using ISO 8000 principles',
      'Design asset hierarchies and classification systems',
      'Select and configure Computerised Maintenance Management Systems (CMMS)',
      'Integrate asset data across enterprise systems (ERP, GIS, SCADA)',
      'Apply data analytics to identify patterns and predict asset behaviour',
      'Establish data governance frameworks and stewardship roles',
      'Measure and report on asset information quality and maturity',
    ],
  },
];

// Helper function to get course by ID
export function getCourseById(id: string): Course | undefined {
  return mockCourses.find((course) => course.id === id);
}

// Helper function to get courses by level
export function getCoursesByLevel(level: Course['level']): Course[] {
  return mockCourses.filter((course) => course.level === level);
}

// Helper function to get courses by category
export function getCoursesByCategory(category: string): Course[] {
  return mockCourses.filter((course) => course.category === category);
}

// Get unique categories
export function getCategories(): string[] {
  return [...new Set(mockCourses.map((course) => course.category))];
}

// Get unique levels
export function getLevels(): Course['level'][] {
  return ['Foundation', 'Intermediate', 'Advanced'];
}
