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

export async function readReports(sortBy: 'title' | 'created_at', ascending: boolean, countryID?: number, languageID?: number, typeIDs?: number[], clinicID?: number, startDate?: string, endDate?: string, therapistID?: string) {
    const supabase = await createClient();

    let query = supabase
        .from('reports')
        .select('*, therapist:therapists!inner(*, clinic:clinics!inner(*, country:countries(*))), type:types(*), language:languages(*), patient:patients_view(*, country:countries(*))');
    
    if (languageID) query = query.eq('language_id', languageID);
    if (countryID) query = query.eq('therapist.clinic.country_id', countryID);
    if (typeIDs?.length) query = query.in('type_id', typeIDs);
    if (clinicID) query = query.eq('therapist.clinic_id', clinicID);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);
    if (therapistID) query = query.eq('therapist_id', therapistID);

    query = query.order(sortBy, { ascending });

    const { data, error } = await query
    if (error) throw error;

    return data;
}

export async function readReport(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reports')
        .select('*, therapist:therapists!inner(*, clinic:clinics!inner(*, country:countries(*))), type:types(*), language:languages(*), patient:patients_view(*, country:countries(*))')
        .eq('id', id)
        .single();
    
    if (error) throw error;

    return data;
}

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

export async function readCountries() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('country', { ascending: true });
    
    if (error) throw error;

    return data;
}

export async function readLanguages() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('language', { ascending: true });
    
    if (error) throw error;

    return data;
}

export async function readTypes() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('types')
        .select('*')
        .order('type', { ascending: true });
    
    if (error) throw error;

    return data;
}