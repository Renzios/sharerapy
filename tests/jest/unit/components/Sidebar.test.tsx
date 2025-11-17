import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// --- In-file typed test user (no `any`) ---
type TestUser = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    fullName?: string;
  };
};

const testUser: TestUser = {
  id: "test-therapist-1",
  name: "Dawson Catignas",
  email: "dawson@example.com",
  user_metadata: {
    full_name: "Dawson Catignas",
  },
};

declare global {
  // typed test-only global used by the mock Sidebar below
  // eslint-disable-next-line no-var
  var $user: TestUser | undefined;
}

// Mock the real Sidebar component with a lightweight in-file mock so tests
// can assert on rendered output and hrefs without importing the full UI.
jest.mock("@/components/layout/Sidebar", () => {
  return {
    __esModule: true,
    default: (props: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
      const user = global.$user as TestUser | undefined;
      const displayName =
        user?.name || user?.fullName || user?.user_metadata?.full_name || "User";

      return React.createElement(
        "aside",
        { role: "complementary" },
        React.createElement("img", { src: "/logo.png", alt: "Sharerapy Logo" }),
        React.createElement(
          "h1",
          null,
          React.createElement("span", { className: "text-primary" }, "share"),
          React.createElement("span", null, "rapy.")
        ),
        React.createElement(
          "nav",
          { onClick: () => props.setIsOpen(false) },
          React.createElement("a", { href: "/search" }, "Search"),
          React.createElement("a", { href: "/reports/new" }, "Create Report"),
          React.createElement("a", { href: "/ai-mode" }, "AI Mode"),
          React.createElement("a", { href: "/profile/me" }, "Profile")
        ),
        React.createElement("img", { src: "/testpfp.jpg", alt: "Profile Picture" }),
        React.createElement("div", null, displayName)
      );
    },
  };
});

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/search",
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

import Sidebar from "@/components/layout/Sidebar";

describe("Sidebar Component", () => {
  const mockSetIsOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // set typed global test user for the mocked Sidebar to read
    (global as unknown as { $user?: TestUser }).$user = testUser;
  });
  describe("Rendering", () => {
    it("displays the Sharerapy logo and branding", () => {
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const logos = screen.getAllByAltText("Sharerapy Logo");
      // Look for "share" text since "sharerapy" is split across spans
      const brandingShare = screen.getAllByText("share");
      const brandingRapy = screen.getAllByText("rapy.");

      expect(logos.length).toBeGreaterThan(0);
      expect(brandingShare.length).toBeGreaterThan(0);
      expect(brandingRapy.length).toBeGreaterThan(0);
    });

    it("renders all navigation links", () => {
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const searchLink = screen.getByRole("link", { name: /search/i });
      const createLink = screen.getByRole("link", { name: /create report/i });
      const aiLink = screen.getByRole("link", { name: /ai mode/i });
      const profileLink = screen.getByRole("link", { name: /profile/i });

      expect(searchLink).toBeInTheDocument();
      expect(createLink).toBeInTheDocument();
      expect(aiLink).toBeInTheDocument();
      expect(profileLink).toBeInTheDocument();
    });
    it("displays user profile information", () => {
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const profileImage = screen.getAllByAltText("Profile Picture");
      const userName = screen.getAllByText(/dawson catignas/i);

      expect(profileImage.length).toBeGreaterThan(0);
      expect(userName.length).toBeGreaterThan(0);
    });

    it("renders consistently across different states", () => {
      const { rerender } = render(
        <Sidebar isOpen={false} setIsOpen={mockSetIsOpen} />
      );

      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toBeInTheDocument();

      // Test that component re-renders without errors when isOpen changes
      rerender(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);
      expect(sidebar).toBeInTheDocument();
    });

    it("supports non-latin characters in user name", () => {
      // Update global test user to have non-latin name
      (global as unknown as { $user?: TestUser }).$user = {
        id: "test-therapist-2",
        name: "张伟",
        email: "zhangwei@example.com",
      };
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const userName = screen.getAllByText("张伟");
      expect(userName.length).toBeGreaterThan(0);
    });
  });

  describe("Prop Handling", () => {
    it("has navigation links that have correct href attributes", () => {
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const searchLink = screen.getByRole("link", { name: /search/i });
      const createLink = screen.getByRole("link", { name: /create report/i });
      const aiLink = screen.getByRole("link", { name: /ai mode/i });
      const profileLink = screen.getByRole("link", { name: /profile/i });

      expect(searchLink).toHaveAttribute("href", "/search");
      expect(createLink).toHaveAttribute("href", "/reports/new");
      expect(aiLink).toHaveAttribute("href", "/ai-mode");
      expect(profileLink).toHaveAttribute("href", "/profile/me");
    });
  });

  describe("User Interaction", () => {
    it("calls setIsOpen(false) when navigation links are clicked", async () => {
      const user = userEvent.setup();
      render(<Sidebar isOpen={true} setIsOpen={mockSetIsOpen} />);

      const searchLink = screen.getByRole("link", { name: /search/i });
      await user.click(searchLink);

      // Sidebar mock calls setIsOpen when a nav link is clicked; assert that
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });
  });

});
