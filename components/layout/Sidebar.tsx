/* React & NextJS Utilities */
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

/* Actions */
import { signOut } from "@/lib/actions/auth";

/* Contexts */
import { useAuth } from "@/app/contexts/AuthContext";
import { useTherapistProfile } from "@/app/contexts/TherapistProfileContext";

/* Utilities */
import { getPublicURL } from "@/lib/utils/storage";

/* Icons */
import SearchIcon from "@mui/icons-material/Search";
import PatientIcon from "@mui/icons-material/PersonalInjury";
import ReportIcon from "@mui/icons-material/Article";
import TherapistIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import CreateIcon from "@mui/icons-material/Create";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

/**
 * Renders the main navigation sidebar with responsive behavior and user profile section.
 * Hidden on mobile by default, toggleable via menu button. Always visible on desktop.
 *
 * @param isOpen - Controls visibility of the sidebar on mobile devices
 * @param setIsOpen - Function to toggle the sidebar visibility state
 */
export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { therapist, isLoading } = useTherapistProfile();

  // Defined sections for logical grouping
  const navigationSections = [
    {
      title: "Overview",
      items: [
        { name: "Search", href: "/", icon: <SearchIcon /> },
        { name: "Patients", href: "/search/patients", icon: <PatientIcon /> },
        { name: "Reports", href: "/search/reports", icon: <ReportIcon /> },
        {
          name: "Therapists",
          href: "/search/therapists",
          icon: <TherapistIcon />,
        },
      ],
    },
    {
      title: "Workspace",
      items: [
        {
          name: "Create Patient",
          href: "/profile/patient/new",
          icon: <AddIcon />,
        },
        {
          name: "Create Report",
          href: "/reports/new",
          icon: <CreateIcon />,
        },
        { name: "AI Mode", href: "/ai-mode", icon: <AutoAwesomeIcon /> },
      ],
    },
    {
      title: "Account",
      items: [
        {
          name: "Profile",
          href: `/profile/therapist/${user?.id}`,
          icon: <AccountBoxIcon />,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.log("Error Logging Out:", error);
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        w-72
        bg-white border-r border-bordergray
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:block lg:w-96
      `}
    >
      <div className="w-full h-full flex flex-col">
        {/* Desktop Logo */}
        <div
          className="
              hidden items-center
              h-auto px-8 gap-2.5
              border-b border-bordergray
              lg:flex lg:h-21.25"
        >
          <Link href="/" id="sidebar-logo-link">
            <Image
              src="/logo.png"
              alt="Sharerapy Logo"
              width={40}
              height={40}
              className="w-10 h-10 hover:cursor-pointer"
            />
          </Link>
          <h1 className="font-Noto-Sans text-[1.5rem] font-black">
            <span className="text-primary">share</span>rapy.
          </h1>
        </div>

        {/* Mobile Section 1 */}
        <div
          className="
              flex flex-col items-center justify-center
              w-full h-47.5 p-2 gap-2
              border-b border-bordergray
              lg:hidden"
        >
          {!isLoading && (
            <Image
              src={
                therapist?.picture
                  ? getPublicURL("therapist_pictures", therapist.picture)
                  : "/testpfp.jpg"
              }
              alt="Profile Picture"
              width={150}
              height={150}
              className="h-17.5 w-17.5 rounded-full"
            />
          )}

          <div className="flex flex-col items-center">
            <h2 className="font-Noto-Sans text-base text-black font-medium">
              {therapist?.name || "User"}
            </h2>
            <h3 className="font-Noto-Sans text-[0.6785rem] text-darkgray font-medium">
              {user?.email}
            </h3>
          </div>
        </div>

        {/* Navigation Menu (Grouped) */}
        <nav className="px-8 py-3 lg:py-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-Noto-Sans text-darkgray text-xs font-bold uppercase tracking-wider mb-3">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          id={`sidebar-${item.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}-link`}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`
                            group
                            flex items-center
                            h-10 px-4 gap-3
                            rounded-sm
                            transition-all duration-200 ease-in-out
                            ${
                              isActive
                                ? "bg-secondary/30"
                                : "hover:bg-bordergray/30"
                            }
                          `}
                        >
                          <span
                            className={`text-lg flex items-center justify-center transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-darkgray group-hover:text-primary"
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span
                            className={`font-Noto-Sans font-semibold text-sm flex items-center transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-darkgray group-hover:text-primary"
                            }`}
                          >
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto">
          {/* Mobile: Logo + Wordmark */}
          <div
            className="
              flex flex-col items-center justify-center
              py-4 gap-2
              lg:hidden
            "
          >
            <Link href="/" id="sidebar-logo-link-mobile">
              <Image
                src="/logo.png"
                alt="Sharerapy Logo"
                width={80}
                height={80}
                className="w-20 h-20 hover:cursor-pointer"
              />
            </Link>
            <h1 className="font-Noto-Sans text-md font-black">
              <span className="text-primary">share</span>rapy.
            </h1>
          </div>

          {/* Desktop: Profile Section with Dropdown */}
          <div
            className="
              hidden relative
              h-28
              border-t border-bordergray
              lg:block
            "
          >
            <div
              id="sidebar-profile-dropdown-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="
                flex items-center
                w-full h-full p-8 gap-3
                hover:bg-bordergray/30 transition-colors
                cursor-pointer
              "
            >
              {!isLoading && (
                <Image
                  src={
                    therapist?.picture
                      ? getPublicURL("therapist_pictures", therapist.picture)
                      : "/testpfp.jpg"
                  }
                  alt="Profile Picture"
                  width={150}
                  height={150}
                  className="h-17.5 w-17.5 rounded-full"
                />
              )}
              <div className="flex-1 text-left">
                <h3 className="font-Noto-Sans font-semibold text-sm text-black">
                  {therapist?.name || "User"}
                </h3>
                <p className="font-Noto-Sans text-xs text-darkgray">
                  {user?.email}
                </p>
              </div>
              <KeyboardArrowDownIcon
                className={`text-darkgray transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Dropdown Menu (appears above) */}
            {isDropdownOpen && (
              <div
                className="
                  absolute bottom-full left-4 right-4
                  mb-1 py-2
                  bg-white border border-gray-200 rounded-lg shadow-lg
                  z-50
                "
              >
                <Link href={`/profile/therapist/${therapist?.id}`}>
                  <button
                    id="sidebar-profile-view-btn"
                    className="
                    w-full text-left
                    px-4 py-2
                    hover:bg-gray-50
                    font-Noto-Sans text-sm text-primary
                    hover:cursor-pointer
                  "
                  >
                    View
                  </button>
                </Link>
                <hr className="my-2 border-bordergray" />
                <button
                  id="sidebar-profile-logout-btn"
                  className="
                    w-full text-left
                    px-4 py-2
                    hover:bg-gray-50
                    font-Noto-Sans text-sm text-primary
                    hover:cursor-pointer
                  "
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
