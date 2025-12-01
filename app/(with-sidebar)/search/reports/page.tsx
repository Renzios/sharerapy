import { readReports } from "@/lib/data/reports";
import { readLanguages } from "@/lib/data/languages";
import { readCountries } from "@/lib/data/countries";
import { readClinics } from "@/lib/data/clinics";
import { readTypes } from "@/lib/data/types";
import { readTherapists } from "@/lib/data/therapists";
import { readPatients } from "@/lib/data/patients";
import SearchReportsClient from "@/components/client-pages/search/SearchReportsClient";

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
    p?: string;
    sort?: string;
    language?: string;
    country?: string;
    types?: string;
    clinic?: string;
    startDate?: string;
    endDate?: string;
    therapist?: string;
    patient?: string;
  }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const currentPage = Number(params.p) || 1;
  const sortQuery = params.sort || "dateDescending";

  const { column, ascending } = getSortParams(sortQuery);

  const languageID = params.language ? Number(params.language) : undefined;
  const countryID = params.country ? Number(params.country) : undefined;
  const clinicID = params.clinic ? Number(params.clinic) : undefined;
  const therapistID = params.therapist || undefined;
  const patientID = params.patient || undefined;
  const startDate = params.startDate || undefined;
  const endDate = params.endDate || undefined;

  const typeIDs = params.types
    ? params.types
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined;

  const [
    { data, count },
    languages,
    countries,
    clinics,
    types,
    { data: therapists },
    { data: patients },
  ] = await Promise.all([
    readReports({
      search: searchQuery,
      page: currentPage - 1,
      pageSize: REPORTS_PER_PAGE,
      column: column,
      ascending: ascending,
      languageID,
      countryID,
      clinicID,
      typeIDs,
      therapistID,
      patientID,
      startDate,
      endDate,
    }),
    readLanguages(),
    readCountries(),
    readClinics(),
    readTypes(),
    readTherapists({ pageSize: 1000 }),
    readPatients({ pageSize: 1000 }),
  ]);

  const totalPages = Math.ceil((count || 0) / REPORTS_PER_PAGE);

  // Format Options
  const languageOptions = languages.map((l) => ({
    value: String(l.id),
    label: l.language,
  }));
  const countryOptions = countries.map((c) => ({
    value: String(c.id),
    label: c.country,
  }));
  const clinicOptions = clinics.map((c) => ({
    value: String(c.id),
    label: c.clinic,
  }));
  const typeOptions = types.map((t) => ({
    value: String(t.id),
    label: t.type,
  }));

  const therapistOptions = (therapists || []).map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const patientOptions = (patients || []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <SearchReportsClient
      initialReports={data || []}
      totalPages={totalPages}
      initialSearchTerm={searchQuery}
      languageOptions={languageOptions}
      countryOptions={countryOptions}
      clinicOptions={clinicOptions}
      typeOptions={typeOptions}
      therapistOptions={therapistOptions}
      patientOptions={patientOptions}
    />
  );
}
