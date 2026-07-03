"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";

// Translation itself happens server-side in a handful of batched API calls, not one
// call per language, so this step-through is a simulated (not literally real-time)
// indicator — its purpose is purely to reassure the pro that the save is progressing
// language by language and hasn't frozen, so they don't navigate away mid-save.
const STEP_INTERVAL_MS = 700;

export function SubmitButton({
  label,
  pendingLabel,
  translatingLocales,
}: {
  label: string;
  pendingLabel: string;
  translatingLocales?: string[];
}) {
  const { pending } = useFormStatus();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!pending) {
      setStep(0);
      return;
    }
    if (!translatingLocales || translatingLocales.length === 0) return;
    const interval = setInterval(() => {
      setStep((s) => (s < translatingLocales.length - 1 ? s + 1 : s));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pending, translatingLocales]);

  return (
    <div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ocean-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? pendingLabel : label}
      </button>
      {pending && (
        <div className="mt-3 space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
            <div className="h-full w-1/3 rounded-full bg-ocean-dark animate-progress-slide" />
          </div>
          {translatingLocales && translatingLocales.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
              {translatingLocales.map((name, i) => (
                <li
                  key={name}
                  className={
                    "flex items-center gap-1 " +
                    (i <= step ? "text-foreground" : "text-foreground/40")
                  }
                >
                  {i < step ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : i === step ? (
                    <Loader2 size={12} className="animate-spin text-ocean-dark" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-black/20" />
                  )}
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
