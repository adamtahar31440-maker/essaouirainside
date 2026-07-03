"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

type LocaleStatus = "pending" | "loading" | "done" | "error";

export function ProFicheForm({
  action,
  translatingLocales,
  saveLabel,
  savePendingLabel,
  saveErrorLabel,
  locale,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  translatingLocales: { code: string; name: string }[];
  saveLabel: string;
  savePendingLabel: string;
  saveErrorLabel: string;
  locale: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [statuses, setStatuses] = useState<LocaleStatus[]>(() =>
    translatingLocales.map(() => "pending")
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current || saving) return;

    setSaving(true);
    setSaveError(false);
    setStatuses(translatingLocales.map(() => "pending"));

    const formData = new FormData(formRef.current);
    const name = String(formData.get("name") ?? "");
    const description = String(formData.get("description") ?? "");
    const hours = String(formData.get("hours") ?? "");
    let productsInput: { name: string; category: string | null }[] = [];
    try {
      productsInput = JSON.parse(String(formData.get("products") ?? "[]"));
    } catch {
      productsInput = [];
    }

    const fields: Record<string, string> = { name, description, hours };
    productsInput.forEach((p, i) => {
      if (p.name) fields[`product_${i}`] = p.name;
      if (p.category) fields[`category_${i}`] = p.category;
    });

    // Translate one language at a time so the checklist below reflects what the
    // server has actually finished, not a simulated timer.
    const allTranslations: Record<string, Record<string, string>> = {};
    for (let i = 0; i < translatingLocales.length; i++) {
      const locale = translatingLocales[i].code;
      setStatuses((prev) => prev.map((s, idx) => (idx === i ? "loading" : s)));
      try {
        const res = await fetch("/api/pro/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields, locale }),
        });
        const data = res.ok ? await res.json() : { translations: {} };
        allTranslations[locale] = data.translations ?? {};
        setStatuses((prev) => prev.map((s, idx) => (idx === i ? "done" : s)));
      } catch {
        allTranslations[locale] = {};
        setStatuses((prev) => prev.map((s, idx) => (idx === i ? "error" : s)));
      }
    }

    formData.set("translations", JSON.stringify(allTranslations));

    // The server action no longer redirects itself: calling it directly (instead of
    // through a native <form action> submission) doesn't get Next's automatic
    // redirect-interception, which left the button stuck on "saving" forever even
    // though the save had actually gone through. We navigate ourselves once it
    // resolves, and surface a real error instead of hanging if it throws.
    try {
      await action(formData);
      // Navigating to the same route (just adding ?updated=1) doesn't necessarily
      // remount this component, so its local "saving" state must be reset explicitly
      // here — it was previously only reset in the catch branch, leaving the button
      // stuck on "saving" forever even though the save had already succeeded.
      setSaving(false);
      router.push(`/${locale}/pro?updated=1`);
      router.refresh();
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError(true);
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {children}
      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? savePendingLabel : saveLabel}
        </button>
        {saveError && !saving && (
          <p className="mt-2 text-xs font-medium text-red-600">{saveErrorLabel}</p>
        )}
        {saving && (
          <div className="mt-3 space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-1/3 rounded-full bg-ocean-dark animate-progress-slide" />
            </div>
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
              {translatingLocales.map((l, i) => (
                <li
                  key={l.code}
                  className={
                    "flex items-center gap-1 " +
                    (statuses[i] === "done" ? "text-foreground" : "text-foreground/40")
                  }
                >
                  {statuses[i] === "done" ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : statuses[i] === "loading" ? (
                    <Loader2 size={12} className="animate-spin text-ocean-dark" />
                  ) : statuses[i] === "error" ? (
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-black/20" />
                  )}
                  {l.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </form>
  );
}
