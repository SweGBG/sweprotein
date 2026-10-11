"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/lib/LangContext";
import { flavours, type Flavour } from "@/lib/content";
import { drawCardArt } from "@/lib/draw";

function Card({ f }: { f: Flavour }) {
  const { lang } = useLang();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawCardArt(ref.current, f.kind);
  }, [f.kind]);
  return (
    <article className="fl" style={{ ["--bg" as string]: f.bg, ["--fg" as string]: f.fg }}>
      <span className="tag">{f.tag[lang]}</span>
      <h3 className="name">{f.name[lang]}</h3>
      <p className="desc">{f.desc[lang]}</p>
      <div className="foot">
        <span className="g">
          30<small>G PROTEIN</small>
        </span>
        <span className="price">29 kr · 330 ml</span>
      </div>
      <canvas ref={ref} width={400} height={400} aria-hidden="true" />
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
        <div className="flavours">
          {flavours.map((f) => (
            <Card key={f.id} f={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
