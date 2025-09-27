import { createClient } from '@/lib/supabase/server';

export async function getPatients() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('patients')
        .select('*, country:countries(*)');
    
    if (error) {
        console.error(error)
    }

    return data;
}