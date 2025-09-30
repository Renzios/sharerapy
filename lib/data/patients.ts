import { createClient } from '@/lib/supabase/server';

export async function readPatients(ascending: boolean, countryID?: number, sex?: 'Male' | 'Female') {
    const supabase = await createClient();

    let query = supabase
        .from('patients_view')
        .select('*, country:countries(*)');
    
    if (countryID) query = query.eq('country_id', countryID);
    if (sex) query = query.eq('sex', sex);

    query = query.order('name', { ascending });

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