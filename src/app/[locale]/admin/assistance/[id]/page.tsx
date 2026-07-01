import { notFound } from "next/navigation";
import { adminGetEmergencyContactById } from "@/lib/admin-data";
import { EmergencyContactForm } from "@/components/admin/emergency-contact-form";

export default async function EditEmergencyContactPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const contact = await adminGetEmergencyContactById(Number(id));
  if (!contact) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Modifier : {contact.name.fr}</h1>
      <EmergencyContactForm locale={locale} contact={contact} />
    </div>
  );
}
