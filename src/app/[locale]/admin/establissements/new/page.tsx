import { getAllCategories, adminGetProfessionals, adminGetSubcategories } from "@/lib/admin-data";
import { EstablishmentForm } from "@/components/admin/establishment-form";

export default async function NewEstablishmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [categories, professionals] = await Promise.all([getAllCategories(), adminGetProfessionals()]);
  const subcategoriesByCategory = Object.fromEntries(
    await Promise.all(categories.map(async (c) => [c.id, await adminGetSubcategories(c.id)]))
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Nouvel établissement</h1>
      <EstablishmentForm
        locale={locale}
        categories={categories}
        subcategoriesByCategory={subcategoriesByCategory}
        professionals={professionals}
      />
    </div>
  );
}
