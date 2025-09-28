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
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
}