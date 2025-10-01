import { createClient } from '@/lib/supabase/server';
import { ReadParameters } from '@/lib/types/types';

export async function readReports({
    column = 'title',
    ascending = true,
    countryID, 
    languageID, 
    typeIDs,
    clinicID,
    startDate,
    endDate,
    therapistID,
    page = 0,
    pageSize = 10
}: ReadParameters = {}) {
    const supabase = await createClient();

    const query = supabase
        .from('reports')
        .select('*, therapist:therapists!inner(*, clinic:clinics!inner(*, country:countries(*))), type:types(*), language:languages(*), patient:patients_view(*, country:countries(*))', { count: 'exact' })
        .order(column, { ascending })
        .range(page * pageSize, page * pageSize + pageSize - 1);

    if (languageID) query.eq('language_id', languageID);
    if (countryID) query.eq('therapist.clinic.country_id', countryID);
    if (typeIDs?.length) query.in('type_id', typeIDs);
    if (clinicID) query.eq('therapist.clinic_id', clinicID);
    if (startDate) query.gte('created_at', startDate);
    if (endDate) query.lte('created_at', endDate);
    if (therapistID) query.eq('therapist_id', therapistID);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
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