import { readPatients } from "@/lib/data/patients";
import { readReports } from "@/lib/data/reports";
import { readTherapists } from "@/lib/data/therapists";
import SearchAllClient from "@/components/client-pages/SearchAllClient";

/**
 * This is the server component for the main Search page.
 * It fetches a fixed number of patients (4), reports (2), and therapists (5)
 * and passes them to the client component for rendering.
 */
export default async function SearchPage() {
  // Fetch 4 patients
  const { data: patientsData } = await readPatients({ page: 0, pageSize: 4 });

  // Fetch 2 reports
  const { data: reportsData } = await readReports({ page: 0, pageSize: 2 });

  // Fetch 5 therapists
  const { data: therapistsData } = await readTherapists({
    page: 0,
    pageSize: 5,
  });

  return (
    <SearchAllClient
      initialPatients={patientsData || []}
      initialReports={reportsData || []}
      initialTherapists={therapistsData || []}
    />
  );
}
