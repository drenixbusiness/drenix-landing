// Company details.
// TODO: replace phone, email, address and social links with the real ones.
export const site = {
  name: "DRENIX",
  description:
    "DRENIX is an IT company in Tashkent. Websites and apps, design, marketing, CRM, AI automation and startup support.",
  url: "https://drenix.uz",
  email: "info@drenix.uz",
  phone: "+998 90 000 00 00",
  phoneHref: "tel:+998900000000",
  telegram: "@drenix",
  telegramHref: "https://t.me/drenix",
  address: "Tashkent, Uzbekistan",
  hours: "Monday–Friday, 9:00–19:00",
  socials: [
    { label: "Telegram", href: "https://t.me/drenix" },
    { label: "Instagram", href: "https://instagram.com/drenix" },
    { label: "LinkedIn", href: "https://linkedin.com/company/drenix" },
  ],
} as const;

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/startups", label: "Startups" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "Company" },
  { href: "/contact", label: "Contact" },
] as const;
