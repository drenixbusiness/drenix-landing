/**
 * What the monitors show. Each department gets four small screens drawn on one canvas (2 × 2),
 * so the same office looks different on every floor. Purely decorative.
 */

type Ctx = CanvasRenderingContext2D;
type Painter = (c: Ctx, w: number, h: number, accent: string, rnd: () => number) => void;

const BG = "#12151b";
const DIM = "rgba(255,255,255,0.16)";
const MID = "rgba(255,255,255,0.42)";
const HI = "rgba(255,255,255,0.86)";

const bar = (c: Ctx, x: number, y: number, w: number, h: number, color: string, r = 4) => {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
};

const code: Painter = (c, w, h, accent, rnd) => {
  bar(c, 0, 0, w * 0.2, h, "#0d1015", 0);
  for (let i = 0; i < 9; i++) bar(c, 18, 26 + i * 30, 40 + rnd() * 36, 8, i === 2 ? accent : DIM);
  let y = 26;
  while (y < h - 20) {
    let x = w * 0.24 + (Math.floor(rnd() * 4) * 22);
    const parts = 1 + Math.floor(rnd() * 4);
    for (let p = 0; p < parts && x < w - 60; p++) {
      const l = 24 + rnd() * 90;
      bar(c, x, y, l, 9, [accent, MID, "#7fb6ff", "#9ccf8a", DIM][Math.floor(rnd() * 5)]);
      x += l + 10;
    }
    y += 22;
  }
};

const terminal: Painter = (c, w, h, accent, rnd) => {
  for (let i = 0; i < 12; i++) {
    const y = 24 + i * 23;
    bar(c, 22, y, 10, 10, accent);
    bar(c, 44, y, 80 + rnd() * 260, 9, rnd() > 0.7 ? accent : MID);
  }
  bar(c, 22, 24 + 12 * 23, 14, 14, HI, 0);
};

const bars: Painter = (c, w, h, accent, rnd) => {
  bar(c, 24, 22, 120, 12, HI);
  bar(c, 24, 44, 70, 8, DIM);
  const n = 10, bw = (w - 60) / n;
  for (let i = 0; i < n; i++) {
    const bh = (0.2 + 0.7 * (i / n) * (0.6 + rnd() * 0.5)) * (h - 120);
    bar(c, 28 + i * bw, h - 28 - bh, bw * 0.62, bh, i > 6 ? accent : DIM, 5);
  }
};

const lines: Painter = (c, w, h, accent, rnd) => {
  bar(c, 24, 22, 130, 12, HI);
  for (let k = 0; k < 4; k++) bar(c, 24, 80 + k * 55, w - 48, 1.5, "rgba(255,255,255,0.08)", 0);
  for (const [col, off] of [[MID, 0.2], [accent, 0]] as const) {
    c.strokeStyle = col;
    c.lineWidth = 5;
    c.lineJoin = "round";
    c.beginPath();
    for (let i = 0; i <= 14; i++) {
      const x = 24 + (i / 14) * (w - 48);
      const y = h - 40 - (i / 14) * (h - 140) * (0.75 - off) - Math.sin(i * 1.1 + off * 9) * 14 - rnd() * 18;
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
  }
};

const kanban: Painter = (c, w, h, accent, rnd) => {
  const cw = (w - 80) / 4;
  for (let k = 0; k < 4; k++) {
    const x = 20 + k * (cw + 13);
    bar(c, x, 20, cw * 0.6, 10, MID);
    let y = 44;
    const n = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const ch = 46 + rnd() * 26;
      bar(c, x, y, cw, ch, "#1f242d", 8);
      bar(c, x + 10, y + 12, cw * 0.6, 7, HI);
      bar(c, x + 10, y + 27, cw * 0.4, 6, i === 0 && k === 2 ? accent : DIM);
      y += ch + 10;
    }
  }
};

const table: Painter = (c, w, h, accent, rnd) => {
  bar(c, 20, 18, w - 40, 26, "#1f242d", 6);
  for (let i = 0; i < 9; i++) {
    const y = 58 + i * 27;
    bar(c, 28, y, 90 + rnd() * 50, 8, MID);
    bar(c, 200, y, 60 + rnd() * 50, 8, DIM);
    bar(c, 330, y, 40 + rnd() * 30, 8, DIM);
    bar(c, w - 110, y - 4, 70, 16, rnd() > 0.6 ? accent : "#2a313c", 8);
  }
};

