"use client";

import { useLang } from "@/lib/LangContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer>
      <div className="wrap">
        <span>{t.foot}</span>
        <a className="credit" href="https://www.swegbg.com" target="_blank" rel="noopener">
          Skapad av SweGBG.com
        </a>
      </div>
    </footer>
  );
}
