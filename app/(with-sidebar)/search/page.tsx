import { readPatients } from "@/lib/data/patients";
import { readReports } from "@/lib/data/reports";
import { readTherapists } from "@/lib/data/therapists";
import SearchAllClient from "@/components/client-pages/SearchAllClient";

/**
 * This is the server component for the main Search page.
 * It fetches a fixed number of patients (4), reports (2), and therapists (5)
 * and passes them to the client component for rendering.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";

  const [
    { data: patientsData },
    { data: reportsData },
    { data: therapistsData },
  ] = await Promise.all([
    readPatients({
      page: 0,
      pageSize: 4,
      search: searchQuery,
    }),
    readReports({
      page: 0,
      pageSize: 2,
      search: searchQuery,
    }),
    readTherapists({
      page: 0,
      pageSize: 5,
      search: searchQuery,
    }),
  ]);

  return (
    <SearchAllClient
      initialPatients={patientsData || []}
      initialReports={reportsData || []}
      initialTherapists={therapistsData || []}
      initialSearchTerm={searchQuery}
    />
  );
}
