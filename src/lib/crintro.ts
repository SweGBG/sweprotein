/**
 * CRiNTRO: the intro is the loading screen.
 *
 * Starts downloading the H3 film the moment the page runs, in the order the visitor will need it,
 * and reports progress so the intro's berry rule can show real loading instead of a fixed animation.
 *
 * Phones: the film is a still sequence. Frames download as small compressed blobs in priority order
 * (the first 2 seconds, then every 12th frame across the film, then the gaps), and whatever is right
 * ahead of the visitor's thumb jumps the queue. Only frames near the scroll position are decoded into
 * bitmaps ("texture streaming"); every 12th frame stays decoded as an anchor, so even a fast flick always
 * has something nearby to draw. Memory stays low even with big frames.
 *
 * Desktop: the film downloads in full with byte progress and plays from a local blob URL,
 * so scrubbing never waits for the network.
 */
import { site } from "./content";

type Listener = () => void;
type Frame = ImageBitmap | HTMLImageElement;

const PHONE_QUERY = "(max-width: 820px), (pointer: coarse)";
const CONCURRENCY = 6; // parallel downloads
const DECODES = 2; // parallel decodes
const ANCHOR = 12; // every Nth frame is in the first coarse pass and stays decoded
const BEHIND = 8; // decoded window around the scroll position
const AHEAD = 14;

const S = {
  started: false,
  mode: "none" as "none" | "frames" | "video" | "failed",
  /** 0..1 for what the intro waits for: the opening + coarse pass (phones) or the whole film (desktop) */
  crit: 0,
  /** 0..1 for everything */
  all: 0,
  count: 0,
  blobs: [] as (Blob | null)[],
  frames: [] as (Frame | null)[],
  decoding: new Set<number>(),
  videoUrl: null as string | null,
  center: 0,
  listeners: new Set<Listener>(),
};

const emit = () => S.listeners.forEach((f) => f());

export function crintro() {
  if (typeof window !== "undefined" && !S.started) {
    S.started = true;
    start();
  }
  return S;
}

export function onCrintro(fn: Listener) {
  S.listeners.add(fn);
  return () => {
    S.listeners.delete(fn);
  };
}

