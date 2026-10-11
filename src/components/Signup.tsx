"use client";

import { useState } from "react";
import { useLang } from "@/lib/LangContext";

export default function Signup() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  return (
    <section className="order" id="bestall">
      <div className="wrap">
        <p className="eyebrow">{t.oEy}</p>
        <h2 className="h2">{t.oH}</h2>
        <p className="intro-p" style={{ marginInline: "auto" }}>
          {t.oP}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <label htmlFor="email" className="sr-only">
            {t.oLabel}
          </label>
          <input id="email" type="email" required placeholder={t.oPh} autoComplete="email" />
          <button className="btn" type="submit">
            {t.oBtn}
          </button>
        </form>
        <p className="ok" role="status">
          {sent ? t.oOk : ""}
        </p>
      </div>
    </section>
  );
}
