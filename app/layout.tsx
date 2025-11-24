import type { Metadata } from "next";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { TherapistProfileProvider } from "./contexts/TherapistProfileContext";
import ClarityProvider from "@/app/clarity";
import "./globals.css";

export const metadata: Metadata = {
  title: "sharerapy.",
  description: "",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Nesting Order Strategy:
           1. AuthProvider (Top level: Handles who the user is)
           2. TherapistProfileProvider (Needs Auth data to load the profile)
           3. ClarityProvider (Analytics tool, usually sits alongside content)
        */}
        <AuthProvider>
          <TherapistProfileProvider>
            <ClarityProvider />
            {children}
          </TherapistProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
