import { ContentPageForm } from "@/components/admin/content-page-form";
import { adminGetSiteSections } from "@/lib/admin-data";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const customSections = await adminGetSiteSections();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Nouvelle page</h1>
      <ContentPageForm locale={locale} customSections={customSections} />
    </div>
  );
}
