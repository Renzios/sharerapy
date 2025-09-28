'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Signs in a user with their email and password.
 * @param formData - The form data containing the user's email and password.
 * @throws Will throw an error if the sign-in process fails.
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Signs up a new user with an email and password.
 * @param formData - The form data containing the new user's email and password.
 * @throws Will throw an error if the sign-up process fails.
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const signupData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(signupData)

  if (error) {
    console.error(error);
    throw error;
  }

  const file = formData.get("picture") as File
  const filePath = `${crypto.randomUUID()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("therapist_pictures")
    .upload(filePath, file)
  
  if (uploadError) {
    console.error(uploadError);
    throw uploadError;
  } 
  
  const data = {
    clinic_id: parseInt(formData.get('clinic_id') as string),
    age: parseInt(formData.get('age') as string),
    bio: formData.get('bio') as string,
    last_name: formData.get('last_name') as string,
    first_name: formData.get('first_name') as string,
    picture: filePath,
  }

  const { data: therapist, error: insertError } = await supabase
    .from("therapists")
    .insert(data)
    .select()

  if (insertError) {
    console.error(insertError);
    throw insertError;
  }

  return therapist;
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
}