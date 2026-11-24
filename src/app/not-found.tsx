import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The link is outdated or the address has a typo.",
};

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[100svh] flex-col justify-center py-28">
      <Image src="/brand/phoenix.png" alt="" width={64} height={64} className="size-16" />
      <h1 className="wide mt-10 text-[clamp(28px,7vw,52px)] leading-[1.1]">Page not found</h1>
      <p className="mt-4 max-w-md text-[18px] leading-relaxed text-smoke">The link is outdated or the address has a typo. Continue from the home page, or look at the departments.</p>
      <div className="mt-8 flex flex-wrap gap-2.5">
        <Button href="/">Home</Button>
        <Button href="/services" variant="glass">Services</Button>
      </div>
    </section>
  );
}
