"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { ALL_LOCALES, LOCALE_LABELS } from "@/lib/localized-form";
import { PRO_FORM_STRINGS } from "@/lib/pro-form-i18n";
import { PRICE_LEVELS, priceLevelLabel } from "@/lib/labels";
import { AddressLocationPicker } from "@/components/address-location-picker";
import { CategorySubcategoryPicker } from "@/components/category-subcategory-picker";
import { ImageUploader } from "@/components/image-uploader";
import { PhoneField } from "@/components/phone-field";
import { SubmitButton } from "@/components/submit-button";

const RTL_LOCALES = ["ar", "he"];

const inputClass = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export function ProApplicationForm({
  action,
  categories,
  subcategoriesByCategory,
  defaultLocale,
}: {
  action: (formData: FormData) => void;
  categories: { id: number; name: Record<string, string> }[];
  subcategoriesByCategory: Record<number, { slug: string; name: Record<string, string> }[]>;
  defaultLocale: string;
}) {
  const [lang, setLang] = useState(ALL_LOCALES.includes(defaultLocale) ? defaultLocale : "fr");
  const t = PRO_FORM_STRINGS[lang] ?? PRO_FORM_STRINGS.fr;
  const dir = RTL_LOCALES.includes(lang) ? "rtl" : "ltr";

  const nameRef = useRef<HTMLInputElement>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerateDescription() {
    const keywords = descriptionRef.current?.value.trim() ?? "";
    if (!keywords) {
      setGenerateError(t.generateDescriptionEmptyError);
      return;
    }
    setGeneratingDescription(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/pro/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          locale: lang,
          name: nameRef.current?.value || undefined,
          category: categorySelectRef.current?.selectedOptions[0]?.text || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.description) throw new Error(data.error ?? "Generation failed");
      if (descriptionRef.current) descriptionRef.current.value = data.description;
    } catch (err) {
      console.error("AI description generation failed:", err);
      setGenerateError(t.generateDescriptionError);
    } finally {
      setGeneratingDescription(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-ocean-dark">{t.heading}</h1>
      <p className="mb-6 text-sm text-foreground/60">{t.intro}</p>
      <form
        action={action}
        dir={dir}
        className="max-w-2xl space-y-6 rounded-2xl border border-black/5 bg-white p-6"
      >
        <div className="rounded-xl border border-ocean-dark/20 bg-ocean-dark/5 p-4">
          <label className={labelClass}>{t.langLabel}</label>
          <select
            name="sourceLocale"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className={inputClass}
          >
            {ALL_LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABELS[l]}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-foreground/60">{t.langHint}</p>
        </div>

        <div>
          <label className={labelClass}>{t.contactName}</label>
          <input name="contactName" className={inputClass} required />
        </div>

        <CategorySubcategoryPicker
          categories={categories}
          subcategoriesByCategory={subcategoriesByCategory}
          locale={lang}
          categoryRef={categorySelectRef}
          categoryLabel={t.category}
          subcategoryLabel={t.subcategory}
        />

        <div>
          <label className={labelClass}>{t.name}</label>
          <input name="name" ref={nameRef} className={inputClass} required dir={dir} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className={labelClass}>{t.description}</label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generatingDescription}
              className="flex shrink-0 items-center gap-1 rounded-full bg-ocean-dark/10 px-3 py-1 text-xs font-semibold text-ocean-dark hover:bg-ocean-dark/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingDescription ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              {generatingDescription ? t.generateDescriptionButtonPending : t.generateDescriptionButton}
            </button>
          </div>
          <textarea
            name="description"
            ref={descriptionRef}
            rows={4}
            placeholder={t.generateDescriptionPlaceholder}
            className={inputClass}
            dir={dir}
          />
          {generateError && <p className="mt-1 text-xs font-medium text-red-600">{generateError}</p>}
        </div>

        <div>
          <label className={labelClass}>{t.address}</label>
          <AddressLocationPicker className={inputClass} dir={dir} />
          <p className="mt-1 text-xs text-foreground/50">{t.addressHint}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>{t.phone}</label>
            <PhoneField name="phone" dir={dir} />
          </div>
          <div>
            <label className={labelClass}>{t.whatsapp}</label>
            <PhoneField name="whatsapp" dir={dir} />
          </div>
          <div>
            <label className={labelClass}>{t.website}</label>
            <input name="website" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t.priceLevel}</label>
          <select name="priceLevel" defaultValue="€€" className={inputClass}>
            {PRICE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {priceLevelLabel(level)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-foreground/50">{t.priceLevelHint}</p>
        </div>

        <div>
          <label className={labelClass}>{t.fieldAmenities}</label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input type="checkbox" name="wifi" /> {t.amenityWifi}
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input type="checkbox" name="parking" /> {t.amenityParking}
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input type="checkbox" name="pool" /> {t.amenityPool}
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input type="checkbox" name="airConditioning" /> {t.amenityAirConditioning}
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input type="checkbox" name="accessibility" /> {t.amenityAccessibility}
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input type="checkbox" name="petsAllowed" /> {t.amenityPetsAllowed}
            </label>
          </div>
        </div>

        <ImageUploader label={t.images} hint={t.imagesHint} unsupportedFormatText={t.imagesUnsupportedFormat} />

        <SubmitButton label={t.submit} pendingLabel={t.submitPending} />
      </form>
    </div>
  );
}
