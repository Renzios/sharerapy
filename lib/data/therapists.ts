import { createClient } from '@/lib/supabase/server';
import { ReadParameters } from '@/lib/types/types';

export async function readTherapists({
    ascending = true,
    clinicID,
    countryID
}: ReadParameters = {}) {
    const supabase = await createClient();

    const query = supabase
        .from('therapists_view')
        .select('*, clinic:clinics!inner(*, country:countries(*))')
        .order('name', { ascending });

    if (clinicID) query.eq('clinic_id', clinicID);
    if (countryID) query.eq('clinic.country_id', countryID);

    const { data, error } = await query
    if (error) throw error;
    return data;
}

export async function readTherapist(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('therapists_view')
        .select('*, clinic:clinics(*, country:countries(*))')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}