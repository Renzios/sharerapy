import { readReports } from "@/lib/data/reports";
import SearchReportsClient from "@/components/client-pages/SearchReportsClient";

const REPORTS_PER_PAGE = 10;

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

export default async function SearchReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    success?: string;
    deleted?: string;
    p?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const showSuccessToast = params.success === "true";
  const showDeletedToast = params.deleted === "true";
  const currentPage = Number(params.p) || 1;
  const sortQuery = params.sort || "dateDescending";

  const { column, ascending } = getSortParams(sortQuery);

  const { data, count } = await readReports({
    search: searchQuery,
    page: currentPage - 1,
    pageSize: REPORTS_PER_PAGE,
    column: column,
    ascending: ascending,
  });

  const totalPages = Math.ceil((count || 0) / REPORTS_PER_PAGE);

  return (
    <SearchReportsClient
      initialReports={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
      showSuccessToast={showSuccessToast}
      showDeletedToast={showDeletedToast}
    />
  );
}
