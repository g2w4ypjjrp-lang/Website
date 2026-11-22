import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

/** Editör içeriğini (markdown) güvenli HTML'e dönüştürür. XSS'e karşı beyaz liste ile temizlenir. */
export function renderMarkdown(md: string) {
  const raw = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: ["h2", "h3", "h4", "p", "a", "ul", "ol", "li", "strong", "em", "blockquote", "code", "pre", "hr", "br", "table", "thead", "tbody", "tr", "th", "td", "img"],
    allowedAttributes: { a: ["href", "title", "rel"], img: ["src", "alt", "width", "height", "loading"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "") && !attribs.href?.startsWith(process.env.NEXT_PUBLIC_SITE_URL ?? "~");
        return { tagName: "a", attribs: { ...attribs, ...(external ? { rel: "noopener nofollow", target: "_blank" } : {}) } };
      },
      img: (tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }),
    },
  });
}

/** Markdown içinden H2 başlıklarını çıkarır (içindekiler için). */
export function extractHeadings(md: string) {
  return [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]!.trim());
}

export function plainText(md: string) {
  return md.replace(/[#>*_`\[\]()!-]/g, "").replace(/\s+/g, " ").trim();
}
