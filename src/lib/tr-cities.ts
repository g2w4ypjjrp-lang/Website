/**
 * Türkiye'nin 81 ili: plaka, coğrafi bölge, büyükşehir durumu ve ekonomik profil.
 * Profil ve sektör etiketleri il sayfalarında hizmete özel tavsiye üretmek için kullanılır;
 * uydurma sayısal veri içermez (nüfus, işletme sayısı gibi değerler bilinçli olarak yazılmadı).
 */

export type Sector = "turizm" | "sanayi" | "tarim" | "ticaret" | "universite" | "saglik";
export type Region = "marmara" | "ege" | "akdeniz" | "ic-anadolu" | "karadeniz" | "dogu-anadolu" | "guneydogu-anadolu";

export type City = {
  slug: string;
  name: string;
  plate: string;
  region: Region;
  /** 30 büyükşehir belediyesinden biri mi */
  metro: boolean;
  sectors: Sector[];
  /** İlin ekonomik ve kültürel öne çıkanları (tek cümle) */
  profile: string;
};

export const REGIONS: Record<Region, string> = {
  marmara: "Marmara",
  ege: "Ege",
  akdeniz: "Akdeniz",
  "ic-anadolu": "İç Anadolu",
  karadeniz: "Karadeniz",
  "dogu-anadolu": "Doğu Anadolu",
  "guneydogu-anadolu": "Güneydoğu Anadolu",
};

export const SECTORS: Record<Sector, string> = {
  turizm: "Turizm",
  sanayi: "Sanayi ve ihracat",
  tarim: "Tarım ve gıda",
  ticaret: "Ticaret ve hizmet",
  universite: "Üniversite ve gençlik",
  saglik: "Termal ve sağlık turizmi",
};

const c = (slug: string, name: string, plate: string, region: Region, metro: boolean, sectors: Sector[], profile: string): City => ({ slug, name, plate, region, metro, sectors, profile });

