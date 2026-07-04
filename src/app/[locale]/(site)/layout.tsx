import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SosButton } from "@/components/sos-button";
import { getActiveModuleKeys } from "@/lib/modules";
import { getFeaturedEmergencyContacts, getSiteSections } from "@/lib/data";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [activeModules, sosContacts, siteSections] = await Promise.all([
    getActiveModuleKeys(),
    getFeaturedEmergencyContacts(),
    getSiteSections(),
  ]);

  const sections = siteSections.map((s) => ({ slug: s.slug, name: s.name[locale] ?? s.name.fr }));

  return (
    <>
      <Header activeModules={Array.from(activeModules)} sections={sections} />
      <main className="flex-1">{children}</main>
      <Footer activeModules={Array.from(activeModules)} />
      {activeModules.has("assistance") && sosContacts.length > 0 && <SosButton contacts={sosContacts} />}
    </>
  );
}
