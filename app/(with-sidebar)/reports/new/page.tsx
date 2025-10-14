import { readPatients } from "@/lib/data/patients";
import { readCountries } from "@/lib/data/countries";
import { readLanguages } from "@/lib/data/languages";
import { readTypes } from "@/lib/data/types";
import CreateNewReportClient from "@/components/client-pages/CreateNewReportClient";
/**
 * Create new report page
 */
export default async function CreateNewReportPage() {
  // Fetch all the options from the database
  const [patients, countries, languages, types] = await Promise.all([
    readPatients({ pageSize: 1000 }), // Get all patients
    readCountries(),
    readLanguages(),
    readTypes(),
  ]);

  // Transform data to Select options format
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
