import type { Metadata } from "next";
import { AuthProvider } from "@/app/contexts/AuthContext";
import "./globals.css";
import ClarityProvider from "@/app/clarity";

export const metadata: Metadata = {
  title: "sharerapy.",
  description: "",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ClarityProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}