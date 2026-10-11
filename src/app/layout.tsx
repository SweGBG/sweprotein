import type { Metadata, Viewport } from "next";
import { LangProvider } from "@/lib/LangContext";
import { site } from "@/lib/content";
import "@fontsource/bagel-fat-one/400.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "SweProtein | Proteinshake av riktiga bär",
  description: "SweProtein: 30 g protein per flaska, riktig frukt och inget tillsatt socker. Demosajt av SweGBG Agency.",
  openGraph: { title: "SweProtein", description: "Proteinshake av riktiga bär. 30 g protein per flaska.", locale: "sv_SE", type: "website" },
};

export const viewport: Viewport = { themeColor: "#170c12" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
