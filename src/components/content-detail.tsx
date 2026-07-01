import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ContentDetail({
  locale,
  backHref,
  backLabel,
  title,
  body,
  coverImage,
}: {
  locale: string;
  backHref: string;
  backLabel: string;
  title: string;
  body: string;
  coverImage?: string | null;
}) {
  return (
    <div>
      {coverImage && (
        <div className="relative h-64 w-full overflow-hidden bg-sand sm:h-96">
          <Image src={coverImage} alt={title} fill className="object-cover" priority />
        </div>
      )}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href={backHref} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-azur hover:underline">
          <ArrowLeft size={16} /> {backLabel}
        </Link>
        <h1 className="text-3xl font-semibold text-ocean-dark sm:text-4xl">{title}</h1>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-foreground/80">{body}</p>
      </div>
    </div>
  );
}
