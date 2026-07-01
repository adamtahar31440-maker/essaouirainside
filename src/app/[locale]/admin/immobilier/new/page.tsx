import { RealEstateForm } from "@/components/admin/real-estate-form";

export default async function NewRealEstatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Nouvelle annonce immobilière</h1>
      <RealEstateForm locale={locale} />
    </div>
  );
}
