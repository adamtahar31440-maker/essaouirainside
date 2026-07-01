import Link from "next/link";
import { adminGetArticles } from "@/lib/admin-data";
import { deleteArticle } from "@/lib/admin-actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-button";

export default async function AdminArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const items = await adminGetArticles();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ocean-dark">Articles</h1>
        <Link
          href={`/${locale}/admin/articles/new`}
          className="rounded-full bg-ocean-dark px-4 py-2 text-sm font-semibold text-white hover:bg-ocean"
        >
          + Nouvel article
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-sand/30 text-xs uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ocean-dark">{a.title.fr}</td>
                <td className="px-4 py-3 text-foreground/70">{a.category}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/${locale}/admin/articles/${a.id}`} className="text-azur hover:underline">
                      Modifier
                    </Link>
                    <form action={deleteArticle.bind(null, a.id)}>
                      <ConfirmSubmitButton confirmText={`Supprimer "${a.title.fr}" ?`} className="text-red-600 hover:underline">
                        Supprimer
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
