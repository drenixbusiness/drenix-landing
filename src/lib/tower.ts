import { services } from "./data";

/**
 * DRENIX Tower: 10 floors, 10 services. The top floor (10) is the first service in the list.
 * `specs` are short facts shown in the floor panel.
 */
const extra: Record<string, { name: string; specs: [string, string][] }> = {
  "web-and-mobile-development": { name: "Engineering", specs: [["Timeline", "3–12 weeks"], ["Stack", "Next.js, Flutter, Go"], ["Format", "Project"], ["Warranty", "12 months"]] },
  "ui-ux-design-and-branding": { name: "Design Studio", specs: [["Timeline", "3–5 weeks"], ["Concepts", "2–3 directions"], ["You get", "Brand book, UI kit"], ["Tool", "Figma"]] },
  "digital-marketing": { name: "Growth", specs: [["Start", "1–2 weeks"], ["Channels", "Meta, Google, TG"], ["Reports", "Weekly"], ["Model", "Monthly"]] },
  "business-development": { name: "Strategy", specs: [["Audit", "2–3 weeks"], ["Plan", "Roadmap, KPI"], ["Reviews", "Monthly"], ["Format", "Consulting"]] },
  "startup-support": { name: "Launchpad", specs: [["MVP", "8–12 weeks"], ["Stages", "Ignite → Soar"], ["Model", "Cash or equity"], ["Intake", "Rolling"]] },
  "ai-and-automation": { name: "AI Lab", specs: [["Prototype", "2–3 weeks"], ["Tools", "Claude, n8n"], ["Integrations", "CRM, Telegram"], ["Format", "Project"]] },
  "cloud-and-devops": { name: "Cloud", specs: [["Audit", "1 week"], ["Migration", "2–6 weeks"], ["Monitoring", "24/7"], ["IaC", "Terraform"]] },
  cybersecurity: { name: "Security", specs: [["Audit", "1–3 weeks"], ["Standard", "OWASP"], ["Pentest", "Authorized"], ["Retest", "Included"]] },
  "crm-and-erp": { name: "Systems", specs: [["CRM", "2–4 weeks"], ["ERP", "2–4 months"], ["Integrations", "1C, banks"], ["Training", "Included"]] },
  "it-outsourcing": { name: "Partners", specs: [["Team", "1–2 weeks"], ["SLA", "Agreed"], ["Minimum", "3 months"], ["Reports", "Monthly"]] },
};

export const floors = services.map((s, i) => ({
  level: String(10 - i).padStart(2, "0"),
  slug: s.slug,
  title: s.title,
  short: s.short,
  summary: s.summary,
  ...extra[s.slug],
}));

export type Floor = (typeof floors)[number];

/** Building bounds in the tower photo (tower-pink.webp, 2600×1463), as fractions. */
export const towerBox = { left: 0.385, right: 0.615, top: 0.4, bottom: 1 };
export const towerImage = { src: "/media/tower-pink.webp", w: 2600, h: 1463 };
