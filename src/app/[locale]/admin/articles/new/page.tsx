import { ArticleForm } from "@/components/admin/article-form";

export default async function NewArticlePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Nouvel article</h1>
      <ArticleForm locale={locale} />
    </div>
  );
}
