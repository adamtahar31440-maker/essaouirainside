import { upsertEvent } from "@/lib/admin-actions";

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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Titre ({l})</label>
            <input name={`title_${l}`} defaultValue={event?.title?.[l]} className={inputClass} required={l === "fr"} />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Description ({l})</label>
            <textarea name={`description_${l}`} defaultValue={event?.description?.[l]} rows={4} className={inputClass} />
          </div>
        ))}
      </section>

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
