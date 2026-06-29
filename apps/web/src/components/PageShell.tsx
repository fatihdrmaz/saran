import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

/** Sayfa kabuğu: sabit üst menü + içerik + footer. README §6B/§7 navigasyon. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
