"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { useLang } from "@/lib/LangContext";
import { flavours, type Flavour } from "@/lib/content";

/**
 * Flavour cards: each Figma bottle (cut out, public/img/smaker/) floats over its own ingredient
 * scene, with a neon glow, rising drops and a huge outlined flavour name behind it.
 * Pointer tilt on desktop; animations only run while the card is on screen.
 */
function Card({ f, i }: { f: Flavour; i: number }) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);

  // Run the animations only while visible (saves battery on phones).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("on", e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tilt = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--rx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    e.currentTarget.style.setProperty("--ry", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const reset = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0");
    e.currentTarget.style.setProperty("--ry", "0");
  };

  const style = { "--c": f.neon, "--i": i } as CSSProperties;

  return (
    <article ref={ref} className="fl" style={style} onPointerMove={tilt} onPointerLeave={reset}>
      <div className="fl-scene" style={{ backgroundImage: `url(/img/smaker/scen-${f.id}.webp)` }} aria-hidden="true" />
      <div className="fl-glow" aria-hidden="true" />
      <span className="fl-ghost" aria-hidden="true">
        {f.name[lang]}
      </span>
      <div className="fl-drops" aria-hidden="true">
        {Array.from({ length: 7 }, (_, k) => (
          <i key={k} style={{ ["--k" as string]: k } as CSSProperties} />
        ))}
      </div>
      <div className="fl-stage" aria-hidden="true">
        <img className="fl-bottle" src={`/img/smaker/flaska-${f.id}.webp`} alt="" loading="lazy" decoding="async" />
        <span className="fl-shadow" />
      </div>

      <header className="fl-head">
        <span className="tag">{f.tag[lang]}</span>
        <h3 className="name">{f.name[lang]}</h3>
        <p className="desc">{f.desc[lang]}</p>
      </header>

      <footer className="fl-foot">
        <ul className="fl-notes">
          {f.notes[lang].map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <div className="fl-buy">
          <span className="g">
            30<small>G PROTEIN</small>
          </span>
          <span className="price">
            29 kr <small>330 ml</small>
          </span>
          <a className="fl-btn" href="#bestall">
            {t.flPick}
          </a>
        </div>
      </footer>
    </article>
  );
}

export default function Flavours() {
  const { t } = useLang();
  return (
    <section className="block" id="smaker">
      <div className="wrap">
        <p className="eyebrow">{t.fEy}</p>
        <h2 className="h2">{t.fH}</h2>
        <p className="intro-p">{t.fP}</p>
      </div>
      <div className="flavours">
        {flavours.map((f, i) => (
          <Card key={f.id} f={f} i={i} />
        ))}
      </div>
    </section>
  );
}
