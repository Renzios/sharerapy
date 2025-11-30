"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchTherapist } from "@/lib/client/therapists";
import { Tables } from "@/lib/types/database.types";

type TherapistProfileContextType = {
  therapist: Tables<"therapists"> | null;
  isLoading: boolean;
  refetch: () => void;
};

const TherapistProfileContext = createContext<
  TherapistProfileContextType | undefined
>(undefined);

export function TherapistProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [therapist, setTherapist] = useState<Tables<"therapists"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const loadTherapist = async () => {
      if (isAuthLoading) {
        setIsLoading(true);
        return;
      }
      if (!isAuthenticated) {
        /* If not authenticated, don't try to fetch */
        setTherapist(null);
        setIsLoading(false);
        return;
      }

      /* If authenticated but no user ID yet, keep loading */
      if (!user?.id) {
        setIsLoading(true);
        return;
      }

      setIsLoading(true);
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

    loadTherapist();
  }, [user?.id, isAuthenticated, refetchTrigger, isAuthLoading]);

  return (
    <TherapistProfileContext.Provider value={{ therapist, isLoading, refetch }}>
      {children}
    </TherapistProfileContext.Provider>
  );
}

export function useTherapistProfile() {
  const context = useContext(TherapistProfileContext);
  if (context === undefined) {
    throw new Error(
      "useTherapistProfile must be used within a TherapistProfileProvider"
    );
  }
  return context;
}
