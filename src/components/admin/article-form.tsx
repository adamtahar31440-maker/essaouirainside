import { upsertArticle } from "@/lib/admin-actions";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";

type Article = {
  id: number;
  category: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  body: Record<string, string>;
  coverImage: string | null;
};

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export function ArticleForm({ locale, article }: { locale: string; article?: Article }) {
  return (
    <form action={upsertArticle} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {article && <input type="hidden" name="id" value={article.id} />}
      {article && <input type="hidden" name="slug" value={article.slug} />}

      <div>
        <label className={labelClass}>Catégorie</label>
        <select name="category" defaultValue={article?.category ?? "guides"} className={inputClass}>
          <option value="guides">Guides</option>
          <option value="actualites">Actualités</option>
          <option value="conseils">Conseils</option>
          <option value="interviews">Interviews</option>
          <option value="reportages">Reportages</option>
        </select>
      </div>

      <AutoTranslateButton />

      <LocalizedFieldGroup field="title" label="Titre" values={article?.title} required />
      <LocalizedFieldGroup field="excerpt" label="Extrait" values={article?.excerpt} multiline rows={2} />
      <LocalizedFieldGroup field="body" label="Contenu" values={article?.body} multiline rows={8} />

      <div>
        <label className={labelClass}>Image de couverture (URL)</label>
        <input name="coverImage" defaultValue={article?.coverImage ?? ""} className={inputClass} />
      </div>

      <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
        Enregistrer
      </button>
    </form>
  );
}
