import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ADMIN_ROLES, type Role } from "@/lib/roles";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  const role = user?.publicMetadata?.role as Role | undefined;

  if (!user) redirect(`/${locale}/sign-in`);
  if (!role || !ADMIN_ROLES.includes(role)) redirect(`/${locale}`);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar locale={locale} role={role} />
      <div className="flex-1 bg-sand/20 p-8">{children}</div>
    </div>
  );
}
