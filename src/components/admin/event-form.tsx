import { upsertEvent } from "@/lib/admin-actions";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";

type EventRow = {
  id: number;
  category: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  startDate: string | Date;
  endDate: string | Date | null;
  location: string | null;
  image: string | null;
};

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

function toDateInput(d: string | Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function EventForm({ locale, event }: { locale: string; event?: EventRow }) {
  return (
    <form action={upsertEvent} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {event && <input type="hidden" name="id" value={event.id} />}
      {event && <input type="hidden" name="slug" value={event.slug} />}

      <div>
        <label className={labelClass}>Catégorie</label>
        <select name="category" defaultValue={event?.category ?? "festivals"} className={inputClass}>
          <option value="festivals">Festivals</option>
          <option value="concerts">Concerts</option>
          <option value="marches">Marchés</option>
          <option value="expositions">Expositions</option>
        </select>
      </div>

      <AutoTranslateButton />

      <LocalizedFieldGroup field="title" label="Titre" values={event?.title} required />
      <LocalizedFieldGroup field="description" label="Description" values={event?.description} multiline />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Date de début</label>
          <input type="date" name="startDate" defaultValue={toDateInput(event?.startDate)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Date de fin</label>
          <input type="date" name="endDate" defaultValue={toDateInput(event?.endDate)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lieu</label>
          <input name="location" defaultValue={event?.location ?? ""} className={inputClass} />
        </div>
      </section>

      <div>
        <label className={labelClass}>Image (URL)</label>
        <input name="image" defaultValue={event?.image ?? ""} className={inputClass} />
      </div>

      <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
        Enregistrer
      </button>
    </form>
  );
}
