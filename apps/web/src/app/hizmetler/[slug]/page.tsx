import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES, getService } from "../../../lib/services";
import { ServicePage } from "../../../components/ServicePage";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "../../../components/JsonLd";

type Params = { slug: string };

/** İçerik statik (services.ts) — 5 hizmet sayfası build'de üretilir. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Hizmet bulunamadı — Yara Takibi" };
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/hizmetler/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      type: "website",
    },
  };
}

export default async function ServiceSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <JsonLd data={faqJsonLd(service.faq.map((f) => [f.q, f.a] as const))} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana Sayfa", path: "/" },
          { name: "Hizmetler", path: "/hizmetler" },
          { name: service.name, path: `/hizmetler/${service.slug}` },
        ])}
      />
      <ServicePage service={service} />
    </>
  );
}
