import { EmergencyContactForm } from "@/components/admin/emergency-contact-form";

export default async function NewEmergencyContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Nouveau contact d&apos;urgence</h1>
      <EmergencyContactForm locale={locale} />
    </div>
  );
}
