import { createClient } from '@/lib/supabase/server';

export async function readLanguages() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('language', { ascending: true });
    
    if (error) throw error;
    return data;
}