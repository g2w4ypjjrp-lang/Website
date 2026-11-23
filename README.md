# Eksen — Türkiye'nin dijital hizmet pazaryeri

Müşterilerin web, mobil, tasarım, yazılım, pazarlama, video ve yapay zekâ hizmetleri satın aldığı; freelancer, ajans ve şirketlerin hizmet sattığı; platformun her satıştan komisyon aldığı pazaryeri.

> "Eksen" çalışma adıdır. Marka tescili ve alan adı uygunluğu (eksen.com.tr, eksen.app vb.) kontrol edilmelidir.

## Hızlı başlangıç

```bash
cp .env.example .env            # DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run db:migrate              # şema + arama dizinleri
npm run db:seed                 # kategoriler, SEO açılış sayfaları, blog, yasal sayfa taslakları, yönetici
npm run db:seed:demo            # (isteğe bağlı) "demo" etiketli uzman/hizmet/proje — production'da çalıştırmayın
npm run dev                     # http://localhost:3000
```

Demo hesapları (`db:seed:demo` sonrası, şifre `demo-sifre-123`): `musteri@demo.eksen.local`, `deniz-aksoy@demo.eksen.local`, `elif-sahin@demo.eksen.local`. Yönetici: `.env` içindeki `ADMIN_EMAIL` / `ADMIN_PASSWORD` → `/yonetim`.

## Teknoloji

