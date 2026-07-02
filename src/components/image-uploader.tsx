"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { X, Loader2 } from "lucide-react";

type UploadItem = { id: string; url: string; uploading: boolean; error?: string };

export function ImageUploader({ label, hint }: { label: string; hint?: string }) {
  const [items, setItems] = useState<UploadItem[]>([]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const pending = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      uploading: true,
    }));
    setItems((prev) => [...prev, ...pending]);

    await Promise.all(
      files.map(async (file, i) => {
        const item = pending[i];
        try {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload/image",
          });
          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, url: blob.url, uploading: false } : it)));
        } catch {
          setItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, uploading: false, error: "Échec de l'envoi" } : it))
          );
        }
      })
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const readyUrls = items.filter((it) => !it.uploading && !it.error).map((it) => it.url);

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-foreground/60">{label}</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-ocean-dark file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-ocean"
      />
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
      <input type="hidden" name="images" value={readyUrls.join("\n")} readOnly />

      {items.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((it) => (
            <div key={it.id} className="relative aspect-square overflow-hidden rounded-lg border border-black/10 bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.url} alt="" className="h-full w-full object-cover" />
              {it.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
              )}
              {it.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-600/70 p-1 text-center text-[10px] text-white">
                  {it.error}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
