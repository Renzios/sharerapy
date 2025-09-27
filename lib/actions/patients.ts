'use server'

import { createClient } from '@/lib/supabase/server';
import { Patient } from '@/lib/types/types';

export async function createPatient() {
    const supabase = await createClient();
}

export async function updatePatient() {
    const supabase = await createClient();
}

export async function deletePatient() {
    const supabase = await createClient();
}