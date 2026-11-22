export type LandingSeed = {
  slug: string;
  category: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  body: string;
  faqs: { q: string; a: string }[];
};

export const LANDINGS: LandingSeed[] = [
  {
    slug: "web-sitesi-yaptirma",
    category: "web-ve-yazilim",
    h1: "Web sitesi yaptırma",
    seoTitle: "Web Sitesi Yaptırma: Uzman Bul, Teklif Al",
    seoDescription: "Kurumsal web sitesi yaptırmak için doğrulanmış uzmanlardan teklif alın. Fiyatları, teslim sürelerini ve değerlendirmeleri karşılaştırın, ödemeniz onaylayana kadar güvende kalsın.",
    intro: "İşletmenizi tanıtan, hızlı açılan ve Google’da bulunabilen bir site için uzmanların hazır paketlerini inceleyin ya da projenizi anlatıp teklif toplayın.",
    body: `## Web sitesi yaptırırken önce neyi netleştirmelisiniz?

Teklif istemeden önce üç soruya cevap verin: Site kimin için? Ziyaretçi sitede ne yapmalı (aramalı, form doldurmalı, satın almalı)? Yayından sonra içeriği kim güncelleyecek? Bu cevaplar, uzmanın hazır bir altyapı mı yoksa özel geliştirme mi önereceğini belirler.

## Fiyatı belirleyen kalemler

- **Tasarım yaklaşımı:** Hazır tema uyarlaması, özel tasarımdan belirgin şekilde daha ekonomiktir.
- **Sayfa ve içerik:** Metinleri ve görselleri sizin mi, uzmanın mı hazırlayacağı netleşmeli.
- **Entegrasyonlar:** Randevu, ödeme, CRM veya muhasebe bağlantıları ayrı iş kalemidir.
- **Çok dilli yapı:** Her dil, içerik ve SEO işini katlar.
- **Bakım:** Güvenlik güncellemeleri ve yedekleme genellikle aylık ücretlendirilir.

## Teslimatta mutlaka isteyin

Alan adının ve hosting hesabının sizin adınıza kayıtlı olmasını, yönetim paneli erişimini, temel SEO ayarlarının (başlıklar, açıklamalar, site haritası) yapılmasını ve sitenin mobilde test edilmesini şart koşun. Eksen üzerinden verilen siparişlerde ödeme, teslimatı onaylayana kadar uzmana aktarılmaz.`,
    faqs: [
      { q: "Kurumsal web sitesi kaç günde teslim edilir?", a: "Hazır altyapıyla 5–8 sayfalık siteler çoğunlukla 7–20 gün içinde teslim edilir. Özel tasarım ve entegrasyonlu projelerde süre uzar; her hizmetin teslim süresi paket tablosunda yazar." },
      { q: "Siparişten sonra site beğenmezsem ne olur?", a: "Paketteki revizyon hakkınızı kullanabilirsiniz. Teslimat sipariş kapsamını karşılamıyorsa iade talebi açabilirsiniz; Eksen ekibi süreci inceler." },
      { q: "Web sitemi kendim güncelleyebilir miyim?", a: "İçerik yönetim paneli olan paketlerde evet. Sipariş öncesinde uzmana hangi alanları kendiniz düzenleyebileceğinizi sorun." },
    ],
  },
  {
    slug: "e-ticaret-sitesi",
    category: "web-ve-yazilim",
    h1: "E-ticaret sitesi kurulumu",
    seoTitle: "E-Ticaret Sitesi Kurulumu ve Yaptırma",
    seoDescription: "Ödeme, kargo ve stok entegrasyonlu e-ticaret sitesi için uzman teklifleri. Altyapı seçeneklerini, paketleri ve teslim sürelerini karşılaştırın.",
    intro: "Ürünlerinizi kendi sitenizden satmak için altyapı kurulumu, tema uyarlama, ödeme ve kargo entegrasyonu yapan uzmanlarla çalışın.",
    body: `## Hazır altyapı mı, özel yazılım mı?

Ürün sayısı birkaç yüzü geçmeyen ve standart satış akışı olan işletmeler için hazır e-ticaret altyapıları (WooCommerce, Shopify, yerli SaaS çözümleri) hızlı ve ekonomiktir. Bayi fiyatlandırması, karmaşık varyantlar veya ERP entegrasyonu gerekiyorsa özel geliştirme daha sürdürülebilir olabilir.

## Yasal ve operasyonel kontrol listesi

- Mesafeli satış sözleşmesi, ön bilgilendirme formu ve iade koşulları sayfaları
- KVKK aydınlatma metni ve çerez tercih yönetimi
- Sanal POS veya ödeme kuruluşu başvurusu (bu başvuru işletme adına yapılır)
- Kargo firması entegrasyonu ve gönderi takip bildirimi
- e-Fatura / e-Arşiv entegrasyonu

## Uzmana iletmeniz gerekenler

Ürün sayısı, varyant yapısı (beden, renk), mevcut ürün verisinin formatı (Excel, başka bir site) ve kullanmak istediğiniz ödeme kuruluşu. Bu bilgiler olmadan verilen fiyatlar sonradan değişebilir.`,
    faqs: [
      { q: "Sanal POS başvurusunu uzman yapabilir mi?", a: "Başvuru işletmenizin adına ve belgeleriyle yapılmalıdır. Uzman entegrasyon aşamasında teknik destek verir." },
      { q: "Mevcut ürünlerimi yeni siteye taşıyabilir misiniz?", a: "Birçok uzman veri aktarımını ek hizmet olarak sunar. Ürün verinizin örnek bir dosyasını sipariş öncesi paylaşmanız fiyatın netleşmesini sağlar." },
    ],
  },
  {
    slug: "mobil-uygulama-gelistirme",
    category: "mobil-uygulama",
    h1: "Mobil uygulama geliştirme",
    seoTitle: "Mobil Uygulama Geliştirme: Android ve iOS",
    seoDescription: "Android, iOS, Flutter ve React Native uygulama geliştiren uzmanları karşılaştırın. Projenizi anlatın, teklif alın, ödemeniz güvende kalsın.",
    intro: "Fikrinizi mağazada yayınlanan bir uygulamaya dönüştürmek için tasarım, geliştirme ve yayın sürecini yönetecek uzmanı bulun.",
    body: `## Kapsamı küçük başlatın

İlk sürümü, uygulamanın tek bir temel işi kusursuz yapacağı şekilde planlayın. Her şeyi içeren bir ilk sürüm hem bütçeyi hem süreyi katlar; kullanıcı geri bildirimi gelmeden geliştirilen özelliklerin önemli bir kısmı kullanılmaz.

## Teklifleri karşılaştırırken

- **Arka uç dahil mi?** Kullanıcı hesabı, veri saklama ve bildirim gönderimi için sunucu tarafı geliştirme gerekir.
- **Tasarım kimden?** Figma tasarımı hazırsa geliştirme süresi kısalır.
- **Mağaza yayını:** Apple incelemesi ve Google Play politikaları için deneyim sorun.
- **Kaynak kod:** Kodun sizin hesabınızdaki bir depoya teslim edilmesini isteyin.

## Bakım planı

Mobil işletim sistemleri yılda en az bir büyük güncelleme alır. Yayından sonraki ilk 3–6 ay için hata düzeltme kapsamını teklif aşamasında yazılı hale getirin.`,
    faqs: [
      { q: "Flutter mı React Native mi seçmeliyim?", a: "İkisi de iki platforma tek kod tabanıyla çıkmayı sağlar. Ekibinizin ya da uzmanın deneyimi, seçimde teknolojinin kendisinden daha belirleyicidir." },
      { q: "Uygulama mağaza hesapları kimin adına açılır?", a: "Google Play Console ve Apple Developer hesapları sizin adınıza açılmalıdır; uzman bu hesaplara davet edilerek yayını yapar." },
    ],
  },
  {
    slug: "logo-tasarimi",
    category: "grafik-tasarim",
    h1: "Logo tasarımı",
    seoTitle: "Logo Tasarımı Yaptır: Profesyonel Tasarımcılar",
    seoDescription: "Markanıza özgün logo tasarımı için profesyonel tasarımcıların paketlerini inceleyin. Revizyon hakkı, vektörel teslim ve güvenli ödeme.",
    intro: "Markanızın ilk izlenimini oluşturacak özgün bir logo için tasarımcıların portföylerini ve paketlerini karşılaştırın.",
    body: `## İyi bir logo brifi nasıl yazılır?

- Markanızın ne iş yaptığını ve kime hitap ettiğini iki cümleyle anlatın.
- Beğendiğiniz ve beğenmediğiniz 3–5 logo örneği paylaşın, nedenini yazın.
- Logonun nerelerde kullanılacağını belirtin: tabela, ambalaj, uygulama ikonu, sosyal medya profili.
- Kaçınılması gereken renk veya semboller varsa baştan söyleyin.

## Teslimatta olması gerekenler

Vektörel kaynak dosya (AI, SVG veya PDF), açık ve koyu zemin varyasyonları, tek renk sürüm, ikon/simge versiyonu ve kullanılan yazı tipinin lisans bilgisi. Kurumsal kimlik paketlerinde ayrıca renk kodları ve kullanım kılavuzu beklenir.`,
    faqs: [
      { q: "Logo telif hakkı bana mı geçer?", a: "Ödeme tamamlandığında özgün tasarımın kullanım hakları size geçer. Marka tescili için başvuruyu Türk Patent ve Marka Kurumu’na ayrıca yapmanız gerekir." },
      { q: "Kaç farklı taslak görürüm?", a: "Taslak ve revizyon sayısı her paketin tablosunda yazar. Paketler arasında en belirgin fark genellikle bu iki kalemdir." },
    ],
  },
  {
    slug: "qr-menu",
    category: "web-ve-yazilim",
    h1: "QR menü",
    seoTitle: "QR Menü Sistemi: Restoran ve Kafeler İçin",
    seoDescription: "Restoran, kafe ve oteller için güncellenebilir QR menü sistemi kurulumu. Çok dilli menü, fiyat güncelleme ve masa QR kodları.",
    intro: "Fiyatlarınızı ve ürünlerinizi anında güncelleyebileceğiniz, çok dilli ve hızlı açılan bir QR menü kurdurun.",
    body: `## QR menüde nelere dikkat edilmeli?

- **Hız:** Menü, zayıf mobil bağlantıda bile birkaç saniyede açılmalı. Ağır PDF menüler bu yüzden tercih edilmez.
- **Güncelleme:** Fiyat ve ürün değişikliğini sizin yapabileceğiniz bir yönetim paneli olmalı.
- **Çok dil:** Turistik bölgelerde en az İngilizce, tercihen Almanca, Rusça ve Arapça.
- **Alerjen ve içerik bilgisi:** Ürün kartlarında gösterilmesi müşteri memnuniyetini artırır.

## Fiyat tarifesi ve mevzuat

Ticaret Bakanlığı düzenlemelerine göre fiyat tarifelerinin işletme girişinde ve masalarda görünür olması gerekir; QR menü bu yükümlülüğü tek başına karşılamayabilir. Güncel mevzuatı işletmenizin bulunduğu il ticaret müdürlüğünden teyit edin.`,
    faqs: [
      { q: "QR menü için aylık ücret ödemem gerekir mi?", a: "Uzmana göre değişir: bazı hizmetler tek seferlik kurulum, bazıları barındırma dahil aylık ücretlidir. Paket açıklamasını kontrol edin." },
    ],
  },
  {
    slug: "seo-hizmeti",
    category: "dijital-pazarlama",
    h1: "SEO hizmeti",
    seoTitle: "SEO Hizmeti: Teknik SEO, İçerik ve Danışmanlık",
    seoDescription: "Sitenizin Google’da daha görünür olması için teknik SEO, içerik ve bağlantı stratejisi sunan uzmanlarla çalışın. Gerçekçi hedefler, şeffaf raporlama.",
    intro: "Teknik denetimden içerik planına kadar SEO işlerini, hedefinizi ve raporlamayı baştan netleştirerek uzmana devredin.",
    body: `## SEO hizmeti alırken sorulacak sorular

1. İlk ay hangi teknik sorunlar düzeltilecek ve bunları nasıl raporlayacaksınız?
2. Hangi anahtar kelime gruplarına odaklanacağız, neden?
3. İçerik üretimi hizmete dahil mi, kim yazacak?
4. Bağlantı (backlink) çalışması yapılacaksa kaynaklar nasıl seçiliyor?
5. Başarıyı hangi metrikle ölçeceğiz: organik trafik, dönüşüm, sıralama?

## Kaçınılması gerekenler

“Birinci sıra garantisi” veren, kısa sürede yüzlerce bağlantı vaat eden veya Search Console erişimi istemeden çalışan hizmetler. Google’ın kurallarına aykırı yöntemler sitenizin görünürlüğünü kalıcı olarak düşürebilir.

## Gerçekçi beklenti

Teknik düzeltmeler birkaç hafta içinde etkisini gösterebilir. Rekabetçi aramalarda istikrarlı artış çoğunlukla 3–6 ay sürer.`,
    faqs: [
      { q: "SEO için aylık ne kadar bütçe ayırmalıyım?", a: "Rekabet düzeyine ve içerik ihtiyacına göre değişir. Önce tek seferlik bir teknik SEO denetimi almak, aylık hizmetin kapsamını doğru belirlemenize yardımcı olur." },
      { q: "Google’da birinci sırayı garanti eden bir hizmet var mı?", a: "Hayır. Sıralamayı yalnızca Google belirler; garanti veren hizmetlere temkinli yaklaşın." },
    ],
  },
  {
    slug: "sosyal-medya-yonetimi",
    category: "dijital-pazarlama",
    h1: "Sosyal medya yönetimi",
    seoTitle: "Sosyal Medya Yönetimi Hizmeti",
    seoDescription: "Instagram, TikTok ve LinkedIn hesaplarınız için içerik planı, tasarım, paylaşım ve raporlama yapan sosyal medya uzmanları.",
    intro: "Aylık içerik planı, tasarım, paylaşım takvimi ve raporlamayı tek bir uzmandan ya da ajanstan alın.",
    body: `## Aylık pakette olması gerekenler

- Paylaşım sayısı ve formatı (gönderi, Reels, hikâye) net olarak yazılı olmalı.
- İçerik takvimi en az bir hafta önceden onayınıza sunulmalı.
- Yorum ve mesaj yönetiminin dahil olup olmadığı belirtilmeli.
- Ay sonunda erişim, etkileşim ve takipçi değişimini gösteren rapor.

## Hesap güvenliği

Şifrenizi paylaşmak yerine Meta Business Suite veya platformların ekip erişimi özellikleriyle uzmana yetki verin. Çalışma bittiğinde erişimi tek tıkla kaldırabilirsiniz.`,
    faqs: [{ q: "Reklam yönetimi sosyal medya yönetimine dahil mi?", a: "Genellikle ayrı bir hizmettir. Paket açıklamasında reklam kurulumu belirtilmiyorsa dahil değildir." }],
  },
  {
    slug: "yazilim-gelistirme",
    category: "web-ve-yazilim",
    h1: "Yazılım geliştirme",
    seoTitle: "Özel Yazılım Geliştirme Hizmeti",
    seoDescription: "İşletmenize özel web yazılımı, CRM, ERP entegrasyonu, otomasyon ve SaaS geliştirme için deneyimli yazılımcılar ve ajanslar.",
    intro: "Hazır yazılımların karşılamadığı iş süreçleriniz için özel yazılım, entegrasyon ve otomasyon geliştiren ekiplerle çalışın.",
    body: `## Özel yazılım projelerini aşamalara bölün

Büyük projeleri tek siparişte vermek yerine keşif (analiz), ilk sürüm ve geliştirme aşamalarına ayırın. Keşif aşamasının çıktısı; ekran listesi, veri modeli ve öncelikli özellikleri içeren yazılı bir kapsam dokümanı olmalıdır.

## Sözleşmede netleşmesi gerekenler

- Kaynak kodun teslim yeri ve mülkiyeti
- Barındırma (sunucu) hesabının kimin adına olacağı
- Kabul kriterleri: hangi durumda iş “tamamlandı” sayılacak
- Yayın sonrası hata düzeltme süresi ve kapsamı

Eksen’de proje oluşturup birden fazla teklif alarak yaklaşım, süre ve fiyatı yan yana karşılaştırabilirsiniz.`,
    faqs: [{ q: "Yazılım projelerinde ödeme nasıl yapılır?", a: "Eksen’de ödeme sipariş başında alınır ve siz teslimatı onaylayana kadar havuz hesabında bekler. Büyük projeleri aşamalara bölüp her aşamayı ayrı sipariş olarak açmanız önerilir." }],
  },
];

