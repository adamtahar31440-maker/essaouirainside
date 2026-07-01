import { getSiteSettings } from "@/lib/admin-data";
import { updateSiteSettings } from "@/lib/admin-actions";

const inputClass = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ocean-dark";
const labelClass = "mb-1 block text-xs font-semibold text-foreground/60";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  async function save(formData: FormData) {
    "use server";
    await updateSiteSettings({
      siteName: String(formData.get("siteName") ?? "Essaouira Inside"),
      logoUrl: String(formData.get("logoUrl") ?? ""),
      primaryColor: String(formData.get("primaryColor") ?? ""),
      secondaryColor: String(formData.get("secondaryColor") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Paramètres</h1>

      <form action={save} className="max-w-2xl space-y-6 rounded-2xl border border-black/5 bg-white p-6">
        <div>
          <label className={labelClass}>Nom du site</label>
          <input name="siteName" defaultValue={settings?.siteName ?? "Essaouira Inside"} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>URL du logo</label>
          <input name="logoUrl" defaultValue={settings?.logoUrl ?? ""} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Couleur principale</label>
            <input type="color" name="primaryColor" defaultValue={settings?.primaryColor ?? "#17495e"} className="h-10 w-full rounded-lg border border-black/10" />
          </div>
          <div>
            <label className={labelClass}>Couleur secondaire</label>
            <input type="color" name="secondaryColor" defaultValue={settings?.secondaryColor ?? "#bf6a45"} className="h-10 w-full rounded-lg border border-black/10" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email de contact</label>
          <input name="contactEmail" type="email" defaultValue={settings?.contactEmail ?? ""} className={inputClass} />
        </div>
        <button type="submit" className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean">
          Enregistrer
        </button>
      </form>

      <div className="mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-semibold text-amber-800">Intégrations tierces</p>
        <p className="mt-1 text-sm text-amber-700">
          SMTP (emails), Stripe, PayPal, Google Maps, Google Analytics, Search Console et Cloudflare nécessitent
          tes propres clés API. Donne-les-moi quand tu es prêt et je les connecte comme variables d&apos;environnement
          Vercel — je ne les stocke jamais dans le code ni la base de données.
        </p>
      </div>
    </div>
  );
}
