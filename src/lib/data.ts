// Site content.
// NOTE: the numbers in `cases` (projects) and `facts` are placeholders. Replace them with
// your real case studies and metrics before the site goes live.

export type MockKind =
  | "code"
  | "design"
  | "ads"
  | "roadmap"
  | "pitch"
  | "chat"
  | "pipeline"
  | "security"
  | "crm"
  | "support";

export type Service = {
  slug: string;
  no: string;
  title: string;
  short: string;
  summary: string;
  description: string;
  mock: MockKind;
  features: { title: string; text: string }[];
  deliverables: string[];
  tools: string[];
  timeline: string;
  faq: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "web-and-mobile-development",
    no: "01",
    title: "Web and mobile development",
    short: "Websites, platforms, iOS and Android apps",
    summary: "From a corporate website to a high-load platform. Fast, secure and easy to extend.",
    description:
      "Architecture, frontend, backend and mobile apps are built by one team. We agree on the spec and estimate at the start, then show you a working version every two weeks. At the end you get the full source code, server access and documentation.",
    mock: "code",
    features: [
      { title: "Corporate websites", text: "Next.js and a headless CMS. You edit the content yourself, and pages load in under a second." },
      { title: "Mobile apps", text: "React Native or Flutter. One codebase for iOS and Android, published to the App Store and Google Play." },
      { title: "Backend and APIs", text: "Node.js, Go, Python. Integrations with payment systems, 1C, CRMs and government services." },
      { title: "Online stores", text: "Catalog, cart, Click, Payme and Uzum payments, delivery and inventory." },
    ],
    deliverables: ["Spec and architecture", "Prototype and UI", "Development and testing", "Deployment and monitoring", "12 months of warranty support"],
    tools: ["Next.js", "React", "React Native", "Flutter", "Node.js", "Go", "PostgreSQL", "Redis"],
    timeline: "Website 3–6 weeks, MVP 8–12 weeks",
    faq: [
      { q: "How long does a project take?", a: "A corporate website usually takes 3–6 weeks, an MVP 8–12 weeks. Large platforms are split into stages, and every stage ends with a working result." },
      { q: "Who owns the code?", a: "You do. Source code, server access and documentation are handed over when the project ends." },
    ],
  },
  {
    slug: "ui-ux-design-and-branding",
    no: "02",
    title: "UI/UX design and branding",
    short: "Logos, brand systems, interfaces",
    summary: "A visual language that sets your brand apart, and interfaces your users understand.",
    description:
      "We study your audience and competitors first, then design. You get a logo, colors and typography, a component library in Figma and a usage guide, so future designers can keep the same style.",
    mock: "design",
    features: [
      { title: "Brand identity", text: "Name, logo, colors, typography and a brand book." },
      { title: "UX research", text: "Customer interviews, user journeys, competitor analysis." },
      { title: "Interface design", text: "Web and mobile screens, interactive prototypes, motion." },
      { title: "Design system", text: "Figma components and a UI kit kept in sync with the code." },
    ],
    deliverables: ["Brand book (PDF)", "Figma design system", "Interactive prototype", "Social media templates", "Print layouts"],
    tools: ["Figma", "Adobe Illustrator", "Photoshop", "After Effects", "Spline"],
    timeline: "Brand 3–5 weeks, interface 2–6 weeks",
    faq: [
      { q: "Can I order just a logo?", a: "Yes. But we deliver it with at least colors, typography and usage rules, otherwise it ends up looking different everywhere." },
      { q: "How many options do you show?", a: "2–3 directions. Once you pick one, we refine it until it matches what we agreed." },
    ],
  },
  {
    slug: "digital-marketing",
    no: "03",
    title: "Marketing and SMM",
    short: "Ads, SMM, SEO, analytics",
    summary: "We turn your ad budget into measurable results: leads, sales and returning customers.",
    description:
      "We run Meta, Google, Yandex, Telegram and TikTok under one strategy. You can see in the CRM where every lead came from, and you get a report every week. Channels that don't perform are switched off, and the ones that work are scaled up.",
    mock: "ads",
    features: [
      { title: "Paid ads", text: "Meta, Google, Yandex, TikTok. Creatives, A/B tests and lower cost per lead." },
      { title: "SMM", text: "Content plans, reels, design, page management and replies to comments." },
      { title: "SEO", text: "Technical audit, keywords, content. Organic traffic from Google and Yandex." },
      { title: "Analytics", text: "GA4, Metrica and your CRM connected. You see the whole path from ad to sale." },
    ],
    deliverables: ["Marketing strategy", "Media plan and budget", "Creatives", "Weekly report", "Analytics dashboard"],
    tools: ["Meta Ads", "Google Ads", "Yandex Direct", "TikTok Ads", "GA4", "Looker Studio"],
    timeline: "Launch in 1–2 weeks, stable results in 2–3 months",
    faq: [
      { q: "What is the minimum ad budget?", a: "It depends on your industry and city. In a free consultation we prepare a media plan with real numbers." },
      { q: "When will I see results?", a: "The first leads usually arrive within 1–2 weeks. Cost and lead quality take 2–3 months to stabilize." },
    ],
  },
  {
    slug: "business-development",
    no: "04",
    title: "Business development",
    short: "Audit, strategy, sales system",
    summary: "We analyze your processes, find growth points and help put them into practice.",
    description:
      "We review sales, marketing, operations and the team. You get a plan that says what to do, who owns it and how it is measured. The plan doesn't stay on paper: we deliver the technology and marketing parts ourselves.",
    mock: "roadmap",
    features: [
      { title: "Business audit", text: "Processes, unit economics, competition. We find where the money is leaking." },
      { title: "Growth strategy", text: "A plan and financial model for a new product, market or sales channel." },
      { title: "Sales department", text: "Funnel, scripts, KPIs, a CRM for managers and performance tracking." },
      { title: "Digitization", text: "Moving work from Excel and paper into proper systems." },
    ],
    deliverables: ["Audit report", "Roadmap", "Financial model", "KPI system", "Monthly review meetings"],
    tools: ["Notion", "Miro", "amoCRM", "Bitrix24", "Power BI", "Google Sheets"],
    timeline: "Audit 2–3 weeks, implementation 3–6 months",
    faq: [
      { q: "Is this a fit for small businesses?", a: "Yes. For small companies we offer a short audit and a focused 3-month plan." },
      { q: "Do you only give advice?", a: "No. We deliver the technology, marketing and CRM work in the plan ourselves." },
    ],
  },
  {
    slug: "startup-support",
    no: "05",
    title: "Startup support",
    short: "From idea to MVP and investment",
    summary: "We validate the idea, build the MVP, prepare the pitch and help you find your first users.",
    description:
      "DRENIX Launchpad is a support program for founders. Product, design, development, marketing and investor relations in one place. On some projects we work for part cash and part equity.",
    mock: "pitch",
    features: [
      { title: "Idea validation", text: "Market analysis, interviews with potential customers, business model." },
      { title: "MVP", text: "A working first version in 8–12 weeks, plus your first users." },
      { title: "Pitch and investment", text: "Pitch deck, financial model and preparation for investor meetings." },
      { title: "Go to market", text: "A plan to reach your first 1,000 users, and its execution." },
    ],
    deliverables: ["Lean canvas", "MVP", "Pitch deck", "Financial model", "Go-to-market plan"],
    tools: ["Figma", "Next.js", "Flutter", "Firebase", "Mixpanel", "DocSend"],
    timeline: "Validation 4 weeks, MVP 8–12 weeks",
    faq: [
      { q: "Do you work for equity?", a: "A mixed model is possible on some projects. We look at each case individually." },
      { q: "I only have an idea. Is that enough?", a: "Yes. The program starts with validating the idea." },
    ],
  },
  {
    slug: "ai-and-automation",
    no: "06",
    title: "AI and automation",
    short: "Chatbots, AI assistants, integrations",
    summary: "Software handles the repetitive work, so your team can focus on customers and sales.",
    description:
      "Telegram bots, an AI assistant on your website, automatic document processing and integrations between systems. We first find the processes that take the most time, then automate them step by step.",
    mock: "chat",
    features: [
      { title: "AI assistant", text: "Answers customer questions 24/7, takes orders and writes them to your CRM." },
      { title: "Documents", text: "Automatic data extraction from contracts, invoices and applications." },
      { title: "Integrations", text: "Connecting your CRM, 1C, Telegram, Google Sheets and other systems." },
      { title: "Internal knowledge base", text: "An assistant that answers staff questions from company documents." },
    ],
    deliverables: ["Process map", "Prototype", "Integrations", "Staff training", "Results report"],
    tools: ["Claude", "OpenAI", "n8n", "Python", "Telegram Bot API", "LangChain"],
    timeline: "Prototype in 2–3 weeks",
    faq: [
      { q: "Is our data safe?", a: "Access is restricted, and if needed the model runs on your own server." },
      { q: "Where should we start?", a: "With the 2–3 processes that take the most time. We identify them together in a free audit." },
    ],
  },
  {
    slug: "cloud-and-devops",
    no: "07",
    title: "Cloud and DevOps",
    short: "Servers, CI/CD, monitoring",
    summary: "Your websites and apps run without downtime and scale automatically under load.",
    description:
      "We design your infrastructure, move it to the cloud and set up automated deployments and monitoring. We also show you where server costs can be cut.",
    mock: "pipeline",
    features: [
      { title: "Cloud architecture", text: "AWS, Google Cloud, Yandex Cloud or a local data center." },
      { title: "CI/CD", text: "Every change is tested automatically and released safely." },
      { title: "Containers", text: "Docker and Kubernetes. The same environment in testing and production." },
      { title: "Monitoring", text: "Grafana, alerts, error tracking. We know about problems before you do." },
    ],
    deliverables: ["Infrastructure audit", "Terraform code", "CI/CD pipeline", "Monitoring", "Backup and recovery plan"],
    tools: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Grafana"],
    timeline: "Audit 1 week, migration 2–6 weeks",
    faq: [
      { q: "Can you migrate our existing server?", a: "Yes, step by step and with minimal downtime." },
      { q: "Will our costs go down?", a: "Usually, yes, thanks to right-sized resources and autoscaling." },
    ],
  },
  {
    slug: "cybersecurity",
    no: "08",
    title: "Cybersecurity",
    short: "Audits, pentests, protection",
    summary: "We find and close vulnerabilities before attackers do.",
    description:
      "We test your website, apps and infrastructure, rank the findings by severity and give you a remediation plan. If needed, we fix the issues ourselves and retest.",
    mock: "security",
    features: [
      { title: "Security audit", text: "Infrastructure, applications and internal processes." },
      { title: "Pentest", text: "Authorized test attacks within an agreed scope." },
      { title: "Protection", text: "WAF, backups, two-factor authentication, encryption." },
      { title: "Staff training", text: "Hands-on sessions against phishing and social engineering." },
    ],
    deliverables: ["Vulnerability report", "Remediation plan", "Security policy", "Retest", "Training materials"],
    tools: ["OWASP", "Burp Suite", "Cloudflare", "Wazuh", "Vault"],
    timeline: "Audit 1–3 weeks",
    faq: [
      { q: "Can a pentest damage our systems?", a: "No. Testing runs at an agreed time and with safeguards in place." },
      { q: "How often should we test?", a: "At least once a year, and after every major release." },
    ],
  },
  {
    slug: "crm-and-erp",
    no: "09",
    title: "CRM and ERP systems",
    short: "Implementation, integrations, custom systems",
    summary: "Sales, inventory, finance and staff in one system. Management sees everything in real time.",
    description:
      "We implement amoCRM, Bitrix24, 1C or Odoo, migrate your existing data and train your team. If no off-the-shelf system fits, we build a custom one for your business.",
    mock: "crm",
    features: [
      { title: "CRM implementation", text: "Pipelines, tasks, telephony and messenger integrations." },
      { title: "ERP", text: "Inventory, production, finance and HR records." },
      { title: "Integrations", text: "Connections to 1C, banks, payment systems and tax services." },
      { title: "Custom system", text: "If no ready-made solution fits, we build one from scratch." },
    ],
    deliverables: ["Process analysis", "Setup and data migration", "Integrations", "Staff training", "Ongoing support"],
    tools: ["amoCRM", "Bitrix24", "1C", "Odoo", "PostgreSQL"],
    timeline: "CRM 2–4 weeks, ERP 2–4 months",
    faq: [
      { q: "Will our old data be migrated?", a: "Yes. We clean it up and move it over from Excel, your old CRM or 1C." },
      { q: "Who trains our staff?", a: "We do. Live training and video guides are included in the price." },
    ],
  },
  {
    slug: "it-outsourcing",
    no: "10",
    title: "IT outsourcing",
    short: "Dedicated team, tech support, CTO",
    summary: "Skilled IT specialists without growing your headcount.",
    description:
      "A dedicated development team for your project, technical support under an SLA, or an experienced CTO to make technology decisions. Hours and tasks are tracked transparently.",
    mock: "support",
    features: [
      { title: "Dedicated team", text: "Developers, a designer, QA and a project manager working only on your project." },
      { title: "CTO as a service", text: "Technology strategy, architecture and team leadership." },
      { title: "Tech support", text: "Monitoring and fast fixes under an SLA." },
      { title: "Code audit", text: "Review of an existing project, refactoring and documentation." },
    ],
    deliverables: ["SLA agreement", "Monthly report", "Time tracking", "Documentation", "Option to scale the team"],
    tools: ["Jira", "Linear", "Slack", "GitHub", "Sentry", "Notion"],
    timeline: "Team assembled in 1–2 weeks",
    faq: [
      { q: "What is the minimum term?", a: "Usually 3 months, then extended month to month." },
      { q: "How fast can the team be assembled?", a: "Key roles within 1–2 weeks." },
    ],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

export const processSteps = [
  { no: "01", title: "Discovery and audit", text: "We learn about your business, goals and constraints. Free of charge.", result: "List of problems and opportunities", time: "1–3 days" },
  { no: "02", title: "Proposal and estimate", text: "We write down the scope, timeline, price and how success will be measured.", result: "Commercial proposal and plan", time: "3–5 days" },
  { no: "03", title: "Design and prototype", text: "We agree on screens and flows with you before development starts.", result: "Approved prototype", time: "1–4 weeks" },
  { no: "04", title: "Development", text: "Two-week sprints. At the end of each sprint we show you a working version.", result: "Tested product", time: "2–12 weeks" },
  { no: "05", title: "Launch and growth", text: "We deploy, monitor, and keep going with marketing and updates.", result: "Report and next steps", time: "Ongoing" },
];

export const facts = [
  { value: "10", label: "service lines" },
  { value: "24 hours", label: "response time" },
  { value: "12 months", label: "warranty support" },
  { value: "Free", label: "initial audit" },
];

export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  category: string;
  services: string[];
  year: string;
  mock: MockKind;
  plate: "bone" | "ember" | "umber" | "ink";
};

