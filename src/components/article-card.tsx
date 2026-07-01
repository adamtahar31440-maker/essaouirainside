import Image from "next/image";
import Link from "next/link";

export function ArticleCard({
  href,
  title,
  excerpt,
  image,
  category,
}: {
  href: string;
  title: string;
  excerpt?: string;
  image?: string | null;
  category?: string;
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>
      <div className="p-4">
        {category && (
          <p className="text-xs font-semibold uppercase tracking-wide text-azur">{category}</p>
        )}
        <h3 className="mt-1 text-base font-semibold text-ocean-dark">{title}</h3>
        {excerpt && <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{excerpt}</p>}
      </div>
    </Link>
  );
}
