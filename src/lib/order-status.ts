export type OrderStatus =
  | "awaiting_payment"
  | "payment_received"
  | "created"
  | "in_progress"
  | "awaiting_delivery"
  | "delivered"
  | "revision_requested"
  | "completed"
  | "cancelled"
  | "refund_in_progress"
  | "disputed";

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: "neutral" | "info" | "warn" | "ok" | "bad" }> = {
  awaiting_payment: { label: "Ödeme bekliyor", tone: "warn" },
  payment_received: { label: "Ödeme alındı", tone: "info" },
  created: { label: "Sipariş oluşturuldu", tone: "info" },
  in_progress: { label: "İş başladı", tone: "info" },
  awaiting_delivery: { label: "Teslimat bekleniyor", tone: "info" },
  delivered: { label: "Teslim edildi", tone: "warn" },
  revision_requested: { label: "Revizyon isteniyor", tone: "warn" },
  completed: { label: "Tamamlandı", tone: "ok" },
  cancelled: { label: "İptal edildi", tone: "neutral" },
  refund_in_progress: { label: "İade sürecinde", tone: "bad" },
  disputed: { label: "Uyuşmazlık", tone: "bad" },
};

export const ACTIVE_STATUSES: OrderStatus[] = ["created", "in_progress", "awaiting_delivery", "delivered", "revision_requested"];

/** Sipariş akışındaki ana adımlar — sipariş detayında ilerleme çizgisi olarak gösterilir. */
export const ORDER_STEPS: { key: OrderStatus[]; label: string }[] = [
  { key: ["awaiting_payment"], label: "Ödeme" },
  { key: ["payment_received", "created"], label: "Sipariş" },
  { key: ["in_progress", "awaiting_delivery", "revision_requested"], label: "Çalışma" },
  { key: ["delivered"], label: "Teslim" },
  { key: ["completed"], label: "Onay" },
];

export const TIER_LABEL = { basic: "Temel", standard: "Standart", premium: "Profesyonel" } as const;
export const LEVEL_LABEL = { new: "Yeni üye", rising: "Yükselen", pro: "Profesyonel", top: "Üst düzey" } as const;
