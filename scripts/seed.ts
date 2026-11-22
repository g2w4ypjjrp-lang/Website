import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { CATEGORIES } from "./seed-categories";
import { LANDINGS, POSTS, STATIC_PAGES } from "./seed-content";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });
const demo = process.argv.includes("--demo");

async function upsertCategory(v: typeof schema.categories.$inferInsert) {
  const [row] = await db
    .insert(schema.categories)
    .values(v)
    .onConflictDoUpdate({ target: schema.categories.slug, set: { name: v.name, shortDescription: v.shortDescription, intro: v.intro, faqs: v.faqs, sortOrder: v.sortOrder, parentId: v.parentId } })
    .returning();
  return row!;
}

async function main() {
  // Ayarlar
  await db.insert(schema.settings).values({ key: "platform", value: { commissionBps: 1500 } }).onConflictDoNothing();

  // Yönetici
  const adminEmail = process.env.ADMIN_EMAIL!.toLowerCase();
  const existingAdmin = await db.query.users.findFirst({ where: sql`lower(${schema.users.email}) = ${adminEmail}` });
  if (!existingAdmin) {
    await db.insert(schema.users).values({
      email: adminEmail,
      name: "Eksen Yönetim",
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12),
      role: "admin",
      emailVerifiedAt: new Date(),
    });
    console.log(`✓ Yönetici oluşturuldu: ${adminEmail}`);
  }

  // Kategoriler
  const catIds: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const root = await upsertCategory({
      slug: c.slug,
      name: c.name,
      shortDescription: c.short,
      intro: c.intro,
      sortOrder: i,
      faqs: c.faqs,
      commissionBps: c.commissionBps,
      filters: c.filters ?? [],
      seoTitle: `${c.name} hizmetleri`,
      seoDescription: `${c.short} Doğrulanmış uzmanların paketlerini karşılaştırın, güvenli ödemeyle sipariş verin.`,
    });
    catIds[c.slug] = root.id;
    for (const [j, [slug, name]] of c.subs.entries()) {
      const sub = await upsertCategory({
        slug,
        name,
        parentId: root.id,
        sortOrder: j,
        shortDescription: `${name} hizmeti veren uzmanlar ve hazır paketler.`,
        seoTitle: `${name} hizmeti`,
        seoDescription: `${name} için uzman paketlerini, teslim sürelerini ve fiyatları karşılaştırın. Ödemeniz onaylayana kadar Eksen güvencesinde.`,
      });
      catIds[slug] = sub.id;
    }
  }
  console.log(`✓ ${Object.keys(catIds).length} kategori`);

  // SEO açılış sayfaları
  for (const l of LANDINGS) {
    await db
      .insert(schema.landingPages)
      .values({ slug: l.slug, categoryId: catIds[l.category], h1: l.h1, intro: l.intro, body: l.body, faqs: l.faqs, seoTitle: l.seoTitle, seoDescription: l.seoDescription, isPublished: true })
      .onConflictDoNothing();
  }
  console.log(`✓ ${LANDINGS.length} açılış sayfası`);

  // Blog
  const admin = await db.query.users.findFirst({ where: eq(schema.users.role, "admin") });
  for (const [i, p] of POSTS.entries()) {
    const words = p.content.split(/\s+/).length;
    await db
      .insert(schema.blogPosts)
      .values({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        tags: p.tags,
        authorId: admin?.id,
        authorName: "Eksen Editör Ekibi",
        status: "published",
        publishedAt: new Date(Date.now() - (i + 1) * 4 * 864e5),
        readingMinutes: Math.max(2, Math.round(words / 200)),
        relatedCategoryId: p.relatedCategory ? catIds[p.relatedCategory] : null,
        seoTitle: p.title,
        seoDescription: p.excerpt,
      })
      .onConflictDoNothing();
  }
  console.log(`✓ ${POSTS.length} blog yazısı`);

  for (const p of STATIC_PAGES) await db.insert(schema.staticPages).values(p).onConflictDoNothing();
  console.log(`✓ ${STATIC_PAGES.length} sabit sayfa`);

  for (const [from, to] of [
    ["/freelancer", "/uzmanlar"],
    ["/web-tasarim-uzmanlari", "/uzmanlar?kategori=web-ve-yazilim"],
    ["/kategori/web-tasarim", "/kategori/web-ve-yazilim"],
  ])
    await db.insert(schema.redirects).values({ fromPath: from!, toPath: to! }).onConflictDoNothing();

  if (demo) await seedDemo(catIds);
  await client.end();
}

