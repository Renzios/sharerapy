import { createClient } from "@/lib/supabase/server";
import { ReadParameters } from "@/lib/types/types";

export async function readPatients({
	search,
	ascending = true,
	countryID,
	sex,
	page = 0,
	pageSize = 20,
}: ReadParameters = {}) {
	const supabase = await createClient();

	const query = supabase
		.from("patients")
		.select("*, country:countries(*), reports(type: types(type))", { count: "exact" })
		.order("name", { ascending })
		.range(page * pageSize, page * pageSize + pageSize - 1);

	if (countryID) query.eq("country_id", countryID);
	if (sex) query.eq("sex", sex);

	if (search) query.ilike("name", `%${search}%`);

	const { data, error, count } = await query;
	if (error) throw error;
	
	const deduped = data.map((patient) => {
		const seen = new Set();
		const uniqueReports = (patient.reports ?? []).filter((report) => {
		const t = report.type?.type;
		if (!t || seen.has(t)) return false;
		seen.add(t);
		return true;
		});
		return { ...patient, reports: uniqueReports };
	});

	return { data: deduped, count };
}

export async function readPatient(id: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("patients")
		.select("*, country:countries(*), reports(*, therapist:therapists(*, clinic:clinics(*, country:countries(*))), type:types(*), language:languages(*))")
		.eq("id", id)
		.single();

	if (error) throw error;
	return data;
}
