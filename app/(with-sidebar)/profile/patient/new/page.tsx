import CreateNewPatientClient from "@/components/client-pages/create-edit/CreateNewPatientClient";
import { readCountries } from "@/lib/data/countries";

export default async function CreatePatientPage() {
  const countries = await readCountries();

  const countryOptions = countries.map((country) => ({
    value: country.id.toString(),
    label: country.country,
  }));

  return <CreateNewPatientClient countryOptions={countryOptions} />;
}
