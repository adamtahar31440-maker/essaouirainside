import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getActiveModuleKeys } from "@/lib/modules";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const activeModules = await getActiveModuleKeys();

  return (
    <>
      <Header activeModules={Array.from(activeModules)} />
      <main className="flex-1">{children}</main>
      <Footer activeModules={Array.from(activeModules)} />
    </>
  );
}
