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
| Gerçek zamanlı | Server-Sent Events | Mesajlaşma; ölçeklemede LISTEN/NOTIFY veya Redis |
| Ödeme | `PaymentProvider` arayüzü: iyzico Pazaryeri + sandbox | Split ödeme, havuz, iade, alt üye işyeri |
| Dosya | Yerel depolama + MIME doğrulama, sharp ile WebP | S3 uyumlu depolamaya tek dosyada geçiş |
| E-posta | Outbox tablosu + SMTP (nodemailer) | Kayıtlı, tekrar denenebilir gönderim |

Ayrıntılar: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` / `build` / `start` | Geliştirme, derleme, production |
| `npm run lint` | TypeScript tip kontrolü |
| `npm run db:generate` | Şema değişikliğinden migrasyon üret |
| `npm run db:migrate` | Migrasyonları uygula |

Zamanlanmış görev (saatte bir): `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://ALAN-ADI/api/cron/run`. Otomatik onay, hakediş serbest bırakma ve planlanmış blog yayını bu görevle çalışır.

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
