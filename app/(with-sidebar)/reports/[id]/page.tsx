import IndivReportClient from "@/components/client-pages/IndivReportClient";
import { readReport } from "@/lib/data/reports";
import { readLanguages } from "@/lib/data/languages";

/**
 * This is the server component for viewing an individual report.
 * It fetches the report data by ID and passes it to the client component for rendering.
 */
export default async function ViewIndividualReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params Promise first
  const { id } = await params;
  const [report, languages] = await Promise.all([
    readReport(id),
    readLanguages(),
  ]);

  const languageOptions = languages.map((language) => ({
    value: language.code,
    label: language.language,
  }));

  return (
    <div>
      <IndivReportClient report={report} languageOptions={languageOptions} />
    </div>
  );
}
