import { readPatients } from "@/lib/data/patients";
import { readCountries } from "@/lib/data/countries"; // <--- Import this
import SearchPatientsClient from "@/components/client-pages/SearchPatientsClient";

const PATIENTS_PER_PAGE = 20;

export default async function SearchPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    p?: string;
    sort?: string;
    country?: string;
    sex?: string;
  }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const currentPage = Number(params.p) || 1;
  const sortQuery = params.sort || "nameAscending";

  const countryFilter = params.country || undefined;
  const sexFilter =
    params.sex === "Male" || params.sex === "Female" ? params.sex : undefined;

  const isAscending = sortQuery === "nameAscending";

  const [{ data, count }, countries] = await Promise.all([
    readPatients({
      search: searchQuery,
      page: currentPage - 1,
      pageSize: PATIENTS_PER_PAGE,
      ascending: isAscending,
      countryID: countryFilter ? Number(countryFilter) : undefined,
      sex: sexFilter,
    }),
    readCountries(),
  ]);

  const totalPages = Math.ceil((count || 0) / PATIENTS_PER_PAGE);

  const countryOptions = countries.map((c) => ({
    value: String(c.id),
    label: c.country,
  }));

  return (
    <SearchPatientsClient
      initialPatients={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
      countryOptions={countryOptions}
    />
  );
}
