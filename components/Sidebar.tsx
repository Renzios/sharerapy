import SearchIcon from "@mui/icons-material/Search";
import CreateIcon from "@mui/icons-material/Create";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  { name: "Search", href: "/search", icon: <SearchIcon /> },
  { name: "Create Report", href: "/reports/new", icon: <CreateIcon /> },
  { name: "AI Mode", href: "/ai-mode", icon: <AutoAwesomeIcon /> },
  { name: "Profile", href: "/profile/me", icon: <AccountBoxIcon /> },
];

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
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        w-72
        bg-white border-r border-bordergray
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:block md:w-96
      `}
    >
      <div className="w-full h-full flex flex-col">
        {/* Desktop Logo */}
        <div
          className="
              hidden items-center
              h-auto px-8 gap-2.5
              border-b border-bordergray
              md:flex md:h-[5.3125rem]"
        >
          <Image
            src="/logo.png"
            alt="Sharerapy Logo"
            width={40}
            height={40}
            className="w-[2.5rem] h-[2.5rem]"
          />
          <h1 className="font-Noto-Sans text-[1.5rem] font-black">
            <span className="text-primary">share</span>rapy.
          </h1>
        </div>

        {/* Mobile Section 1 */}
        <div
          className="
              flex flex-col items-center justify-center
              w-full h-[11.875rem] p-2 gap-2
              border-b border-bordergray
              md:hidden"
        >
          <Image
            src="/testpfp.jpg"
            alt="Profile Picture"
            width={70}
            height={70}
            className="h-[4.375rem] w-[4.375rem] rounded-full"
          />

          <div className="flex flex-col items-center">
            <h2 className="font-Noto-Sans text-base text-black font-medium">
              Dawson Catignas
            </h2>
            <h3 className="font-Noto-Sans text-[0.6785rem] text-darkgray font-medium">
              dawsoncatignas@gmail.com
            </h3>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-8 py-3 md:py-6">
          <h4 className="font-Noto-Sans text-darkgray text-xs font-medium mb-4">
            Navigation
          </h4>
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center
                      h-10 px-4 gap-3
                      rounded-md
                      transition-all duration-200 ease-in-out
                      ${
                        isActive
                          ? "bg-secondary/30"
                          : "text-darkgray hover:bg-bordergray/30 hover:text-primary"
                      }
                    `}
                  >
                    <span
                      className={`text-lg flex items-center justify-center ${
                        isActive ? "text-primary" : ""
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`font-Noto-Sans font-semibold text-sm flex items-center ${
                        isActive ? "text-primary" : "text-darkgray"
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto">
          {/* Mobile: Logo + Wordmark */}
          <div
            className="
              flex flex-col items-center justify-center
              py-4 gap-2
              md:hidden
          "
          >
            <Image
              src="/logo.png"
              alt="Sharerapy Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
            <h1 className="font-Noto-Sans text-md font-black">
              <span className="text-primary">share</span>rapy.
            </h1>
          </div>

          {/* Desktop: Profile Section with Dropdown */}
          <div
            className="
              hidden relative
              h-[7rem]
              border-t border-bordergray
              md:block
          "
          >
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="
                flex items-center
                w-full h-full p-8 gap-3
                hover:bg-gray-50 transition-colors
              "
            >
              <Image
                src="/testpfp.jpg"
                alt="Profile Picture"
                width={60}
                height={60}
                className="w-15 h-15 rounded-full"
              />
              <div className="flex-1 text-left">
                <h3 className="font-Noto-Sans font-semibold text-sm text-black">
                  Dawson Catignas
                </h3>
                <p className="font-Noto-Sans text-xs text-darkgray">
                  dawsoncatignas@gmail.com
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
              "
              >
                {/* Space reserved for select dropdown */}
                <div className="px-4 py-3">
                  {/* Select dropdown will go here */}
                </div>
                <hr className="my-2 border-bordergray" />
                <button
                  className="
                  w-full text-left
                  px-4 py-2
                  hover:bg-gray-50
                  font-Noto-Sans text-sm text-primary
                "
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
