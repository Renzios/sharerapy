import TherapistProfileClient from "@/components/client-pages/TherapistProfileClient";
import { readTherapist } from "@/lib/data/therapists";
import { readReports } from "@/lib/data/reports";
import { readLanguages } from "@/lib/data/languages";
import { notFound } from "next/navigation";

const REPORTS_PER_PAGE = 10;

/**
 * This is the server component for viewing an individual therapist profile.
 * It fetches the therapist details first using the id from params, then fetches
 * the initial reports to be displayed on his/her profile.
 */
export default async function TherapistProfilePage({
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
    const [therapist, reportsData, languages] = await Promise.all([
      readTherapist(id),
      readReports({
        therapistID: id,
        search: searchTerm,
        page: currentPage - 1,
        pageSize: REPORTS_PER_PAGE,
        column: "created_at",
        ascending: false,
      }),
      readLanguages(),
    ]);

    if (!therapist) {
      notFound();
    }
    const { data: initialReports, count } = reportsData;
    const totalPages = Math.ceil((count || 0) / REPORTS_PER_PAGE);

    const languageOptions = languages.map((language) => ({
      value: language.code,
      label: language.language,
    }));

    return (
      <div>
        <TherapistProfileClient
          therapist={therapist}
          initialReports={initialReports || []}
          totalPages={totalPages}
          initialSearchTerm={searchTerm}
          languageOptions={languageOptions}
        />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch therapist profile data:", error);
    notFound();
  }
}
