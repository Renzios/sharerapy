import { readPatients } from "@/lib/data/patients";
import SearchPatientsClient from "@/components/client-pages/SearchPatientsClient";

/**
 * This is the server component for the Patients search page.
 * It fetches the initial patient data and passes it to the client component for rendering.
 */
export default async function SearchPatientsPage() {
  const { data, count } = await readPatients();

  const totalPages = Math.ceil((count || 0) / 20); // A page shows 20 patients, both for mobile and desktop.

  return (
    <SearchPatientsClient
      initialPatients={data || []}
      totalPages={totalPages}
    />
  );
}
