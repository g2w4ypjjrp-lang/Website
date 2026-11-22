import { NextResponse, type NextRequest } from "next/server";

/**
 * Hafif, veritabanına gitmeyen ön kontrol:
 * - Oturum çerezi olmayanları korumalı alanlardan girişe yönlendirir (asıl yetki kontrolü sunucu tarafında yapılır).
 * - Panel/yönetim/ödeme sayfalarına X-Robots-Tag: noindex ekler.
 * - Durum değiştiren API isteklerinde Origin doğrulaması yapar (CSRF).
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("eksen_oturum");

  if (req.method !== "GET" && req.method !== "HEAD" && pathname.startsWith("/api/") && !pathname.startsWith("/api/payments/callback") && !pathname.startsWith("/api/cron")) {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) return new NextResponse("Geçersiz kaynak", { status: 403 });
  }

  if ((pathname.startsWith("/panel") || pathname.startsWith("/yonetim") || pathname.startsWith("/odeme")) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/giris";
    url.search = pathname.startsWith("/yonetim") ? "" : `?sonra=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/panel") || pathname.startsWith("/yonetim") || pathname.startsWith("/odeme")) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/panel/:path*", "/yonetim/:path*", "/odeme/:path*", "/api/:path*"] };
