// Canvas drawings shared by the scroll scene and the flavour cards.
import type { Kind } from "./content";

type C = CanvasRenderingContext2D;
export const TAU = Math.PI * 2;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeIn = (t: number) => t * t * t;

/** Small seeded random, so the scene looks the same every time (and when scrolling back). */
export function rnd(seed: number) {
  let s = seed * 9301 + 49297;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

export function mix(c1: string, c2: string, t: number) {
  const a = c1.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const b = c2.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",")})`;
}

export function roundRect(ctx: C, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function strawberry(ctx: C, s: number, seed = 1) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.6);
  ctx.bezierCurveTo(-s * 0.36, s * 0.46, -s * 0.56, s * 0.02, -s * 0.46, -s * 0.3);
  ctx.bezierCurveTo(-s * 0.38, -s * 0.5, -s * 0.12, -s * 0.52, 0, -s * 0.42);
  ctx.bezierCurveTo(s * 0.12, -s * 0.52, s * 0.38, -s * 0.5, s * 0.46, -s * 0.3);
  ctx.bezierCurveTo(s * 0.56, s * 0.02, s * 0.36, s * 0.46, 0, s * 0.6);
  const g = ctx.createRadialGradient(-s * 0.18, -s * 0.2, s * 0.05, 0, 0, s * 0.75);
  g.addColorStop(0, "#ff7a8a");
  g.addColorStop(0.45, "#e3203f");
  g.addColorStop(1, "#7d0a24");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const r = rnd(seed);
  for (let y = -s * 0.3; y < s * 0.55; y += s * 0.11) {
    const off = (Math.round(y / (s * 0.11)) % 2) * s * 0.055;
    for (let x = -s * 0.5 + off; x < s * 0.5; x += s * 0.11) {
      const jx = x + (r() - 0.5) * s * 0.02;
      const jy = y + (r() - 0.5) * s * 0.02;
      ctx.fillStyle = "rgba(90,0,20,.35)";
      ctx.beginPath();
      ctx.ellipse(jx, jy + s * 0.012, s * 0.022, s * 0.03, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffd98a";
      ctx.beginPath();
      ctx.ellipse(jx, jy, s * 0.012, s * 0.02, 0, 0, TAU);
      ctx.fill();
    }
  }
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.beginPath();
  ctx.ellipse(-s * 0.2, -s * 0.18, s * 0.12, s * 0.2, -0.5, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#2f8a3e";
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.48;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.42);
    ctx.quadraticCurveTo(Math.cos(a - 0.3) * s * 0.2, -s * 0.42 + Math.sin(a - 0.3) * s * 0.12, Math.cos(a) * s * 0.32, -s * 0.42 + Math.sin(a) * s * 0.18 + s * 0.1);
    ctx.quadraticCurveTo(Math.cos(a + 0.3) * s * 0.2, -s * 0.42 + Math.sin(a + 0.3) * s * 0.12, 0, -s * 0.42);
    ctx.fill();
  }
  ctx.fillStyle = "#3c6b2a";
  ctx.fillRect(-s * 0.025, -s * 0.62, s * 0.05, s * 0.2);
}

function chocolate(ctx: C, s: number) {
  ctx.fillStyle = "#4a2416";
  roundRect(ctx, -s * 0.42, -s * 0.32, s * 0.84, s * 0.64, s * 0.1);
  ctx.fill();
  ctx.fillStyle = "#6b3722";
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      roundRect(ctx, -s * 0.36 + i * s * 0.38, -s * 0.26 + j * s * 0.28, s * 0.34, s * 0.24, s * 0.05);
      ctx.fill();
    }
  ctx.fillStyle = "rgba(255,220,200,.15)";
  roundRect(ctx, -s * 0.36, -s * 0.26, s * 0.72, s * 0.06, s * 0.03);
  ctx.fill();
}

function oat(ctx: C, s: number) {
  ctx.fillStyle = "#e7cf9c";
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.45, s * 0.28, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(140,100,40,.35)";
  ctx.lineWidth = s * 0.03;
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, 0);
  ctx.quadraticCurveTo(0, -s * 0.08, s * 0.3, 0);
  ctx.stroke();
}

function blueberry(ctx: C, s: number) {
  const g = ctx.createRadialGradient(-s * 0.12, -s * 0.12, s * 0.02, 0, 0, s * 0.45);
  g.addColorStop(0, "#7e86d8");
  g.addColorStop(0.6, "#2d2f7a");
  g.addColorStop(1, "#16173d");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.42, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#16173d";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    ctx.lineTo(Math.cos(a) * s * 0.1, -s * 0.28 + Math.sin(a) * s * 0.1);
  }
  ctx.fill();
}

function mango(ctx: C, s: number) {
  const g = ctx.createLinearGradient(-s * 0.4, -s * 0.4, s * 0.4, s * 0.4);
  g.addColorStop(0, "#ffd04d");
  g.addColorStop(1, "#f08a12");
  ctx.fillStyle = g;
  roundRect(ctx, -s * 0.36, -s * 0.36, s * 0.72, s * 0.72, s * 0.14);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.3)";
  roundRect(ctx, -s * 0.28, -s * 0.3, s * 0.3, s * 0.1, s * 0.05);
  ctx.fill();
}

export const DRAW: Record<Kind, (ctx: C, s: number, seed?: number) => void> = {
  berry: strawberry,
  choc: chocolate,
  oat,
  blue: blueberry,
  mango,
};

/** Fruit still life in the corner of a flavour card. */
export function drawCardArt(cv: HTMLCanvasElement, kind: Kind) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, cv.width, cv.height);
  const sets: Record<string, Kind[]> = {
    berry: ["berry", "berry", "oat"],
    choc: ["choc", "choc", "oat"],
    mango: ["mango", "mango", "oat"],
    blue: ["blue", "blue", "blue"],
  };
  const spots: [number, number, number, number][] = [
    [230, 230, 260, -0.3],
    [110, 300, 150, 0.5],
    [310, 90, 110, 0.9],
  ];
  spots.forEach(([x, y, s, rot], i) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    DRAW[(sets[kind] ?? sets.berry)[i]](ctx, s, i + 3);
    ctx.restore();
  });
}
