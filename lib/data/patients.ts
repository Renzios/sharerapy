import { createClient } from '@/lib/supabase/server';
import { Patient } from '@/lib/types/types';

export async function getPatients(): Promise<Patient[] | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('patients')
        .select('*');
    
    if (error) {
        console.error(error);
        return null;
    }

    return data;
}