/** Download order: the first ~2 s in sequence, then every 12th, 6th, 3rd frame, then the rest. */
function order(n: number) {
  const seen = new Set<number>();
  const out: number[] = [];
  const push = (i: number) => {
    if (i >= 0 && i < n && !seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  };
  const head = Math.min(12, Math.ceil(n * 0.06));
  for (let i = 0; i < head; i++) push(i);
  for (let i = 0; i < n; i += ANCHOR) push(i);
  const crit = out.length;
  for (const step of [6, 3, 1]) for (let i = 0; i < n; i += step) push(i);
  return { out, crit };
}

function start() {
  if (location.search.includes("crintro")) (window as unknown as { __crintro: typeof S }).__crintro = S; // ?crintro to inspect in DevTools
  const phone = matchMedia(PHONE_QUERY).matches;
  if (phone && site.mobileFrames.count > 0) loadFrames();
  else if (!phone && site.sceneVideo) loadVideo();
  else fail();
}

function fail() {
  S.mode = "failed";
  S.crit = S.all = 1;
  emit();
}

// ---------- phones ----------
function loadFrames() {
  const { dir, count, ext } = site.mobileFrames;
  S.mode = "frames";
  S.count = count;
  S.blobs = new Array(count).fill(null);
  S.frames = new Array(count).fill(null);
  const { out, crit } = order(count);
  const critSet = new Set(out.slice(0, crit));
  let got = 0, gotCrit = 0, failed = 0, next = 0;
  const asked = new Set<number>();
  // Next frame to fetch: what is right ahead of the thumb first, otherwise the planned order.
  const pick = (): number => {
    for (let d = 0; d <= AHEAD; d++) {
      const i = S.center + d;
      if (i < count && !asked.has(i) && S.center > 0) return i;
    }
    while (next < out.length && asked.has(out[next])) next++;
    return next < out.length ? out[next++] : -1;
  };

  const url = (i: number) => `${dir}${String(i + 1).padStart(3, "0")}${ext}`;
  const worker = async (): Promise<void> => {
    for (;;) {
      const i = pick();
      if (i < 0) return;
      asked.add(i);
      try {
        const r = await fetch(url(i));
        if (!r.ok) throw new Error(String(r.status));
        S.blobs[i] = await r.blob();
        got++;
        if (critSet.has(i)) gotCrit++;
      } catch {
        failed++;
      }
      S.crit = Math.min(1, gotCrit / crit);
      S.all = got / count;
      pump();
      emit();
    }
  };
  for (let k = 0; k < CONCURRENCY; k++) worker();
  // Nothing at all arrived: let the page draw the scene in code instead.
  const check = setInterval(() => {
    if (got > 0) return clearInterval(check);
    if (failed >= Math.min(count, CONCURRENCY)) {
      clearInterval(check);
      fail();
    }
  }, 300);
}

const keep = (i: number) => i % ANCHOR === 0 || (i >= S.center - BEHIND && i <= S.center + AHEAD);

async function decode(i: number) {
  const blob = S.blobs[i]!;
  S.decoding.add(i);
  try {
    if ("createImageBitmap" in window) {
      S.frames[i] = await createImageBitmap(blob); // decoded off the main thread
    } else {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      await img.decode();
      S.frames[i] = img;
    }
  } catch {
    /* skip a broken frame, a neighbour is drawn instead */
  }
  S.decoding.delete(i);
  if (!keep(i)) evict(i);
  pump();
}

function evict(i: number) {
  const f = S.frames[i];
  if (f && "close" in f) f.close();
  S.frames[i] = null;
}

/** Decode what is near the scroll position (nearest first), free what drifted out of the window. */
function pump() {
  if (S.mode !== "frames") return;
  for (let i = 0; i < S.count; i++) if (S.frames[i] && !keep(i)) evict(i);
  const want: number[] = [];
  for (let d = 0; d <= AHEAD; d++) {
    want.push(S.center + d);
    if (d && d <= BEHIND) want.push(S.center - d);
  }
  for (let i = 0; i < S.count; i += ANCHOR) want.push(i);
  for (const i of want) {
    if (S.decoding.size >= DECODES) return;
    if (i < 0 || i >= S.count || S.frames[i] || S.decoding.has(i) || !S.blobs[i]) continue;
    decode(i);
  }
}

/** Called by the scene every frame with the frame it wants to show. */
export function wantFrame(i: number) {
  if (i !== S.center) {
    S.center = i;
    pump();
  }
}

/** The decoded frame closest to i (or null while nothing near is ready). */
export function nearestFrame(i: number): Frame | null {
  for (let d = 0; d < S.count; d++) {
    const a = S.frames[i - d], b = S.frames[i + d];
    if (a) return a;
    if (b) return b;
  }
  return null;
}

// ---------- desktop ----------
async function loadVideo() {
  S.mode = "video";
  try {
    const r = await fetch(site.sceneVideo);
    if (!r.ok || !r.body) throw new Error(String(r.status));
    const total = Number(r.headers.get("content-length")) || 0;
    const reader = r.body.getReader();
    const parts: BlobPart[] = [];
    let done = 0;
    for (;;) {
      const { done: end, value } = await reader.read();
      if (end) break;
      parts.push(value);
      done += value.length;
      if (total) {
        S.crit = S.all = Math.min(0.99, done / total);
        emit();
      }
    }
    S.videoUrl = URL.createObjectURL(new Blob(parts, { type: "video/mp4" }));
  } catch {
    S.videoUrl = site.sceneVideo; // stream it the normal way instead
  }
  S.crit = S.all = 1;
  emit();
}
