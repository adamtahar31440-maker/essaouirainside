import { notFound } from "next/navigation";
import { adminGetContentPageById } from "@/lib/admin-data";
import { ContentPageForm } from "@/components/admin/content-page-form";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const page = await adminGetContentPageById(Number(id));
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Modifier : {page.title.fr}</h1>
      <ContentPageForm locale={locale} page={page} />
    </div>
  );
}
