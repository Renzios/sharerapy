import { readTherapists } from "@/lib/data/therapists";
import SearchTherapistsClient from "@/components/client-pages/SearchTherapistClient";

// Opt out of static generation - this page needs runtime data from Supabase
export const dynamic = "force-dynamic";

const THERAPISTS_PER_PAGE = 20;

/**
 * This is the server component for the Therapists search page.
 * It fetches the initial therapist data and passes it to the client component for rendering.
 */
export default async function SearchTherapistsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const currentPage = Number(params.p) || 1;
  const sortQuery = params.sort || "nameAscending"; // Default sort

  const isAscending = sortQuery === "nameAscending";

  const { data, count } = await readTherapists({
    search: searchQuery,
    page: currentPage - 1,
    pageSize: THERAPISTS_PER_PAGE,
    ascending: isAscending,
  });

  const totalPages = Math.ceil((count || 0) / THERAPISTS_PER_PAGE);

  return (
    <SearchTherapistsClient
      initialTherapists={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
    />
  );
}
