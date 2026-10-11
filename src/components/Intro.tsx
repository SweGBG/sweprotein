"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/LangContext";

/** The wordmark materialises on a milk-white screen, then the curtain lifts. */
export default function Intro() {
  const { t } = useLang();
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setGone(true);
    const id = setTimeout(() => setOut(true), 1900);
    return () => clearTimeout(id);
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
        <div className="intro-rule" />
        <div className="intro-sub">{t.introSub}</div>
      </div>
    </div>
  );
}