// Sample projects — replace with real ones.
export const cases: CaseStudy[] = [
  { slug: "fintech", client: "PayFlow", title: "Payments and accounting platform for small businesses", category: "Fintech", services: ["Design", "Web platform", "Backend"], year: "2025", mock: "code", plate: "bone" },
  { slug: "retail", client: "Bozor Market", title: "Marketing for an online store and loyalty program", category: "Retail", services: ["Ads", "SMM", "Analytics"], year: "2025", mock: "ads", plate: "ember" },
  { slug: "edtech", client: "Ilm Academy", title: "AI assistant and Telegram bot for a learning center", category: "Education", services: ["AI", "Telegram bot", "Integrations"], year: "2024", mock: "chat", plate: "umber" },
  { slug: "logistics", client: "Yo‘l Cargo", title: "CRM and sales pipeline for a logistics company", category: "Logistics", services: ["CRM", "Integrations", "Training"], year: "2024", mock: "crm", plate: "ink" },
];

export const launchpadStages = [
  { no: "1", title: "Ignite", sub: "Idea validation", text: "Market analysis, customer interviews, business model and prototype.", weeks: "4 weeks" },
  { no: "2", title: "Build", sub: "MVP", text: "Design, development and your first users.", weeks: "8–12 weeks" },
  { no: "3", title: "Rise", sub: "First revenue", text: "Marketing, metrics and product improvements.", weeks: "3 months" },
  { no: "4", title: "Soar", sub: "Investment", text: "Pitch deck, data room, introductions to investors and accelerators.", weeks: "Agreed" },
];

export const values = [
  { title: "Results in numbers", text: "Every project starts with a measurable goal, and reports are tied to that goal." },
  { title: "Open process", text: "You see the task board, there is a demo every two weeks, and the estimate is agreed up front." },
  { title: "One point of contact", text: "There are many developers, designers and marketers. You talk to one manager." },
  { title: "Long-term partnership", text: "We don't just hand over and leave. We keep supporting and growing the product." },
];

export const generalFaq = [
  { q: "How much do your services cost?", a: "It depends on scope and timeline. After an intro call we send an exact estimate within 3–5 days. Once agreed, the estimate doesn't change." },
  { q: "How does payment work?", a: "Usually in stages: an upfront payment, then a payment as each stage is delivered. Monthly payments are possible for long projects." },
  { q: "Do you sign a contract?", a: "Yes. Every project runs under a contract that states the timeline, deliverables and guarantees." },
  { q: "Do you support the product after launch?", a: "We give a 12-month warranty on everything we build. After that, we sign a monthly support agreement." },
  { q: "What if we are in another city or abroad?", a: "Not a problem. Meetings happen online and documents are signed electronically." },
];
