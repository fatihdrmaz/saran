import Link from "next/link";
import { PlanType } from "@saran/shared";
import { Button, Card, StatusBadge } from "../../../../components/ui";
import { planTypeLabel } from "../../../../lib/labels";

export default async function SentPage({
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const planType = (plan as PlanType) ?? PlanType.MONTHLY;

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card style={{ maxWidth: 480, width: "100%", textAlign: "center", padding: 36 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "var(--success-bg)",
            color: "var(--success-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            margin: "0 auto 18px",
          }}
        >
          ✓
        </div>
        <h1 className="serif" style={{ fontSize: 24, fontWeight: 600, color: "var(--text-heading)" }}>
          Plan hastaya gönderildi
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
          {planTypeLabel[planType]} planı önerisi hastaya iletildi. Hasta onaylayıp ödeme
          yaptığında takip akışı otomatik açılacak.
        </p>

        <div
          style={{
            margin: "22px 0",
            padding: "14px 18px",
            background: "var(--warning-bg)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warning-text)" }}>
            Durum:
          </span>
          <StatusBadge status="pending" />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/hastalar">
            <Button variant="ghost">Hastalara dön</Button>
          </Link>
          <Link href="/">
            <Button>Bugün&apos;e git</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
