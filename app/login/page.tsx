"use client";

import LoginForm from "@/components/forms/LoginForm";
import { useAuth } from "@/app/contexts/AuthContext";

export default function LoginPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <LoginForm />;
}
