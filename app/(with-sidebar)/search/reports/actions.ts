"use server";

import { readReports } from "@/lib/data/reports";

type ReportsData = Awaited<ReturnType<typeof readReports>>["data"];
type Report = NonNullable<ReportsData>[number];

export async function fetchReports({
  column = "title",
  page = 1,
  ascending = true,
  search,
  patientID,
  therapistID,
}: {
  column?: string;
  page?: number;
  ascending?: boolean;
  search?: string;
  patientID?: string;
  therapistID?: string;
}): Promise<{
  data: Report[] | null;
  count: number;
  totalPages: number;
  success: boolean;
  error?: string;
}> {
  try {
    const { data, count } = await readReports({
      column,
      page: page - 1,
      ascending,
      search,
      patientID,
      therapistID,
    });
    const totalPages = count ? Math.ceil(count / 10) : 0;

    return {
      data,
      count: count || 0,
      totalPages,
      success: true,
    };
  } catch (error) {
    console.log("Error fetching reports:", error);
    return {
      data: null,
      count: 0,
      totalPages: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
