"use server";

import { readTherapists } from "@/lib/data/therapists";

// Extract the type from what readTherapists returns
type TherapistsData = Awaited<ReturnType<typeof readTherapists>>["data"];
type Therapist = NonNullable<TherapistsData>[number];

export async function fetchTherapists({
  page = 1,
  ascending = true,
  search,
}: {
  page?: number;
  ascending?: boolean;
  search?: string;
}): Promise<{
  data: Therapist[] | null;
  count: number;
  totalPages: number;
  success: boolean;
  error?: string;
}> {
  try {
    const { data, count } = await readTherapists({
      page: page - 1,
      ascending,
      search,
    });
    const totalPages = count ? Math.ceil(count / 20) : 0;

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
