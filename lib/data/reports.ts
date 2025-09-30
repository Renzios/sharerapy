import { createClient } from '@/lib/supabase/server';

type SortParameters = {
    sortBy: 'title' | 'created_at';
    ascending?: boolean;
}

type FilterParameters = {
    countryID?: number;
    languageID?: number;
    typeIDs?: number[];
    clinicID?: number;
    startDate?: string;
    endDate?: string;
    therapistID?: string;
}

export async function readReports(sortParameters: SortParameters, filterParameters: FilterParameters) {
    const { sortBy, ascending } = sortParameters
    const { countryID, languageID, typeIDs, clinicID, startDate, endDate, therapistID } = filterParameters

    const supabase = await createClient();

    let query = supabase
        .from('reports')
        .select('*, therapist:therapists!inner(*, clinic:clinics!inner(*, country:countries(*))), type:types(*), language:languages(*), patient:patients_view(*, country:countries(*))')
        .order(sortBy, { ascending });

    if (languageID) query.eq('language_id', languageID);
    if (countryID) query.eq('therapist.clinic.country_id', countryID);
    if (typeIDs?.length) query.in('type_id', typeIDs);
    if (clinicID) query.eq('therapist.clinic_id', clinicID);
    if (startDate) query.gte('created_at', startDate);
    if (endDate) query.lte('created_at', endDate);
    if (therapistID) query.eq('therapist_id', therapistID);

    const { data, error } = await query
    if (error) throw error;
    return data;
}

export async function readReport(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reports')
        .select('*, therapist:therapists(*, clinic:clinics(*, country:countries(*))), type:types(*), language:languages(*), patient:patients_view(*, country:countries(*))')
        .eq('id', id)
        .single();
    
    if (error) throw error;
    return data;
}