const swatches: Painter = (c, w, h, accent) => {
  c.fillStyle = "#f3efe9";
  c.fillRect(0, 0, w, h);
  const cols = [accent, "#141414", "#f39a4a", "#c9b8a2", "#6d6862", "#efe1d2"];
  cols.forEach((k, i) => bar(c, 24 + (i % 3) * 150, 24 + Math.floor(i / 3) * 110, 134, 94, k, 10));
  bar(c, 24, 252, 220, 18, "#141414");
  bar(c, 24, 280, 150, 10, "rgba(0,0,0,0.3)");
};

const artboards: Painter = (c, w, h, accent) => {
  c.fillStyle = "#e6e0d8";
  c.fillRect(0, 0, w, h);
  bar(c, 22, 26, 210, 150, "#1a1512", 8);
  bar(c, 40, 50, 110, 22, HI);
  bar(c, 40, 80, 80, 22, HI);
  bar(c, 40, 120, 70, 20, accent, 10);
  bar(c, 260, 26, 92, 190, "#ffffff", 14);
  bar(c, 272, 44, 68, 60, accent, 8);
  bar(c, 272, 116, 60, 9, "rgba(0,0,0,0.5)");
  bar(c, 272, 134, 44, 8, "rgba(0,0,0,0.25)");
  bar(c, 380, 26, 100, 100, "#ffffff", 8);
  c.strokeStyle = accent;
  c.lineWidth = 7;
  c.beginPath();
  c.moveTo(398, 106);
  c.bezierCurveTo(400, 40, 460, 110, 464, 46);
  c.stroke();
  bar(c, 22, 200, 210, 90, "#ffffff", 8);
  for (let i = 0; i < 4; i++) bar(c, 38 + i * 48, 222, 34, 46, i % 2 ? "#efe6da" : "#d8cfc2", 6);
};

const chat: Painter = (c, w, h, accent, rnd) => {
  let y = 22;
  for (let i = 0; i < 6; i++) {
    const me = i % 2 === 1;
    const bw = 150 + rnd() * 150;
    const bh = 34 + (i % 3) * 8;
    bar(c, me ? w - bw - 24 : 24, y, bw, bh, me ? accent : "#232934", 14);
    bar(c, (me ? w - bw - 24 : 24) + 14, y + bh / 2 - 4, bw - 60, 8, me ? "rgba(255,255,255,0.8)" : MID);
    y += bh + 12;
  }
};

const graph: Painter = (c, w, h, accent, rnd) => {
  const pts = Array.from({ length: 12 }, () => [40 + rnd() * (w - 80), 34 + rnd() * (h - 68)] as const);
  c.lineWidth = 2;
  c.strokeStyle = "rgba(255,255,255,0.2)";
  pts.forEach((a, i) => pts.slice(i + 1).forEach((b) => {
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 170) return;
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0], b[1]);
    c.stroke();
  }));
  pts.forEach(([x, y], i) => {
    c.fillStyle = i % 4 === 0 ? accent : HI;
    c.beginPath();
    c.arc(x, y, i % 4 === 0 ? 15 : 8, 0, 7);
    c.fill();
  });
};

const gantt: Painter = (c, w, h, accent, rnd) => {
  bar(c, 22, 20, 120, 12, HI);
  for (let i = 0; i < 8; i++) {
    const x = 130 + i * 24 + rnd() * 30;
    bar(c, 22, 56 + i * 31, 80, 9, DIM);
    bar(c, x, 50 + i * 31, 90 + rnd() * 70, 18, i % 3 === 0 ? accent : "#2c3441", 9);
  }
};

const radar: Painter = (c, w, h, accent, rnd) => {
  const cx = w * 0.36, cy = h / 2, r = h * 0.4;
  c.strokeStyle = "rgba(255,255,255,0.16)";
  c.lineWidth = 2;
  for (let k = 1; k <= 3; k++) {
    c.beginPath();
    c.arc(cx, cy, (r * k) / 3, 0, 7);
    c.stroke();
  }
  c.fillStyle = accent + "55";
  c.beginPath();
  c.moveTo(cx, cy);
  c.arc(cx, cy, r, -0.9, 0.1);
  c.fill();
  for (let i = 0; i < 6; i++) {
    const a = rnd() * 6.3, d = rnd() * r;
    c.fillStyle = i < 2 ? "#ff5a4d" : accent;
    c.beginPath();
    c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 6, 0, 7);
    c.fill();
  }
  for (let i = 0; i < 8; i++) bar(c, w * 0.7, 34 + i * 32, 50 + rnd() * 80, 10, i < 2 ? "#ff5a4d" : i < 4 ? "#f39a4a" : DIM);
};

