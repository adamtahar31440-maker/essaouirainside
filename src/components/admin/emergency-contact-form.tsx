import { upsertEmergencyContact } from "@/lib/admin-actions";

type Contact = {
  id: number;
  category: string;
  name: Record<string, string>;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  hours: Record<string, string> | null;
  notes: Record<string, string> | null;
  website: string | null;
  country: string | null;
  featured: boolean | null;
};

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

const CATEGORIES = [
  ["urgences", "Urgences"],
  ["sante", "Santé"],
  ["securite", "Sécurité"],
  ["ambassade", "Ambassades & Consulats"],
  ["depannage", "Dépannage"],
  ["argent", "Argent"],
  ["transport", "Transport"],
  ["telephone", "Téléphone"],
  ["info_utile", "Infos utiles"],
];

export function EmergencyContactForm({ locale, contact }: { locale: string; contact?: Contact }) {
  return (
    <form action={upsertEmergencyContact} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {contact && <input type="hidden" name="id" value={contact.id} />}

      <div>
        <label className={labelClass}>Catégorie</label>
        <select name="category" defaultValue={contact?.category ?? "urgences"} className={inputClass}>
          {CATEGORIES.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Nom ({l})</label>
            <input name={`name_${l}`} defaultValue={contact?.name?.[l]} className={inputClass} required={l === "fr"} />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Téléphone</label>
          <input name="phone" defaultValue={contact?.phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input name="whatsapp" defaultValue={contact?.whatsapp ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Site internet</label>
          <input name="website" defaultValue={contact?.website ?? ""} className={inputClass} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Adresse</label>
          <input name="address" defaultValue={contact?.address ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Latitude</label>
          <input type="number" step="any" name="lat" defaultValue={contact?.lat ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input type="number" step="any" name="lng" defaultValue={contact?.lng ?? ""} className={inputClass} />
        </div>
      </section>

      <div>
        <label className={labelClass}>Pays (ambassades uniquement)</label>
        <input name="country" defaultValue={contact?.country ?? ""} className={inputClass} />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Horaires ({l})</label>
            <input name={`hours_${l}`} defaultValue={contact?.hours?.[l]} className={inputClass} placeholder="24h/24" />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["fr", "en", "ar"] as const).map((l) => (
          <div key={l}>
            <label className={labelClass}>Notes / procédure ({l})</label>
            <textarea name={`notes_${l}`} defaultValue={contact?.notes?.[l]} rows={3} className={inputClass} />
          </div>
        ))}
      </section>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={!!contact?.featured} /> Afficher dans le bouton SOS
      </label>

      <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
        Enregistrer
      </button>
    </form>
  );
}
