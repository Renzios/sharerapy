'use server'

import { createClient } from '@/lib/supabase/server';

export async function createPatient(formData: FormData) {
    const supabase = await createClient();
    
    const patientData = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        birthdate: formData.get('birthdate') as string,
        sex: formData.get('sex') as 'Male' | 'Female',
        contact_number: formData.get('contact_number') as string,
        country_id: formData.get('country_id'),
    };

    const { error } = await supabase
        .from('patients')
        .insert([patientData]);

    if (error) {
        console.error(error);
        throw error;
    }
}

export async function updatePatient(id: string, formData: FormData) {
    const supabase = await createClient();

    const patientData = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        birthdate: formData.get('birthdate') as string,
        sex: formData.get('sex') as 'Male' | 'Female',
        contact_number: formData.get('contact_number') as string,
        country_id: formData.get('country_id'),
    };

    const { error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id);

    if (error) {
        console.error(error);
        throw error;
    }
}

export async function deletePatient(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(error);
        throw error;
    }
}