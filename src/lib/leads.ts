/** Kurumsal başvuru formu seçenekleri (form ve sunucu doğrulaması aynı listeyi kullanır). */
export const LEAD_NEEDS = [
  "Kurumsal web sitesi",
  "E-ticaret",
  "Mobil uygulama",
  "Yazılım ve entegrasyon",
  "Marka ve tasarım",
  "SEO ve reklam yönetimi",
  "Sosyal medya",
  "İçerik, çeviri ve video",
] as const;
export const TEAM_SIZES = ["1–10 kişi", "11–50 kişi", "51–200 kişi", "201+ kişi"] as const;
export const BUDGETS = ["Aylık 50.000 TL altı", "Aylık 50.000–150.000 TL", "Aylık 150.000–500.000 TL", "Aylık 500.000 TL üzeri", "Henüz belirlenmedi"] as const;

export const LEAD_STATUSES = { new: "Yeni", contacted: "Görüşülüyor", won: "Kazanıldı", lost: "Kaybedildi" } as const;
export type LeadStatus = keyof typeof LEAD_STATUSES;
