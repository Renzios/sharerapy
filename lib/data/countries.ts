import { createClient } from '@/lib/supabase/server';

export async function readCountries() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('country', { ascending: true });
    
    if (error) throw error;

    return data;
}