# Eksen — Mimari ve ürün planı

## 1. Kullanıcı rolleri

| Rol | Yetki | Not |
| --- | --- | --- |
| Müşteri (`customer`) | Hizmet satın alma, proje açma, teklif kabul etme, mesaj, revizyon, onay, iade, değerlendirme, favori | Kayıtta seçilir |
| Hizmet sağlayıcı (`provider`) | Profil, portföy, hizmet/paket yönetimi, teklif verme, teslimat, kazanç | Hesap türü: bireysel, ajans, şirket |
| Yönetici (`admin`) | Tüm yönetim paneli | **Kayıt formundan oluşturulamaz**; yalnızca seed/veritabanı ile. `/yonetim` yönetici olmayanlara görünmez |

Her sunucu eylemi kendi içinde rol ve sahiplik kontrolü yapar (`requireUser`, `requireRole`, `requireAdmin`). Proxy yalnızca oturum çerezi olmayanları erken yönlendirir.

## 2. Veri modeli (özet)

`users`, `sessions`, `auth_tokens` · `provider_profiles`, `portfolio_items` · `categories` (ağaç, kategori komisyonu, SEO alanları, SSS) · `services`, `service_packages` (basic/standard/premium) · `projects`, `offers` · `orders`, `order_events` (durum geçmişi) · `payments`, `payouts`, `tickets` (iade, uyuşmazlık, şikâyet) · `conversations`, `messages`, `blocks` · `reviews` (sipariş başına tek, yalnızca `completed` siparişlere) · `favorites`, `notifications`, `email_outbox`, `uploads` · `blog_posts`, `landing_pages`, `static_pages`, `redirects`, `banners`, `settings` · `audit_logs`, `daily_stats`.

Tutarlar **kuruş** (integer), oranlar **baz puan** (1500 = %15) olarak tutulur; kayan nokta hatası yoktur.

## 3. Sipariş durum makinesi (`src/server/orders.ts`)

```
awaiting_payment ─ödeme─▶ payment_received ─▶ created ─uzman başlatır─▶ in_progress
in_progress ─teslim─▶ delivered ─onay─▶ completed ─▶ hakediş (held → available → paid)
delivered ─revizyon─▶ revision_requested ─kabul─▶ awaiting_delivery ─teslim─▶ delivered
aktif durumlar ─iade talebi─▶ refund_in_progress ─yönetici─▶ cancelled (iade) | önceki duruma dönüş
aktif durumlar ─uyuşmazlık─▶ disputed ─yönetici─▶ completed | cancelled
```

Geçişler satır kilidiyle (`SELECT … FOR UPDATE`) yapılır; her geçiş `order_events` ve `audit_logs` kaydı, sohbet içi sistem mesajı ve bildirim üretir.

## 4. Ödeme ve komisyon

- Komisyon önceliği: **uzmana özel oran → alt kategori → üst kategori → genel oran**. Oran sipariş anında `orders.commission_bps` alanına sabitlenir.
- Örnek: 10.000 ₺ satış, %15 komisyon → platform 1.500 ₺, uzman 8.500 ₺.
- Kart verisi platforma gelmez; ödeme sağlayıcının barındırdığı form kullanılır.
- Callback'te token sağlayıcı API'sinden doğrulanır, **tutar sipariş tutarıyla eşleşmezse** sipariş ödenmiş sayılmaz. İşlem idempotenttir.
- iyzico Pazaryeri: her uzman için alt üye işyeri (`subMerchantKey`), sepet kaleminde `subMerchantPrice` = uzman payı, onayda `item/approve` ile serbest bırakma, iadede `refund`.

## 5. SEO mimarisi

- Tüm herkese açık sayfalar sunucuda render edilir; her sayfa kendi title, description, canonical, Open Graph ve Twitter kartını üretir (`src/lib/seo.ts`).
- Temiz Türkçe karakterden arındırılmış URL'ler: `/kategori/…`, `/hizmet/…`, `/uzman/…`, `/blog/…`, kök seviyede programatik açılış sayfaları (`/web-sitesi-yaptirma`, `/qr-menu` …).
- **Programatik SEO, kalite kapısıyla:** açılış sayfaları yalnızca yönetici tarafından ve en az 250 kelimelik özgün içerikle yayınlanabilir. Fiyat özeti yalnızca en az 3 gerçek aktif ilan varsa gösterilir.
- Schema.org: Organization, WebSite + SearchAction, BreadcrumbList, Service + AggregateOffer, AggregateRating (**yalnızca gerçek değerlendirme varsa**), FAQPage (yalnızca sayfada görünen SSS), Article, ProfilePage.
- Sitemap index (`/sitemap.xml`) → bölümlü sitemap'ler (5.000 URL/dosya); yalnızca yayında ve indekslenebilir sayfalar. Hizmeti olmayan uzman profilleri ince içerik olmaması için noindex.
- Filtre/sıralama parametreli listeler `noindex,follow`; yalnızca `?sayfa=` indekslenir. Arama, panel, yönetim ve ödeme sayfaları kapalı.
- Slug değişikliklerinde otomatik 301; yönetim panelinden yönlendirme yönetimi.
- Google Search Console / Bing doğrulaması ortam değişkeniyle.

