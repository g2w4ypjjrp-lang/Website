type Sub = [slug: string, name: string];
export type CatSeed = { slug: string; name: string; short: string; intro: string; commissionBps?: number; filters?: { key: string; label: string; options: string[] }[]; subs: Sub[]; faqs: { q: string; a: string }[] };

export const CATEGORIES: CatSeed[] = [
  {
    slug: "web-ve-yazilim",
    name: "Web ve yazılım",
    filters: [{ key: "altyapi", label: "Altyapı", options: ["WordPress", "Shopify", "WooCommerce", "Next.js"] }],
    short: "Kurumsal siteden SaaS ürününe kadar web tabanlı her iş.",
    intro:
      "Bir web projesinin maliyetini en çok belirleyen şey sayfa sayısı değil, **içerik ve entegrasyon ihtiyacıdır**. Tanıtım sitesi için hazır bir altyapı yeterliyken; stok, ödeme ya da muhasebe entegrasyonu gereken işlerde özel geliştirme gerekir.\n\nTeklif istemeden önce sitenin kimin için olduğunu, hangi sayfaların şart olduğunu ve yayından sonra içeriği kimin güncelleyeceğini netleştirin. Bu üç cevap, uzmanların size gerçekçi süre ve fiyat vermesini sağlar.",
    subs: [
      ["kurumsal-web-sitesi", "Kurumsal web sitesi"],
      ["e-ticaret-sitesi-kurulumu", "E-ticaret sitesi"],
      ["landing-page", "Landing page"],
      ["blog-sitesi", "Blog sitesi"],
      ["haber-sitesi", "Haber sitesi"],
      ["restoran-sitesi", "Restoran sitesi"],
      ["qr-menu-sistemi", "QR menü"],
      ["ozel-web-yazilimi", "Özel web yazılımı"],
      ["web-uygulamasi", "Web uygulaması"],
      ["crm-sistemleri", "CRM sistemleri"],
      ["erp-sistemleri", "ERP sistemleri"],
      ["otomasyon-yazilimi", "Otomasyon"],
      ["api-entegrasyonu", "API entegrasyonu"],
      ["saas-gelistirme", "SaaS geliştirme"],
    ],
    faqs: [
      { q: "Web sitesi ne kadar sürede hazır olur?", a: "Hazır altyapıyla kurulan 5–8 sayfalık bir kurumsal site genellikle 1–3 hafta sürer. Özel tasarım ve entegrasyon gerektiren projelerde süre 4–12 haftaya çıkabilir." },
      { q: "Alan adı ve hosting fiyata dahil mi?", a: "Hizmete göre değişir. Paket açıklamasında yazmıyorsa dahil değildir; sipariş öncesinde uzmana mesajla sorabilirsiniz. Alan adının sizin adınıza kayıtlı olmasını şart koşun." },
      { q: "Site teslim edildikten sonra kaynak kodlar bana mı ait?", a: "Siparişte aksi belirtilmedikçe teslim edilen tasarım ve kodun kullanım hakları ödeme tamamlandığında müşteriye geçer. Lisanslı tema ve eklentiler kendi lisans koşullarına tabidir." },
    ],
  },
  {
    slug: "mobil-uygulama",
    name: "Mobil uygulama",
    short: "Android, iOS ve çapraz platform uygulama geliştirme.",
    intro:
      "Mobil uygulama projelerinde ilk karar, **yerel (native) mi çapraz platform mu** geliştirileceğidir. Flutter ve React Native, tek kod tabanıyla iki mağazaya çıkmayı sağlar ve çoğu iş uygulaması için yeterlidir. Yoğun donanım kullanımı, gelişmiş animasyon veya platforma özgü özellik gerekiyorsa yerel geliştirme daha doğru olabilir.\n\nUygulamanın arka uç (API, veritabanı, bildirim servisi) ihtiyacını da teklif aşamasında konuşun; bu kalem çoğu zaman uygulamanın kendisi kadar iş çıkarır.",
    subs: [
      ["android-uygulama", "Android uygulama"],
      ["ios-uygulama", "iOS uygulama"],
      ["flutter-uygulama", "Flutter uygulama"],
      ["react-native-uygulama", "React Native uygulama"],
      ["mobil-uygulama-tasarimi", "Mobil uygulama tasarımı"],
      ["uygulama-gelistirme", "Uygulama geliştirme"],
      ["uygulama-bakim-guncelleme", "Bakım ve güncelleme"],
    ],
    faqs: [
      { q: "Uygulamayı mağazaya kim yükler?", a: "Mağaza hesapları (Google Play Console, Apple Developer) sizin adınıza açılmalıdır. Uzman, yayın sürecini sizin hesabınız üzerinden yürütür." },
      { q: "Yayından sonra bakım gerekir mi?", a: "Evet. iOS ve Android her yıl yeni sürüm yayınlar; uyumluluk güncellemeleri için bakım paketi almanız önerilir." },
    ],
  },
  {
    slug: "grafik-tasarim",
    name: "Grafik tasarım",
    short: "Logo, kurumsal kimlik, basılı ve dijital tasarım.",
    intro:
      "İyi bir tasarım brifi; markanızın kime hitap ettiğini, rakiplerinizden nasıl ayrışmak istediğinizi ve tasarımın nerelerde kullanılacağını anlatır. “Modern ve sade olsun” gibi ifadeler yerine beğendiğiniz ve beğenmediğiniz örnekleri paylaşmak, revizyon sayısını belirgin şekilde azaltır.\n\nTeslim dosyalarında vektörel kaynak (AI, SVG, PDF) ve farklı arka planlar için varyasyonlar olduğundan emin olun.",
    subs: [
      ["logo-tasarim", "Logo tasarımı"],
      ["kurumsal-kimlik", "Kurumsal kimlik"],
      ["kartvizit-tasarimi", "Kartvizit"],
      ["brosur-tasarimi", "Broşür"],
      ["katalog-tasarimi", "Katalog"],
      ["banner-tasarimi", "Banner"],
      ["sosyal-medya-tasarimlari", "Sosyal medya tasarımları"],
      ["reklam-kreatifleri", "Reklam kreatifleri"],
      ["ui-ux-tasarimi", "UI/UX tasarımı"],
      ["figma-tasarimi", "Figma tasarımı"],
    ],
    faqs: [
      { q: "Logo için kaç revizyon hakkım var?", a: "Her paketin revizyon sayısı paket tablosunda yazılıdır. Ek revizyonu, uzmanın sunduğu ek hizmetlerden satın alabilirsiniz." },
      { q: "Telif hakları kime ait olur?", a: "Ödeme tamamlandığında teslim edilen özgün tasarımın kullanım hakları müşteriye geçer. Hazır görsel/ikon kullanıldıysa lisans bilgisi teslimatta belirtilmelidir." },
    ],
  },
  {
    slug: "dijital-pazarlama",
    name: "Dijital pazarlama",
    short: "SEO, reklam yönetimi, sosyal medya ve içerik stratejisi.",
    intro:
      "Dijital pazarlama hizmetlerinde ölçülebilir hedef koymadan başlamak, en sık yapılan hatadır. “Daha fazla takipçi” yerine “aylık 40 nitelikli form başvurusu” gibi bir hedef; uzmanın stratejisini, raporlamasını ve başarısını netleştirir.\n\nReklam bütçesi ile hizmet bedeli ayrı kalemlerdir. Reklam hesaplarının sizin adınıza açılmış olmasına ve yönetici erişiminin size ait olmasına dikkat edin.",
    commissionBps: 1500,
    subs: [
      ["seo", "SEO"],
      ["google-ads", "Google Ads"],
      ["meta-ads", "Meta Ads"],
      ["instagram-reklamlari", "Instagram reklamları"],
      ["sosyal-medya-yonetim", "Sosyal medya yönetimi"],
      ["icerik-uretimi", "İçerik üretimi"],
      ["marka-stratejisi", "Marka stratejisi"],
      ["e-posta-pazarlama", "E-posta pazarlama"],
      ["performans-pazarlama", "Performans pazarlama"],
    ],
    faqs: [
      { q: "SEO hizmeti ne zaman sonuç verir?", a: "Teknik düzeltmeler birkaç hafta içinde etkisini gösterebilir; rekabetçi aramalarda kalıcı sıralama artışı çoğunlukla 3–6 ay sürer. Birinci sıra garantisi veren hizmetlere temkinli yaklaşın." },
      { q: "Reklam bütçesi fiyata dahil mi?", a: "Hayır. Hizmet bedeli, uzmanın kampanya kurulum ve yönetim ücretidir. Reklam harcaması doğrudan reklam platformuna sizin kartınızdan ödenir." },
    ],
  },
  {
    slug: "video-ve-icerik",
    name: "Video ve içerik",
    short: "Kurgu, kısa video, animasyon ve tanıtım filmleri.",
    intro:
      "Kısa video işlerinde süre, format ve platform baştan belirlenmelidir: Reels ve TikTok için 9:16, YouTube için 16:9, ürün sayfaları için kare format gerekir. Ham görüntüleri kimin sağlayacağı, müzik lisansı ve altyazı ihtiyacı fiyatı doğrudan etkiler.",
    subs: [
      ["video-edit", "Video edit"],
      ["reels", "Reels"],
      ["shorts", "Shorts"],
      ["tiktok-video", "TikTok video"],
      ["animasyon", "Animasyon"],
      ["motion-graphics", "Motion graphics"],
      ["tanitim-videosu", "Tanıtım videosu"],
      ["urun-videosu", "Ürün videosu"],
      ["yapay-zeka-video", "Yapay zekâ video üretimi"],
    ],
    faqs: [{ q: "Müzik lisansı kimin sorumluluğunda?", a: "Uzman, telifsiz veya lisanslı müzik kullanmakla yükümlüdür. Lisans kaynağını teslimatta belirtmesini isteyin." }],
  },
  {
    slug: "yapay-zeka",
    name: "Yapay zekâ",
    short: "Chatbot, otomasyon ve yapay zekâ entegrasyonları.",
    intro:
      "Yapay zekâ projelerinde başarı, modelin kendisinden çok **hangi veriye eriştiği ve hangi işi devraldığı** ile ölçülür. Müşteri hizmetleri asistanı için sık sorulan sorular, ürün kataloğu ve iade politikanız gibi güncel kaynaklar hazır olmalıdır.\n\nKişisel veri işleyen sistemlerde KVKK yükümlülüklerinizi ve verinin hangi ülkede işlendiğini uzmanla birlikte netleştirin.",
    subs: [
      ["ai-chatbot", "AI chatbot"],
      ["ai-otomasyonu", "AI otomasyonu"],
      ["ai-musteri-hizmetleri", "AI müşteri hizmetleri"],
      ["ai-icerik-sistemi", "AI içerik sistemi"],
      ["ai-entegrasyonu", "AI entegrasyonu"],
      ["chatgpt-entegrasyonu", "ChatGPT entegrasyonu"],
      ["ai-ajanlari", "AI ajanları"],
      ["is-surecleri-otomasyonu", "İş süreçleri otomasyonu"],
    ],
    faqs: [{ q: "API kullanım ücretleri kime ait?", a: "Yapay zekâ sağlayıcılarının (OpenAI, Anthropic, Google vb.) kullanım ücretleri hizmet bedeline dahil değildir ve sizin hesabınıza faturalanır." }],
  },
  {
    slug: "is-ve-danismanlik",
    name: "İş ve danışmanlık",
    short: "İş planı, dijital dönüşüm, e-ticaret ve proje yönetimi danışmanlığı.",
    intro:
      "Danışmanlık hizmetlerinde çıktı çoğu zaman bir dosya değil, **bir karar ve onu uygulama planıdır**. Bu yüzden işe başlamadan önce danışmandan neyi teslim edeceğini yazılı istemek önemlidir: rapor, yol haritası, sunum ya da belirli sayıda görüşme.\n\nŞirketinizin mevcut durumunu anlatan verileri (satış rakamları, kullandığınız yazılımlar, ekip yapısı) baştan paylaşmak, genel geçer tavsiyeler yerine size özel bir plan almanızı sağlar.",
    subs: [
      ["is-plani", "İş planı"],
      ["dijital-donusum-danismanligi", "Dijital dönüşüm danışmanlığı"],
      ["e-ticaret-danismanligi", "E-ticaret danışmanlığı"],
      ["pazar-arastirmasi", "Pazar araştırması"],
      ["sunum-ve-yatirimci-dosyasi", "Sunum ve yatırımcı dosyası"],
      ["proje-yonetimi", "Proje yönetimi"],
    ],
    faqs: [
      { q: "Danışmanlık ücreti nasıl belirlenir?", a: "Paketlerde teslim edilecek çıktı (rapor, yol haritası, görüşme sayısı) ve süre yazılıdır. Kapsam belirsizse proje oluşturup birden fazla danışmandan teklif alabilirsiniz." },
      { q: "Görüşmeler nasıl yapılır?", a: "Görüşmeler sipariş sayfasındaki mesajlaşma üzerinden planlanır. Görüşme notlarını ve teslim dosyalarını aynı sayfada saklamanız, olası bir anlaşmazlıkta kayıt olur." },
    ],
  },
  {
    slug: "yazi-ve-icerik",
    name: "Yazı ve içerik",
    short: "Blog ve SEO içerikleri, metin yazarlığı, ürün açıklaması ve çeviri.",
    intro:
      "İyi bir içerik siparişi **hedef okuru ve amacı** net tanımlar: Yazı satış mı yapacak, arama motorundan trafik mi getirecek, yoksa bir ürünü mü anlatacak? Bu cevap; dil, uzunluk ve yapı tercihlerini belirler.\n\nMarkanızın ses tonunu gösteren iki üç örnek metin ve hedeflediğiniz anahtar kelimeler, ilk taslağın beklentinize çok daha yakın gelmesini sağlar.",
    subs: [
      ["blog-yazisi", "Blog yazısı"],
      ["seo-icerik-yazarligi", "SEO içerik yazarlığı"],
      ["metin-yazarligi", "Metin yazarlığı"],
      ["urun-aciklamasi", "Ürün açıklaması"],
      ["ceviri", "Çeviri"],
      ["teknik-yazarlik", "Teknik yazarlık"],
    ],
    faqs: [
      { q: "İçerikler özgün mü olacak?", a: "Siparişte aksi yazmadıkça teslim edilen metinlerin özgün olması ve başka bir yerde yayımlanmamış olması gerekir. Teslimatta intihal kontrol sonucunu isteyebilirsiniz." },
      { q: "Revizyon hakkı nasıl kullanılır?", a: "Paketteki revizyon sayısı kadar düzeltme isteyebilirsiniz. Düzeltme taleplerinizi madde madde yazmak, revizyonun tek seferde doğru yapılmasını sağlar." },
    ],
  },
];
