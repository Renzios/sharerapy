'use server'

import { Json } from '../types/database.types';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTherapist(formData: FormData) {
    const TherapistData = {
        therapist_id: '56c0557a-f12f-48e7-a8ae-e36585880d91',
        clinic_id: parseInt(formData.get('clinic_id') as string),
        age: parseInt(formData.get('age') as string),
        bio: formData.get('country_id') as string,
        last_name: formData.get('last_name') as string,
        first_name: formData.get('first_name') as string,
        picture: formData.get('picture') as string
    };

    const supabase = await createClient();

    const { error } = await supabase
        .from('therapists')
        .insert([TherapistData]);

    if (error) {
        console.error(error);
        throw error;
    }

    revalidatePath('');
    redirect('');
}

export async function updateTherapist(id: string, formData: FormData) {
    const TherapistData = {
        therapist_id: '56c0557a-f12f-48e7-a8ae-e36585880d91',
        clinic_id: parseInt(formData.get('clinic_id') as string),
        age: parseInt(formData.get('age') as string),
        bio: formData.get('country_id') as string,
        last_name: formData.get('last_name') as string,
        first_name: formData.get('first_name') as string,
        picture: formData.get('picture') as string
    };

    const supabase = await createClient();

    const { error } = await supabase
        .from('therapists')
        .update(TherapistData)
        .eq('id', id);

    if (error) {
        console.error(error);
        throw error;
    }

    revalidatePath('');
    redirect('');
}

export async function deleteTherapist(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('therapists')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(error);
        throw error;
    }

    revalidatePath('');
    redirect('');
}