## 6. Güvenlik

bcrypt (12) şifre, httpOnly + SameSite=Lax + Secure çerez, DB'de yalnızca token özeti; e-posta doğrulama ve tek kullanımlık, süreli şifre sıfırlama; oturum iptali; giriş, kayıt, mesaj, teklif ve proje için hız sınırı; Zod ile girdi doğrulama; Drizzle parametreli sorgular; markdown beyaz liste temizleme (XSS); JSON-LD kaçışı; Server Actions origin kontrolü ve API'de Origin doğrulaması (CSRF); dosya yüklemede sihirli bayt kontrolü, boyut sınırı, görsellerin yeniden kodlanması (EXIF/konum silinir), `nosniff` ve kısıtlı CSP ile sunum; özel dosyalarda sohbet/proje bazlı yetki; güvenlik başlıkları (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy); platform dışı iletişim tespiti ve uyarı; engelleme ve şikâyet; tüm finansal ve yönetici işlemlerinde denetim kaydı.

## 7. Mobil ve PWA

Mobil için ayrıca tasarlanmış alt sekme çubuğu, tam ekran menü, kaydırılabilir filtre çipleri, yapışkan sipariş butonu; web app manifest. API sınırı sunucu eylemleri ve `/api/*` uçlarındadır. Native uygulama için aynı servis katmanı (`src/server/*`) REST/RPC uçlarına açılabilir.

## 8. Kullanıcının sağlaması gerekenler

| Konu | Gereken |
| --- | --- |
| Marka ve alan adı | "Eksen" için TÜRKPATENT araması ve alan adı satın alma; `NEXT_PUBLIC_SITE_URL` |
| Ödeme | iyzico (veya PayTR / Param) **pazaryeri** sözleşmesi, `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `PAYMENT_PROVIDER=iyzico`; her uzman için alt üye işyeri kaydı |
| Hukuk | Kullanım koşulları, KVKK aydınlatma metni, gizlilik, mesafeli satış, iade metinleri **taslaktır**; avukat onayı, şirket unvanı, VERBİS kaydı |
| Vergi | e-Fatura / e-Arşiv entegratörü (komisyon faturaları için) |
| E-posta | SMTP veya transactional e-posta sağlayıcısı (`SMTP_URL`, `MAIL_FROM`), SPF/DKIM/DMARC |
| Altyapı | Yönetilen PostgreSQL, S3 uyumlu depolama, CDN, saatlik cron, yedekleme |
| Arama motorları | Search Console ve Bing doğrulama kodları |

## 9. Sonraki adımlar

1. Çok sunuculu kurulum için Redis tabanlı hız sınırı ve mesajlaşma yayını.
2. Kurumsal üyelik (şirket hesapları için toplu fatura ve ekip yönetimi) ve abonelik paketleri.
3. Mobil API’nin sipariş oluşturma, mesajlaşma ve push bildirim uçlarıyla genişletilmesi.
4. Otomatik test paketi (Playwright e2e senaryoları CI’a taşınmalı).

## 10. Gelir modelleri (uygulananlar)

| Model | Durum |
| --- | --- |
| Satış komisyonu | Genel / kategori / uzmana özel oran, sipariş anında sabitlenir |
| Öne çıkarma | Uzman panelinden satın alınır (7 gün), aramada ve ana sayfada “Öne çıkan” etiketiyle |
| Premium üyelik | Uzman panelinden satın alınır (30 gün), sıralamada öncelik ve rozet; otomatik yenileme yok |
| Sponsorlu listeleme | Yönetici tarafından işaretlenir, kartta “Sponsorlu” etiketi |
| Reklam alanları | Banner yönetimi (ana sayfa, kategori, arama alanları) |
| Kurumsal üyelik | Planlanan |