export type PostSeed = { slug: string; title: string; excerpt: string; category: string; tags: string[]; relatedCategory?: string; content: string };

export const POSTS: PostSeed[] = [
  {
    slug: "web-sitesi-yaptirirken-dikkat-edilmesi-gerekenler",
    title: "Web sitesi yaptırırken dikkat edilmesi gereken 9 nokta",
    excerpt: "Alan adının kimin adına kayıtlı olacağından teslim sonrası bakıma kadar, web sitesi siparişi vermeden önce netleştirmeniz gerekenler.",
    category: "Rehber",
    tags: ["web sitesi", "kurumsal site", "hosting"],
    relatedCategory: "web-ve-yazilim",
    content: `Bir web sitesi siparişinde yaşanan sorunların çoğu, iş başlamadan önce sorulmayan sorulardan kaynaklanır. Aşağıdaki maddeleri teklif aşamasında yazılı hale getirirseniz hem fiyat sürprizlerini hem de teslim sonrası anlaşmazlıkları büyük ölçüde önlersiniz.

## 1. Alan adı ve hosting sizin adınıza olsun

Alan adı (domain) markanızın dijital adresidir. Kaydın uzmanın veya ajansın hesabında olması, ileride çalışmayı bıraktığınızda adresinizi kaybetme riskini doğurur. Hosting hesabı için de aynı kural geçerlidir.

## 2. Sitenin tek bir ana amacı olsun

Ziyaretçinin sitede yapmasını istediğiniz birincil eylemi belirleyin: aramak, form doldurmak, randevu almak, satın almak. Tasarım ve sayfa yapısı bu eyleme göre kurulur.

## 3. İçeriği kimin hazırlayacağını netleştirin

Metinler, fotoğraflar ve ürün bilgileri çoğu projede en çok gecikmeye neden olan kalemdir. İçeriği siz sağlayacaksanız teslim tarihinin içeriği gönderdiğiniz günden itibaren başlayacağını unutmayın.

## 4. Hazır tema mı özel tasarım mı?

Hazır tema uyarlaması daha hızlı ve ekonomiktir. Özel tasarım, markanızı rakiplerden ayırmak istediğinizde değer yaratır. Teklifte hangisinin yapılacağı açıkça yazmalıdır.

## 5. Mobil öncelikli test isteyin

Türkiye’de web trafiğinin büyük kısmı mobil cihazlardan gelir. Teslimattan önce sitenin farklı ekran boyutlarında test edildiğini görmek isteyin.

## 6. Temel SEO ayarları teslimatın parçası olsun

Her sayfanın benzersiz başlığı ve açıklaması, site haritası, temiz URL yapısı ve Google Search Console kurulumu ek ücret gerektirmeyecek temel işlerdir.

## 7. Hız ölçümü yapın

Görsellerin sıkıştırılması ve gereksiz eklentilerin kaldırılması sitenin açılış hızını belirgin şekilde etkiler. PageSpeed Insights sonuçlarını teslimatta birlikte inceleyin.

## 8. Yasal sayfaları unutmayın

KVKK aydınlatma metni, çerez politikası ve form toplayan sayfalarda açık rıza metni gereklidir. Metinlerin içeriği için bir hukuk danışmanından destek almanız önerilir.

## 9. Bakımı baştan konuşun

Güvenlik güncellemeleri, yedekleme ve küçük içerik değişiklikleri için aylık bakım seçeneği olup olmadığını sorun. Bakım yapılmayan siteler zamanla güvenlik açığı oluşturur.

> Eksen üzerinden verdiğiniz siparişlerde ödeme, siz teslimatı onaylayana kadar uzmana aktarılmaz. Revizyon hakkınızı kullanabilir, gerekirse iade talebi açabilirsiniz.`,
  },
  {
    slug: "mobil-uygulama-yaptirma-rehberi",
    title: "Mobil uygulama yaptırma rehberi: fikirden mağazaya",
    excerpt: "İlk sürümün kapsamını belirlemekten mağaza yayınına kadar, mobil uygulama projesini adım adım planlamak için pratik bir rehber.",
    category: "Rehber",
    tags: ["mobil uygulama", "flutter", "ios", "android"],
    relatedCategory: "mobil-uygulama",
    content: `Mobil uygulama projeleri, iyi planlanmadığında bütçesi en hızlı büyüyen dijital işlerdendir. Bu rehber, uzmanla görüşmeden önce hazırlamanız gerekenleri sırayla anlatıyor.

## Önce sorunu yazın, özellikleri değil

“Kullanıcı kaydı, bildirimler, ödeme…” diye başlayan bir liste yerine şu cümleyi tamamlayın: “Bu uygulama, ___ kişilerin ___ sorununu ___ yaparak çözer.” Bu cümle, ilk sürümde neyin şart neyin ertelenebilir olduğunu belirler.

## İlk sürümü küçük tutun

İlk sürüm (MVP), uygulamanın tek temel işini yapan en sade halidir. Kullanıcı geri bildirimi gelmeden eklenen özelliklerin önemli bir kısmı hiç kullanılmaz; bu da bütçenin boşa harcanması demektir.

## Teknoloji seçimi

- **Flutter / React Native:** Tek kod tabanıyla Android ve iOS. Çoğu iş uygulaması için yeterli.
- **Yerel (Swift, Kotlin):** Yoğun donanım kullanımı, gelişmiş animasyon veya platforma özgü özellikler için.
- **PWA:** Mağazaya çıkmadan, tarayıcı üzerinden uygulama deneyimi. Hızlı ve düşük maliyetli bir başlangıç olabilir.

## Arka uç ihtiyacını hesaba katın

Kullanıcı hesapları, veri saklama, bildirim gönderme ve yönetim paneli sunucu tarafında geliştirme gerektirir. Tekliflerde bu kalemin dahil olup olmadığını mutlaka sorun.

## Mağaza süreçleri

Apple, uygulamaları yayından önce inceler ve kurallarına uymayan uygulamaları reddedebilir. Google Play’de de politika ihlalleri hesabın askıya alınmasına neden olabilir. Daha önce mağazaya uygulama çıkarmış bir uzmanla çalışmak bu riskleri azaltır.

## Teslimat kontrol listesi

1. Kaynak kod sizin hesabınızdaki bir Git deposunda
2. Mağaza hesapları sizin adınıza
3. Sunucu ve veritabanı erişim bilgileri
4. Kurulum ve yayın dokümantasyonu
5. Yayın sonrası hata düzeltme süresi yazılı olarak

Projenizi Eksen’de oluşturup birden fazla uzmandan teklif alarak teknoloji önerilerini, süreleri ve fiyatları yan yana karşılaştırabilirsiniz.`,
  },
  {
    slug: "logo-tasarimi-brif-nasil-yazilir",
    title: "Logo tasarımı için brif nasıl yazılır?",
    excerpt: "Tasarımcıya doğru bilgiyi vermek revizyon sayısını yarıya indirir. Etkili bir logo brifinin bölümleri ve örnek sorular.",
    category: "Rehber",
    tags: ["logo", "marka", "tasarım"],
    relatedCategory: "grafik-tasarim",
    content: `Logo projelerinde en sık duyulan şikâyet “istediğim gibi olmadı” cümlesidir. Bunun nedeni çoğu zaman tasarımcının yeteneği değil, eksik bilgiyle işe başlamasıdır.

## Brifin bölümleri

### Marka özeti
İşletmeniz ne yapıyor, kime hizmet veriyor, sizi rakiplerinizden ayıran şey ne? Üç dört cümle yeterli.

### Hedef kitle
Yaş aralığı, şehir, gelir düzeyi kadar önemli olan bir soru: Müşteriniz sizi nerede görecek? Mağaza tabelası mı, Instagram profili mi, uygulama ikonu mu?

### Ton ve kişilik
“Modern ve sade” çok genel bir ifadedir. Bunun yerine markanızı üç sıfatla tanımlayın: örneğin “güvenilir, sıcak, yerel”.

### Referanslar
Beğendiğiniz 3–5 logo ve **neden** beğendiğinizi yazın. Beğenmediğiniz örnekler en az beğendikleriniz kadar faydalıdır.

### Kısıtlar
Kullanılmaması gereken renkler, semboller, rakiplerinizin kullandığı görsel öğeler.

## Teslim dosyaları

- Vektörel kaynak (AI, SVG veya PDF)
- PNG (şeffaf arka plan) farklı boyutlarda
- Açık ve koyu zemin versiyonları, tek renk sürüm
- Simge (ikon) versiyonu
- Kullanılan yazı tipinin adı ve lisans bilgisi

## Revizyon sürecini verimli yönetin

Geri bildirimlerinizi tek mesajda toplayın ve somut olun: “Daha dinamik olsun” yerine “harfler arası boşluk daha dar olsun, simge yazının soluna geçsin” gibi.`,
  },
  {
    slug: "freelancer-secerken-nelere-dikkat-edilmeli",
    title: "Freelancer seçerken nelere dikkat edilmeli?",
    excerpt: "Portföyü okumaktan ilk mesajın kalitesine kadar, doğru uzmanı seçmek için değerlendirme kriterleri.",
    category: "Rehber",
    tags: ["freelancer", "uzman seçimi"],
    content: `Doğru uzmanı seçmek, projenin sonucunu fiyattan daha çok etkiler. En ucuz teklif çoğu zaman en pahalı sonucu doğurur; en pahalısı da her zaman en iyisi değildir.

## Portföye bakarken

Portföydeki işlerin sizin projenize benzer olup olmadığına bakın. Bir e-ticaret projesi için güzel landing page örnekleri yeterli kanıt değildir. Mümkünse canlı bağlantıları açın ve mobilde deneyin.

## Değerlendirmeleri okurken

Eksen’de değerlendirmeyi yalnızca siparişi tamamlanan müşteriler yazabilir. Puan ortalamasının yanında yorumların içeriğine bakın: iletişim, süreye uyum ve kalite başlıklarındaki alt puanlar farklı hikâyeler anlatabilir.

## İlk mesajı test olarak kullanın

Projenizi anlattığınızda uzman size soru soruyor mu? İyi uzmanlar kapsamı netleştirmek için soru sorar; hemen fiyat verip “başlayalım” diyenler ileride sürpriz çıkarabilir.

## Teklifte aranacaklar

- İşin nasıl yapılacağına dair kısa bir plan
- Net teslim süresi ve ara teslimatlar
- Kapsam dışında kalanların açıkça belirtilmesi
- Revizyon sayısı

## Platform içinde kalın

İletişimi ve ödemeyi platform dışına taşımak, anlaşmazlık durumunda sizi korumasız bırakır. Eksen’de ödemeniz siz onaylayana kadar havuz hesabında bekler ve sorun yaşarsanız ekip arabuluculuk yapar.`,
  },
  {
    slug: "seo-hizmeti-alirken-sorulacak-sorular",
    title: "SEO hizmeti almadan önce sormanız gereken 7 soru",
    excerpt: "SEO ajansı veya uzmanıyla çalışmaya başlamadan önce yöntemlerini, raporlamasını ve beklentileri netleştirmek için sorular.",
    category: "Dijital pazarlama",
    tags: ["seo", "google", "dijital pazarlama"],
    relatedCategory: "dijital-pazarlama",
    content: `SEO, sonuçları geç görünen ve dışarıdan denetlemesi zor bir hizmet olduğu için doğru soruları baştan sormak önemlidir.

## 1. İlk 30 günde ne yapacaksınız?

İyi bir cevap; teknik denetim, öncelikli hataların listesi ve anahtar kelime araştırmasını içerir. “Bağlantı çalışmasına başlayacağız” diye başlayan bir cevap, temeli atlamak anlamına gelebilir.

## 2. Hangi metrikle başarıyı ölçeceğiz?

Sıralama tek başına yanıltıcıdır. Organik trafik, organik kaynaklı form/satış ve görünürlük birlikte izlenmelidir.

## 3. Search Console ve Analytics erişimine ihtiyacınız var mı?

Evet demeleri gerekir. Bu araçlara erişmeden yapılan SEO çalışması kör uçuştur. Erişimi kendi hesabınızdan kullanıcı ekleyerek verin, şifre paylaşmayın.

## 4. İçeriği kim üretecek?

İçerik üretimi hizmete dahil değilse, sizden ne sıklıkla ve hangi formatta içerik beklendiğini sorun.

## 5. Bağlantı çalışmasında hangi yöntemleri kullanıyorsunuz?

Toplu bağlantı paketleri ve özel blog ağları Google yönergelerine aykırıdır ve cezaya yol açabilir.

## 6. Raporu ne sıklıkla ve hangi formatta alacağım?

Aylık rapor; yapılan işleri, sonuçları ve bir sonraki ayın planını içermelidir.

## 7. Çalışmayı bıraktığımızda ne olur?

Yapılan tüm teknik değişiklikler ve üretilen içerikler sizde kalmalıdır.`,
  },
];

