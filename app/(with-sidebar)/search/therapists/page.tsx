import { readTherapists } from "@/lib/data/therapists";
import SearchTherapistsClient from "@/components/client-pages/SearchTherapistClient";

/**
 * This is the server component for the Therapists search page.
 * It fetches the initial therapist data and passes it to the client component for rendering.
 */
export default async function SearchTherapistsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";

  const { data, count } = await readTherapists({ search: searchQuery });

  const totalPages = Math.ceil((count || 0) / 20); // A page shows 20 therapists, both for mobile and desktop.

  return (
    <SearchTherapistsClient
      initialTherapists={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
    />
  );
}
