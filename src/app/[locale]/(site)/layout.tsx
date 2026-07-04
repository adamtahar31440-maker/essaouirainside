import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SosButton } from "@/components/sos-button";
import { getActiveModuleKeys } from "@/lib/modules";
import { getFeaturedEmergencyContacts } from "@/lib/data";
import { getNavItems } from "@/lib/nav";
import { getTranslations } from "next-intl/server";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [activeModules, sosContacts, navItems, tNav] = await Promise.all([
    getActiveModuleKeys(),
    getFeaturedEmergencyContacts(),
    getNavItems(),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const navLinks = navItems
    .filter((item) => item.active)
    .map((item) => ({
      href: item.href,
      label: item.label?.[locale] ?? item.label?.fr ?? (item.i18nKey ? tNav(item.i18nKey as never) : item.key),
    }));

  return (
    <>
      <Header activeModules={Array.from(activeModules)} navLinks={navLinks} />
      <main className="flex-1">{children}</main>
      <Footer activeModules={Array.from(activeModules)} navLinks={navLinks} />
      {activeModules.has("assistance") && sosContacts.length > 0 && <SosButton contacts={sosContacts} />}
    </>
  );
}
