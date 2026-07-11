/** JSON-LD yapılandırılmış veri script'i (SEO zengin sonuçlar). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE = "https://www.yaratakibi.com";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Yara Takibi",
  url: BASE,
  logo: `${BASE}/icon.svg`,
  description:
    "Uzaktan yara bakım takibi: fotoğrafınızı gönderin, uzman yara bakım hemşiresi değerlendirsin. İlk değerlendirme ücretsiz.",
  areaServed: "TR",
};

export function faqJsonLd(faq: readonly (readonly [string, string])[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.path}`,
    })),
  };
}

export function articleJsonLd(a: {
  title: string;
  intro: string;
  slug: string;
  imageUrl: string | null;
  publishedAt: string | null;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.intro,
    url: `${BASE}/blog/${a.slug}`,
    ...(a.imageUrl ? { image: [a.imageUrl] } : {}),
    ...(a.publishedAt ? { datePublished: a.publishedAt } : {}),
    author: { "@type": "Person", name: a.authorName },
    publisher: {
      "@type": "Organization",
      name: "Yara Takibi",
      logo: { "@type": "ImageObject", url: `${BASE}/icon.svg` },
    },
  };
}
