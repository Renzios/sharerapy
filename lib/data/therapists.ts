import { createClient } from '@/lib/supabase/server';

export async function readTherapists(ascending: boolean, clinicID?: number) {
    const supabase = await createClient();

    let query = supabase
        .from('therapists_view')
        .select('*, clinic:clinics(*, country:countries(*))');

    if (clinicID) query = query.eq('clinic_id', clinicID);

    query = query.order('name', { ascending });

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