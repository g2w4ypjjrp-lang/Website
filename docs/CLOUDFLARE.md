# Cloudflare'de yayına alma

Eksen, Cloudflare Workers üzerinde [OpenNext](https://opennext.js.org/cloudflare) ile çalışır. Bu belge, sıfırdan canlıya geçişi ve sitenin neden donmadan, düşük gecikmeyle çalıştığını anlatır.

## 1. Mimari

```
Ziyaretçi (Türkiye)
   │
   ▼
Cloudflare kenarı (İstanbul / İzmir / Ankara PoP)
   ├─ Statik dosyalar (JS, CSS, yazı tipleri, simgeler) ── ASSETS: CDN'den doğrudan, 1 yıl önbellek
   ├─ Herkese açık sayfalar (ana sayfa, kategori, il, hizmet × il, blog) ── ISR: R2 + bölgesel önbellek
   └─ Dinamik istekler (panel, ödeme, mesaj, arama) ── Worker (Next.js 16)
                                                         │  Smart Placement: veritabanına yakın bölgede çalışır
                                                         ▼
                                                   Hyperdrive (bağlantı havuzu)
                                                         ▼
                                                   PostgreSQL (Frankfurt, eu-central-1)

Yan servisler: R2 "UPLOADS" (kullanıcı dosyaları) · Images (AVIF/WebP) · Cache API · Durable Objects (ISR kuyruğu ve etiket önbelleği) · Cron Triggers (saatlik görevler)
```

| Bağlantı (`wrangler.jsonc`) | Ne işe yarar |
| --- | --- |
| `HYPERDRIVE` | PostgreSQL bağlantı havuzu. Her istekte TCP + TLS + kimlik doğrulama el sıkışması yapılmaz. |
| `UPLOADS` (R2) | Avatar, hizmet kapağı, teslimat ve mesaj ekleri. Görsellerdeki EXIF/konum bilgisi yüklemede silinir. |
| `NEXT_INC_CACHE_R2_BUCKET` (R2) | ISR sayfa önbelleği; önünde bölgesel Cache API katmanı vardır. |
| `NEXT_CACHE_DO_QUEUE`, `NEXT_TAG_CACHE_DO_SHARDED` | Arka planda sayfa yenileme kuyruğu ve `revalidatePath` etiket önbelleği. |
| `IMAGES` | `/api/files/:id?w=480` isteklerinde boyutlandırma ve AVIF/WebP dönüşümü. Sonuç kenarda önbelleğe alınır. |
| `WORKER_SELF_REFERENCE` | ISR yenilemesi için worker'ın kendisini çağırması. |
| Cron `17 * * * *` | Otomatik teslim onayı, hakediş serbest bırakma, planlı blog yayını, başarısız e-postaların yeniden denenmesi, süresi dolan oturum ve sayaçların temizlenmesi. |

## 2. Neden donma ve gecikme olmaz

- **Herkese açık sayfalar veritabanına gitmez.** Ana sayfa, kategori, 81 il ve hizmet × il sayfaları ISR ile üretilir. İlk ziyaretten sonra kenardan önbellekten sunulur. Yönetimden yapılan değişiklik ilgili sayfayı anında yeniler.
- **Worker veritabanının yanında çalışır.** Smart Placement, çok sorgulu panel sayfalarını veritabanına yakın Cloudflare bölgesinde çalıştırır. Kullanıcı ile kenar arasındaki bağlantı yine Türkiye'deki noktadan kurulur.
- **Bağlantı havuzu:** Hyperdrive, Postgres bağlantılarını sıcak tutar. Worker her istekte kendi kısa ömürlü istemcisini açar ve yanıt bitince kapatır, böylece istekler arasında bağlantı sızmaz.
- **Statik dosyalar worker'a hiç uğramaz.** `public/_headers` ile JS, CSS ve yazı tipleri 1 yıl `immutable` önbelleklenir. Yazı tipleri siteyle birlikte sunulur, Google Fonts'a ek istek yoktur.
- **Görseller tek seferde dönüştürülür:** İlk istekte Images ile küçültülür, sonraki isteklerde Cache API'den gelir (`cf-cache-status: HIT`).
- **E-posta yanıtı bekletmez:** Bildirim e-postaları `after()` ile yanıt döndükten sonra gönderilir. Başarısız olanlar cron ile yeniden denenir.
- **Canlı mesajlaşma süre sınırına takılmaz:** SSE bağlantısı 50 saniyede bir kendini yeniler. Tarayıcı kaldığı mesajdan (`Last-Event-ID`) devam eder.
- **Hız sınırı paylaşımlı:** Sayaçlar Postgres'te tutulur. Tüm Cloudflare izolatları aynı sınırı görür.

Yerel workerd ölçümleri (`wrangler dev`, yerel Postgres, önbellek ısındıktan sonra): ana sayfa 31 ms, il sayfası 22 ms, hizmet × il 39 ms, hizmet detayı 52 ms, kategori 52 ms. Görsel varyantı ilk istekte yaklaşık 100 ms, sonrasında önbellekten gelir. Mesaj karşı tarafta yaklaşık 1 saniyede, sayfa yenilenmeden görünür. Mobil koşullarda (4 kat CPU yavaşlatma, 1,6 Mbps / 150 ms ağ) LCP ana sayfada 1,1 sn, il ve hizmet × il sayfalarında 0,9–1,0 sn, hizmet detayında 1,9 sn ölçüldü; CLS tüm sayfalarda 0,005. Yerel önizleme sıkıştırma yapmaz, canlıda Cloudflare brotli ile aktarım 4–6 kat küçülür.

## 3. Gereksinimler

| Gerekli | Not |
| --- | --- |
| Cloudflare hesabı ve **Workers Paid** planı | Ücretsiz planda istek başına CPU süresi sunucu tarafı render için yetmez. Sıkıştırılmış worker boyutu şu an yaklaşık 2,4 MB'tır. |
| Alan adı | Cloudflare DNS'te olmalı (ör. `eksen.com.tr`). |
| PostgreSQL 15+ | Frankfurt bölgesinde yönetilen servis önerilir (Neon, Supabase, Aiven, AWS RDS). `pg_trgm` eklentisi gerekir. |
| iyzico Pazaryeri hesabı | `IYZICO_API_KEY`, `IYZICO_SECRET_KEY` |
| Resend hesabı | `RESEND_API_KEY`. Gönderen alan adı için SPF/DKIM kayıtları. Workers SMTP soketi açamaz. |

## 4. Adım adım kurulum

```bash
# 0) Giriş
npx wrangler login

# 1) Depolama
npx wrangler r2 bucket create eksen-uploads
npx wrangler r2 bucket create eksen-opennext-cache

# 2) Veritabanı bağlantısı (önbellek KAPALI: sipariş ve ödeme durumları her zaman güncel okunmalı)
npx wrangler hyperdrive create eksen-db \
  --connection-string="postgres://KULLANICI:SIFRE@SUNUCU:5432/eksen?sslmode=require" \
  --caching-disabled
#   → çıktıdaki id'yi wrangler.jsonc içinde "HYPERDRIVE_ID_BURAYA" yerine yazın

# 3) Şema ve temel veriler (kendi bilgisayarınızdan, canlı veritabanına)
DATABASE_URL="postgres://...canlı..." ADMIN_EMAIL="siz@alanadi.com" ADMIN_PASSWORD="uzun-ve-benzersiz" \
  npm run db:migrate && npm run db:seed
#   db:seed:demo ÇALIŞTIRMAYIN (yalnızca tasarım ve test için örnek veridir)

# 4) Gizli değerler (worker paketine gömülmez, Cloudflare'de şifreli saklanır)
npx wrangler secret put CRON_SECRET            # rastgele uzun değer
npx wrangler secret put TOTP_ENCRYPTION_KEY    # node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put IYZICO_API_KEY
npx wrangler secret put IYZICO_SECRET_KEY

# 5) Derleme ortamı: yalnızca herkese açık değerler
cat > .env.production <<'ENV'
NEXT_PUBLIC_SITE_URL=https://eksen.com.tr
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
ENV

# 6) Yayına al
npm run cf:deploy
```

Son adımlar (Cloudflare paneli):

1. **Workers & Pages → eksen → Settings → Domains & Routes:** `eksen.com.tr` için özel alan adı ekleyin. `www` için **Rules → Redirect Rules** ile kalıcı (301) yönlendirme tanımlayın.
2. **SSL/TLS:** Full (strict). **Always Use HTTPS** açık olmalı.
3. **Yönetici:** `https://eksen.com.tr/giris` adresinden seed'de verdiğiniz e-posta ve şifreyle girin. `ADMIN_2FA_REQUIRED=true` olduğu için ilk girişte **Güvenlik** sayfasına yönlendirilirsiniz. Telefonunuzdaki doğrulama uygulamasıyla QR kodu okutup kurulumu tamamlayın. Yönetim paneli adresi `/yonetim`'dir (`/admin` da oraya yönlenir).
4. **Search Console:** `https://eksen.com.tr/sitemap.xml` adresini gönderin. İl sayfaları `/haritalar/sitemap/2000.xml` içindedir.

> `cf:build` ve `cf:deploy`, `.env*` dosyalarında gizli değer bulursa derlemeyi durdurur. OpenNext `.env` içeriğini worker paketine gömer, bu yüzden gizli değerler yalnızca `wrangler secret put` ile verilmelidir.

## 5. Güvenlik ayarları (önerilen)

| Ayar | Değer |
| --- | --- |
| WAF → Rate limiting rules | `/giris`, `/kayit`, `/giris/dogrulama`, `/api/v1/auth/login` için IP başına dakikada 10 istek → Managed Challenge. Uygulama içi sınırlar da vardır; bu kural kenarda erken keser. |
| Zero Trust → Access (isteğe bağlı) | `eksen.com.tr/yonetim*` için yalnızca yönetici e-postalarına izin veren uygulama. Şifre + 2FA'nın önüne üçüncü bir katman ekler. 50 kullanıcıya kadar ücretsizdir. |
| Security → Bots | Arama motoru botları doğrulanmış bot olarak geçer. Mobil uygulama API'si kullanılacaksa `/api/v1/*` için bot kurallarında istisna tanımlayın. |
| Caching → Configuration | Varsayılan bırakın. Sayfa önbelleği uygulama tarafından yönetilir, ek "Cache Everything" kuralı eklemeyin (panel sayfaları kişiye özeldir). |

## 6. Yerel önizleme (workerd)

```bash
npm run cf:preview      # derler ve http://localhost:8787 adresinde Cloudflare çalışma ortamında açar
```

Yerel önizleme `localConnectionString` ile yerel Postgres'e bağlanır. R2, Durable Objects ve Images yerelde taklit edilir. Wrangler yerel değişkenleri `.env` dosyasından okur. Tek bir değeri geçici olarak değiştirmek için:

```bash
npx wrangler dev --port 8787 --var ADMIN_2FA_REQUIRED:false
```

Proje kökünde bir `.dev.vars` dosyası oluşturursanız (git'e girmez) Wrangler `.env` yerine yalnızca onu okur. Bu durumda yerelde gereken tüm değerleri (`PAYMENT_PROVIDER=sandbox`, `ALLOW_SANDBOX_PAYMENTS=true` vb.) oraya yazın.

Yerel günlükte görülen `Unable to enqueue` uyarısı, tarayıcının yarıda bıraktığı önceden yükleme isteklerinden kaynaklanır ve zararsızdır.

## 7. Asla yapmayın

- Canlıda `ALLOW_SANDBOX_PAYMENTS=true`: ödeme alınmadan sipariş ödenmiş sayılır.
- Hyperdrive sorgu önbelleğini açmak: ödeme ve sipariş durumları gecikmeli okunur.
- Gizli değerleri `.env.production` içine yazmak: worker paketine gömülür. Derleme koruması bunu engeller, `--local` bayrağı yalnızca yerel önizleme içindir.
- Canlı veritabanında `db:seed:demo` çalıştırmak.

## 8. Kurtarma: yönetici 2FA erişimi

Telefon kaybolursa ya da `TOTP_ENCRYPTION_KEY` değiştirilirse yönetici kod üretemez. Veritabanına erişimi olan biri iki adımlı doğrulamayı sıfırlayabilir. Sonraki girişte kurulum yeniden istenir:

```sql
UPDATE users SET totp_secret = NULL, totp_enabled_at = NULL WHERE email = 'yonetici@alanadi.com';
```

`TOTP_ENCRYPTION_KEY` değerini değiştirmeden önce tüm yöneticilerin 2FA'sını bu şekilde sıfırlayın.
