import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function ProLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-sand/20">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
        <Link href={`/${locale}/pro`} className="text-sm font-semibold text-ocean-dark">
          Essaouira Inside — <span className="text-terracotta">Espace Pro</span>
        </Link>
        <UserButton />
      </header>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
