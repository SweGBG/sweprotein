"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/LangContext";
import { site } from "@/lib/content";
import { crintro, nearestFrame, onCrintro, wantFrame } from "@/lib/crintro";
import { DRAW, TAU, clamp, easeIn, lerp, mix, rnd, roundRect, smooth } from "@/lib/draw";
import type { Kind } from "@/lib/content";

/**
 * The pinned scroll scene.
 * - Desktop: the H3 film (public/video/sweprotein-scene.mp4) is scrubbed by scroll.
 * - Phones: the same film as a still-image sequence (public/video/m/), drawn to the canvas.
 * - If neither exists, the same story is drawn live on the canvas.
 * Story: hero berry → ingredients fall into the shake → milk swirl → the bottle rises.
 */

// When each text layer is visible: [fade in start, in end, out start, out end] as scroll progress 0..1.
// The film is four 8 s H3 clips back to back (hero, fall, swirl, bottle), so its beats sit on quarters.
const TIMING = {
  canvas: [[-1, 0, 0.04, 0.12], [0.2, 0.26, 0.4, 0.46], [0.52, 0.58, 0.66, 0.72], [0.84, 0.9, 2, 2]],
  video: [[-1, 0, 0.14, 0.22], [0.28, 0.33, 0.45, 0.5], [0.54, 0.59, 0.7, 0.75], [0.86, 0.92, 2, 2]],
};

type Drop = { s: number; x: number; z: number; k: Kind; spin: number; seed: number };
const DROPS: Drop[] = (() => {
  const r = rnd(7);
  const kinds: Kind[] = ["berry", "berry", "choc", "oat", "berry", "blue", "oat", "choc", "berry", "mango", "oat", "berry", "choc", "blue"];
  return kinds.map((k, i) => ({ s: 0.2 + i * 0.021 + r() * 0.01, x: 0.14 + r() * 0.72, z: 0.55 + r() * 0.5, k, spin: (r() - 0.5) * 5, seed: i + 11 }));
})();
const DUR = 0.075;

