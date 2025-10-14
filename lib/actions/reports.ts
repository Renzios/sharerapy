"use server";

import { Json } from "../types/database.types";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createReport(formData: FormData) {
  const ReportData = {
    therapist_id: formData.get("therapist_id") as string,
    type_id: parseInt(formData.get("type_id") as string),
    language_id: parseInt(formData.get("language_id") as string),
    patient_id: formData.get("patient_id") as string,
    content: JSON.parse(formData.get("content") as string) as Json,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
  };

  const supabase = await createClient();

  const { error } = await supabase.from("reports").insert([ReportData]);

  if (error) {
    throw error;
  }

  revalidatePath("/search/reports");
  redirect("/search/reports?success=true");
}

export async function updateReport(id: string, formData: FormData) {
  const ReportData = {
    therapist_id: formData.get("therapist_id") as string,
    type_id: parseInt(formData.get("type_id") as string),
    language_id: parseInt(formData.get("language_id") as string),
    patient_id: formData.get("patient_id") as string,
    content: formData.get("content") as Json,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
  };

  const supabase = await createClient();

  const { error } = await supabase
    .from("reports")
    .update(ReportData)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("");
  redirect("");
}

export async function deleteReport(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("reports").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("");
  redirect("");
}
