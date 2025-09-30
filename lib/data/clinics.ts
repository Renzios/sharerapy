import { createClient } from '@/lib/supabase/server';

export async function readClinics(countryID?: number) {
    const supabase = await createClient();

    let query = supabase
        .from('clinics')
        .select('*, country:countries(*)')

    if (countryID) query = query.eq('country_id', countryID);

    query = query.order('clinic', { ascending: true });
    
    const { data, error } = await query;

    if (error) throw error;

    return data;
}