export const CITIES: City[] = [
  c("adana", "Adana", "01", "akdeniz", true, ["sanayi", "tarim", "ticaret"], "Çukurova’nın tarım ve sanayi merkezi; tekstil, gıda ve ticaretle bölgenin en büyük ekonomilerinden biri."),
  c("adiyaman", "Adıyaman", "02", "guneydogu-anadolu", false, ["tarim", "turizm"], "Nemrut Dağı ile kültür turizminde, tütün ve tarım ürünleriyle yerel ekonomide öne çıkan bir il."),
  c("afyonkarahisar", "Afyonkarahisar", "03", "ege", false, ["saglik", "sanayi"], "Termal turizm, mermer ve kaymak-sucuk gibi yöresel ürünleriyle tanınan bir kavşak şehri."),
  c("agri", "Ağrı", "04", "dogu-anadolu", false, ["tarim", "ticaret"], "Hayvancılık ve Gürbulak sınır kapısı üzerinden yürüyen ticaretle bilinen, Ağrı Dağı’na ev sahipliği yapan il."),
  c("amasya", "Amasya", "05", "karadeniz", false, ["tarim", "turizm"], "Elması ve Yeşilırmak kıyısındaki tarihi dokusuyla tarım ve kültür turizminin birlikte yürüdüğü bir şehir."),
  c("ankara", "Ankara", "06", "ic-anadolu", true, ["ticaret", "universite", "sanayi"], "Başkent; kamu kurumları, savunma sanayi, teknoloji geliştirme bölgeleri ve üniversiteleriyle hizmet ekonomisinin merkezi."),
  c("antalya", "Antalya", "07", "akdeniz", true, ["turizm", "tarim"], "Türkiye’nin turizm başkenti; otel, restoran ve seyahat işletmelerinin yanında örtü altı tarımda da öncü."),
  c("artvin", "Artvin", "08", "karadeniz", false, ["turizm", "ticaret"], "Doğa ve yayla turizmiyle, Sarp sınır kapısı üzerinden yürüyen ticaretle öne çıkan bir sınır ili."),
  c("aydin", "Aydın", "09", "ege", true, ["tarim", "turizm"], "İncir, zeytin ve pamuk üretimiyle Kuşadası ve Didim’in turizm hareketliliği bir arada."),
  c("balikesir", "Balıkesir", "10", "marmara", true, ["tarim", "turizm"], "Zeytin, zeytinyağı ve süt ürünleriyle Ayvalık-Edremit kıyılarındaki turizm sezonunun buluştuğu il."),
  c("bilecik", "Bilecik", "11", "marmara", false, ["sanayi"], "Seramik, mermer ve Bozüyük’teki sanayi tesisleriyle üretim ağırlıklı bir ekonomi."),
  c("bingol", "Bingöl", "12", "dogu-anadolu", false, ["tarim"], "Hayvancılık ve yaylalarında üretilen balıyla bilinen bir Doğu Anadolu ili."),
  c("bitlis", "Bitlis", "13", "dogu-anadolu", false, ["tarim", "turizm"], "Tütün ve tarımla, Ahlat ve Nemrut Krater Gölü gibi doğal ve tarihi değerlerle tanınan il."),
  c("bolu", "Bolu", "14", "karadeniz", false, ["turizm", "tarim"], "Abant, Gölcük ve Kartalkaya ile doğa ve kış turizminde, tavukçulukta güçlü bir şehir."),
  c("burdur", "Burdur", "15", "akdeniz", false, ["tarim", "sanayi"], "Süt ürünleri, mermer ve Salda Gölü’nün getirdiği turizm ilgisiyle gelişen bir il."),
  c("bursa", "Bursa", "16", "marmara", true, ["sanayi", "ticaret", "turizm"], "Otomotiv ve tekstil sanayisinin başkentlerinden; Uludağ ve termal kaynaklarıyla turizmde de güçlü."),
  c("canakkale", "Çanakkale", "17", "marmara", false, ["turizm", "universite", "tarim"], "Gelibolu ve Troya ile tarih turizminin, üniversite öğrencilerinin ve tarımsal üretimin şehri."),
  c("cankiri", "Çankırı", "18", "ic-anadolu", false, ["tarim"], "Tuz mağarası ve tarımsal üretimiyle bilinen, Ankara’ya yakın bir İç Anadolu ili."),
  c("corum", "Çorum", "19", "karadeniz", false, ["sanayi", "tarim"], "Leblebisi, un ve tuğla sanayisi ile Hattuşa’nın bulunduğu Hitit mirasıyla tanınan şehir."),
  c("denizli", "Denizli", "20", "ege", true, ["sanayi", "turizm"], "Tekstil ve havlu ihracatının merkezi; Pamukkale ile turizmde de dünyaca bilinen bir sanayi kenti."),
  c("diyarbakir", "Diyarbakır", "21", "guneydogu-anadolu", true, ["ticaret", "tarim", "turizm"], "Bölgenin ticaret merkezi; tarihi surları ve tarımsal üretimiyle büyüyen bir şehir."),
  c("edirne", "Edirne", "22", "marmara", false, ["ticaret", "universite", "turizm"], "Kapıkule üzerinden Avrupa ticaretinin kapısı; tarihi camileri ve üniversitesiyle canlı bir sınır şehri."),
  c("elazig", "Elazığ", "23", "dogu-anadolu", false, ["universite", "tarim"], "Fırat Üniversitesi, Harput’un tarihi dokusu ve Hazar Gölü ile bilinen bir bölge merkezi."),
  c("erzincan", "Erzincan", "24", "dogu-anadolu", false, ["tarim", "turizm"], "Tulum peyniri, tarımsal üretim ve Ergan Dağı kayak merkezi ile tanınan il."),
  c("erzurum", "Erzurum", "25", "dogu-anadolu", true, ["universite", "turizm"], "Atatürk Üniversitesi’nin öğrenci nüfusu ve Palandöken kış turizmiyle Doğu’nun büyük şehirlerinden."),
  c("eskisehir", "Eskişehir", "26", "ic-anadolu", true, ["universite", "sanayi"], "Üniversite şehri; havacılık ve raylı sistem sanayisiyle genç ve teknolojiye yatkın bir nüfusa sahip."),
  c("gaziantep", "Gaziantep", "27", "guneydogu-anadolu", true, ["sanayi", "ticaret", "turizm"], "Gıda, tekstil ve halı ihracatında öncü bir sanayi kenti; gastronomisiyle de dünyaca bilinir."),
  c("giresun", "Giresun", "28", "karadeniz", false, ["tarim"], "Fındık üretimi ve ticaretinin önemli merkezlerinden bir Karadeniz şehri."),
  c("gumushane", "Gümüşhane", "29", "karadeniz", false, ["tarim", "turizm"], "Pestil ve köme gibi yöresel ürünleri, yaylaları ve doğa turizmiyle tanınan il."),
  c("hakkari", "Hakkari", "30", "dogu-anadolu", false, ["ticaret", "turizm"], "Sınır ticareti ve dağ-doğa turizmi potansiyeliyle öne çıkan bir il."),
  c("hatay", "Hatay", "31", "akdeniz", true, ["ticaret", "turizm", "sanayi"], "İskenderun Limanı ile lojistikte, UNESCO gastronomi şehri olarak turizmde ve demir-çelikte güçlü."),
  c("isparta", "Isparta", "32", "akdeniz", false, ["tarim", "universite"], "Gül ve gül yağı üretimi, halıcılığı ve üniversite öğrencileriyle tanınan şehir."),
  c("mersin", "Mersin", "33", "akdeniz", true, ["ticaret", "tarim", "turizm"], "Limanı ve serbest bölgesiyle lojistik merkezi; narenciye üretimi ve kıyı turizmiyle de öne çıkar."),
  c("istanbul", "İstanbul", "34", "marmara", true, ["ticaret", "sanayi", "turizm"], "Türkiye’nin finans, ticaret, teknoloji ve medya merkezi; rekabetin en yoğun olduğu pazar."),
  c("izmir", "İzmir", "35", "ege", true, ["ticaret", "sanayi", "turizm"], "Limanı ve ihracatçı sanayisiyle Ege’nin ticaret merkezi; turizm ve fuarcılıkta da güçlü."),
  c("kars", "Kars", "36", "dogu-anadolu", false, ["tarim", "turizm"], "Kaşarı ve hayvancılığıyla, Ani Ören Yeri ve Sarıkamış kış turizmiyle bilinen il."),
  c("kastamonu", "Kastamonu", "37", "karadeniz", false, ["turizm", "tarim"], "Orman ürünleri, Taşköprü sarımsağı ve doğa turizmiyle tanınan bir Batı Karadeniz şehri."),
  c("kayseri", "Kayseri", "38", "ic-anadolu", true, ["sanayi", "ticaret"], "Mobilya ve tekstil sanayisi, güçlü organize sanayi bölgesi ve ticaret geleneğiyle bilinir."),
  c("kirklareli", "Kırklareli", "39", "marmara", false, ["tarim", "sanayi"], "Trakya’nın tarımsal üretimi, Lüleburgaz’daki sanayi ve Kıyıköy kıyılarıyla tanınan il."),
  c("kirsehir", "Kırşehir", "40", "ic-anadolu", false, ["tarim"], "Tarımsal üretimi ve Ahilik kültürünün doğduğu şehir olarak bilinen bir İç Anadolu ili."),
  c("kocaeli", "Kocaeli", "41", "marmara", true, ["sanayi"], "Türkiye’nin sanayi başkenti; otomotiv, kimya ve limanlarıyla üretim ve ihracatın merkezi."),
  c("konya", "Konya", "42", "ic-anadolu", true, ["sanayi", "tarim"], "Tarım makineleri ve otomotiv yan sanayisiyle güçlü, tahıl üretiminde öncü; Mevlana ile turizmde de bilinir."),
  c("kutahya", "Kütahya", "43", "ege", false, ["sanayi", "saglik"], "Çini ve porselen üretimiyle tanınan, termal kaynaklarıyla sağlık turizmine de açık bir şehir."),
  c("malatya", "Malatya", "44", "dogu-anadolu", true, ["tarim", "universite"], "Dünya kayısı üretiminin merkezi; İnönü Üniversitesi ile bölgenin eğitim kentlerinden."),
  c("manisa", "Manisa", "45", "ege", true, ["sanayi", "tarim"], "Beyaz eşya ve elektronik üretimi yapan organize sanayisi ve sultaniye üzümüyle bilinir."),
  c("kahramanmaras", "Kahramanmaraş", "46", "akdeniz", true, ["sanayi", "tarim"], "İplik ve tekstil sanayisi, dondurması ve mutfak eşyası üretimiyle tanınan bir sanayi şehri."),
  c("mardin", "Mardin", "47", "guneydogu-anadolu", true, ["turizm", "ticaret"], "Taş evleri ve tarihi dokusuyla kültür turizminin, sınır ticaretinin öne çıktığı şehir."),
  c("mugla", "Muğla", "48", "ege", true, ["turizm"], "Bodrum, Marmaris ve Fethiye ile yabancı ziyaretçinin en yoğun olduğu turizm bölgelerinden."),
  c("mus", "Muş", "49", "dogu-anadolu", false, ["tarim"], "Muş Ovası’ndaki tarım ve hayvancılıkla geçimin sağlandığı bir Doğu Anadolu ili."),
  c("nevsehir", "Nevşehir", "50", "ic-anadolu", false, ["turizm"], "Kapadokya ile dünyanın en çok tanınan turizm bölgelerinden; balon turları, butik oteller ve şaraphaneler."),
  c("nigde", "Niğde", "51", "ic-anadolu", false, ["tarim"], "Patates ve elma üretimiyle tanınan, Aladağlar ile doğa sporlarına ev sahipliği yapan il."),
  c("ordu", "Ordu", "52", "karadeniz", true, ["tarim", "turizm"], "Fındık üretimi ve ticaretinin merkezi; yayla turizmiyle de gelişen bir Karadeniz şehri."),
  c("rize", "Rize", "53", "karadeniz", false, ["tarim", "turizm"], "Çay üretiminin merkezi; Ayder ve yaylalarıyla doğa turizminin gözdesi."),
  c("sakarya", "Sakarya", "54", "marmara", true, ["sanayi", "universite"], "Otomotiv ve yan sanayisiyle Marmara’nın üretim üslerinden; Sakarya Üniversitesi ile öğrenci şehri."),
  c("samsun", "Samsun", "55", "karadeniz", true, ["ticaret", "sanayi", "universite"], "Limanıyla Karadeniz’in ticaret merkezi; sanayi ve Ondokuz Mayıs Üniversitesi ile bölgenin en büyük şehri."),
  c("siirt", "Siirt", "56", "guneydogu-anadolu", false, ["tarim"], "Siirt fıstığı ve tarımsal üretimiyle tanınan bir Güneydoğu ili."),
  c("sinop", "Sinop", "57", "karadeniz", false, ["turizm"], "Kıyı turizmi ve balıkçılıkla bilinen, Türkiye’nin en kuzey noktasındaki şehir."),
  c("sivas", "Sivas", "58", "ic-anadolu", false, ["tarim", "sanayi"], "Demir yolu sanayisi, tarım ve hayvancılık; Divriği Ulu Camii ile kültür turizmi."),
  c("tekirdag", "Tekirdağ", "59", "marmara", true, ["sanayi"], "Çorlu ve Çerkezköy sanayi bölgeleri, limanları ve İstanbul’a yakınlığıyla üretim merkezi."),
  c("tokat", "Tokat", "60", "karadeniz", false, ["tarim"], "Domates, üzüm ve yaprak gibi tarım ürünleriyle bilinen verimli bir il."),
  c("trabzon", "Trabzon", "61", "karadeniz", true, ["ticaret", "turizm", "universite"], "Limanı ve ticaretiyle Doğu Karadeniz’in merkezi; Uzungöl ile turizmde, KTÜ ile eğitimde öne çıkar."),
  c("tunceli", "Tunceli", "62", "dogu-anadolu", false, ["turizm"], "Munzur Vadisi ile doğa turizmi ve organik tarım potansiyeli yüksek bir il."),
  c("sanliurfa", "Şanlıurfa", "63", "guneydogu-anadolu", true, ["tarim", "turizm"], "GAP ile genişleyen tarımsal üretim, pamuk ve isot; Göbeklitepe ile dünya çapında turizm ilgisi."),
  c("usak", "Uşak", "64", "ege", false, ["sanayi"], "Deri, battaniye ve tekstil üretimiyle tanınan bir sanayi şehri."),
  c("van", "Van", "65", "dogu-anadolu", true, ["turizm", "ticaret"], "Van Gölü, kahvaltı kültürü ve sınır ticaretiyle Doğu’nun büyük şehirlerinden."),
  c("yozgat", "Yozgat", "66", "ic-anadolu", false, ["tarim"], "Tarım ve hayvancılığın öne çıktığı bir İç Anadolu ili."),
  c("zonguldak", "Zonguldak", "67", "karadeniz", false, ["sanayi"], "Taş kömürü madenciliği ve Ereğli’deki demir-çelik üretimiyle bir sanayi şehri."),
  c("aksaray", "Aksaray", "68", "ic-anadolu", false, ["tarim", "sanayi"], "Tarımsal üretim, Ihlara Vadisi ve ağır vasıta üretimiyle bilinen bir il."),
  c("bayburt", "Bayburt", "69", "karadeniz", false, ["tarim"], "Tarım ve hayvancılığın öne çıktığı, köklü geçmişe sahip küçük bir Karadeniz ili."),
  c("karaman", "Karaman", "70", "ic-anadolu", false, ["sanayi", "tarim"], "Bisküvi ve gıda sanayisiyle tanınan, tarımsal üretimi güçlü bir şehir."),
  c("kirikkale", "Kırıkkale", "71", "ic-anadolu", false, ["sanayi"], "Makine ve Kimya Endüstrisi ile savunma sanayisi ve rafinerisiyle bilinen bir sanayi şehri."),
  c("batman", "Batman", "72", "guneydogu-anadolu", false, ["sanayi", "ticaret"], "Petrol üretimi ve rafinerisiyle bilinen, ticaretle büyüyen genç bir şehir."),
  c("sirnak", "Şırnak", "73", "guneydogu-anadolu", false, ["ticaret"], "Habur sınır kapısı üzerinden yürüyen ticaret ve lojistikle öne çıkan bir sınır ili."),
  c("bartin", "Bartın", "74", "karadeniz", false, ["turizm"], "Amasra ile kıyı ve kültür turizminin öne çıktığı bir Batı Karadeniz şehri."),
  c("ardahan", "Ardahan", "75", "dogu-anadolu", false, ["tarim"], "Hayvancılık, mera ve süt ürünleriyle geçimini sağlayan bir yayla ili."),
  c("igdir", "Iğdır", "76", "dogu-anadolu", false, ["tarim", "ticaret"], "Iğdır kayısısı ve verimli ovası, üç ülkeye sınırı olan konumuyla ticarette öne çıkar."),
  c("yalova", "Yalova", "77", "marmara", false, ["saglik", "tarim"], "Termal kaynakları ve süs bitkisi üretimiyle tanınan, İstanbul’a yakın bir şehir."),
  c("karabuk", "Karabük", "78", "karadeniz", false, ["sanayi", "turizm"], "Demir-çelik üretiminin merkezi; UNESCO mirası Safranbolu ile turizmde de bilinir."),
  c("kilis", "Kilis", "79", "guneydogu-anadolu", false, ["ticaret", "tarim"], "Sınır ticareti, zeytin ve zeytinyağı üretimiyle bilinen bir Güneydoğu ili."),
  c("osmaniye", "Osmaniye", "80", "akdeniz", false, ["tarim", "sanayi"], "Yer fıstığı üretimi ve gelişen sanayisiyle Çukurova’nın genç illerinden."),
  c("duzce", "Düzce", "81", "karadeniz", false, ["sanayi", "turizm"], "Sanayi tesisleri, fındık üretimi ve Akçakoca kıyılarıyla gelişen bir Batı Karadeniz şehri."),
];

const bySlug = new Map(CITIES.map((x) => [x.slug, x]));
export const getCity = (slug: string | null | undefined) => (slug ? bySlug.get(slug) ?? null : null);
export const citiesInRegion = (r: Region) => CITIES.filter((x) => x.region === r);
export const METRO_SLUGS = CITIES.filter((x) => x.metro).map((x) => x.slug);

/** İl adını (veya serbest metni) slug'a çevirir: "İstanbul" → "istanbul". Eşleşme yoksa null. */
export function citySlugFromName(name: string | null | undefined): string | null {
  if (!name) return null;
  const norm = name
    .trim()
    .replace(/[İI]/g, (m) => (m === "İ" ? "i" : "ı"))
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z]/g, "");
  if (norm === "afyon") return "afyonkarahisar";
  if (norm === "maras") return "kahramanmaras";
  if (norm === "antep") return "gaziantep";
  if (norm === "urfa") return "sanliurfa";
  if (norm === "icel") return "mersin";
  return bySlug.has(norm) ? norm : null;
}
