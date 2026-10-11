"use client";

import { useLang } from "@/lib/LangContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer>
      <div className="wrap">
        <span>{t.foot}</span>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
