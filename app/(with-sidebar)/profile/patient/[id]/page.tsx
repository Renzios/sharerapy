import PatientProfileClient from "@/components/client-pages/PatientProfileClient";
import { readPatient } from "@/lib/data/patients";
import { readReports } from "@/lib/data/reports";
import { notFound } from "next/navigation";

const REPORTS_PER_PAGE = 10;

/**
 * This is the server component for viewing an individual patient profile.
 * It fetches the patient details first using the id from params, then fetches
 * the initial reports to be displayed on his/her profile.
 */
export default async function PatientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; p?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.q || "";
  const currentPage = Number(resolvedSearchParams.p) || 1;

  try {
    const [patient, reportsData] = await Promise.all([
      readPatient(id),
      readReports({
        patientID: id,
        search: searchTerm,
        page: currentPage - 1,
        pageSize: REPORTS_PER_PAGE,
        column: "created_at",
        ascending: false,
      }),
    ]);

    if (!patient) {
      notFound();
    }

    const { data: initialReports, count } = reportsData;
    const totalPages = Math.ceil((count || 0) / REPORTS_PER_PAGE);

    return (
      <div>
        <PatientProfileClient
          patient={patient}
          initialReports={initialReports || []}
          totalPages={totalPages}
          initialSearchTerm={searchTerm}
        />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch patient profile data:", error);
    notFound();
  }
}
