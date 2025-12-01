import { readTherapists } from "@/lib/data/therapists";
import { readClinics } from "@/lib/data/clinics";
import { readCountries } from "@/lib/data/countries";
import SearchTherapistClient from "@/components/client-pages/search/SearchTherapistClient";

const THERAPISTS_PER_PAGE = 20;

export default async function SearchTherapistsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    p?: string;
    sort?: string;
    clinic?: string;
    country?: string;
  }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const currentPage = Number(params.p) || 1;
  const sortQuery = params.sort || "nameAscending";

  const clinicFilter = params.clinic || undefined;
  const countryFilter = params.country || undefined;

  const isAscending = sortQuery === "nameAscending";

  const [{ data, count }, clinics, countries] = await Promise.all([
    readTherapists({
      search: searchQuery,
      page: currentPage - 1,
      pageSize: THERAPISTS_PER_PAGE,
      ascending: isAscending,
      clinicID: clinicFilter ? Number(clinicFilter) : undefined,
      countryID: countryFilter ? Number(countryFilter) : undefined,
    }),
    readClinics(),
    readCountries(),
  ]);

  const totalPages = Math.ceil((count || 0) / THERAPISTS_PER_PAGE);

  const clinicOptions = clinics.map((c) => ({
    value: String(c.id),
    label: c.clinic,
  }));

  const countryOptions = countries.map((c) => ({
    value: String(c.id),
    label: c.country,
  }));

  return (
    <SearchTherapistClient
      initialTherapists={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
      clinicOptions={clinicOptions}
      countryOptions={countryOptions}
    />
  );
}
