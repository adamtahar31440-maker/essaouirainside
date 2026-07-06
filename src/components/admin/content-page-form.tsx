import Link from "next/link";
import { upsertContentPage } from "@/lib/admin-actions";
import { SubmitButton } from "@/components/submit-button";
import { ALL_LOCALES, LOCALE_LABELS } from "@/lib/localized-form";

const TRANSLATING_LOCALE_NAMES = ALL_LOCALES.filter((l) => l !== "fr").map((l) => LOCALE_LABELS[l]);
import { ProductsEditor } from "@/components/products-editor";
import { ImageUploader } from "@/components/image-uploader";
import { MapSectionToggle } from "@/components/admin/map-section-toggle";
import { MapPointsEditor } from "@/components/admin/map-points-editor";

type ContentPage = {
  id: number;
  section: string;
  slug: string;
  title: Record<string, string>;
  body: Record<string, string>;
  coverImage: string | null;
  prices?: { name: Record<string, string>; price: number | null; category: Record<string, string> | null }[] | null;
  mapEnabled?: boolean | null;
  mapPoints?: { label: string; lat: number; lng: number }[] | null;
};

type CustomSection = { slug: string; name: Record<string, string> };

const inputClass =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export function ContentPageForm({
  locale,
  page,
  customSections = [],
}: {
  locale: string;
  page?: ContentPage;
  customSections?: CustomSection[];
}) {
  return (
    <form action={upsertContentPage} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {page && <input type="hidden" name="id" value={page.id} />}
      {page && <input type="hidden" name="slug" value={page.slug} />}

      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className={labelClass}>Section</label>
          <Link href={`/${locale}/admin/sections/new`} className="text-xs font-medium text-azur hover:underline">
            + Créer une nouvelle section
          </Link>
        </div>
        <select name="section" defaultValue={page?.section ?? "assistance-guides"} className={inputClass}>
          <option value="assistance-guides">Assistance — Guides pratiques</option>
          {customSections.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name.fr}
            </option>
          ))}
        </select>
      </div>

      <p className="rounded-lg bg-ocean-dark/5 px-3 py-2 text-xs text-foreground/60">
        Rédigez en français : les autres langues du site seront automatiquement retraduites lors de l&apos;enregistrement.
      </p>

      <div>
        <label className={labelClass}>Titre</label>
        <input name="title" defaultValue={page?.title.fr} className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>Contenu</label>
        <textarea name="body" defaultValue={page?.body.fr} rows={8} className={inputClass} />
      </div>

      <ImageUploader
        label="Image de couverture"
        fieldName="coverImage"
        max={1}
        defaultImages={page?.coverImage ? [page.coverImage] : []}
        unsupportedFormatText='Format non supporté (souvent des photos iPhone en HEIC). Réglages > Appareil photo > Formats > "Le plus compatible", puis reprenez la photo — ou choisissez une photo déjà au format JPEG/PNG.'
      />

      <div>
        <label className={labelClass}>Tarifs (facultatif)</label>
        <p className="mb-2 text-xs text-foreground/50">
          Ex : plusieurs tarifs différents (jour/nuit, par destination...). La catégorie permet de les regrouper
          (ex : &quot;Jour&quot; / &quot;Nuit&quot;).
        </p>
        <ProductsEditor
          name="prices"
          defaultProducts={(page?.prices ?? []).map((p) => ({
            name: p.name.fr,
            price: p.price,
            category: p.category?.fr ?? null,
          }))}
          namePlaceholder="Ex : Centre-ville"
          pricePlaceholder="Prix (DH)"
          categoryPlaceholder="Jour / Nuit"
          addLabel="Ajouter un tarif"
          scanLabel="Scanner un document"
          scanningLabel="Analyse en cours..."
          scanHint="Vous pouvez aussi prendre en photo une liste de tarifs déjà imprimée."
          scanErrorText="L'analyse a échoué. Veuillez réessayer."
          scanSuccessTemplate="{count} tarif(s) ajouté(s)."
        />
      </div>

      <MapSectionToggle label="Afficher une carte sur cette page" defaultEnabled={!!page?.mapEnabled}>
        <MapPointsEditor
          name="mapPoints"
          defaultPoints={page?.mapPoints ?? []}
          labelPlaceholder="Nom du point (ex : Station Bab Sbaa)"
          addressPlaceholder="Rechercher une adresse..."
          addLabel="Ajouter un point"
          notLocatedText="Non localisé"
          missingKeyText="Carte indisponible : clé API Google Maps non configurée."
          errorText="Impossible de charger Google Maps."
          dragHint="Faites glisser un repère sur la carte pour ajuster précisément sa position."
        />
      </MapSectionToggle>

      <SubmitButton
        label="Enregistrer"
        pendingLabel="Traduction et enregistrement en cours..."
        translatingLocales={TRANSLATING_LOCALE_NAMES}
      />
    </form>
  );
}
