import { createClient } from '@/lib/supabase/server';
import { ReadParameters } from '@/lib/types/types';

export async function readClinics({
    countryID
}: ReadParameters = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('clinics')
        .select('*, country:countries(*)')
        .order('clinic', { ascending: true });

    if (countryID) query.eq('country_id', countryID);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
}