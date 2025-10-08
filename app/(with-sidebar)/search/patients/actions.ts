"use server";

import { readPatients } from "@/lib/data/patients";

// Extract the type from what readPatients returns
type PatientsData = Awaited<ReturnType<typeof readPatients>>["data"];
type Patient = NonNullable<PatientsData>[number];

export async function fetchPatients({
  page = 1,
  ascending = true,
  search,
}: {
  page?: number;
  ascending?: boolean;
  search?: string;
}): Promise<{
  data: Patient[] | null;
  count: number;
  totalPages: number;
  success: boolean;
  error?: string;
}> {
  try {
    const { data, count } = await readPatients({
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
