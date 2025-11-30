import { readReport } from "@/lib/data/reports";
import { readPatients } from "@/lib/data/patients";
import { readCountries } from "@/lib/data/countries";
import { readLanguages } from "@/lib/data/languages";
import { readTypes } from "@/lib/data/types";
import CreateNewReportClient from "@/components/client-pages/CreateNewReportClient";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Edit report page - fetches existing report data and options
 * Reuses CreateNewReportClient in "edit" mode
 */
export default async function EditIndividualReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    // Fetch report and options in parallel
    const [report, patients, countries, languages, types] = await Promise.all([
      readReport(id),
      readPatients({ pageSize: 1000 }),
      readCountries(),
      readLanguages(),
      readTypes(),
    ]);

    // Authorization check - only report owner can edit
    if (report.therapist_id !== user.id) {
      redirect(`/reports/${id}`); // Redirect to view page if not owner
    }

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
        mode="edit"
        reportId={report.id}
        existingReport={{
          title: report.title,
          description: report.description,
          content: report.content,
          language_id: report.language_id,
          type_id: report.type_id,
          patient_id: report.patient_id,
        }}
        patients={patients.data || []}
        patientOptions={patientOptions}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        typeOptions={typeOptions}
      />
    );
  } catch (error) {
    console.error("Failed to fetch report:", error);
    notFound();
  }
}
