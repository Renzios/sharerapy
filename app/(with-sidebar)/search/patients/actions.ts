"use server";

import { readPatients } from "@/lib/data/patients";

export async function fetchPatients({
  page = 1,
  ascending = true,
}: {
  page?: number;
  ascending?: boolean;
}) {
  try {
    const { data, count } = await readPatients({
      page: page - 1,
      pageSize: 20,
      ascending,
    });

    const totalPages = count ? Math.ceil(count / 20) : 0;

    return {
      data,
      count,
      totalPages,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      data: null,
      count: 0,
      totalPages: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
