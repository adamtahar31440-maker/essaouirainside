import { upsertSiteSection } from "@/lib/admin-actions";
import { SubmitButton } from "@/components/submit-button";

type SiteSection = {
  id: number;
  slug: string;
  name: Record<string, string>;
};

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export function SiteSectionForm({ locale, section }: { locale: string; section?: SiteSection }) {
  return (
    <form action={upsertSiteSection} className="max-w-xl space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {section && <input type="hidden" name="id" value={section.id} />}

      <p className="rounded-lg bg-ocean-dark/5 px-3 py-2 text-xs text-foreground/60">
        Une section apparaît comme un nouveau lien dans le menu &quot;Vivre à Essaouira&quot;, à côté de Blog et
        Agenda. Rédigez en français : les autres langues seront traduites automatiquement.
      </p>

      <div>
        <label className={labelClass}>Nom (affiché dans le menu)</label>
        <input name="name" defaultValue={section?.name.fr} className={inputClass} required />
      </div>

      <div>
        <label className={labelClass}>Adresse web (slug)</label>
        <input
          name="slug"
          defaultValue={section?.slug}
          placeholder="Laissez vide pour la générer automatiquement à partir du nom"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-foreground/50">
          Détermine l&apos;adresse publique, ex : essaouirainside.com/transport
        </p>
      </div>

      <SubmitButton label="Enregistrer" pendingLabel="Traduction et enregistrement en cours..." />
    </form>
  );
}
