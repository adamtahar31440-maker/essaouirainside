import { notFound } from "next/navigation";
import { adminGetArticleById } from "@/lib/admin-data";
import { ArticleForm } from "@/components/admin/article-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const article = await adminGetArticleById(Number(id));
  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Modifier : {article.title.fr}</h1>
      <ArticleForm locale={locale} article={article} />
    </div>
  );
}
