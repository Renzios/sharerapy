import test from "./kiko.jpg";
import Logo from "../app/favicon.ico";

import SearchIcon from "@mui/icons-material/Search";
import CreateIcon from "@mui/icons-material/Create";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  { name: "Search", href: "/search", icon: <SearchIcon /> },
  { name: "Create Report", href: "/create-report", icon: <CreateIcon /> },
  { name: "AI Mode", href: "/ai-mode", icon: <AutoAwesomeIcon /> },
  { name: "Profile", href: "/profile", icon: <AccountBoxIcon /> },
];

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
        fixed inset-y-0 left-0 z-40 h-screen 
        w-72 md:w-96
        bg-white border-r border-bordergray
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:block
      `}
    >
      <div className="w-full h-full flex flex-col">
        {/* Desktop Logo */}
        <div
          className="
              hidden md:flex md:h-[5.3125rem] border-b border-bordergray
              items-center gap-2.5 px-8"
        >
          <img src={Logo.src} className="w-[2.5rem] h-[2.5rem]" />
          <h1 className="font-Noto-Sans text-[1.5rem] font-black">
            <span className="text-primary">share</span>rapy.
          </h1>
        </div>

        {/* Mobile Section 1 */}
        <div
          className="
              w-full h-[11.875rem] flex md:hidden
              flex-col items-center justify-center p-2
              border-b border-bordergray gap-2"
        >
          <img
            src={test.src}
            alt="Logo"
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
        <nav className="flex-1 px-8 py-6">
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
                    onClick={() => setIsOpen(false)} // Close mobile sidebar on navigation
                    className={`
                      flex items-center gap-3 px-4 h-10 rounded-md
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
          <div className="flex md:hidden flex-col items-center justify-center py-4 gap-2">
            <img src={Logo.src} className="w-20 h-20" alt="Logo" />
            <h1 className="font-Noto-Sans text-md font-black">
              <span className="text-primary">share</span>rapy.
            </h1>
          </div>

          {/* Desktop: Profile Section with Dropdown */}
          <div className="hidden md:block relative h-[7rem] border-t border-bordergray">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-full flex items-center gap-3 p-8 hover:bg-gray-50 transition-colors"
            >
              <img
                src={test.src}
                alt="Profile"
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
              <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                {/* Space reserved for select dropdown */}
                <div className="px-4 py-3">
                  {/* Select dropdown will go here */}
                </div>
                <hr className="my-2 border-bordergray" />
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 font-Noto-Sans text-sm text-primary">
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
