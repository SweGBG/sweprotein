"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/LangContext";
import { crintro, nearestFrame } from "@/lib/crintro";

/**
 * CRiNTRO: the wordmark materialises on a milk-white screen while the H3 film loads behind it.
 * The berry rule under the name is the real loading bar, but it never runs ahead of its own
 * animation, so with a warm cache the intro looks exactly like a plain 1.9 s intro.
 * On a slow line it waits (at most MAX) for the opening of the film, then the curtain lifts.
 */
const RULE_START = 0.6; // s, when the rule starts drawing (as before)
const RULE_END = 1.5; // s, when it would be full with everything cached
const MIN = 1.9; // s, earliest curtain (as before)
const MAX = 3.6; // s, latest curtain, whatever is still loading keeps loading behind the page

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export default function Intro() {
  const { t } = useLang();
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const rule = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const store = crintro();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setGone(true);
    const t0 = performance.now();
    let shown = 0, raf = 0, done = false;
    const ready = () => store.crit >= 1 && (store.mode !== "frames" || !!nearestFrame(0));
    const tick = (now: number) => {
      const s = (now - t0) / 1000;
      const natural = ease((s - RULE_START) / (RULE_END - RULE_START));
      const loaded = ready() ? 1 : Math.min(0.97, store.crit);
      const forced = s >= MAX;
      // never ahead of the animation, never ahead of the real loading, never backwards
      const target = forced ? 1 : Math.min(natural, loaded);
      shown = Math.max(shown, shown + (target - shown) * (forced ? 0.35 : 0.18));
      if (rule.current) {
        rule.current.style.transform = `scaleX(${shown.toFixed(4)})`;
        rule.current.classList.toggle("wait", s > MIN && !ready() && !forced);
      }
      if (!done && s >= MIN && shown > 0.995) {
        done = true;
        setOut(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;
  return (
    <div className={`intro${out ? " out" : ""}`} aria-hidden="true" onTransitionEnd={() => out && setGone(true)}>
      <div className="intro-in">
        <div className="intro-word">
          {"SweProtein".split("").map((c, i) => (
            <span key={i} style={{ animationDelay: `${0.05 + i * 0.06}s` }}>
              {c}
            </span>
          ))}
        </div>
        <div className="intro-track">
          <div className="intro-rule" ref={rule} />
        </div>
        <div className="intro-sub">{t.introSub}</div>
      </div>
    </div>
  );
}
