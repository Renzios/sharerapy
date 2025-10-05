"use server";

import { readTherapists } from "@/lib/data/therapists";

export async function fetchTherapists({
  page = 1,
  ascending = true,
}: {
  page?: number;
  ascending?: boolean;
}) {
  try {
    const { data, count } = await readTherapists({ page: page - 1, ascending });
    const totalPages = count ? Math.ceil(count / 20) : 0;

    return {
      data,
      count,
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
