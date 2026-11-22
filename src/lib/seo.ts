import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

type MetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noindex?: boolean;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  /** Başlık zaten marka içeriyorsa şablonu atla */
  absoluteTitle?: boolean;
};

/** Her sayfa için tutarlı title/description/canonical/OG/Twitter üretimi. */
export function buildMetadata(m: MetaInput): Metadata {
  const url = absoluteUrl(m.path);
  const image = m.image ? (m.image.startsWith("http") ? m.image : absoluteUrl(m.image)) : absoluteUrl("/og-default.png");
  return {
    title: m.absoluteTitle ? { absolute: m.title } : m.title,
    description: m.description,
    alternates: { canonical: url },
    robots: m.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: m.type ?? "website",
      url,
      title: m.title,
      description: m.description,
      siteName: site.name,
      locale: site.locale,
      images: [{ url: image, width: 1200, height: 630, alt: m.title }],
      ...(m.publishedTime ? { publishedTime: m.publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: m.title, description: m.description, images: [image] },
  };
}

export type Crumb = { name: string; path: string };

export const ld = {
  organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#org"),
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/icon.svg"),
    email: site.supportEmail,
  }),
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: site.name,
    url: site.url,
    inLanguage: "tr-TR",
    publisher: { "@id": absoluteUrl("/#org") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/ara?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }),
  breadcrumbs: (items: Crumb[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  }),
  faq: (faqs: { q: string; a: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }),
};

/** JSON-LD içine gömülecek veriyi </script> kaçışına karşı güvenli hale getirir. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
