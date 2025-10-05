import { createClient } from "@/lib/supabase/server";
import { ReadParameters } from "@/lib/types/types";

export async function readPatients({
  ascending = true,
  countryID,
  sex,
  page = 0,
  pageSize = 20,
}: ReadParameters = {}) {
  const supabase = await createClient();

  const query = supabase
    .from("patients_view")
    .select("*, country:countries(*)", { count: "exact" })
    .order("name", { ascending })
    .range(page * pageSize, page * pageSize + pageSize - 1);

  if (countryID) query.eq("country_id", countryID);
  if (sex) query.eq("sex", sex);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function readPatient(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients_view")
    .select("*, country:countries(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
