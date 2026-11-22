import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import type { PaymentProvider } from "./types";

/**
 * iyzico Pazaryeri (Marketplace) entegrasyonu — Checkout Form + alt üye işyeri (subMerchant) ile split ödeme.
 * Gerekli: iyzico'dan pazaryeri sözleşmesi, IYZICO_API_KEY ve IYZICO_SECRET_KEY.
 * Akış: initialize → kullanıcı iyzico formunda öder → callback'te retrieve ile doğrulanır →
 * sipariş tamamlanınca her basket item için "approval" çağrılarak tutar alt üye işyerine serbest bırakılır.
 * Not: Bu adaptör resmi dokümantasyona göre yazıldı; canlıya almadan önce iyzico sandbox ortamında uçtan uca test edilmelidir.
 */
const base = () => process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
const tl = (kurus: number) => (kurus / 100).toFixed(2);

async function call<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error("iyzico anahtarları tanımlı değil (IYZICO_API_KEY / IYZICO_SECRET_KEY).");
  const json = JSON.stringify(body);
  const rnd = `${Date.now()}${randomBytes(4).toString("hex")}`;
  const signature = createHmac("sha256", secretKey).update(rnd + path + json).digest("hex");
  const auth = Buffer.from(`apiKey:${apiKey}&randomKey:${rnd}&signature:${signature}`).toString("base64");
  const res = await fetch(base() + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `IYZWSv2 ${auth}`, "x-iyzi-rnd": rnd },
    body: json,
    cache: "no-store",
  });
  return (await res.json()) as T;
}

type IyziResp = { status: "success" | "failure"; errorMessage?: string; [k: string]: unknown };

export const iyzicoProvider: PaymentProvider = {
  name: "iyzico",
  async createCheckout(i) {
    if (!i.subMerchantKey) throw new Error("Uzmanın iyzico alt üye işyeri kaydı tamamlanmamış.");
    const [first, ...rest] = i.buyer.name.split(" ");
    const r = await call<IyziResp & { token: string; paymentPageUrl: string }>("/payment/iyzipos/checkoutform/initialize/auth/ecom", {
      locale: "tr",
      conversationId: i.conversationId,
      price: tl(i.totalKurus),
      paidPrice: tl(i.totalKurus),
      currency: "TRY",
      basketId: i.orderCode,
      paymentGroup: "PRODUCT",
      callbackUrl: i.callbackUrl,
      enabledInstallments: [1, 2, 3, 6],
      buyer: {
        id: i.buyer.id,
        name: first,
        surname: rest.join(" ") || first,
        email: i.buyer.email,
        identityNumber: i.buyer.identityNumber ?? "11111111111",
        registrationAddress: i.buyer.address ?? "Belirtilmedi",
        city: i.buyer.city ?? "İstanbul",
        country: "Turkey",
        ip: i.buyer.ip,
      },
      billingAddress: { contactName: i.buyer.name, city: i.buyer.city ?? "İstanbul", country: "Turkey", address: i.buyer.address ?? "Belirtilmedi" },
      basketItems: [
        {
          id: i.orderId,
          name: i.itemTitle.slice(0, 200),
          category1: i.categoryName,
          itemType: "VIRTUAL",
          price: tl(i.totalKurus),
          subMerchantKey: i.subMerchantKey,
          subMerchantPrice: tl(i.providerEarningKurus),
        },
      ],
    });
    if (r.status !== "success") throw new Error(r.errorMessage ?? "Ödeme başlatılamadı.");
    return { kind: "redirect", url: r.paymentPageUrl, token: r.token };
  },
  async verify(token, conversationId) {
    const r = await call<IyziResp & { paymentId?: string; paidPrice?: number; paymentStatus?: string; conversationId?: string; itemTransactions?: { paymentTransactionId: string }[]; lastFourDigits?: string }>(
      "/payment/iyzipos/checkoutform/auth/ecom/detail",
      { locale: "tr", token, conversationId },
    );
    const ok = r.status === "success" && r.paymentStatus === "SUCCESS" && r.conversationId === conversationId;
    return {
      ok,
      providerRef: r.paymentId,
      amountKurus: r.paidPrice != null ? Math.round(Number(r.paidPrice) * 100) : undefined,
      meta: { paymentTransactionIds: r.itemTransactions?.map((t) => t.paymentTransactionId) ?? [], lastFour: r.lastFourDigits },
      error: ok ? undefined : r.errorMessage ?? "Ödeme doğrulanamadı",
    };
  },
  async releaseToSeller(paymentTransactionId) {
    const r = await call<IyziResp>("/payment/iyzipos/item/approve", { locale: "tr", paymentTransactionId });
    return { ok: r.status === "success", meta: { errorMessage: r.errorMessage } };
  },
  async refund(paymentTransactionId, amountKurus, ip) {
    const r = await call<IyziResp>("/payment/refund", { locale: "tr", paymentTransactionId, price: tl(amountKurus), currency: "TRY", ip });
    return { ok: r.status === "success", meta: { errorMessage: r.errorMessage } };
  },
};
