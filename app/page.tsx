import LandingPageClient from "@/components/client-pages/LandingPageClient";

// Opt out of static generation - this page is protected by auth middleware
export const dynamic = "force-dynamic";

/**
 * Landing page for the app, shows search interface for authenticated users.
 * Route protection is handled by middleware such that only authenticated users reach this page.
 */
export default function LandingPage() {
  return <LandingPageClient />;
}
