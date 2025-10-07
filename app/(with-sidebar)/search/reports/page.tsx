import { readReports } from "@/lib/data/reports";
import SearchReportsClient from "@/components/client-pages/SearchReportsClient";

/**
 * This is the server component for the Reports search page.
 * It fetches the initial report data and passes it to the client component for rendering.
 */
export default async function SearchReportsPage() {
  const { data, count } = await readReports();

  const totalPages = Math.ceil((count || 0) / 10); // A page shows 10 reports, both for mobile and desktop.

  return (
    <SearchReportsClient initialReports={data || []} totalPages={totalPages} />
  );
}
