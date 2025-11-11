import LandingPageClient from "@/components/client-pages/LandingPageClient";

/**
 * Landing page for the app, shows search interface for authenticated users.
 * Route protection is handled by middleware such that only authenticated users reach this page.
 */
export default function LandingPage() {
  return <LandingPageClient />;
}
