import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { formatTRY } from "@/lib/utils";

export const metadata: Metadata = { title: "Test ödeme", robots: { index: false } };

/** Yalnızca sandbox sağlayıcısı için: banka 3D doğrulama ekranının yerini tutar. Kart bilgisi istenmez. */
export default async function SandboxPay({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ token?: string }> }) {
  if ((process.env.PAYMENT_PROVIDER ?? "sandbox") !== "sandbox") notFound();
  const [{ code }, { token }] = await Promise.all([params, searchParams]);
  const user = await requireUser();
  const order = await db.query.orders.findFirst({ where: eq(orders.code, code) });
  if (!order || order.buyerId !== user.id || !token) notFound();
  return (
    <div className="mx-auto max-w-md rounded-lg border border-dashed border-warn/50 bg-surface p-8">
      <p className="eyebrow !text-warn">Test ortamı · gerçek para çekilmez</p>
      <h1 className="mt-3 text-[24px] font-semibold">Banka doğrulama simülasyonu</h1>
      <p className="mt-2 text-[14.5px] text-ink-2">Canlı ortamda bu adımda ödeme kuruluşunun kart ve 3D Secure ekranı açılır. Burada ödeme sonucunu seçerek akışı test edebilirsiniz.</p>
      <p className="num mt-6 text-[28px]">{formatTRY(order.totalKurus, true)}</p>
      <form action="/api/payments/callback/sandbox" method="post" className="mt-6 grid gap-2">
        <input type="hidden" name="token" value={token} />
        <button name="simulate" value="ok" className="h-11 rounded-md bg-trust font-medium text-white">Ödemeyi onayla</button>
        <button name="simulate" value="fail" className="h-11 rounded-md border border-line font-medium text-bad">Ödemeyi reddet</button>
      </form>
    </div>
  );
}