async function seedDemo(catIds: Record<string, string>) {
  console.log("… demo verisi (yalnızca tasarım ve test için; production’da çalıştırmayın)");
  const hash = await bcrypt.hash("demo-sifre-123", 10);
  const providers = [
    { slug: "deniz-aksoy", name: "Deniz Aksoy", headline: "Kurumsal web siteleri ve Next.js geliştirme", city: "İzmir", skills: ["Next.js", "WordPress", "Teknik SEO"], type: "individual" as const, level: "pro" as const },
    { slug: "kuzey-dijital", name: "Kuzey Dijital", headline: "E-ticaret kurulumu ve performans pazarlama ajansı", city: "İstanbul", skills: ["Shopify", "WooCommerce", "Google Ads"], type: "agency" as const, level: "top" as const },
    { slug: "elif-sahin", name: "Elif Şahin", headline: "Marka kimliği ve logo tasarımı", city: "Ankara", skills: ["Logo", "Kurumsal kimlik", "Illustrator"], type: "individual" as const, level: "rising" as const },
    { slug: "mert-yalcin", name: "Mert Yalçın", headline: "Flutter ile Android ve iOS uygulamaları", city: "Eskişehir", skills: ["Flutter", "Firebase", "REST API"], type: "individual" as const, level: "pro" as const },
    { slug: "ada-kurgu", name: "Ada Kurgu Stüdyo", headline: "Reels, ürün videosu ve motion graphics", city: "İstanbul", skills: ["Premiere Pro", "After Effects", "Reels"], type: "company" as const, level: "rising" as const },
    { slug: "baris-ozkan", name: "Barış Özkan", headline: "Yapay zekâ destekli müşteri hizmetleri ve otomasyon", city: "Bursa", skills: ["Python", "LLM", "n8n"], type: "individual" as const, level: "new" as const },
  ];
  const ids: Record<string, string> = {};
  for (const p of providers) {
    const email = `${p.slug}@demo.eksen.local`;
    let u = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (!u) [u] = await db.insert(schema.users).values({ email, name: p.name, passwordHash: hash, role: "provider", accountType: p.type, emailVerifiedAt: new Date() }).returning();
    ids[p.slug] = u!.id;
    await db
      .insert(schema.providerProfiles)
      .values({
        userId: u!.id,
        slug: p.slug,
        displayName: p.name,
        headline: p.headline,
        city: p.city,
        skills: p.skills,
        level: p.level,
        verifiedAt: p.level === "new" ? null : new Date(),
        bio: `${p.headline}. Çalışmaya başlamadan önce kısa bir görüşmeyle kapsamı netleştiriyorum; her aşamada ara teslimat paylaşıyorum.\n\nBu bir demo profildir.`,
      })
      .onConflictDoNothing();
  }

  type Pkg = [name: string, price: number, days: number, rev: number, features: string[]];
  const services: { p: string; cat: string; title: string; summary: string; tags: string[]; pk: [Pkg, Pkg, Pkg] }[] = [
    { p: "deniz-aksoy", cat: "kurumsal-web-sitesi", title: "Mobil uyumlu kurumsal web sitesi kurarım", summary: "5–10 sayfalık, hızlı açılan, yönetim panelli kurumsal site.", tags: ["kurumsal", "wordpress", "seo"], pk: [["Tanıtım", 9500, 7, 2, ["5 sayfa", "İletişim formu", "Temel SEO"]], ["İşletme", 16500, 12, 3, ["10 sayfa", "Blog", "Google Haritalar", "Temel SEO"]], ["Kapsamlı", 28000, 20, 5, ["15 sayfa", "Çok dilli", "Hız optimizasyonu", "3 ay bakım"]]] },
    { p: "deniz-aksoy", cat: "landing-page", title: "Reklam kampanyanız için dönüşüm odaklı landing page", summary: "Tek sayfa, hızlı, form ve analitik entegrasyonlu.", tags: ["landing page", "next.js"], pk: [["Tek bölüm", 4500, 4, 2, ["Tek sayfa", "Form"]], ["Kampanya", 7500, 6, 3, ["Tek sayfa", "Form", "A/B varyasyon"]], ["Pro", 12000, 9, 4, ["2 varyasyon", "Analitik kurulumu", "Hız optimizasyonu"]]] },
    { p: "kuzey-dijital", cat: "e-ticaret-sitesi-kurulumu", title: "Shopify veya WooCommerce ile e-ticaret sitesi kurulumu", summary: "Ödeme, kargo ve e-fatura entegrasyonlu satışa hazır mağaza.", tags: ["e-ticaret", "shopify", "woocommerce"], pk: [["Başlangıç", 18000, 14, 2, ["50 ürün yükleme", "Ödeme entegrasyonu", "Kargo"]], ["Büyüme", 32000, 21, 3, ["200 ürün", "e-Fatura", "Kampanya modülü"]], ["Kurumsal", 55000, 35, 5, ["Sınırsız ürün", "ERP entegrasyonu", "3 ay destek"]]] },
    { p: "kuzey-dijital", cat: "google-ads", title: "Google Ads kampanya kurulumu ve aylık yönetim", summary: "Arama ve Performance Max kampanyaları, dönüşüm izleme kurulumu.", tags: ["google ads", "ppc"], pk: [["Kurulum", 6000, 5, 1, ["1 kampanya", "Dönüşüm izleme"]], ["Aylık", 12000, 30, 2, ["3 kampanya", "Haftalık optimizasyon", "Aylık rapor"]], ["Yoğun", 22000, 30, 3, ["Sınırsız kampanya", "Haftalık rapor", "Landing page önerileri"]]] },
    { p: "elif-sahin", cat: "logo-tasarim", title: "Markanıza özgün, vektörel logo tasarımı", summary: "Brif görüşmesi, 3 konsept, kaynak dosyalar dahil.", tags: ["logo", "marka"], pk: [["Temel", 3500, 5, 2, ["2 konsept", "PNG + SVG"]], ["Standart", 6000, 7, 4, ["3 konsept", "Tüm formatlar", "Renk varyasyonları"]], ["Marka", 11000, 12, 6, ["3 konsept", "Kartvizit", "Kullanım kılavuzu"]]] },
    { p: "elif-sahin", cat: "kurumsal-kimlik", title: "Kurumsal kimlik ve marka kılavuzu hazırlarım", summary: "Logo, renk, tipografi ve basılı materyaller tek pakette.", tags: ["kurumsal kimlik"], pk: [["Temel", 9000, 10, 2, ["Logo", "Renk paleti", "Kartvizit"]], ["Standart", 15000, 15, 3, ["Antetli kâğıt", "E-posta imzası", "Kılavuz"]], ["Kapsamlı", 26000, 25, 4, ["Sosyal medya şablonları", "Sunum şablonu", "Tabela uygulaması"]]] },
    { p: "mert-yalcin", cat: "flutter-uygulama", title: "Flutter ile Android ve iOS uygulaması geliştiririm", summary: "Tek kod tabanı, Firebase arka uç, mağaza yayını dahil.", tags: ["flutter", "mobil"], pk: [["MVP", 45000, 30, 2, ["5 ekran", "Firebase", "Tek platform yayını"]], ["Standart", 85000, 45, 3, ["12 ekran", "Bildirimler", "İki mağaza"]], ["Pro", 140000, 70, 5, ["Sınırsız ekran", "Yönetim paneli", "3 ay bakım"]]] },
    { p: "ada-kurgu", cat: "reels", title: "Instagram Reels ve TikTok için kısa video kurgusu", summary: "Ham görüntülerinizden altyazılı, müzikli dikey videolar.", tags: ["reels", "tiktok", "video"], pk: [["3 video", 1800, 3, 1, ["30 sn'ye kadar", "Altyazı"]], ["8 video", 4200, 6, 2, ["60 sn'ye kadar", "Altyazı", "Lisanslı müzik"]], ["15 video", 7500, 10, 3, ["Kapak tasarımı", "Altyazı", "Lisanslı müzik"]]] },
    { p: "baris-ozkan", cat: "ai-chatbot", title: "Sitenize ve WhatsApp hattınıza yapay zekâ asistanı", summary: "SSS ve ürün verinizle eğitilmiş müşteri hizmetleri asistanı.", tags: ["chatbot", "yapay zeka"], pk: [["Web", 8000, 7, 2, ["Web widget", "SSS kaynağı"]], ["Çok kanal", 15000, 12, 3, ["Web + WhatsApp", "Canlı desteğe devir"]], ["Entegre", 26000, 20, 4, ["CRM entegrasyonu", "Sipariş sorgulama", "Raporlama"]]] },
  ];
  for (const s of services) {
    const slug = (await import("../src/lib/utils")).slugify(s.title, 70);
    const exists = await db.query.services.findFirst({ where: eq(schema.services.slug, slug) });
    if (exists) continue;
    const [row] = await db
      .insert(schema.services)
      .values({
        providerId: ids[s.p]!,
        categoryId: catIds[s.cat]!,
        slug,
        title: s.title,
        summary: s.summary,
        description: `${s.summary}\n\n## Süreç\n\n1. Kısa bir brif görüşmesiyle ihtiyaçlarınızı netleştiriyoruz.\n2. İlk taslağı paylaşıyorum, geri bildiriminizi alıyorum.\n3. Revizyonlardan sonra son teslimatı yapıyorum.\n\n## Sizden beklediklerim\n\n- Marka bilgileri ve varsa mevcut materyaller\n- Beğendiğiniz örnekler\n\n_Bu bir demo hizmettir._`,
        tags: s.tags,
        status: "active",
        startingPriceKurus: s.pk[0][1] * 100,
        minDeliveryDays: s.pk[0][2],
        publishedAt: new Date(Date.now() - Math.random() * 20 * 864e5),
        requirements: "Projenizi kısaca anlatın ve varsa örnek bağlantıları paylaşın.",
        faqs: [{ q: "Revizyon süreci nasıl işliyor?", a: "Her teslimattan sonra geri bildirimlerinizi tek mesajda iletmeniz yeterli; paketinizdeki revizyon hakkı kadar düzenleme yapıyorum." }],
        extras: [{ id: "hizli", title: "Hızlı teslim (süre yarıya iner)", priceKurus: Math.round(s.pk[0][1] * 0.4) * 100, days: -Math.floor(s.pk[0][2] / 2) }],
      })
      .returning();
    const tiers = ["basic", "standard", "premium"] as const;
    await db.insert(schema.servicePackages).values(
      s.pk.map((p, i) => ({ serviceId: row!.id, tier: tiers[i]!, name: p[0], description: p[4].join(", "), priceKurus: p[1] * 100, deliveryDays: p[2], revisions: p[3], features: p[4] })),
    );
  }

  const custEmail = "musteri@demo.eksen.local";
  let cust = await db.query.users.findFirst({ where: eq(schema.users.email, custEmail) });
  if (!cust) [cust] = await db.insert(schema.users).values({ email: custEmail, name: "Selin Demir", passwordHash: hash, role: "customer", emailVerifiedAt: new Date() }).returning();
  const projects = [
    { cat: "restoran-sitesi", title: "Kadıköy’deki kahve dükkânımız için web sitesi ve QR menü", desc: "Üç şubeli bir kahve dükkânıyız. Şube bilgileri, menü ve etkinlik duyurularının olduğu sade bir site ile masalar için güncellenebilir QR menü istiyoruz. Menüde Türkçe ve İngilizce olmalı.", min: 15000, max: 30000 },
    { cat: "android-uygulama", title: "Spor salonu üyeleri için ders rezervasyon uygulaması", desc: "Üyelerimizin grup derslerine yer ayırtabileceği, iptal edebileceği ve bildirim alabileceği bir mobil uygulama arıyoruz. Mevcut üyelik yazılımımızın API’si var.", min: 60000, max: 120000 },
  ];
  for (const p of projects) {
    const slug = (await import("../src/lib/utils")).slugify(p.title, 70);
    await db
      .insert(schema.projects)
      .values({ buyerId: cust!.id, categoryId: catIds[p.cat]!, slug, title: p.title, description: p.desc, budgetMinKurus: p.min * 100, budgetMaxKurus: p.max * 100, deadline: new Date(Date.now() + 40 * 864e5) })
      .onConflictDoNothing();
  }
  console.log(`✓ demo: ${providers.length} uzman, ${services.length} hizmet, ${projects.length} proje (şifre: demo-sifre-123)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
