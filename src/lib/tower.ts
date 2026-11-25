import { services } from "./data";
import { departments } from "./departments";

/**
 * DRENIX Tower: 10 floors, 10 departments. The top floor (10) is the first service in the list.
 * `specs` are short facts shown in the floor panel.
 */
const extra: Record<string, { specs: [string, string][] }> = {
  "web-and-mobile-development": { specs: [["Timeline", "3–12 weeks"], ["Stack", "Next.js, Flutter, Go"], ["Format", "Project"], ["Warranty", "12 months"]] },
  "ui-ux-design-and-branding": { specs: [["Timeline", "3–5 weeks"], ["Concepts", "2–3 directions"], ["You get", "Brand book, UI kit"], ["Tool", "Figma"]] },
  "digital-marketing": { specs: [["Start", "1–2 weeks"], ["Channels", "Meta, Google, TG"], ["Reports", "Weekly"], ["Model", "Monthly"]] },
  "business-development": { specs: [["Audit", "2–3 weeks"], ["Plan", "Roadmap, KPI"], ["Reviews", "Monthly"], ["Format", "Consulting"]] },
  "startup-support": { specs: [["MVP", "8–12 weeks"], ["Stages", "Ignite to Soar"], ["Model", "Cash or equity"], ["Intake", "Rolling"]] },
  "ai-and-automation": { specs: [["Prototype", "2–3 weeks"], ["Tools", "Claude, n8n"], ["Connects to", "CRM, Telegram"], ["Format", "Project"]] },
  "cloud-and-devops": { specs: [["Audit", "1 week"], ["Migration", "2–6 weeks"], ["Monitoring", "24/7"], ["Code", "Terraform"]] },
  cybersecurity: { specs: [["Audit", "1–3 weeks"], ["Method", "OWASP"], ["Pentest", "Authorized"], ["Retest", "Included"]] },
  "crm-and-erp": { specs: [["CRM", "2–4 weeks"], ["ERP", "2–4 months"], ["Connects to", "1C, banks"], ["Training", "Included"]] },
  "it-outsourcing": { specs: [["Team", "1–2 weeks"], ["SLA", "Agreed"], ["Minimum", "3 months"], ["Reports", "Monthly"]] },
};

export const floors = services.map((s, i) => {
  const d = departments.find((x) => x.slug === s.slug)!;
  return {
    level: String(10 - i).padStart(2, "0"),
    slug: s.slug,
    title: s.title,
    short: s.short,
    summary: s.summary,
    timeline: s.timeline,
    deliverables: s.deliverables,
    tools: s.tools,
    ...extra[s.slug],
    name: d.name,
    lead: d.lead,
    department: d,
  };
});

export type Floor = (typeof floors)[number];

/** What the browser needs to know about every floor before one is opened. Server components pass it down. */
export type FloorInfo = Pick<Floor, "level" | "slug" | "name" | "title" | "lead" | "specs">;
export const floorInfo: FloorInfo[] = floors.map(({ level, slug, name, title, lead, specs }) => ({ level, slug, name, title, lead, specs }));

export const floorIndex = (slug: string) => floors.findIndex((f) => f.slug === slug);
