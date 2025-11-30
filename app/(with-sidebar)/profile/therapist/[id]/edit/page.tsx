/* NextJS */
import { notFound } from "next/navigation";

/* Data */
import { readTherapist } from "@/lib/data/therapists";

/* Components */
import EditTherapistProfileClient from "@/components/client-pages/EditTherapistProfileClient";

export default async function TherapistEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const therapist = await readTherapist(id);

  if (!therapist) {
    notFound();
  }

  return <EditTherapistProfileClient therapist={therapist} />;
}
