import Link from "next/link";
import { adminGetEvents } from "@/lib/admin-data";
import { deleteEvent } from "@/lib/admin-actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-button";

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const items = await adminGetEvents();
  const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ocean-dark">Événements</h1>
        <Link
          href={`/${locale}/admin/evenements/new`}
          className="rounded-full bg-ocean-dark px-4 py-2 text-sm font-semibold text-white hover:bg-ocean"
        >
          + Nouvel événement
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-sand/30 text-xs uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ev) => (
              <tr key={ev.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ocean-dark">{ev.title.fr}</td>
                <td className="px-4 py-3 text-foreground/70">{ev.category}</td>
                <td className="px-4 py-3 text-foreground/70">{dateFmt.format(new Date(ev.startDate))}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/${locale}/admin/evenements/${ev.id}`} className="text-azur hover:underline">
                      Modifier
                    </Link>
                    <form action={deleteEvent.bind(null, ev.id)}>
                      <ConfirmSubmitButton confirmText={`Supprimer "${ev.title.fr}" ?`} className="text-red-600 hover:underline">
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
