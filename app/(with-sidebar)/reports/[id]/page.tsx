import IndivReportClient from "@/components/client-pages/IndivReportClient";
import { readReport } from "@/lib/data/reports";

/**
 * This is the server component for viewing an individual report.
 * It fetches the report data by ID and passes it to the client component for rendering.
 */
export default async function ViewIndividualReportPage({
  params,
}: {
  params: { id: string };
}) {
  const report = await readReport(params.id);

  return (
    <div>
      <IndivReportClient report={report} />
    </div>
  );
}
