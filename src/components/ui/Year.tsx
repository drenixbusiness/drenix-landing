import { cacheLife } from "next/cache";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** Joriy yil — keshlangan holda prerender qilinadi. */
export async function Year() {
  return <>{await currentYear()}</>;
}
