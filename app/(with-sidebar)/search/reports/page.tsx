import { readReports } from "@/lib/data/reports";
import SearchReportsClient from "@/components/client-pages/SearchReportsClient";

/**
 * This is the server component for the Reports search page.
 * It fetches the initial report data and passes it to the client component for rendering.
 */
export default async function SearchReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; success?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const showSuccessToast = params.success === "true";

  const { data, count } = await readReports({ search: searchQuery });

  const totalPages = Math.ceil((count || 0) / 10); // A page shows 10 reports, both for mobile and desktop.

  return (
    <SearchReportsClient
      initialReports={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
      showSuccessToast={showSuccessToast}
    />
  );
}
