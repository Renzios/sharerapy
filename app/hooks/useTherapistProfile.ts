"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchTherapist } from "@/lib/client/therapists";
import { Tables } from "@/lib/types/database.types";

export function useTherapistProfile() {
  const { user, isAuthenticated } = useAuth();
  const [therapist, setTherapist] = useState<Tables<"therapists"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTherapist = async () => {
      if (!user?.id) {
        setTherapist(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchTherapist(user.id);
        setTherapist(data);
      } catch (error) {
        console.error("Failed to fetch therapist:", error);
        setTherapist(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadTherapist();
    } else {
      setTherapist(null);
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  return { therapist, isLoading };
}
