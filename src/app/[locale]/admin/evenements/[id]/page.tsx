import { notFound } from "next/navigation";
import { adminGetEventById } from "@/lib/admin-data";
import { EventForm } from "@/components/admin/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const event = await adminGetEventById(Number(id));
  if (!event) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ocean-dark">Modifier : {event.title.fr}</h1>
      <EventForm locale={locale} event={event} />
    </div>
  );
}
