/**
 * What every department does, room by room.
 *
 * Each floor of the tower is one department, and every floor has the same six rooms.
 * A project walks through them in order: brief, plan, research, make, test, deliver.
 * Texts describe how the work is organized. Check them against your real process before launch.
 */

export type ZoneId = "lounge" | "meeting" | "focus" | "west" | "east" | "lead";

export type DeptZone = {
  id: ZoneId;
  /** Name of the room on this floor. */
  room: string;
  title: string;
  text: string;
  tasks: string[];
  /** What leaves the room. */
  output: string;
};

export type Department = {
  slug: string;
  name: string;
  /** One line: what this department is for. */
  lead: string;
  about: string;
  roles: { name: string; does: string }[];
  zones: DeptZone[];
  /** What we ask the client for at the start. */
  needs: string[];
  /** How the work is judged. */
  measures: string[];
  /** Floors this department works with most. */
  with: { slug: string; why: string }[];
};

export const departments: Department[] = [
  {
    slug: "web-and-mobile-development",
    name: "Engineering",
    lead: "Builds websites, platforms and mobile apps, and keeps them running.",
    about: "One team writes the frontend, the backend and the mobile apps. You see a working version every two weeks, and at the end the code, the servers and the documentation are yours.",
    roles: [
      { name: "Tech lead", does: "Owns the architecture and reviews every change" },
      { name: "Frontend engineer", does: "Builds the web interface" },
      { name: "Mobile engineer", does: "Builds the iOS and Android apps" },
      { name: "Backend engineer", does: "Builds APIs, data and integrations" },
      { name: "QA engineer", does: "Tests each release by hand and automatically" },
    ],
    zones: [
      { id: "lounge", room: "Reception", title: "We learn what the product must do", text: "The first talk is about your business, not about technology. We write the goal down in plain words.", tasks: ["Agree on users, goals and limits", "List the systems it has to connect to", "Get access to what already exists"], output: "One-page brief" },
      { id: "meeting", room: "Planning room", title: "Scope, architecture and estimate", text: "We split the product into stages and draw how the parts talk to each other, so the price and the dates stop being a guess.", tasks: ["Write user stories and cut the extras", "Design the data model and integrations", "Break the work into two-week sprints"], output: "Spec and fixed estimate" },
      { id: "focus", room: "Prototype room", title: "Risky parts are tried first", text: "Before the main build we make a clickable prototype and test anything that could fail later.", tasks: ["Clickable prototype of the main flows", "API contract between apps and server", "Trial of payments and external services"], output: "Approved prototype" },
      { id: "west", room: "Product bay", title: "Web and mobile are built here", text: "Frontend and mobile engineers sit together, so a screen looks and behaves the same on a phone and in the browser.", tasks: ["Web in Next.js and React", "iOS and Android in Flutter or React Native", "Code review on every change"], output: "Working version every two weeks" },
      { id: "east", room: "Backend and QA bay", title: "Servers, data and tests", text: "APIs, databases and payments are written here, and every release is checked before it leaves the bay.", tasks: ["APIs, database and admin panel", "Click, Payme, Uzum and 1C integrations", "Automated tests plus manual checks on real devices"], output: "Tested release" },
      { id: "lead", room: "Release desk", title: "Launch and handover", text: "We deploy, watch the first days closely and hand everything over. Nothing is kept from you.", tasks: ["Deployment and monitoring", "Source code, server access and documentation", "12 months of warranty support"], output: "Live product that you own" },
    ],
    needs: ["One person who can make decisions", "Access to current systems", "Examples of what you like and dislike"],
    measures: ["Sprint goals met", "Page speed and crash-free sessions", "Bugs found after release"],
    with: [
      { slug: "ui-ux-design-and-branding", why: "screens and the design system" },
      { slug: "cloud-and-devops", why: "servers and automatic releases" },
      { slug: "cybersecurity", why: "checks before launch" },
    ],
  },
  {
    slug: "ui-ux-design-and-branding",
    name: "Design Studio",
    lead: "Shapes how the brand looks and how the product feels to use.",
    about: "Designers start with your customers and competitors, and only then draw. What you get is a system other people can continue, not a set of pretty pictures.",
    roles: [
      { name: "Art director", does: "Keeps one idea across the whole project" },
      { name: "UX researcher", does: "Talks to your customers and tests the flows" },
      { name: "Brand designer", does: "Logo, color, type and brand book" },
      { name: "UI designer", does: "Screens, components and prototypes" },
      { name: "Motion designer", does: "Transitions and short product videos" },
    ],
    zones: [
      { id: "lounge", room: "Interview lounge", title: "We listen before we draw", text: "Talks with you and with a few of your customers show what people need and where they get lost today.", tasks: ["Interview the owner and the team", "Talk to 4–6 customers", "Collect the materials you already use"], output: "Interview notes and goals" },
      { id: "meeting", room: "Insight wall", title: "Research turns into a direction", text: "Competitors, customer journeys and the interview notes go up on one wall. The direction is chosen here, together with you.", tasks: ["Competitor and market audit", "Map of the customer journey", "Positioning in one sentence"], output: "Research summary and direction" },
      { id: "focus", room: "Brand desk", title: "Logo, color and type", text: "Quiet work on the identity. You see two or three clear directions, not twenty variants.", tasks: ["Sketch and refine the mark", "Choose colors with readable contrast", "Set the typography and the tone of voice"], output: "2–3 brand directions" },
      { id: "west", room: "Interface bay", title: "Screens take shape", text: "Wireframes become finished screens for web and mobile, with every state drawn: empty, loading, error and success.", tasks: ["Wireframes and user flows", "Web and mobile screens in Figma", "Motion for the key moments"], output: "Interface in Figma" },
      { id: "east", room: "Test lab", title: "People try it before code exists", text: "We give the prototype to real users and watch. What confuses them is fixed while it is still cheap.", tasks: ["Clickable prototype", "Usability sessions with 5 people", "Accessibility check: contrast, sizes, keyboard"], output: "Tested prototype" },
      { id: "lead", room: "Review room", title: "Design system and handoff", text: "Components, rules and files are packed so that developers and future designers can keep the same style.", tasks: ["UI kit that matches the code", "Brand book and templates", "Review of the built product"], output: "Brand book and design system" },
    ],
    needs: ["Access to a few customers", "Old logos, photos and texts", "Quick feedback, once a week"],
    measures: ["Tasks users finish without help", "Components reused in code", "Consistency across channels"],
    with: [
      { slug: "web-and-mobile-development", why: "building the interface exactly as drawn" },
      { slug: "digital-marketing", why: "creatives in one style" },
      { slug: "startup-support", why: "first brand for new products" },
    ],
  },
  {
    slug: "digital-marketing",
    name: "Growth",
    lead: "Turns the ad budget into leads and sales you can trace.",
    about: "Ads, content and search run under one plan. You always see where a lead came from and what it cost, and channels that do not pay back are switched off.",
    roles: [
      { name: "Growth lead", does: "Owns the strategy and the budget" },
      { name: "Performance manager", does: "Runs Meta, Google, Yandex, TikTok and Telegram ads" },
      { name: "SMM manager", does: "Content plan, pages and replies" },
      { name: "SEO specialist", does: "Organic traffic from search" },
      { name: "Analyst", does: "Tracking, dashboards and reports" },
    ],
    zones: [
      { id: "lounge", room: "Kick-off lounge", title: "First the numbers, then the ads", text: "We look at margin, average order and current channels. Without them it is impossible to say what a good lead costs.", tasks: ["Margin, average order, repeat sales", "Review of past campaigns", "Access to ad accounts"], output: "Target cost per lead" },
      { id: "meeting", room: "Media planning room", title: "Who, what and where", text: "Audience, offer and channel are matched here, and the budget is split before a single ad goes live.", tasks: ["Audience segments and offers", "Channels and monthly budget", "Content plan for the first month"], output: "Strategy and media plan" },
      { id: "focus", room: "Analytics desk", title: "Every lead gets a source", text: "Counters, events and the CRM are connected, so later nobody has to argue about which ad worked.", tasks: ["GA4, Metrica and pixels", "Events and UTM rules", "Dashboard linked to the CRM"], output: "Measurement that works" },
      { id: "west", room: "Creative bay", title: "Ads, reels and landing pages", text: "Texts, visuals and short videos are produced in series, because the winner is never known in advance.", tasks: ["Ad creatives in several versions", "Reels and posts", "Landing pages with the design floor"], output: "Creatives ready to launch" },
      { id: "east", room: "Performance bay", title: "Campaigns run and improve", text: "Ads are launched, compared and moved every day. Search and social content work in parallel for the long run.", tasks: ["Launch and A/B tests", "Daily bids and budgets", "SEO pages and page management"], output: "Leads with a known source" },
      { id: "lead", room: "Report room", title: "One honest page a week", text: "You get what was spent, what came in and what we change next week, in plain language.", tasks: ["Spend, leads, sales and cost per lead", "What worked and what did not", "Plan for the next week"], output: "Weekly report" },
    ],
    needs: ["Ad accounts or permission to create them", "Someone who answers leads fast", "Photos, videos and prices"],
    measures: ["Cost per lead and per sale", "Share of leads that buy", "Growth of organic traffic"],
    with: [
      { slug: "ui-ux-design-and-branding", why: "visuals and landing pages" },
      { slug: "crm-and-erp", why: "leads that reach the sales team" },
      { slug: "business-development", why: "offers and pricing" },
    ],
  },
  {
    slug: "business-development",
    name: "Strategy",
    lead: "Finds where the business loses money and what to grow first.",
    about: "We look at sales, marketing, operations and people together, then write a plan with owners and numbers. The other floors help to carry it out.",
    roles: [
      { name: "Business analyst", does: "Maps processes and checks the numbers" },
      { name: "Strategy consultant", does: "Builds the growth plan with you" },
      { name: "Sales architect", does: "Funnel, scripts and KPIs" },
      { name: "Project manager", does: "Keeps the plan moving every week" },
    ],
    zones: [
      { id: "lounge", room: "Owner’s lounge", title: "A frank talk about the goal", text: "Where the company should be in a year, what has been tried and what hurts the most right now.", tasks: ["Goals for 12 months", "Main pains and limits", "List of people to interview"], output: "Agreed goal" },
      { id: "meeting", room: "Process room", title: "How the company works today", text: "We draw the path of a customer and of money through the company together with your managers.", tasks: ["Interviews with department heads", "Map of sales and operations", "Places where leads or time are lost"], output: "Process map" },
      { id: "focus", room: "Numbers desk", title: "The audit", text: "Unit economics, funnel and competitors are checked against real data, not against opinions.", tasks: ["Unit economics and margin", "Sales funnel by stage", "Competitors and prices"], output: "Audit report" },
      { id: "west", room: "Roadmap bay", title: "What to do, who does it, when", text: "Ideas are ranked by effect and effort. The plan fits the people and the budget you really have.", tasks: ["Ranked list of initiatives", "Financial model with scenarios", "KPIs for every role"], output: "Roadmap and financial model" },
      { id: "east", room: "Implementation bay", title: "The plan goes to work", text: "Sales scripts, hiring, CRM and marketing start here, together with the floors that build them.", tasks: ["Sales scripts and training", "CRM and reporting with Systems", "Launch of the first initiatives"], output: "First changes live" },
      { id: "lead", room: "Review room", title: "Monthly review", text: "Once a month we compare plan and fact and decide what to continue, change or stop.", tasks: ["KPIs against plan", "Decisions for the next month", "Support for managers"], output: "Monthly review and decisions" },
    ],
    needs: ["Sales and finance data", "Time of department heads", "Readiness to change the process"],
    measures: ["Revenue and margin against plan", "Conversion between funnel stages", "Initiatives finished on time"],
    with: [
      { slug: "crm-and-erp", why: "processes inside one system" },
      { slug: "digital-marketing", why: "demand for new offers" },
      { slug: "startup-support", why: "new products" },
    ],
  },
  {
    slug: "startup-support",
    name: "Launchpad",
    lead: "Takes founders from an idea to a product with first customers.",
    about: "Product, design, code, marketing and investor talks in one program. On some projects we work for part cash and part equity.",
    roles: [
      { name: "Program lead", does: "Weekly sessions with the founder" },
      { name: "Product manager", does: "Decides what goes into the MVP" },
      { name: "Design and dev team", does: "Builds the first version" },
      { name: "Go-to-market manager", does: "Finds the first users" },
      { name: "Investment advisor", does: "Pitch, model and introductions" },
    ],
    zones: [
      { id: "lounge", room: "Founder lounge", title: "The idea, without slides", text: "We ask who has the problem, how they solve it now and why you are the one to fix it.", tasks: ["Problem and customer", "Founder’s time and resources", "Cash or cash plus equity"], output: "Decision to work together" },
      { id: "meeting", room: "Canvas room", title: "The idea becomes hypotheses", text: "A lean canvas shows which assumption can kill the project. That one is tested first.", tasks: ["Lean canvas", "Riskiest assumptions", "Plan for the first four weeks"], output: "Validation plan" },
      { id: "focus", room: "Validation desk", title: "Talks with real customers", text: "Interviews and a simple landing page tell more than months of planning.", tasks: ["Customer interviews", "Market size and competitors", "Landing page with a waiting list"], output: "Go, change or stop" },
      { id: "west", room: "MVP bay", title: "The smallest product that works", text: "Design and code in 8–12 weeks. Only what is needed to check that people use it and pay.", tasks: ["Prototype and brand basics", "Two-week sprints", "Analytics built in from day one"], output: "MVP in 8–12 weeks" },
      { id: "east", room: "First users bay", title: "Launch and learn", text: "We bring the first users, watch what they do and change the product every week.", tasks: ["Go-to-market plan", "Content and small ad tests", "Retention and payment metrics"], output: "First users and revenue" },
      { id: "lead", room: "Investor room", title: "Ready for investors", text: "The pitch, the model and the data room are prepared, and we introduce you to people who invest.", tasks: ["Pitch deck and demo", "Financial model", "Accelerators, angels and funds"], output: "Pitch deck and introductions" },
    ],
    needs: ["A founder who works on it full time", "Readiness to change the product", "Access to early customers"],
    measures: ["Interviews and sign-ups", "Share of users who come back", "First paid customers"],
    with: [
      { slug: "web-and-mobile-development", why: "the MVP" },
      { slug: "ui-ux-design-and-branding", why: "brand and prototype" },
      { slug: "digital-marketing", why: "first users" },
    ],
  },
  {
    slug: "ai-and-automation",
    name: "AI Lab",
    lead: "Hands the repetitive work over to software.",
    about: "Assistants, document processing and links between systems. We start with the two or three tasks that eat the most hours, and people always keep the last word.",
    roles: [
      { name: "AI lead", does: "Chooses the approach and checks quality" },
      { name: "Automation engineer", does: "Connects systems and scenarios" },
      { name: "Data engineer", does: "Prepares documents and knowledge" },
      { name: "Conversation designer", does: "How the assistant talks and when it hands over" },
    ],
    zones: [
      { id: "lounge", room: "Interview lounge", title: "Where do the hours go?", text: "We talk to the people who do the work every day and time the tasks that repeat.", tasks: ["List of repetitive tasks", "Hours and errors per task", "Documents and systems involved"], output: "Task list with hours" },
      { id: "meeting", room: "Selection room", title: "Choose what is worth automating", text: "Each task gets two marks: how much it saves and how risky it is. Data and privacy rules are settled here.", tasks: ["Value and effort for each task", "Which data may be used", "Where a person must approve"], output: "Plan for 2–3 scenarios" },
      { id: "focus", room: "Prompt desk", title: "Prototype on your own data", text: "The model is tried on real questions and documents, and its mistakes are collected on purpose.", tasks: ["Knowledge base from your documents", "First prompts and rules", "Set of test questions"], output: "Prototype in 2–3 weeks" },
      { id: "west", room: "Assistant bay", title: "Chatbots and document readers", text: "Assistants for Telegram, the website and your team are built here, with clear limits on what they may do.", tasks: ["Telegram and website assistants", "Data extraction from documents", "Internal knowledge assistant"], output: "Working assistant" },
      { id: "east", room: "Integration bay", title: "Connected and measured", text: "The assistant writes to your CRM, 1C or Sheets, and every answer can be checked later.", tasks: ["CRM, 1C, Sheets and Telegram links", "Accuracy tests before release", "Handover to a person when unsure"], output: "Tested integration" },
      { id: "lead", room: "Launch room", title: "Training and results", text: "Your team learns to work with the assistant, and after a month we count the hours saved.", tasks: ["Staff training", "Monitoring of cost and quality", "Results report"], output: "Results report" },
    ],
    needs: ["Examples of real requests and documents", "A person who knows the process", "Access to the systems to connect"],
    measures: ["Hours saved per month", "Share of correct answers", "Requests handled without a person"],
    with: [
      { slug: "crm-and-erp", why: "data and customer records" },
      { slug: "web-and-mobile-development", why: "assistants inside products" },
      { slug: "cybersecurity", why: "access and data protection" },
    ],
  },
  {
    slug: "cloud-and-devops",
    name: "Cloud",
    lead: "Keeps websites and apps online and ready for load.",
    about: "Servers, releases and monitoring are set up as code, so the system can be rebuilt, scaled and checked at any time.",
    roles: [
      { name: "Cloud architect", does: "Designs the infrastructure and its cost" },
      { name: "DevOps engineer", does: "Pipelines, containers and automation" },
      { name: "Reliability engineer", does: "Monitoring, alerts and incidents" },
    ],
    zones: [
      { id: "lounge", room: "Access desk", title: "What do you have today?", text: "We make a list of servers, domains, databases and who can reach them. Surprises usually start here.", tasks: ["Inventory of servers and services", "Accesses and owners", "Current costs and incidents"], output: "Inventory" },
      { id: "meeting", room: "Architecture room", title: "The target picture", text: "Cloud or your own data center, how it scales and what it costs per month. You choose between clear options.", tasks: ["AWS, Google, Yandex or local", "Network, backups and limits", "Monthly cost for each option"], output: "Architecture and budget" },
      { id: "focus", room: "Code desk", title: "Infrastructure as code", text: "Servers are described in Terraform. The same environment can be created again in minutes.", tasks: ["Terraform modules", "Secrets and access rules", "Test environment"], output: "Infrastructure code" },
      { id: "west", room: "Pipeline bay", title: "Releases without fear", text: "Every change is built, tested and released automatically, and can be rolled back.", tasks: ["CI/CD in GitHub Actions", "Docker and Kubernetes", "Rollback plan"], output: "Automatic releases" },
      { id: "east", room: "Operations bay", title: "Watching day and night", text: "Dashboards and alerts show a problem before your customers do. Backups are restored for practice.", tasks: ["Grafana dashboards and alerts", "Logs and error tracking", "Backup and restore drills"], output: "24/7 monitoring" },
      { id: "lead", room: "Handover room", title: "Migration and runbooks", text: "The move is planned hour by hour. After it you get instructions for every usual situation.", tasks: ["Migration with minimal downtime", "Runbooks for your team", "Cost report and savings"], output: "Migrated system and runbooks" },
    ],
    needs: ["Access to servers and domains", "Busy and quiet hours of your business", "Who to call in an incident"],
    measures: ["Uptime and response time", "Time from commit to release", "Cost per month"],
    with: [
      { slug: "web-and-mobile-development", why: "releases of products" },
      { slug: "cybersecurity", why: "protection of infrastructure" },
      { slug: "it-outsourcing", why: "support after the move" },
    ],
  },
  {
    slug: "cybersecurity",
    name: "Security",
    lead: "Finds weak points before attackers do, and closes them.",
    about: "Audits, authorized attacks and protection. Every finding comes with proof, a severity and a fix, and everything is tested again after the fix.",
    roles: [
      { name: "Security lead", does: "Agrees on the scope and signs the report" },
      { name: "Penetration tester", does: "Attacks systems with your permission" },
      { name: "Security engineer", does: "Sets up protection and fixes" },
      { name: "SOC analyst", does: "Watches logs and alerts" },
      { name: "Trainer", does: "Teaches staff to spot phishing" },
    ],
    zones: [
      { id: "lounge", room: "Scope desk", title: "Permission comes first", text: "Nothing is touched before a written agreement: what we test, when, and who is warned.", tasks: ["Written authorization and NDA", "List of systems in scope", "Safe hours and contacts"], output: "Rules of engagement" },
      { id: "meeting", room: "Threat room", title: "Who would attack, and how?", text: "We draw your systems and look at them through the eyes of an attacker. Effort goes where the damage would be highest.", tasks: ["Map of data and entry points", "Likely attackers and scenarios", "Test plan by priority"], output: "Threat model" },
      { id: "focus", room: "Recon desk", title: "Quiet research", text: "Public traces, settings and code are studied before any test attack.", tasks: ["Attack surface and leaked data", "Server and cloud settings", "Review of critical code"], output: "List of suspected weak points" },
      { id: "west", room: "Pentest bay", title: "Authorized attacks", text: "Web, mobile, API and network are tested by the OWASP method. Each weak point is proven safely, without harm to your data.", tasks: ["Web, mobile and API tests", "Network and infrastructure tests", "Safe proof for every finding"], output: "Proven vulnerabilities" },
      { id: "east", room: "Defense bay", title: "Protection is set up", text: "While testers look for holes, engineers close them and build the everyday protection.", tasks: ["WAF, two-factor login, encryption", "Logs and alerts in Wazuh", "Backups and secret storage"], output: "Closed gaps and monitoring" },
      { id: "lead", room: "Report room", title: "Report, training, retest", text: "You get findings ranked by severity with a plan to fix them. After the fixes we attack again.", tasks: ["Report for managers and for engineers", "Phishing training for staff", "Free retest of fixed issues"], output: "Report and retest" },
    ],
    needs: ["Written permission from the owner", "Test accounts and a contact person", "A window when tests are allowed"],
    measures: ["Critical findings still open", "Days from finding to fix", "Staff who report phishing"],
    with: [
      { slug: "cloud-and-devops", why: "servers and access" },
      { slug: "web-and-mobile-development", why: "fixes in code" },
      { slug: "it-outsourcing", why: "daily support" },
    ],
  },
  {
    slug: "crm-and-erp",
    name: "Systems",
    lead: "Puts sales, stock, finance and staff into one system.",
    about: "We set up amoCRM, Bitrix24, 1C or Odoo, move your data and train people. If nothing on the market fits, we build a system for you.",
    roles: [
      { name: "Solution architect", does: "Chooses the system and the structure" },
      { name: "Implementation engineer", does: "Configures and connects everything" },
      { name: "Data specialist", does: "Cleans and moves the data" },
      { name: "Trainer", does: "Teaches the team and writes guides" },
    ],
    zones: [
      { id: "lounge", room: "Interview lounge", title: "How does work really flow?", text: "We talk to sales, warehouse and accounting. The real process is often different from the one on paper.", tasks: ["Interviews by department", "Spreadsheets and documents in use", "Reports the manager needs"], output: "Picture of today’s process" },
      { id: "meeting", room: "Process room", title: "The process as it should be", text: "Stages, roles and rules are agreed before anyone opens the settings.", tasks: ["Pipeline stages and statuses", "Who sees and changes what", "Which system fits"], output: "Process and system choice" },
      { id: "focus", room: "Data desk", title: "Clean data in", text: "Contacts, goods and balances are cleaned, matched and checked before the move.", tasks: ["Export from Excel, old CRM or 1C", "Duplicates and errors removed", "Trial import"], output: "Clean data set" },
      { id: "west", room: "Setup bay", title: "The system is configured", text: "Pipelines, tasks, telephony and messengers are set up so that managers do less typing.", tasks: ["Pipelines, tasks and templates", "Telephony and messengers", "Reports and dashboards"], output: "Configured system" },
      { id: "east", room: "Integration bay", title: "Everything is connected", text: "1C, bank, payments and tax services exchange data automatically. The old and the new system run side by side for a while.", tasks: ["1C, bank and tax links", "Online payments and stock", "Parallel run and checks"], output: "Tested integrations" },
      { id: "lead", room: "Training room", title: "People start using it", text: "A system works when people use it. We train each role and stay close during the first weeks.", tasks: ["Live training by role", "Video guides", "Support after go-live"], output: "Team working in the system" },
    ],
    needs: ["Current tables and exports", "One responsible person per department", "Accesses to bank and 1C"],
    measures: ["Deals kept in the system", "Time to prepare a report", "Errors in stock and documents"],
    with: [
      { slug: "business-development", why: "processes and KPIs" },
      { slug: "ai-and-automation", why: "automatic routine" },
      { slug: "digital-marketing", why: "leads from ads" },
    ],
  },
  {
    slug: "it-outsourcing",
    name: "Partners",
    lead: "Gives you an IT team without growing your headcount.",
    about: "A dedicated team, technical support under an SLA or an experienced CTO for a few days a month. Hours and tasks are open to you at any time.",
    roles: [
      { name: "Account manager", does: "Your single point of contact" },
      { name: "CTO on demand", does: "Architecture and technology decisions" },
      { name: "Dedicated engineers", does: "Work only on your project" },
      { name: "Support engineer", does: "Tickets and incidents" },
    ],
    zones: [
      { id: "lounge", room: "Request desk", title: "Who and what do you need?", text: "Sometimes the answer is a team, sometimes one person for two days a week. We say honestly which.", tasks: ["Goals and current team", "Skills and hours needed", "Budget and start date"], output: "Request in writing" },
      { id: "meeting", room: "Agreement room", title: "Rules of the work", text: "Response times, reports, security and how to leave the contract are fixed before the start.", tasks: ["SLA and working hours", "Access and security rules", "Reporting and billing"], output: "Contract and SLA" },
      { id: "focus", room: "Selection desk", title: "Choosing the people", text: "We propose candidates, you talk to them and decide. Nobody starts without your consent.", tasks: ["Candidates for each role", "Interviews with you", "Onboarding plan"], output: "Approved team in 1–2 weeks" },
      { id: "west", room: "Team bay", title: "A team that works as yours", text: "Engineers use your tracker, join your calls and follow your rules.", tasks: ["Work in your task tracker", "Daily short calls", "Code reviews inside the team"], output: "Planned tasks done" },
      { id: "east", room: "Support bay", title: "Problems are solved by the clock", text: "Requests and alerts come to one place. The response time is written in the SLA.", tasks: ["Tickets and monitoring", "Fixes and small changes", "Incident reviews"], output: "Support under SLA" },
      { id: "lead", room: "CTO desk", title: "Decisions and monthly report", text: "Once a month you see what was done, how many hours it took and what is worth doing next.", tasks: ["Code and architecture audit", "Technology plan", "Monthly report by tasks and hours"], output: "Monthly report" },
    ],
    needs: ["List of current systems", "Priorities for the first month", "Access to your task tracker"],
    measures: ["Response time under the SLA", "Tasks finished against plan", "Hours by task"],
    with: [
      { slug: "web-and-mobile-development", why: "engineers for your product" },
      { slug: "cloud-and-devops", why: "servers and monitoring" },
      { slug: "cybersecurity", why: "safe access" },
    ],
  },
];

export const getDepartment = (slug: string) => departments.find((d) => d.slug === slug);