export default function Scene() {
  const { t, lang } = useLang();
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bottleText = useRef(t.bottle);
  const [mode, setMode] = useState<"canvas" | "video" | "frames">("canvas");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const useVideo = mode === "video";

  bottleText.current = t.bottle;

  // Pick the scene source from CRiNTRO (which already started loading during the intro):
  // stills on phones, film on desktop, the scene drawn in code if neither could load.
  useEffect(() => {
    const store = crintro();
    const sync = () => {
      setMode(store.mode === "frames" ? "frames" : store.mode === "video" ? "video" : "canvas");
      setVideoSrc(store.videoUrl);
    };
    sync();
    return onCrintro(sync);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const scene = sceneRef.current!;
    const video = videoRef.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, DPR = 1, cur = 0, raf = 0, lastSeek = 0;

    // Phone mode: CRiNTRO streams the stills; draw the decoded frame nearest the scroll position.
    let lastImg: CanvasImageSource | null = null;
    const drawFrame = (p: number) => {
      const want = Math.round(p * (site.mobileFrames.count - 1));
      wantFrame(want);
      const img = nearestFrame(want);
      if (!img || img === lastImg) return;
      lastImg = img;
      const iw = img.width, ih = img.height;
      const s = Math.max(W / iw, H / ih);
      const w = iw * s, h = ih * s;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = "#170c12";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    };

    const resize = () => {
      // Phones draw the stills at 1.5x: the frames are 600 px wide, so more pixels add cost, not detail.
      DPR = Math.min(mode === "frames" ? 1.5 : 2, window.devicePixelRatio || 1);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      lastImg = null;
    };
    const progress = () => {
      const r = scene.getBoundingClientRect();
      return clamp(-r.top / (r.height - innerHeight));
    };

    const level = (p: number) => lerp(0, 0.3, smooth(0.06, 0.26, p)) + lerp(0, 0.78, smooth(0.46, 0.66, p)) - lerp(0, 0.86, smooth(0.72, 0.86, p));
    const liquidColor = (p: number) => {
      const k = smooth(0.48, 0.7, p);
      return [mix("f2557a", "c9305a", k), mix("ffb0bf", "f2557a", k)];
    };
    const surfaceY = (x: number, p: number, tm: number) => {
      const base = H * (1 - level(p));
      const amp = Math.min(W, H) * (0.012 + 0.02 * smooth(0.2, 0.45, p) * (1 - smooth(0.6, 0.7, p)));
      return base + Math.sin(x * 0.008 + tm * 1.6) * amp + Math.sin(x * 0.021 - tm * 2.3) * amp * 0.5;
    };

    const drawBottle = (p: number, tm: number) => {
      const k = smooth(0.72, 0.9, p);
      if (k <= 0) return;
      const S = Math.min(W * 0.9, H * 0.78);
      const bw = S * 0.3, bh = S * 0.82, neck = bw * 0.55;
      const cy = lerp(H + bh * 0.6, H * 0.5, k) + Math.sin(tm * 1.2) * 4;
      ctx.save();
      ctx.translate(W / 2, cy);
      ctx.rotate((1 - k) * 0.25 + Math.sin(tm * 0.9) * 0.015);
      ctx.beginPath();
      ctx.moveTo(-neck / 2, -bh / 2 + bh * 0.1);
      ctx.bezierCurveTo(-neck / 2, -bh / 2 + bh * 0.2, -bw / 2, -bh / 2 + bh * 0.22, -bw / 2, -bh / 2 + bh * 0.32);
      ctx.lineTo(-bw / 2, bh / 2 - bw * 0.18);
      ctx.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2 + bw * 0.18, bh / 2);
      ctx.lineTo(bw / 2 - bw * 0.18, bh / 2);
      ctx.quadraticCurveTo(bw / 2, bh / 2, bw / 2, bh / 2 - bw * 0.18);
      ctx.lineTo(bw / 2, -bh / 2 + bh * 0.32);
      ctx.bezierCurveTo(bw / 2, -bh / 2 + bh * 0.22, neck / 2, -bh / 2 + bh * 0.2, neck / 2, -bh / 2 + bh * 0.1);
      ctx.closePath();
      const [c1, c2] = liquidColor(p);
      const g = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
      g.addColorStop(0, "#b81f48");
      g.addColorStop(0.35, c2);
      g.addColorStop(0.7, c1);
      g.addColorStop(1, "#8f1438");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = "#fbf1ec";
      ctx.fillRect(-bw / 2, -bh * 0.02, bw, bh * 0.3);
      ctx.fillStyle = "#170c12";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `400 ${bw * 0.15}px "Bagel Fat One", sans-serif`;
      ctx.fillText("SweProtein", 0, bh * 0.1);
      ctx.font = `600 ${bw * 0.06}px "JetBrains Mono", monospace`;
      ctx.fillText(bottleText.current, 0, bh * 0.2);
      const sh = ctx.createLinearGradient(-bw / 2, 0, -bw * 0.1, 0);
      sh.addColorStop(0, "rgba(255,255,255,0)");
      sh.addColorStop(0.5, "rgba(255,255,255,.35)");
      sh.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sh;
      ctx.fillRect(-bw * 0.42, -bh / 2, bw * 0.2, bh);
      ctx.restore();
      ctx.fillStyle = "#170c12";
      roundRect(ctx, -neck / 2 - 3, -bh / 2 - bh * 0.02, neck + 6, bh * 0.13, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(251,241,236,.18)";
      for (let i = 0; i < 6; i++) ctx.fillRect(-neck / 2 + (i * neck) / 5.5, -bh / 2, 2, bh * 0.09);
      ctx.restore();
    };

    const drawCanvas = (p: number, tm: number) => {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, mix("2a1019", "3a0f20", smooth(0.4, 0.7, p)));
      bg.addColorStop(1, mix("170c12", "1d0a12", p));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const gl = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, Math.max(W, H) * 0.55);
      gl.addColorStop(0, `rgba(239,63,107,${0.32 - 0.18 * smooth(0.2, 0.5, p) + 0.2 * smooth(0.75, 0.9, p)})`);
      gl.addColorStop(1, "rgba(239,63,107,0)");
      ctx.fillStyle = gl;
      ctx.fillRect(0, 0, W, H);
      const M = Math.min(W, H);

      const heroFall = smooth(0.08, 0.24, p);
      if (heroFall < 1) {
        const s = M * lerp(0.62, 0.3, heroFall);
        const hx = W / 2;
        const hy = lerp(H * 0.5 + Math.sin(tm * 1.1) * 8, surfaceY(hx, p, tm) + s * 0.5, easeIn(heroFall));
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(Math.sin(tm * 0.7) * 0.06 + heroFall * 1.2);
        ctx.globalAlpha = 1 - smooth(0.85, 1, heroFall);
        DRAW.berry(ctx, s, 2);
        ctx.restore();
      }

      DROPS.forEach((d) => {
        const k = (p - d.s) / DUR;
        if (k < 0 || k > 1.25) return;
        const s = M * 0.12 * d.z, x = d.x * W;
        const y = lerp(-s, surfaceY(x, p, tm) + s * 0.4, easeIn(clamp(k)));
        ctx.save();
        ctx.translate(x, y + (k > 1 ? (k - 1) * s * 2 : 0));
        ctx.rotate(d.spin * k);
        DRAW[d.k](ctx, s, d.seed);
        ctx.restore();
      });

      drawBottle(p, tm);

      const lv = level(p);
      if (lv > 0.002) {
        const [c1, c2] = liquidColor(p);
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, surfaceY(x, p, tm));
        ctx.lineTo(W, H);
        ctx.closePath();
        const top = H * (1 - lv);
        const lg = ctx.createLinearGradient(0, top, 0, H);
        lg.addColorStop(0, c2);
        lg.addColorStop(0.25, c1);
        lg.addColorStop(1, mix("8f1438", "5a0b24", smooth(0.5, 0.7, p)));
        ctx.fillStyle = lg;
        ctx.fill();
        ctx.beginPath();
        for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, surfaceY(x, p, tm) + 3);
        ctx.strokeStyle = "rgba(255,235,240,.55)";
        ctx.lineWidth = 3;
        ctx.stroke();
        const sw = smooth(0.44, 0.52, p) * (1 - smooth(0.64, 0.72, p));
        if (sw > 0) {
          ctx.save();
          ctx.globalAlpha = sw * 0.5;
          ctx.strokeStyle = "#ffe4ea";
          ctx.lineWidth = M * 0.012;
          ctx.lineCap = "round";
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            for (let a = 0; a < TAU * 1.4; a += 0.08) {
              const rr = M * (0.06 + a * 0.07 + i * 0.03), aa = a + tm * 0.8 + i * 1.6 + p * 12;
              ctx.lineTo(W / 2 + Math.cos(aa) * rr * 1.4, H * 0.55 + Math.sin(aa) * rr * 0.7);
            }
            ctx.stroke();
          }
          ctx.restore();
        }
        const r = rnd(3);
        for (let i = 0; i < 26; i++) {
          const bx = r() * W, sp = 0.3 + r() * 0.7, sz = 2 + r() * 6;
          const by = H - ((tm * 60 * sp + r() * H) % (H * lv + 1));
          if (by > top) {
            ctx.fillStyle = "rgba(255,240,244,.35)";
            ctx.beginPath();
            ctx.arc(bx, by, sz, 0, TAU);
            ctx.fill();
          }
        }
      }

      // Splashes are a pure function of scroll, so scrolling back replays them.
      [...DROPS, { s: 0.24 - DUR, x: 0.5, z: 2.4, seed: 99 } as Drop].forEach((d) => {
        const tau = (p - (d.s + DUR)) / 0.05;
        if (tau < 0 || tau > 1) return;
        const x = d.x * W, sy = surfaceY(x, p, tm), r = rnd(d.seed), s = M * 0.12 * d.z;
        ctx.save();
        ctx.globalAlpha = 1 - tau;
        ctx.strokeStyle = "rgba(255,225,232,.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, sy, s * (0.4 + tau * 1.6), s * (0.1 + tau * 0.3), 0, 0, TAU);
        ctx.stroke();
        for (let i = 0; i < 12; i++) {
          const a = -Math.PI / 2 + (r() - 0.5) * 2.2, v = s * (1.2 + r() * 2.4), sz = s * (0.04 + r() * 0.07);
          ctx.fillStyle = r() > 0.5 ? "#ff8aa3" : "#ffd0da";
          ctx.beginPath();
          ctx.ellipse(x + Math.cos(a) * v * tau, sy + Math.sin(a) * v * tau + v * 1.6 * tau * tau, sz, sz * 1.3, a, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      });
    };

    const frame = (time: number) => {
      const tm = time / 1000;
      const target = progress();
      cur = reduce ? target : cur + (target - cur) * 0.1;
      const p = cur;

      if (mode === "frames") {
        drawFrame(p);
      } else if (useVideo && video && video.duration) {
        // Scrub the film. Seeking every frame is heavy, so only when it moved enough.
        const want = p * (video.duration - 0.05);
        if (Math.abs(video.currentTime - want) > 1 / 30 && time - lastSeek > 16) {
          video.currentTime = want;
          lastSeek = time;
        }
      } else {
        drawCanvas(p, tm);
      }

      const timing = mode === "canvas" ? TIMING.canvas : TIMING.video;
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const [a, b, c, d] = timing[i];
        const o = smooth(a, b, p) * (1 - smooth(c, d, p));
        el.style.setProperty("--o", o.toFixed(3));
        el.classList.toggle("live", o > 0.5);
      });
      raf = requestAnimationFrame(frame);
    };

    resize();
    addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, [mode, useVideo, videoSrc]);

  const setLayer = (i: number) => (el: HTMLDivElement | null) => {
    layerRefs.current[i] = el;
  };

  return (
    <div className="scene" ref={sceneRef} data-video={mode === "canvas" ? "off" : "on"}>
      <div className="stage">
        {useVideo ? (
          <video ref={videoRef} className="scene-video" src={videoSrc ?? undefined} poster={site.scenePoster} muted playsInline preload="auto" aria-hidden="true" />
        ) : null}
        <canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" hidden={useVideo} />
        <div className="scene-shade" aria-hidden="true" />

        <div className="layer" ref={setLayer(0)} style={{ ["--o" as string]: 1 }}>
          <div className="hero-wrap">
            <h1 className="hero-word">
              Swe<span>Protein</span>
            </h1>
            <p className="hero-sub">{t.heroSub}</p>
          </div>
          <div className="scroll-hint">
            <span>{t.scroll}</span>
            <i />
          </div>
        </div>

        <div className="layer" ref={setLayer(1)}>
          <div className="stack">
            <h2 className="big">{t.l1h}</h2>
            <p className="lede">{t.l1p}</p>
          </div>
        </div>

        <div className="layer" ref={setLayer(2)}>
          <div className="stack">
            <h2 className="big">{t.l2h}</h2>
            <div className="stat-row">
              {t.stats.map((s) => (
                <span className="stat" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="layer" ref={setLayer(3)}>
          <div className="glass">
            <h2>{t.l3h}</h2>
            <p>{t.l3p}</p>
            <a className="btn" href="#smaker" lang={lang}>
              {t.l3b}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
