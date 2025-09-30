import { createClient } from '@/lib/supabase/server';

export async function readTypes() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('types')
        .select('*')
        .order('type', { ascending: true });
    
    if (error) throw error;

    return data;
}