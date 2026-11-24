import type { Metadata, Viewport } from "next";
import { Inter, Michroma } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { RevealObserver } from "@/components/ui/RevealObserver";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const michroma = Michroma({ variable: "--font-michroma", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "DRENIX — IT company: development, design, marketing, startups",
    template: "%s | DRENIX",
  },
  description: site.description,
  keywords: ["IT company", "web development", "mobile apps", "marketing", "SMM", "startups", "business development", "Tashkent", "DRENIX"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DRENIX",
    title: "DRENIX — IT company",
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#efede8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${michroma.variable} antialiased`}>
      <body className="min-h-dvh">
        {/* Without JavaScript nothing animates in, so nothing may stay hidden */}
        <noscript><style>{`.reveal,.hero-in{opacity:1!important;translate:none!important}.lines>span>span{translate:none!important}`}</style></noscript>
        <a href="#content" className="skip-link">Skip to content</a>
        <SmoothScroll>
          <Header />
          <main id="content" tabIndex={-1} className="outline-none">{children}</main>
          <Footer />
        </SmoothScroll>
        <RevealObserver />
      </body>
    </html>
  );
}
