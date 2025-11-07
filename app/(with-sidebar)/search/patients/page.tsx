import { readPatients } from "@/lib/data/patients";
import SearchPatientsClient from "@/components/client-pages/SearchPatientsClient";

// Opt out of static generation - this page needs runtime data from Supabase
export const dynamic = "force-dynamic";

const PATIENTS_PER_PAGE = 20;

export default async function SearchPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const currentPage = Number(params.p) || 1;
  const sortQuery = params.sort || "nameAscending"; // Default sort

  const isAscending = sortQuery === "nameAscending";

  const { data, count } = await readPatients({
    search: searchQuery,
    page: currentPage - 1,
    pageSize: PATIENTS_PER_PAGE,
    ascending: isAscending,
  });

  const totalPages = Math.ceil((count || 0) / PATIENTS_PER_PAGE);

  return (
    <SearchPatientsClient
      initialPatients={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
    />
  );
}
