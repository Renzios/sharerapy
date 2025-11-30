"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTherapist(formData: FormData) {
  const TherapistData = {
    therapist_id: "56c0557a-f12f-48e7-a8ae-e36585880d91",
    clinic_id: parseInt(formData.get("clinic_id") as string),
    age: parseInt(formData.get("age") as string),
    bio: formData.get("country_id") as string,
    last_name: formData.get("last_name") as string,
    first_name: formData.get("first_name") as string,
    picture: formData.get("picture") as string,
  };

  const supabase = await createClient();

  const { error } = await supabase.from("therapists").insert([TherapistData]);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("");
  redirect("");
}

export async function updateTherapist(id: string, formData: FormData) {
  const supabase = await createClient();

  /* Get the current therapist data to access old picture path */
  const { data: currentTherapist } = await supabase
    .from("therapists")
    .select("picture")
    .eq("id", id)
    .single();

  let pictureFilePath = formData.get("picture") as string;

  /* Check if a new photo file was uploaded */
  const pictureFile = formData.get("picture");
  if (pictureFile instanceof File && pictureFile.size > 0) {
    /* Upload new photo to storage */
    const filePath = `${crypto.randomUUID()}-${pictureFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("therapist_pictures")
      .upload(filePath, pictureFile);

    if (uploadError) {
      console.error("Photo upload error:", uploadError);
      throw uploadError;
    }

    pictureFilePath = filePath;

    /* Delete old photo from storage if it exists and is not empty */
    if (currentTherapist?.picture) {
      const { error: deleteError } = await supabase.storage
        .from("therapist_pictures")
        .remove([currentTherapist.picture]);

      if (deleteError) {
        console.error("Failed to delete old photo:", deleteError);
        /* Don't throw - we can continue even if old photo deletion fails */
      }
    }
  }

  const TherapistData = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    clinic_id: parseInt(formData.get("clinic_id") as string),
    age: parseInt(formData.get("age") as string),
    bio: formData.get("bio") as string,
    picture: pictureFilePath,
  };

  const { error } = await supabase
    .from("therapists")
    .update(TherapistData)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  /* Revalidate all paths that display therapist data */
  revalidatePath(`/profile/therapist/${id}`);
  revalidatePath(`/profile/therapist/${id}/edit`);
  revalidatePath("/search/therapists");
  revalidatePath("/", "layout"); /* Revalidate layout to update sidebar */
}

export async function deleteTherapist(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("therapists").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("");
  redirect("");
}
