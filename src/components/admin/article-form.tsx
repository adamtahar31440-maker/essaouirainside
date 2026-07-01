import { upsertArticle } from "@/lib/admin-actions";

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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Titre ({l})</label>
            <input name={`title_${l}`} defaultValue={article?.title?.[l]} className={inputClass} required={l === "fr"} />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Extrait ({l})</label>
            <textarea name={`excerpt_${l}`} defaultValue={article?.excerpt?.[l]} rows={2} className={inputClass} />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Contenu ({l})</label>
            <textarea name={`body_${l}`} defaultValue={article?.body?.[l]} rows={8} className={inputClass} />
          </div>
        ))}
      </section>

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
