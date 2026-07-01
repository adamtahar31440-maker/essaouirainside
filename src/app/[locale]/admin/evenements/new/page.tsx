import { EventForm } from "@/components/admin/event-form";

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Nouvel événement</h1>
      <EventForm locale={locale} />
    </div>
  );
}
