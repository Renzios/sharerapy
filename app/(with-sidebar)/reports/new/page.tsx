import { readPatients } from "@/lib/data/patients";
import { readCountries } from "@/lib/data/countries";
import { readLanguages } from "@/lib/data/languages";
import { readTypes } from "@/lib/data/types";
import CreateNewReportClient from "@/components/client-pages/CreateNewReportClient";

// Opt out of static generation - this page needs runtime data from Supabase
export const dynamic = "force-dynamic";

/**
 * This is the server component for the Create New Report page.
 * It fetches all the necessary options (Existing Patients, Countries, Languages, Types (Therapy)) and passed it into the client component.
 */
export default async function CreateNewReportPage() {
  const [patients, countries, languages, types] = await Promise.all([
    readPatients({ pageSize: 1000 }), // Hardcoded rn, don't know if theres a better way than a large arbitrary number right now
    readCountries(),
    readLanguages(),
    readTypes(),
  ]);

  // Transform data into options for Select components

  const patientOptions =
    patients.data?.map((patient) => ({
      value: patient.id,
      label: `${patient.first_name} ${patient.last_name}`,
    })) || [];

  const countryOptions = countries.map((country) => ({
    value: country.id.toString(),
    label: country.country,
  }));

  const languageOptions = languages.map((language) => ({
    value: language.id.toString(),
    label: language.language,
  }));

  const typeOptions = types.map((type) => ({
    value: type.id.toString(),
    label: type.type,
  }));

  return (
    <CreateNewReportClient
      patients={patients.data || []}
      patientOptions={patientOptions}
      countryOptions={countryOptions}
      languageOptions={languageOptions}
      typeOptions={typeOptions}
    />
  );
}
