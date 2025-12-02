import { createClient } from "@/lib/supabase/server";
import { ReadParameters } from "@/lib/types/types";

export async function readReports({
  search,
  column = "title",
  ascending = true,
  countryID,
  languageID,
  typeIDs,
  clinicID,
  startDate,
  endDate,
  therapistID,
  patientID,
  page = 0,
  pageSize = 10,
}: ReadParameters = {}) {
  const supabase = await createClient();

  let query;

  if (search)
    query = supabase.rpc("search_reports_ranked", { search_term: search });
  else query = supabase.from("reports");

  query = query.select(
    "*, therapist:therapists!inner(*, clinic:clinics!inner(*, country:countries(*))), type:types(*), language:languages(*), patient:patients(*, country:countries(*))",
    { count: "exact" }
  );
  const sortColumn = column || (search ? undefined : "title");
  if (sortColumn) query.order(sortColumn, { ascending });

  if (languageID) query.eq("language_id", languageID);
  if (countryID) query.eq("therapist.clinic.country_id", countryID);
  if (typeIDs?.length) query.in("type_id", typeIDs);
  if (clinicID) query.eq("therapist.clinic_id", clinicID);
  if (startDate) query.gte("created_at", startDate);
  if (endDate) query.lte("created_at", endDate);
  if (therapistID) query.eq("therapist_id", therapistID);
  if (patientID) query.eq("patient_id", patientID);

  query.range(page * pageSize, page * pageSize + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function readReport(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select(
      "*, therapist:therapists(*, clinic:clinics(*, country:countries(*))), type:types(*), language:languages(*), patient:patients(*, country:countries(*))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  if (data?.patient?.birthdate) {
    const birth = new Date(data.patient.birthdate);
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    data.patient.age = `${years} years ${months} months`;
  }

  return data;
}
