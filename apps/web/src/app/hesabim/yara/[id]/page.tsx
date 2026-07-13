import type { Metadata } from "next";
import { PageShell } from "../../../../components/PageShell";
import { WoundFileView } from "./WoundFileView";

export const metadata: Metadata = {
  title: "Yara dosyası — Yara Takibi",
  description: "Bu yaranın planı, ödemesi, fotoğrafları ve mesajları bir arada.",
  robots: { index: false, follow: false },
};

export default async function WoundFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageShell>
      <WoundFileView woundId={id} />
    </PageShell>
  );
}
