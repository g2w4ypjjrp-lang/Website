export const site = {
  name: "Eksen",
  legalName: "Eksen Dijital Hizmetler A.Ş. (kuruluş aşamasında)",
  tagline: "Dijital işlerin merkezi",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "tr_TR",
  supportEmail: "destek@eksen.local",
};

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
