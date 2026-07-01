import { notFound } from "next/navigation";
import { adminGetRealEstateById } from "@/lib/admin-data";
import { RealEstateForm } from "@/components/admin/real-estate-form";

export default async function EditRealEstatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const listing = await adminGetRealEstateById(Number(id));
  if (!listing) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Modifier : {listing.title.fr}</h1>
      <RealEstateForm locale={locale} listing={listing} />
    </div>
  );
}
