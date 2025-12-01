import { readPatient } from "@/lib/data/patients";
import { readCountries } from "@/lib/data/countries";
import CreateNewPatientClient from "@/components/client-pages/create-edit/CreateNewPatientClient";
import { notFound } from "next/navigation";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await readPatient(id);
  const countries = await readCountries();

  if (!patient) {
    notFound();
  }

  const countryOptions = countries.map((c) => ({
    value: c.id.toString(),
    label: c.country,
  }));

  const initialData = {
    firstName: patient.first_name,
    lastName: patient.last_name,
    birthday: patient.birthdate,
    contactNumber: patient.contact_number,
    countryId: patient.country_id.toString(),
    sex: patient.sex,
  };

  return (
    <CreateNewPatientClient
      countryOptions={countryOptions}
      mode="edit"
      initialData={initialData}
      patientId={id}
    />
  );
}
