import Link from "next/link";
import { adminGetContentPages, adminGetSiteSections } from "@/lib/admin-data";
import { deleteContentPage, moveContentPage } from "@/lib/admin-actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-button";

export default async function AdminPagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [items, customSections] = await Promise.all([adminGetContentPages(), adminGetSiteSections()]);

  const sectionLabels: Record<string, string> = { "assistance-guides": "Assistance — Guides pratiques" };
  for (const s of customSections) sectionLabels[s.slug] = s.name.fr;

  const groups = new Map<string, typeof items>();
  for (const p of items) {
    const group = groups.get(p.section) ?? [];
    group.push(p);
    groups.set(p.section, group);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ocean-dark">Pages de contenu</h1>
        <Link
          href={`/${locale}/admin/pages/new`}
          className="rounded-full bg-ocean-dark px-4 py-2 text-sm font-semibold text-white hover:bg-ocean"
        >
          + Nouvelle page
        </Link>
      </div>

      <div className="space-y-8">
        {Array.from(groups.entries()).map(([section, pages]) => (
          <div key={section}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/60">
              {sectionLabels[section] ?? section}
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-black/5 bg-sand/30 text-xs uppercase text-foreground/60">
                  <tr>
                    <th className="px-4 py-3">Ordre</th>
                    <th className="px-4 py-3">Titre</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p, i) => (
                    <tr key={p.id} className="border-b border-black/5 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <form action={moveContentPage.bind(null, p.id, "up")}>
                            <button
                              type="submit"
                              disabled={i === 0}
                              className="rounded border border-black/10 px-1.5 py-0.5 text-xs text-foreground/60 hover:bg-sand/40 disabled:opacity-30"
                              aria-label="Monter"
                            >
                              ▲
                            </button>
                          </form>
                          <form action={moveContentPage.bind(null, p.id, "down")}>
                            <button
                              type="submit"
                              disabled={i === pages.length - 1}
                              className="rounded border border-black/10 px-1.5 py-0.5 text-xs text-foreground/60 hover:bg-sand/40 disabled:opacity-30"
                              aria-label="Descendre"
                            >
                              ▼
                            </button>
                          </form>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-ocean-dark">{p.title.fr}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/${locale}/admin/pages/${p.id}`} className="text-azur hover:underline">
                            Modifier
                          </Link>
                          <form action={deleteContentPage.bind(null, p.id)}>
                            <ConfirmSubmitButton confirmText={`Supprimer "${p.title.fr}" ?`} className="text-red-600 hover:underline">
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
        ))}
      </div>
    </div>
  );
}
