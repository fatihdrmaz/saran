import type { Metadata } from "next";
import { PageShell } from "../../components/PageShell";
import { AccountView } from "./AccountView";

export const metadata: Metadata = {
  title: "Hesabım — Yara Takibi",
  description:
    "Yaralarınızın durumu, bakım planı önerileriniz, fotoğraf gönderimleriniz ve ödemeleriniz.",
  alternates: { canonical: "/hesabim" },
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <PageShell>
      <AccountView />
    </PageShell>
  );
}
