import type { SVGProps } from "react";

/**
 * One line-icon set for the whole site (24 px grid, 1.6 px stroke).
 * Decorative by default; give the control around it a text label.
 */
const paths = {
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  "arrow-left": "M19 12H5M11 6l-6 6 6 6",
  "arrow-up": "M12 19V5M6 11l6-6 6 6",
  "arrow-down": "M12 5v14M6 13l6 6 6-6",
  "arrow-up-right": "M7 17 17 7M8 7h9v9",
  check: "M5 12.5l4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  alert: "M12 8v5M12 16.5v.01M12 3.5 2.8 19.5h18.4L12 3.5Z",
  clock: "M12 7.5V12l3 2M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z",
  box: "M12 3.5 4 7.5v9l8 4 8-4v-9l-8-4ZM4 7.5l8 4 8-4M12 11.5v9",
  skip: "M6 6l6 6-6 6M13 6l6 6-6 6",
  // Departments
  code: "M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13",
  pen: "M4.5 19.5l1-4.2L15.8 5a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.7 18.5l-4.2 1ZM13.8 7l3.2 3.2",
  chart: "M4.5 19.5h15M7 16v-4M12 16V7M17 16v-6.5",
  compass: "M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  rocket: "M9 15l-2.5-2.5C8 8 12 4 19.5 4.5 20 12 16 16 11.5 17.5L9 15ZM9 15l-3.5 3.5M6.5 12.5H4l2-4h3M11.5 17.5V20l4-2v-3M15 9v.01",
  spark: "M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6L4.5 11l5.6-1.9L12 3.5ZM18.5 16.5v4M16.5 18.5h4",
  cloud: "M7.5 18.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6 1.1 3.5 3.5 0 0 1-.7 6.9H7.5Z",
  shield: "M12 3.5 5 6v5.5c0 4.4 2.9 7.6 7 9 4.1-1.4 7-4.6 7-9V6l-7-2.5ZM9 12l2.2 2.2L15.2 10",
  layers: "M12 4 3.5 8.5 12 13l8.5-4.5L12 4ZM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5",
  users: "M9 11.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM3.5 19c.4-3 2.6-4.8 5.5-4.8s5.1 1.8 5.5 4.8M15.5 5.4a3.2 3.2 0 0 1 0 5.8M17 14.5c2 .6 3.2 2.2 3.5 4.5",
  // Rooms
  door: "M6.5 20.5v-16h11v16M4 20.5h16M14 12.5v.01",
  table: "M3.5 9.5h17M6 9.5v9M18 9.5v9M8.5 9.5V6h7v3.5",
  search: "M11 17.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM20 20l-4.4-4.4",
  monitor: "M4 5h16v11H4V5ZM9 20h6M12 16v4",
  flask: "M9.5 3.5h5M10.5 3.5v6L5 18.5a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5.5-9v-6M7.5 15h9",
  flag: "M6 20.5v-16M6 5c4-2 7 2 12 0v8c-5 2-8-2-12 0",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-4", ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden="true" {...rest}>
      <path d={paths[name]} />
    </svg>
  );
}

/** Icon of a department by service slug. */
export const departmentIcon: Record<string, IconName> = {
  "web-and-mobile-development": "code",
  "ui-ux-design-and-branding": "pen",
  "digital-marketing": "chart",
  "business-development": "compass",
  "startup-support": "rocket",
  "ai-and-automation": "spark",
  "cloud-and-devops": "cloud",
  cybersecurity: "shield",
  "crm-and-erp": "layers",
  "it-outsourcing": "users",
};

/** Icon of a room by its place in the project. */
export const zoneIcon: Record<string, IconName> = {
  lounge: "door",
  meeting: "table",
  focus: "search",
  west: "monitor",
  east: "flask",
  lead: "flag",
};
