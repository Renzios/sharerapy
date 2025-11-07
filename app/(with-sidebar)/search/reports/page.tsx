import { readReports } from "@/lib/data/reports";
import SearchReportsClient from "@/components/client-pages/SearchReportsClient";

// Opt out of static generation - this page needs runtime data from Supabase
export const dynamic = "force-dynamic";

const REPORTS_PER_PAGE = 10; // Define page size

// --- ADDED THESE ---
const reportSortOptions = [
  { value: "titleAscending", label: "Sort by: Title (A-Z)" },
  { value: "titleDescending", label: "Sort by: Title (Z-A)" },
  { value: "dateAscending", label: "Sort by: Date (Oldest First)" },
  { value: "dateDescending", label: "Sort by: Date (Newest First)" },
];

const getSortParams = (
  optionValue: string
): { column: "title" | "created_at"; ascending: boolean } => {
  switch (optionValue) {
    case "titleAscending":
      return { column: "title", ascending: true };
    case "titleDescending":
      return { column: "title", ascending: false };
    case "dateAscending":
      return { column: "created_at", ascending: true };
    case "dateDescending":
      return { column: "created_at", ascending: false };
    default:
      return { column: "created_at", ascending: false };
  }
};
// --- END OF ADDED CODE ---

/**
 * This is the server component for the Reports search page.
 * It fetches the initial report data and passes it to the client component for rendering.
 */
export default async function SearchReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    success?: string;
    p?: string;
    sort?: string; // <-- 1. Accept 'sort' param
  }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const showSuccessToast = params.success === "true";
  const currentPage = Number(params.p) || 1;
  const sortQuery = params.sort || "dateDescending"; // <-- 2. Read 'sort' param

  const { column, ascending } = getSortParams(sortQuery); // <-- 3. Get sort params

  const { data, count } = await readReports({
    search: searchQuery,
    page: currentPage - 1,
    pageSize: REPORTS_PER_PAGE,
    column: column, // <-- 4. Use for fetch
    ascending: ascending, // <-- 5. Use for fetch
  });

  const totalPages = Math.ceil((count || 0) / REPORTS_PER_PAGE);

  return (
    <SearchReportsClient
      initialReports={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
      showSuccessToast={showSuccessToast}
    />
  );
}
