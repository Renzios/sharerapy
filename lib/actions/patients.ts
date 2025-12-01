"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPatient(formData: FormData) {
  const patientData = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    birthdate: formData.get("birthdate") as string,
    sex: formData.get("sex") as "Male" | "Female",
    contact_number: formData.get("contact_number") as string,
    country_id: parseInt(formData.get("country_id") as string),
  };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .insert([patientData])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("/search/patients");
  redirect(`/profile/patient/${data.id}?success=true`);
}

export async function updatePatient(id: string, formData: FormData) {
  const patientData = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    birthdate: formData.get("birthdate") as string,
    sex: formData.get("sex") as "Male" | "Female",
    contact_number: formData.get("contact_number") as string,
    country_id: parseInt(formData.get("country_id") as string),
  };

  const supabase = await createClient();

  const { error } = await supabase
    .from("patients")
    .update(patientData)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("");
  redirect("");
}

export async function deletePatient(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("patients").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("");
  redirect("");
}