| Katman | Seçim | Neden |
| --- | --- | --- |
| Uygulama | Next.js 16 (App Router, RSC, Server Actions), React 19, TypeScript | SEO için sunucu tarafı render, tek kod tabanında API + arayüz |
| Stil | Tailwind CSS v4, kendi tasarım sistemi (`src/app/globals.css`) | Hazır UI kiti yok; tutarlı token'lar |
| Veritabanı | PostgreSQL + Drizzle ORM | Tip güvenli, sıfır çalışma zamanı motoru; Supabase/Neon/RDS'e taşınabilir |
| Arama | pg_trgm + Türkçe normalizasyon (`search_norm`) | Ek servis olmadan yazım toleranslı arama |
| Kimlik | Kendi oturum sistemi (bcrypt, httpOnly çerez, DB oturumları) | Rol ayrımı ve denetim tam kontrolde |
| Barındırma | Cloudflare Workers (OpenNext), Hyperdrive, R2, Images, Durable Objects, Cron Triggers | Türkiye'deki kenar noktalarından sunum, ISR önbelleği, sunucu yönetimi yok |
| Gerçek zamanlı | Server-Sent Events (50 sn'de bir yenilenen, kaldığı yerden devam eden akış) | Workers süre sınırlarıyla uyumlu canlı mesajlaşma |
| Ödeme | `PaymentProvider` arayüzü: iyzico Pazaryeri + sandbox | Split ödeme, havuz, iade, alt üye işyeri |
| Dosya | R2 (Cloudflare) veya yerel disk (Node), sihirli bayt doğrulaması, EXIF/konum temizleme, Images ile AVIF/WebP | Aynı API iki ortamda |
| E-posta | Outbox tablosu + Resend HTTP API (Workers) veya SMTP (Node), `after()` ile yanıttan sonra | Kayıtlı, tekrar denenebilir gönderim |
| Yönetici güvenliği | TOTP iki adımlı doğrulama (RFC 6238, Web Crypto), sırlar AES-GCM ile şifreli | Şifre sızsa bile panel korunur |

Ayrıntılar: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Cloudflare kurulumu: [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md)

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` / `build` / `start` | Geliştirme, derleme, production |
| `npm run lint` | TypeScript tip kontrolü |
| `npm run db:generate` | Şema değişikliğinden migrasyon üret |
| `npm run db:migrate` | Migrasyonları uygula |
| `npm test` | Birim testleri: görsel meta veri temizleme, TOTP (RFC 6238 vektörleri), 81 il verisi ve Türkçe ek çekimi |
| `npm run cf:preview` | Cloudflare çalışma ortamında (workerd) yerel önizleme, http://localhost:8787 |
| `npm run cf:deploy` | Cloudflare'e yayınla (gizli değer koruması ile) |

Zamanlanmış görev (saatte bir): Cloudflare'de Cron Trigger ile otomatik çalışır. Node kurulumunda: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://ALAN-ADI/api/cron/run`. Otomatik onay, hakediş serbest bırakma, planlanmış blog yayını ve e-posta yeniden denemesi bu görevle çalışır.

## 81 il için yerel SEO

- `/il` tüm illeri bölgelere göre listeler. `/il/izmir` gibi il sayfaları ilin sektör yapısına göre ihtiyaçları, o ildeki uzmanları ve açık projeleri gösterir.
- `/web-sitesi-yaptirma/izmir` gibi hizmet × il sayfaları gerçek uzman ve fiyat verisi, sektöre özgü tavsiye, SSS ve `Service` + `FAQPage` şeması içerir.
- **İnce sayfa üretilmez:** hizmet × il sayfası yalnızca 30 büyükşehirde veya o ilde yeterli uzman olduğunda indekslenir. Diğerleri `noindex, follow` kalır. Eşikler **Yönetim → Yerel SEO** ekranından değiştirilir.
- Aramada il adı algılanır ("izmir web sitesi" → ilgili il sayfası önerilir). Profil, fatura ve proje formlarında il serbest metin değil, 81 il listesinden seçilir.

## Temalar

İki tema vardır ve **Yönetim → Tema ve görünüm** ekranından tek tıkla değiştirilir; varsayılan Tema 1'dir. Seçim veritabanında saklanır, kök düzende `<html data-theme="…">` olarak uygulanır ve tüm sayfalar (panel ve yönetim dahil) aynı tasarım değişkenlerini kullanır.

| Tema | Özellikler |
| --- | --- |
| **Tema 1 · Modern Premium** (`premium`, varsayılan) | Ortalanmış güçlü başlık ve “Uzman bul” araması, gerçek hizmetlerden ürün arayüzü önizlemesi, kategori çizimleri, güven sistemi kartları, koyu alt bilgi |
| **Tema 2 · Light Professional** (`light`) | Sade iki sütunlu giriş, ölçülü başlıklar, ikonlu 8 kategori kartı, öne çıkan uzmanlar, 4 adımlı “Nasıl çalışır?”, “İşini güvenle yaptır.”, iki çağrı alanı, açık kurumsal alt bilgi |

Renk, köşe, gölge ve başlık boyutları `src/app/globals.css` içindeki `[data-theme]` bloklarındadır; ana sayfa düzenleri `src/components/home/home-premium.tsx` ve `home-light.tsx`. Sosyal medya bağlantıları aynı ekrandan girilir ve yalnızca girilen hesaplar alt bilgide görünür.

## Yönetim paneli

`/yonetim` (`/admin` da yönlenir). Yalnızca yönetici rolü girebilir; diğer kullanıcılar giriş sayfasına yönlendirilir ve sayfalar `noindex` olarak işaretlenir. **Güvenlik** sayfasından iki adımlı doğrulama kurulur. `ADMIN_2FA_REQUIRED=true` iken kurulum yapılmadan diğer yönetim sayfaları açılmaz. Açık oturumlar listelenir ve diğer cihazlardaki oturumlar kapatılabilir. **Kurumsal başvurular** ekranı `/kurumsal` formundan gelen talepleri durum ve iç notla takip eder.

## Mobil API (v1)

Android / iOS uygulamaları web ile aynı servis katmanını kullanır. Kimlik doğrulama `Authorization: Bearer <token>` ile yapılır.

| Uç | Açıklama |
| --- | --- |
| `POST /api/v1/auth/login` | `{ email, password }` → `{ token, expiresAt, user }` (yönetici hesapları kapalı) |
| `GET /api/v1/me` | Oturumdaki kullanıcı |
| `GET /api/v1/categories` | Kategori ağacı |
| `GET /api/v1/services` | Web’deki filtrelerin aynısı: `q, kategori, min, max, teslim, puan, seviye, paket, sehir, cevrimici, siralama, sayfa` |
| `GET /api/v1/services/:slug` | Hizmet detayı, paketler, ek hizmetler |
| `GET /api/v1/orders` | Kullanıcının siparişleri |

## Önbellek ve performans

Ana sayfa (5 dk), açılış sayfaları, blog, sabit sayfalar ve kategori listesi (10 dk) ISR ile statik sunulur; yönetimden yapılan düzenlemeler ilgili sayfayı anında yeniler. Kullanıcıya özel başlık alanı `/api/me` üzerinden tarayıcıda yüklenir. PWA: `public/sw.js` yalnızca statik varlıkları önbelleğe alır, çevrimdışıyken `/cevrimdisi` gösterilir.

> Production derlemesinde sandbox ödeme varsayılan olarak kapalıdır. Yerel veya staging testinde `ALLOW_SANDBOX_PAYMENTS=true`; canlıda asla.
