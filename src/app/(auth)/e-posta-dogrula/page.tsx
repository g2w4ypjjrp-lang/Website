import type { Metadata } from "next";
import { verifyEmailToken } from "@/app/actions/auth";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "E-posta doğrulama", robots: { index: false } };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const ok = token ? await verifyEmailToken(token) : false;
  return ok ? (
    <>
      <h1 className="text-[30px] font-semibold">E-postanız doğrulandı</h1>
      <p className="mb-8 mt-2 text-muted">Artık sipariş verebilir, proje oluşturabilir ve uzmanlarla mesajlaşabilirsiniz.</p>
      <ButtonLink href="/panel" size="lg">Panele git</ButtonLink>
    </>
  ) : (
    <>
      <h1 className="text-[30px] font-semibold">Bağlantı geçersiz</h1>
      <p className="mb-8 mt-2 text-muted">Doğrulama bağlantısının süresi dolmuş ya da daha önce kullanılmış olabilir. Panelinizden yeni bir bağlantı isteyebilirsiniz.</p>
      <ButtonLink href="/panel" variant="outline" size="lg">Panele git</ButtonLink>
    </>
  );
}
