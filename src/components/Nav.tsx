"use client";

import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/content";

export default function Nav() {
  const { t, lang, setLang } = useLang();
  return (
    <header className="nav">
      <a className="logo" href="#top">
        SweProtein
      </a>
      <div className="nav-r">
        <div className="lang" role="group" aria-label="Språk / Language">
          {(["sv", "en"] as Lang[]).map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <a className="btn small" href="#smaker">
          {t.navCta}
        </a>
      </div>
    </header>
  );
}
