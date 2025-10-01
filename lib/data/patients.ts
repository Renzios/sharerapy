import { createClient } from '@/lib/supabase/server';
import { ReadParameters } from '@/lib/types/types';

export async function readPatients({
    ascending = true,
    countryID,
    sex
}: ReadParameters = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('patients_view')
        .select('*, country:countries(*)')
        .order('name', { ascending });
    
    if (countryID) query.eq('country_id', countryID);
    if (sex) query.eq('sex', sex);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function readPatient(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('patients_view')
        .select('*, country:countries(*)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}