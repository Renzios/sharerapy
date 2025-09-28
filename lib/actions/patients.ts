'use server'

import { createClient } from '@/lib/supabase/server';

/**
 * Creates a new patient record in the database.
 * This is a server action designed to be used with a form.
 * @param formData - The form data containing the new patient's information.
 * @returns The newly created patient data.
 * @throws Will throw an error if the database operation fails.
 */
export async function createPatient(formData: FormData) {
    const supabase = await createClient();
    
    const patientData = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        birthdate: formData.get('birthdate') as string,
        sex: formData.get('sex') as 'Male' | 'Female',
        contact_number: formData.get('contact_number') as string,
        country_id: parseInt(formData.get('country_id') as string),
    };

    const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select();

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

/**
 * Updates an existing patient record by its ID.
 * This is a server action designed to be used with a form.
 * @param id - The UUID of the patient to update.
 * @param formData - The form data containing the updated patient information.
 * @returns The updated patient data.
 * @throws Will throw an error if the database operation fails.
 */
export async function updatePatient(id: string, formData: FormData) {
    const supabase = await createClient();

    const patientData = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        birthdate: formData.get('birthdate') as string,
        sex: formData.get('sex') as 'Male' | 'Female',
        contact_number: formData.get('contact_number') as string,
        country_id: parseInt(formData.get('country_id') as string),
    };

    const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id);

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

/**
 * Deletes a patient record by its ID.
 * This is a server action.
 * @param id - The UUID of the patient to delete.
 * @throws Will throw an error if the database operation fails.
 */
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