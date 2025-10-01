"use client";

import Button from "@/components/Button";
import Search from "@/components/Search";
import Image from "next/image";
import Link from "next/link";

/**
 * Landing page for the app, either the login page or search default page depending on if logged in.
 */
export default function LandingPage() {
  return (
    <>
      <div className="w-full h-[5.5rem] px-5 lg:px-10 flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={150}
          height={150}
          className="w-10 h-10"
        />

        <Image
          src="/testpfp.jpg"
          alt="PFP"
          width={150}
          height={150}
          className="w-10 h-10 ml-auto rounded-full"
        />
      </div>

      <div className="flex h-screen w-screen flex-col justify-center items-center pb-20">
        <div className="flex flex-col justify-center w-full items-center">
          <h1 className="text-3xl lg:text-5xl font-Noto-Sans text-black font-black text-center mb-4">
            <span className="text-primary">share</span>rapy.
          </h1>
          <Search size="50%" className="min-w-2xs" />
        </div>
        <div className="mt-6 flex flex-col items-center gap-y-30">
          <div className="flex items-center space-between space-x-4">
            <Link href="/search/patients">
              <Button
                variant="outline"
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="2rem"
                className="flex-shrink min-w-0 whitespace-nowrap"
              >
                Patients
              </Button>
            </Link>
            <Link href="/search/reports">
              <Button
                variant="outline"
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="2rem"
                className="flex-shrink min-w-0 whitespace-nowrap"
              >
                Reports
              </Button>
            </Link>
            <Link href="/search/therapists">
              <Button
                variant="outline"
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="2rem"
                className="flex-shrink min-w-0 whitespace-nowrap"
              >
                Therapists
              </Button>
            </Link>
          </div>
          <h2 className="text-lg font-medium font-Noto-Sans text-darkgray">
            Share Knowledge. Share Healing.
          </h2>
        </div>
      </div>
    </>
  );
}
