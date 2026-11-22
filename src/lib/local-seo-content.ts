import type { Sector } from "./tr-cities";

/**
 * İl sayfalarında hizmet × sektör tavsiyeleri.
 * Aynı hizmet, ilin ekonomik yapısına göre farklı ihtiyaçlar doğurur: turizm kentinde çok dilli rezervasyon,
 * sanayi kentinde ihracat kataloğu, tarım bölgesinde üreticiden doğrudan satış… Böylece her il sayfası
 * kopya değil, o ildeki işletmeye gerçekten yol gösteren bir içerik taşır.
 */
export type Advice = { title: string; body: string };

export const SERVICE_ADVICE: Record<string, Partial<Record<Sector, Advice>> & { genel: Advice }> = {
  "web-sitesi-yaptirma": {
    genel: { title: "Siteden beklenen işi netleştirin", body: "Sitenin tek bir ana amacı olsun: aranmak, form toplamak ya da randevu almak. Alan adının ve hosting hesabının işletme adına açıldığından, teslimde yönetim paneli erişiminin size verildiğinden emin olun." },
    turizm: { title: "Çok dilli yapı ve doğrudan rezervasyon", body: "Otel, pansiyon ve tur işletmelerinde sitenin en az İngilizce sürümü olmalı; ziyaretçinin dili Almanca veya Rusça ağırlıklıysa o diller de eklenmeli. Rezervasyon motoru ya da kanal yöneticisi entegrasyonu, aracı komisyonlarını azaltan en önemli kalemdir." },
    sanayi: { title: "İhracat için katalog ve teklif formu", body: "Üretici firmalar için site, yurt dışı alıcının ilk baktığı kartvizittir. Ürün kataloğu, teknik çizim ve sertifikaların indirilebildiği İngilizce sayfalar ile ürün bazlı teklif formu, fuar sonrası gelen talepleri doğrudan karşılar." },
    tarim: { title: "Üreticinin hikâyesini anlatan site", body: "Tarım ve gıda işletmelerinde ürünün nerede ve nasıl üretildiğini gösteren fotoğraflar, varsa coğrafi işaret ve analiz belgeleri güven oluşturur. Toptan alıcılar için fiyat listesi talep formu eklemek, telefon trafiğini azaltır." },
    ticaret: { title: "Yerel aramada görünür olun", body: "Rekabetin yoğun olduğu şehirlerde müşterinin çoğu “yakınımdaki” aramasıyla gelir. Sitenin Google İşletme Profili ile tutarlı adres-telefon bilgisi taşıması, hizmet verilen ilçelerin ayrı ayrı anlatılması ve hızlı açılan mobil tasarım fark yaratır." },
    universite: { title: "Genç kitleye uygun, mobil öncelikli tasarım", body: "Öğrenci nüfusu yüksek şehirlerde kafe, kurs ve hizmet işletmelerinin ziyaretçisi neredeyse tamamen telefondan gelir. Instagram ve WhatsApp ile bağlantılı, kampanyaların kolayca güncellenebildiği sade bir site yeterli ve ekonomiktir." },
    saglik: { title: "Güven veren ve randevu alan site", body: "Termal tesis ve sağlık işletmelerinde doktor ve tesis bilgileri, fiyatlandırma şeffaflığı ve çevrim içi randevu en çok aranan bölümlerdir. Sağlık verisi toplanıyorsa KVKK açık rıza metinleri baştan hazırlanmalıdır." },
  },
  "e-ticaret-sitesi": {
    genel: { title: "Altyapıyı ürün sayısına göre seçin", body: "Birkaç yüz ürüne kadar hazır e-ticaret altyapıları hızlı ve ekonomiktir; bayi fiyatı, karmaşık varyant veya ERP entegrasyonu gerekiyorsa özel geliştirme düşünülmelidir. Sanal POS başvurusu ve e-Arşiv entegrasyonu proje planına baştan alınmalıdır." },
    turizm: { title: "Hediyelik ve deneyim satışı", body: "Turizm bölgelerinde yöresel ürün ve deneyim (tur, atölye, transfer) satışı sezon dışında da gelir sağlar. Döviz ile fiyat gösterimi ve yurt dışı kargo seçenekleri yabancı ziyaretçinin dönüşten sonra da alışveriş yapmasını kolaylaştırır." },
    sanayi: { title: "B2B sipariş ve e-ihracat", body: "Üretici firmalar için bayi girişli fiyat listesi, minimum sipariş miktarı ve proforma fatura üretimi perakende sepetinden daha önemlidir. E-ihracat hedefleniyorsa Amazon, Etsy gibi pazaryerleriyle stok senkronizasyonu planlanmalıdır." },
    tarim: { title: "Üreticiden tüketiciye doğrudan satış", body: "Zeytinyağı, bal, kuru meyve gibi ürünlerde soğuk zincir gerektirmeyen paketleme ve kargo anlaşması, e-ticaretin kârlılığını belirler. Hasat dönemine göre ön sipariş ve abonelik (aylık kutu) modelleri nakit akışını dengeler." },
    ticaret: { title: "Mağaza ile online stoğun birlikte yönetimi", body: "Fiziksel mağazası olan işletmelerde stok tek yerden yönetilmeli; “mağazadan teslim al” seçeneği aynı şehirdeki müşteriyi hızla siparişe çevirir. Pazaryeri entegrasyonları için ürün verisinin baştan düzenli hazırlanması işi hızlandırır." },
    universite: { title: "Uygun fiyatlı, hızlı mağaza", body: "Genç kitleye yönelik markalarda sosyal medya trafiğini karşılayan hızlı ve sade bir mağaza, kapıda ödeme ve taksit seçenekleri dönüşümü artırır. Kampanya kodları ve sınırlı süreli indirimler kolay yönetilebilmelidir." },
    saglik: { title: "Termal ve kozmetik ürünlerde mevzuat", body: "Kozmetik ve takviye ürünlerinde etiket bilgileri, ruhsat numaraları ve kullanım uyarıları sitede eksiksiz yer almalıdır. Sağlık iddiası içeren ifadeler reklam mevzuatı açısından dikkatle yazılmalıdır." },
  },
  "mobil-uygulama-gelistirme": {
    genel: { title: "İlk sürümü küçük tutun", body: "Uygulamanın tek bir temel işi kusursuz yapması, her şeyi yarım yapmasından iyidir. Mağaza hesaplarının işletme adına açılması, kaynak kodun size ait bir depoda teslim edilmesi ve arka uç (sunucu) maliyetinin teklife dahil edilmesi baştan netleşmelidir." },
    turizm: { title: "Misafir deneyimi uygulaması", body: "Oteller ve tur firmaları için oda servisi, tesis haritası, aktivite rezervasyonu ve çok dilli bildirimler sunan uygulamalar misafir memnuniyetini artırır. Çoğu durumda PWA (web tabanlı uygulama) mağazaya çıkmadan aynı işi görür." },
    sanayi: { title: "Saha ve üretim takibi", body: "Üretim, bakım ve saha ekipleri için iş emri, barkod okuma ve fotoğraflı raporlama yapan uygulamalar kâğıt formların yerini alır. Mevcut ERP sistemiyle entegrasyonun API üzerinden mümkün olup olmadığı teklif aşamasında incelenmelidir." },
    tarim: { title: "Üretici ve kooperatif uygulamaları", body: "Kooperatifler ve toptancılar için sipariş, teslimat ve ödeme takibi yapan basit uygulamalar; kırsalda zayıf bağlantıya rağmen çalışabilmesi için çevrim dışı kayıt özelliğiyle tasarlanmalıdır." },
    ticaret: { title: "Sadakat ve sipariş uygulaması", body: "Restoran zincirleri, kafeler ve perakendeciler için puan biriktirme, kampanya bildirimi ve sipariş özelliği sunan uygulamalar tekrar eden müşteriyi artırır. Bildirim izni vermeyen kullanıcı için e-posta ve SMS alternatifleri düşünülmelidir." },
    universite: { title: "Kampüs ve topluluk uygulamaları", body: "Öğrenci yoğunluklu şehirlerde etkinlik, kulüp ve kampüs hizmeti uygulamaları hızlı yayılır. Flutter veya React Native ile tek kod tabanından iki platforma çıkmak bütçeyi korur." },
    saglik: { title: "Randevu ve takip uygulaması", body: "Klinik ve termal tesisler için randevu, hatırlatma ve tedavi takibi yapan uygulamalarda sağlık verilerinin şifreli saklanması ve KVKK uyumu zorunludur; veri saklama yeri teklif aşamasında sorulmalıdır." },
  },
  "logo-tasarimi": {
    genel: { title: "Brifte rakipleri ve kullanım yerlerini yazın", body: "Logonun tabela, ambalaj, sosyal medya profili ve uygulama ikonu gibi hangi yerlerde kullanılacağını belirtin; beğendiğiniz ve beğenmediğiniz örnekleri nedenleriyle paylaşın. Teslimde vektörel kaynak dosyayı mutlaka isteyin." },
    turizm: { title: "Yerin ruhunu taşıyan kimlik", body: "Butik otel, restoran ve tur markalarında logonun bulunduğu yeri ve deneyimi çağrıştırması akılda kalıcılığı artırır. Logonun tabela, menü, havlu ve bardak gibi farklı yüzeylerde tek renk de okunabilmesi önemlidir." },
    sanayi: { title: "Uluslararası pazarda okunabilir marka", body: "İhracat yapan firmalarda marka adının yabancı dillerde nasıl okunduğu ve çağrıştırdığı anlam kontrol edilmelidir. Teknik dokümanlar, ürün etiketleri ve fuar standı için sade, tek renkte de çalışan bir işaret tercih edilmelidir." },
    tarim: { title: "Ambalajda öne çıkan logo", body: "Gıda ürünlerinde logo rafta küçük boyutta görünür; ince detaylardan kaçınan, etiket ve kutu üzerinde net basılan bir tasarım seçin. Coğrafi işaret ve üretici bilgisinin ambalajda nereye yerleşeceği de birlikte planlanmalıdır." },
    ticaret: { title: "Rakiplerden ayrışan bir işaret", body: "Aynı caddede onlarca benzer işletme varsa renk ve biçimle ayrışmak gerekir. Tabela, araç giydirme ve sosyal medya profil fotoğrafında aynı etkiyi bırakan, uzaktan tanınan bir işaret yatırımın karşılığını verir." },
    universite: { title: "Sosyal medyada çalışan dinamik kimlik", body: "Genç kitleye hitap eden markalarda logonun hareketli (animasyonlu) versiyonu ve sosyal medya şablonlarıyla birlikte tasarlanması, içerik üretimini kolaylaştırır." },
    saglik: { title: "Güven ve sakinlik hissi", body: "Sağlık ve termal işletmelerinde sade, okunaklı ve abartısız bir kimlik güven verir. Tıbbi sembollerin kullanımında meslek kuruluşlarının kurallarına dikkat edilmelidir." },
  },
  "qr-menu": {
    genel: { title: "Hızlı açılan ve kolay güncellenen menü", body: "QR menü zayıf mobil bağlantıda bile birkaç saniyede açılmalı; fiyat ve ürün değişikliğini işletmenin kendisinin yapabileceği bir yönetim paneli olmalıdır. Fiyat tarifesine ilişkin güncel mevzuatı il ticaret müdürlüğünden teyit edin." },
    turizm: { title: "Çok dilli menü ve alerjen bilgisi", body: "Yabancı ziyaretçinin yoğun olduğu yerlerde menünün İngilizce yanında Almanca, Rusça veya Arapça sürümleri sipariş süresini kısaltır. Alerjen ve içerik bilgisi, garsona sorulan soruları azaltır." },
    sanayi: { title: "Fabrika yemekhanesi ve kantin", body: "Organize sanayi bölgelerindeki yemekhane ve kantinlerde günlük menünün QR ile duyurulması, kalori ve içerik bilgisinin paylaşılması işçi memnuniyetini artırır." },
    tarim: { title: "Yöresel ürünleri öne çıkaran menü", body: "Yerel üreticiden alınan ürünleri menüde fotoğraf ve kısa hikâyeyle göstermek, yöresel lezzet arayan misafirin dikkatini çeker ve ürünlerin satışını artırır." },
    ticaret: { title: "Masadan sipariş ve hızlı servis", body: "Yoğun saatlerde masadan QR ile sipariş ve ödeme, servis hızını ve masa devrini artırır. Mutfak ekranı veya yazıcı entegrasyonu teklif aşamasında konuşulmalıdır." },
    universite: { title: "Öğrenci menüsü ve kampanyalar", body: "Öğrenci yoğun bölgelerde günlük kampanya ve öğrenci menüsünün QR menüde öne çıkarılması, sosyal medyadaki duyurularla birleştiğinde etkili sonuç verir." },
    saglik: { title: "Diyet ve içerik bilgisi", body: "Termal tesis ve sağlık otellerinde diyet seçenekleri, kalori ve alerjen bilgisi içeren menüler misafir beklentisini karşılar." },
  },
  "seo-hizmeti": {
    genel: { title: "Gerçekçi hedef ve şeffaf rapor", body: "Teknik düzeltmeler birkaç haftada etkisini gösterebilir; rekabetçi aramalarda kalıcı artış çoğunlukla 3–6 ay sürer. Search Console erişimi istemeyen veya birinci sıra garantisi veren hizmetlere temkinli yaklaşın." },
    turizm: { title: "Yabancı dilde ve sezon öncesi SEO", body: "Turizmde aramalar sezondan aylar önce başlar; yabancı dildeki sayfaların sezon öncesinde hazır ve indekslenmiş olması gerekir. Rezervasyon sitelerine bağımlılığı azaltmak için otel adıyla yapılan aramaları sahiplenmek ilk adımdır." },
    sanayi: { title: "Ürün ve teknik terimlerle aranmak", body: "Sanayi alıcıları ürünü teknik adıyla, standardıyla veya malzemesiyle arar. Her ürün grubu için ayrı, teknik veri tablosu içeren sayfalar hem yurt içi hem yurt dışı aramalarda kalıcı trafik getirir." },
    tarim: { title: "Ürün ve yöre adıyla aramalar", body: "“Ayvalık zeytinyağı”, “Malatya kayısısı” gibi yöre ve ürün adının birlikte arandığı sorgular satın almaya en yakın trafiktir. Ürün sayfalarında yöre, hasat ve üretim bilgisinin açıkça yazılması bu aramalarda görünürlüğü artırır." },
    ticaret: { title: "Yerel SEO ve Google İşletme Profili", body: "Şehir içinde hizmet veren işletmelerde Google Haritalar sonuçları çoğu zaman organik sonuçlardan önce gelir. İşletme profilinin eksiksiz doldurulması, düzenli yorum alınması ve sitede ilçe bazlı hizmet sayfaları rekabette öne geçirir." },
    universite: { title: "İçerikle büyüyen görünürlük", body: "Kurslar, yurtlar ve öğrenciye hizmet veren işletmeler için “nasıl”, “nerede”, “ne kadar” sorularını yanıtlayan rehber içerikler, reklam bütçesi olmadan sürekli trafik getirir." },
    saglik: { title: "Güvenilirlik sinyalleri", body: "Sağlık konularında Google, uzmanlık ve güvenilirliği daha sıkı değerlendirir. İçeriği yazan veya onaylayan uzmanın bilgisi, belgeler ve gerçek yorumlar sıralamada belirleyicidir." },
  },
  "sosyal-medya-yonetimi": {
    genel: { title: "Paylaşım sayısı değil, hedef konuşulsun", body: "Aylık paketin kaç gönderi, kaç Reels ve hikâye içerdiği yazılı olmalı; içerik takvimi önceden onayınıza sunulmalı. Hesap şifresi yerine Meta Business Suite gibi araçlarla ekip yetkisi verin." },
    turizm: { title: "Görsel ağırlıklı, sezona göre plan", body: "Turizmde Instagram ve TikTok vitrindir; kaliteli fotoğraf ve kısa videolar ile misafir paylaşımlarının yeniden kullanımı en etkili içeriktir. Sezon öncesi erken rezervasyon kampanyaları içerik takviminde baştan yer almalıdır." },
    sanayi: { title: "LinkedIn ve fuar odaklı iletişim", body: "Sanayi firmalarında karar vericiler LinkedIn’dedir; üretim süreci, sertifikalar, fuar katılımları ve referans projeler düzenli paylaşılmalıdır. İngilizce paylaşımlar yurt dışı alıcıya ulaşmayı kolaylaştırır." },
    tarim: { title: "Üretimin perde arkası", body: "Hasat, üretim ve paketleme süreçlerini gösteren samimi içerikler tüketicide güven oluşturur. Doğrudan satış yapılıyorsa WhatsApp ve Instagram mağaza özellikleri sipariş kanalına dönüştürülebilir." },
    ticaret: { title: "Yerel kampanya ve hedefli reklam", body: "Şehir içinde hizmet veren işletmelerde paylaşımları belirli ilçelere hedeflenen düşük bütçeli reklamlarla desteklemek, takipçi sayısından daha değerli olan mağaza ziyaretini getirir." },
    universite: { title: "Trend ve topluluk", body: "Genç kitlede trend formatları hızlı takip eden, kullanıcı içeriğini öne çıkaran ve etkileşime hızlı yanıt veren hesaplar büyür. Kampüs etkinlikleri ve öğrenci indirimleri iyi birer içerik fırsatıdır." },
    saglik: { title: "Bilgilendirici ve mevzuata uygun içerik", body: "Sağlık işletmelerinde tanıtım içerikleri reklam yasaklarına takılmamalı; bilgilendirici, sade ve uzman onaylı paylaşımlar hem güven hem de sürdürülebilir etkileşim sağlar." },
  },
  "yazilim-gelistirme": {
    genel: { title: "Önce keşif, sonra geliştirme", body: "Büyük yazılım projelerini analiz, ilk sürüm ve geliştirme aşamalarına bölün; keşif aşamasının çıktısı ekran listesi ve veri modelini içeren yazılı bir kapsam olmalıdır. Kaynak kodun ve sunucu hesabının mülkiyetini sözleşmeye yazın." },
    turizm: { title: "Rezervasyon ve kanal entegrasyonları", body: "Turizm işletmeleri için ön büro, kanal yöneticisi, ödeme ve muhasebe sistemlerini birbirine bağlayan entegrasyonlar çift veri girişini ve fazla satışı (overbooking) önler." },
    sanayi: { title: "Üretim, stok ve ERP entegrasyonu", body: "Üretim planlama, stok, kalite kontrol ve sevkiyat süreçlerini mevcut ERP ile konuşan özel yazılımlar, Excel ile yürüyen takibi ortadan kaldırır. Makine verisi toplanacaksa saha cihazlarının protokolleri baştan belirlenmelidir." },
    tarim: { title: "İzlenebilirlik ve kooperatif yönetimi", body: "Tarladan rafa izlenebilirlik, üretici kayıtları ve hakediş hesaplamaları yapan yazılımlar kooperatif ve toptancıların en büyük ihtiyacıdır. Kırsal kullanım için mobil uyumlu ve çevrim dışı çalışabilen arayüzler seçilmelidir." },
    ticaret: { title: "CRM ve iş süreçleri otomasyonu", body: "Müşteri, teklif, sipariş ve tahsilat süreçlerini tek ekranda toplayan CRM ve otomasyonlar ekip büyüdükçe zaman kazandırır. Hazır bir SaaS ürünü yeterli olabilir; özel yazılım ancak süreç gerçekten farklıysa düşünülmelidir." },
    universite: { title: "Girişim ve MVP geliştirme", body: "Teknoparklar ve üniversite çevresindeki girişimler için yatırımcıya gösterilebilir bir MVP, kapsamı dar tutulup birkaç haftada çıkarılabilir. Ölçeklenecek bir mimari yerine hızlı öğrenmeye odaklanın." },
    saglik: { title: "Randevu, hasta ve KVKK", body: "Sağlık yazılımlarında hasta verisinin şifrelenmesi, erişim kayıtlarının tutulması ve KVKK’ya uygun saklama süreleri tasarımın parçası olmalıdır. e-Nabız gibi kamu sistemleriyle entegrasyon gerekiyorsa yetki süreçleri baştan planlanmalıdır." },
  },
};

/** Bir il için gösterilecek tavsiyeler: genel tavsiye + ilin sektörlerine özgü olanlar (en fazla 3). */
export function adviceFor(serviceSlug: string, sectors: Sector[]): (Advice & { sector?: Sector })[] {
  const s = SERVICE_ADVICE[serviceSlug];
  if (!s) return [];
  const specific = sectors.map((sec) => (s[sec] ? { ...s[sec]!, sector: sec } : null)).filter(Boolean) as (Advice & { sector: Sector })[];
  return [...specific.slice(0, 3), s.genel];
}
