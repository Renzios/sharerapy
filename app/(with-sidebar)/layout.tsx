"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

/**
 * Layout component that wraps all pages the have the sidebar/header.
 * @param children - The page content to be rendered
 */
export default function WithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col bg-background">
        <Header onMenuClick={() => setIsOpen(!isOpen)} />

        <main className="flex-1 overflow-y-auto py-9 px-5 lg:px-2 xl:px-9">
          {children}
        </main>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
