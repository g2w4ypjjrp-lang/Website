import { getThemeSettings } from "@/server/settings";
import { Logo, logoVariant } from "@/components/logo";

/** Etkin temanın logo biçimiyle logo (sunucu bileşeni; tema okuması istek içinde önbellekli). */
export async function ThemedLogo(props: { href?: string; className?: string; tone?: "ink" | "light" }) {
  const { theme } = await getThemeSettings();
  return <Logo {...props} variant={logoVariant(theme)} />;
}
