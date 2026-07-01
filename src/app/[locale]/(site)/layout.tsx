import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SosButton } from "@/components/sos-button";
import { getActiveModuleKeys } from "@/lib/modules";
import { getFeaturedEmergencyContacts } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [activeModules, sosContacts] = await Promise.all([
    getActiveModuleKeys(),
    getFeaturedEmergencyContacts(),
  ]);

  return (
    <>
      <Header activeModules={Array.from(activeModules)} />
      <main className="flex-1">{children}</main>
      <Footer activeModules={Array.from(activeModules)} />
      {activeModules.has("assistance") && sosContacts.length > 0 && <SosButton contacts={sosContacts} />}
    </>
  );
}