export const STATIC_PAGES = [
  {
    slug: "hakkimizda",
    title: "Hakkımızda",
    seoDescription: "Eksen, Türkiye’deki işletmeleri doğrulanmış dijital hizmet uzmanlarıyla buluşturan pazaryeridir.",
    content: `Eksen, Türkiye’deki işletmelerin dijital ihtiyaçlarını doğru uzmanla buluşturmak için kuruldu.

Bir web sitesi, bir logo ya da bir reklam kampanyası için uzman ararken en büyük sorun güvendir: Parayı gönderdikten sonra iş zamanında teslim edilecek mi? Beklenen kalitede mi olacak? Eksen bu soruları, ödemeyi siz teslimatı onaylayana kadar havuz hesabında tutarak ve yalnızca gerçek siparişlerden gelen değerlendirmeleri yayınlayarak yanıtlıyor.

## İlkelerimiz

- **Şeffaf fiyat:** Paket fiyatları, teslim süreleri ve revizyon hakları sipariş öncesinde açıkça görünür.
- **Gerçek değerlendirme:** Değerlendirme yalnızca tamamlanmış siparişlerden sonra yazılabilir.
- **Adil komisyon:** Uzmanlardan alınan komisyon oranı herkese açık olarak yayınlanır.`,
  },
  {
    slug: "kullanim-kosullari",
    title: "Kullanım koşulları",
    seoDescription: "Eksen platformunun kullanım koşulları.",
    content: `> **Taslak metin.** Bu metin ürün ekibi tarafından hazırlanmış bir çerçevedir; yayına alınmadan önce bir hukuk danışmanı tarafından incelenmeli ve şirket bilgileriyle tamamlanmalıdır.

## 1. Taraflar
Bu koşullar, Eksen platformunu (“Platform”) kullanan tüm üyeler ile platform işletmecisi arasındaki ilişkiyi düzenler.

## 2. Platformun rolü
Eksen, hizmet alan müşteriler ile hizmet veren uzmanları buluşturan bir aracı hizmet sağlayıcıdır. Hizmetin ifasından uzman sorumludur. Eksen, ödemeleri lisanslı ödeme kuruluşu aracılığıyla tahsil eder ve sipariş tamamlanana kadar havuz hesabında tutulmasını sağlar.

## 3. Üyelik
Üyeler, kayıt sırasında doğru bilgi vermekle ve hesap güvenliğini sağlamakla yükümlüdür. Uzmanlar, hizmet sunabilmek için kimlik ve vergi bilgilerini doğrulatmalıdır.

## 4. Komisyon
Platform, tamamlanan her siparişten yönetim panelinde ilan edilen oranda hizmet bedeli (komisyon) alır.

## 5. Platform dışı ödeme yasağı
Platform üzerinden tanışılan taraflar arasında ödemenin platform dışına taşınması yasaktır ve hesabın kapatılmasına yol açabilir.

## 6. Uyuşmazlıklar
Sipariş kaynaklı anlaşmazlıklarda taraflar öncelikle platformun uyuşmazlık sürecini kullanır.`,
  },
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik politikası",
    seoDescription: "Eksen’in kişisel verileri nasıl işlediğine ilişkin gizlilik politikası.",
    content: `> **Taslak metin.** Hukuk danışmanı onayı ve veri sorumlusu bilgileriyle tamamlanmalıdır.

## Topladığımız veriler
Hesap bilgileri (ad, e-posta), sipariş ve mesaj kayıtları, fatura bilgileri ve güvenlik amaçlı teknik kayıtlar (IP adresi, tarayıcı bilgisi).

## Kart bilgileri
Kart bilgileriniz Eksen sunucularına ulaşmaz ve saklanmaz. Ödeme, lisanslı ödeme kuruluşunun güvenli sayfasında alınır.

## Çerezler
Oturumunuzu açık tutmak için zorunlu bir oturum çerezi kullanırız. Reklam veya üçüncü taraf takip çerezi kullanmıyoruz.

## Haklarınız
6698 sayılı KVKK kapsamındaki haklarınızı kullanmak için destek adresimize yazabilirsiniz.`,
  },
  {
    slug: "kvkk-aydinlatma-metni",
    title: "KVKK aydınlatma metni",
    seoDescription: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
    content: `> **Taslak metin.** Veri sorumlusunun unvanı, adresi ve VERBİS kaydı eklenmeli; hukuk danışmanı tarafından onaylanmalıdır.

## Veri sorumlusu
[Şirket unvanı ve adresi]

## İşlenen kişisel veriler ve amaçlar
- Kimlik ve iletişim verileri: üyelik ve sipariş süreçlerinin yürütülmesi
- Finansal veriler: ödeme, iade ve hakediş süreçleri (kart verisi hariç)
- İşlem güvenliği verileri: dolandırıcılık önleme ve yasal yükümlülükler

## Aktarım
Veriler; ödeme kuruluşu, e-posta altyapı sağlayıcısı ve yasal olarak yetkili kurumlarla, yalnızca belirtilen amaçlarla paylaşılır.

## Haklarınız
KVKK’nın 11. maddesinde sayılan haklarınızı kullanmak için başvurabilirsiniz.`,
  },
  {
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli satış sözleşmesi",
    seoDescription: "Eksen üzerinden yapılan hizmet alımlarına ilişkin mesafeli satış sözleşmesi.",
    content: `> **Taslak metin.** 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği’ne göre hukuk danışmanı tarafından tamamlanmalıdır.

## Konu
Alıcının platform üzerinden sipariş verdiği dijital hizmetin satışı ve ifasına ilişkin tarafların hak ve yükümlülükleri.

## Cayma hakkı
Mesafeli Sözleşmeler Yönetmeliği uyarınca, tüketicinin onayı ile ifasına başlanan hizmetlerde cayma hakkı kullanılamayabilir. Alıcı, sipariş öncesinde bu konuda bilgilendirilir.

## Teslim
Hizmet, paket açıklamasında belirtilen sürede platform üzerinden dijital olarak teslim edilir.`,
  },
  {
    slug: "iade-ve-iptal",
    title: "İade ve iptal koşulları",
    seoDescription: "Eksen’de sipariş iptali, iade talebi ve uyuşmazlık süreçleri.",
    content: `## Ödemeniz nasıl korunur?
Sipariş ödemeniz, siz teslimatı onaylayana kadar uzmana aktarılmaz.

## İptal
Uzman işe başlamadan önce iptal edilen siparişlerde ödemenin tamamı iade edilir.

## İade talebi
Teslimat sipariş kapsamını karşılamıyorsa sipariş sayfasından iade talebi oluşturabilirsiniz. Eksen ekibi mesaj geçmişini ve teslim dosyalarını inceleyerek karar verir.

## Otomatik onay
Teslimattan sonra belirtilen süre içinde onay, revizyon veya iade talebinde bulunulmazsa sipariş otomatik olarak tamamlanır.`,
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez politikası",
    seoDescription: "Eksen’in kullandığı çerezler.",
    content: `Eksen yalnızca hizmetin çalışması için zorunlu olan çerezleri kullanır:

| Çerez | Amaç | Süre |
| --- | --- | --- |
| eksen_oturum | Oturumunuzu açık tutar | 30 gün |

Reklam, yeniden hedefleme veya üçüncü taraf analiz çerezi kullanılmaz. Site istatistikleri çerezsiz ve kişisel veri içermeyen sayaçlarla tutulur.`,
  },
];
