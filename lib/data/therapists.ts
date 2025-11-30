import { createClient } from "@/lib/supabase/server";
import { ReadParameters } from "@/lib/types/types";

export async function readTherapists({
	search,
	ascending = true,
	clinicID,
	countryID,
	page = 0,
	pageSize = 20,
}: ReadParameters = {}) {
	const supabase = await createClient();

	const query = supabase
		.from("therapists")
		.select("*, clinic:clinics(*, country:countries(*)), reports(type: types(type))", { count: "exact" })
		.order("name", { ascending })
		.range(page * pageSize, page * pageSize + pageSize - 1);

	if (clinicID) query.eq("clinic_id", clinicID);
	if (countryID) query.eq("clinic.country_id", countryID);

	if (search) query.ilike("name", `%${search}%`);

	const { data, error, count } = await query;
	if (error) throw error;
	
	const deduped = data.map((therapist) => {
		const seen = new Set();

		const uniqueReports = (therapist.reports ?? []).filter((report) => {
		const t = report.type?.type;
		if (!t || seen.has(t)) return false;
		seen.add(t);
		return true;
		});

		return { ...therapist, reports: uniqueReports };
	});

	return { data: deduped, count };
}

export async function readTherapist(id: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("therapists")
		.select("*, clinic:clinics(*, country:countries(*)), reports(*, type:types(*), language:languages(*), patient:patients(*, country:countries(*)))")
		.eq("id", id)
		.single();

	if (error) throw error;
	return data;
}
