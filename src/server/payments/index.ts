import "server-only";
import { iyzicoProvider } from "./iyzico";
import { sandboxProvider } from "./sandbox";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  const p = process.env.PAYMENT_PROVIDER ?? "sandbox";
  if (p === "iyzico") return iyzicoProvider;
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SANDBOX_PAYMENTS !== "true") {
    throw new Error("Production ortamında sandbox ödeme kapalıdır. PAYMENT_PROVIDER=iyzico ayarlayın.");
  }
  return sandboxProvider;
}

export function getProviderByName(name: string): PaymentProvider {
  return name === "iyzico" ? iyzicoProvider : sandboxProvider;
}
