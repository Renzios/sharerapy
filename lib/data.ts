import { createClient } from '@/lib/supabase/server';

export async function readPatients() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('patients')
        .select('*, country:countries(*)');

    if (error) throw error;

    const patients = data.map((patient) => {
        const today = new Date();
        const birthdate = new Date(patient.birthdate);

        let years = today.getFullYear() - birthdate.getFullYear();
        let months = today.getMonth() - birthdate.getMonth();

        if (months < 0 || (months === 0 && today.getDate() < birthdate.getDate())) {
            years--;
            months += 12;
        }
        
        return { ...patient, age: { years, months } };
    });

    return patients
}

export async function readPatient(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('patients')
        .select('*, country:countries(*)')
        .eq('id', id)
        .single();

    if (error) throw error;

    const today = new Date();
    const birthdate = new Date(data.birthdate);

    let years = today.getFullYear() - birthdate.getFullYear();
    let months = today.getMonth() - birthdate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthdate.getDate())) {
        years--;
        months += 12;
    }

    return { ...data, age: { years, months } };
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
        .select('*, therapist:therapists(*), type:types(*), language:languages(*), patient:patients(*)');
    
    if (error) throw error;

    return data;
}

export async function readReport(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reports')
        .select('*, therapist:therapists(*), type:types(*), language:languages(*), patient:patients(*)')
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