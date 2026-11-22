export type CheckoutInput = {
  orderId: string;
  orderCode: string;
  conversationId: string;
  totalKurus: number;
  providerEarningKurus: number;
  subMerchantKey: string | null;
  /** Platformun kendi geliri (öne çıkarma, premium üyelik): alt üye işyerine pay aktarılmaz. */
  platformOnly?: boolean;
  itemTitle: string;
  categoryName: string;
  buyer: { id: string; name: string; email: string; ip: string; city?: string; address?: string; identityNumber?: string };
  callbackUrl: string;
};

export type CheckoutSession =
  | { kind: "redirect"; url: string; token: string }
  | { kind: "embed"; html: string; token: string };

export type VerifyResult = { ok: boolean; providerRef?: string; amountKurus?: number; meta: Record<string, unknown>; error?: string };

/**
 * Pazaryeri ödeme sağlayıcısı sözleşmesi.
 * Kart bilgileri hiçbir zaman platform sunucusuna gelmez; kart formu sağlayıcının barındırdığı sayfada/iframe'de doldurulur.
 */
export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  verify(token: string, conversationId: string): Promise<VerifyResult>;
  /** Siparişin tamamlanmasıyla alt üye işyerine aktarım onayı (iyzico: approval). */
  releaseToSeller(paymentItemRef: string): Promise<{ ok: boolean; meta: Record<string, unknown> }>;
  refund(providerRef: string, amountKurus: number, ip: string): Promise<{ ok: boolean; meta: Record<string, unknown> }>;
}
