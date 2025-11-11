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
  const supabase = await createClient();

  // Get current user for authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: existingReport } = await supabase
    .from("reports")
    .select("therapist_id")
    .eq("id", id)
    .single();

  if (existingReport?.therapist_id !== user.id) {
    throw new Error("Unauthorized - You don't own this report");
  }

  // Update report (patient_id and therapist_id cannot be changed)
  const ReportData = {
    type_id: parseInt(formData.get("type_id") as string),
    language_id: parseInt(formData.get("language_id") as string),
    content: JSON.parse(formData.get("content") as string) as Json,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("reports")
    .update(ReportData)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath(`/reports/${id}`);
  revalidatePath("/search/reports");
  redirect(`/reports/${id}?updated=true`);
}

export async function deleteReport(id: string) {
  const supabase = await createClient();

  // Get current user for authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: existingReport } = await supabase
    .from("reports")
    .select("therapist_id")
    .eq("id", id)
    .single();

  if (existingReport?.therapist_id !== user.id) {
    throw new Error("Unauthorized - You don't own this report");
  }

  const { error } = await supabase.from("reports").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("/search/reports");
  redirect("/search/reports?deleted=true");
}
