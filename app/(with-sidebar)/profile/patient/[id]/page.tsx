import PatientProfileClient from "@/components/client-pages/PatientProfileClient";
import { readPatient } from "@/lib/data/patients";
import { readReports } from "@/lib/data/reports";
import { notFound } from "next/navigation";

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
  searchParams: Promise<{ q?: string; p?: string; sort?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const searchTerm = resolvedSearchParams.q || "";
  const currentPage = Number(resolvedSearchParams.p) || 1;
  const sortQuery = resolvedSearchParams.sort || "dateDescending";

  const { column, ascending } = getSortParams(sortQuery);

  try {
    const [patient, reportsData] = await Promise.all([
      readPatient(id),
      readReports({
        patientID: id,
        search: searchTerm,
        page: currentPage - 1,
        pageSize: REPORTS_PER_PAGE,
        column: column,
        ascending: ascending,
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
