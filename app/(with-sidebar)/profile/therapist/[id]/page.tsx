export default async function TherapistProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; p?: string }>;
}) {
  return <div>Therapist Profile Page</div>;
}
