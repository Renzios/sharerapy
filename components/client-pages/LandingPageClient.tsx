"use client";

/* React Hooks & NextJS Utilities */
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* Components */
import Button from "@/components/general/Button";
import Search from "@/components/general/Search";
import Toast from "@/components/general/Toast";

/* Utilities */
import { getPublicURL } from "@/lib/utils/storage";

/* Actions */
import { signOut } from "@/lib/actions/auth";

/* Contexts */
import { useTherapistProfile } from "@/app/contexts/TherapistProfileContext";

export default function LandingPageClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const { therapist, isLoading } = useTherapistProfile();

  useEffect(() => {
    const loginSuccess = searchParams.get("loginSuccess");
    if (loginSuccess === "true") {
      setToastMessage("Successfully logged in!");
      setToastType("success");
      setShowToast(true);

      router.replace("/");
    }
  }, [searchParams, router]);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    } else {
      router.push("/search");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();

      router.push("/login");
      router.refresh();
    } catch (error) {
      setToastMessage("Failed to logout. Please try again.");
      setToastType("error");
      setShowToast(true);
    }
  };

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />

      <div className="w-full h-22 px-5 lg:px-10 flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={150}
          height={150}
          className="w-10 h-10"
        />

        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="outline"
            shape="pill"
            onClick={handleLogout}
            className="text-xs"
            id="landing-logout-btn"
          >
            Logout
          </Button>
          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : therapist ? (
            <Link
              id="landing-profile-link"
              href={`/profile/therapist/${therapist.id}`}
            >
              <Image
                src={getPublicURL("therapist_pictures", therapist.picture)}
                alt="Profile Picture"
                width={150}
                height={150}
                className="w-10 h-10 rounded-full object-cover transition-transform hover:scale-102"
              />
            </Link>
          ) : (
            <Image
              src="/testpfp.jpg"
              alt="Default Profile Picture"
              width={150}
              height={150}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="flex h-screen w-screen flex-col justify-center items-center pb-20">
        <div className="flex flex-col justify-center w-full items-center">
          <h1 className="text-3xl lg:text-5xl font-Noto-Sans text-black font-black text-center mb-4">
            <span className="text-primary">share</span>rapy.
          </h1>
          <Search
            id="landing-search-input"
            size="50%"
            className="min-w-2xs"
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            aiMode={true}
          />
        </div>
        <div className="mt-6 flex flex-col items-center gap-y-30">
          <div className="flex items-center space-between space-x-2 md:space-x-4">
            <Link href="/search/patients">
              <Button
                id="landing-patients-btn"
                variant="outline"
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="2rem"
                className="shrink min-w-0 whitespace-nowrap"
              >
                Patients
              </Button>
            </Link>
            <Link href="/search/reports">
              <Button
                id="landing-reports-btn"
                variant="outline"
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="2rem"
                className="shrink min-w-0 whitespace-nowrap"
              >
                Reports
              </Button>
            </Link>
            <Link href="/search/therapists">
              <Button
                id="landing-therapists-btn"
                variant="outline"
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="2rem"
                className="shrink min-w-0 whitespace-nowrap"
              >
                Therapists
              </Button>
            </Link>
          </div>
          <h2 className="text-sm md:text-lg font-medium font-Noto-Sans text-darkgray">
            Share Knowledge. Share Healing.
          </h2>
        </div>
      </div>
    </>
  );
}
