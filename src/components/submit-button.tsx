"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

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
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-1/3 rounded-full bg-ocean-dark animate-progress-slide" />
        </div>
      )}
    </div>
  );
}
