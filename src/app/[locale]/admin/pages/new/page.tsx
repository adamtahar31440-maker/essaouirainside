import { ContentPageForm } from "@/components/admin/content-page-form";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Nouvelle page</h1>
      <ContentPageForm locale={locale} />
    </div>
  );
}
