"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Dict, type Lang } from "./content";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const LangContext = createContext<Ctx>({ lang: "sv", setLang: () => {}, t: dict.sv });
const KEY = "sweprotein-lang";

/** Swedish by default; the visitor's choice is remembered. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("sv");

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "en") setLangState("en");
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* noop */
    }
  };

  return <LangContext.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
