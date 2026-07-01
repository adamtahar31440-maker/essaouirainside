import { notFound } from "next/navigation";
import { adminGetEstablishmentById, getAllCategories } from "@/lib/admin-data";
import { EstablishmentForm } from "@/components/admin/establishment-form";

export default async function EditEstablishmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [establishment, categories] = await Promise.all([
    adminGetEstablishmentById(Number(id)),
    getAllCategories(),
  ]);
  if (!establishment) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">
        Modifier : {establishment.name.fr}
      </h1>
      <EstablishmentForm locale={locale} categories={categories} establishment={establishment} />
    </div>
  );
}
