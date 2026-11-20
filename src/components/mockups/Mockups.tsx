import type { ReactNode } from "react";
import type { MockKind } from "@/lib/data";
import { Scaled } from "./Scaled";

/*
 * Xizmatlar va loyihalar uchun UI-maketlar. Barchasi 640×440 o‘lchamda chiziladi
 * va <Scaled> orqali konteynerga moslashtiriladi. Raqamlar — interfeys namunasi.
 */

const W = 640;
const H = 440;

function Window({ title, children, light = false, url }: { title: string; children: ReactNode; light?: boolean; url?: string }) {
  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-[14px] border text-[12px] leading-snug shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ${
        light ? "border-black/10 bg-[#f6f3ef] text-[#2a1d17]" : "border-white/10 bg-[#17110e] text-[#efe7dd]"
      }`}
    >
      <div className={`flex h-9 shrink-0 items-center gap-3 border-b px-3.5 ${light ? "border-black/10 bg-white/70" : "border-white/[0.07] bg-[#1d1612]"}`}>
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        {url ? (
          <div className={`mx-auto flex h-6 w-[280px] items-center justify-center rounded-md text-[11px] ${light ? "bg-black/5 text-black/50" : "bg-white/[0.06] text-white/45"}`}>{url}</div>
        ) : (
          <span className={`mx-auto text-[11px] font-medium ${light ? "text-black/50" : "text-white/45"}`}>{title}</span>
        )}
        <span className="w-[42px]" />
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

const muted = "text-[#efe7dd]/45";

/* 01 — Dasturlash: kod muharriri */
function CodeMock() {
  const files = [
    ["app", 0, true], ["layout.tsx", 1], ["page.tsx", 1, false, true], ["checkout", 1, true], ["components", 0, true], ["Cart.tsx", 1], ["Payment.tsx", 1], ["lib", 0, true], ["payme.ts", 1],
  ] as const;
  const k = "text-[#f39a4a]", s = "text-[#9ccf8a]", f = "text-[#7fb6ff]", c = "text-white/30";
  const code: ReactNode[] = [
    <><span className={k}>import</span> {"{ Cart }"} <span className={k}>from</span> <span className={s}>&quot;@/components/Cart&quot;</span>;</>,
    <><span className={k}>import</span> {"{ createPayment }"} <span className={k}>from</span> <span className={s}>&quot;@/lib/payme&quot;</span>;</>,
    <>&nbsp;</>,
    <><span className={c}>{"// Checkout page"}</span></>,
    <><span className={k}>export default async function</span> <span className={f}>Checkout</span>() {"{"}</>,
    <>&nbsp;&nbsp;<span className={k}>const</span> order = <span className={k}>await</span> <span className={f}>getOrder</span>();</>,
    <>&nbsp;&nbsp;<span className={k}>const</span> link = <span className={k}>await</span> <span className={f}>createPayment</span>({"{"}</>,
    <>&nbsp;&nbsp;&nbsp;&nbsp;amount: order.total,</>,
    <>&nbsp;&nbsp;&nbsp;&nbsp;currency: <span className={s}>&quot;UZS&quot;</span>,</>,
    <>&nbsp;&nbsp;{"});"}</>,
    <>&nbsp;</>,
    <>&nbsp;&nbsp;<span className={k}>return</span> &lt;<span className={f}>Cart</span> order={"{order}"} payUrl={"{link}"} /&gt;;</>,
    <>{"}"}</>,
  ];
  return (
    <Window title="drenix-shop — page.tsx">
      <div className="flex h-full">
        <div className="w-[150px] shrink-0 border-r border-white/[0.07] bg-[#140f0c] p-3 font-mono text-[11px]">
          <p className={`mb-2 ${muted}`}>PROJECT</p>
          {files.map(([name, depth, folder, active]) => (
            <div key={name} className={`flex items-center gap-1.5 rounded px-1.5 py-[3px] ${active ? "bg-[#ec6a26]/15 text-[#f39a4a]" : "text-white/65"}`} style={{ paddingLeft: 6 + depth * 12 }}>
              <span className="text-white/30">{folder ? "▾" : "·"}</span>
              {name}
            </div>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-8 items-center gap-4 border-b border-white/[0.07] px-4 text-[11px]">
            <span className="border-b border-[#ec6a26] py-2 text-white/85">page.tsx</span>
            <span className={muted}>Payment.tsx</span>
            <span className={muted}>payme.ts</span>
          </div>
          <div className="flex-1 overflow-hidden px-4 py-3 font-mono text-[11.5px] leading-[20px]">
            {code.map((line, i) => (
              <div key={i} className="flex gap-4 whitespace-nowrap">
                <span className="w-4 text-right text-white/20">{i + 1}</span>
                <span className="text-white/80">{line}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.07] bg-[#120d0b] px-4 py-2.5 font-mono text-[11px]">
            <p className={muted}>$ git push origin main</p>
            <p className="text-[#9ccf8a]">✓ Tests passed (48/48)</p>
            <p className="text-[#9ccf8a]">✓ Deployed to production · 41 s</p>
          </div>
        </div>
      </div>
    </Window>
  );
}

/* 02 — Dizayn: Figma uslubidagi kanvas */
function DesignMock() {
  return (
    <Window title="DRENIX Client — Brand & UI" light>
      <div className="flex h-full">
        <div className="w-[130px] shrink-0 border-r border-black/10 bg-white/60 p-3 text-[11px]">
          <p className="mb-2 font-medium text-black/40">Layers</p>
          {["Home", "  Header", "  Hero", "  Products", "Mobile / Catalog", "Logo", "Colors"].map((l, i) => (
            <p key={i} className={`truncate rounded px-1.5 py-[3px] ${i === 2 ? "bg-[#ec6a26]/15 text-[#c4450f]" : "text-black/65"}`}>{l}</p>
          ))}
        </div>
        <div className="relative flex-1 bg-[#e9e4de] p-5">
          <div className="absolute left-5 top-4 text-[10px] text-black/40">Home — 1440</div>
          <div className="absolute left-5 top-8 h-[250px] w-[260px] overflow-hidden rounded-md bg-[#1a1210] shadow-lg">
            <div className="flex items-center justify-between px-3 py-2.5 text-[8px] text-white/60"><span className="font-bold tracking-[0.2em] text-white">NOVA</span><span>Catalog · About · Contact</span></div>
            <div className="px-3 pt-4">
              <p className="text-[26px] font-extrabold uppercase leading-[0.9] text-white" style={{ fontStretch: "72%" }}>Fresh<br />coffee<br />daily</p>
              <div className="mt-3 h-5 w-20 rounded-full bg-[#ec6a26]" />
            </div>
            <div className="absolute -right-6 bottom-[-20px] size-36 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f6b77a,#c65a22_55%,#5a2010)]" />
            <div className="absolute inset-0 rounded-md ring-2 ring-[#2f80ed]" />
            <span className="absolute -top-0 left-0 rounded-br bg-[#2f80ed] px-1.5 text-[9px] text-white">Hero · 1440×720</span>
          </div>
          <div className="absolute right-5 top-8 h-[290px] w-[140px] overflow-hidden rounded-[18px] border-[5px] border-[#1a1210] bg-white shadow-lg">
            <div className="px-2.5 pt-3 text-[8px] font-bold tracking-[0.2em]">NOVA</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 px-2.5">
              {["#f3d9c2", "#e9b48c", "#d98a59", "#b9612f"].map((c) => (
                <div key={c} className="rounded-md p-1" style={{ background: c }}>
                  <div className="h-10 rounded bg-white/40" />
                  <div className="mt-1 h-1.5 w-8 rounded bg-black/30" />
                </div>
              ))}
            </div>
            <div className="mx-2.5 mt-2 h-6 rounded-full bg-[#1a1210]" />
          </div>
          <div className="absolute bottom-4 left-5 flex gap-2">
            {["#1a1210", "#ec6a26", "#f39a4a", "#efe7dd"].map((c) => (
              <div key={c} className="text-[9px] text-black/50">
                <div className="mb-1 size-9 rounded-md border border-black/10" style={{ background: c }} />
                {c}
              </div>
            ))}
          </div>
        </div>
        <div className="w-[120px] shrink-0 border-l border-black/10 bg-white/60 p-3 text-[10.5px] text-black/60">
          <p className="mb-2 font-medium text-black/40">Text</p>
          <p className="text-[30px] font-extrabold leading-none text-black" style={{ fontStretch: "72%" }}>Aa</p>
          <p className="mt-1">Archivo Condensed</p>
          <p>Bold · 64/58</p>
          <p className="mb-2 mt-4 font-medium text-black/40">Layout</p>
          <div className="grid grid-cols-2 gap-1">
            {["X 0", "Y 96", "W 1440", "H 720"].map((v) => <span key={v} className="rounded bg-black/5 px-1.5 py-1">{v}</span>)}
          </div>
          <p className="mb-2 mt-4 font-medium text-black/40">Fill</p>
          <div className="flex items-center gap-1.5"><span className="size-4 rounded bg-[#1a1210]" />1A1210</div>
        </div>
      </div>
    </Window>
  );
}

/* 03 — Marketing: reklama dashboardi */
function AdsMock() {
  const pts = [38, 42, 40, 51, 49, 58, 63, 60, 71, 76, 74, 86];
  const pts2 = [60, 58, 61, 55, 52, 50, 47, 46, 43, 41, 40, 37];
  const path = (p: number[]) => p.map((v, i) => `${i ? "L" : "M"}${(i / (p.length - 1)) * 360} ${110 - v}`).join(" ");
  const channels = [
    ["Meta Ads", "$1,450", "612", 82],
    ["Google Ads", "$880", "348", 58],
    ["Telegram Ads", "$540", "221", 41],
    ["Yandex Direct", "$320", "103", 24],
  ] as const;
  return (
    <Window title="Marketing report — November">
      <div className="grid h-full grid-cols-3 gap-3 p-4">
        {[["Leads", "1,284", "+18%"], ["Cost per lead", "$2.50", "−12%"], ["ROMI", "312%", "+41%"]].map(([l, v, d]) => (
          <div key={l} className="rounded-lg border border-white/[0.07] bg-[#1e1713] p-3">
            <p className={muted}>{l}</p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums">{v}</p>
            <p className="text-[11px] text-[#9ccf8a]">{d} vs last month</p>
          </div>
        ))}
        <div className="col-span-2 rounded-lg border border-white/[0.07] bg-[#1e1713] p-3">
          <div className="flex justify-between"><p className="font-medium">Leads and cost per lead</p><p className={muted}>12 weeks</p></div>
          <svg viewBox="0 0 360 120" className="mt-2 h-[120px] w-full" preserveAspectRatio="none">
            {[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="360" y1={i * 36 + 4} y2={i * 36 + 4} stroke="white" strokeOpacity="0.06" />)}
            <path d={`${path(pts)} L360 120 L0 120 Z`} fill="#ec6a26" fillOpacity="0.15" />
            <path d={path(pts)} fill="none" stroke="#ec6a26" strokeWidth="2" />
            <path d={path(pts2)} fill="none" stroke="#efe7dd" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
          <div className="mt-1 flex gap-4 text-[11px]"><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-[#ec6a26]" />Leads</span><span className={`flex items-center gap-1.5 ${muted}`}><span className="h-0.5 w-3 bg-white/40" />Cost per lead</span></div>
        </div>
        <div className="rounded-lg border border-white/[0.07] bg-[#1e1713] p-3">
          <p className="font-medium">Sources</p>
          <svg viewBox="0 0 100 100" className="mx-auto mt-2 size-[96px] -rotate-90">
            {[[48, "#ec6a26", 0], [27, "#f39a4a", 48], [17, "#efe7dd", 75], [8, "#6b5a50", 92]].map(([v, c, o]) => (
              <circle key={c as string} cx="50" cy="50" r="38" fill="none" stroke={c as string} strokeWidth="14" pathLength="100" strokeDasharray={`${v} 100`} strokeDashoffset={-(o as number)} />
            ))}
          </svg>
          <p className={`mt-2 text-center ${muted}`}>Meta share 48%</p>
        </div>
        <div className="col-span-3 rounded-lg border border-white/[0.07] bg-[#1e1713] px-3 py-2">
          {channels.map(([n, spend, leads, w]) => (
            <div key={n} className="grid grid-cols-[110px_1fr_70px_40px] items-center gap-3 py-[3px]">
              <span>{n}</span>
              <span className="h-1.5 rounded-full bg-white/5"><span className="block h-full rounded-full bg-[#ec6a26]" style={{ width: `${w}%` }} /></span>
              <span className={`text-right tabular-nums ${muted}`}>{spend}</span>
              <span className="text-right tabular-nums">{leads}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

/* 04 — Biznes: yo‘l xaritasi */
function RoadmapMock() {
  const rows = [
    ["Business audit", 0, 2, "#efe7dd"],
    ["Sales team and scripts", 1, 4, "#f39a4a"],
    ["CRM rollout", 2, 5, "#ec6a26"],
    ["Marketing rebuild", 3, 8, "#f39a4a"],
    ["Second branch", 6, 11, "#d23a14"],
    ["Financial controls", 1, 12, "#6b5a50"],
  ] as const;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return (
    <Window title="Growth roadmap — 2026">
      <div className="flex h-full flex-col p-4">
        <div className="mb-3 grid grid-cols-3 gap-3">
          {[["Revenue target", "+35%"], ["Conversion", "8% → 14%"], ["Tasks", "42 / 67"]].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-white/[0.07] bg-[#1e1713] p-3">
              <p className={muted}>{l}</p>
              <p className="mt-1 text-[19px] font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-lg border border-white/[0.07] bg-[#1e1713] p-3">
          <div className="grid grid-cols-[150px_1fr] text-[10.5px]">
            <span />
            <div className="grid grid-cols-12">{months.map((m) => <span key={m} className={`${muted} text-center`}>{m}</span>)}</div>
          </div>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-[150px] right-0 grid grid-cols-12">
              {months.map((m) => <span key={m} className="border-l border-white/[0.05]" />)}
            </div>
            <div className="pointer-events-none absolute inset-y-0 w-px bg-[#ec6a26]" style={{ left: `calc(150px + (100% - 150px) * ${10.5 / 12})` }} />
            {rows.map(([name, a, b, c]) => (
              <div key={name} className="relative grid grid-cols-[150px_1fr] items-center py-[7px]">
                <span className="truncate pr-2">{name}</span>
                <div className="relative h-5">
                  <div className="absolute inset-y-0 rounded" style={{ left: `${(a / 12) * 100}%`, width: `${((b - a) / 12) * 100}%`, background: c, opacity: 0.9 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}

/* 05 — Startap: pitch-deck */
function PitchMock() {
  return (
    <Window title="Hunarmand — Pitch Deck.pdf" light>
      <div className="flex h-full">
        <div className="w-[104px] shrink-0 space-y-2 overflow-hidden border-r border-black/10 bg-white/50 p-2.5">
          {["Problem", "Solution", "Market", "Traction", "Team"].map((t, i) => (
            <div key={t} className={`rounded border p-1.5 ${i === 3 ? "border-[#ec6a26] ring-2 ring-[#ec6a26]/30" : "border-black/10"} bg-white`}>
              <div className="mb-1 text-[7px] text-black/40">{String(i + 2).padStart(2, "0")}</div>
              <div className="text-[9px] font-bold uppercase" style={{ fontStretch: "75%" }}>{t}</div>
              <div className="mt-1 h-5 rounded-sm bg-black/[0.06]" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-center justify-center bg-[#e9e4de] p-5">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-[#1a1210] p-6 text-[#efe7dd] shadow-xl">
            <p className="text-[10px] uppercase tracking-wider text-white/40">05 · Traction</p>
            <p className="mt-2 text-[34px] font-extrabold uppercase leading-[0.9]" style={{ fontStretch: "72%" }}><span className="text-[#f39a4a]">4,200</span> sellers<br />in 6 months</p>
            <div className="absolute bottom-6 right-6 flex h-[120px] items-end gap-2">
              {[14, 22, 31, 45, 63, 92].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-7 rounded-t-sm" style={{ height: h, background: i === 5 ? "#ec6a26" : "rgba(239,231,221,0.2)" }} />
                  <span className="text-[8px] text-white/40">{["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i]}</span>
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-6 flex gap-5 text-[10px]">
              <div><p className="text-white/40">Monthly growth</p><p className="text-[16px] font-semibold">+38%</p></div>
              <div><p className="text-white/40">GMV</p><p className="text-[16px] font-semibold">$184K</p></div>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}

/* 06 — AI: chat-bot */
function ChatMock() {
  return (
    <Window title="Telegram — Ilm Academy bot">
      <div className="flex h-full">
        <div className="flex flex-1 flex-col bg-[#120d0b]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-4 py-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-[#ec6a26] text-[12px] font-bold text-[#17110e]">IA</span>
            <div><p className="font-medium">Ilm Academy</p><p className="text-[10.5px] text-[#9ccf8a]">bot · online</p></div>
          </div>
          <div className="flex-1 space-y-2.5 overflow-hidden p-4 text-[12px]">
            <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-md bg-[#ec6a26] px-3 py-2 text-[#17110e]">Hi! I’d like to sign up for the IELTS course. Is there an evening group?</div>
            <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-[#241b17] px-3 py-2">Hello! Yes, the evening group meets Monday, Wednesday and Friday at 18:30. There are 3 seats left. Would you like a free placement test?</div>
            <div className="ml-auto max-w-[60%] rounded-2xl rounded-br-md bg-[#ec6a26] px-3 py-2 text-[#17110e]">Yes, can I come tomorrow?</div>
            <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-[#241b17] px-3 py-2">Of course. Does 15:00 or 17:00 tomorrow work? Please send your name and phone number.</div>
            <div className="mx-auto w-fit rounded-full border border-white/10 px-3 py-1 text-[10.5px] text-white/50">CRM: new lead created · #4821</div>
          </div>
          <div className="m-3 flex items-center rounded-full bg-[#241b17] px-4 py-2 text-white/35">Write a message…</div>
        </div>
        <div className="w-[170px] shrink-0 space-y-3 border-l border-white/[0.07] p-3.5">
          <p className="font-medium">Today</p>
          {[["Conversations", "214"], ["Resolved by bot", "87%"], ["Sign-ups", "36"], ["Avg. response", "3 s"]].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-white/[0.07] bg-[#1e1713] p-2.5">
              <p className={`text-[10.5px] ${muted}`}>{l}</p>
              <p className="text-[18px] font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

/* 07 — DevOps: CI/CD va uptime */
function PipelineMock() {
  const stages = [["Build", "1m 12s"], ["Tests", "2m 40s"], ["Security", "38s"], ["Staging", "54s"], ["Production", "41s"]];
  return (
    <Window title="Deploy #1842 — main">
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="rounded-lg border border-white/[0.07] bg-[#1e1713] p-3.5">
          <div className="flex items-center justify-between"><p className="font-medium">feat: update checkout page</p><p className="text-[#9ccf8a]">● Succeeded · 6m 05s</p></div>
          <div className="mt-4 flex items-center">
            {stages.map(([n, t], i) => (
              <div key={n} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="grid size-7 place-items-center rounded-full bg-[#9ccf8a]/15 text-[#9ccf8a]">✓</span>
                  <span className="text-[11px]">{n}</span>
                  <span className={`text-[10px] ${muted}`}>{t}</span>
                </div>
                {i < stages.length - 1 && <span className="mx-1 mb-8 h-px flex-1 bg-[#9ccf8a]/40" />}
              </div>
            ))}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-3">
          <div className="col-span-2 rounded-lg border border-white/[0.07] bg-[#1e1713] p-3">
            <div className="flex justify-between"><p className="font-medium">Uptime, 90 days</p><p className="font-semibold text-[#9ccf8a]">99.98%</p></div>
            <div className="mt-3 flex h-9 gap-[2px]">
              {Array.from({ length: 60 }).map((_, i) => (
                <span key={i} className="flex-1 rounded-[1px]" style={{ background: i === 37 ? "#f39a4a" : "#9ccf8a", opacity: i === 37 ? 1 : 0.7 }} />
              ))}
            </div>
            <div className="mt-4 space-y-1 font-mono text-[10.5px] text-white/55">
              <p>14:02:11 api-7f9c · health ok · 42 ms</p>
              <p>14:02:11 web-2b1a · health ok · 18 ms</p>
              <p className="text-[#f39a4a]">14:01:58 autoscale: 3 → 5 replica</p>
            </div>
          </div>
          <div className="space-y-3">
            {[["Response time", "84 ms"], ["Requests/min", "12.4K"], ["Server cost", "−28%"]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-white/[0.07] bg-[#1e1713] p-2.5">
                <p className={`text-[10.5px] ${muted}`}>{l}</p>
                <p className="text-[17px] font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}

/* 08 — Xavfsizlik: audit hisoboti */
function SecurityMock() {
  const items = [
    ["High", "SQL injection: /api/search parameter", "Fixed", "#d23a14"],
    ["High", "No 2FA on the admin panel", "Fixed", "#d23a14"],
    ["Medium", "Outdated library: lodash 4.17.15", "Fixed", "#f39a4a"],
    ["Medium", "Cookie missing the Secure flag", "In progress", "#f39a4a"],
    ["Low", "Server version exposed in headers", "In progress", "#9c8f82"],
  ] as const;
  return (
    <Window title="Security audit — report">
      <div className="grid h-full grid-cols-[180px_1fr] gap-3 p-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-white/[0.07] bg-[#1e1713] p-3">
          <svg viewBox="0 0 100 100" className="size-[110px] -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="9" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#9ccf8a" strokeWidth="9" pathLength="100" strokeDasharray="86 100" strokeLinecap="round" />
          </svg>
          <p className="-mt-[72px] text-[30px] font-bold">A</p>
          <p className={`mb-8 ${muted}`}>before: D</p>
          <p className="mt-6 text-center text-[11px] text-white/55">23 checks<br />5 findings</p>
        </div>
        <div className="rounded-lg border border-white/[0.07] bg-[#1e1713] p-3">
          <div className="mb-2 flex justify-between"><p className="font-medium">Findings</p><p className={muted}>OWASP Top 10</p></div>
          {items.map(([sev, t, st, c]) => (
            <div key={t} className="grid grid-cols-[62px_1fr_76px] items-center gap-2 border-t border-white/[0.06] py-2.5">
              <span className="w-fit rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: `${c}26`, color: c }}>{sev}</span>
              <span className="truncate">{t}</span>
              <span className={`text-right text-[11px] ${st === "Fixed" ? "text-[#9ccf8a]" : "text-[#f39a4a]"}`}>{st}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

/* 09 — CRM: savdo voronkasi */
function CrmMock() {
  const cols = [
    ["New lead", "12", [["Asia Trans", "$3,800", "AK"], ["Sirdaryo Agro", "$9,500", "DS"], ["MegaBuild", "$2,800", "AK"]]],
    ["Negotiation", "7", [["Navoiy Steel", "$24,500", "JR"], ["Smart Office", "$1,700", "DS"]]],
    ["Proposal", "5", [["Orient Group", "$14,600", "AK"], ["Baraka Foods", "$5,100", "JR"]]],
    ["Won", "9", [["Tashkent Logistic", "$7,300", "DS"], ["UzPack", "$3,200", "AK"]]],
  ] as const;
  return (
    <Window title="CRM — Sales pipeline">
      <div className="flex h-full flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-2 text-[11px]">
            {["All deals", "Mine", "This month"].map((t, i) => <span key={t} className={`rounded-full px-2.5 py-1 ${i === 0 ? "bg-white/10" : "text-white/45"}`}>{t}</span>)}
          </div>
          <p className={muted}>Pipeline: <span className="font-semibold text-white/85">$88.5K</span></p>
        </div>
        <div className="grid flex-1 grid-cols-4 gap-2.5">
          {cols.map(([title, n, cards], ci) => (
            <div key={title} className="rounded-lg bg-[#1e1713] p-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="font-medium">{title}</span>
                <span className={`rounded-full px-1.5 text-[10px] ${ci === 3 ? "bg-[#9ccf8a]/15 text-[#9ccf8a]" : "bg-white/10 text-white/60"}`}>{n}</span>
              </div>
              <div className="space-y-2">
                {cards.map(([c, sum, who]) => (
                  <div key={c} className={`rounded-md border p-2 ${ci === 1 && c === "Navoiy Steel" ? "border-[#ec6a26]/60 bg-[#ec6a26]/10" : "border-white/[0.07] bg-[#241b17]"}`}>
                    <p className="truncate font-medium">{c}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="tabular-nums text-white/60">{sum}</span>
                      <span className="grid size-5 place-items-center rounded-full bg-white/10 text-[8.5px]">{who}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

/* 10 — Autsorsing: texnik yordam va SLA */
function SupportMock() {
  const tickets = [
    ["#2291", "Error 500 on the checkout page", "Critical", "14 min", "SR"],
    ["#2290", "Add a new column to the report", "Medium", "3 hrs", "AN"],
    ["#2288", "Push notifications not arriving in the app", "High", "52 min", "JB"],
    ["#2285", "Grant access to a new employee", "Low", "1 day", "AN"],
    ["#2284", "Improve site speed", "Medium", "Done", "SR"],
  ] as const;
  const color: Record<string, string> = { Critical: "#d23a14", High: "#ec6a26", Medium: "#f39a4a", Low: "#9c8f82" };
  return (
    <Window title="Support — Tickets">
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="grid grid-cols-4 gap-3">
          {[["SLA met", "98.6%"], ["Open", "7"], ["Avg. response", "11 min"], ["Resolved this month", "126"]].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-white/[0.07] bg-[#1e1713] p-2.5">
              <p className={`text-[10.5px] ${muted}`}>{l}</p>
              <p className="text-[18px] font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-lg border border-white/[0.07] bg-[#1e1713] px-3 py-1">
          {tickets.map(([id, t, p, sla, who]) => (
            <div key={id} className="grid grid-cols-[48px_1fr_64px_70px_26px] items-center gap-2 border-b border-white/[0.06] py-3 last:border-0">
              <span className={`font-mono text-[11px] ${muted}`}>{id}</span>
              <span className="truncate">{t}</span>
              <span className="flex items-center gap-1.5 text-[11px]"><span className="size-1.5 rounded-full" style={{ background: color[p] }} />{p}</span>
              <span className={`text-right text-[11px] tabular-nums ${sla === "Done" ? "text-[#9ccf8a]" : "text-white/70"}`}>{sla}</span>
              <span className="grid size-6 place-items-center rounded-full bg-white/10 text-[9px]">{who}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

const registry: Record<MockKind, () => ReactNode> = {
  code: CodeMock,
  design: DesignMock,
  ads: AdsMock,
  roadmap: RoadmapMock,
  pitch: PitchMock,
  chat: ChatMock,
  pipeline: PipelineMock,
  security: SecurityMock,
  crm: CrmMock,
  support: SupportMock,
};

export function Mockup({ kind, className = "" }: { kind: MockKind; className?: string }) {
  const Comp = registry[kind];
  return (
    <Scaled width={W} height={H} className={className}>
      <Comp />
    </Scaled>
  );
}
