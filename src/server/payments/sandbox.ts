import "server-only";
import { createHmac } from "node:crypto";
import type { PaymentProvider } from "./types";

const secret = () => process.env.CRON_SECRET ?? "sandbox-secret";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

/**
 * Geliştirme ve test için ödeme sağlayıcısı. Gerçek para hareketi yoktur ve kart bilgisi istenmez.
 * Token, sunucu tarafından imzalanır; istemci tarafında tutar değiştirilemez.
 */
export const sandboxProvider: PaymentProvider = {
  name: "sandbox",
  async createCheckout(input) {
    const payload = `${input.conversationId}.${input.totalKurus}`;
    const token = `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
    return { kind: "redirect", url: `/odeme/${input.orderCode}/test?token=${encodeURIComponent(token)}`, token };
  },
  async verify(token, conversationId) {
    const [p, s] = token.split(".");
    if (!p || !s) return { ok: false, meta: {}, error: "Geçersiz token" };
    const payload = Buffer.from(p, "base64url").toString();
    if (sign(payload) !== s) return { ok: false, meta: {}, error: "İmza doğrulanamadı" };
    const [conv, amount] = payload.split(".");
    if (conv !== conversationId) return { ok: false, meta: {}, error: "Oturum eşleşmedi" };
    return { ok: true, providerRef: `SBX-${conv!.slice(0, 8)}`, amountKurus: Number(amount), meta: { sandbox: true, cardMasked: "**** **** **** 0000" } };
  },
  async releaseToSeller() {
    return { ok: true, meta: { sandbox: true } };
  },
  async refund() {
    return { ok: true, meta: { sandbox: true } };
  },
};
