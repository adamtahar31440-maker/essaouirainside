import { upsertRealEstate } from "@/lib/admin-actions";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";

type Listing = {
  id: number;
  listingType: string;
  category: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  priceMad: number | null;
  surfaceM2: number | null;
  rooms: number | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  featured: boolean | null;
  images: string[] | null;
};

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export function RealEstateForm({ locale, listing }: { locale: string; listing?: Listing }) {
  return (
    <form action={upsertRealEstate} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {listing && <input type="hidden" name="id" value={listing.id} />}
      {listing && <input type="hidden" name="slug" value={listing.slug} />}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Type d&apos;annonce</label>
          <select name="listingType" defaultValue={listing?.listingType ?? "vente"} className={inputClass}>
            <option value="vente">Vente</option>
            <option value="location">Location</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Catégorie</label>
          <select name="category" defaultValue={listing?.category ?? "villa"} className={inputClass}>
            <option value="villa">Villa</option>
            <option value="riad">Riad</option>
            <option value="appartement">Appartement</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
      </section>

      <AutoTranslateButton />

      <LocalizedFieldGroup field="title" label="Titre" values={listing?.title} required />
      <LocalizedFieldGroup field="description" label="Description" values={listing?.description} multiline />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Prix (MAD)</label>
          <input type="number" name="priceMad" defaultValue={listing?.priceMad ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Surface (m²)</label>
          <input type="number" name="surfaceM2" defaultValue={listing?.surfaceM2 ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Pièces</label>
          <input type="number" name="rooms" defaultValue={listing?.rooms ?? ""} className={inputClass} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Adresse</label>
          <input name="address" defaultValue={listing?.address ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Latitude</label>
          <input type="number" step="any" name="lat" defaultValue={listing?.lat ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input type="number" step="any" name="lng" defaultValue={listing?.lng ?? ""} className={inputClass} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Statut</label>
          <select name="status" defaultValue={listing?.status ?? "pending"} className={inputClass}>
            <option value="pending">En attente</option>
            <option value="validated">Validée</option>
            <option value="refused">Refusée</option>
          </select>
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={!!listing?.featured} /> Mise en avant
        </label>
      </section>

      <div>
        <label className={labelClass}>Photos (une URL par ligne)</label>
        <textarea name="images" defaultValue={listing?.images?.join("\n") ?? ""} rows={4} className={inputClass} />
      </div>

      <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
        Enregistrer
      </button>
    </form>
  );
}
