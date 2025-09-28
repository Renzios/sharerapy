import { createClient } from '@/lib/supabase/server';

export async function readPatients() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('patients_view')
        .select('*, country:countries(*)');

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

export async function readTherapists() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('therapists')
        .select('*, clinic:clinics(*, country:countries(*))');
    
    if (error) throw error;

    return data;
}

export async function readTherapist(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('therapists')
        .select('*, clinic:clinics(*, country:countries(*))')
        .eq('id', id)
        .single();

    if (error) throw error;

    return data;
}

export async function readReports() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reports')
        .select('*, therapist:therapists(*, clinic:clinics(*, country:countries(*))), type:types(*), language:languages(*), patient:patients_view(*, country:countries(*))');
    
    if (error) throw error;

    return data;
}

export async function readReport(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reports')
        .select('*, therapist:therapists(*, clinic:clinics(*, country:countries(*))), type:types(*), language:languages(*), patient:patients_view(*, country:countries(*))')
        .eq('id', id)
        .single();
    
    if (error) throw error;

    return data;
}

export async function readClinics() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('clinics')
        .select('*, country:countries(*)');
    
    if (error) throw error;

    return data;
}

export async function readCountries() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('countries')
        .select('*');
    
    if (error) throw error;

    return data;
}

export async function readLanguages() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('languages')
        .select('*');
    
    if (error) throw error;

    return data;
}

export async function readTypes() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('types')
        .select('*');
    
    if (error) throw error;

    return data;
}