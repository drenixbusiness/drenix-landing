import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[100svh] flex-col justify-center pt-[72px]">
      <Image src="/brand/phoenix.png" alt="" width={64} height={64} className="size-16" />
      <p className="wide mt-10 text-[24vw] leading-[0.8] text-ember md:text-[180px]">404</p>
      <h1 className="mt-6 text-3xl font-semibold md:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-graphite/60">The link is outdated or the address has a typo. Continue from the home page.</p>
      <div className="mt-10"><Button href="/">Home</Button></div>
    </section>
  );
}
