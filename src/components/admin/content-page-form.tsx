import { upsertContentPage } from "@/lib/admin-actions";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";

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

      <AutoTranslateButton />

      <LocalizedFieldGroup field="title" label="Titre" values={page?.title} required />
      <LocalizedFieldGroup field="body" label="Contenu" values={page?.body} multiline rows={8} />

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
