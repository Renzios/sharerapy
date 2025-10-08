import { createClient } from '@/lib/supabase/server';
import { ReadParameters } from '@/lib/types/types';

export async function readTherapists({
    search,
    ascending = true,
    clinicID,
    countryID,
    page = 0,
    pageSize = 10
}: ReadParameters = {}) {
    const supabase = await createClient();

    const query = supabase
        .from('therapists')
        .select('*, clinic:clinics!inner(*, country:countries(*))', { count: 'exact' })
        .order('name', { ascending })
        .range(page * pageSize, page * pageSize + pageSize - 1);

    if (clinicID) query.eq('clinic_id', clinicID);
    if (countryID) query.eq('clinic.country_id', countryID);

    if (search) query.ilike('name', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
}

export async function readTherapist(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('therapists')
        .select('*, clinic:clinics(*, country:countries(*))')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}