import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "sharerapy.",
  description: "",
};

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
