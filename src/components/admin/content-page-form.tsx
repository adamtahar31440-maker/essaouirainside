import { upsertContentPage } from "@/lib/admin-actions";

type ContentPage = {
  id: number;
  section: string;
  slug: string;
  title: Record<string, string>;
  body: Record<string, string>;
  coverImage: string | null;
};

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export function ContentPageForm({ locale, page }: { locale: string; page?: ContentPage }) {
  return (
    <form action={upsertContentPage} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {page && <input type="hidden" name="id" value={page.id} />}
      {page && <input type="hidden" name="slug" value={page.slug} />}

      <div>
        <label className={labelClass}>Section</label>
        <select name="section" defaultValue={page?.section ?? "decouvrir"} className={inputClass}>
          <option value="decouvrir">Découvrir</option>
          <option value="vivre">Vivre à Essaouira</option>
          <option value="assistance-guides">Assistance — Guides pratiques</option>
        </select>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Titre ({l})</label>
            <input name={`title_${l}`} defaultValue={page?.title?.[l]} className={inputClass} required={l === "fr"} />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Contenu ({l})</label>
            <textarea name={`body_${l}`} defaultValue={page?.body?.[l]} rows={8} className={inputClass} />
          </div>
        ))}
      </section>

      <div>
        <label className={labelClass}>Image de couverture (URL)</label>
        <input name="coverImage" defaultValue={page?.coverImage ?? ""} className={inputClass} />
      </div>

      <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
        Enregistrer
      </button>
    </form>
  );
}
