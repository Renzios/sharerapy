import type { Metadata } from "next";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { TherapistProfileProvider } from "./contexts/TherapistProfileContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "sharerapy.",
  description: "",
};

export const dynamic = "force-dynamic";

/**
 * Root layout component that wraps all pages. This is empty.
 * @param children - The page content to be rendered
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <TherapistProfileProvider>{children}</TherapistProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
