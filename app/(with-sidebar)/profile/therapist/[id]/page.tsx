export default async function TherapistProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return <div>Therapist Profile Page - ID: {params.id}</div>;
}
