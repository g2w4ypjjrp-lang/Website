import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eksen — Dijital hizmet pazaryeri",
    short_name: "Eksen",
    description: "Dijital hizmetleri doğrulanmış uzmanlardan güvenli ödemeyle alın.",
    start_url: "/panel",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#14161a",
    lang: "tr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
