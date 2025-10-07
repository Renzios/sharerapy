"use server";

import { readReports } from "@/lib/data/reports";

// Extract the type from what readReports returns
type ReportsData = Awaited<ReturnType<typeof readReports>>["data"];
type Report = NonNullable<ReportsData>[number];

export async function fetchReports({
  column = "title",
  page = 1,
  ascending = true,
}: {
  column?: string;
  page?: number;
  ascending?: boolean;
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
    });
    const totalPages = count ? Math.ceil(count / 10) : 0;

    return {
      data,
      count: count || 0,
      totalPages,
      success: true,
    };
  } catch (error) {
    console.log("Error fetching therapists:", error);
    return {
      data: null,
      count: 0,
      totalPages: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