const servers: Painter = (c, w, h, accent, rnd) => {
  for (let x = 0; x < 6; x++)
    for (let y = 0; y < 5; y++) {
      bar(c, 20 + x * 80, 22 + y * 56, 70, 46, "#1c222c", 7);
      bar(c, 30 + x * 80, 34 + y * 56, 10, 10, rnd() > 0.12 ? accent : "#ff5a4d", 5);
      bar(c, 48 + x * 80, 36 + y * 56, 32, 6, DIM);
      bar(c, 30 + x * 80, 52 + y * 56, 50 * rnd(), 5, MID);
    }
};

const pipeline: Painter = (c, w, h, accent) => {
  const xs = [60, 165, 270, 375, 460];
  c.strokeStyle = "rgba(255,255,255,0.22)";
  c.lineWidth = 4;
  for (let row = 0; row < 3; row++) {
    const y = 70 + row * 90;
    c.beginPath();
    c.moveTo(xs[0], y);
    c.lineTo(xs[4], y);
    c.stroke();
    xs.forEach((x, i) => {
      c.fillStyle = i <= 3 - row ? accent : "#2c3441";
      c.beginPath();
      c.arc(x, y, 17, 0, 7);
      c.fill();
      bar(c, x - 22, y + 28, 44, 7, DIM);
    });
  }
};

const slide: Painter = (c, w, h, accent) => {
  c.fillStyle = "#f6f2ec";
  c.fillRect(0, 0, w, h);
  bar(c, 30, 34, 250, 30, "#141414");
  bar(c, 30, 74, 180, 30, "#141414");
  bar(c, 30, 124, 200, 10, "rgba(0,0,0,0.3)");
  bar(c, 30, 144, 160, 10, "rgba(0,0,0,0.3)");
  c.fillStyle = accent;
  c.beginPath();
  c.moveTo(w - 210, h - 40);
  c.quadraticCurveTo(w - 80, h - 60, w - 40, 50);
  c.lineTo(w - 40, h - 40);
  c.fill();
};

const calendar: Painter = (c, w, h, accent, rnd) => {
  for (let x = 0; x < 7; x++)
    for (let y = 0; y < 5; y++) {
      bar(c, 20 + x * 68, 24 + y * 56, 58, 46, "#1c222c", 7);
      if (rnd() > 0.6) bar(c, 28 + x * 68, 48 + y * 56, 40, 9, rnd() > 0.5 ? accent : MID);
    }
};

/** Same order as `departments`. */
const SETS: { accent: string; p: [Painter, Painter, Painter, Painter] }[] = [
  { accent: "#ec6a26", p: [code, terminal, kanban, code] },
  { accent: "#e8542a", p: [artboards, swatches, artboards, kanban] },
  { accent: "#f39a4a", p: [bars, lines, table, lines] },
  { accent: "#d9a441", p: [gantt, table, bars, kanban] },
  { accent: "#ff7a3d", p: [slide, lines, kanban, bars] },
  { accent: "#a98bff", p: [chat, graph, chat, lines] },
  { accent: "#4fb3ff", p: [servers, pipeline, lines, terminal] },
  { accent: "#3ecf8e", p: [terminal, radar, table, graph] },
  { accent: "#5aa9ff", p: [kanban, table, bars, table] },
  { accent: "#e7b55a", p: [calendar, table, code, lines] },
];

export function drawScreens(canvas: HTMLCanvasElement, department: number) {
  const c = canvas.getContext("2d");
  if (!c) return;
  const set = SETS[department % SETS.length];
  const w = canvas.width / 2, h = canvas.height / 2;
  let seed = 31 + department * 97;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  set.p.forEach((paint, i) => {
    c.save();
    c.translate((i % 2) * w, Math.floor(i / 2) * h);
    c.beginPath();
    c.rect(0, 0, w, h);
    c.clip();
    c.fillStyle = BG;
    c.fillRect(0, 0, w, h);
    paint(c, w, h, set.accent, rnd);
    c.restore();
  });
}
