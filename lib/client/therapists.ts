"use client";

import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/database.types";

export async function fetchTherapist(
  id: string
): Promise<Tables<"therapists"> | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("therapists")
      .select("*, clinic:clinics(*, country:countries(*))")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch therapist:", error);
    return null;
  }
}
