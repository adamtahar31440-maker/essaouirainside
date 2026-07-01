import { upsertEstablishment } from "@/lib/admin-actions";
import { CATEGORY_SUBCATEGORIES } from "@/lib/categories";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { AutoTranslateButton } from "@/components/admin/auto-translate-button";

type Category = { id: number; type: string; name: Record<string, string> };
type Establishment = {
  id: number;
  categoryId: number;
  subcategory: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string>;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  priceLevel: string | null;
  parking: boolean | null;
  wifi: boolean | null;
  accessibility: boolean | null;
  featured: boolean | null;
  badge: string | null;
  status: string;
  images: string[] | null;
};

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export function EstablishmentForm({
  locale,
  categories,
  establishment,
}: {
  locale: string;
  categories: Category[];
  establishment?: Establishment;
}) {
  return (
    <form action={upsertEstablishment} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {establishment && <input type="hidden" name="id" value={establishment.id} />}
      {establishment && <input type="hidden" name="slug" value={establishment.slug} />}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Catégorie</label>
          <select name="categoryId" defaultValue={establishment?.categoryId} className={inputClass} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.fr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Sous-catégorie</label>
          <select name="subcategory" defaultValue={establishment?.subcategory} className={inputClass} required>
            {Object.values(CATEGORY_SUBCATEGORIES)
              .flat()
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </div>
      </section>

      <AutoTranslateButton />

      <LocalizedFieldGroup field="name" label="Nom" values={establishment?.name} required />
      <LocalizedFieldGroup field="description" label="Description" values={establishment?.description} multiline />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Adresse</label>
          <input name="address" defaultValue={establishment?.address ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Latitude</label>
          <input name="lat" type="number" step="any" defaultValue={establishment?.lat ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input name="lng" type="number" step="any" defaultValue={establishment?.lng ?? ""} className={inputClass} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Téléphone</label>
          <input name="phone" defaultValue={establishment?.phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input name="whatsapp" defaultValue={establishment?.whatsapp ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Site internet</label>
          <input name="website" defaultValue={establishment?.website ?? ""} className={inputClass} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Niveau de prix</label>
          <select name="priceLevel" defaultValue={establishment?.priceLevel ?? "€€"} className={inputClass}>
            <option value="€">€</option>
            <option value="€€">€€</option>
            <option value="€€€">€€€</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <input name="badge" defaultValue={establishment?.badge ?? ""} className={inputClass} placeholder="Partenaire" />
        </div>
        <div>
          <label className={labelClass}>Statut</label>
          <select name="status" defaultValue={establishment?.status ?? "active"} className={inputClass}>
            <option value="active">Actif</option>
            <option value="disabled">Désactivé</option>
          </select>
        </div>
      </section>

      <section className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="wifi" defaultChecked={!!establishment?.wifi} /> Wi-Fi
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="parking" defaultChecked={!!establishment?.parking} /> Parking
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="accessibility" defaultChecked={!!establishment?.accessibility} /> Accessibilité
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={!!establishment?.featured} /> Mis en avant
        </label>
      </section>

      <section>
        <label className={labelClass}>Photos (une URL par ligne)</label>
        <textarea
          name="images"
          defaultValue={establishment?.images?.join("\n") ?? ""}
          rows={4}
          className={inputClass}
          placeholder="https://..."
        />
      </section>

      <button
        type="submit"
        className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean"
      >
        Enregistrer
      </button>
    </form>
  );
}
